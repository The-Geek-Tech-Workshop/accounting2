import { Layout } from "antd";
import AccountingRouter from "./components/router";
import AccountingMenu from "./components/menu";
const { Sider, Content } = Layout;

function App() {
  return (
    <Layout style={{ height: "100%" }}>
      <Sider
        width="25%"
        style={{
          color: "#fff",
          backgroundColor: "#1677ff",
        }}
      >
        <AccountingMenu />
      </Sider>
      <Layout>
        <Content>
          <AccountingRouter />
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
