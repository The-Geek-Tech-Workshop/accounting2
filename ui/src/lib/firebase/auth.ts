import {
  browserLocalPersistence,
  connectAuthEmulator,
  initializeAuth,
} from "firebase/auth";
import app from "./app";
import config from "../config";

const initAuth = () => {
  const authentication = initializeAuth(app, {
    persistence: browserLocalPersistence,
  });
  if (config.runningOnEmulator) {
    connectAuthEmulator(authentication, "http://localhost:9099");
  }
  return authentication;
};

const auth = initAuth();
export default auth;
