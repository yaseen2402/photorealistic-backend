const pool = require('../db');

const addToBucketList = async (req, res) => {
  const { userid, place_id, name, address, latitude, longitude } = req.body;

  if (!userid || !place_id) {
    return res.status(400).json({ error: 'userid and place_id are required' });
  }

  try {
    const query = `
      INSERT INTO bucket_list (userid, place_id, name, address, latitude, longitude)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
    `;
    const values = [userid, place_id, name, address, latitude, longitude];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding to bucket list:', error);
    res.status(500).json({ error: 'Failed to add to bucket list' });
  }
};

const getBucketList = async (req, res) => {
  const { username } = req.params;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    const query = `
      SELECT b.*, u.username, u.name as user_name
      FROM bucket_list b
      JOIN users u ON b.userid = u.userid
      WHERE u.username = $1
      ORDER BY b.created_at DESC;
    `;
    const result = await pool.query(query, [username]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching bucket list:', error);
    res.status(500).json({ error: 'Failed to fetch bucket list' });
  }
};

const removeFromBucketList = async (req, res) => {
  const { userid, place_id } = req.body;

  if (!userid || !place_id) {
    return res.status(400).json({ error: 'userid and place_id are required' });
  }

  try {
    const query = 'DELETE FROM bucket_list WHERE userid = $1 AND place_id = $2 RETURNING *';
    const result = await pool.query(query, [userid, place_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found in bucket list' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error removing from bucket list:', error);
    res.status(500).json({ error: 'Failed to remove from bucket list' });
  }
};

module.exports = { addToBucketList, getBucketList, removeFromBucketList };
