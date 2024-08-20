import express from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import sqlite3 from 'sqlite3';

const app = express();
const port = 3000;

interface User {
  id: number;
  username: string;
  password: string;
  role: string;
}

app.use(bodyParser.json());

// Inicializar la base de datos
// const db = new sqlite3.Database(':memory:'); // Use a persistent database in production
const db = new sqlite3.Database('database.db');

// Crear tablas por defecto
db.serialize(() => {
  /* Crear tabla de usuarios */
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
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
  const { username, password, role } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [username, hashedPassword, role], function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID });
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  db.get<User>("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.status(200).json({ message: 'Login successful', user });
  });
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
  const { name, description, price, image } = req.body;

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
  const { id } = req.params;
  const { name, description, price, image } = req.body;

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
