const API_KEY = 'cc24e25e37b55daf15adee1f81813fb5'; 

const API_URL = `https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=es-ES&page=1&region=AR`;
const SEARCH_URL = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=es-ES&query=`;
const PROVIDERS_URL = `https://api.themoviedb.org/3/movie/`;
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('search-input');
const resultsContainer = document.getElementById('results-container');
const movieModal = document.getElementById('movie-modal');
const closeModal = document.querySelector('.close-button');
const modalDetails = document.getElementById('modal-details');
let providerRequestVersion = 0;

// Cargar películas del momento al abrir la página automáticamente
async function loadCurrentMovies() {
    try {
        resultsContainer.innerHTML = '<p class="loading">Cargando estrenos actualizados...</p>';
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`TMDB respondió con estado ${response.status}.`);
        }
        const data = await response.json();
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
        if (!response.ok) {
            throw new Error(`TMDB respondió con estado ${response.status}.`);
        }
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            resultsContainer.innerHTML = '<p class="no-results">No se encontraron películas con ese nombre.</p>';
            return;
        }
        renderMovies(data.results);
    } catch (error) {
        console.error('Error al buscar películas:', error);
        resultsContainer.innerHTML = '<p class="error">Hubo un error al conectar con el servidor.</p>';
    }
}

function renderMovies(movies) {
    resultsContainer.innerHTML = '';
    if (!movies || movies.length === 0) {
        resultsContainer.innerHTML = '<p class="no-results">No se encontraron películas.</p>';
        return;
    }

    movies.forEach(movie => {
        const posterUrl = movie.poster_path
            ? IMAGE_URL + movie.poster_path
            : 'https://placehold.co/500x750?text=Sin+poster';

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

        movieCard.addEventListener('click', () => showMovieDetails(movie));

        resultsContainer.appendChild(movieCard);
    });
}

async function showMovieDetails(movie) {
    const requestVersion = ++providerRequestVersion;
    const title = document.createElement('h2');
    title.textContent = movie.title;

    const metadata = document.createElement('div');
    metadata.classList.add('modal-meta');
    const year = movie.release_date ? movie.release_date.split('-')[0] : 'Desconocido';
    const rating = Number.isFinite(movie.vote_average) ? movie.vote_average.toFixed(1) : '0.0';
    metadata.textContent = `📅 Año: ${year} · ⭐ Puntuación: ${rating}/10`;

    const synopsisLabel = document.createElement('p');
    synopsisLabel.textContent = 'Sinopsis:';
    const synopsis = document.createElement('p');
    synopsis.textContent = movie.overview?.trim()
        || 'No hay una sinopsis disponible en español para esta película.';

    const providersSection = document.createElement('section');
    providersSection.classList.add('watch-providers');
    const providersHeading = document.createElement('h3');
    providersHeading.textContent = 'Dónde verla gratis en Argentina';
    const providersMessage = document.createElement('p');
    providersMessage.textContent = 'Consultando disponibilidad...';
    providersSection.append(providersHeading, providersMessage);

    modalDetails.replaceChildren(title, metadata, synopsisLabel, synopsis, providersSection);
    if (movieModal) movieModal.style.display = 'flex';

    try {
        const response = await fetch(
            `${PROVIDERS_URL}${movie.id}/watch/providers?api_key=${API_KEY}`
        );
        if (!response.ok) {
            throw new Error(`TMDB respondió con estado ${response.status}.`);
        }

        const data = await response.json();
        if (requestVersion !== providerRequestVersion) return;

        const countryData = data.results?.AR;
        const freeProviders = [
            ...(countryData?.free || []).map(provider => ({ ...provider, type: 'Gratis' })),
            ...(countryData?.ads || []).map(provider => ({ ...provider, type: 'Gratis con anuncios' }))
        ];

        providersSection.replaceChildren(providersHeading);
        if (freeProviders.length === 0) {
            const unavailableMessage = document.createElement('p');
            unavailableMessage.textContent = 'TMDB no indica opciones gratuitas disponibles actualmente para esta película en Argentina.';
            providersSection.appendChild(unavailableMessage);
            return;
        }

        const providerList = document.createElement('ul');
        freeProviders.forEach(provider => {
            const item = document.createElement('li');
            item.textContent = `${provider.provider_name} — ${provider.type}`;
            providerList.appendChild(item);
        });
        providersSection.appendChild(providerList);

        if (countryData.link && countryData.link.startsWith('https://')) {
            const providerLink = document.createElement('a');
            providerLink.href = countryData.link;
            providerLink.target = '_blank';
            providerLink.rel = 'noopener noreferrer';
            providerLink.textContent = 'Ver opciones en la página oficial de disponibilidad';
            providersSection.appendChild(providerLink);
        }
    } catch (error) {
        if (requestVersion !== providerRequestVersion) return;
        console.error('Error al consultar disponibilidad:', error);
        providersSection.replaceChildren(providersHeading);
        const errorMessage = document.createElement('p');
        errorMessage.classList.add('error');
        errorMessage.textContent = 'No se pudo consultar la disponibilidad ahora. Inténtalo de nuevo más tarde.';
        providersSection.appendChild(errorMessage);
    }
}

if (closeModal) {
    closeModal.addEventListener('click', () => {
        if (movieModal) {
            providerRequestVersion++;
            movieModal.style.display = 'none';
            modalDetails.innerHTML = ''; 
        }
    });
}

window.addEventListener('click', (event) => {
    if (movieModal && event.target === movieModal) {
        providerRequestVersion++;
        movieModal.style.display = 'none';
        modalDetails.innerHTML = '';
    }
});

if (searchButton) searchButton.addEventListener('click', searchMovies);
if (searchInput) searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') searchMovies(); });

// Arrancar la cartelera de estrenos de inmediato
loadCurrentMovies();
