import { Route, Routes } from "react-router";
import EtsyIntegrationPage from "../pages/etsy_integration";
import EtsyCallbackPage from "../pages/etsy_callback";
import DashboardPage from "../pages/dashboard";
import LoginPage from "../pages/login";
import AccountsPage from "../pages/accounts";
import RequireAuth from "./RequireAuth";
import EbayIntegrationPage from "../pages/ebay_integration";
import EbayCallbackPage from "../pages/ebay_callback";

const AccountingRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/integrations/etsy" element={<EtsyIntegrationPage />} />
        <Route path="/etsy/connect/callback" element={<EtsyCallbackPage />} />
        <Route path="/integrations/ebay" element={<EbayIntegrationPage />} />
        <Route path="/ebay/connect/callback" element={<EbayCallbackPage />} />
      </Route>
    </Routes>
  );
};

export default AccountingRouter;
