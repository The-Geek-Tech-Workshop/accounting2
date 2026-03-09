import { Button, Form, Input, type FormProps } from "antd";
import buildEbayOAuthConnectUrl from "../lib/ebay/oauth_connect_url_builder";

type FieldType = {
  clientId: string;
  certId: string;
  ruName: string;
};

const SCOPES = [
  "https://api.ebay.com/oauth/api_scope",
  "https://api.ebay.com/oauth/api_scope/sell.finances",
];

const EbayConnectForm = () => {
  const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
    const state = crypto.randomUUID();

    sessionStorage.setItem(`ebay_client_id_${state}`, values.clientId);
    sessionStorage.setItem(`ebay_cert_id_${state}`, values.certId);
    sessionStorage.setItem(`ebay_ru_name_${state}`, values.ruName);

    const url = buildEbayOAuthConnectUrl(
      values.clientId,
      values.ruName,
      SCOPES,
      state,
    );
    window.location.href = url.toString();
  };

  return (
    <Form name="ebayConnection" autoComplete="off" onFinish={onFinish}>
      <Form.Item<FieldType>
        label="Client ID (App ID)"
        name="clientId"
        rules={[{ required: true, message: "Please input your Client ID!" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item<FieldType>
        label="Cert ID (Client Secret)"
        name="certId"
        rules={[{ required: true, message: "Please input your Cert ID!" }]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item<FieldType>
        label="RuName"
        name="ruName"
        rules={[{ required: true, message: "Please input your RuName!" }]}
      >
        <Input />
      </Form.Item>
      <Button type="primary" htmlType="submit">
        Connect eBay Account
      </Button>
    </Form>
  );
};

export default EbayConnectForm;
