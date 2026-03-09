import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { exchangeEbayToken } from "../lib/apis/ebay";

type TokenExchangeProps = {
  readonly code: string;
  readonly clientId: string;
  readonly certId: string;
  readonly ruName: string;
  readonly state: string;
};

const EbayTokenExchange = ({
  code,
  clientId,
  certId,
  ruName,
  state,
}: TokenExchangeProps) => {
  const {
    mutate: exchangeToken,
    isPending,
    isSuccess,
    isError,
    error: mutationError,
  } = useMutation({
    mutationFn: () => exchangeEbayToken(code, clientId, certId, ruName),
  });

  useEffect(() => {
    sessionStorage.removeItem(`ebay_client_id_${state}`);
    sessionStorage.removeItem(`ebay_cert_id_${state}`);
    sessionStorage.removeItem(`ebay_ru_name_${state}`);
    exchangeToken();
  }, [code, clientId, certId, ruName, state, exchangeToken]);

  return (
    <div>
      <h1>eBay Connection</h1>

      {isPending && <div>Processing...</div>}

      {isSuccess && <div>eBay account connected successfully.</div>}

      {isError && (
        <div>
          Error:{" "}
          {mutationError instanceof Error
            ? mutationError.message
            : "Failed to exchange token with eBay."}
        </div>
      )}
    </div>
  );
};

const EbayCallbackPage = () => {
  const [searchParams] = useSearchParams();

  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const clientId = state
    ? sessionStorage.getItem(`ebay_client_id_${state}`)
    : null;
  const certId = state ? sessionStorage.getItem(`ebay_cert_id_${state}`) : null;
  const ruName = state ? sessionStorage.getItem(`ebay_ru_name_${state}`) : null;

  if (errorParam) {
    return (
      <div>
        <h1>eBay Connection</h1>
        <div>Error: {errorDescription ?? errorParam}</div>
      </div>
    );
  }

  if (!code || !state) {
    return (
      <div>
        <h1>eBay Connection</h1>
        <div>Error: Missing required callback parameters.</div>
      </div>
    );
  }

  if (!clientId || !certId || !ruName) {
    return (
      <div>
        <h1>eBay Connection</h1>
        <div>
          Error: Session expired or state mismatch. Please try connecting again.
        </div>
      </div>
    );
  }

  return (
    <EbayTokenExchange
      code={code}
      clientId={clientId}
      certId={certId}
      ruName={ruName}
      state={state}
    />
  );
};

export default EbayCallbackPage;
