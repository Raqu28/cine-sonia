const API_KEY = 'cc24e25e37b55daf15adee1f81813fb5';
const API_URL = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=es-ES&query=`;
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('search-input');
const resultsContainer = document.getElementById('results-container');
const movieModal = document.getElementById('movie-modal');
const closeModal = document.querySelector('.close-button');
const modalDetails = document.getElementById('modal-details');

async function searchMovies() {
    const query = searchInput.value.trim();

    if (!query) {
        alert('Por favor, escribe el nombre de una película.');
        return;
    }

    if (!resultsContainer) {
        console.error('No se encontró el contenedor de resultados.');
        return;
    }

    try {
        resultsContainer.innerHTML = '<p class="loading">Buscando películas...</p>';

        const response = await fetch(API_URL + encodeURIComponent(query));

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        resultsContainer.innerHTML = '';

        if (!data.results || data.results.length === 0) {
            resultsContainer.innerHTML = '<p class="no-results">No se encontraron películas con ese nombre.</p>';
            return;
        }

        data.results.forEach(movie => {
            const posterUrl = movie.poster_path
                ? `${IMAGE_URL}${movie.poster_path}`
                : 'https://via.placeholder.com/500x750?text=Sin+poster';

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

            movieCard.addEventListener('click', () => {
                const overviewText = movie.overview && movie.overview.trim() !== ''
                    ? movie.overview
                    : 'Lo sentimos, esta película aún no cuenta con una sinopsis disponible en español.';

                const releaseYear = movie.release_date
                    ? movie.release_date.split('-')[0]
                    : 'Desconocido';

                modalDetails.innerHTML = `
                    <h2>${movie.title}</h2>
                    <div class="modal-meta" style="margin-bottom: 15px;">
                        <span>📅 Año: ${releaseYear}</span>
                        <span>⭐ Puntuación: ${movie.vote_average ? movie.vote_average.toFixed(1) : '0.0'}/10</span>
                    </div>
                    <p><strong>Sinopsis:</strong></p>
                    <p>${overviewText}</p>
                `;

                if (movieModal) {
                    movieModal.style.display = 'block';
                }
            });

            resultsContainer.appendChild(movieCard);
        });
    } catch (error) {
        console.error('Error:', error);
        resultsContainer.innerHTML = '<p class="error">Hubo un error al conectar con el servidor.</p>';
    }
}

if (closeModal) {
    closeModal.addEventListener('click', () => {
        if (movieModal) {
            movieModal.style.display = 'none';
        }
    });
}

window.addEventListener('click', (event) => {
    if (movieModal && event.target === movieModal) {
        movieModal.style.display = 'none';
    }
});

if (searchButton) {
    searchButton.addEventListener('click', searchMovies);
}

if (searchInput) {
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            searchMovies();
        }
    });
}
