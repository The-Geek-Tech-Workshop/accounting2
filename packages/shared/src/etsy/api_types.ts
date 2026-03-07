import { EtsyLedgerType } from "./ledger_entry";

export interface EtsyLedgerEntriesResponse {
  readonly count: number;
  readonly results: readonly EtsyLedgerEntryRaw[];
}

export interface EtsyPaymentAdjustmentItemRaw {
  readonly payment_adjustment_id: string;
  readonly payment_adjustment_item_id: string;
  readonly adjustment_type: string;
  readonly amount: number;
  readonly shop_amount: number;
  readonly transaction_id: string;
  readonly bill_payment_id: string;
  readonly created_timestamp: number;
  readonly updated_timestamp: number;
}

export interface EtsyPaymentAdjustmentRaw {
  readonly payment_adjustment_id: string;
  readonly payment_id: string;
  readonly status: string;
  readonly is_success: boolean;
  readonly user_id: number;
  readonly reason_code: string;
  readonly total_adjustment_amount: number;
  readonly shop_total_adjustment_amount: number;
  readonly buyer_total_adjustment_amount: number;
  readonly total_fee_adjustment_amount: number;
  readonly create_timestamp: number;
  readonly created_timestamp: number;
  readonly update_timestamp: number;
  readonly updated_timestamp: number;
  readonly payment_adjustment_items: readonly EtsyPaymentAdjustmentItemRaw[];
}

export interface EtsyLedgerEntryRaw {
  readonly entry_id: string;
  readonly ledger_id: string;
  readonly sequence_number: number;
  readonly amount: number;
  readonly currency: string;
  readonly description: string;
  readonly balance: number;
  readonly create_date: number;
  readonly created_timestamp: number;
  readonly ledger_type: EtsyLedgerType;
  readonly reference_id: string | null;
  readonly reference_type: string | null;
  readonly parent_entry_id: string;
  readonly payment_adjustments: readonly EtsyPaymentAdjustmentRaw[];
}
