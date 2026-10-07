const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const User = require('./models/User');

const app = express();
const PORT = 3000;
const localUsersFile = path.join(__dirname, 'data', 'users.json');

const normalizeEmail = (email) => email.trim().toLowerCase();

async function readLocalUsers() {
    try {
        const users = await fs.readFile(localUsersFile, 'utf8');
        return JSON.parse(users);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

async function writeLocalUsers(users) {
    await fs.mkdir(path.dirname(localUsersFile), { recursive: true });
    await fs.writeFile(localUsersFile, JSON.stringify(users, null, 2));
}

function isMongoReady() {
    return mongoose.connection.readyState === 1;
}

// Middlewares
app.use(express.json());
app.use(cors());

// Conexión a MongoDB Local
mongoose.connect('mongodb://127.0.0.1:27017/motorapp_db')
    .then(() => {
        console.log('✅ Conectado exitosamente a MongoDB');
    })
    .catch(() => console.log('⚠️ MongoDB no disponible; usando almacenamiento local'));

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

// Ruta de Prueba
app.get('/', (req, res) => {
    res.send('API de Taller de Motos Funcionando 🏍️');
});

// Ruta de Registro
app.post('/api/register', async (req, res) => {
    try {
        const { password } = req.body;
        const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
        const email = typeof req.body.email === 'string' ? normalizeEmail(req.body.email) : '';

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        if (isMongoReady()) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(409).json({ error: 'El correo ya está registrado' });
            }

            await new User({ name, email, password }).save();
        } else {
            const users = await readLocalUsers();
            if (users.some((user) => user.email === email)) {
                return res.status(409).json({ error: 'El correo ya está registrado' });
            }

            users.push({ name, email, password, createdAt: new Date().toISOString() });
            await writeLocalUsers(users);
        }

        res.status(201).json({ message: 'Usuario registrado con éxito', user: { name, email } });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ error: 'El correo ya está registrado' });
        }
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Ruta de Login
app.post('/api/login', async (req, res) => {
    try {
        const { password } = req.body;
        const email = typeof req.body.email === 'string' ? normalizeEmail(req.body.email) : '';

        const user = isMongoReady()
            ? await User.findOne({ email })
            : (await readLocalUsers()).find((localUser) => localUser.email === email);
        if (!user || user.password !== password) {
            return res.status(400).json({ error: 'Credenciales inválidas' });
        }

        res.json({ message: 'Inicio de sesión exitoso', user: { name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
});
