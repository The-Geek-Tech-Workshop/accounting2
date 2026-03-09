const buildEbayOAuthConnectUrl = (
  clientId: string,
  ruName: string,
  scopes: string[],
  state: string,
): URL => {
  const url = new URL("https://auth.ebay.com/oauth2/authorize");
  url.searchParams.append("client_id", clientId);
  url.searchParams.append("redirect_uri", ruName);
  url.searchParams.append("response_type", "code");
  url.searchParams.append("scope", scopes.join(" "));
  url.searchParams.append("state", state);
  return url;
};

export default buildEbayOAuthConnectUrl;
