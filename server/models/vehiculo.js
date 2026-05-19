import mongoose from 'mongoose';
/**
 * Esquema de Vehículo con relación a Marca y Modelo.
 */

let marcaSchema = new mongoose.Schema({
    marca: {
        type: String,
        required: true
    }
});

let modeloSchema = new mongoose.Schema({
    modelo: {
        type: String,
        required: true
    },
    marca: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "marca",
        required: true
    }
});

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
    año: {
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
