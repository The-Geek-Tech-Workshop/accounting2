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
