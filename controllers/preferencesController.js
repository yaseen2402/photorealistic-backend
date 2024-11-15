const pool = require('../db');

// For regular users
const saveUserPreferences = async (req, res) => {
  const { 
    userid,
    propertyTypes = [],
    preferredLocations = [],
    minBedrooms = 0,
    minBathrooms = 0,
    preferredFeatures = [],
    investmentPurpose,
    lifestylePreferences = [],
    notificationFrequency = 'daily',
    propertyStyle,
    virtualTourPreference = false
  } = req.body;

  if (!userid) {
    return res.status(400).json({ error: 'userid is required' });
  }

  // Ensure arrays are actually arrays
  const ensureArray = (value) => Array.isArray(value) ? value : [];
  const sanitizedPropertyTypes = ensureArray(propertyTypes);
  const sanitizedPreferredLocations = ensureArray(preferredLocations);
  const sanitizedPreferredFeatures = ensureArray(preferredFeatures);
  const sanitizedLifestylePreferences = ensureArray(lifestylePreferences);

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
      sanitizedPropertyTypes,
      sanitizedPreferredLocations,
      minBedrooms,
      minBathrooms,
      sanitizedPreferredFeatures,
      investmentPurpose,
      sanitizedLifestylePreferences,
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
    yearsExperience = 0,
    operationAreas = [],
    specializations = [],
    clientTypes = [],
    listingUpdateFrequency = 'weekly',
    marketingPreferences = [],
    communicationPreferences = []
  } = req.body;

  if (!userid) {
    return res.status(400).json({ error: 'userid is required' });
  }

  // Ensure arrays are actually arrays
  const ensureArray = (value) => Array.isArray(value) ? value : [];
  const sanitizedOperationAreas = ensureArray(operationAreas);
  const sanitizedSpecializations = ensureArray(specializations);
  const sanitizedClientTypes = ensureArray(clientTypes);
  const sanitizedMarketingPreferences = ensureArray(marketingPreferences);
  const sanitizedCommunicationPreferences = ensureArray(communicationPreferences);

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
      sanitizedOperationAreas,
      sanitizedSpecializations,
      sanitizedClientTypes,
      listingUpdateFrequency,
      sanitizedMarketingPreferences,
      sanitizedCommunicationPreferences
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