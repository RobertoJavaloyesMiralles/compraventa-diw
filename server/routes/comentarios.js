import { Router } from 'express';
import Comentario from '../models/comentario.js';
import Vehiculo from '../models/vehiculo.js';
 

let router = Router({ mergeParams: true });


router.get('/', async (req, res) => {
    try {
        const vehiculoId = req.params.id;
 
        // Comprobamos que el vehículo existe antes de buscar comentarios.
        // Si el id está mal formado, findById lanza CastError y lo captura el catch.
        const vehiculo = await Vehiculo.findById(vehiculoId).lean();
        if (!vehiculo)
            return res.status(404).json({ error: 'Vehículo no encontrado' });
 
        // Ordenamos por fecha descendente: los más recientes primero.
        // .lean() devuelve objetos JS planos en lugar de documentos Mongoose,
        // lo que es más rápido para lecturas puras (sin .save() posterior).
        const comentarios = await Comentario.find({ vehiculo: vehiculoId })
            .sort({ fecha: -1 })
            .lean();
 
        // Calculamos la media aquí en el servidor para no delegar esa
        // lógica en la vista (las plantillas deben ser lo más tontas posible).
        let valoracionMedia = null;
        if (comentarios.length > 0) {
            const total = comentarios.reduce((suma, c) => suma + c.valoracion, 0);
            // toFixed(1) da un decimal, el + delante lo convierte de string a número
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
        if (!vehiculo)
            return res.status(404).json({ error: 'Vehículo no encontrado' });
 
        const { nick, texto, valoracion } = req.body;
 
        // Number() convierte el string que llega del formulario a número.
        // Si llegara vacío o no numérico, la validación del schema lo rechaza.
        const comentario = new Comentario({
            vehiculo: vehiculoId,
            nick,
            texto,
            valoracion: Number(valoracion)
            // 'fecha' no se envía: el schema la pone con Date.now automáticamente
            // 'usuario' no se envía: está vacío hasta que haya autenticación
        });
 
        await comentario.save();
 
        // Redirigimos de vuelta a la ficha del vehículo (patrón POST → redirect → GET).
        // Esto evita que al recargar la página se reenvíe el formulario.
        res.redirect(`/vehiculos/${vehiculoId}`);
 
    } catch (err) {
        if (err.name === 'ValidationError') {
            // Error de validación Mongoose (campo vacío, valoración fuera de rango…)
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: 'Error al crear comentario: ' + err.message });
    }
});
 
router.put('/:cid', async (req, res) => {
    try {
        const { id: vehiculoId, cid } = req.params;
        const { nick, texto, valoracion } = req.body;
 
        // Buscamos el comentario asegurándonos de que pertenece a ESTE vehículo.
        // Así no se puede editar un comentario de otro vehículo aunque se conozca su _id.
        const comentario = await Comentario.findOne({ _id: cid, vehiculo: vehiculoId });
        if (!comentario)
            return res.status(404).json({ error: 'Comentario no encontrado' });
 
        if (nick !== undefined) comentario.nick = nick;
        if (texto !== undefined) comentario.texto = texto;
        if (valoracion !== undefined) comentario.valoracion = Number(valoracion);
 
        await comentario.save();
 
        res.redirect(`/vehiculos/${vehiculoId}`);
 
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: 'Error al editar comentario: ' + err.message });
    }
});
 
router.delete('/:cid', async (req, res) => {
    try {
        const { id: vehiculoId, cid } = req.params;
 
        const comentario = await Comentario.findOneAndDelete({ _id: cid, vehiculo: vehiculoId });
        if (!comentario)
            return res.status(404).json({ error: 'Comentario no encontrado' });
 
        res.redirect(`/vehiculos/${vehiculoId}`);
 
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar comentario: ' + err.message });
    }
});
 
export default router;

