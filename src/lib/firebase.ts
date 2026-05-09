import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAmGCAr4eA27RWIDR34Udh-ijclYzHjtaU",
  authDomain: "lakshmionlineservice-987fe.firebaseapp.com",
  projectId: "lakshmionlineservice-987fe",
  storageBucket: "lakshmionlineservice-987fe.firebasestorage.app",
  messagingSenderId: "207549906256",
  appId: "1:207549906256:web:7ef037aa7e03e418390055",
  measurementId: "G-PMDZ1R8ZDX"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
