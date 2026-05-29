import { Router } from 'express';
import { Vehiculo, Marca, Modelo } from '../models/vehiculo.js';
import Comentario from '../models/comentario.js';
import { autenticacion, rol } from './usuarios.js';
let router = Router();

/**
 * Obtiene todos los vehículos
 */
router.get('/', async (req, res) => {
    try {
        const marcas = await Marca.find().sort({ marca: 1 });
        const vehiculos = await Vehiculo.find().populate('marca').populate('modelo');
        res.render('inicio', { marcas, vehiculos });
    } catch (error) {
        res.render('error', { error: 'Error al cargar los vehículos' });
    }
});


/**
 * Obtiene los modelos de una marca específica.
 */
router.get('/modelos/:marcaID', async (req, res) => {
    try {
        const modelos = await Modelo.find({ marca: req.params.marcaID }).sort({ modelo: 1 });
        res.json(modelos);
    } catch (error) {
        res.render('error', { error: 'Error al cargar los modelos' });
    }
});

/**
 * Formulario de alta
 */
router.get('/nuevo', autenticacion, async (req, res) => {
    try {
        const marcas = await Marca.find().sort({ marca: 1 });
        const modelos = await Modelo.find().sort({ modelo: 1 });
        res.render('vehiculo_nuevo', { marcas, modelos });
    } catch (error) {
        res.render('error', { error: 'Error al cargar el formulario' });
    }
});

/**
 * Formulario de edición de un vehículo
 */
router.get('/editar/:id', autenticacion, async (req, res) => {
    try {
        const resultado = await Vehiculo.findById(req.params.id).populate('marca').populate('modelo');
        const marcas = await Marca.find().sort({ marca: 1 });
        const modelos = await Modelo.find().sort({ modelo: 1 });
        if (resultado) {
            if (req.session.usuario.rol === 'admin' || (resultado.usuario && resultado.usuario.toString() === req.session.usuario._id.toString())) {
                res.render('vehiculo_editar', { vehiculo: resultado, marcas, modelos });
            } else {
                res.render('error', { error: "No tienes permiso para editar este vehículo" });
            }
        } else {
            res.render('error', { error: "Vehículo no encontrado" });
        }
    } catch (error) {
        res.render('error', { error: "Vehículo no encontrado" });
    }
});

// Resultados de búsqueda
router.get('/catalogo', async (req, res) => {
    try {
        const { texto, marca, combustible, tipo, orden } = req.query;
        const pagina = parseInt(req.query.pagina) || 1;
        const limite = 3;
        const saltar = (pagina - 1) * limite;

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

        const totalVehiculos = await Vehiculo.countDocuments(filtro);
        const totalPaginas = Math.ceil(totalVehiculos / limite);

        const vehiculos = await Vehiculo.find(filtro)
            .populate('marca').populate('modelo')
            .sort(ordenacion)
            .skip(saltar)
            .limit(limite);

        const marcas = await Marca.find().sort({ marca: 1 });
        res.render('catalogo', { vehiculos, marcas, query: req.query, pagina, totalPaginas, totalVehiculos });
    } catch (error) {
        res.render('error', { error: 'Error al cargar el catálogo' });
    }
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
        // Formatear fecha de comentarios
        comentarios.forEach(c => {
            const d = new Date(c.fecha);
            c.fechaFormateada = d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        });

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

        res.render('detalle', {
            vehiculo,
            comentarios,
            valoracionMedia,
            totalComentarios: comentarios.length,
            recomendaciones
        });

    } catch (error) {
        res.render('error', { error: 'Error al cargar el vehículo: ' + error.message });
    }
});

/**
 * Crea un vehículo
 */
router.post('/', autenticacion, async (req, res) => {
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
            subtipo: req.body.subtipo,
            usuario: req.session.usuario._id
        });

        await nuevoVehiculo.save();
        res.redirect('/detalle/' + nuevoVehiculo._id);
    } catch (error) {
        const marcas = await Marca.find().sort({ marca: 1 });
        const modelos = await Modelo.find().sort({ modelo: 1 });
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
router.delete('/:id', autenticacion, async (req, res) => {
    try {
        const vehiculo = await Vehiculo.findById(req.params.id);
        if (!vehiculo) {
            return res.render('error', { error: "Vehículo no encontrado" });
        }
        if (req.session.usuario.rol === 'admin' || (vehiculo.usuario && vehiculo.usuario.toString() === req.session.usuario._id.toString())) {
            await Vehiculo.findByIdAndDelete(req.params.id);
            res.redirect('/');
        } else {
            res.render('error', { error: "No tienes permiso para borrar este vehículo" });
        }
    } catch (error) {
        res.render('error', { error: "Error borrando vehículo" });
    }
});

/**
 * Edita un vehículo
 */
router.put('/:id', autenticacion, async (req, res) => {
    try {
        const vehiculo = await Vehiculo.findById(req.params.id);
        if (!vehiculo) {
            return res.render('error', { error: "Vehículo no encontrado" });
        }
        if (req.session.usuario.rol === 'admin' || (vehiculo.usuario && vehiculo.usuario.toString() === req.session.usuario._id.toString())) {
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
            }, { runValidators: true }); // Para aplicar las validaciones
            res.redirect('/detalle/' + req.params.id);
        } else {
            res.render('error', { error: "No tienes permiso para editar este vehículo" });
        }
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

        const marcas = await Marca.find().sort({ marca: 1 });
        const modelos = await Modelo.find().sort({ modelo: 1 });
        res.render('vehiculo_editar', {
            error: mensaje,
            vehiculo: { ...req.body, _id: req.params.id },
            marcas,
            modelos
        });
    }
});

export default router;