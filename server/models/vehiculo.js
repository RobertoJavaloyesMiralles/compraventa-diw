import mongoose from 'mongoose';

let vehiculoSchema = new mongoose.Schema({
    matricula: {
        type: String,
        required: true
    },
    marca: {
        type: String,
        required: true
    },
    modelo: {
        type: String,
        required: true
    },
    precio: {
        type: Number,
        min: 0,
    },
    cv: {
        type: Number,
        min: 0
    },
    km: {
        type: Number,
        min: 0
    },
    cilindrada: {
        type: Number,
        min: 0
    },
    año: {
        type: Number,
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


let Vehiculo = mongoose.model('vehiculo', vehiculoSchema);
export default Vehiculo;
