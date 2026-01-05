import { createPublicKey, KeyObject, verify } from "crypto";
import { onRequest, Request } from "firebase-functions/https";
import { logger, onInit } from "firebase-functions";
import { defineString } from "firebase-functions/params";

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

export const starlingWebhook = onRequest(async (req, res) => {
  const verified = verifyEvent(req);
  if (verified) {
    logger.info("Message verified successfully. Dobzre :)");
  } else {
    logger.error("Message verification failed");
  }

  verified
    ? res.status(202).send()
    : res.status(400).json({
        error: "Integrity of message signature could not be verified",
      });
});

const verifyEvent = (request: Request) => {
  const payloadSignatureBase64 = request.headers["X-Hook-Signature"];
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
