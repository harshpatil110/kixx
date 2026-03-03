// Re-export db connection instance strictly for backward compatibility with tasks that expect /src/config/database.js
const db = require('../db/index');
module.exports = db;
