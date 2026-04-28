const pool = require('../db');

class BatiModel {

    static async getAllBati() {
        try {
            const result = await pool.query(
            `SELECT "ID", "USAGE1", shannon_index, ST_AsGeoJSON(ST_Transform(geometry, 4326)) AS geom
            FROM shannon_idx_bati_nice
            ORDER BY "ID"
            ;`
            )
            return result;
        } catch(err) {
           return err;
        }
    }
}

module.exports = { BatiModel };