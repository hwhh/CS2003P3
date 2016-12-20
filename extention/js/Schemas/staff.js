var mongoose = require('mongoose'), Schema = mongoose.Schema;

var staffSchema = new Schema({
    userid: String,
    role: String,
    given: String,
    surname: String,
    dissertations: Array,
    password: String,
    jobtitle: String,
    email: String,
    telephone: String,
    roomnumber: String,
    research: String,
});

var Staff = mongoose.model('Staff', staffSchema);

module.exports = Staff;
