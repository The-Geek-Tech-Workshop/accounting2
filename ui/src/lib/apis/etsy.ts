import { doc, getDoc } from "firebase/firestore/lite";
import { httpsCallable } from "firebase/functions";
import { etsyConfigConverter } from "../../model/etsy_config";
import firestore from "../firebase/firestore";
import functions from "../firebase/functions";

const fetchEtsyConfig = async () => {
  const snapshot = await getDoc(
    doc(firestore, "etsy/oauth").withConverter(etsyConfigConverter),
  );
  return snapshot.data() ?? null; // TanStack will interpret 'undefined' as an error state
};

const exchangeEtsyToken = async (
  code: string,
  codeVerifier: string,
  keystring: string,
  sharedSecret: string,
  redirectUri: string,
) => {
  const fn = httpsCallable(functions, "etsyExchangeToken");
  await fn({ code, codeVerifier, keystring, sharedSecret, redirectUri });
};

export { fetchEtsyConfig, exchangeEtsyToken };
