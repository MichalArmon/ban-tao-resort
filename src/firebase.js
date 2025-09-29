// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD3zb_70h9HTeXFkVjCQryhZJAarVzvgOw",
  authDomain: "ban-tao.firebaseapp.com",
  projectId: "ban-tao",
  storageBucket: "ban-tao.appspot.com",
  messagingSenderId: "1016773412593",
  appId: "1:1016773412593:web:34fb120c86d4a9a4104b50",
  measurementId: "G-REWLLWQY29D",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Authentication
export const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export const loginWithGoogle = () => signInWithPopup(auth, provider);
export const logout = () => signOut(auth);

// מאזין לשינויים בחיבור
export const listenAuth = (callback) => onAuthStateChanged(auth, callback);
