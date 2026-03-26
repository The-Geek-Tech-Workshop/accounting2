import { collection, getDocs, orderBy, query } from "firebase/firestore/lite";
import firestore from "../firebase/firestore";

export interface EbayLedgerEntry {
  readonly entryId: string;
  readonly entryDate: number;
  readonly description: string;
  readonly amount: number;
  readonly currency: string;
  readonly bookingEntry: "CREDIT" | "DEBIT";
  readonly recordType: "transaction" | "payout";
  readonly sourceId: string;
  readonly referenceId?: string;
}

export const fetchEbayLedgerEntries = async (): Promise<EbayLedgerEntry[]> => {
  const entriesQuery = query(
    collection(firestore, "ebay/ledger/entries"),
    orderBy("entryDate", "desc"),
  );
  const snapshot = await getDocs(entriesQuery);
  return snapshot.docs.map((doc) => doc.data() as EbayLedgerEntry);
};
