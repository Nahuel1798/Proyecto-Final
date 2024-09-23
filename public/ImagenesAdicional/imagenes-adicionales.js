window.addEventListener('DOMContentLoaded', () => {
    // Recuperar las imágenes almacenadas en sessionStorage
    const imagenesAdicionales = JSON.parse(sessionStorage.getItem('imagenesAdicionales'));

    if (imagenesAdicionales && imagenesAdicionales.length > 0) {
        const contenedor = document.getElementById('contenedor-imagenes');
        let html = '';

        // Crear las imágenes adicionales en el DOM
        imagenesAdicionales.forEach(url => {
            html += `<img src="${url}" alt="Imagen adicional" class="imagen-adicional">`;
        });

        contenedor.innerHTML = html;
    } else {
        document.getElementById('contenedor-imagenes').innerHTML = '<p>No hay imágenes adicionales para este objeto.</p>';
    }
});

// Función para volver a la página principal
function volver() {
    window.history.back();
}
