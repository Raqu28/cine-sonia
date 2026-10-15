// Importamos la autenticación desde nuestro archivo de configuración
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged } from "./firebase-config.js";

// Tus credenciales y URLs de TMDB
const API_KEY = 'cc24e25e37b55daf15adee1f81813fb5'; 
const URL_POPULARES = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=es-ES&page=1`;
const URL_BUSCAR = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=es-ES&query=`;
const URL_IMAGEN = 'https://image.tmdb.org/t/p/w500';

// Elementos de la Interfaz (Login / App)
const seccionAuth = document.getElementById('seccion-auth');
const seccionApp = document.getElementById('seccion-app');

// Campos de Login
const correoInput = document.getElementById('auth-correo');
const contrasenaInput = document.getElementById('auth-contrasena');
const btnLogin = document.getElementById('btn-login');
const btnRegistro = document.getElementById('btn-registro');
const btnRecuperar = document.getElementById('btn-recuperar');
const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');

// Campos de Películas
const contenedor = document.getElementById('contenedor-peliculas');
const inputBuscar = document.getElementById('input-buscar');
const btnBuscar = document.getElementById('btn-buscar');
const modal = document.getElementById('modal-reproductor');
const btnCerrar = document.getElementById('btn-cerrar');
const reproductorDestino = document.getElementById('reproductor-destino');

// ==========================================
// 🔐 CONTROL DE SESIÓN (FIREBASE)
// ==========================================

// Revisa en tiempo real si el usuario inició sesión o no
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Si hay usuario: Oculta login, muestra la app y CARGA las películas populares
        seccionAuth.style.display = 'none';
        seccionApp.style.display = 'block';
        obtenerPeliculasPopulares(); // 🌟 ¡Llamada prioritaria aquí!
    } else {
        // Si no hay usuario: Muestra el login y oculta la cartelera
        seccionAuth.style.display = 'flex';
        seccionApp.style.display = 'none';
    }
});

// Evento para Registrarse
btnRegistro.addEventListener('click', async () => {
    const email = correoInput.value.trim();
    const password = contrasenaInput.value;
    if (!email || !password) {
        alert("Escribe tu correo y una contraseña para registrarte.");
        return;
    }
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("¡Cuenta creada con éxito!");
    } catch (error) {
        const mensaje = error.code === 'auth/email-already-in-use'
            ? "Ese correo ya tiene una cuenta. Pulsa «Ingresar» o «Olvidé mi contraseña»."
            : error.code === 'auth/invalid-email'
                ? "El correo electrónico no tiene un formato válido."
                : error.code === 'auth/weak-password'
                    ? "La contraseña debe tener al menos 6 caracteres."
                    : error.message;
        alert("No se pudo crear la cuenta: " + mensaje);
    }
});

// Evento para Iniciar Sesión
btnLogin.addEventListener('click', async () => {
    const email = correoInput.value.trim();
    const password = contrasenaInput.value;
    if (!email || !password) {
        alert("Escribe tu correo y contraseña para ingresar.");
        return;
    }
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        const mensaje = error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found'
            ? "El correo o la contraseña no son correctos. Si olvidaste la contraseña, usa «Olvidé mi contraseña»."
            : error.code === 'auth/invalid-email'
                ? "El correo electrónico no tiene un formato válido."
                : error.message;
        alert("No se pudo ingresar: " + mensaje);
    }
});

btnRecuperar.addEventListener('click', async () => {
    const email = correoInput.value.trim();
    if (!email) {
        alert("Escribe tu correo para enviarte el enlace de recuperación.");
        correoInput.focus();
        return;
    }
    try {
        await sendPasswordResetEmail(auth, email);
        alert("Si existe una cuenta con ese correo, recibirás un enlace para restablecer la contraseña.");
    } catch (error) {
        const mensaje = error.code === 'auth/invalid-email'
            ? "El correo electrónico no tiene un formato válido."
            : error.message;
        alert("No se pudo enviar el enlace de recuperación: " + mensaje);
    }
});

// Evento para Cerrar Sesión
btnCerrarSesion.addEventListener('click', () => {
    signOut(auth).catch((error) => {
        alert("No se pudo cerrar la sesión: " + error.message);
    });
});


// ==========================================
// 🎬 LÓGICA DE PELÍCULAS (TMDB)
// ==========================================

async function obtenerPeliculasPopulares() {
    try {
        const respuesta = await fetch(URL_POPULARES);
        if (!respuesta.ok) throw new Error(`TMDB respondió con estado ${respuesta.status}.`);
        const datos = await respuesta.json();
        mostrarPeliculas(datos.results);
    } catch (error) {
        console.error("Error cargando películas populares:", error);
        contenedor.innerHTML = '<p class="error">No se pudieron cargar las películas. Inténtalo de nuevo más tarde.</p>';
    }
}

async function buscarPeliculas(nombrePelicula) {
    if (!nombrePelicula.trim()) return;
    try {
        const respuesta = await fetch(URL_BUSCAR + encodeURIComponent(nombrePelicula));
        if (!respuesta.ok) throw new Error(`TMDB respondió con estado ${respuesta.status}.`);
        const datos = await respuesta.json();
        mostrarPeliculas(datos.results);
    } catch (error) {
        console.error("Error en la búsqueda:", error);
        contenedor.innerHTML = '<p class="error">No se pudo completar la búsqueda. Inténtalo de nuevo más tarde.</p>';
    }
}

function mostrarPeliculas(peliculas) {
    contenedor.innerHTML = '';
    if (!peliculas || peliculas.length === 0) {
        contenedor.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #00ffff;">No se encontraron películas.</p>';
        return;
    }
    peliculas.forEach(pelicula => {
        const rutaImagen = pelicula.poster_path ? (URL_IMAGEN + pelicula.poster_path) : 'https://placehold.co/500x750?text=Sin+poster';
        const tarjeta = document.createElement('div');
        tarjeta.classList.add('tarjeta-pelicula');
        tarjeta.innerHTML = `
            <img src="${rutaImagen}" alt="${pelicula.title}">
            <h3>${pelicula.title}</h3>
        `;
        tarjeta.addEventListener('click', () => {
            abrirReproductor(pelicula.id);
        });
        contenedor.appendChild(tarjeta);
    });
}

// ==========================================
// 🎥 REPRODUCTOR DE PELÍCULAS COMPLETAS
// ==========================================
async function abrirReproductor(peliculaId) {
    try {
        // Conectamos con el servidor que lee el ID de TMDB y carga el reproductor de la película
        const urlPeliculaCompleta = `https://vidsrc.to{peliculaId}`;

        // Insertamos el iframe dentro de tu ventana flotante con diseño ciber-punk
        reproductorDestino.innerHTML = `
            <iframe src="${urlPeliculaCompleta}" 
                    allowfullscreen 
                    scrolling="no" 
                    frameborder="0"
                    allow="autoplay; encrypted-media"
                    style="width: 100%; height: 100%; position: absolute; top: 0; left: 0; border: 0;">
            </iframe>
        `;
        
        // Abrimos la ventana flotante neón
        modal.style.display = 'flex';
        
    } catch (error) {
        console.error("Error al abrir el reproductor:", error);
        alert("Lo sentimos, esta película no se encuentra disponible en los servidores en este momento.");
    }
}

btnCerrar.addEventListener('click', () => {
    modal.style.display = 'none';
    reproductorDestino.innerHTML = '';
});

btnBuscar.addEventListener('click', () => buscarPeliculas(inputBuscar.value));
inputBuscar.addEventListener('keypress', (e) => { if (e.key === 'Enter') buscarPeliculas(inputBuscar.value); });
