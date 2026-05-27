import mongoose from 'mongoose';
/**
 * Modelo de Vehículo
 */

/**
 * Esquema de Marca.
 */
let marcaSchema = new mongoose.Schema({
    marca: {
        type: String,
        required: [true, "La marca es obligatoria"],
        trim: true
    }
});

/**
 * Esquema de Modelo.
 */
let modeloSchema = new mongoose.Schema({
    modelo: {
        type: String,
        required: [true, "El modelo es obligatorio"],
        trim: true
    },
    marca: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "marca",
        required: [true, "La marca es obligatoria"]
    }
});

let vehiculoSchema = new mongoose.Schema({
    matricula: {
        type: String,
        required: [true, "La matrícula es obligatoria"],
        match: [/^\d{4}[A-Z]{3}$/, "La matrícula debe tener el formato 1234ABC"],
        unique: true,
        trim: true,
        uppercase: true
    },
    marca: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "marca",
        required: [true, "La marca es obligatoria"]
    },
    modelo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "modelo",
        required: [true, "El modelo es obligatorio"]
    },
    precio: {
        type: Number,
        required: [true, "El precio es obligatorio"],
        min: [0, "El precio no puede ser negativo"],
    },
    cv: {
        type: Number,
        required: [true, "Los cv son obligatorios"],
        min: [0, "Los caballos de potencia no pueden ser negativos"]
    },
    km: {
        type: Number,
        required: [true, "Los km son obligatorios"],
        min: [0, "Los kilómetros no pueden ser negativos"]
    },
    cilindrada: {
        type: Number,
        required: [true, "La cilindrada es obligatoria"],
        min: [0, "La cilindrada no puede ser negativa"]
    },
    anio: {
        type: Number,
        required: [true, "El año es obligatorio"],
        min: [1950, "El año de fabricación no puede ser anterior a 1950"]
    },
    combustible: {
        type: String,
        required: [true, "El tipo de combustible es obligatorio"],
        enum: ["diesel", "gasolina", "electrico"]
    },
    tipo: {
        type: String,
        required: [true, "El tipo de vehículo es obligatorio"],
        enum: ["Coche", "Moto"]
    },
    subtipo: {
        type: String,
        required: [true, "El subtipo es obligatorio"],
        enum: ["Deportivo", "SUV", "Compacto", "Sedán", "Trial", "Trail", "Moto-Cross", "Scooter", "Deportiva"]
    },
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "usuario",
        required: [true, "El usuario creador es obligatorio"]
    }
});

const Vehiculo = mongoose.model('vehiculo', vehiculoSchema);
const Marca = mongoose.model('marca', marcaSchema);
const Modelo = mongoose.model('modelo', modeloSchema);

export default Vehiculo;

export { Vehiculo, Marca, Modelo };
