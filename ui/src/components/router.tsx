import { Route, Routes } from "react-router";
import EtsyIntegrationPage from "../pages/etsy_integration";
import EtsyCallbackPage from "../pages/etsy_callback";
import DashboardPage from "../pages/dashboard";
import LoginPage from "../pages/login";
import AccountsPage from "../pages/accounts";
import RequireAuth from "./RequireAuth";

const AccountingRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/integrations/etsy" element={<EtsyIntegrationPage />} />
        <Route path="/etsy/connect/callback" element={<EtsyCallbackPage />} />
      </Route>
    </Routes>
  );
};

export default AccountingRouter;
