import { createPublicKey, KeyObject, verify } from "crypto";
import { onRequest, Request } from "firebase-functions/https";
import { logger, onInit } from "firebase-functions";
import { defineString } from "firebase-functions/params";
import { Firestore } from "firebase-admin/firestore";

const firestore = new Firestore();

let PUBLIC_KEY_OBJECT: KeyObject;

const starlingPublicKeyParam = defineString("STARLING_PUBLIC_KEY", {
  description: "Starling Bank Webhook Public Key",
});

onInit(() => {
  PUBLIC_KEY_OBJECT = createPublicKey(
    `-----BEGIN PUBLIC KEY-----\n${starlingPublicKeyParam.value()}\n-----END PUBLIC KEY-----`
  );
});

const ENCRYPTION_ALGORITHM = "RSA-SHA512";

export const starlingFeedItem = onRequest(async (req, res) => {
  const verified = verifyEvent(req);

  if (!verified) {
    res.status(400).json({
      error: "Integrity of message signature could not be verified",
    });
    return;
  }

  const eventBodyJson = JSON.parse(req.rawBody.toString("utf-8"));

  const eventId = eventBodyJson["webhookEventUid"];

  if (!eventId) {
    logger.error("Missing webhookEventUid in payload");
    res.status(400).json({ error: "Missing webhookEventUid in payload" });
    return;
  }

  const eventDocument = firestore.doc(`events/starling/feeditem/${eventId}`);
  await eventDocument.set({
    body: eventBodyJson,
    headers: req.headers,
  });

  res.status(202).send();
  return;
});

const verifyEvent = (request: Request) => {
  const payloadSignatureBase64 = request.headers["x-hook-signature"];
  if (!payloadSignatureBase64 || Array.isArray(payloadSignatureBase64)) {
    logger.error("Missing or invalid X-Hook-Signature header");
    return false;
  }
  return verify(
    ENCRYPTION_ALGORITHM,
    request.rawBody,
    PUBLIC_KEY_OBJECT,
    Buffer.from(payloadSignatureBase64, "base64")
  );
};
