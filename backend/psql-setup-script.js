const { sequelize } = require('./db/models');

// Define schema explicitly if not set in environment
const schema = process.env.SCHEMA || 'travel_site';

sequelize.showAllSchemas({ logging: false }).then(async (data) => {
  if (!data.includes(schema)) {
    await sequelize.createSchema(schema);
  }
}).catch(err => {
  console.error('Error setting up schema:', err);
  process.exit(1);
});
