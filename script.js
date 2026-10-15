// Credenciales y URLs de TMDB
const API_KEY = 'cc24e25e37b5daf15adee1f81813fb5'; 
const URL_POPULARES = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=es-ES&page=1`;
const URL_BUSCAR = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=es-ES&query=`;
const URL_IMAGEN = 'https://image.tmdb.org/t/p/w500';

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

// 🎥 REPRODUCTOR DE TRÁILERS
async function abrirReproductor(peliculaId) {
    try {
        const urlVideos = `https://api.themoviedb.org/3/movie/${peliculaId}/videos?api_key=${API_KEY}&language=es-ES`;
        const respuesta = await fetch(urlVideos);
        if (!respuesta.ok) throw new Error(`TMDB respondió con estado ${respuesta.status}.`);
        const datos = await respuesta.json();
        const video = datos.results.find(resultado => resultado.site === 'YouTube' && resultado.type === 'Trailer')
            || datos.results.find(resultado => resultado.site === 'YouTube');

        if (!video) {
            alert("No hay un tráiler disponible para esta película en español.");
            return;
        }

        reproductorDestino.innerHTML = `<iframe src="https://www.youtube.com/embed/${encodeURIComponent(video.key)}?autoplay=1"
            title="Tráiler de la película" allowfullscreen allow="autoplay; encrypted-media"
            style="width: 100%; height: 100%; position: absolute; top: 0; left: 0; border: 0;"></iframe>`;
        modal.style.display = 'flex';
    } catch (error) {
        console.error("Error al abrir el reproductor:", error);
        alert("No se pudo cargar el tráiler. Inténtalo de nuevo más tarde.");
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
