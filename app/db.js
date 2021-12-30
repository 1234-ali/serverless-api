const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: 'testdb.cluster-cvl4tervawxh.us-east-2.rds.amazonaws.com',
    user: 'admin',
    password: 'rT68DZ3JnYz0GjuUoZOy',
    database: 'testdb'
}).promise();

module.exports = pool;