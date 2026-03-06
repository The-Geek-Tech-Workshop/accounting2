import { Table, type TableProps } from "antd";
import { fetchEtsyLedgerEntries } from "../../lib/apis/etsy";
import { useQuery } from "@tanstack/react-query";
import type { EtsyLedgerEntry } from "../../model/etsy/ledger_entry";
import testData from "./TransactionList.testdata";

const useTestData = import.meta.env.VITE_USE_TEST_DATA === "true";

const ledgerTypeToLabelMap: Partial<
  Record<EtsyLedgerEntry["ledgerType"], string>
> = {
  listing: "Listing fee",
  DISBURSE2: "Payout",
  auto_renew_expired: "Listing fee (auto-renewed after expiration)",
  renew_sold_auto: "Listing fee (auto-renewed after sale)",
  transaction_quantity: "Listing fee (per quantity)",
  vat_seller_services: "VAT",
  regulatory_operating_fee: "Regulatory operating fee",
  PAYMENT_GROSS: "Payment received",
  PAYMENT_PROCESSING_FEE: "Payment processing fee",
  transaction: "Transaction fee (for sale items)",
  shipping_transaction: "Transaction fee (for shipping)",
  vat_on_processing_fees: "VAT - for Payment processing fee",
  shipping_labels: "Shipping label purchase",
};

const columns: TableProps<EtsyLedgerEntry>["columns"] = [
  {
    title: "Date",
    dataIndex: "createDate",
    key: "createDate",
    width: 120,
    render: (timestamp: number) =>
      new Date(timestamp * 1000).toLocaleDateString(),
  },
  {
    title: "Description",
    dataIndex: "ledgerType",
    key: "ledgerType",
    // width: "100%",
    render: (ledgerType: EtsyLedgerEntry["ledgerType"], record) => {
      const label = ledgerTypeToLabelMap[ledgerType];
      const parentEntryLedgerType = record.parentEntry?.ledgerType;
      const secondaryLabel = parentEntryLedgerType
        ? ledgerTypeToLabelMap[parentEntryLedgerType] || parentEntryLedgerType
        : null;
      return secondaryLabel
        ? `${label} - for ${secondaryLabel}`
        : label || ledgerType;
    },
  },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
    width: 120,
    align: "right",
    render: (_, record) =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: record.currency,
      }).format(record.amount / 100),
  },
  {
    title: "Balance",
    dataIndex: "balance",
    key: "balance",
    width: 120,
    align: "right",
    render: (_, record) =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: record.currency,
      }).format(record.balance / 100),
  },
];

const TransactionList = () => {
  const { isPending, isError, data, error } = useQuery({
    queryKey: ["etsyLedgerEntries"],
    queryFn: useTestData
      ? () => Promise.resolve(testData)
      : fetchEtsyLedgerEntries,
  });

  if (isPending) {
    return <div>Loading transactions...</div>;
  }

  if (isError) {
    return <div>Error loading transactions: {error.message}</div>;
  }

  return (
    <Table<EtsyLedgerEntry>
      columns={columns}
      dataSource={data}
      scroll={{ y: "calc(100vh - 250px)" }}
    />
  );
};

export default TransactionList;
