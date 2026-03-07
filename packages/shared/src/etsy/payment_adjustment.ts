interface EtsyPaymentAdjustmentItem {
  paymentAdjustmentId: string;
  paymentAdjustmentItemId: string;
  adjustmentType: string;
  amount: number;
  shopAmount: number;
  transactionId: string;
  billPaymentId: string;
  createdTimestamp: number;
  updatedTimestamp: number;
}

interface EtsyPaymentAdjustment {
  paymentAdjustmentId: string;
  paymentId: string;
  status: string;
  isSuccess: boolean;
  userId: number;
  reasonCode: string;
  totalAdjustmentAmount: number;
  shopTotalAdjustmentAmount: number;
  buyerTotalAdjustmentAmount: number;
  totalFeeAdjustmentAmount: number;
  createTimestamp: number;
  createdTimestamp: number;
  updateTimestamp: number;
  updatedTimestamp: number;
  paymentAdjustmentItems: EtsyPaymentAdjustmentItem[];
}

export type { EtsyPaymentAdjustment, EtsyPaymentAdjustmentItem };
