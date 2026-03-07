import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, orderBy, query } from "firebase/firestore/lite";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import firestore from "../lib/firebase/firestore";
import type { DoubleEntry } from "@accounting2/shared";

const fetchDoubleEntries = async (): Promise<DoubleEntry[]> => {
  const q = query(
    collection(firestore, "accounting/journal/entries"),
    orderBy("timestamp", "desc"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as DoubleEntry);
};

const columns: ColumnsType<DoubleEntry> = [
  {
    title: "Date",
    dataIndex: "timestamp",
    key: "timestamp",
    render: (ts: number) => new Date(ts * 1000).toLocaleDateString(),
    width: 100,
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "Credit Account",
    key: "creditAccount",
    render: (_: unknown, record: DoubleEntry) => record.creditAccount.name,
  },
  {
    title: "Debit Account",
    key: "debitAccount",
    render: (_: unknown, record: DoubleEntry) => record.debitAccount.name,
  },
  {
    title: "Amount",
    key: "amount",
    align: "right",
    render: (_: unknown, record: DoubleEntry) =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: record.currency,
      }).format(record.amount / 100),
    width: 100,
  },
];

const AccountsPage = () => {
  const { isPending, isError, data, error } = useQuery({
    queryKey: ["doubleEntries"],
    queryFn: fetchDoubleEntries,
  });

  return (
    <div>
      <h1>Accounts Journal</h1>
      {isPending && <div>Loading...</div>}
      {isError && <div>Error: {error.message}</div>}
      {data && (
        <Table
          columns={columns}
          dataSource={data}
          rowKey={(record) =>
            `${record.sourceType}_${record.sourceId}_${record.debitAccount.name}_${record.creditAccount.name}`
          }
        />
      )}
    </div>
  );
};

export default AccountsPage;
