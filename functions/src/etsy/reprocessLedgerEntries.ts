import { onCall, HttpsError } from "firebase-functions/v2/https";
import { Firestore } from "firebase-admin/firestore";
import { PubSub } from "@google-cloud/pubsub";
import { logger } from "firebase-functions";
import { EtsyLedgerEntryRaw } from "../lib/etsy/api_types";
import { ETSY_LEDGER_EVENTS_TOPIC } from "../lib/messaging/topics";

const firestore = new Firestore();
const pubsub = new PubSub();

export const etsyReprocessLedgerEntries = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "You must be logged in to reprocess Etsy ledger entries.",
    );
  }

  const entryIds: string[] = request.data?.entryIds;

  if (!Array.isArray(entryIds) || entryIds.length === 0) {
    throw new HttpsError(
      "invalid-argument",
      "entryIds must be a non-empty array of strings.",
    );
  }

  const snapshots = await Promise.all(
    entryIds.map((id) => firestore.doc(`etsy/ledger/entries/${id}`).get()),
  );

  const missing = snapshots
    .filter((snap) => !snap.exists)
    .map((snap) => snap.id);

  if (missing.length > 0) {
    throw new HttpsError(
      "not-found",
      `The following entry IDs were not found: ${missing.join(", ")}`,
    );
  }

  await Promise.all(
    snapshots.map((snap) => {
      const entry = snap.data() as EtsyLedgerEntryRaw;
      logger.info("Republishing Etsy ledger entry to Pub/Sub", {
        entry_id: entry.entry_id,
        ledger_type: entry.ledger_type,
      });
      const messageBuffer = Buffer.from(JSON.stringify(entry));
      return pubsub
        .topic(ETSY_LEDGER_EVENTS_TOPIC)
        .publishMessage({ data: messageBuffer });
    }),
  );
});
