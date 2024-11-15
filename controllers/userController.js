const pool = require('../db');

const addUser = async (req, res) => {
  const { userid, name, zipcode, status, username } = req.body;

  if (!userid || !name || !zipcode || !status || !username) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Check if user exists
    const userCheckResult = await pool.query(
      'SELECT userid FROM users WHERE userid = $1 OR username = $2',
      [userid, username]
    );

    if (userCheckResult.rows.length > 0) {
      const existingUser = userCheckResult.rows[0];
      if (existingUser.userid === userid) {
        return res.status(200).json({
          message: "User already in db",
          user: userid,
          alreadyExists: true,
        });
      } else {
        return res.status(400).json({
          message: "Username already taken",
          error: "USERNAME_TAKEN"
        });
      }
    }

    // Insert new user
    const insertResult = await pool.query(
      'INSERT INTO users (userid, name, username, zipcode, status) VALUES ($1, $2, $3, $4, $5)',
      [userid, name, username, zipcode, status]
    );

    res.status(201).json({
      message: 'User added successfully',
      user: userid,
      alreadyExists: false
    });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Failed to process the request' });
  }
};

const findUserByUsername = async (req, res) => {
  const { username } = req.params;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    const query = 'SELECT userid, username, name FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error finding user:', error);
    res.status(500).json({ error: 'Failed to find user' });
  }
};

module.exports = { addUser, findUserByUsername };
