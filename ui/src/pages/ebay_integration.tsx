import { useQuery } from "@tanstack/react-query";
import { fetchEbayConfig } from "../lib/apis/ebay";
import EbayConnectForm from "../components/EbayConnectForm";
import ConnectedDashboard from "../components/ebay/ConnectedDashboard";
import type { EbayConfig } from "../model/ebay_config";

const useTestData = import.meta.env.VITE_USE_TEST_DATA === "true";

const mockEbayConfig: EbayConfig = {
  clientId: "test-client-id",
  certId: "test-cert-id",
  ruName: "test-ru-name",
  accessToken: "test-access-token",
  refreshToken: "test-refresh-token",
  expiresAt: Date.now() + 7200 * 1000,
  refreshTokenExpiresAt: Date.now() + 47304000 * 1000,
};

const EbayIntegrationPage = () => {
  const { isPending, isError, data, error } = useQuery({
    queryKey: ["ebayIntegrationConfig"],
    queryFn: useTestData
      ? () => Promise.resolve(mockEbayConfig)
      : fetchEbayConfig,
  });

  return (
    <div>
      <h1>eBay Integration</h1>

      {isPending && <div>Loading...</div>}
      {isError && <div>Error: {error.message}</div>}
      {data && <ConnectedDashboard />}
      {!isPending && !isError && !data && <EbayConnectForm />}
    </div>
  );
};

export default EbayIntegrationPage;
