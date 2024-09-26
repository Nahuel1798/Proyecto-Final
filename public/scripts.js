const URL_DEPARTAMENTOS = "https://collectionapi.metmuseum.org/public/collection/v1/departments";
const URL_OBJETO = "https://collectionapi.metmuseum.org/public/collection/v1/objects/"; 
const URL_SEARCH_IMAGES = "https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=Arts"; // Filtrar solo objetos con imágenes
const URL_SEARCH = "https://collectionapi.metmuseum.org/public/collection/v1/search";

// Función para obtener los departamentos y agregarlos al select
function obtenerDepartamentos() {
    fetch(URL_DEPARTAMENTOS)
        .then(response => response.json())
        .then(data => {
            const departamentoSelect = document.getElementById("departamento");
            data.departments.forEach(departamento => {
                const option = document.createElement("option");
                option.value = departamento.departmentId;
                option.text = departamento.displayName;
                departamentoSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error al obtener los departamentos:', error));
}

// Función para obtener detalles de los objetos a partir de una lista de objectIDs
/*async function traerObjetos(objectIDs) {
    let objetoHtml = "";
    for (const objectId of objectIDs) {
        try {
            const response = await fetch(URL_OBJETO + objectId);
            if (!response.ok) {
                throw new Error(`Objeto ${objectId} no encontrado`);
            }
            const data = await response.json();
                const imgHtml = `
                    <img src="${data.primaryImageSmall ? data.primaryImageSmall : 'img/placeholder.jpg'}" 
                         alt="${data.primaryImageSmall ? data.title : 'Sin imagen'}" 
                         title="${data.objectDate || 'Fecha no disponible'}" />
                `;
                // Verificar si tiene imágenes adicionales
                let botonHtml = '';
                if (data.additionalImages && data.additionalImages.length > 0) {
                    botonHtml = `
                        <button onclick="verImagenesAdicionales(${objectId})">Ver imágenes adicionales</button>
                    `;
                }
                
                const tituloTraducido = await traducirTexto(data.title);
                const culturaTraducida = await traducirTexto(data.culture);
                const dinastiaTraducida = await traducirTexto(data.dynasty);

                objetoHtml += `
                    <div class="objeto">
                        <img src="${data.primaryImageSmall ? data.primaryImageSmall : 'img/placeholder.jpg'}" alt="${data.primaryImageSmall ? tituloTraducido : 'Sin imagen'}" title="${data.objectDate || 'Fecha no disponible'}" />
                        <h3 class="title">${tituloTraducido}</h3>
                        <h3 class="cultura">${culturaTraducida ? culturaTraducida : "Sin datos"}</h3>
                        <h3 class="dinastia">${dinastiaTraducida ? dinastiaTraducida : "Sin datos"}</h3>
                        ${botonHtml}
                    </div>
                `;
            
        } catch (error) {
            console.error('Error al obtener detalles del objeto:', error);
        }
    }

    document.getElementById("grilla").innerHTML = objetoHtml;
}*/

function configurarPaginacionInicio(totalObjetos, paginaActual = 1) {
    const totalPaginas = Math.ceil(totalObjetos / 20);
    const paginacionDiv = document.getElementById('paginacion');
    const maxPaginasVisibles = 5;
    let inicioPagina = Math.max(1, paginaActual - Math.floor(maxPaginasVisibles / 2));
    let finPagina = Math.min(totalPaginas, inicioPagina + maxPaginasVisibles - 1);

    // Ajustar el rango de páginas si está en los extremos
    if (finPagina - inicioPagina < maxPaginasVisibles - 1) {
        inicioPagina = Math.max(1, finPagina - maxPaginasVisibles + 1);
    }

    paginacionDiv.innerHTML = ''; // Limpiar paginación anterior

    // Botón "Anterior"
    if (paginaActual > 1) {
        const botonAnterior = document.createElement('button');
        botonAnterior.textContent = 'Anterior';
        botonAnterior.disabled = paginaActual === 1; // Deshabilitar si es la primera página
        botonAnterior.addEventListener('click', () => {
            configurarPaginacion(totalObjetos, paginaActual - 1); // Llama a la función con la página anterior
            buscarObjetosConImagenes(paginaActual - 1);
        });
        paginacionDiv.appendChild(botonAnterior);
    }

    // Páginas numeradas
    for (let i = inicioPagina; i <= finPagina; i++) {
        const boton = document.createElement('button');
        boton.textContent = i;
        if (i === paginaActual) {
            boton.classList.add('active'); // Resaltar la página actual
        }
        boton.addEventListener('click', () => {
            configurarPaginacion(totalObjetos, i); // Llama a la función con la página seleccionada
            buscarObjetosConImagenes(i);
        });
        paginacionDiv.appendChild(boton);
    }

    // Botón "Siguiente"
    if (paginaActual < totalPaginas) {
        const botonSiguiente = document.createElement('button');
        botonSiguiente.textContent = 'Siguiente';
        botonSiguiente.disabled = paginaActual === totalPaginas; // Deshabilitar si es la última página
        botonSiguiente.addEventListener('click', () => {
            configurarPaginacion(totalObjetos, paginaActual + 1); // Llama a la función con la página siguiente
            buscarObjetosConImagenes(paginaActual + 1);
        });
        paginacionDiv.appendChild(botonSiguiente);
    }

    // Opcional: Botones de Inicio y Fin
    if (paginaActual > 1) {
        const botonInicio = document.createElement('button');
        botonInicio.textContent = 'Inicio';
        botonInicio.addEventListener('click', () => {
            configurarPaginacion(totalObjetos, 1); // Ir a la primera página
            buscarObjetosConImagenes(1);
        });
        paginacionDiv.prepend(botonInicio);
    }

    if (paginaActual < totalPaginas) {
        const botonFin = document.createElement('button');
        botonFin.textContent = 'Fin';
        botonFin.addEventListener('click', () => {
            configurarPaginacion(totalObjetos, totalPaginas); // Ir a la última página
            buscarObjetosConImagenes(totalPaginas);
        });
        paginacionDiv.appendChild(botonFin);
    }
}



function verImagenesAdicionales(objectId) {
    fetch(URL_OBJETO + objectId)
        .then(response => response.json())
        .then(data => {
            if (data.additionalImages && data.additionalImages.length > 0) {
                sessionStorage.setItem('imagenesAdicionales', JSON.stringify(data.additionalImages));
                window.location.href = 'imagenesAdicional/imagenes-adicionales.html';
            }
        })
        .catch(error => console.error('Error al obtener imágenes adicionales:', error));
}

// Hacemos la búsqueda inicial para obtener con imágenes con paginación
async function buscarObjetosConImagenes(page = 1, objetosPorPagina = 20) {
    try {
        const response = await fetch(URL_SEARCH_IMAGES);
        const data = await response.json();

        if (data.objectIDs && data.objectIDs.length > 0) {
            // Total de objetos
            const totalObjetos = data.objectIDs.length;

            // Configurar la paginación
            configurarPaginacionInicio(totalObjetos, page);

            // Obtener los objetos para la página actual
            obtenerObjetosConPaginacion(data.objectIDs, page, objetosPorPagina);
        } else {
            console.log('No se encontraron objetos.');
        }
    } catch (error) {
        console.error('Error en la búsqueda de objetos:', error);
    }
}


//Paginacion
function obtenerObjetosConPaginacion(objectIDs, page = 1, objetosPorPagina = 20) {
    let objetoHtml = "";
    const offset = (page - 1) * objetosPorPagina;
    const paginatedIDs = objectIDs.slice(offset, offset + objetosPorPagina);

    paginatedIDs.forEach(objectId => {
        fetch(URL_OBJETO + objectId)
            .then(response => response.json())
            .then(data => {
                    Promise.all([
                        traducirTexto(data.title),
                        traducirTexto(data.culture),
                        traducirTexto(data.dynasty)
                    ]).then(([tituloTraducido, culturaTraducida, dinastiaTraducida]) => {
                        const tieneImagenesAdicionales = data.additionalImages && data.additionalImages.length > 0;
                        objetoHtml += `
                            <div class="objeto">
                                <alt="${tituloTraducido}" title="${data.objectDate || 'Fecha no disponible'}" />
                                ${data.primaryImageSmall ? `<img src="${data.primaryImageSmall}" alt="${data.title}" />` : '<img src="img/placeholder.jpg" alt="Sin imagen" />'}
                                <h3 class="title">${tituloTraducido}</h3>
                                <h3 class="cultura">${culturaTraducida ? culturaTraducida : "Sin datos"}</h3>
                                <h3 class="dinastia">${dinastiaTraducida ? dinastiaTraducida : "Sin datos"}</h3>
                                ${tieneImagenesAdicionales ? `<button onclick="verImagenesAdicionales(${data.objectID})">Ver más imágenes</button>` : ''}                                
                            </div>
                        `;
                        document.getElementById("grilla").innerHTML = objetoHtml;
                    });
                
            })
            .catch(error => console.error('Error al obtener detalles del objeto:', error));
    });
}

// Función para traducir texto usando el endpoint del servidor
async function traducirTexto(texto) {
    // Verifica si el texto es válido
    if (!texto || texto.trim() === "") {
        console.error("No se puede traducir un texto vacío.");
        return texto; 
    }

    try {
        const response = await fetch(`/traducir?texto=${encodeURIComponent(texto)}`);
        const data = await response.json();

        // Verifica si hubo un error en la respuesta del servidor
        if (response.ok) {
            return data.textoTraducido;
        } else {
            console.error('Error en la respuesta del servidor:', data.error);
            return texto; 
        }
    } catch (error) {
        console.error('Error en la traducción:', error);
        return texto; 
    }
}

// Paginación
function configurarPaginacion(totalObjetos, paginaActual = 1) {
    const totalPaginas = Math.ceil(totalObjetos / 20);
    const paginacionDiv = document.getElementById('paginacion');
    const maxPaginasVisibles = 5;
    let inicioPagina = Math.max(1, paginaActual - Math.floor(maxPaginasVisibles / 2));
    let finPagina = Math.min(totalPaginas, inicioPagina + maxPaginasVisibles - 1);

    // Ajustar el rango de páginas si está en los extremos
    if (finPagina - inicioPagina < maxPaginasVisibles - 1) {
        inicioPagina = Math.max(1, finPagina - maxPaginasVisibles + 1);
    }

    paginacionDiv.innerHTML = '';

    // Botón "Anterior"
    if (paginaActual > 1) {
        const botonAnterior = document.createElement('button');
        botonAnterior.textContent = 'Anterior';
        botonAnterior.addEventListener('click', () => {
            configurarPaginacion(totalObjetos, paginaActual - 1);
            obtenerObjetosConPaginacion(currentObjectIDs, paginaActual - 1);
        });
        paginacionDiv.appendChild(botonAnterior);
    }

    // Páginas numeradas
    for (let i = inicioPagina; i <= finPagina; i++) {
        const boton = document.createElement('button');
        boton.textContent = i;
        if (i === paginaActual) {
            boton.classList.add('active'); // Puedes añadir una clase para el estilo de la página actual
        }
        boton.addEventListener('click', () => {
            configurarPaginacion(totalObjetos, i);
            obtenerObjetosConPaginacion(currentObjectIDs, i);
        });
        paginacionDiv.appendChild(boton);
    }

    // Botón "Siguiente"
    if (paginaActual < totalPaginas) {
        const botonSiguiente = document.createElement('button');
        botonSiguiente.textContent = 'Siguiente';
        botonSiguiente.addEventListener('click', () => {
            configurarPaginacion(totalObjetos, paginaActual + 1);
            obtenerObjetosConPaginacion(currentObjectIDs, paginaActual + 1);
        });
        paginacionDiv.appendChild(botonSiguiente);
    }
}



// Función para realizar la búsqueda con los filtros proporcionados
function realizarBusqueda() {
    const departamento = document.getElementById("departamento").value;
    const palabraClave = document.getElementById("palabraClave").value;
    const localizacion = document.getElementById("localizacion").value;

    const encodedPalabraClave = encodeURIComponent(palabraClave);

    const paramLocalizacion = localizacion !== "" ? `&geoLocation=${localizacion}` : "";
    const paramDepartamento = departamento ? `&departmentId=${departamento}` : "";
    const searchURL = `${URL_SEARCH}?q=${encodedPalabraClave}${paramDepartamento}${paramLocalizacion}`;
    console.log(searchURL);

    fetch(searchURL)
        .then(response => response.json())
        .then(data => {
            currentObjectIDs = data.objectIDs;
            if (data.objectIDs && Array.isArray(data.objectIDs) && data.objectIDs.length > 0) {
                obtenerObjetosConPaginacion(data.objectIDs);
                configurarPaginacion(data.objectIDs.length);
            } else {
                console.log('No se encontraron objetos, se mostrara la grilla vacía.');
                grilla.innerHTML = "<p class=resultado>No se encontraron objetos.</p>";;
            }
        })
        .catch(error => console.error('Error en la búsqueda de objetos:', error));
}

document.getElementById("boton").addEventListener("click", (event) => {
    event.preventDefault();
    realizarBusqueda();
    // Limpia el campo de palabra clave
    document.getElementById("palabraClave").value = "";
});

obtenerDepartamentos();
buscarObjetosConImagenes();





