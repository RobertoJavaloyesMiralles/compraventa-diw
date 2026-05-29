
/**
 * Carga los modelos de una marca específica y los muestra en el desplegable de modelos.
 * Se ejecuta cuando el usuario selecciona una marca en el formulario de alta de vehículos.
 */
document.addEventListener("DOMContentLoaded", async () => {
    const marca = document.getElementById("marca");
    const modelo = document.getElementById("modelo");

    /**
     * Carga los modelos de una marca específica y los muestra en el desplegable de modelos.
     */
    async function cargarModelos(marcaId, modeloSeleccionadoId = null) {
        // SI no hay marcaId, no se cargan modelos
        if (!marcaId) {
            return;
        }

        try {
            // Llama al endpoint para cargar los modelos pasandole el id de una marca
            const response = await fetch(`/modelos/${marcaId}`);

            // Si la respuesta no es OK, lanza un error
            if (!response.ok) {
                throw new Error(`HTTP: ${response.status}`);
            }

            // Convierte la respuesta a JSON
            const modelos = await response.json();

            // Limpia el select de modelos
            modelo.replaceChildren();

            // Si no hay modelos, muestra el mensaje correspondiente
            if (modelos.length === 0) {
                const opcionVacia = document.createElement("option");
                opcionVacia.textContent = "No hay modelos para esta marca";
                opcionVacia.disabled = true;
                modelo.appendChild(opcionVacia);
                return;
            }

            // Recorre todos los modelos de la marca y los pone como opciones en el select
            modelos.forEach(m => {
                const opcion = document.createElement("option");
                opcion.textContent = m.modelo;
                opcion.value = m._id;

                // Si el modelo seleccionado es el mismo que el del parámetro, se selecciona
                if (m._id === modeloSeleccionadoId) {
                    opcion.selected = true;
                }
                modelo.appendChild(opcion);
            });
        } catch (error) {
            console.error("Error:", error);
        }
    }

    // Se ejecuta cuando la página se carga, si ya hay un modelo seleccionado, lo carga
    if (marca?.value) {
        await cargarModelos(marca.value, modelo.dataset.selectedModelo);
    }

    // Se ejecuta cuando el usuario cambia la marca, carga los modelos de la nueva marca
    marca?.addEventListener("change", e => cargarModelos(e.target.value));
});