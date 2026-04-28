const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

pool.on("connect", () => {console.log("Connection to the database established")});
pool.on('error', (err) => console.error('Erreur pool PostgreSQL :', err));

//We test the connection to the database every 10 seconds to ensure it is still active
setInterval(async () => {
    try {
        await pool.query('SELECT 1');
        console.log(`[${new Date().toLocaleTimeString()}] Connexion to PostgreSQL active`);
    } catch (err) {
        console.error('connexion error from PostgreSQL :', err.message);
    }
}, 10000);

module.exports = pool;