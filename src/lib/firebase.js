// Firebase 초기화 — 값은 .env.local(커밋 안 됨)의 VITE_FIREBASE_* 에서 읽음
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore/lite';
import { getFunctions } from 'firebase/functions';

// 앞뒤 공백·줄바꿈 제거 — GitHub Secrets에 붙여넣을 때 끝에 줄바꿈이 섞이면
// 프로젝트 ID가 "poppinroom-5f722\n"이 돼 Firestore 요청이 전부 거절됨
const clean = (value) => value?.trim();

const firebaseConfig = {
  apiKey: clean(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: clean(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: clean(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: clean(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: clean(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: clean(import.meta.env.VITE_FIREBASE_APP_ID),
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// 로그인할 때마다 구글 계정 선택 창 표시 — 없으면 마지막 계정으로 자동 로그인돼 계정 전환 불가
googleProvider.setCustomParameters({ prompt: 'select_account' });
// Firestore Lite — 실시간 연결 없이 요청 하나에 응답 하나(REST) 방식
// 기본 SDK의 실시간 연결은 일부 브라우저·네트워크에서 끊기거나 응답 없이 멈춰서 씀
export const db = getFirestore(app);
export const functions = getFunctions(app);
