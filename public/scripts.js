const URL_DEPARTAMENTOS = "https://collectionapi.metmuseum.org/public/collection/v1/departments";
const URL_OBJETO = "https://collectionapi.metmuseum.org/public/collection/v1/objects/"; 
const URL_SEARCH_IMAGES = "https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=flowers"; // Filtrar solo objetos con imágenes
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
async function traerObjetos(objectIDs) {
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

// Hacemos la búsqueda inicial para obtener con imagenes
async function buscarObjetosConImagenes() {
    try {
        const response = await fetch(URL_SEARCH_IMAGES);
        const data = await response.json();

        if (data.objectIDs && data.objectIDs.length > 0) {
            // Limitar a los primeros 20 objectIDs
            await traerObjetos(data.objectIDs.slice(0, 20));
        } else {
            console.log('No se encontraron objetos.');
        }
    } catch (error) {
        console.error('Error en la búsqueda de objetos:', error);
    }
}


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
                        objetoHtml += `
                            <div class="objeto">
                                <alt="${tituloTraducido}" title="${data.objectDate || 'Fecha no disponible'}" />
                                ${data.primaryImageSmall ? `<img src="${data.primaryImageSmall}" alt="${data.title}" />` : '<img src="img/placeholder.jpg" alt="Sin imagen" />'}
                                <h3 class="title">${tituloTraducido}</h3>
                                <h3 class="cultura">${culturaTraducida ? culturaTraducida : "Sin datos"}</h3>
                                <h3 class="dinastia">${dinastiaTraducida ? dinastiaTraducida : "Sin datos"}</h3>
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
function configurarPaginacion(totalObjetos) {
    const totalPaginas = Math.ceil(totalObjetos / 20);
    const paginacionDiv = document.getElementById('paginacion');
    paginacionDiv.innerHTML = '';

    for (let i = 1; i <= totalPaginas; i++) {
        const boton = document.createElement('button');
        boton.textContent = i;
        boton.addEventListener('click', () => {
            obtenerObjetosConPaginacion(currentObjectIDs, i);
        });
        paginacionDiv.appendChild(boton);
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
                grilla.innerHTML = "<p>No se encontraron objetos.</p>";;
            }
        })
        .catch(error => console.error('Error en la búsqueda de objetos:', error));
}

document.getElementById("boton").addEventListener("click", (event) => {
    event.preventDefault();
    realizarBusqueda();
});

obtenerDepartamentos();
buscarObjetosConImagenes();



