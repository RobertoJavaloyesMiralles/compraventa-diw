import mongoose from "mongoose";

const comentarioSchema = new mongoose.Schema({
    vehiculo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'vehiculo',
        required: true
    },
     usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'usuario'
    },
    nick: {
        type: String,
        required: true,
        trim: true,       // elimina espacios al inicio/final
        maxlength: 50
    },
    texto: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    valoracion: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    fecha: {
        type: Date,
        default: Date.now
    }
});

comentarioSchema.index({ vehiculo: 1, fecha: -1 });
 
const Comentario = mongoose.model('comentario', comentarioSchema);
export default Comentario;