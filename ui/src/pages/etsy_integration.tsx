import { useQuery } from "@tanstack/react-query";
import { fetchEtsyConfig } from "../lib/apis/etsy";
import { Button, Descriptions, Form, Input, Tag, type FormProps } from "antd";
import { generatePkce } from "../lib/etsy/pkce";
import buildEtsyOAuthConnectUrl from "../lib/etsy/oauth_connect_url_builder";
import type { EtsyConfig } from "../model/etsy_config";

type FieldType = {
  keystring: string;
  sharedSecret: string;
};

const REDIRECT_URI = `${window.location.origin}/etsy/connect/callback`;
const SCOPES = ["billing_r", "transactions_r"];

// --- Sub-component: connect form (no existing integration) ---

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

// --- Sub-component: config display (integration already set up) ---

const EtsyConfigDisplay = ({ config }: { config: EtsyConfig }) => {
  const expiresAt = new Date(config.expiresAt);
  const isExpired = expiresAt < new Date();

  return (
    <Descriptions
      title="Connected Etsy Account"
      bordered
      column={1}
      style={{ maxWidth: 600 }}
    >
      <Descriptions.Item label="App Keystring">
        {config.keystring}
      </Descriptions.Item>
      <Descriptions.Item label="Shared Secret">
        <code>{config.sharedSecret}</code>
      </Descriptions.Item>
      <Descriptions.Item label="Access Token">
        <code>{config.accessToken}</code>
      </Descriptions.Item>
      <Descriptions.Item label="Refresh Token">
        <code>{config.refreshToken}</code>
      </Descriptions.Item>
      <Descriptions.Item label="Token Expires">
        {expiresAt.toLocaleString()}{" "}
        <Tag color={isExpired ? "error" : "success"}>
          {isExpired ? "Expired" : "Valid"}
        </Tag>
      </Descriptions.Item>
    </Descriptions>
  );
};

// --- Page ---

const EtsyIntegrationPage = () => {
  const { isPending, isError, data, error } = useQuery({
    queryKey: ["etsyIntegrationConfig"],
    queryFn: fetchEtsyConfig,
  });

  return (
    <div>
      <h1>Etsy Integration</h1>

      {isPending && <div>Loading...</div>}
      {isError && <div>Error: {error.message}</div>}
      {data && <EtsyConfigDisplay config={data} />}
      {!isPending && !isError && !data && <EtsyConnectForm />}
    </div>
  );
};

export default EtsyIntegrationPage;
