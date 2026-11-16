import { initializeApp } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBY2SK6f6JJAJAmYako5FBrij6SXpXiqqk",
  authDomain: "monitordepacientes.firebaseapp.com",
  projectId: "monitordepacientes",
  storageBucket: "monitordepacientes.firebasestorage.app",
  messagingSenderId: "90279778411",
  appId: "1:90279778411:web:57fe8bb1e9f0ee818fb92e",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
