import mongoose from 'mongoose';

/**
 * Esquema de Usuario.
 */
let usuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, "El nombre es obligatorio"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "El email es obligatorio"],
        unique: true,
        trim: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "El email introducido no es válido"]
    },
    password: {
        type: String,
        required: [true, "La contraseña es obligatoria"],
        minlength: [4, "La contraseña debe tener al menos 4 caracteres"],
    },
    rol: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    }
});

const Usuario = mongoose.model('usuario', usuarioSchema);

export default Usuario;