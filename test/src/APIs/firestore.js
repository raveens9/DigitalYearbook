// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCK5IL7-TppVi8Cq5IJKo0YtDMxHAPHRwA",
  authDomain: "markme-10176.firebaseapp.com",
  projectId: "markme-10176",
  storageBucket: "markme-10176.appspot.com",
  messagingSenderId: "240213549026",
  appId: "1:240213549026:web:fa56fffa7aeef1ca2c63bb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const auth=getAuth(app);

export {auth};