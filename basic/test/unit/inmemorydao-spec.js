

var expect = require('chai').expect;
var dao = require('../../js/dataAccess.js');
var utils = require('../../js/utils.js');

var model = require('../../js/model.js');
var jsonSta = require('./../../testFiles/staff_json.json');
var jsonSta1 = require('./../../testFiles/staff_json1.json');
var jsonStu = require('./../../testFiles/student_json.json');
var jsonStu1 = require('./../../testFiles/student_json1.json');
var jsonStu2 = require('./../../testFiles/student_json2.json');
var dis1 = require('./../../testFiles/dissertation_json2.json');

describe('DAO', function() {

    var staffMember1, staffMember2,student1, student2, student3, dissertation;

    beforeEach(function() {
        dao.clear();
        staffMember1 = new model.StaffFromJSON(jsonSta);
        staffMember2 = new model.StaffFromJSON(jsonSta1);
        student1 = new model.StudentFromJSON(jsonStu);
        student2 = new model.StudentFromJSON(jsonStu1);
        student3 = new model.StudentFromJSON(jsonStu2);
    });

    describe("Dissertation", function () {

        beforeEach(function () {
            dao.clear();
            dao.addStaffMember(staffMember1);
            dao.addStaffMember(staffMember2);
            dao.addStudent(student1);
            dissertation = new model.DissertationFromJSON(dis1);
        });

        console.log(dissertation);

        it('should be able to store a dissertation', function(){
            dao.addDissertation(dissertation);
        });

        it('should retrieve a dissertation', function() {
            dao.addDissertation(dissertation);
            expect(dao.getDissertation(2)).eql(dissertation);
        });

        it('should be able to retrieve a list of dissertations', function() {
            dao.addDissertation(dissertation);
            expect(dao.getAllDissertations().length).to.equal(1);
        });

        it('should delete a dissertation', function() {
            dao.addDissertation(dissertation);
            dao.deleteDissertation(2);
            expect(dao.getAllDissertations().length).to.equal(0);
        });
    });

    describe("Students", function () {

        beforeEach(function () {
            dao.clear();
        });

        it('should add new student', function() {
            dao.addStudent(student1);
        });

        it('should get a student', function() {
            dao.addStudent(student1);
            expect(dao.getStudent("et")).to.eql(student1);
        });

        it('should get all students ', function() {
            dao.addStudent(student1);
            expect(dao.getAllStudents()).to.include(student1);
            expect(dao.getAllStudents().length).to.equal(1);
        });

        it('should delete a student', function() {
            dao.deleteStudent("et");
            expect(dao.getAllStudents().length).to.equal(0);
        });

    });

    describe("Staff", function () {
        beforeEach(function () {
            dao.clear();
        });


        it('should add new staff', function() {
            dao.addStaffMember(staffMember1);
        });

        it('should get a staff member', function() {
            dao.addStaffMember(staffMember1);
            expect(dao.getStaffMember("a1")).to.eql(staffMember1);

        });

        it('should get all staff members', function() {
            dao.addStaffMember(staffMember1);
            expect(dao.getAllStaff()).to.include(staffMember1);
            expect(dao.getAllStaff().length).to.equal(1);
        });

        it('should delete a member of staff', function() {
            dao.addStaffMember(staffMember1);
            dao.deleteStaffMember("a1");
            expect(dao.getAllStaff().length).to.equal(0);
        });
    });

    after(function () {

    })

});
