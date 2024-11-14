const pool = require('../db');

// For regular users
const saveUserPreferences = async (req, res) => {
  const { 
    userid,
    propertyTypes,
    preferredLocations,
    minBedrooms,
    minBathrooms,
    preferredFeatures,
    investmentPurpose,
    lifestylePreferences,
    notificationFrequency,
    propertyStyle,
    virtualTourPreference
  } = req.body;

  try {
    const query = `
      INSERT INTO user_preferences (
        userid, 
        property_types,
        preferred_locations,
        min_bedrooms,
        min_bathrooms,
        preferred_features,
        investment_purpose,
        lifestyle_preferences,
        notification_frequency,
        property_style,
        virtual_tour_preference
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (userid) 
      DO UPDATE SET 
        property_types = $2,
        preferred_locations = $3,
        min_bedrooms = $4,
        min_bathrooms = $5,
        preferred_features = $6,
        investment_purpose = $7,
        lifestyle_preferences = $8,
        notification_frequency = $9,
        property_style = $10,
        virtual_tour_preference = $11,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const result = await pool.query(query, [
      userid,
      propertyTypes,
      preferredLocations,
      minBedrooms,
      minBathrooms,
      preferredFeatures,
      investmentPurpose,
      lifestylePreferences,
      notificationFrequency,
      propertyStyle,
      virtualTourPreference
    ]);

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error saving preferences:', error);
    res.status(500).json({ error: 'Failed to save preferences' });
  }
};

// For professionals
const saveProfessionalProfile = async (req, res) => {
  const {
    userid,
    role,
    yearsExperience,
    operationAreas,
    specializations,
    clientTypes,
    listingUpdateFrequency,
    marketingPreferences,
    communicationPreferences
  } = req.body;

  try {
    const query = `
      INSERT INTO professional_profiles (
        userid,
        role,
        years_experience,
        operation_areas,
        specializations,
        client_types,
        listing_update_frequency,
        marketing_preferences,
        communication_preferences
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (userid) 
      DO UPDATE SET 
        role = $2,
        years_experience = $3,
        operation_areas = $4,
        specializations = $5,
        client_types = $6,
        listing_update_frequency = $7,
        marketing_preferences = $8,
        communication_preferences = $9,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const result = await pool.query(query, [
      userid,
      role,
      yearsExperience,
      operationAreas,
      specializations,
      clientTypes,
      listingUpdateFrequency,
      marketingPreferences,
      communicationPreferences
    ]);

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error saving professional profile:', error);
    res.status(500).json({ error: 'Failed to save professional profile' });
  }
};

module.exports = {
  saveUserPreferences,
  saveProfessionalProfile
};