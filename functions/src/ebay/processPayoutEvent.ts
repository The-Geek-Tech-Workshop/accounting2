import { onMessagePublished } from "firebase-functions/v2/pubsub";
import { logger } from "firebase-functions";
import { Firestore } from "firebase-admin/firestore";
import { EbayPayoutRaw, EbayLedgerEntry } from "../lib/ebay/api_types";
import { EBAY_PAYOUT_EVENTS_TOPIC } from "../lib/messaging/topics";

const firestore = new Firestore();

const buildDescription = (payout: EbayPayoutRaw): string => {
  const instrument = payout.payoutInstrument;
  if (instrument?.nickname) return `Payout to ${instrument.nickname}`;
  if (instrument?.instrumentType)
    return `Payout to ${instrument.instrumentType}`;
  return "Payout";
};

export const processEbayPayoutEvent = onMessagePublished(
  EBAY_PAYOUT_EVENTS_TOPIC,
  async (event) => {
    const payout = event.data.message.json as EbayPayoutRaw;

    logger.info("Processing eBay payout event", {
      payoutId: payout.payoutId,
      payoutStatus: payout.payoutStatus,
    });

    const entryId = `pay_${payout.payoutId}`;
    const entryDate = new Date(payout.payoutDate).getTime();

    const entry: EbayLedgerEntry = {
      entryId,
      entryDate,
      description: buildDescription(payout),
      amount: Math.abs(parseFloat(payout.amount.value)),
      currency: payout.amount.currency,
      bookingEntry: "DEBIT",
      recordType: "payout",
      sourceId: payout.payoutId,
    };

    await firestore.doc(`ebay/ledger/entries/${entryId}`).set(entry);
    logger.info("Written eBay payout ledger entry", { entryId });
  },
);
