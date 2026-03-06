import type { EtsyPaymentAdjustment } from "./payment_adjustment";

type EtsyLedgerType =
  | "auto_renew_expired"
  | "DISBURSE2"
  | "gift_wrap_fees"
  | "listing"
  | "listing_private"
  | "listing_private_refund"
  | "listing_refund"
  | "offsite_ads_fee"
  | "offsite_ads_fee_refund"
  | "PAYMENT_GROSS"
  | "PAYMENT_PROCESSING_FEE"
  | "REFUND"
  | "regulatory_operating_fee"
  | "renew_expired"
  | "renew_sold"
  | "renew_sold_auto"
  | "renew_sold_auto_refund"
  | "sales_tax"
  | "shipping_label_refund"
  | "shipping_labels"
  | "shipping_transaction"
  | "shipping_transaction_refund"
  | "transaction"
  | "transaction_quantity"
  | "transaction_quantity_refund"
  | "transaction_refund"
  | "vat_on_processing_fees"
  | "vat_seller_services";

type EtsyLedgerEntryReferenceType =
  | "transaction"
  | "listing"
  | "etsy"
  | "processing_fee"
  | "shop_payment"
  | "shipping_label"
  | "disbursement"
  | "receipt";

interface EtsyLedgerEntry {
  entryId: string;
  ledgerId: string;
  sequenceNumber: number;
  amount: number;
  currency: string;
  description: string;
  balance: number;
  createDate: number;
  createdTimestamp: number;
  ledgerType: EtsyLedgerType;
  referenceId: string | null;
  referenceType: EtsyLedgerEntryReferenceType;
  parentEntry: EtsyLedgerEntry | null;
  paymentAdjustments: EtsyPaymentAdjustment[];
}

export type { EtsyLedgerEntry, EtsyLedgerEntryReferenceType, EtsyLedgerType };
