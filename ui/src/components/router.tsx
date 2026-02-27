import { Route, Routes } from "react-router";
import EtsyIntegrationPage from "../pages/etsy_integration";
import EtsyCallbackPage from "../pages/etsy_callback";
import DashboardPage from "../pages/dashboard";

const AccountingRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/integrations/etsy" element={<EtsyIntegrationPage />} />
      <Route path="/etsy/connect/callback" element={<EtsyCallbackPage />} />
    </Routes>
  );
};

export default AccountingRouter;
