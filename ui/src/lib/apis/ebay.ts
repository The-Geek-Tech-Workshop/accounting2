import { httpsCallable } from "firebase/functions";
import functions from "../firebase/functions";

const exchangeEbayToken = async (
  code: string,
  clientId: string,
  certId: string,
  ruName: string,
) => {
  const fn = httpsCallable(functions, "ebayExchangeToken");
  await fn({ code, clientId, certId, ruName });
};

export { exchangeEbayToken };
