import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getEbayClient } from "../lib/ebay/auth";
import { fetchAndStoreTransactions } from "./syncTransactions";
import { fetchAndStorePayouts } from "./syncPayouts";

interface SyncEbayData {
  readonly date: string; // ISO date string e.g. "2026-03-04"
}

const parseDate = (date: string): Date => {
  const parsedDate = new Date(date);
  if (!date || isNaN(parsedDate.getTime())) {
    throw new HttpsError(
      "invalid-argument",
      "A valid ISO formatted date is required (e.g. 2026-03-04).",
    );
  }
  return parsedDate;
};

export const ebaySyncDate = onCall<SyncEbayData>(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "You must be logged in to sync eBay data.",
    );
  }

  const { date } = request.data;
  const parsedDate = parseDate(date);

  const eBay = await getEbayClient();

  const [transactions, payouts] = await Promise.all([
    fetchAndStoreTransactions(eBay, parsedDate),
    fetchAndStorePayouts(eBay, parsedDate),
  ]);

  return { success: true, transactions, payouts };
});
