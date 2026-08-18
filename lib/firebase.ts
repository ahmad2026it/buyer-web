import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";

export const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyBGHt0HyQLzidZYCvOLTuDIV6SkWbnaf0w",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "whocan-provider.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "whocan-provider",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "whocan-provider.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "936736633235",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:936736633235:web:b0d9503366d9322adef866",
};

export const firebaseVapidKey = (
  process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ||
  "BG8otmT1ci-Hpb-5p3VcDCSCxbouXtC50MKu379cNn-66k8scG-sHAtztnXZvFqvVMdUVA5Gu3Y-lHUbL7sz-2I"
).trim();

export function getFirebaseApp(): FirebaseApp {
  if (getApps().length) return getApp();
  return initializeApp(firebaseConfig);
}
