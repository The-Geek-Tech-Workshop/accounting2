import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { PubSub } from "@google-cloud/pubsub";
import { logger } from "firebase-functions";
import { EtsyLedgerEntryRaw } from "../lib/etsy/api_types";
import { ETSY_LEDGER_EVENTS_TOPIC } from "../lib/messaging/topics";

const pubsub = new PubSub();

/**
 * Triggered when a new Etsy ledger entry is written to Firestore by the sync
 * function. Publishes the raw entry to the Pub/Sub topic so it can be
 * processed by processEtsyLedgerEvent.
 */
export const publishEtsyLedgerEvent = onDocumentCreated(
  "etsy/ledger/entries/{entry_id}",
  async (event) => {
    const entry = event.data?.data() as EtsyLedgerEntryRaw | undefined;

    if (!entry) {
      logger.warn("publishEtsyLedgerEvent: no data in snapshot", {
        entry_id: event.params.entry_id,
      });
      return;
    }

    logger.info("Publishing Etsy ledger entry to Pub/Sub", {
      entry_id: entry.entry_id,
      sequence_number: entry.sequence_number,
      ledger_type: entry.ledger_type,
    });

    const messageBuffer = Buffer.from(JSON.stringify(entry));
    await pubsub
      .topic(ETSY_LEDGER_EVENTS_TOPIC)
      .publishMessage({ data: messageBuffer });
  },
);
