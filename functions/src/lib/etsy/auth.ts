import { HttpsError } from "firebase-functions/v2/https";
import { Firestore } from "firebase-admin/firestore";
import { ETSY_TOKEN_URL } from "./api";
import { EtsyConfig, EtsyTokenResponse } from "./api_types";

const firestore = new Firestore();

export const refreshAccessToken = async (
  config: EtsyConfig,
): Promise<EtsyConfig> => {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: config.keystring,
    refresh_token: config.refreshToken,
  });

  const response = await fetch(ETSY_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new HttpsError(
      "unavailable",
      `Etsy token refresh failed: ${errorText}`,
    );
  }

  const tokenResponse = (await response.json()) as EtsyTokenResponse;
  const updatedConfig: EtsyConfig = {
    ...config,
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token,
    expiresAt: Date.now() + tokenResponse.expires_in * 1000,
  };

  await firestore.doc("etsy/oauth").set(
    {
      accessToken: updatedConfig.accessToken,
      refreshToken: updatedConfig.refreshToken,
      expiresAt: updatedConfig.expiresAt,
    },
    { merge: true },
  );

  return updatedConfig;
};

export const getValidConfig = async (): Promise<EtsyConfig> => {
  const snapshot = await firestore.doc("etsy/oauth").get();
  if (!snapshot.exists) {
    throw new HttpsError(
      "not-found",
      "Etsy configuration not found. Please connect your Etsy account first.",
    );
  }

  const config = snapshot.data() as EtsyConfig;

  // Refresh token if it is expired or within 60 seconds of expiry
  if (Date.now() >= config.expiresAt - 60_000) {
    return refreshAccessToken(config);
  }

  return config;
};

export const exchangeOAuthToken = async (
  keystring: string,
  redirectUri: string,
  code: string,
  codeVerifier: string,
): Promise<EtsyTokenResponse> => {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: keystring,
    redirect_uri: redirectUri,
    code,
    code_verifier: codeVerifier,
  });

  const response = await fetch(ETSY_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new HttpsError(
      "unavailable",
      `Etsy token exchange failed: ${errorText}`,
    );
  }

  return (await response.json()) as EtsyTokenResponse;
};

export const authorisationHeaders = (
  credentials: Pick<EtsyConfig, "keystring" | "sharedSecret" | "accessToken">,
) => ({
  Authorization: `Bearer ${credentials.accessToken}`,
  "x-api-key": `${credentials.keystring}:${credentials.sharedSecret}`,
});
