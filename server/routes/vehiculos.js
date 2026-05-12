import { Router } from 'express';
import { Vehiculo, Marca, Modelo } from '../models/vehiculo.js';

let router = Router();

/**
 * Obtiene todos los vehículos
 */
router.get('/', async (req, res) => {
    const marcas = await Marca.find();
    const vehiculos = await Vehiculo.find().populate('marca').populate('modelo');
    res.render('inicio.njk', { marcas, vehiculos });
});


/**
 * Formulario de alta
 */
router.get('/nuevo', (req, res) => {
    res.render('nuevo_coche');
});

/**
 * Formulario de edición de un vehículo
 */
router.get('/editar/:id', (req, res) => {
    Vehiculo.findById(req.params.id)
        .then(resultado => {
            if (resultado) {
                res.render('vehiculos_editar', { vehiculo: resultado });
            } else {
                res.render('error', { error: "Vehículo no encontrado" });
            }
        })
        .catch(error => {
            res.render('error', { error: "Vehículo no encontrado" });
        });
});

// Resultados de búsqueda
router.get('/catalogo', async (req, res) => {
    const { texto, marca, combustible, tipo, orden } = req.query;

    let filtro = {};

    if (texto) {
        filtro['$or'] = [];
    }

    if (marca) {
        filtro.marca = marca;
    }

    if (combustible) {
        filtro.combustible = combustible;
    }

    if (tipo) {
        filtro.tipo = tipo;
    }

    let ordenacion = {};

    if (orden === 'precio_asc') {
        ordenacion.precio = 1;
    }

    if (orden === 'precio_desc') {
        ordenacion.precio = -1;
    }

    if (orden === 'año_asc') {
        ordenacion.año = 1;
    }

    if (orden === 'año_desc') {
        ordenacion.año = -1;
    }

    const vehiculos = await Vehiculo.find(filtro)
        .populate('marca').populate('modelo')
        .sort(ordenacion);

    const marcas = await Marca.find();
    res.render('catalogo.njk', { vehiculos, marcas, query: req.query });
});

/**
 * Ficha de vehículo
 */
router.get('/:id', (req, res) => {
    Vehiculo.findById(req.params.id)
        .then(resultado => {
            if (resultado) {
                res.render('vehiculos_ficha', { vehiculo: resultado });
            } else {
                res.render('error', { error: "Vehículo no encontrado" });
            }
        })
        .catch(error => {
            res.render('error', { error: "Error al obtener el vehículo" });
        });
});

/**
 * Crea un vehículo
 */
router.post('/', (req, res) => {

    let nuevoVehiculo = new Vehiculo({
        matricula: req.body.matricula,
        marca: req.body.marca,
        modelo: req.body.modelo,
        precio: req.body.precio,
        cv: req.body.cv,
        km: req.body.km,
        cilindrada: req.body.cilindrada,
        año: req.body.año,
        combustible: req.body.combustible,
        tipo: req.body.tipo,
        subtipo: req.body.subtipo
    });

    nuevoVehiculo.save()
        .then(resultado => {
            res.redirect(req.baseUrl);
        })
        .catch(error => {

            let errores = Object.keys(error.errors || {});
            let mensaje = "";

            if (errores.length > 0) {
                errores.forEach(clave => {
                    mensaje += '<p>' + error.errors[clave].message + '</p>';
                });
            } else if (error.code === 11000) {
                mensaje = 'Ya existe un vehículo con esa matrícula';
            } else {
                mensaje = 'Error añadiendo vehículo';
            }

            res.render('error', { error: mensaje });
        });
});

/**
 * Borra un vehículo
 */
router.delete('/:id', (req, res) => {
    Vehiculo.findByIdAndDelete(req.params.id)
        .then(resultado => {
            res.redirect(req.baseUrl);
        })
        .catch(error => {
            res.render('error', { error: "Error borrando vehículo" });
        });
});

/**
 * Edita un vehículo
 */
router.put('/:id', (req, res) => {
    Vehiculo.findByIdAndUpdate(req.params.id, {
        $set: {
            matricula: req.body.matricula,
            marca: req.body.marca,
            modelo: req.body.modelo,
            precio: req.body.precio,
            cv: req.body.cv,
            km: req.body.km,
            cilindrada: req.body.cilindrada,
            año: req.body.año,
            combustible: req.body.combustible,
            tipo: req.body.tipo,
            subtipo: req.body.subtipo
        }
    })
        .then(resultado => {
            res.redirect(req.baseUrl);
        })
        .catch(error => {
            res.render('error', { error: "Error modificando vehículo" });
        });
});

export default router;