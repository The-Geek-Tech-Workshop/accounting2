import { doc, getDoc } from "firebase/firestore/lite";
import { httpsCallable } from "firebase/functions";
import { etsyConfigConverter } from "../../model/etsy_config";
import firestore from "../firebase/firestore";
import functions from "../firebase/functions";
import type { EtsyLedgerEntry } from "../../model/etsy/ledger_entry";
import type { EtsyLedgerEntryRaw } from "../../../../functions/src/lib/etsy/api_types";
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
  const fn = httpsCallable(functions, "etsyLedgerEntries");
  const result = await fn();

  const ledgerEntries: EtsyLedgerEntry[] = (result.data as EtsyLedgerEntryRaw[])
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

export {
  fetchEtsyConfig,
  exchangeEtsyToken,
  fetchEtsyLedgerEntries,
  syncEtsyLedgerEntries,
  deleteEtsyConfig,
};
