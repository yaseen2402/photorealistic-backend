const pool = require('../db');

const addFavorite = async (req, res) => {
  const { userid, place_id, name, address, latitude, longitude } = req.body;

  if (!userid || !place_id) {
    return res.status(400).json({ error: 'userid and place_id are required' });
  }

  try {
    const query = `
      INSERT INTO favorites (userid, place_id, name, address, latitude, longitude)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
    `;
    const values = [userid, place_id, name, address, latitude, longitude];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
};

const getFavorites = async (req, res) => {
  const { userid } = req.params;

  if (!userid) {
    return res.status(400).json({ error: 'userid is required' });
  }

  try {
    const query = 'SELECT * FROM favorites WHERE userid = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [userid]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
};

const removeFavorite = async (req, res) => {
  const { userid, place_id } = req.body;

  if (!userid || !place_id) {
    return res.status(400).json({ error: 'userid and place_id are required' });
  }

  try {
    const query = 'DELETE FROM favorites WHERE userid = $1 AND place_id = $2 RETURNING *';
    const result = await pool.query(query, [userid, place_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
};

module.exports = { addFavorite, getFavorites, removeFavorite };