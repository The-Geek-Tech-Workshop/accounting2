import { onCall, HttpsError } from "firebase-functions/v2/https";
import { Firestore } from "firebase-admin/firestore";

const firestore = new Firestore();

export const etsyDeleteConfig = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "You must be logged in to delete the Etsy configuration",
    );
  }

  await firestore.doc("etsy/oauth").delete();

  return { success: true };
});
