type AccountType = "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";

interface Account {
  readonly name: String;
  readonly type: AccountType;
}

type SourceType =
  | "EtsyLedgerEntry"
  | "EbayTransaction"
  | "EbayPayout"
  | "Other";

interface DoubleEntry {
  readonly timestamp: number;
  readonly description: string;
  readonly amount: number;
  readonly currency: string;
  readonly debitAccount: Account;
  readonly creditAccount: Account;
  readonly sourceType: SourceType;
  readonly sourceId: string | null;
}

export type { Account, AccountType, DoubleEntry };
