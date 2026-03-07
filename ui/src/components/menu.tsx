import { Menu } from "antd";
import { useNavigate } from "react-router";

const AccountingMenu = () => {
  const navigate = useNavigate();
  return (
    <Menu
      mode="vertical"
      items={[
        {
          label: "Dashboard",
          key: "dashboard",
          onClick: () => {
            navigate("/");
          },
        },
        {
          label: "Accounts",
          key: "accounts",
          onClick: () => {
            navigate("/accounts");
          },
        },
        {
          label: "Integrations",
          key: "integrations",
          children: [
            {
              label: "Etsy",
              key: "etsy",
              onClick: () => {
                navigate("/integrations/etsy");
              },
            },
          ],
        },
      ]}
    />
  );
};

export default AccountingMenu;
