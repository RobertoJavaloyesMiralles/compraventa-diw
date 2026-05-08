<<<<<<< HEAD
import { Router } from 'express';
import Usuario from '../models/usuarios.js';

let router = Router();

=======
import { Router } from "express";
import { Vehiculo, Marca, Modelo } from '../models/vehiculo.js';

let router = Router();

// Página de inicio donde estará el buscador
router.get('/', async (req, res) => {
    const marcas = await Marca.find();
    res.render('inicio.njk', { marcas });
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

>>>>>>> main
export default router;