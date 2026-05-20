import { Router } from 'express';
import { Vehiculo, Marca, Modelo } from '../models/vehiculo.js';
import Comentario from '../models/comentario.js';

let router = Router();

/**
 * Obtiene todos los vehículos
 */
router.get('/', async (req, res) => {
    const marcas = await Marca.find();
    const vehiculos = await Vehiculo.find().populate('marca').populate('modelo');
    res.render('inicio', { marcas, vehiculos });
});


/**
 * Formulario de alta
 */
router.get('/nuevo', async (req, res) => {
    const marcas = await Marca.find();
    const modelos = await Modelo.find();
    res.render('vehiculo_nuevo', { marcas, modelos });
});

/**
 * Formulario de edición de un vehículo
 */
router.get('/editar/:id', async (req, res) => {
    try {
        const resultado = await Vehiculo.findById(req.params.id);
        if (resultado) {
            res.render('vehiculos_editar', { vehiculo: resultado });
        } else {
            res.render('error', { error: "Vehículo no encontrado" });
        }
    } catch (error) {
        res.render('error', { error: "Vehículo no encontrado" });
    }
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

    if (orden === 'anio_asc') {
        ordenacion.anio = 1;
    }

    if (orden === 'anio_desc') {
        ordenacion.anio = -1;
    }

    const vehiculos = await Vehiculo.find(filtro)
        .populate('marca').populate('modelo')
        .sort(ordenacion);

    const marcas = await Marca.find();
    res.render('catalogo', { vehiculos, marcas, query: req.query });
});

/**
 * Ficha de vehículo
 */
router.get('/detalle/:id', async (req, res) => {
    try {
        const vehiculo = await Vehiculo.findById(req.params.id)
            .populate('marca')
            .populate('modelo');

        if (!vehiculo) return res.render('error', { error: 'Vehículo no encontrado' });

        const comentarios = await Comentario.find({ vehiculo: req.params.id })
            .sort({ fecha: -1 })
            .lean();

        let valoracionMedia = null;
        if (comentarios.length > 0) {
            const total = comentarios.reduce((suma, c) => suma + c.valoracion, 0);
            valoracionMedia = +(total / comentarios.length).toFixed(1);
        }

        // 3 vehículos aleatorios excluyendo el actual
        const recomendaciones = await Vehiculo.aggregate([
            { $match: { _id: { $ne: vehiculo._id } } },
            { $sample: { size: 3 } }
        ]);

        // aggregate devuelve objetos planos, populate manual para marca y modelo
        await Vehiculo.populate(recomendaciones, [
            { path: 'marca' },
            { path: 'modelo' }
        ]);

        res.render('detalle.njk', {
            vehiculo,
            comentarios,
            valoracionMedia,
            totalComentarios: comentarios.length,
            recomendaciones
        });

    } catch (err) {
        res.render('error', { error: 'Error al cargar el vehículo: ' + err.message });
    }
});

/**
 * Crea un vehículo
 */
router.post('/', async (req, res) => {
    try {
        let nuevoVehiculo = new Vehiculo({
            matricula: req.body.matricula,
            marca: req.body.marca,
            modelo: req.body.modelo,
            precio: req.body.precio,
            cv: req.body.cv,
            km: req.body.km,
            cilindrada: req.body.cilindrada,
            anio: req.body.anio,
            combustible: req.body.combustible,
            tipo: req.body.tipo,
            subtipo: req.body.subtipo
        });

        await nuevoVehiculo.save();
        res.redirect('/');
        
    } catch (error) {
        const marcas = await Marca.find();
        const modelos = await Modelo.find();
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

        res.render('vehiculo_nuevo', { error: mensaje, marcas, modelos, vehiculo: req.body });
    }
});

/**
 * Borra un vehículo
 */
router.delete('/:id', async (req, res) => {
    try {
        await Vehiculo.findByIdAndDelete(req.params.id);
        res.redirect('/');
    } catch (error) {
        res.render('error', { error: "Error borrando vehículo" });
    }
});

/**
 * Edita un vehículo
 */
router.put('/:id', async (req, res) => {
    try {
        await Vehiculo.findByIdAndUpdate(req.params.id, {
            $set: {
                matricula: req.body.matricula,
                marca: req.body.marca,
                modelo: req.body.modelo,
                precio: req.body.precio,
                cv: req.body.cv,
                km: req.body.km,
                cilindrada: req.body.cilindrada,
                anio: req.body.anio,
                combustible: req.body.combustible,
                tipo: req.body.tipo,
                subtipo: req.body.subtipo
            }
        });
        res.redirect('/');
    } catch (error) {
        let errores = Object.keys(error.errors || {});
        let mensaje = "";

        if (errores.length > 0) {
            errores.forEach(clave => {
                mensaje += '<p>' + error.errors[clave].message + '</p>';
            });
        } else if (error.code === 11000) {
            mensaje = 'Ya existe un vehículo con esa matrícula';
        } else {
            mensaje = 'Error modificando vehículo';
        }
        
        const marcas = await Marca.find();
        const modelos = await Modelo.find();
        res.render('vehiculos_editar', { 
            error: mensaje, 
            vehiculo: { ...req.body, _id: req.params.id }, 
            marcas, 
            modelos 
        });
    }
});

export default router;