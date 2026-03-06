import { useQuery } from "@tanstack/react-query";
import { fetchEtsyConfig } from "../lib/apis/etsy";
import EtsyConnectForm from "../components/EtsyConnectForm";
import ConnectedDashboard from "../components/etsy/ConnectedDashboard";
import type { EtsyConfig } from "../model/etsy_config";

const useTestData = import.meta.env.VITE_USE_TEST_DATA === "true";

const mockEtsyConfig: EtsyConfig = {
  keystring: "test-keystring",
  sharedSecret: "test-shared-secret",
  accessToken: "test-access-token",
  refreshToken: "test-refresh-token",
  expiresAt: Date.now() + 3600 * 1000,
};

const EtsyIntegrationPage = () => {
  const { isPending, isError, data, error } = useQuery({
    queryKey: ["etsyIntegrationConfig"],
    queryFn: useTestData
      ? () => Promise.resolve(mockEtsyConfig)
      : fetchEtsyConfig,
  });

  return (
    <div>
      <h1>Etsy Integration</h1>

      {isPending && <div>Loading...</div>}
      {isError && <div>Error: {error.message}</div>}
      {data && <ConnectedDashboard />}
      {!isPending && !isError && !data && <EtsyConnectForm />}
    </div>
  );
};

export default EtsyIntegrationPage;
