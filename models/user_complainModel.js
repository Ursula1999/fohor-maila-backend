const mongoose = require("mongoose");

const complainSchema = mongoose.Schema({
    BinId :{
        type: String,
        required: true,
    },

    streetName : {
        type: String,
        required: true
    },

    complainMsg : {
        type: String,
        required: true
    }
    
})

module.exports = mongoose.model('Complain', complainSchema);