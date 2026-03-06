import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Popconfirm } from "antd";
import { deleteEtsyConfig } from "../../lib/apis/etsy";

const DisconnectEtsy = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteEtsyConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["etsyIntegrationConfig"] });
    },
  });

  return (
    <div>
      <Popconfirm
        title="Delete Etsy configuration"
        description="Are you sure you want to disconnect Etsy? This will delete the stored credentials."
        onConfirm={() => deleteMutation.mutate()}
        okText="Delete"
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
      >
        <Button
          danger
          loading={deleteMutation.isPending}
          style={{ marginTop: 16 }}
        >
          Disconnect Etsy
        </Button>
      </Popconfirm>
      {deleteMutation.isError && (
        <div style={{ color: "red", marginTop: 8 }}>
          Error: {deleteMutation.error.message}
        </div>
      )}
    </div>
  );
};

export default DisconnectEtsy;
