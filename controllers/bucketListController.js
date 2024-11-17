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

const getPopularLocations = async (req, res) => {
  try {
    const query = `
      SELECT 
        place_id,
        name,
        address,
        latitude,
        longitude,
        COUNT(*) as popularity
      FROM bucket_list
      GROUP BY place_id, name, address, latitude, longitude
      ORDER BY popularity DESC
      LIMIT 10;
    `;
    
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching popular locations:', error);
    res.status(500).json({ error: 'Failed to fetch popular locations' });
  }
};

const getSimilarUsers = async (req, res) => {
  const { userid } = req.params;
  
  if (!userid) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const query = `
      WITH user_places AS (
        SELECT place_id FROM bucket_list WHERE userid = $1
      ),
      similar_users AS (
        SELECT 
          u.userid,
          u.username,
          u.name,
          COUNT(DISTINCT b.place_id) as common_places,
          COUNT(DISTINCT b2.place_id) as total_places
        FROM users u
        JOIN bucket_list b ON u.userid = b.userid
        LEFT JOIN bucket_list b2 ON u.userid = b2.userid
        WHERE b.place_id IN (SELECT place_id FROM user_places)
        AND u.userid != $1
        GROUP BY u.userid, u.username, u.name
        HAVING COUNT(DISTINCT b.place_id) >= 2
        ORDER BY common_places DESC, total_places DESC
        LIMIT 5
      )
      SELECT 
        s.*,
        ARRAY_AGG(DISTINCT b.name) as common_locations
      FROM similar_users s
      JOIN bucket_list b ON s.userid = b.userid
      WHERE b.place_id IN (SELECT place_id FROM user_places)
      GROUP BY s.userid, s.username, s.name, s.common_places, s.total_places;
    `;
    
    const result = await pool.query(query, [userid]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error finding similar users:', error);
    res.status(500).json({ error: 'Failed to find similar users' });
  }
};

const getNearbyBucketList = async (req, res) => {
  const { latitude, longitude, radius = 50 } = req.query; // radius in kilometers

  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  try {
    const query = `
      SELECT 
        b.*,
        COUNT(*) as popularity,
        (
          6371 * acos(
            cos(radians($1)) * cos(radians(latitude)) *
            cos(radians(longitude) - radians($2)) +
            sin(radians($1)) * sin(radians(latitude))
          )
        ) as distance
      FROM bucket_list b
      WHERE (
        6371 * acos(
          cos(radians($1)) * cos(radians(latitude)) *
          cos(radians(longitude) - radians($2)) +
          sin(radians($1)) * sin(radians(latitude))
        )
      ) <= $3
      GROUP BY b.place_id, b.name, b.address, b.latitude, b.longitude, b.created_at
      ORDER BY popularity DESC, distance ASC
      LIMIT 20;
    `;
    
    const result = await pool.query(query, [latitude, longitude, radius]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error finding nearby locations:', error);
    res.status(500).json({ error: 'Failed to find nearby locations' });
  }
};

const getPopularLocationsByCategory = async (req, res) => {
  const { category } = req.query;
  const validCategories = ['beach', 'mountain', 'city', 'landmark', 'nature', 'cultural'];

  if (category && !validCategories.includes(category)) {
    return res.status(400).json({ 
      error: 'Invalid category',
      validCategories
    });
  }

  try {
    const query = `
      SELECT 
        place_id,
        name,
        address,
        latitude,
        longitude,
        category,
        COUNT(*) as popularity
      FROM bucket_list
      ${category ? 'WHERE category = $1' : ''}
      GROUP BY place_id, name, address, latitude, longitude, category
      ORDER BY popularity DESC
      LIMIT 10;
    `;
    
    const values = category ? [category] : [];
    const result = await pool.query(query, values);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching popular locations by category:', error);
    res.status(500).json({ error: 'Failed to fetch popular locations by category' });
  }
};

module.exports = { 
  addToBucketList, 
  getBucketList, 
  removeFromBucketList, 
  getPopularLocations,
  getSimilarUsers,
  getNearbyBucketList,
  getPopularLocationsByCategory
};
