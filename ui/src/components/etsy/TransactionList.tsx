import { useState } from "react";
import { Button, message, Table, type TableProps } from "antd";
import {
  fetchEtsyLedgerEntries,
  reprocessEtsyLedgerEntries,
} from "../../lib/apis/etsy";
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
  const [selectedEntryIds, setSelectedEntryIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const { isPending, isError, data, error } = useQuery({
    queryKey: ["etsyLedgerEntries"],
    queryFn: useTestData
      ? () => Promise.resolve(testData)
      : fetchEtsyLedgerEntries,
  });

  const handleProcessSelected = async () => {
    setIsProcessing(true);
    try {
      await reprocessEtsyLedgerEntries(selectedEntryIds);
      messageApi.success(
        `${selectedEntryIds.length} entr${selectedEntryIds.length === 1 ? "y" : "ies"} submitted for processing.`,
      );
      setSelectedEntryIds([]);
    } catch (err) {
      messageApi.error(
        `Failed to submit entries: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (isPending) {
    return <div>Loading transactions...</div>;
  }

  if (isError) {
    return <div>Error loading transactions: {error.message}</div>;
  }

  return (
    <>
      {contextHolder}
      <div style={{ marginBottom: 8 }}>
        <Button
          type="primary"
          disabled={selectedEntryIds.length === 0}
          loading={isProcessing}
          onClick={handleProcessSelected}
        >
          Process as Accounts ({selectedEntryIds.length})
        </Button>
      </div>
      <Table<EtsyLedgerEntry>
        columns={columns}
        dataSource={data}
        rowKey="entryId"
        rowSelection={{
          selectedRowKeys: selectedEntryIds,
          onChange: (keys) => setSelectedEntryIds(keys as string[]),
        }}
        scroll={{ y: "calc(100vh - 300px)" }}
      />
    </>
  );
};

export default TransactionList;
