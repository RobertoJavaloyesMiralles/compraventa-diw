// bbdd.js — ejecutar con: node bbdd.js
// Mete datos de prueba completos en la base de datos

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { Vehiculo, Marca, Modelo } from './server/models/vehiculo.js';
import Usuario from './server/models/usuario.js';
import Comentario from './server/models/comentario.js';

await mongoose.connect('mongodb://127.0.0.1:27017/compraventa');
console.log('MongoDB conectado');

// Limpiar colecciones
await Promise.all([
    Vehiculo.deleteMany(),
    Marca.deleteMany(),
    Modelo.deleteMany(),
    Usuario.deleteMany(),
    Comentario.deleteMany()
]);
console.log('Colecciones limpiadas');

// ── Usuarios ────────────────────────────────────────────────
const passAdmin = await bcrypt.hash('admin1234', 10);
const passUser  = await bcrypt.hash('user1234', 10);

const [admin, ivan, david, roberto] = await Usuario.insertMany([
    { nombre: 'Admin', email: 'admin@compraventa.com', password: passAdmin, rol: 'admin' },
    { nombre: 'Ivan', email: 'ivan@compraventa.com', password: passUser, rol: 'user' },
    { nombre: 'David', email: 'david@compraventa.com', password: passUser, rol: 'user' },
    { nombre: 'Roberto', email: 'roberto@compraventa.com', password: passUser, rol: 'user' }
]);
console.log('Usuarios creados');

// ── Marcas ───────────────────────────────────────────────────
const [toyota, bmw, ford, seat, honda, yamaha] = await Marca.insertMany([
    { marca: 'Toyota' },
    { marca: 'BMW' },
    { marca: 'Ford' },
    { marca: 'SEAT' },
    { marca: 'Honda' },
    { marca: 'Yamaha' }
]);
console.log('Marcas creadas');

// ── Modelos ──────────────────────────────────────────────────
const [corolla, rav4, serie3, x5, focus, fiesta, ibiza, leon, cbr, mt07] = await Modelo.insertMany([
    { modelo: 'Corolla',  marca: toyota._id },
    { modelo: 'RAV4',     marca: toyota._id },
    { modelo: 'Serie 3',  marca: bmw._id },
    { modelo: 'X5',       marca: bmw._id },
    { modelo: 'Focus',    marca: ford._id },
    { modelo: 'Fiesta',   marca: ford._id },
    { modelo: 'Ibiza',    marca: seat._id },
    { modelo: 'León',     marca: seat._id },
    { modelo: 'CBR 600',  marca: honda._id },
    { modelo: 'MT-07',    marca: yamaha._id }
]);
console.log('Modelos creados');

// ── Vehículos ─────────────────────────────────────────────────
const vehiculos = await Vehiculo.insertMany([
    { matricula: '1234ABC', marca: toyota._id, modelo: corolla._id, precio: 14500, cv: 120, km: 52000, cilindrada: 1600, anio: 2019, combustible: 'gasolina', tipo: 'Coche', subtipo: 'Compacto',   usuario: admin._id },
    { matricula: '2345BCD', marca: toyota._id, modelo: rav4._id,    precio: 27000, cv: 180, km: 31000, cilindrada: 2000, anio: 2021, combustible: 'gasolina', tipo: 'Coche', subtipo: 'SUV',        usuario: admin._id },
    { matricula: '3456CDE', marca: bmw._id,    modelo: serie3._id,  precio: 33000, cv: 184, km: 20000, cilindrada: 2000, anio: 2022, combustible: 'diesel',   tipo: 'Coche', subtipo: 'Sedán',      usuario: admin._id },
    { matricula: '4567DEF', marca: bmw._id,    modelo: x5._id,      precio: 55000, cv: 265, km: 15000, cilindrada: 3000, anio: 2023, combustible: 'diesel',   tipo: 'Coche', subtipo: 'SUV',        usuario: ivan._id },
    { matricula: '5678EFG', marca: ford._id,   modelo: focus._id,   precio: 11000, cv: 100, km: 89000, cilindrada: 1400, anio: 2017, combustible: 'gasolina', tipo: 'Coche', subtipo: 'Compacto',   usuario: ivan._id },
    { matricula: '6789FGH', marca: ford._id,   modelo: fiesta._id,  precio:  9500, cv:  85, km: 112000,cilindrada: 1200, anio: 2016, combustible: 'gasolina', tipo: 'Coche', subtipo: 'Compacto',   usuario: ivan._id },
    { matricula: '7890GHI', marca: seat._id,   modelo: ibiza._id,   precio:  8900, cv:  95, km: 76000, cilindrada: 1200, anio: 2018, combustible: 'gasolina', tipo: 'Coche', subtipo: 'Compacto',   usuario: david._id },
    { matricula: '8901HIJ', marca: seat._id,   modelo: leon._id,    precio: 16500, cv: 150, km: 44000, cilindrada: 1800, anio: 2020, combustible: 'diesel',   tipo: 'Coche', subtipo: 'Deportivo',  usuario: david._id },
    { matricula: '9012IJK', marca: honda._id,  modelo: cbr._id,     precio: 7200,  cv: 110, km: 18000, cilindrada:  600, anio: 2020, combustible: 'gasolina', tipo: 'Moto',  subtipo: 'Deportiva',  usuario: david._id },
    { matricula: '0123JKL', marca: yamaha._id, modelo: mt07._id,    precio: 6800,  cv:  73, km: 22000, cilindrada:  700, anio: 2021, combustible: 'gasolina', tipo: 'Moto',  subtipo: 'Trial',      usuario: david._id },
    { matricula: '1357KLM', marca: toyota._id, modelo: corolla._id, precio: 12000, cv: 110, km: 95000, cilindrada: 1600, anio: 2015, combustible: 'gasolina', tipo: 'Coche', subtipo: 'Sedán',      usuario: roberto._id },
    { matricula: '2468LMN', marca: bmw._id,    modelo: serie3._id,  precio: 41000, cv: 252, km:  8000, cilindrada: 2000, anio: 2023, combustible: 'gasolina', tipo: 'Coche', subtipo: 'Deportivo',  usuario: roberto._id },
]);
console.log('Vehículos creados');

// ── Comentarios ───────────────────────────────────────────────
await Comentario.insertMany([
    { vehiculo: vehiculos[0]._id, usuario: ivan._id, nick: 'Ivan',   texto: 'Muy buen coche, consumo bajo y cómodo en ciudad.',          valoracion: 4, fecha: new Date('2024-11-10') },
    { vehiculo: vehiculos[0]._id, usuario: david._id, nick: 'David',    texto: 'Lo conduje una semana, arranca genial y muy fiable.',        valoracion: 5, fecha: new Date('2024-12-01') },
    { vehiculo: vehiculos[0]._id,                     nick: 'Anónimo',  texto: 'Buen precio para los kilómetros que tiene.',                 valoracion: 3, fecha: new Date('2025-01-15') },
    { vehiculo: vehiculos[2]._id, usuario: ivan._id, nick: 'Ivan',   texto: 'El BMW Serie 3 es una pasada, acabados de lujo.',            valoracion: 5, fecha: new Date('2024-10-20') },
    { vehiculo: vehiculos[2]._id,                     nick: 'Pepe',     texto: 'Caro de mantener pero una maravilla de conducir.',           valoracion: 4, fecha: new Date('2025-02-05') },
    { vehiculo: vehiculos[4]._id, usuario: david._id, nick: 'David',    texto: 'Para el precio está muy bien, algo viejo pero cumple.',      valoracion: 3, fecha: new Date('2025-01-20') },
    { vehiculo: vehiculos[7]._id,                     nick: 'Marcos',   texto: 'El León diésel es muy eficiente en carretera.',              valoracion: 4, fecha: new Date('2025-03-01') },
    { vehiculo: vehiculos[8]._id, usuario: ivan._id, nick: 'Ivan',   texto: 'La CBR es una bestia, ideal para circuito.',                 valoracion: 5, fecha: new Date('2025-02-14') },
    { vehiculo: vehiculos[9]._id,                     nick: 'Motero',   texto: 'La MT-07 engancha mucho, muy versátil para ciudad y monta.', valoracion: 5, fecha: new Date('2025-03-10') },
    { vehiculo: vehiculos[11]._id, usuario: david._id, nick: 'David',   texto: 'El BMW casi nuevo merece cada euro, espectacular.',          valoracion: 5, fecha: new Date('2025-04-01') },
]);
console.log('Comentarios creados');

console.log('\n✅ Seed completado');
console.log('👤 Admin:  admin@compraventa.com  /  admin1234');
console.log('👤 Carlos: ivan@compraventa.com /  user1234');
console.log('👤 Laura:  david@compraventa.com  /  user1234');
console.log('👤 Roberto: roberto@compraventa.com  /  user1234');


await mongoose.disconnect();