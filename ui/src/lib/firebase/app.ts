import { initializeApp } from "firebase/app";
import config from "../config";

const app = config.runningOnEmulator
  ? initializeApp({
      projectId: "demo-accounting",
      appId: "1:1234567890:web:abcdef123456",
      apiKey: "fake-api-key",
    })
  : initializeApp({
      apiKey: "AIzaSyBijmFgq92MMolsqA15-qWXDZUiKDvMeoc",
      authDomain: "gtw-accounting.firebaseapp.com",
      projectId: "gtw-accounting",
      storageBucket: "gtw-accounting.firebasestorage.app",
      messagingSenderId: "515987919878",
      appId: "1:515987919878:web:2c8b882d544024f5939f87",
    });

export default app;
