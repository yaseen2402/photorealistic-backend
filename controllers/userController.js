
const pool = require('../db'); 

const addUser = async (req, res) => {
  const { userid, name, zipcode, status } = req.body;


  if (!userid || !name || !zipcode || !status) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    
    const userCheckResult = await pool.query(
      'SELECT userid FROM users WHERE userid = $1',
      [userid]
    );

   
    if (userCheckResult.rows.length > 0) {
      console.log(userid);
      return res.status(200).json({
        message:"User already in db",
        user: userid,  
        alreadyExists:true,
      });
    }

   
    const insertResult = await pool.query(
      'INSERT INTO users (userid, name, zipcode, status) VALUES ($1, $2, $3, $4)',
      [userid, name, zipcode, status]
    );

    
    res.status(201).json({
      message: 'User added successfully',
      user: userid,  
      alreadyExists:false
    });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Failed to process the request' });
  }
};

module.exports = { addUser };
