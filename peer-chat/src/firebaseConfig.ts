// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, addDoc, onSnapshot, getDoc, updateDoc } from "firebase/firestore";
import { API_KEY } from "../env";



// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: API_KEY ,
  authDomain: "webrtc-video-calling-69927.firebaseapp.com",
  databaseURL: "https://webrtc-video-calling-69927-default-rtdb.firebaseio.com",
  projectId: "webrtc-video-calling-69927",
  storageBucket: "webrtc-video-calling-69927.firebasestorage.app",
  messagingSenderId: "78841515077",
  appId: "1:78841515077:web:a6bb19763c7fcfeb17a72c",
  measurementId: "G-KR3H7SFR7H",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export the database instance and Firestore functions
export { db, collection, doc, setDoc, addDoc, onSnapshot, getDoc, updateDoc };