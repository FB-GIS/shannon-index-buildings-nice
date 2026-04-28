const { BatiModel } = require('../models/BatiModels.js');

const getAllBati = async(req, res, next) => {
    try {
        const bati = await BatiModel.getAllBati()
        if (bati.code) {
            res.json({ status: 500, msg: "An error occured!" })
        } else {
            res.json({status: 200, bati: bati.rows})
        }
    } catch(err) {
        next(err)
    }
}

module.exports = { getAllBati };