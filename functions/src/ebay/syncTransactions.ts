import { Firestore } from "firebase-admin/firestore";
import eBayApi from "ebay-api";
import { EbayTransactionRaw } from "../lib/ebay/api_types";

const firestore = new Firestore();

interface EbayTransactionsResponse {
  readonly transactions?: readonly EbayTransactionRaw[];
  readonly total?: number;
}

const writePage = async (
  transactions: readonly EbayTransactionRaw[],
): Promise<void> => {
  const batch = firestore.batch();
  transactions.forEach((tx) => {
    const docRef = firestore.doc(
      `ebay/transactions/entries/${tx.transactionId}`,
    );
    batch.set(docRef, tx);
  });
  await batch.commit();
};

export const fetchAndStoreTransactions = async (
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

  const filter = `transactionDate:[${startDate}..${endDate}]`;
  const pageSize = 200;

  const go = async (offset: number): Promise<number> => {
    const response = (await eBay.sell.finances.sign.getTransactions({
      filter,
      limit: pageSize,
      offset,
    })) as EbayTransactionsResponse;

    const transactions = response.transactions ?? [];
    if (transactions.length > 0) {
      await writePage(transactions);
    }

    const total = response.total ?? 0;
    const nextOffset = offset + pageSize;
    return nextOffset < total ? go(nextOffset) : total;
  };

  return go(0);
};
