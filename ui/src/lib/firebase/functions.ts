import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import app from "./app";
import config from "./config";

const functions = getFunctions(app, "europe-west2");

if (config.runningOnEmulator) {
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
}

export default functions;
