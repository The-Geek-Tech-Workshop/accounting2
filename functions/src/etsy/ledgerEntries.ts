import { onCall, HttpsError } from "firebase-functions/v2/https";
import { Firestore } from "firebase-admin/firestore";
import { EtsyLedgerEntryRaw } from "../lib/etsy/api_types";

const firestore = new Firestore();

export const etsyLedgerEntries = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "You must be logged in to fetch Etsy ledger entries.",
    );
  }

  const snapshot = await firestore
    .collection("etsy/ledger/entries")
    .orderBy("sequence_number", "desc")
    .get();

  const entries: EtsyLedgerEntryRaw[] = snapshot.docs.map(
    (doc) => doc.data() as EtsyLedgerEntryRaw,
  );

  return entries;
});
