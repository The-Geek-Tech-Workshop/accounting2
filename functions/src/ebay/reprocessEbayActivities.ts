import { onCall, HttpsError } from "firebase-functions/v2/https";
import { Firestore } from "firebase-admin/firestore";
import { PubSub } from "@google-cloud/pubsub";
import { logger } from "firebase-functions";
import {
  EBAY_TRANSACTION_EVENTS_TOPIC,
  EBAY_PAYOUT_EVENTS_TOPIC,
} from "../lib/messaging/topics";

const firestore = new Firestore();
const pubsub = new PubSub();

type PrefixInfo = {
  readonly collectionPath: (rawId: string) => string;
  readonly topic: string;
};

const PREFIX_MAP: Record<string, PrefixInfo> = {
  txn_: {
    collectionPath: (rawId) => `ebay/transactions/entries/${rawId}`,
    topic: EBAY_TRANSACTION_EVENTS_TOPIC,
  },
  pay_: {
    collectionPath: (rawId) => `ebay/payouts/entries/${rawId}`,
    topic: EBAY_PAYOUT_EVENTS_TOPIC,
  },
};

const parseId = (
  prefixedId: string,
): { readonly docPath: string; readonly topic: string } => {
  for (const [prefix, info] of Object.entries(PREFIX_MAP)) {
    if (prefixedId.startsWith(prefix)) {
      const rawId = prefixedId.slice(prefix.length);
      return { docPath: info.collectionPath(rawId), topic: info.topic };
    }
  }
  throw new HttpsError(
    "invalid-argument",
    `Unrecognised ID prefix for: ${prefixedId}. Use txn_ or pay_ prefix.`,
  );
};

export const ebayReprocessActivities = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "You must be logged in to reprocess eBay activities.",
    );
  }

  const ids: string[] = request.data?.ids;

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new HttpsError(
      "invalid-argument",
      "ids must be a non-empty array of prefixed ID strings.",
    );
  }

  const parsed = ids.map(parseId);

  const snapshots = await Promise.all(
    parsed.map(({ docPath }) => firestore.doc(docPath).get()),
  );

  const missing = snapshots
    .filter((snap) => !snap.exists)
    .map((snap) => snap.id);

  if (missing.length > 0) {
    throw new HttpsError(
      "not-found",
      `The following IDs were not found: ${missing.join(", ")}`,
    );
  }

  await Promise.all(
    snapshots.map((snap, i) => {
      const data = snap.data();
      const { topic } = parsed[i];
      logger.info("Republishing eBay activity to Pub/Sub", {
        docId: snap.id,
        topic,
      });
      const messageBuffer = Buffer.from(JSON.stringify(data));
      return pubsub.topic(topic).publishMessage({ data: messageBuffer });
    }),
  );
});
