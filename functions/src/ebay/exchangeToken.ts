import { onCall, HttpsError } from "firebase-functions/v2/https";
import { Firestore } from "firebase-admin/firestore";
import eBayApi from "ebay-api";
import { EbayConfig, ExchangeEbayTokenData } from "../lib/ebay/api_types.js";

const firestore = new Firestore();

export const ebayExchangeToken = onCall<ExchangeEbayTokenData>(
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "You must be logged in to exchange an eBay token",
      );
    }

    const { code, clientId, certId, ruName } = request.data;

    if (!code || !clientId || !certId || !ruName) {
      throw new HttpsError(
        "invalid-argument",
        "code, clientId, certId, and ruName are required",
      );
    }

    const eBay = new eBayApi({
      appId: clientId,
      certId,
      sandbox: false,
      ruName,
    });

    const tokenResponse = await eBay.OAuth2.getToken(code);

    const ebayConfig: EbayConfig = {
      clientId,
      certId,
      ruName,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      expiresAt: Date.now() + (tokenResponse.expires_in ?? 7200) * 1000,
      refreshTokenExpiresAt:
        Date.now() +
        (tokenResponse.refresh_token_expires_in ?? 47304000) * 1000,
    };

    await firestore.doc("ebay/oauth").set(ebayConfig, { merge: true });

    return { success: true };
  },
);
