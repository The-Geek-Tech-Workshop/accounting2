import {
  collection,
  doc,
  getDocs,
  getDoc,
  orderBy,
  query,
} from "firebase/firestore/lite";
import { httpsCallable } from "firebase/functions";
import { etsyConfigConverter } from "../../model/etsy_config";
import firestore from "../firebase/firestore";
import functions from "../firebase/functions";
import type { EtsyLedgerEntry, EtsyLedgerEntryRaw } from "@accounting2/shared";
import { transformLedgerEntry } from "../etsy/ledger_entry_transform";

const fetchEtsyConfig = async () => {
  const snapshot = await getDoc(
    doc(firestore, "etsy/oauth").withConverter(etsyConfigConverter),
  );
  return snapshot.data() ?? null; // TanStack will interpret 'undefined' as an error state
};

const exchangeEtsyToken = async (
  code: string,
  codeVerifier: string,
  keystring: string,
  sharedSecret: string,
  redirectUri: string,
) => {
  const fn = httpsCallable(functions, "etsyExchangeToken");
  await fn({ code, codeVerifier, keystring, sharedSecret, redirectUri });
};

const fetchEtsyLedgerEntries: () => Promise<EtsyLedgerEntry[]> = async () => {
  const entriesQuery = query(
    collection(firestore, "etsy/ledger/entries"),
    orderBy("sequence_number", "desc"),
  );
  const snapshot = await getDocs(entriesQuery);

  const ledgerEntries: EtsyLedgerEntry[] = snapshot.docs
    .map((doc) => doc.data() as EtsyLedgerEntryRaw)
    .reduceRight((acc: EtsyLedgerEntry[], raw) => {
      const parent =
        acc.find((entry) => entry.entryId === raw.parent_entry_id) || null;
      const entry = transformLedgerEntry(raw, parent);
      acc.push(entry);
      return acc;
    }, [])
    .reverse();
  return ledgerEntries;
};

const syncEtsyLedgerEntries = async (date: Date) => {
  const fn = httpsCallable(functions, "etsySyncLedgerEntries");
  await fn({ date: date.toISOString().split("T")[0] });
};

const deleteEtsyConfig = async () => {
  const fn = httpsCallable(functions, "etsyDeleteConfig");
  await fn();
};

const reprocessEtsyLedgerEntries = async (entryIds: string[]) => {
  const fn = httpsCallable(functions, "etsyReprocessLedgerEntries");
  await fn({ entryIds });
};

export {
  fetchEtsyConfig,
  exchangeEtsyToken,
  fetchEtsyLedgerEntries,
  syncEtsyLedgerEntries,
  deleteEtsyConfig,
  reprocessEtsyLedgerEntries,
};
