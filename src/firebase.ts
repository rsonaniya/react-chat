import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBFdhBMEQU5SRfsnWuw_H11jjrj8LK3T0o",
  authDomain: "fir-demo-afee6.firebaseapp.com",
  databaseURL: "https://fir-demo-afee6-default-rtdb.firebaseio.com",
  projectId: "fir-demo-afee6",
  storageBucket: "fir-demo-afee6.appspot.com",
  messagingSenderId: "618751931260",
  appId: "1:618751931260:web:b212d0cfb794cbb1fdaaf9",
};
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
