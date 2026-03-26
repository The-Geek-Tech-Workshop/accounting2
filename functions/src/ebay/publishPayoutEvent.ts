import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { PubSub } from "@google-cloud/pubsub";
import { logger } from "firebase-functions";
import { EbayPayoutRaw } from "../lib/ebay/api_types";
import { EBAY_PAYOUT_EVENTS_TOPIC } from "../lib/messaging/topics";

const pubsub = new PubSub();

export const publishEbayPayoutEvent = onDocumentWritten(
  "ebay/payouts/entries/{id}",
  async (event) => {
    const after = event.data?.after;
    if (!after?.exists) {
      return;
    }

    const payout = after.data() as EbayPayoutRaw;

    logger.info("Publishing eBay payout event to Pub/Sub", {
      payoutId: payout.payoutId,
      payoutStatus: payout.payoutStatus,
    });

    const messageBuffer = Buffer.from(JSON.stringify(payout));
    await pubsub
      .topic(EBAY_PAYOUT_EVENTS_TOPIC)
      .publishMessage({ data: messageBuffer });
  },
);
