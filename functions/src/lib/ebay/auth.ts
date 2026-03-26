import { HttpsError } from "firebase-functions/v2/https";
import { Firestore } from "firebase-admin/firestore";
import eBayApi from "ebay-api";
import { EbayConfig } from "./api_types";

const firestore = new Firestore();

const ensureSigningKey = async (
  eBay: eBayApi,
  config: EbayConfig,
): Promise<{ jwe: string; privateKey: string }> => {
  if (config.signingKeyJwe && config.signingKeyPrivateKey) {
    return {
      jwe: config.signingKeyJwe,
      privateKey: config.signingKeyPrivateKey,
    };
  }

  const signingKey =
    await eBay.developer.keyManagement.createSigningKey("ED25519");

  await firestore.doc("ebay/oauth").set(
    {
      signingKeyJwe: signingKey.jwe,
      signingKeyPrivateKey: signingKey.privateKey,
    },
    { merge: true },
  );

  return { jwe: signingKey.jwe, privateKey: signingKey.privateKey };
};

export const getEbayClient = async (): Promise<eBayApi> => {
  const snapshot = await firestore.doc("ebay/oauth").get();
  if (!snapshot.exists) {
    throw new HttpsError(
      "not-found",
      "eBay configuration not found. Please connect your eBay account first.",
    );
  }

  const config = snapshot.data() as EbayConfig;

  const eBay = new eBayApi({
    appId: config.clientId,
    certId: config.certId,
    sandbox: false,
    ruName: config.ruName,
    autoRefreshToken: true,
    marketplaceId: eBayApi.MarketplaceId.EBAY_GB,
  });

  eBay.OAuth2.setCredentials({
    access_token: config.accessToken,
    refresh_token: config.refreshToken,
    expires_in: Math.max(0, Math.floor((config.expiresAt - Date.now()) / 1000)),
    refresh_token_expires_in: Math.max(
      0,
      Math.floor((config.refreshTokenExpiresAt - Date.now()) / 1000),
    ),
    token_type: "User Access Token",
  });

  eBay.OAuth2.on("refreshAuthToken", async (token) => {
    await firestore.doc("ebay/oauth").set(
      {
        accessToken: token.access_token,
        refreshToken: token.refresh_token ?? config.refreshToken,
        expiresAt: Date.now() + (token.expires_in ?? 7200) * 1000,
      },
      { merge: true },
    );
  });

  const signature = await ensureSigningKey(eBay, config);
  eBay.setSignature(signature);

  return eBay;
};
