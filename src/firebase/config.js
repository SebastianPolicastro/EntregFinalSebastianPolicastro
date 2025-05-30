
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
apiKey: "AIzaSyBWwJLh20u5MOlphz8lNLEFCkOY5Jj_WvA",
authDomain: "coderhouse-ecommerce-353f0.firebaseapp.com",
projectId: "coderhouse-ecommerce-353f0",
storageBucket: "coderhouse-ecommerce-353f0.firebasestorage.app",
messagingSenderId: "514541491652",
appId: "1:514541491652:web:b086db5d1a1367e7f88091"
};


const app = initializeApp(firebaseConfig);


export const db = getFirestore(app);

export const auth = getAuth(app);