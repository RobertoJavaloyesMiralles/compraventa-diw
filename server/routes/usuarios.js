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
router.get('/registro', async (req, res) => {
    res.render('registro');
});

/**
 * Formulario de login
 */
router.get('/login', async(req, res) => {
    res.render('login');
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

        res.render('registro', { error: mensaje, datos: req.body });
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
        if (!usuario) {
            return res.render('login', { error: "Usuario o contraseña incorrectos" });
        }
        const isMatch = await bcrypt.compare(password, usuario.password);
        if (!isMatch) {
            return res.render('login', { error: "Usuario o contraseña incorrectos" });
        }
        // Ivan: Guardamos la session para identificar al usuario para el apartado de los comentarios y valoraciones
        req.session.usuario = {
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol
        };
        res.redirect('/');
    } catch (error) {
        res.render('login', { error: "Error al iniciar sesión" });
    }
});

/**
 * Función para controlar que el usuario está logueado
 */
export const autenticacion = (req, res, next) => {
    if (req.session && req.session.usuario)
        return next();
    else
        res.redirect('/usuarios/login');
};

/**
 * Función para controlar que el usuario tiene un rol determinado
 */
export const rol = (rol) => {
    return (req, res, next) => {
        if (req.session.usuario && rol === req.session.usuario.rol)
            next();
        else
            res.redirect('/usuarios/login');
    }
};


/**
 * Cierra la sesión del usuario.
 */
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

/**
 * Obtiene un usuario por id
 */
router.get('/:id', async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id);
        if (usuario) {
            res.json(usuario);
        } else {
            res.status(404).json({ error: "Usuario no encontrado" });
        }
    } catch (err) {
        res.status(400).json({ error: "ID inválido" });
    }
});

export default router;
