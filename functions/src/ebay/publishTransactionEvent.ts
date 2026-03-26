import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { PubSub } from "@google-cloud/pubsub";
import { logger } from "firebase-functions";
import { EbayTransactionRaw } from "../lib/ebay/api_types";
import { EBAY_TRANSACTION_EVENTS_TOPIC } from "../lib/messaging/topics";

const pubsub = new PubSub();

export const publishEbayTransactionEvent = onDocumentWritten(
  "ebay/transactions/entries/{id}",
  async (event) => {
    const after = event.data?.after;
    if (!after?.exists) {
      return;
    }

    const transaction = after.data() as EbayTransactionRaw;

    logger.info("Publishing eBay transaction event to Pub/Sub", {
      transactionId: transaction.transactionId,
      transactionType: transaction.transactionType,
    });

    const messageBuffer = Buffer.from(JSON.stringify(transaction));
    await pubsub
      .topic(EBAY_TRANSACTION_EVENTS_TOPIC)
      .publishMessage({ data: messageBuffer });
  },
);
