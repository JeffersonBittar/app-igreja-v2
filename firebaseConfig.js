import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuração do Firebase
// IMPORTANTE: Substitua pelos valores reais do seu projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAz5bI5zWNeSYwtACNPA8I_wBJHG-lDc_g",
  authDomain: "ceusabertoscajuapp.firebaseapp.com",
  projectId: "ceusabertoscajuapp",
  storageBucket: "ceusabertoscajuapp.appspot.com",
  messagingSenderId: "854762235950",
  appId: "1:854762235950:android:7b5c271063ec3de3f717bf",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar serviços
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
