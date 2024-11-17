const pool = require("../db");

const getPropertiesByCoordinates = async (req, res) => {
  const { target_lat, target_lon } = req.query;

  // if (!target_lat || !target_lon) {
  //   return res.status(400).json({ error: 'target_lat and target_lon are required' });
  // }

  // try {

  //   const query = `
  //     SELECT num_beds, num_baths, size_sqft, property_type, price
  //     FROM properties
  //     WHERE ABS(coordinate_lat - ${target_lat}) <= 0.00001 AND ABS(coordinate_lon - ${target_lon}) <= 0.00001;
  //   `;

  //   const result = await pool.query(query);

  //   if (result.rows.length > 0) {

  //     res.status(200).json(result.rows);
  //   } else {
  //     res.status(404).json({ message: 'No properties found near the target coordinates' });
  //   }

  if (!target_lat || !target_lon) {
    return res.status(400).send("Latitude and longitude are required.");
  }

  try {
    const query = `
          SELECT 
          p.property_id,
          p.address_line,
          p.coordinate_lat,
          p.coordinate_lon,
          p.size_sqft,
          p.property_type,
          p.price,
          p.status,
          p.zip_code_id,
          p.num_beds,
          p.num_baths,
          p.prop_url,
          p.img_url,
          z.zip_code,
          z.city,
          z.state,
          z.county,
          z.population,
          z.median_age,
          z.median_age_male,
          z.median_age_female,
          z.male_pop,
          z.female_pop,
          z.vacancies_for_rent_percent,
          z.vacancies_for_sale_percent,
          z.home_value_forecast,
          ST_AsGeoJSON(p.geom) AS geom
      FROM 
          properties p
      JOIN 
          zip_codes z
      ON 
          p.zip_code_id = z.zip_code_id
      WHERE 
          ST_DWithin(
              p.geom,
              ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
              200
          );
      `;
    const result = await pool.query(query, [target_lat, target_lon]);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "query failed" });
  }
};

module.exports = { getPropertiesByCoordinates };
