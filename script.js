// Tus credenciales y URLs de TMDB corregidas al 100%
const API_KEY = 'cc24e25e37b5daf15adee1f81813fb5'; 
const URL_POPULARES = `https://themoviedb.org{API_KEY}&language=es-ES&page=1`;
const URL_BUSCAR = `https://themoviedb.org{API_KEY}&language=es-ES&query=`;
const URL_IMAGEN = 'https://tmdb.org';

// Elementos de la Interfaz
const contenedor = document.getElementById('contenedor-peliculas');
const inputBuscar = document.getElementById('input-buscar');
const btnBuscar = document.getElementById('btn-buscar');
const modal = document.getElementById('modal-reproductor');
const btnCerrar = document.getElementById('btn-cerrar');
const reproductorDestino = document.getElementById('reproductor-destino');

// 🎬 CARGA AUTOMÁTICA AL ENTRAR (Público para todos)
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
    if (!peliculas || peliculas.length === 0) {
        contenedor.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #00ffff;">No se encontraron películas.</p>';
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

// 🎥 REPRODUCTOR DE PELÍCULAS COMPLETAS DIRECTO
async function abrirReproductor(peliculaId) {
    try {
        // Servidor que carga el reproductor de la película usando las comillas invertidas correctas
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
        console.error("Error al abrir el reproductor:", error);
        alert("Lo sentimos, esta película no se encuentra disponible en este momento.");
    }
}

btnCerrar.addEventListener('click', () => {
    modal.style.display = 'none';
    reproductorDestino.innerHTML = '';
});

btnBuscar.addEventListener('click', () => buscarPeliculas(inputBuscar.value));
inputBuscar.addEventListener('keypress', (e) => { if (e.key === 'Enter') buscarPeliculas(inputBuscar.value); });

// 🚀 Arrancar la cartelera de inmediato
obtenerPeliculasPopulares();
