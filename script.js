const API_KEY = 'cc24e25e37b55daf15adee1f81813fb5';
const API_URL = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=es-ES&query=`;
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('search-input');
const resultsContainer = document.getElementById('results-container');

async function searchMovies() {
    const query = searchInput.value.trim();

    if (query === '') {
        alert('Por favor, escribe el nombre de una película.');
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

        const movies = data.results || [];

        if (movies.length === 0) {
            resultsContainer.innerHTML = '<p class="no-results">No se encontraron películas con ese nombre.</p>';
            return;
        }

        movies.forEach(movie => {
            const posterPath = movie.poster_path
                ? `${IMAGE_URL}${movie.poster_path}`
                : 'https://via.placeholder.com/500x750?text=Sin+poster';

            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');

            movieCard.innerHTML = `
                <img src="${posterPath}" alt="${movie.title}">
                <div class="movie-info">
                    <h3>${movie.title}</h3>
                    <span>⭐ ${movie.vote_average ? Number(movie.vote_average).toFixed(1) : '0.0'}</span>
                </div>
            `;

            resultsContainer.appendChild(movieCard);
        });
    } catch (error) {
        console.error('Error:', error);
        resultsContainer.innerHTML = '<p class="error">Hubo un error al conectar con el servidor.</p>';
    }
}

searchButton.addEventListener('click', searchMovies);

searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        searchMovies();
    }
});
