import express from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import session from 'express-session';
import SqliteStore from 'connect-sqlite3';

// XSS protection
import xss from 'xss';

const SQLiteSessionStore = SqliteStore(session);
const app = express();
const port = 3000;

interface User {
  id: number;
  email: string;
  password: string;
  role: string;
}

// Middleware para autenticación
declare module 'express-session' {
  interface SessionData {
    userId: number;
    userRole: string;
  }
}
function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  next();
}

// Configurar sesiones
app.use(session({
  store: new SQLiteSessionStore({ db: 'sessions.db', dir: './' }) as unknown as session.Store,
  secret: 'my-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    secure: false, // Cambiar si https
    httpOnly: true, // Asegura que el cookie solo sea accesible por HTTP
    sameSite: 'lax', // Protección contra CSRF
  }
}));

// Middleware para agregar cabeceras de seguridad
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'");
  next();
});

// Configurar CORS middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(bodyParser.json());

// Inicializar la base de datos
const db = new sqlite3.Database('database.db');

// Crear tablas por defecto
db.serialize(() => {
  /* Crear tabla de usuarios */
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT
    );
  `, (err) => {
    if (err) {
      console.error('Error creando tabla de usuarios', err.message);
    } else {
      console.log('Tabla de usuarios creada o ya existe.');
    }
  });

  /* Crear tabla de productos */
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      description TEXT,
      price REAL,
      image TEXT
    );
  `, (err) => {
    if (err) {
      console.error('Error creando tabla de productos', err.message);
    } else {
      console.log('Products table created or already exists.');
    }
  });

  /* Agregar producto por defecto solo si no existe */
  db.get(`
    SELECT id FROM products WHERE name = ? AND description = ?
  `, ['Corona extra', '355ml'], (err, row) => {
    if (err) {
      console.error('Error buscando producto:', err.message);
    } else if (!row) {
      db.run(`
        INSERT INTO products (name, description, price)
        VALUES ('Corona extra', '355ml', 21)
      `, (err) => {
        if (err) {
          console.error('Error insertando producto por defecto:', err.message);
        } else {
          console.log('Producto por defecto insertado.');
        }
      });
    } else {
      console.log('Producto por defecto ya existe, no se inserta.');
    }
  });
});

// ENDPOINT DE USUARIOS
app.post('/api/register', (req, res) => {
  const email = xss(req.body.email);
  const password = xss(req.body.password);
  const role = xss(req.body.role);

  const hashedPassword = bcrypt.hashSync(password, 12);
  const query = 'INSERT INTO users (email, password, role) VALUES (?, ?, ?)';
  db.run(query, [email, hashedPassword, role], function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.status(201).json({ message: 'Usuario creado', userId: this.lastID });
  });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err: any) => {
    if (err) {
      return res.status(500).json({ error: 'Error al cerrar sesión' });
    }
    res.json({ message: 'Sesión cerrada' });
  });
});

app.post('/api/auth/login', (req, res) => {
  const email = xss(req.body.email);
  const password = xss(req.body.password);

  const query = 'SELECT * FROM users WHERE email = ?';
  db.get(query, [email], (err, row: User) => {
    if (err) {
      return res.status(500).json({ error: 'Error al buscar usuario' });
    }
    if (!row) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    if (!bcrypt.compareSync(password, row.password)) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Autenticado correctamente, guardar el ID del usuario en
    req.session.userId = row.id;
    req.session.userRole = row.role;
    console.log('Session:', req.session); // Debugging line
    res.json({ message: 'Autenticado', userId: row.id, userRole: row.role });
  });
});

app.get('/api/auth/check', authMiddleware, (req, res) => {
  // Si el middleware de autenticación no lanza un error, el usuario está autenticado
  console.log('Session:', req.session); // Debugging line
  res.json({ authenticated: true, userId: req.session.userId, userRole: req.session.userRole });
});


// ENDPOINT DE PRODUCTOS
app.get('/api/products', (req, res) => {
  const query = 'SELECT * FROM products';
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
    
    console.log('Fetched products:', rows);  // Log fetched products
    res.json(rows);
  });
});

// Crear producto endpoint
app.post('/api/products', (req, res) => {
  const name = xss(req.body.name);
  const description = xss(req.body.description);
  const price = xss(req.body.price);
  const image = xss(req.body.image);

  if (!name || !description || !price) {
    return res.status(400).json({ error: 'Name, description, and price are required' });
  }

  const query = `
    INSERT INTO products (name, description, price, image)
    VALUES (?, ?, ?, ?)
  `;

  db.run(query, [name, description, price, image], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // No hay error, devolver el producto creado
    res.status(201).json({
      id: this.lastID,  // Consultar el último ID insertado en la base de datos
      name,
      description,
      price,
      image
    });
  });
});

// endpoint editar
app.put('/api/products/:id', (req, res) => {
  const id = req.params.id;
  const name = xss(req.body.name);
  const description = xss(req.body.description);
  const price = xss(req.body.price);
  const image = xss(req.body.image);

  const query = `
    UPDATE products
    SET name = ?, description = ?, price = ?, image = ?
    WHERE id = ?
  `;

  db.run(query, [name, description, price, image, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ id, name, description, price, image });
  });
});

// endpoint eliminar
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM products WHERE id = ?';

  db.run(query, [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto eliminado' });
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
