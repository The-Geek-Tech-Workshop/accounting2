const buildEtsyOAuthConnectUrl = (
  clientId: string,
  redirectUri: string,
  scopes: string[],
  state: string,
  codeChallenge: string,
): URL => {
  const url = new URL("https://www.etsy.com/oauth/connect");
  url.searchParams.append("response_type", "code");
  url.searchParams.append("client_id", clientId);
  url.searchParams.append("redirect_uri", redirectUri);
  url.searchParams.append("scope", scopes.join(" "));
  url.searchParams.append("state", state);
  url.searchParams.append("code_challenge", codeChallenge);
  url.searchParams.append("code_challenge_method", "S256");
  return url;
};
export default buildEtsyOAuthConnectUrl;
