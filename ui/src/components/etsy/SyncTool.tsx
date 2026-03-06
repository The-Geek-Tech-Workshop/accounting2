import { SyncOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, DatePicker } from "antd";
import { useState } from "react";
import { syncEtsyLedgerEntries } from "../../lib/apis/etsy";

const SyncTool = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const queryClient = useQueryClient();

  const { mutate: sync, isPending } = useMutation({
    mutationFn: (date: Date) => syncEtsyLedgerEntries(date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["etsyLedgerEntries"] });
    },
  });

  const onChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  return (
    <>
      <DatePicker inputReadOnly onChange={onChange} />
      <Button
        icon={<SyncOutlined />}
        loading={isPending}
        onClick={() => selectedDate && sync(selectedDate)}
      >
        Sync Transactions
      </Button>
    </>
  );
};

export default SyncTool;
