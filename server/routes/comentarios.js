import { Router } from 'express';
import Comentario from '../models/comentario.js';
import Vehiculo from '../models/vehiculo.js';

let router = Router({ mergeParams: true });

router.get('/', async (req, res) => {
    try {
        const vehiculoId = req.params.id;

        const vehiculo = await Vehiculo.findById(vehiculoId).lean();
        if (!vehiculo) return res.status(404).json({ error: 'Vehículo no encontrado' });

        const comentarios = await Comentario.find({ vehiculo: vehiculoId })
            .sort({ fecha: -1 })
            .lean();

        let valoracionMedia = null;
        if (comentarios.length > 0) {
            const total = comentarios.reduce((suma, c) => suma + c.valoracion, 0);
            valoracionMedia = +(total / comentarios.length).toFixed(1);
        }

        res.json({ comentarios, valoracionMedia, total: comentarios.length });

    } catch (err) {
        res.status(500).json({ error: 'Error al obtener comentarios: ' + err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const vehiculoId = req.params.id;

        const vehiculo = await Vehiculo.findById(vehiculoId).lean();
        if (!vehiculo) return res.status(404).json({ error: 'Vehículo no encontrado' });

        const { nick, texto, valoracion } = req.body;

        const comentario = new Comentario({
            vehiculo: vehiculoId,
            nick,
            texto,
            valoracion: Number(valoracion)
        });

        await comentario.save();
        res.redirect(`/detalle/${vehiculoId}`);

    } catch (err) {
        if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
        res.status(500).json({ error: 'Error al crear comentario: ' + err.message });
    }
});

router.put('/:cid', async (req, res) => {
    try {
        const { id: vehiculoId, cid } = req.params;
        const { nick, texto, valoracion } = req.body;

        const comentario = await Comentario.findOne({ _id: cid, vehiculo: vehiculoId });
        if (!comentario) return res.status(404).json({ error: 'Comentario no encontrado' });

        if (nick !== undefined) comentario.nick = nick;
        if (texto !== undefined) comentario.texto = texto;
        if (valoracion !== undefined) comentario.valoracion = Number(valoracion);

        await comentario.save();
        res.redirect(`/detalle/${vehiculoId}`);

    } catch (err) {
        if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
        res.status(500).json({ error: 'Error al editar comentario: ' + err.message });
    }
});

router.delete('/:cid', async (req, res) => {
    try {
        const { id: vehiculoId, cid } = req.params;

        const comentario = await Comentario.findOneAndDelete({ _id: cid, vehiculo: vehiculoId });
        if (!comentario) return res.status(404).json({ error: 'Comentario no encontrado' });

        res.redirect(`/detalle/${vehiculoId}`);

    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar comentario: ' + err.message });
    }
});

export default router;