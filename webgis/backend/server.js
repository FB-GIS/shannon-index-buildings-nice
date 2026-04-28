const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const batiRoutes = require('./routes/batiRoutes.js');
const pool = require('./db.js');
const { default: errorHandling } = require('./errorHandler');


dotenv.config();
const app = express();

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());


app.get("/", async(req, res) => {
    const result = await pool.query("SELECT current_database()")
    res.json({ status: 200, msg: `The database name is: ${result.rows[0].current_database}` })
});

// Routes
app.use("/api",  batiRoutes);

//Error handling middleware
app.use(errorHandling);

const PORT = process.env.PORT || 9500

//Server launch on port 9500
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})