const pool = require('../db');

const addComment=async(req, res) =>{
    const { userId, userName, location, comment, zipCode } = req.body;
    const isResidential = zipCode === location.zipCode; 
  
    try {
      const query = `
        INSERT INTO comments (user_id, user_name, location, comment, is_residential)
        VALUES ($1, $2, $3, $4, $5) RETURNING *;
      `;
      const values = [userId, userName, location, comment, isResidential];
  
      const result = await pool.query(query, values);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({ error: "Failed to add comment" });
    }
  }
  
  const getComments = async (req, res) => {
    const { zipcode } = req.params;
    console.log(zipcode)
    
   zipCode=zipcode.trim();
    try {
      const query = `
         SELECT * FROM comments
  WHERE location->>'zipCode' = $1
  ORDER BY created_at DESC;
`
      const result = await pool.query(query, [zipCode]);
      const comments = result.rows.map(row => row.comment); // Assuming the comment field is `comment`
      const formattedComments = comments.map(comment => `"${comment}"`).join(", ");

      console.log(formattedComments);
    res.status(200).json({ comments: formattedComments });
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  };
  
  
  module.exports = { addComment, getComments };
  