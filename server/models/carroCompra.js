import mongoose from "mongoose";

/**
 * Modelo de carrito de la compra
 */
const carritoSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'usuario',
        required: true
    },
    vehiculo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'vehiculo',
        required: true
    }
})

const CarroCompra = mongoose.model('carrito', carritoSchema);
export default CarroCompra;