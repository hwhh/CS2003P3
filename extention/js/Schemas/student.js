var mongoose = require('mongoose'), Schema = mongoose.Schema;

var studentSchema = new Schema({
    userid: String,
    role: String,
    given: String,
    surname: String,
    dissertations: Array,
    password: String,
});

/*staffSchema.post('remove', function(next){
 console.log();
 staffSchema.remove();
 });*/

var Student = mongoose.model('Student', studentSchema);

module.exports = Student;
