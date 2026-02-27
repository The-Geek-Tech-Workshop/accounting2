import { onCall, HttpsError } from "firebase-functions/v2/https";
import { Firestore } from "firebase-admin/firestore";

const firestore = new Firestore();

interface ExchangeTokenData {
  readonly code: string;
  readonly codeVerifier: string;
  readonly keystring: string;
  readonly sharedSecret: string;
  readonly redirectUri: string;
}

interface EtsyTokenResponse {
  readonly access_token: string;
  readonly refresh_token: string;
  readonly expires_in: number;
  readonly token_type: string;
}

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

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: keystring,
    redirect_uri: redirectUri,
    code,
    code_verifier: codeVerifier,
  });

  const response = await fetch("https://api.etsy.com/v3/public/oauth/token", {
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

  const tokenResponse = (await response.json()) as EtsyTokenResponse;

  await firestore.doc("etsy/oauth").set(
    {
      keystring,
      sharedSecret,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      expiresAt: Date.now() + tokenResponse.expires_in * 1000,
    },
    { merge: true },
  );

  return { success: true };
});
