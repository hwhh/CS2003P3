/**
 * Unit tests for Web2
 */
var model = require('../../js/model.js');
var dao = require('../../js/dataAccess.js');
var expect = require('chai').expect;
var should = require('chai').should();
var jsonSta = require('./../../testFiles/staff_json.json');
var jsonStu = require('./../../testFiles/student_json.json');
var jsonStu1 = require('./../../testFiles/student_json1.json');
var jsonStu2 = require('./../../testFiles/student_json2.json');
var dis1 = require('./../../testFiles/dissertation_json1.json');



describe('the model: ', function () {

    var staffMember1 = new model.StaffFromJSON(jsonSta);
    dao.addStaffMember(staffMember1);
    var student1 = new model.StudentFromJSON(jsonStu);
    dao.addStudent(student1);
    var student2 = new model.StudentFromJSON(jsonStu1);
    dao.addStudent(student2);
    var student3 = new model.StudentFromJSON(jsonStu2);
    dao.addStudent(student3);
    var dissertation = new model.DissertationFromJSON(dis1);
    dao.addDissertation(dissertation);
    //Initially staff and student members required
    describe('Staff', function () {
        dao.addStaffMember(staffMember1);
        it('Should be instance of staff', function () {
            expect(staffMember1).to.be.instanceof(model.Staff);
        });
        it('Should have correct attributes', function () {
            expect(staffMember1.getUserID()).to.equal("a1");
            expect(staffMember1.getRole()).to.equal("staff");
            expect(staffMember1.getGiven()).to.equal("John");
            expect(staffMember1.getSurname()).to.equal("Smith");
            expect(staffMember1.getJobTitle()).to.equal("Lecturer");
            expect(staffMember1.getEmail()).to.equal("john.smith@st-andrews.ac.uk");
            expect(staffMember1.getRoomNumber()).to.equal("JC0.22");
            expect(staffMember1.getTelephone()).to.equal("+447473941273");
            expect(staffMember1.getResearch()).to.eql(["engineering", "social"]);
            expect(staffMember1.getAllDissertations()).to.eql([]);
            expect(staffMember1.getPassword()).to.equal("password");
        });
        it('should throw ValidationError when trying to create a user with missing data ', function () {
            expect(function () {
                new model.StaffFromJSON()
            }).to.throw(model.ValidationError);
        });
        it('should throw ValidationError when trying to add dissertations that does not exist', function () {
            expect(function () {
                staffMember1.setDissertations([-1]);
            }).to.throw(model.ValidationError);
        });
        it('should throw ValidationError when trying to add access the constructor directly', function () {
            expect(function () {
                new model.Student();
            }).to.throw(model.ValidationError);
        });


    });

    describe('Students', function () {
        dao.addStudent(student1);
        it('Should be instance of staff', function () {
            expect(student1).to.be.instanceof(model.Student);
        });
        it('Should have correct attributes', function () {
            expect(student1.getUserID()).to.equal("et");
            expect(student1.getRole()).to.equal("student");
            expect(student1.getGiven()).to.equal("Elliot");
            expect(student1.getSurname()).to.equal("Turner");
            expect(student1.getAllDissertations()).to.eql([]);
            expect(student1.getPassword()).to.equal("password");
        });
        it('should throw ValidationError when trying to create a user with missing data ', function () {
            expect(function () {
                new model.StudentFromJSON()
            }).to.throw(model.ValidationError);
        });
        it('should throw ValidationError when trying to add dissertations that does not exist', function () {
            expect(function () {
                student1.setDissertations([-1]);
            }).to.throw(model.ValidationError);
        });
        it('should throw ValidationError when trying to add access the constructor directly', function () {
            expect(function () {
                new model.Student();
            }).to.throw(model.ValidationError);
        });
    });

    describe('Dissertations', function () {
        it("Should return Dissertation object", function () {
            expect(dissertation).to.be.an.instanceof(model.Dissertation);
        });
        it("Should create a dissertation object and set correct attributes", function () {
            expect(dissertation.getID()).to.equal(1);
            expect(dissertation.getTitle()).to.equal("1");
            expect(dissertation.getDescription()).to.equal("test1");
            expect(dissertation.getProposer()).to.equal("et");
            expect(dissertation.getProposerRole()).to.equal("student");
            expect(dissertation.getSupervisor()).to.equal("a1");
            expect(dissertation.getInterests()).to.eql([]);
        });
        it('should throw ValidationError when trying to create a user where ID already exists ', function () {
            expect(function () {
                new model.DissertationFromJSON(dissertation)
            }).to.throw(model.ValidationError);
        });
        it('should throw ValidationError when trying to create a user with missing data ', function () {
            expect(function () {
                new model.DissertationFromJSON()
            }).to.throw(model.ValidationError);
        });
        it('should throw ValidationError when trying to add dissertations with invalid proposer', function () {
            expect(function () {
                dissertation.setProposer("invalid");
            }).to.throw(model.ValidationError);
        });
        it('should throw ValidationError when trying to add access the constructor directly', function () {
            expect(function () {
                new model.Dissertation();
            }).to.throw(model.ValidationError);
        });
        it('should throw ValidationError when trying to make the supervisor a student', function () {
            expect(function () {
                dissertation.setSupervisor(student1);
            }).to.throw(model.ValidationError);
        });
        it('should throw ValidationError when trying to assign the dissertation to two students', function () {
            dissertation.setAvailable(true);
            dissertation.setAssignedTo(student1);
            expect(function () {
                dissertation.setAssignedTo(student2);
            }).to.throw(model.ValidationError);
        });
    });


});



