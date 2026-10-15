// Importamos las herramientas de Firebase directamente desde internet
import { initializeApp } from "https://gstatic.com";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://gstatic.com";

// Tus datos reales de la captura de pantalla
const firebaseConfig = {
  apiKey: "AIzaSyAWMcqYyE0MzTnFkMqa0_IA9SZPgvHM85g",
  authDomain: "://firebaseapp.com",
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
export { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged };
