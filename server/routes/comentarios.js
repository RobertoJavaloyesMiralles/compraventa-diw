import { Router } from 'express';
import Vehiculo from '../models/vehiculo.js';


let router = Router({ mergeParams: true });

// POST /compraventa/vehiculos/:id/comentarios
router.post('/', async (req, res) => {
    try {
        let vehiculo = await Vehiculo.findById(req.params.id);
        if (!vehiculo) return res.status(404).send('Vehículo no encontrado');

        let { nick, texto, valoracion } = req.body;

        vehiculo.comentarios.push({ nick, texto, valoracion });
        await vehiculo.save();

        res.redirect(`/compraventa/vehiculos/${req.params.id}`);
    } catch (err) {
        res.status(500).send('Error al añadir comentario: ' + err.message);
    }
});

export default router;

