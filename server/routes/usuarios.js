import { Router } from 'express';
import Usuario from '../models/usuario.js';
import bcrypt from 'bcrypt';

let router = Router();

/**
 * Obtiene todos los usuarios
 */
router.get('/', async (req, res) => {
    const usuarios = await Usuario.find();
    // res.render('usuarios', { usuarios });
    res.json(usuarios);
});

/**
 * Formulario de alta de usuario
 */
router.get('/nuevo', async (req, res) => {
    res.render('usuario_nuevo');
});

/**
 * Obtiene un usuario por id
 */
router.get('/:id', async (req, res) => {
    const usuario = await Usuario.findById(req.params.id);
    res.json(usuario);
});
/**
 * Crea un nuevo usuario.
 */
router.post('/registro', async (req, res) => {
    const { nombre, email, password, rol } = req.body;
    
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const nuevoUsuario = new Usuario({ nombre, email, password: hashedPassword, rol });
        await nuevoUsuario.save();
        res.redirect('/');
    } catch (error) {
        let errores = Object.keys(error.errors || {});
        let mensaje = "";

        if (errores.length > 0) {
            errores.forEach(clave => {
                mensaje += '<p>' + error.errors[clave].message + '</p>';
            });
        } else if (error.code === 11000) {
            mensaje = 'Ese correo electrónico ya está registrado';
        } else {
            mensaje = 'Error añadiendo usuario';
        }

        res.render('usuario_nuevo', { error: mensaje, datos: req.body });
    }
});

/**
 * Formulario de edición de un usuario
 */
router.get('/editar/:id', async (req, res) => {
    try {
        const resultado = await Usuario.findById(req.params.id);
        if (resultado) {
            res.render('usuario_editar', { usuario: resultado });
        } else {
            res.render('error', { error: "Usuario no encontrado" });
        }
    } catch (error) {
        res.render('error', { error: "Usuario no encontrado" });
    }
});

/**
 * Actualiza un usuario.
 */
router.put('/:id', async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;
        
        let updateData = { nombre, email, rol };
        if (password && password.trim() !== '') {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            updateData.password = hashedPassword;
        }

        await Usuario.findByIdAndUpdate(req.params.id, { $set: updateData }, { runValidators: true });
        res.redirect('/');
    } catch (error) {
        let errores = Object.keys(error.errors || {});
        let mensaje = "";

        if (errores.length > 0) {
            errores.forEach(clave => {
                mensaje += '<p>' + error.errors[clave].message + '</p>';
            });
        } else if (error.code === 11000) {
            mensaje = 'Ese correo electrónico ya está registrado';
        } else {
            mensaje = 'Error modificando usuario';
        }

        res.render('usuario_editar', { 
            error: mensaje, 
            usuario: { ...req.body, _id: req.params.id } //n sirve para no perder los datos al recargar
        });
    }
});

/**
 * Inicio de sesión del usuario.
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const usuario = await Usuario.findOne({ email });
        const isMatch = await bcrypt.compare(password, usuario.password);
        if (!isMatch) {
            return res.render('login', { error: "Contraseña incorrecta" });
        }
        res.redirect('/');
    } catch (error) {
        res.render('login', { error: "Error al iniciar sesión" });
    }
});
export default router;
