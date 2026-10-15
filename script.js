// Importamos la autenticación desde nuestro archivo de configuración
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "./firebase-config.js";

// Tus credenciales y URLs de TMDB
const API_KEY = 'cc24e25e37b5daf15adee1f81813fb5'; 
const URL_POPULARES = `https://themoviedb.org{API_KEY}&language=es-ES&page=1`;
const URL_BUSCAR = `https://themoviedb.org{API_KEY}&language=es-ES&query=`;
const URL_IMAGEN = 'https://tmdb.org';

// Elementos de la Interfaz (Login / App)
const seccionAuth = document.getElementById('seccion-auth');
const seccionApp = document.getElementById('seccion-app');

// Campos de Login
const correoInput = document.getElementById('auth-correo');
const contrasenaInput = document.getElementById('auth-contrasena');
const btnLogin = document.getElementById('btn-login');
const btnRegistro = document.getElementById('btn-registro');
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
        // Si hay usuario: Oculta login, muestra las películas y las carga
        seccionAuth.style.display = 'none';
        seccionApp.style.display = 'block';
        obtenerPeliculasPopulares();
    } else {
        // Si no hay usuario: Muestra el login y oculta la cartelera
        seccionAuth.style.display = 'flex';
        seccionApp.style.display = 'none';
    }
});

// Evento para Registrarse
btnRegistro.addEventListener('click', async () => {
    const email = correoInput.value;
    const password = contrasenaInput.value;
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("¡Cuenta creada con éxito!");
    } catch (error) {
        alert("Error al registrarse: " + error.message);
    }
});

// Evento para Iniciar Sesión
btnLogin.addEventListener('click', async () => {
    const email = correoInput.value;
    const password = contrasenaInput.value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        alert("Error al ingresar: " + error.message);
    }
});

// Evento para Cerrar Sesión
btnCerrarSesion.addEventListener('click', () => {
    signOut(auth);
});


// ==========================================
// 🎬 LÓGICA DE PELÍCULAS (TMDB)
// ==========================================

async function obtenerPeliculasPopulares() {
    try {
        const respuesta = await fetch(URL_POPULARES);
        const datos = await respuesta.json();
        mostrarPeliculas(datos.results);
    } catch (error) {
        console.error("Error cargando películas populares:", error);
    }
}

async function buscarPeliculas(nombrePelicula) {
    if (!nombrePelicula.trim()) return;
    try {
        const respuesta = await fetch(URL_BUSCAR + encodeURIComponent(nombrePelicula));
        const datos = await respuesta.json();
        mostrarPeliculas(datos.results);
    } catch (error) {
        console.error("Error en la búsqueda:", error);
    }
}

function mostrarPeliculas(peliculas) {
    contenedor.innerHTML = '';
    if (peliculas.length === 0) {
        contenedor.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No se encontraron películas.</p>';
        return;
    }
    peliculas.forEach(pelicula => {
        const rutaImagen = pelicula.poster_path ? (URL_IMAGEN + pelicula.poster_path) : 'https://placeholder.com';
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

async function abrirReproductor(peliculaId) {
    try {
        const urlVideos = `https://themoviedb.org{peliculaId}/videos?api_key=${API_KEY}&language=es-ES`;
        const respuesta = await fetch(urlVideos);
        const datos = await respuesta.json();
        const video = datos.results.find(v => v.site === 'YouTube');

        if (video) {
            reproductorDestino.innerHTML = `
                <iframe src="https://youtube.com{video.key}?autoplay=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>
            `;
            modal.style.display = 'flex';
        } else {
            alert("No hay un reproductor o trailer disponible para esta película en español.");
        }
    } catch (error) {
        console.error("Error al obtener el video:", error);
    }
}

btnCerrar.addEventListener('click', () => {
    modal.style.display = 'none';
    reproductorDestino.innerHTML = '';
});

btnBuscar.addEventListener('click', () => buscarPeliculas(inputBuscar.value));
inputBuscar.addEventListener('keypress', (e) => { if (e.key === 'Enter') buscarPeliculas(inputBuscar.value); });
