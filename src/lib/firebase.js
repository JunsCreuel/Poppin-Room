// Firebase 초기화 — 값은 .env.local(커밋 안 됨)의 VITE_FIREBASE_* 에서 읽음
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// 로그인할 때마다 구글 계정 선택 창 표시 — 없으면 마지막 계정으로 자동 로그인돼 계정 전환 불가
googleProvider.setCustomParameters({ prompt: 'select_account' });
export const db = getFirestore(app);
export const functions = getFunctions(app);
