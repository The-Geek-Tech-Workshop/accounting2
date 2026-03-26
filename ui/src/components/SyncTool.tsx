import { SyncOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, DatePicker } from "antd";
import { useState } from "react";

interface SyncToolProps {
  readonly onSync: (date: Date) => Promise<unknown>;
  readonly invalidateQueryKey?: string;
}

const SyncTool = ({ onSync, invalidateQueryKey }: SyncToolProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const queryClient = useQueryClient();

  const { mutate: sync, isPending } = useMutation({
    mutationFn: onSync,
    onSuccess: () => {
      if (invalidateQueryKey) {
        queryClient.invalidateQueries({ queryKey: [invalidateQueryKey] });
      }
    },
  });

  return (
    <>
      <DatePicker inputReadOnly onChange={(date) => setSelectedDate(date)} />
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
