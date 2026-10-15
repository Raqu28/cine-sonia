// Tu clave API real de TMDB funcionando perfectamente
const API_KEY = 'cc24e25e37b5daf15adee1f81813fb5'; 

// URLs oficiales exactas de la API
const URL_POPULARES = `https://themoviedb.org{API_KEY}&language=es-ES&page=1`;
const URL_BUSCAR = `https://themoviedb.org{API_KEY}&language=es-ES&query=`;
const URL_IMAGEN = 'https://tmdb.org';

// Elementos de la pantalla
const contenedor = document.getElementById('contenedor-peliculas');
const inputBuscar = document.getElementById('input-buscar');
const btnBuscar = document.getElementById('btn-buscar');
const modal = document.getElementById('modal-reproductor');
const btnCerrar = document.getElementById('btn-cerrar');
const reproductorDestino = document.getElementById('reproductor-destino');

// 🎬 Cargar películas populares al entrar
async function obtenerPeliculasPopulares() {
    try {
        const respuesta = await fetch(URL_POPULARES);
        const datos = await respuesta.json();
        mostrarPeliculas(datos.results);
    } catch (error) {
        console.error("Error al cargar populares:", error);
    }
}

// 🔍 Buscar películas
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

// 🖼️ Dibujar las películas en pantalla
function mostrarPeliculas(peliculas) {
    contenedor.innerHTML = '';
    if (!peliculas || peliculas.length === 0) {
        contenedor.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #00ffff;">No se encontraron películas.</p>';
        return;
    }
    peliculas.forEach(pelicula => {
        const img = pelicula.poster_path ? (URL_IMAGEN + pelicula.poster_path) : 'https://placeholder.com';
        const tarjeta = document.createElement('div');
        tarjeta.classList.add('tarjeta-pelicula');
        tarjeta.innerHTML = `
            <img src="${img}" alt="${pelicula.title}">
            <h3>${pelicula.title}</h3>
        `;
        tarjeta.addEventListener('click', () => abrirReproductor(pelicula.id));
        contenedor.appendChild(tarjeta);
    });
}

// 🎥 REPRODUCTOR DE PELÍCULAS COMPLETAS DIRECTO
async function abrirReproductor(peliculaId) {
    try {
        const urlPeliculaCompleta = `https://vidsrc.to{peliculaId}`;
        reproductorDestino.innerHTML = `
            <iframe src="${urlPeliculaCompleta}" 
                    allowfullscreen 
                    scrolling="no" 
                    frameborder="0"
                    allow="autoplay; encrypted-media"
                    style="width: 100%; height: 100%; position: absolute; top: 0; left: 0; border: 0;">
            </iframe>
        `;
        modal.style.display = 'flex';
    } catch (error) {
        alert("Pelicula no disponible en este momento.");
    }
}

btnCerrar.addEventListener('click', () => {
    modal.style.display = 'none';
    reproductorDestino.innerHTML = '';
});

btnBuscar.addEventListener('click', () => buscarPeliculas(inputBuscar.value));
inputBuscar.addEventListener('keypress', (e) => { if (e.key === 'Enter') buscarPeliculas(inputBuscar.value); });

// Arrancar la app de inmediato
obtenerPeliculasPopulares();
