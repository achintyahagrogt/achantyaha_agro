import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAFl5n4Xf9VGhn7d5e4X9MrtpNEU47xgu8",
    authDomain: "achintyah-agro.firebaseapp.com",
    projectId: "achintyah-agro",
    storageBucket: "achintyah-agro.firebasestorage.app",
    messagingSenderId: "689227286302",
    appId: "1:689227286302:web:d8486c1f72befc2d4beb0f"
  };

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);