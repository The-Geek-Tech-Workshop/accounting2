import {
  connectFirestoreEmulator,
  getFirestore,
} from "firebase/firestore/lite";
import app from "./app";
import config from "../config";

const firestore = getFirestore(app);

if (config.runningOnEmulator) {
  connectFirestoreEmulator(firestore, "127.0.0.1", 8080);
}

export default firestore;
