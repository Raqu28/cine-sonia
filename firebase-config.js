// Importamos los módulos de Firebase desde su CDN oficial
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Tus datos reales de la captura de pantalla
const firebaseConfig = {
  apiKey: "AIzaSyAWMcqYyE0MzTnFkMqa0_IA9SZPgvHM85g",
  authDomain: "cinesonia-b2eec.firebaseapp.com",
  projectId: "cinesonia-b2eec",
  storageBucket: "cinesonia-b2eec.firebasestorage.app",
  messagingSenderId: "870314567815",
  appId: "1:870314567815:web:dfcf79a213794944307022",
  measurementId: "G-WGJBB8509R"
};

// Inicializamos Firebase y la herramienta de Autenticación
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Exportamos las funciones de usuarios listas para usarlas en nuestra app
export { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged };
