const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:4200'
}));
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'suggestionsdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function query(sql, params) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

app.get('/suggestions', async (_req, res) => {
  try {
    const rows = await query('SELECT * FROM suggestions ORDER BY date DESC, id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors du chargement des suggestions.' });
  }
});

app.get('/suggestions/:id', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM suggestions WHERE id = ?', [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ message: 'Suggestion non trouvée.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors du chargement de la suggestion.' });
  }
});

app.post('/suggestions', async (req, res) => {
  try {
    const { title, description, category, status, nbLikes } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO suggestions (title, description, category, status, nbLikes) VALUES (?, ?, ?, ?, ?)',
      [title, description || '', category || '', status || 'en_attente', nbLikes ?? 0]
    );
    const rows = await query('SELECT * FROM suggestions WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la création de la suggestion.' });
  }
});

app.put('/suggestions/:id', async (req, res) => {
  try {
    const { title, description, category, status, nbLikes } = req.body;
    await pool.execute(
      'UPDATE suggestions SET title = ?, description = ?, category = ?, status = ?, nbLikes = ? WHERE id = ?',
      [title || '', description || '', category || '', status || 'en_attente', nbLikes ?? 0, req.params.id]
    );
    const rows = await query('SELECT * FROM suggestions WHERE id = ?', [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ message: 'Suggestion non trouvée.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la suggestion.' });
  }
});

app.delete('/suggestions/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM suggestions WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la suppression de la suggestion.' });
  }
});

app.patch('/suggestions/:id', async (req, res) => {
  try {
    const fields = [];
    const params = [];
    const { title, description, category, status, nbLikes, isFavorite } = req.body;

    if (title !== undefined) { fields.push('title = ?'); params.push(title); }
    if (description !== undefined) { fields.push('description = ?'); params.push(description); }
    if (category !== undefined) { fields.push('category = ?'); params.push(category); }
    if (status !== undefined) { fields.push('status = ?'); params.push(status); }
    if (nbLikes !== undefined) { fields.push('nbLikes = ?'); params.push(nbLikes); }
    if (isFavorite !== undefined) { fields.push('isFavorite = ?'); params.push(isFavorite ? 1 : 0); }

    if (!fields.length) {
      return res.status(400).json({ message: 'Aucun champ à mettre à jour.' });
    }

    params.push(req.params.id);
    await pool.execute(`UPDATE suggestions SET ${fields.join(', ')} WHERE id = ?`, params);

    const rows = await query('SELECT * FROM suggestions WHERE id = ?', [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ message: 'Suggestion non trouvée.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la mise à jour partielle de la suggestion.' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

