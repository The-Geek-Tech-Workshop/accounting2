import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { exchangeEtsyToken } from "../lib/apis/etsy";

const REDIRECT_URI = `${window.location.origin}/etsy/connect/callback`;

type TokenExchangeProps = {
  readonly code: string;
  readonly verifier: string;
  readonly keystring: string;
  readonly sharedSecret: string;
  readonly state: string;
};

const EtsyTokenExchange = ({
  code,
  verifier,
  keystring,
  sharedSecret,
  state,
}: TokenExchangeProps) => {
  const {
    mutate: exchangeToken,
    isPending,
    isSuccess,
    isError,
    error: mutationError,
  } = useMutation({
    mutationFn: () =>
      exchangeEtsyToken(code, verifier, keystring, sharedSecret, REDIRECT_URI),
  });

  useEffect(() => {
    sessionStorage.removeItem(`pkce_verifier_${state}`);
    sessionStorage.removeItem(`pkce_keystring_${state}`);
    sessionStorage.removeItem(`pkce_sharedsecret_${state}`);
    exchangeToken();
  }, [code, verifier, keystring, state, exchangeToken]);

  return (
    <div>
      <h1>Etsy Connection</h1>

      {isPending && <div>Processing...</div>}

      {isSuccess && <div>Etsy account connected successfully.</div>}

      {isError && (
        <div>
          Error:{" "}
          {mutationError instanceof Error
            ? mutationError.message
            : "Failed to exchange token with Etsy."}
        </div>
      )}
    </div>
  );
};

const EtsyCallbackPage = () => {
  const [searchParams] = useSearchParams();

  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const verifier = state
    ? sessionStorage.getItem(`pkce_verifier_${state}`)
    : null;
  const keystring = state
    ? sessionStorage.getItem(`pkce_keystring_${state}`)
    : null;
  const sharedSecret = state
    ? sessionStorage.getItem(`pkce_sharedsecret_${state}`)
    : null;

  if (errorParam) {
    return (
      <div>
        <h1>Etsy Connection</h1>
        <div>Error: {errorDescription ?? errorParam}</div>
      </div>
    );
  }

  if (!code || !state) {
    return (
      <div>
        <h1>Etsy Connection</h1>
        <div>Error: Missing required callback parameters.</div>
      </div>
    );
  }

  if (!verifier || !keystring || !sharedSecret) {
    return (
      <div>
        <h1>Etsy Connection</h1>
        <div>
          Error: Session expired or state mismatch. Please try connecting again.
        </div>
      </div>
    );
  }

  return (
    <EtsyTokenExchange
      code={code}
      verifier={verifier}
      keystring={keystring}
      sharedSecret={sharedSecret}
      state={state}
    />
  );
};

export default EtsyCallbackPage;
