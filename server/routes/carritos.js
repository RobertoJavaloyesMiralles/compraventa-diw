import { Router } from 'express';
import CarroCompra from '../models/carroCompra.js';
import { Vehiculo } from '../models/vehiculo.js';
import { autenticacion } from './usuarios.js';

let router = Router();

/**
 * Obtiene el carrito del usuario.
 */
router.get('/', autenticacion, async (req, res) => {
    try {
        const usuarioSesion = req.session.usuario;
        const carrito = await CarroCompra.find({ usuario: usuarioSesion._id }).populate('vehiculo');
        
        // Suma el precio de todos los vehículos que tiene el usuario en el carrito.
        let total = 0;
        carrito.forEach(item => {
            if (item.vehiculo && item.vehiculo.precio) {
                total += item.vehiculo.precio;
            }
        });

        res.render('carrito', { carrito, total });
    } catch (error) {
        res.render('error', { error: 'Error cargando el carrito' });
    }
});

/**
 * Añade un vehículo al carrito.
 */
router.post('/add/:id', autenticacion, async (req, res) => {
    try {
        const vehiculoID = req.params.id;
        const usuarioSesion = req.session.usuario;
        
        const coche = await Vehiculo.findById(vehiculoID);
        // Hace q el usuario no pueda añadir su propio coche al carrito
        if (coche && coche.usuario && coche.usuario.toString() === usuarioSesion._id.toString()) {
            return res.redirect('/detalle/' + vehiculoID);
        }

        // Comprueba si ya está en el carrito
        const existe = await CarroCompra.findOne({ usuario: usuarioSesion._id, vehiculo: vehiculoID });

        // Si no existe, lo añade al carrito.
        if (!existe) {
            const nuevoCarrito = new CarroCompra({
                usuario: usuarioSesion._id,
                vehiculo: vehiculoID
            });
            await nuevoCarrito.save();
        }
        // Redirige de vuelta a la página anterior o al carrito
        res.redirect('/carrito');
    } catch (error) {
        console.error("Error al añadir al carrito:", error);
        res.render('error', { error: 'Error añadiendo al carrito' });
    }
});

/**
 * Elimina un vehículo del carrito.
 */
router.delete('/remove/:id', autenticacion, async (req, res) => {
    try {
        const vehiculoID = req.params.id;
        const usuarioSesion = req.session.usuario;
        
        await CarroCompra.findOneAndDelete({ usuario: usuarioSesion._id, vehiculo: vehiculoID });

        res.redirect('/carrito');
    } catch (error) {
        res.render('error', { error: 'Error eliminando del carrito' });
    }
});

export default router;