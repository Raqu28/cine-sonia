// Esperar a que la página cargue por completo
document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.getElementById("contenedorCatalogo");
    const reproductor = document.getElementById("reproductorPrincipal");

    // 1. Leer el archivo JSON de películas
    fetch("peliculas.json")
        .then(response => response.json())
        .then(peliculas => {
            // 2. Recorrer cada película y crear su tarjeta en pantalla
            peliculas.forEach(pelicula => {
                const tarjeta = document.createElement("div");
                tarjeta.className = "tarjeta-pelicula";
                
                tarjeta.innerHTML = `
                    <img src="${pelicula.poster}" alt="${pelicula.titulo}">
                    <h3>${pelicula.titulo}</h3>
                `;

                // 3. Escuchar el clic para reproducir la película al instante
                tarjeta.addEventListener("click", () => {
                    reproducirPelicula(pelicula.videoUrl);
                });

                contenedor.appendChild(tarjeta);
            });
        })
        .catch(error => console.error("Error cargando el catálogo:", error));

    // Función para cambiar de película en el reproductor
    function reproducirPelicula(url) {
        reproductor.src = url;
        reproductor.play();
        // Hace scroll hacia arriba automáticamente para ver el reproductor
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});
