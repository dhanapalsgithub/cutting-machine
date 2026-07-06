// my-backend/db.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = pool; // இதை மற்ற கோப்புகளில் பயன்படுத்த 'export' செய்வது அவசியம்