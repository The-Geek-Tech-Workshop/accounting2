import type {
  EtsyLedgerEntry,
  EtsyLedgerType,
  EtsyLedgerEntryReferenceType,
  EtsyPaymentAdjustment,
  EtsyPaymentAdjustmentItem,
  EtsyLedgerEntryRaw,
  EtsyPaymentAdjustmentRaw,
  EtsyPaymentAdjustmentItemRaw,
} from "@accounting2/shared";

const transformPaymentAdjustmentItem = (
  raw: EtsyPaymentAdjustmentItemRaw,
): EtsyPaymentAdjustmentItem => ({
  paymentAdjustmentId: raw.payment_adjustment_id,
  paymentAdjustmentItemId: raw.payment_adjustment_item_id,
  adjustmentType: raw.adjustment_type,
  amount: raw.amount,
  shopAmount: raw.shop_amount,
  transactionId: raw.transaction_id,
  billPaymentId: raw.bill_payment_id,
  createdTimestamp: raw.created_timestamp,
  updatedTimestamp: raw.updated_timestamp,
});

const transformPaymentAdjustment = (
  raw: EtsyPaymentAdjustmentRaw,
): EtsyPaymentAdjustment => ({
  paymentAdjustmentId: raw.payment_adjustment_id,
  paymentId: raw.payment_id,
  status: raw.status,
  isSuccess: raw.is_success,
  userId: raw.user_id,
  reasonCode: raw.reason_code,
  totalAdjustmentAmount: raw.total_adjustment_amount,
  shopTotalAdjustmentAmount: raw.shop_total_adjustment_amount,
  buyerTotalAdjustmentAmount: raw.buyer_total_adjustment_amount,
  totalFeeAdjustmentAmount: raw.total_fee_adjustment_amount,
  createTimestamp: raw.create_timestamp,
  createdTimestamp: raw.created_timestamp,
  updateTimestamp: raw.update_timestamp,
  updatedTimestamp: raw.updated_timestamp,
  paymentAdjustmentItems: raw.payment_adjustment_items.map(
    transformPaymentAdjustmentItem,
  ),
});

export const transformLedgerEntry = (
  raw: EtsyLedgerEntryRaw,
  parent: EtsyLedgerEntry | null,
): EtsyLedgerEntry => ({
  entryId: raw.entry_id,
  ledgerId: raw.ledger_id,
  sequenceNumber: raw.sequence_number,
  amount: raw.amount,
  currency: raw.currency,
  description: raw.description,
  balance: raw.balance,
  createDate: raw.create_date,
  createdTimestamp: raw.created_timestamp,
  ledgerType: raw.ledger_type as EtsyLedgerType,
  referenceId: raw.reference_id,
  referenceType: raw.reference_type as EtsyLedgerEntryReferenceType,
  parentEntry: parent,
  paymentAdjustments: raw.payment_adjustments.map(transformPaymentAdjustment),
});
