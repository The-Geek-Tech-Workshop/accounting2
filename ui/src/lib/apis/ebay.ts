import { doc, getDoc } from "firebase/firestore/lite";
import { httpsCallable } from "firebase/functions";
import { ebayConfigConverter } from "../../model/ebay_config";
import firestore from "../firebase/firestore";
import functions from "../firebase/functions";

const fetchEbayConfig = async () => {
  const snapshot = await getDoc(
    doc(firestore, "ebay/oauth").withConverter(ebayConfigConverter),
  );
  return snapshot.data() ?? null;
};

const exchangeEbayToken = async (
  code: string,
  clientId: string,
  certId: string,
  ruName: string,
) => {
  const fn = httpsCallable(functions, "ebayExchangeToken");
  await fn({ code, clientId, certId, ruName });
};

const syncEbayDate = async (date: Date) => {
  const fn = httpsCallable(functions, "ebaySyncDate");
  await fn({ date: date.toISOString().split("T")[0] });
};

export { fetchEbayConfig, exchangeEbayToken, syncEbayDate };
