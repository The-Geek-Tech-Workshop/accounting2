import { Descriptions, Tag } from "antd";
import type { EtsyConfig } from "../model/etsy_config";

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

export default EtsyConfigDisplay;
