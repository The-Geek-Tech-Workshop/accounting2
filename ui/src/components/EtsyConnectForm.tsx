import { Button, Form, Input, type FormProps } from "antd";
import { generatePkce } from "../lib/etsy/pkce";
import buildEtsyOAuthConnectUrl from "../lib/etsy/oauth_connect_url_builder";

type FieldType = {
  keystring: string;
  sharedSecret: string;
};

const REDIRECT_URI = `${window.location.origin}/etsy/connect/callback`;
const SCOPES = ["billing_r", "transactions_r", "shops_r"];

const EtsyConnectForm = () => {
  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    const { verifier, challenge } = await generatePkce();
    const state = crypto.randomUUID();

    sessionStorage.setItem(`pkce_verifier_${state}`, verifier);
    sessionStorage.setItem(`pkce_keystring_${state}`, values.keystring);
    sessionStorage.setItem(`pkce_sharedsecret_${state}`, values.sharedSecret);

    const url = buildEtsyOAuthConnectUrl(
      values.keystring,
      REDIRECT_URI,
      SCOPES,
      state,
      challenge,
    );
    window.location.href = url.toString();
  };

  return (
    <Form name="etsyConnection" autoComplete="off" onFinish={onFinish}>
      <Form.Item<FieldType>
        label="App Keystring"
        name="keystring"
        rules={[
          { required: true, message: "Please input your App Keystring!" },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item<FieldType>
        label="Shared Secret"
        name="sharedSecret"
        rules={[
          { required: true, message: "Please input your Shared Secret!" },
        ]}
      >
        <Input.Password />
      </Form.Item>
      <Button type="primary" htmlType="submit">
        Connect Etsy Account
      </Button>
    </Form>
  );
};

export default EtsyConnectForm;
