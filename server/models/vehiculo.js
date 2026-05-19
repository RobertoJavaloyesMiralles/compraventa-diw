import mongoose from 'mongoose';

let vehiculoSchema = new mongoose.Schema({
    matricula: {
        type: String,
        required: true
    },
    marca: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "marca",
        required: true
    }
});

/**
 * Esquema de Vehículo con relación a Marca y Modelo.
 */
let vehiculoSchema = new mongoose.Schema({
    matricula: {
        type: String,
        required: true,
        match: /^[0-9]{4}[A-Z]{3}$/,
        unique: true,
        trim: true,
        uppercase: true
    },
    marca: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "marca",
        required: true
    },
    modelo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "modelo",
        required: true
    },
    precio: {
        type: Number,
        required: true,
        min: 0,
    },
    cv: {
        type: Number,
        required: true,
        min: 0
    },
    km: {
        type: Number,
        required: true,
        min: 0
    },
    cilindrada: {
        type: Number,
        required: true,
        min: 0
    },
    anio: {
        type: Number,
        required: true,
        min: 1950
    },
    combustible: {
        type: String,
        required: true,
        enum: ["diesel", "gasolina", "electrico"]
    },
    tipo: {
        type: String,
        required: true,
        enum: ["Coche", "Moto"]
    },
    subtipo: {
        type: String,
        required: true,
        enum: ["Deportivo", "SUV", "Compacto", "Sedán", "Trial", "Trail", "Moto-Cross", "Scooter", "Deportiva"]        
    }
});

const Vehiculo = mongoose.model('vehiculo', vehiculoSchema);
const Marca = mongoose.model('marca', marcaSchema);
const Modelo = mongoose.model('modelo', modeloSchema);

export default Vehiculo;

export { Vehiculo, Marca, Modelo };
