import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// !!! IMPORTANT !!!
// Replace the values below with your actual Firebase project configuration
// You can find this in the Firebase Console -> Project Settings -> General -> Your apps
const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_API_KEY",
  authDomain: "REPLACE_WITH_YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket: "REPLACE_WITH_YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "REPLACE_WITH_YOUR_SENDER_ID",
  appId: "REPLACE_WITH_YOUR_APP_ID"
};

// Initialize Firebase
let app;
let auth;
let db;

try {
    // Simple check to see if config is still the placeholder
    if (firebaseConfig.apiKey === "REPLACE_WITH_YOUR_API_KEY") {
        console.warn("Firebase Config is still using placeholders. Please update services/firebaseConfig.ts");
    } else {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        console.log("Firebase initialized successfully");
    }
} catch (error) {
    console.error("Failed to initialize Firebase:", error);
}

export { auth, db };
