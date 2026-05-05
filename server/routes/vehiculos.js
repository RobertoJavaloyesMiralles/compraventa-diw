import { Router } from 'express';
import { Vehiculo } from '../models/vehiculo.js';

let router = Router();

router.get('/', (req, res) => {
    Vehiculo.find().then(resultado => {
        res.render('vehiculos', { vehiculos: resultado });
        // res.json(resultado); // Prueba postmnan
    }).catch(error => {
        // res.status(500).json({ error: 'Error al obtener los vehículos' });
        res.render('error', { message: 'Error al obtener los vehículos' });
    });
});

export default router;