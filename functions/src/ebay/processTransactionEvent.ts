import { onMessagePublished } from "firebase-functions/v2/pubsub";
import { logger } from "firebase-functions";
import { Firestore } from "firebase-admin/firestore";
import { EbayTransactionRaw, EbayLedgerEntry } from "../lib/ebay/api_types";
import { EBAY_TRANSACTION_EVENTS_TOPIC } from "../lib/messaging/topics";

const firestore = new Firestore();

const TYPE_LABELS: Record<string, string> = {
  SALE: "Sale",
  REFUND: "Refund",
  CREDIT: "Credit",
  DISPUTE: "Dispute",
  SHIPPING_LABEL: "Shipping Label",
  TRANSFER: "Transfer",
  NON_SALE_CHARGE: "Non-sale Charge",
  LOAN_REPAYMENT: "Loan Repayment",
  PURCHASE: "Purchase",
  WITHDRAWAL: "Withdrawal",
};

const buildDescription = (tx: EbayTransactionRaw): string => {
  const label = tx.transactionType
    ? (TYPE_LABELS[tx.transactionType] ?? tx.transactionType)
    : "eBay Transaction";
  const suffix = tx.orderId
    ? ` - Order ${tx.orderId}`
    : tx.transactionMemo
      ? ` - ${tx.transactionMemo}`
      : "";
  return `${label}${suffix}`;
};

export const processEbayTransactionEvent = onMessagePublished(
  EBAY_TRANSACTION_EVENTS_TOPIC,
  async (event) => {
    const tx = event.data.message.json as EbayTransactionRaw;

    logger.info("Processing eBay transaction event", {
      transactionId: tx.transactionId,
      transactionType: tx.transactionType,
    });

    const entryId = `txn_${tx.transactionId}`;
    const entryDate = tx.transactionDate
      ? new Date(tx.transactionDate).getTime()
      : Date.now();

    const entry: EbayLedgerEntry = {
      entryId,
      entryDate,
      description: buildDescription(tx),
      amount: Math.abs(parseFloat(tx.amount?.value ?? "0")),
      currency: tx.amount?.currency ?? "GBP",
      bookingEntry: tx.bookingEntry ?? "CREDIT",
      recordType: "transaction",
      sourceId: tx.transactionId,
      ...(tx.orderId ? { referenceId: tx.orderId } : {}),
    };

    await firestore.doc(`ebay/ledger/entries/${entryId}`).set(entry);
    logger.info("Written eBay transaction ledger entry", { entryId });
  },
);
