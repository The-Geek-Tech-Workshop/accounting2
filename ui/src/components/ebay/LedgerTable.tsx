import { Table, Tag, type TableProps } from "antd";
import { useQuery } from "@tanstack/react-query";
import {
  fetchEbayLedgerEntries,
  type EbayLedgerEntry,
} from "../../lib/ebay/ledger";

const RECORD_TYPE_LABELS: Record<EbayLedgerEntry["recordType"], string> = {
  transaction: "Transaction",
  payout: "Payout",
};

const columns: TableProps<EbayLedgerEntry>["columns"] = [
  {
    title: "Date",
    dataIndex: "entryDate",
    key: "entryDate",
    width: 120,
    render: (entryDate: number) => new Date(entryDate).toLocaleDateString(),
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "Type",
    dataIndex: "recordType",
    key: "recordType",
    width: 120,
    render: (recordType: EbayLedgerEntry["recordType"]) =>
      RECORD_TYPE_LABELS[recordType] ?? recordType,
  },
  {
    title: "Amount",
    key: "amount",
    width: 140,
    align: "right",
    render: (_, record) => {
      const formatted = new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: record.currency,
      }).format(record.amount);
      return (
        <Tag color={record.bookingEntry === "CREDIT" ? "green" : "red"}>
          {record.bookingEntry === "CREDIT" ? "+" : "-"}
          {formatted}
        </Tag>
      );
    },
  },
  {
    title: "Reference",
    dataIndex: "referenceId",
    key: "referenceId",
    width: 180,
    render: (referenceId?: string) => referenceId ?? "—",
  },
];

const LedgerTable = () => {
  const { isPending, isError, data, error } = useQuery({
    queryKey: ["ebayLedgerEntries"],
    queryFn: fetchEbayLedgerEntries,
  });

  if (isPending) {
    return <div>Loading eBay ledger...</div>;
  }

  if (isError) {
    return <div>Error loading eBay ledger: {error.message}</div>;
  }

  return (
    <Table<EbayLedgerEntry>
      columns={columns}
      dataSource={data}
      rowKey="entryId"
      scroll={{ y: "calc(100vh - 300px)" }}
    />
  );
};

export default LedgerTable;
