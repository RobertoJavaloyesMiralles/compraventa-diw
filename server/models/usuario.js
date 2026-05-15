import mongoose from 'mongoose';

/** * Esquema de Usuario.
 */
let usuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 4,
    },
    rol: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    }
});

const Usuario = mongoose.model('usuario', usuarioSchema);

export default Usuario;