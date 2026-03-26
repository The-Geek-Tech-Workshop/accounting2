import { Firestore } from "firebase-admin/firestore";
import eBayApi from "ebay-api";
import { EbayPayoutRaw } from "../lib/ebay/api_types";

const firestore = new Firestore();

interface EbayPayoutsResponse {
  readonly payouts?: readonly EbayPayoutRaw[];
  readonly total?: number;
}

const writePage = async (payouts: readonly EbayPayoutRaw[]): Promise<void> => {
  const batch = firestore.batch();
  payouts.forEach((payout) => {
    const docRef = firestore.doc(`ebay/payouts/entries/${payout.payoutId}`);
    batch.set(docRef, payout);
  });
  await batch.commit();
};

export const fetchAndStorePayouts = async (
  eBay: eBayApi,
  date: Date,
): Promise<number> => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  const startDate = new Date(
    Date.UTC(year, month, day, 0, 0, 0, 0),
  ).toISOString();
  const endDate = new Date(
    Date.UTC(year, month, day, 23, 59, 59, 999),
  ).toISOString();

  const filter = `payoutDate:[${startDate}..${endDate}]`;
  const pageSize = 200;

  const go = async (offset: number): Promise<number> => {
    const response = (await eBay.sell.finances.sign.getPayouts({
      filter,
      limit: pageSize,
      offset,
    })) as EbayPayoutsResponse;

    const payouts = response.payouts ?? [];
    if (payouts.length > 0) {
      await writePage(payouts);
    }

    const total = response.total ?? 0;
    const nextOffset = offset + pageSize;
    return nextOffset < total ? go(nextOffset) : total;
  };

  return go(0);
};
