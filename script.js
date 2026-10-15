const API_KEY = 'cc24e25e37b5daf15adee1f81813fb5'; 

// URLs oficiales unidas de forma simple para evitar errores de símbolos
const API_URL = 'https://themoviedb.org' + API_KEY + '&language=es-ES&page=1';
const SEARCH_URL = 'https://themoviedb.org' + API_KEY + '&language=es-ES&query=';
const IMAGE_URL = 'https://tmdb.org';

const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('search-input');
const resultsContainer = document.getElementById('results-container');
const movieModal = document.getElementById('movie-modal');
const closeModal = document.querySelector('.close-button');
const modalDetails = document.getElementById('modal-details');

// Cargar películas del momento al abrir la página automáticamente
async function loadCurrentMovies() {
    try {
        resultsContainer.innerHTML = '<p class="loading">Cargando estrenos actualizados...</p>';
        const response = await fetch(API_URL);
        const data = await response.json();
        resultsContainer.innerHTML = '';
        renderMovies(data.results);
    } catch (error) {
        console.error('Error:', error);
        resultsContainer.innerHTML = '<p class="error">Hubo un error al conectar con el servidor.</p>';
    }
}

async function searchMovies() {
    const query = searchInput.value.trim();
    if (!query) {
        alert('Por favor, escribe el nombre de una película.');
        return;
    }
    try {
        resultsContainer.innerHTML = '<p class="loading">Buscando películas...</p>';
        const response = await fetch(SEARCH_URL + encodeURIComponent(query));
        const data = await response.json();
        resultsContainer.innerHTML = '';

        if (!data.results || data.results.length === 0) {
            resultsContainer.innerHTML = '<p class="no-results">No se encontraron películas con ese nombre.</p>';
            return;
        }
        renderMovies(data.results);
    } catch (error) {
        resultsContainer.innerHTML = '<p class="error">Hubo un error al conectar con el servidor.</p>';
    }
}

function renderMovies(movies) {
    movies.forEach(movie => {
        const posterUrl = movie.poster_path
            ? IMAGE_URL + movie.poster_path
            : 'https://placeholder.com';

        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        movieCard.style.cursor = 'pointer';

        movieCard.innerHTML = `
            <img src="${posterUrl}" alt="${movie.title}">
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <span>⭐ ${movie.vote_average ? movie.vote_average.toFixed(1) : '0.0'}</span>
            </div>
        `;

        // AL HACER CLIC: Abre el reproductor de la película completa en vez de la sinopsis
        movieCard.addEventListener('click', () => {
            const urlPeliculaCompleta = 'https://vidsrc.to' + movie.id;

            modalDetails.innerHTML = `
                <h2 style="color: #ff007f; text-shadow: 0 0 10px #ff007f; margin-top: 0; font-size: 24px;">${movie.title}</h2>
                <div class="modal-meta" style="margin-bottom: 15px; color: #00ffff;">
                    <span>📅 Año: ${movie.release_date ? movie.release_date.split('-')[0] : 'Desconocido'}</span>
                    <span>⭐ Puntuación: ${movie.vote_average ? movie.vote_average.toFixed(1) : '0.0'}/10</span>
                </div>
                
                <div class="contenedor-video" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px; border: 2px solid #ff007f; box-shadow: 0 0 15px #ff007f;">
                    <iframe src="${urlPeliculaCompleta}" 
                            allowfullscreen 
                            scrolling="no" 
                            frameborder="0"
                            allow="autoplay; encrypted-media"
                            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;">
                    </iframe>
                </div>
            `;

            if (movieModal) {
                movieModal.style.display = 'block';
            }
        });

        resultsContainer.appendChild(movieCard);
    });
}

if (closeModal) {
    closeModal.addEventListener('click', () => {
        if (movieModal) {
            movieModal.style.display = 'none';
            modalDetails.innerHTML = ''; 
        }
    });
}

window.addEventListener('click', (event) => {
    if (movieModal && event.target === movieModal) {
        movieModal.style.display = 'none';
        modalDetails.innerHTML = '';
    }
});

if (searchButton) searchButton.addEventListener('click', searchMovies);
if (searchInput) searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') searchMovies(); });

// Arrancar la cartelera de estrenos de inmediato
loadCurrentMovies();
