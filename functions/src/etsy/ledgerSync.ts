import { onSchedule } from "firebase-functions/scheduler";
import { logger } from "firebase-functions";
import { defineString } from "firebase-functions/params";
import { Firestore } from "firebase-admin/firestore";
import {
  Etsy,
  ISecurityDataStorage,
  SecurityDataFilter,
  Tokens,
  IPaymentAccountLedgerEntry,
} from "etsy-ts";

const firestore = new Firestore();

// Firebase parameters
const etsyApiKey = defineString("ETSY_API_KEY", {
  description: "Etsy API Key",
});

const etsySharedSecret = defineString("ETSY_SHARED_SECRET", {
  description: "Etsy Shared Secret",
});

const etsyShopId = defineString("ETSY_SHOP_ID", {
  description: "Etsy Shop ID",
});

const etsySyncEnabled = defineString("ETSY_SYNC_ENABLED", {
  description: "Enable or disable Etsy ledger sync",
  default: "false",
});

/**
 * Firestore-backed implementation of SecurityDataStorage for Etsy OAuth tokens
 * Stores tokens by shop ID
 */
class FirestoreSecurityDataStorage implements ISecurityDataStorage {
  private firestore: Firestore;
  private shopId: string;

  constructor(firestore: Firestore, shopId: string) {
    this.firestore = firestore;
    this.shopId = shopId;
  }

  async storeAccessToken(
    filter: SecurityDataFilter,
    tokens: Tokens,
  ): Promise<void> {
    const docRef = this.firestore.doc(`config/etsy/oauth/${this.shopId}`);
    await docRef.set(
      {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );
    logger.info(`Stored access token for shop ${this.shopId}`);
  }

  async findAccessToken(
    filter: SecurityDataFilter,
  ): Promise<Tokens | undefined> {
    const docRef = this.firestore.doc(`config/etsy/oauth/${this.shopId}`);
    const doc = await docRef.get();

    if (!doc.exists) {
      logger.warn(`No access token found for shop ${this.shopId}`);
      return undefined;
    }

    const data = doc.data();
    if (!data || !data.accessToken || !data.refreshToken) {
      logger.warn(`Incomplete token data for shop ${this.shopId}`);
      return undefined;
    }

    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: 0,
      tokenType: "Bearer",
    };
  }
}

/**
 * Get the timestamp of the most recent ledger entry from Firestore
 * Returns null if no entries exist
 */
async function getLastSyncTimestamp(): Promise<number | null> {
  try {
    const snapshot = await firestore
      .collection("events/etsy/ledgerentry")
      .orderBy("body.created_timestamp", "desc")
      .limit(1)
      .get();

    if (snapshot.empty) {
      logger.info("No existing entries found");
      return null;
    }

    const lastEntry = snapshot.docs[0].data();
    const timestamp = lastEntry.body?.created_timestamp;

    if (!timestamp) {
      logger.warn("Last entry missing created_timestamp");
      return null;
    }

    logger.info(`Last sync timestamp: ${timestamp}`);
    return timestamp;
  } catch (error) {
    logger.error("Error getting last sync timestamp:", error);
    return null;
  }
}

/**
 * Persist a batch of ledger entries to Firestore
 */
async function persistBatch(
  entries: IPaymentAccountLedgerEntry[],
): Promise<number> {
  if (entries.length === 0) {
    return 0;
  }

  // Filter out entries without entry_id
  const validEntries = entries.filter((entry) => {
    if (!entry.entry_id) {
      logger.warn("Entry missing entry_id, skipping:", entry);
      return false;
    }
    return true;
  });

  if (validEntries.length === 0) {
    return 0;
  }

  const batch = firestore.batch();

  validEntries.forEach((entry) => {
    const docRef = firestore.doc(`events/etsy/ledgerentry/${entry.entry_id}`);
    batch.set(docRef, entry, { merge: true });
  });

  await batch.commit();
  logger.info(`Persisted ${validEntries.length} entries`);

  return validEntries.length;
}

/**
 * Fetch and persist ledger entries using streaming approach with recursion
 * Fetches one page at a time and persists it immediately before fetching the next page
 */
async function fetchAndPersistLedgerEntries(
  client: Etsy,
  shopId: number,
  minCreated: number,
  maxCreated: number,
): Promise<number> {
  const limit = 100;

  const processPage = async (
    offset: number,
    totalPersisted: number,
  ): Promise<number> => {
    logger.info(`Fetching ledger entries: offset=${offset}, limit=${limit}`);

    const response =
      await client.LedgerEntry.getShopPaymentAccountLedgerEntries({
        shopId,
        min_created: minCreated,
        max_created: maxCreated,
        limit,
        offset,
      });

    const entries = response.data.results || [];
    logger.info(`Received ${entries.length} entries`);

    // Persist this batch immediately
    const persistedCount = await persistBatch(entries);
    const newTotal = totalPersisted + persistedCount;

    // If we got fewer results than the limit or no results, we've reached the end
    if (entries.length === 0 || entries.length < limit) {
      return newTotal;
    }

    // Recursively process the next page
    return processPage(offset + limit, newTotal);
  };

  try {
    const totalPersisted = await processPage(0, 0);
    logger.info(`Total entries persisted: ${totalPersisted}`);
    return totalPersisted;
  } catch (error) {
    logger.error("Error fetching and persisting ledger entries:", error);
    throw error;
  }
}

/**
 * Main scheduled function - runs daily at midnight to sync Etsy ledger entries
 */
export const etsyLedgerSync = onSchedule(
  {
    schedule: "every day 00:00",
  },
  async (event) => {
    if (etsySyncEnabled.value().toLowerCase() !== "true") {
      logger.info("Etsy ledger sync is disabled via configuration");
      return;
    }

    logger.info("Starting Etsy ledger sync");

    try {
      // 1. Parse configuration
      const shopIdStr = etsyShopId.value();
      const shopIdNum = parseInt(shopIdStr, 10);

      if (isNaN(shopIdNum)) {
        throw new Error("Invalid ETSY_SHOP_ID configuration");
      }

      // 2. Initialize Etsy client with shop-based token storage
      const securityDataStorage = new FirestoreSecurityDataStorage(
        firestore,
        shopIdStr,
      );

      const client = new Etsy({
        apiKey: etsyApiKey.value(),
        sharedSecret: etsySharedSecret.value(),
        securityDataStorage,
        enableTokenRefresh: true,
      });

      logger.info(`Using shop ID ${shopIdNum}`);

      // 3. Get the timestamp of the last synced entry (assume Epoch if none exists)
      const lastSyncTimestamp = (await getLastSyncTimestamp()) ?? 0;

      logger.info(
        lastSyncTimestamp === 0
          ? "Starting sync from Unix epoch (no previous entries)"
          : `Starting sync from timestamp: ${lastSyncTimestamp}`,
      );

      // 4. Calculate 'to' timestamp as 30 days after the last sync
      const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
      const toTimestamp = lastSyncTimestamp + thirtyDaysInSeconds;

      logger.info(
        `Syncing entries from ${lastSyncTimestamp} to ${toTimestamp}`,
      );

      // 5. Fetch and persist ledger entries
      const persistedCount = await fetchAndPersistLedgerEntries(
        client,
        shopIdNum,
        lastSyncTimestamp,
        toTimestamp,
      );

      logger.info(
        `Etsy ledger sync completed: ${persistedCount} entries persisted`,
      );
    } catch (error) {
      logger.error("Etsy ledger sync failed:", error);
      throw error;
    }
  },
);
