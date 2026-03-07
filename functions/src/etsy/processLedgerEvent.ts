import { onMessagePublished } from "firebase-functions/v2/pubsub";
import { logger } from "firebase-functions";
import { EtsyLedgerEntryRaw } from "../lib/etsy/api_types";
import { ETSY_LEDGER_EVENTS_TOPIC } from "../lib/messaging/topics";
import { Account, DoubleEntry } from "@accounting2/shared";
import { Accounts } from "@accounting2/shared";
import { Firestore } from "firebase-admin/firestore";

const firestore = new Firestore();

/**
 * Consumes raw Etsy ledger events from the Pub/Sub queue and identifies
 * what account entries need to be created.
 */
export const processEtsyLedgerEvent = onMessagePublished(
  ETSY_LEDGER_EVENTS_TOPIC,
  async (event) => {
    const entry = event.data.message.json as EtsyLedgerEntryRaw;

    logger.info("Processing Etsy ledger event", {
      entry_id: entry.entry_id,
      sequence_number: entry.sequence_number,
      ledger_type: entry.ledger_type,
      reference_type: entry.reference_type,
      amount: entry.amount,
      currency: entry.currency,
    });

    const accountEntries: DoubleEntry[] = await identifyAccountEntries(entry);
    logger.info("Identified account entries", { accountEntries });
    await persistDoubleEntries(accountEntries);
  },
);

const getVatAmountForEntry = async (entryId: string): Promise<number> => {
  const vatEntrySnapshot = await firestore
    .collection("etsy/ledger/entries")
    .where("parent_entry_id", "==", entryId)
    .where("ledger_type", "in", [
      "vat_seller_services",
      "vat_on_processing_fees",
    ])
    .limit(1)
    .get();

  if (vatEntrySnapshot.empty) {
    return 0;
  }

  const vatEntry = vatEntrySnapshot.docs[0].data() as EtsyLedgerEntryRaw;
  return vatEntry.amount;
};

/**
 * Inspects a raw Etsy ledger entry and returns a description of
 * the account entries that should be created.
 *
 * @param entry - The raw ledger entry received from Etsy.
 * @returns An array describing the account entries to create
 */
async function identifyAccountEntries(
  entry: EtsyLedgerEntryRaw,
): Promise<DoubleEntry[]> {
  const vatAmount = await getVatAmountForEntry(entry.entry_id);

  // Value should always be positive
  const totalAmount = Math.abs(entry.amount + vatAmount);

  const completeEntry = ({
    debitAccount,
    creditAccount,
    description,
  }: {
    debitAccount: Account;
    creditAccount: Account;
    description: string;
  }): DoubleEntry[] => [
    {
      debitAccount,
      creditAccount,
      amount: totalAmount,
      currency: entry.currency,
      description: description,
      timestamp: entry.created_timestamp,
      sourceType: "EtsyLedgerEntry",
      sourceId: entry.entry_id,
    },
  ];

  switch (entry.ledger_type) {
    case "listing":
    case "auto_renew_expired":
    case "renew_sold_auto":
    case "transaction_quantity":
      return completeEntry({
        debitAccount: Accounts.ListingFees,
        creditAccount: Accounts.Etsy,
        description: `Listing fee`,
      });
    case "regulatory_operating_fee":
      return completeEntry({
        debitAccount: Accounts.TransactionFees,
        creditAccount: Accounts.Etsy,
        description: `Regulatory operating fee`,
      });
    case "PAYMENT_GROSS":
      return completeEntry({
        debitAccount: Accounts.Etsy,
        creditAccount: Accounts.Sales,
        description: `Payment received`,
      });
    case "PAYMENT_PROCESSING_FEE":
      return completeEntry({
        debitAccount: Accounts.TransactionFees,
        creditAccount: Accounts.Etsy,
        description: `Payment processing fee`,
      });
    case "DISBURSE2":
      return completeEntry({
        debitAccount: Accounts.EtsyClearing,
        creditAccount: Accounts.Etsy,
        description: `Payout`,
      });
    case "transaction":
      return completeEntry({
        debitAccount: Accounts.TransactionFees,
        creditAccount: Accounts.Etsy,
        description: `Transaction fee (for sale items)`,
      });
    case "shipping_transaction":
      return completeEntry({
        debitAccount: Accounts.TransactionFees,
        creditAccount: Accounts.Etsy,
        description: `Transaction fee (for shipping)`,
      });
    case "shipping_labels":
      return completeEntry({
        debitAccount: Accounts.OutwardShipping,
        creditAccount: Accounts.Etsy,
        description: `Shipping label purchase`,
      });
    default:
      return [];
  }
}

const persistDoubleEntries = async (entries: DoubleEntry[]): Promise<void> => {
  if (entries.length === 0) return;

  const batch = firestore.batch();
  entries.forEach((entry) => {
    const id = `${entry.sourceType}_${entry.sourceId}_${entry.debitAccount.name}_${entry.creditAccount.name}`;
    const docRef = firestore.doc(`accounting/journal/entries/${id}`);
    batch.set(docRef, entry);
  });
  await batch.commit();
};
