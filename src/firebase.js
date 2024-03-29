// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from "firebase/auth"; 
import {getFirestore} from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_apiKey,
  authDomain: "disfraces-mz.firebaseapp.com",
  projectId: "disfraces-mz",
  storageBucket: "disfraces-mz.appspot.com",
  messagingSenderId: "180290500484",
  appId: "1:180290500484:web:18acc67e06db5415dfcfd1",
  measurementId: "G-CBF21TYHRS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
const analytics = getAnalytics(app);

export const storage = getStorage(app);