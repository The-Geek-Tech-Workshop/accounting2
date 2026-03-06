import { onCall, HttpsError } from "firebase-functions/v2/https";
import { Firestore } from "firebase-admin/firestore";
import { fetchLedgerEntriesPage } from "../lib/etsy/api";
import { getValidConfig } from "../lib/etsy/auth";
import { EtsyLedgerEntryRaw, EtsyConfig } from "../lib/etsy/api_types";
import { onSchedule } from "firebase-functions/scheduler";

const firestore = new Firestore();

interface SyncLedgerEntriesData {
  readonly date: string; // ISO date string e.g. "2026-03-04"
}

const writePage = async (
  entries: readonly EtsyLedgerEntryRaw[],
): Promise<void> => {
  const batch = firestore.batch();
  entries.forEach((entry) => {
    const docRef = firestore.doc(`etsy/ledger/entries/${entry.entry_id}`);
    batch.set(docRef, entry);
  });
  await batch.commit();
};

const fetchAndStoreLedgerEntries = async (
  config: EtsyConfig,
  minCreated: number,
  maxCreated: number,
): Promise<number> => {
  const pageSize = 100;

  const go = async (offset: number): Promise<number> => {
    const page = await fetchLedgerEntriesPage(
      config,
      minCreated,
      maxCreated,
      offset,
    );

    await writePage(page.results);

    const nextOffset = offset + pageSize;
    return nextOffset < page.count ? go(nextOffset) : page.count;
  };

  return go(0);
};

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

const syncEtsyLedgerEntriesForDate = async (date: Date): Promise<number> => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  const { minCreated, maxCreated } = {
    minCreated: Math.floor(Date.UTC(year, month, day, 0, 0, 0, 0) / 1000),
    maxCreated: Math.floor(Date.UTC(year, month, day, 23, 59, 59, 999) / 1000),
  };

  const config = await getValidConfig();

  const count = await fetchAndStoreLedgerEntries(
    config,
    minCreated,
    maxCreated,
  );

  return count;
};

export const etsySyncLedgerEntries = onCall<SyncLedgerEntriesData>(
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "You must be logged in to sync Etsy ledger entries.",
      );
    }

    const { date } = request.data;
    const parsedDate = parseDate(date);
    const count = await syncEtsyLedgerEntriesForDate(parsedDate);
    return { success: true, count };
  },
);

// Runs daily at 1:00 AM UTC to sync the previous day's ledger entries
export const dailyEtsyLedgerSync = onSchedule("0 1 * * *", async (event) => {
  await syncEtsyLedgerEntriesForDate(new Date(event.scheduleTime));
});
