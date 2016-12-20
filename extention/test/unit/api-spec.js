/***********************************************************************************
 * Unit tests for the Web2 api implementation.
 ***********************************************************************************/
//npm install mongodb async --save
var expect = require('chai').expect;
var express = require('express');
var model = require('../../js/model.js');
var should = require("should");
var supertest = require('supertest');
var app = require("../../js/api").getApp;
var utils = require('../../js/utils');


var jsonSta = require('./../../testFiles/staff_json.json');
var jsonSta1 = require('./../../testFiles/staff_json1.json');
var jsonSta2 = require('./../../testFiles/staff_json2.json');
var jsonStu = require('./../../testFiles/student_json.json');
var jsonStu1 = require('./../../testFiles/student_json1.json');
var jsonStu2 = require('./../../testFiles/student_json2.json');
var jsonDis1 = require('./../../testFiles/dissertation_json1.json');
var jsonDis2 = require('./../../testFiles/dissertation_json2.json');
var jsonDis3 = require('./../../testFiles/dissertation_json3.json');
var jsonDis4 = require('./../../testFiles/dissertation_json4.json');
var jsonDis5 = require('./../../testFiles/dissertation_json5.json');
var jsonDisUpdate = require('./../../testFiles/dissertation_json_update.json');
var jsonDisUpdate1 = require('./../../testFiles/dissertation_json_update1.json');

var jsonStaffUpdate = require('./../../testFiles/staff_json_update.json');
var jsonStudentUpdate = require('./../../testFiles/student_json_update.json');
var mongoose = require('mongoose');


// ensure the NODE_ENV is set to 'test'
// this is helpful when you would like to change behavior when testing
process.env.NODE_ENV = 'test';


describe('API', function () {

    before(function () {
        supertest(app).get('/clear').auth('admin', 'admin').end(function (err, res) {
        });
    });

    this.timeout(35000);


    describe('Log on', function () {
        it("should go to home page", function (done) {
            supertest(app).get("/").auth('admin', 'admin')
                .expect('Cannot GET /\n')
                .expect(404, done);
        });

    });

    describe('Create staff', function () {

        it("should return status 201 (created) staff on success", function (done) {
            supertest(app).get('/clear').auth('admin', 'admin').end(function (err, res) {
                expect(res.text).to.equal("Collections removed");
            });
            supertest(app).put('/user/staff/a1').send(jsonSta).auth('admin', 'admin').expect("Content-type", /json/).expect(201).end(function (err, res) {
                expect(res.status).to.equal(201);
                expect(res.body).to.equal(utils.userToJSON(jsonSta));
                done();
            });
        });
    });

    describe('Create staff expect errors', function () {

        it("should return status 400 (not authorized) current user does not have authorisation to add new users", function (done) {
            supertest(app).put('/user/staff/a1').send(jsonSta).auth('a1', 'password').expect("Content-type", /json/).expect(401).end(function (err, res) {
                expect(res.status).to.equal(401);
                expect(res.text).to.equal("You do not have authorisation to do this");
                done();
            });

        });

        it("should return status 401 (error) error in adding the user with invalid data", function (done) {
            supertest(app).put('/user/staff/a1').send("INVALID DATA").auth('admin', 'admin').expect("Content-type", /json/).expect(401).end(function (err, res) {
                expect(res.status).to.equal(401);
                expect(res.text).to.equal("You do not have authorisation to do this");
                done();
            });

        });
    });

    describe('Create student', function () {
        it("should return status 201 (created) staff on success", function (done) {
            supertest(app).put('/user/student/et').send(jsonStu).auth('admin', 'admin').expect("Content-type", /json/).expect(201).end(function (err, res) {
                expect(res.status).to.equal(201);
                expect(res.body).to.equal(utils.userToJSON(jsonStu));
                done();
            });
        });

    });

    describe('Create student expect errors', function () {

        it("should return status 400 (not authorized) current user does not have authorisation to add new users", function (done) {
            supertest(app).put('/user/student/et').send(jsonStu).auth('a1', 'password').expect("Content-type", /json/).expect(401).end(function (err, res) {
                expect(res.status).to.equal(401);
                expect(res.text).to.equal("You do not have authorisation to do this");
                done();
            });

        });

        it("should return status 401 (error) error in adding the user with invalid data", function (done) {
            supertest(app).put('/user/student/et').send("INVALID DATA").auth('admin', 'admin').expect("Content-type", /json/).expect(401).end(function (err, res) {
                expect(res.status).to.equal(401);
                expect(res.text).to.equal("You do not have authorisation to do this");
                done();
            });

        });
    });


    describe('Should output a list of users with sensitive data hidden', function () {

        beforeEach(function () {
            supertest(app).get('/clear').auth('admin', 'admin').end(function (err, res) {
            });
        });

        it('should return a list of all users stored on the system', function (done) {
            supertest(app).put('/user/staff/a1').auth('admin', 'admin').send(jsonSta).end(function () {
                supertest(app).put('/user/staff/a2').auth('admin', 'admin').send(jsonSta1).end(function () {
                        supertest(app).get('/staff').auth('admin', 'admin').expect("Content-type", /json/).expect(200).end(function (err, res) {
                            expect(res.status).to.equal(200);
                            expect(JSON.parse(res.body)).to.include({
                                "research": "engineering,social",
                                "roomnumber": "JC0.22",
                                "telephone": "+447473941273",
                                "email": "john.smith@st-andrews.ac.uk",
                                "jobtitle": "Lecturer",
                                "surname": "Smith",
                                "given": "John",
                                "role": "staff",
                                "dissertations": []
                            });
                            expect(JSON.parse(res.body)).to.include({
                                "research": "software,informatics",
                                "roomnumber": "JC0.22",
                                "telephone": "+447473941272",
                                "email": "bill.ben@st-andrews.ac.uk",
                                "jobtitle": "Lecturer",
                                "surname": "ben",
                                "given": "bill",
                                "role": "staff",
                                "dissertations": []
                            });
                            done();
                        });
                });
            });
        });

        it('should return a list of all users stored on the system', function (done) {
            supertest(app).put('/user/student/et').auth('admin', 'admin').send(jsonStu).end(function () {
                supertest(app).put('/user/student/og').auth('admin', 'admin').send(jsonStu1).end(function () {
                        supertest(app).get('/student').auth('admin', 'admin').expect("Content-type", /json/).expect(200).end(function (err, res) {
                            expect(res.status).to.equal(200);
                            expect(JSON.parse(res.body)).to.include({
                                "surname": 'Turner',
                                "given": 'Elliot',
                                "role": 'student',
                                "dissertations": []
                            });
                            expect(JSON.parse(res.body)).to.include({
                                "surname": 'g',
                                "given": 'Oslo',
                                "role": 'student',
                                "dissertations": []
                            });
                            done();

                    });
                });
            });
        });
    });


    describe('Should output a user for a given id with sensitive data hidden', function () {

        beforeEach(function () {
            supertest(app).get('/clear').end(function (err, res) {
            });
        });

        it('should return a staff user for a given id', function (done) {
            supertest(app).put('/user/staff/a1').send(jsonSta).auth('admin', 'admin').end(function (err, res) {
                supertest(app).get('/staff/id/a1').auth('admin', 'admin').expect("Content-type", /json/).expect(200).end(function (err, res) {
                    expect(res.status).to.equal(200);
                    expect(JSON.parse(res.body)).to.eql({
                        "dissertations": [],
                        "email": "john.smith@st-andrews.ac.uk",
                        "given": "John",
                        "jobtitle": "Lecturer",
                        "research": "engineering,social",
                        "role": "staff",
                        "roomnumber": "JC0.22",
                        "surname": "Smith",
                        "telephone": "+447473941273"
                    });
                    done();
                });
            });
        });

        it('should return a student user for a given id', function (done) {
            supertest(app).put('/user/student/et').send(jsonStu).auth('admin', 'admin').end(function (err, res) {
                supertest(app).get('/student/id/et').auth('admin', 'admin').expect("Content-type", /json/).expect(200).end(function (err, res) {
                    expect(res.status).to.equal(200);
                    expect(JSON.parse(res.body)).to.eql({
                        "surname": "Turner",
                        "given": "Elliot",
                        "role": "student",
                        "dissertations": []
                    });
                    done();
                });
            });
        });

    });

    describe('Get user expect errors', function () {

        beforeEach(function () {
            supertest(app).get('/clear').end(function (err, res) {
            });
        });

        it('Should return 404 (not found) staff not found error', function (done) {
            supertest(app).get('/staff/id/').auth('admin', 'admin').expect("Content-type", /json/).expect(200).end(function (err, res) {
                expect(res.status).to.equal(404);
                done();
            });
        });

        it('Should return 400 (bad request) error for staff', function (done) {
            supertest(app).get('/staff/id/INVALID').auth('admin', 'admin').expect("Content-type", /json/).expect(200).end(function (err, res) {
                expect(res.status).to.equal(400);
                expect(res.text).to.equal("Staff member not found");
                done();
            });
        });

        it('Should return 404 (not found) student not found error', function (done) {
            supertest(app).get('/student/id/').auth('admin', 'admin').expect("Content-type", /json/).expect(200).end(function (err, res) {
                expect(res.status).to.equal(404);
                done();
            });
        });

        it('Should return 400 (bad request) error for student', function (done) {
            supertest(app).get('/student/id/INVALID').auth('admin', 'admin').expect("Content-type", /json/).expect(200).end(function (err, res) {
                expect(res.status).to.equal(400);
                expect(res.text).to.equal("Student member not found");
                done();
            });
        });

    });


    describe('Should delete a staff user', function () {

        beforeEach(function () {
            supertest(app).get('/clear').end(function (err, res) {
            });
        });

        it('should delete a student with id a1 then delete it and make sure it no longer in the system', function (done) {
            supertest(app).put('/user/staff/a1').auth('admin', 'admin').send(jsonSta).end(function () {
                supertest(app).delete('/staff/a1').auth('admin', 'admin').expect("Content-type", /json/).expect(202).end(function (err, res) {
                    expect(res.status).to.equal(202);
                    expect(res.text).to.equal("Delete successful");
                    supertest(app).get('/staff/id/a1').auth('admin', 'admin').expect("Content-type", /json/).expect(400).end(function (err, res) {
                        expect(res.status).to.equal(400);
                        expect(res.text).to.equal("Staff member not found");
                        done();
                    });
                });
            });
        })

    });

    describe('Should delete a student user', function () {

        beforeEach(function () {
            supertest(app).get('/clear').end(function (err, res) {
            });
        });

        it('should delete a student with id et then delete it and make sure it no longer in the system', function (done) {
            supertest(app).put('/user/student/et').auth('admin', 'admin').send(jsonStu).end(function () {
                supertest(app).delete('/student/et').auth('admin', 'admin').expect("Content-type", /json/).expect(202).end(function (err, res) {
                    expect(res.status).to.equal(202);
                    expect(res.text).to.equal("Delete successful");
                    supertest(app).get('/student/id/et').auth('admin', 'admin').expect("Content-type", /json/).expect(400).end(function (err, res) {
                        expect(res.status).to.equal(400);
                        expect(res.text).to.equal("Student member not found");
                        done();
                    });
                });
            });
        })

    });

    describe('Delete staff user expect errors', function () {

        beforeEach(function () {
            supertest(app).get('/clear').end(function (err, res) {
            });
        });

        it('Should return 400 (bad request) staff user not found error ', function (done) {
            supertest(app).delete('/staff/INVALID').auth('admin', 'admin').expect("Content-type", /json/).expect(400).end(function (err, res) {
                expect(res.status).to.equal(400);
                expect(res.text).to.equal("Staff member not fond");
                done();
            });
        });

        it('Should return 401 (unauthorized)', function (done) {
            supertest(app).put('/user/staff/a1').send(jsonSta).auth('admin', 'admin').end(function (err, res) {
                supertest(app).delete('/staff/a1').auth('a1', 'password').expect("Content-type", /json/).expect(400).end(function (err, res) {
                    expect(res.status).to.equal(401);
                    expect(res.text).to.equal("You do not have authorisation to do this");
                    done();
                });
            });
        });
    });


    describe('Delete staff user expect errors', function () {

        beforeEach(function () {
            supertest(app).get('/clear').end(function (err, res) {
            });
        });

        it('Should return 400 (bad request) student user not found error ', function (done) {
            supertest(app).delete('/student/INVALID').auth('admin', 'admin').expect("Content-type", /json/).expect(400).end(function (err, res) {
                expect(res.status).to.equal(400);
                expect(res.text).to.equal("Student not fond");
                done();
            });
        });

        it('Should return 401 (unauthorized)', function (done) {
            supertest(app).put('/user/student/et').send(jsonStu).auth('admin', 'admin').end(function (err, res) {
                supertest(app).delete('/student/et').auth('et', 'password').expect("Content-type", /json/).expect(400).end(function (err, res) {
                    expect(res.status).to.equal(401);
                    expect(res.text).to.equal("You do not have authorisation to do this");
                    done();
                });
            });
        });
    });


    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    describe('Create dissertation', function () {

        beforeEach(function () {
            supertest(app).get('/clear').auth('admin', 'admin').end(function (err, res) {
            });
        });

        it("should return status 201 (created) dissertation on success", function (done) {
            supertest(app).put('/user/student/et').send(jsonStu).auth('admin', 'admin').end(function (err, res) {
                supertest(app).post('/dissertation').send(jsonDis1).auth('et', 'password').expect("Content-type", /json/).expect(201).end(function (err, res) {
                    expect(res.status).to.equal(201);
                    expect(res.body).to.eqls(utils.dissertationEntryToJSON(jsonDis1));
                    done();
                });
            });
        });
    });

    describe('Create dissertation expect errors', function () {

        beforeEach(function () {
            supertest(app).get('/clear').auth('admin', 'admin').end(function (err, res) {
            });
        });

        it("should return status 401 (not authorized) current user does not have authorisation to add the dissertation", function (done) {
            supertest(app).put('/user/student/et').send(jsonStu).auth('admin', 'admin').end(function (err, res) {
                supertest(app).put('/user/student/og').send(jsonStu1).auth('admin', 'admin').end(function (err, res) {
                    supertest(app).post('/dissertation').send(jsonDis1).auth('og', 'password').expect("Content-type", /json/).expect(201).end(function (err, res) {
                        expect(res.status).to.equal(401);
                        expect(res.text).to.equal("You do not have authorisation to do this");
                        done();
                    });
                });
            });
        });

        it("should return status 400 (error) error in adding the user with invalid data", function (done) {
            supertest(app).post('/dissertation').send({"proposer": 'admin',}).auth('admin', 'admin').expect("Content-type", /json/).expect(401).end(function (err, res) {
                expect(res.status).to.equal(400);
                done();
            });

        });
    });


    describe('Should output a list of dissertations with sensitive data hidden', function () {

        beforeEach(function () {
            supertest(app).get('/clear').auth('admin', 'admin').end(function (err, res) {
            });
        });

        it('should return a list of all dissertations stored on the system', function (done) {
            supertest(app).put('/user/staff/a2').send(jsonSta1).auth('admin', 'admin').end(function (err, res) {
                supertest(app).put('/user/staff/a3').send(jsonSta2).auth('admin', 'admin').end(function (err, res) {
                    supertest(app).put('/user/student/et').send(jsonStu).auth('admin', 'admin').end(function (err, res) {
                        supertest(app).put('/user/student/og').send(jsonStu2).auth('admin', 'admin').end(function (err, res) {
                            supertest(app).post('/dissertation').send(jsonDis1).auth('et', 'password').end(function (err, res) {
                                supertest(app).post('/dissertation').send(jsonDis2).auth('a2', 'password').end(function (err, res) {
                                    supertest(app).post('/dissertation').send(jsonDis5).auth('a2', 'password').end(function (err, res) {
                                        supertest(app).get('/dissertation').auth('admin', 'admin').expect("Content-type", /json/).expect(200).end(function (err, res) {
                                            expect(res.status).to.equal(200);
                                            expect(JSON.parse(res.body)).not.to.include({
                                                "supervisor": 'a1',
                                                "proposer_role": 'student',
                                                "proposer": 'et',
                                                "description": 'test1',
                                                "title": '1',
                                                "interests": []
                                            });
                                            expect(JSON.parse(res.body)).to.include({
                                                "supervisor": "a2",
                                                "proposer_role": "staff",
                                                "proposer": "a2",
                                                "description": "test2",
                                                "title": "2",
                                                "interests": []
                                            });
                                            expect(JSON.parse(res.body)).to.include({
                                                "supervisor": "a2",
                                                "proposer_role": "staff",
                                                "proposer": "a2",
                                                "description": "test2",
                                                "title": "2",
                                                "interests": []
                                            });
                                            expect(JSON.parse(res.body)).to.include({
                                                "supervisor": 'a2',
                                                "proposer_role": 'staff',
                                                "proposer": 'a2',
                                                "description": 'test5',
                                                "title": '5',
                                                "interests": []
                                            });
                                            done();
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });


    describe('Should output a dissertation for a given id with sensitive data hidden', function () {
        beforeEach(function () {
            supertest(app).get('/clear').auth('admin', 'admin  ').end(function (err, res) {
            });
        });

        it('should return a dissertation for a given id if proposer', function (done) {
            supertest(app).put('/user/student/et').send(jsonStu).auth('admin', 'admin').end(function (err, res) {
                supertest(app).post('/dissertation').send(jsonDis1).auth('et', 'password').end(function (err, res) {
                    supertest(app).get('/dissertation/id/1').auth('et', 'password').expect("Content-type", /json/).expect(200).end(function (err, res) {
                        expect(res.status).to.equal(200);
                        expect(JSON.parse(res.body)).to.eql({
                            "supervisor": "a1",
                            "proposer_role": "student",
                            "proposer": "et",
                            "description": "test1",
                            "title": "1",
                            "interests": []
                        });
                        done();
                    });
                });
            });
        });

        it('should return a dissertation for a given id if teacher', function (done) {
            supertest(app).put('/user/staff/a1').send(jsonSta).auth('admin', 'admin').end(function (err, res) {
                supertest(app).post('/dissertation').send(jsonDis1).auth('a1', 'password').end(function (err, res) {
                    supertest(app).get('/dissertation/id/2').auth('a1', 'password').expect("Content-type", /json/).expect(200).end(function (err, res) {
                        expect(res.status).to.equal(200);
                        expect(JSON.parse(res.body)).to.eql({
                            "description": "test2",
                            "interests": [],
                            "proposer": "a2",
                            "proposer_role": "staff",
                            "supervisor": "a2",
                            "title": "2"
                        });
                        done();
                    });
                });
            });
        });

    });

    describe('Get dissertations expect errors', function () {

        beforeEach(function () {
            supertest(app).get('/clear').auth('admin', 'admin').end(function (err, res) {
            });
        });


        it('Should return 401 (not authorised) when student tries to view dissertation where the dissertation is assigned to someone else', function (done) {
            supertest(app).put('/user/student/et').send(jsonStu).auth('admin', 'admin').end(function (err, res) {
                supertest(app).put('/user/student/og').send(jsonStu1).auth('admin', 'admin').end(function (err, res) {
                    supertest(app).post('/dissertation').send(jsonDis1).auth('et', 'password').end(function (err, res) {
                        supertest(app).get('/dissertation/id/1').auth('og', 'password').expect("Content-type", /json/).expect(401).end(function (err, res) {
                            expect(res.status).to.equal(401);
                            expect(res.text).to.equal("You do not have authorisation to do this");
                            done();
                        });
                    });
                });
            });
        });

        it('Should return 404 (Not found) error', function (done) {
            supertest(app).get('/dissertation/id/2').auth('admin', 'admin').expect("Content-type", /json/).expect(404).end(function (err, res) {
                expect(res.status).to.equal(404);
                expect(res.text).to.equal("Dissertation not found");
                done();
            });
        });

        it('Should return 400 (bad request) error invalid id', function (done) {
            supertest(app).get('/dissertation/id/INVALID').auth('admin', 'admin').expect("Content-type", /json/).expect(400).end(function (err, res) {
                expect(res.status).to.equal(400);
                expect(res.body).to.eql({
                    "message": "Cast to number failed for value \"INVALID\" at path \"id\"",
                    "name": "CastError",
                    "kind": "number",
                    "value": "INVALID",
                    "path": "id"
                });
                done();
            });
        });
    });


    describe('Should delete a dissertation', function () {

        beforeEach(function () {
            supertest(app).get('/clear').auth('admin', 'admin').end(function (err, res) {
            });
        });

        it('should delete a dissertation with id 1', function (done) {
            supertest(app).put('/user/student/et').send(jsonStu).auth('admin', 'admin').end(function (err, res) {
                supertest(app).post('/dissertation').send(jsonDis1).auth('et', 'password').end(function (err, res) {
                    supertest(app).delete('/dissertation/1').auth('et', 'password').expect("Content-type", /json/).expect(202).end(function (err, res) {
                        expect(res.status).to.equal(202);
                        expect(res.text).to.equal("Delete successful");
                        supertest(app).delete('/dissertation/1').auth('admin', 'admin').expect("Content-type", /json/).expect(404).end(function (err, res) {
                            expect(res.status).to.equal(404);
                            expect(res.text).to.equal("Dissertation not found");
                            done();
                        });
                    });
                });
            });
        });

    });


    describe('Delete a dissertation expect errors', function () {

        beforeEach(function () {
            supertest(app).get('/clear').auth('admin', 'admin').end(function (err, res) {
            });
        });

        it('Should return 400 (bad request) dissertation not found error ', function (done) {
            supertest(app).delete('/dissertation/2').auth('admin', 'admin').expect("Content-type", /json/).expect(404).end(function (err, res) {
                expect(res.status).to.equal(404);
                expect(res.text).to.equal("Dissertation not found");
                done();
            });
        });

        it('Should return 400 (bad request) error invalid id ', function (done) {
            supertest(app).delete('/dissertation/INVALID').auth('admin', 'admin').expect("Content-type", /json/).expect(400).end(function (err, res) {
                expect(res.status).to.equal(400);
                expect(res.body).to.eql({
                    "message": "Cast to number failed for value \"INVALID\" at path \"id\"",
                    "name": "CastError",
                    "kind": "number",
                    "value": "INVALID",
                    "path": "id"
                });
                done();
            });
        });

        it('Should return 401 (unauthorized)', function (done) {
            supertest(app).put('/user/student/et').send(jsonStu).auth('admin', 'admin').end(function (err, res) {
                supertest(app).put('/user/student/og').send(jsonStu1).auth('admin', 'admin').end(function (err, res) {
                    supertest(app).post('/dissertation').send(jsonDis1).auth('et', 'password').end(function (err, res) {
                        supertest(app).delete('/dissertation/1').auth('og', 'password').expect("Content-type", /json/).expect(400).end(function (err, res) {
                            expect(res.status).to.equal(401);
                            expect(res.text).to.equal("You do not have authorisation to do this");
                            done();
                        });
                    });
                });
            });
        });

    });


    describe('Update a dissertation', function () {

        beforeEach(function () {
            supertest(app).get('/clear').auth('admin', 'admin').end(function (err, res) {
            });
        });

        it('Should return 200 dissertation updated ', function (done) {
            supertest(app).put('/user/student/et').send(jsonStu).auth('admin', 'admin').end(function (err, res) {
                supertest(app).post('/dissertation').send(jsonDis1).auth('et', 'password').end(function (err, res) {
                    supertest(app).put('/dissertation/id/1').auth('et', 'password').send(jsonDisUpdate1).expect("Content-type", /json/).expect(200).end(function (err, res) {
                        expect(res.status).to.equal(200);
                        expect(res.body).to.equal(utils.dissertationEntryToJSON(jsonDisUpdate1));
                        done();
                });
            });
        });

        it('Should return 200 dissertation updated ', function (done) {
            supertest(app).put('/user/staff/a2').send(jsonSta).auth('admin', 'admin').end(function (err, res) {
                supertest(app).post('/dissertation').send(jsonDis2).auth('a1', 'password').end(function (err, res) {
                    supertest(app).put('/dissertation/id/2').auth('a1', 'password').send(jsonDisUpdate).expect("Content-type", /json/).expect(200).end(function (err, res) {
                        expect(res.status).to.equal(200);
                        expect(res.body).to.equal(utils.dissertationEntryToJSON(jsonDisUpdate));
                        done();
                        });
                    });
                 });
            });
        });

    });


    describe('Update a dissertation expect errors', function () {

        before(function () {
            supertest(app).get('/clear').auth('admin', 'admin').end(function (err, res) {
            });
        });

        it('Should return 400 (bad request) when no data sent', function (done) {
            supertest(app).put('/user/student/oj').send(jsonStu2).auth('admin', 'admin').end(function (err, res) {
                supertest(app).post('/dissertation').send(jsonDis4).auth('oj', 'password').end(function (err, res) {
                    supertest(app).put('/dissertation/id/4').auth('oj', 'password').expect("Content-type", /json/).expect(400).end(function (err, res) {
                        expect(res.status).to.equal(400);
                        expect(res.text).to.equal("Update contains invalid data");
                        done();
                    });
                });
            });
        });

        it('Should return 404 (not found) when invalid ID sent', function (done) {
            supertest(app).put('/user/student/oj').send(jsonStu2).auth('admin', 'admin').end(function (err, res) {
                supertest(app).post('/dissertation').send(jsonDis4).auth('oj', 'password').end(function (err, res) {
                    supertest(app).put('/dissertation/id/INVALID').send(jsonDisUpdate1).auth('oj', 'password').expect("Content-type", /json/).expect(400).end(function (err, res) {
                        expect(res.status).to.equal(400);
                        expect(res.body).to.eql({
                            "message": "Cast to number failed for value \"INVALID\" at path \"id\"",
                            "name": "CastError",
                            "kind": "number",
                            "value": "INVALID",
                            "path": "id"
                        });
                        done();
                    });
                });
            });
        });

        it('Should return 401 (Unauthorised)', function (done) {
            supertest(app).put('/user/student/et').send(jsonStu).auth('admin', 'admin').end(function (err, res) {
                supertest(app).put('/user/staff/a2').send(jsonSta1).auth('admin', 'admin').end(function (err, res) {
                    supertest(app).post('/dissertation').send(jsonDis5).auth('a2', 'password').end(function (err, res) {
                        supertest(app).put('/dissertation/id/5').auth('et', 'password').send(jsonDisUpdate).expect("Content-type", /json/).expect(401).end(function (err, res) {
                            expect(res.status).to.equal(401);
                            expect(res.text).to.equal("You do not have authorisation to do this");
                            done();
                        });
                    });
                });
            });
        });

    });


    describe('Show interest in dissertation', function () {

        beforeEach(function () {
            supertest(app).get('/clear').auth('admin', 'admin').end(function (err, res) {
            });
        });

        it('Should return 200 interest added ', function (done) {
            supertest(app).put('/user/staff/a1').send(jsonSta).auth('admin', 'admin').end(function (err, res) {
                supertest(app).put('/user/student/oj').send(jsonStu2).auth('admin', 'admin').end(function (err, res) {
                    supertest(app).post('/dissertation').send(jsonDis3).auth('a1', 'password').end(function (err, res) {
                        supertest(app).post('/dissertation/3/interest/oj').auth('oj', 'password').expect("Content-type", /json/).expect(200).end(function (err, res) {
                            expect(res.status).to.equal(200);
                            expect(res.body).to.contain('oj');
                            done();
                        });
                    });
                });

            });
        });

    });

    describe('Add interest expect errors', function () {

        beforeEach(function () {
            supertest(app).get('/clear').auth('admin', 'admin').end(function (err, res) {
            });
        });

        it('Should return 401 (Unauthorised) cant add interest for other user ', function (done) {
            supertest(app).put('/user/staff/a1').send(jsonSta).auth('admin', 'admin').end(function (err, res) {
                supertest(app).put('/user/student/oj').send(jsonStu2).auth('admin', 'admin').end(function (err, res) {
                    supertest(app).put('/user/student/et').send(jsonStu).auth('admin', 'admin').end(function (err, res) {
                        supertest(app).post('/dissertation').send(jsonDis3).auth('a1', 'password').end(function (err, res) {
                            supertest(app).post('/dissertation/3/interest/et').auth('oj', 'password').expect("Content-type", /json/).expect(200).end(function (err, res) {
                                expect(res.status).to.equal(401);
                                expect(res.text).to.equal("You do not have authorisation to do this");
                                done();
                            });
                        });
                    });
                });

            });
        });

        it('Should return 4040 (Not found) ', function (done) {
            supertest(app).put('/user/staff/a1').send(jsonSta).auth('admin', 'admin').end(function (err, res) {
                supertest(app).put('/user/student/oj').send(jsonStu2).auth('admin', 'admin').end(function (err, res) {
                    supertest(app).post('/dissertation').send(jsonDis3).auth('a1', 'password').end(function (err, res) {
                        supertest(app).post('/dissertation/INVALID/interest/INVALID').auth('oj', 'password').send(jsonDisUpdate1).expect("Content-type", /json/).end(function (err, res) {
                            expect(res.status).to.equal(400);
                            expect(res.body).to.eql({
                                "message": "Cast to number failed for value \"INVALID\" at path \"id\"",
                                "name": "CastError",
                                "kind": "number",
                                "value": "INVALID",
                                "path": "id"
                            });
                            done();
                        });
                    });
                });
            });
        });


    });

    describe('Assign dissertations', function () {

        before(function () {
            supertest(app).get('/clear').auth('admin', 'admin').end(function (err, res) {
            });
        });

        it('Should return 200 dissertation assigned', function (done) {
            supertest(app).put('/user/staff/a1').send(jsonSta).auth('admin', 'admin').end(function (err, res) {
                supertest(app).put('/user/student/oj').send(jsonStu2).auth('admin', 'admin').end(function (err, res) {
                    supertest(app).post('/dissertation').send(jsonDis3).auth('a1', 'password').end(function (err, res) {
                        supertest(app).post('/dissertation').send(jsonDis3).auth('a1', 'password').end(function (err, res) {
                        supertest(app).post('/dissertation/3/interest/oj').auth('oj', 'password').expect("Content-type", /json/).expect(200).end(function (err, res) {
                            supertest(app).post('/dissertation/3/allocation/oj').auth('a1', 'password').expect("Content-type", /json/).end(function (err, res) {
                                expect(res.status).to.equal(200);
                                expect(JSON.parse(res.body)).to.eql(
                                    {"supervisor":"a1",
                                        "proposer_role":"staff",
                                        "proposer":"a1",
                                        "description":"test3",
                                        "title":"3",
                                        "interests":["oj"]});
                                done();
                            });
                        });
                    });
                });
            });
        });
        });

    });

    describe('Assign dissertations expect errors', function () {

        before(function () {
            supertest(app).get('/clear').auth('admin', 'admin').end(function (err, res) {
            });

        });

        it('Should return 401 (bad request) needs to show interest', function (done) {
            supertest(app).put('/user/staff/a1').send(jsonSta).auth('admin', 'admin').end(function (err, res) {
                supertest(app).put('/user/student/oj').send(jsonStu2).auth('admin', 'admin').end(function (err, res) {
                    supertest(app).post('/dissertation').send(jsonDis3).auth('a1', 'password').end(function (err, res) {
                        supertest(app).post('/dissertation').send(jsonDis3).auth('a1', 'password').end(function (err, res) {
                                supertest(app).post('/dissertation/3/allocation/oj').auth('a1', 'password').expect("Content-type", /json/).end(function (err, res) {
                                    expect(res.status).to.equal(401);
                                    expect(res.text).to.equal("User needs to show interest in this dissertation before it can be adopted");
                                    done();
                                });
                            });
                        });
                    });
                });
            });



        it('Should return 401 (Unauthorized) users need show interest', function (done) {
            supertest(app).post('/dissertation/3/allocation/oj').auth('admin', 'admin').expect("Content-type", /json/).expect(401).end(function (err, res) {
                expect(res.status).to.equal(401);
                expect(res.text).to.equal("User needs to show interest in this dissertation before it can be adopted");
                done();
            });
        });

        it('Should return 404 (Not fond) when dissertation or user does not exist', function (done) {
            supertest(app).post('/dissertation/INVALID/allocation/INVALID').auth('admin', 'admin').expect("Content-type", /json/).expect(401).end(function (err, res) {
                expect(res.body).to.eql({
                    "message": "Cast to number failed for value \"INVALID\" at path \"id\"",
                    "name": "CastError",
                    "kind": "number",
                    "value": "INVALID",
                    "path": "id"
                });
                done();
            });
        });

        it('Should return 401 (Unauthorized) when srudent tries to adopt dissertation', function (done) {
            supertest(app).post('/dissertation/3/allocation/OJ').auth('oj', 'password').expect("Content-type", /json/).expect(401).end(function (err, res) {
                expect(res.status).to.equal(401);
                expect(res.text).to.equal('Unauthorized');
                done();
            });
        });

    });











    describe('Update a staff member', function () {

        before(function () {
            supertest(app).get('/clear').auth('admin', 'admin').end(function (err, res) {
            });

        });

        it('Should return 200 user updated ', function (done) {
            supertest(app).put('/user/staff/a1').send(jsonSta).auth('admin', 'admin').expect("Content-type", /json/).end(function (err, res) {
                supertest(app).put('/staff/id/a1').auth('a1', 'password').send(jsonStaffUpdate).expect("Content-type", /json/).expect(200).end(function (err, res) {
                    expect(res.status).to.equal(200);
                    expect(res.body).to.equal(utils.userToJSON(jsonStaffUpdate));
                    done();
            }); });
        });


    });



    describe('Update a staff member expect errors', function () {

        beforeEach(function () {
            supertest(app).get('/clear').auth('admin', 'admin').end(function (err, res) {
            });
        });


        it('Should return 401 (bad request) when no data sent', function (done) {
            supertest(app).put('/user/staff/a1').send(jsonSta).auth('admin', 'admin').expect("Content-type", /json/).end(function (err, res) {
                supertest(app).put('/staff/id/a1').auth('a1', 'password').send().expect("Content-type", /json/).expect(401).end(function (err, res) {
                    expect(res.status).to.equal(401);
                    expect(res.text).to.equal("Update contains invalid data");
                    done();
                }); });
        });


        it('Should return 404 (not found) when invalid ID sent', function (done) {
            supertest(app).put('/user/staff/a1').send(jsonSta).auth('admin', 'admin').expect("Content-type", /json/).end(function (err, res) {
                supertest(app).put('/staff/id/-1').auth('a1', 'password').send(jsonStaffUpdate).expect("Content-type", /json/).expect(404).end(function (err, res) {
                    expect(res.status).to.equal(404);
                    expect(res.text).to.equal("Staff not found");
                    done();
                }); });
        });

        it('Should return 401 (unauthorised) when invalid wrong user logged in', function (done) {
            supertest(app).put('/user/staff/a1').send(jsonSta).auth('admin', 'admin').expect("Content-type", /json/).end(function (err, res) {
                supertest(app).put('/user/student/et').send(jsonStu).auth('admin', 'admin').end(function (err, res) {
                    supertest(app).put('/staff/id/a1').auth('et', 'password').send(jsonStaffUpdate).expect("Content-type", /json/).expect(404).end(function (err, res) {
                        expect(res.status).to.equal(401);
                        expect(res.text).to.equal("You do not have authorisation to do this");
                        done();
                }); });})
        });

    });


    describe('Update a student member', function () {

        before(function () {
            supertest(app).get('/clear').auth('admin', 'admin').end(function (err, res) {
            });

        });

        it('Should return 200 user updated ', function (done) {
            supertest(app).put('/user/student/et').send(jsonStu).auth('admin', 'admin').expect("Content-type", /json/).end(function (err, res) {
                supertest(app).put('/student/id/et').auth('et', 'password').send(jsonStudentUpdate).expect("Content-type", /json/).expect(200).end(function (err, res) {
                    expect(res.status).to.equal(200);
                    expect(res.body).to.equal(utils.userToJSON(jsonStudentUpdate));
                    done();
                }); });
        });


    });



    describe('Update a student member expect errors', function () {

        beforeEach(function () {
            supertest(app).get('/clear').auth('admin', 'admin').end(function (err, res) {
            });
        });

        it('Should return 401 (bad request) when no data sent', function (done) {
            supertest(app).put('/user/student/et').send(jsonStu).auth('admin', 'admin').expect("Content-type", /json/).end(function (err, res) {
                supertest(app).put('/student/id/et').auth('et', 'password').send().expect("Content-type", /json/).expect(401).end(function (err, res) {
                    expect(res.status).to.equal(401);
                    expect(res.text).to.equal("Update contains invalid data");
                    done();
                }); });
        });


        it('Should return 404 (not found) when invalid ID sent', function (done) {
            supertest(app).put('/user/student/et').send(jsonStu).auth('admin', 'admin').expect("Content-type", /json/).end(function (err, res) {
                supertest(app).put('/student/id/-1').auth('et', 'password').send(jsonStudentUpdate).expect("Content-type", /json/).expect(404).end(function (err, res) {
                    expect(res.status).to.equal(404);
                    expect(res.text).to.equal("Student not found");
                    done();
                }); });
        });

        it('Should return 401 (unauthorised) when invalid wrong user logged in', function (done) {
            supertest(app).put('/user/student/et').send(jsonStu).auth('admin', 'admin').expect("Content-type", /json/).end(function (err, res) {
                supertest(app).put('/user/staff/a1').send(jsonSta).auth('admin', 'admin').end(function (err, res) {
                    supertest(app).put('/student/id/et').auth('a1', 'password').send(jsonStaffUpdate).expect("Content-type", /json/).expect(404).end(function (err, res) {
                        expect(res.status).to.equal(401);
                        expect(res.text).to.equal("You do not have authorisation to do this");
                        done();
                    }); });})
        });

    });



});



