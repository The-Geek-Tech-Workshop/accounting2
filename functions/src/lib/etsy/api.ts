import { HttpsError } from "firebase-functions/v2/https";
import { authorisationHeaders } from "./auth";
import { EtsyConfig, EtsyLedgerEntriesResponse, EtsyMe } from "./api_types";

export const ETSY_API_BASE = "https://openapi.etsy.com/v3/application";
export const ETSY_TOKEN_URL = "https://api.etsy.com/v3/public/oauth/token";

export const getMe = async (
  credentials: Pick<EtsyConfig, "keystring" | "sharedSecret" | "accessToken">,
): Promise<EtsyMe> => {
  const userResponse = await fetch(`${ETSY_API_BASE}/users/me`, {
    headers: authorisationHeaders(credentials),
  });

  if (!userResponse.ok) {
    const errorText = await userResponse.text();
    throw new HttpsError(
      "unavailable",
      `Failed to fetch Etsy me data: ${errorText}`,
    );
  }

  const me = (await userResponse.json()) as EtsyMe;

  return me;

  // Cache the shopId in Firestore to avoid repeated API calls
  // await firestore.doc("etsy/oauth").set({ shopId }, { merge: true });
};

export const fetchLedgerEntriesPage = async (
  config: EtsyConfig,
  minCreated: number,
  maxCreated: number,
  offset: number,
): Promise<EtsyLedgerEntriesResponse> => {
  const params = new URLSearchParams({
    min_created: String(minCreated),
    max_created: String(maxCreated),
    limit: "100",
    offset: String(offset),
  });

  const url = `${ETSY_API_BASE}/shops/${config.shopId}/payment-account/ledger-entries?${params}`;

  const response = await fetch(url, {
    headers: authorisationHeaders(config),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new HttpsError(
      "unavailable",
      `Etsy ledger API request failed: ${errorText}`,
    );
  }

  return (await response.json()) as EtsyLedgerEntriesResponse;
};
