const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bloodSchema = Schema({
    date: { type: String, required: true},
    visitDate: { type: String, required: false },
    kallio:{ type: String, required: false },
    natrio:{ type: String, required: false },
    asbestio:{ type: String, required: false },
    ht:{ type: String, required: false },
    mcv:{ type: String, required: false },
    sgot:{ type: String, required: false },
    b12:{ type: String, required: false },
    kallio:{ type: String, required: false },
    patient:{type:mongoose.Types.ObjectId,required:true,ref:'Patient'}
})

module.exports = mongoose.model('Blood', bloodSchema);