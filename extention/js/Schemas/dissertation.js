var mongoose = require('mongoose'), Schema = mongoose.Schema;

var dissertationSchema = new Schema({
    id: Number,
    title: String,
    description: String,
    proposer: String,
    proposer_role: String,
    supervisor: String,
    interests: Array,
    assignedTo: String,
    available: Boolean,
});

var Dissertation = mongoose.model('Dissertation', dissertationSchema);

module.exports = Dissertation;
