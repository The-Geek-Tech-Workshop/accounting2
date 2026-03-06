import { onCall, HttpsError } from "firebase-functions/v2/https";
import { Firestore } from "firebase-admin/firestore";
import { EtsyConfig, ExchangeTokenData } from "../lib/etsy/api_types";
import { exchangeOAuthToken } from "../lib/etsy/auth";
import { getMe } from "../lib/etsy/api";

const firestore = new Firestore();

export const etsyExchangeToken = onCall<ExchangeTokenData>(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "You must be logged in to exchange an Etsy token",
    );
  }

  const { code, codeVerifier, keystring, sharedSecret, redirectUri } =
    request.data;

  if (!code || !codeVerifier || !keystring || !sharedSecret || !redirectUri) {
    throw new HttpsError(
      "invalid-argument",
      "code, codeVerifier, keystring, sharedSecret, and redirectUri are required",
    );
  }

  const tokenResponse = await exchangeOAuthToken(
    keystring,
    redirectUri,
    code,
    codeVerifier,
  );

  const tokenConfig = {
    keystring,
    sharedSecret,
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token,
    expiresAt: Date.now() + tokenResponse.expires_in * 1000,
  };

  const me = await getMe({
    keystring,
    sharedSecret,
    accessToken: tokenResponse.access_token,
  });

  const etsyConfig: EtsyConfig = {
    ...tokenConfig,
    shopId: me.shop_id,
  };

  await firestore.doc("etsy/oauth").set(etsyConfig, { merge: true });

  return { success: true };
});
