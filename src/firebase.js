// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyBL09cdIK88zV-uvHr0YgT2WoD1b0cFS4E",
  authDomain: "heist-gg.firebaseapp.com",
  projectId: "heist-gg",
  storageBucket: "heist-gg.appspot.com",
  messagingSenderId: "99368979558",
  appId: "1:99368979558:web:03caf37857034f00a7f1a7"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const functions = getFunctions();

const generateNicknameFunction = httpsCallable(functions, 'generateNickname');

async function generateNickname(firstName) {
  try {
    const result = await generateNicknameFunction({ firstName });
    return result.data.nickname;
  } catch (error) {
    console.error('Error generating nickname:', error);
    return null;
  }
}

export { db, generateNickname };
