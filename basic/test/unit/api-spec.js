/***********************************************************************************
 * Unit tests for the Web2 api implementation.
 ***********************************************************************************/

var expect = require('chai').expect;
//var http = require('http');
var express = require('express');

var model = require('../../js/model.js');
var dao = require('../../js/dataAccess.js');
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
var jsonDisUpdateInvalid = require('./../../testFiles/dissertation_json_update_invalid.json');

var jsonStaffUpdate = require('./../../testFiles/staff_json_update.json');
var jsonStudentUpdate = require('./../../testFiles/student_json_update.json');


describe('API', function() {

    before(function () {
        supertest(app).get('/clear').end(function (err, res) {
        });
    });

    describe('Log on', function () {
        it("should go to home page", function (done) {
            supertest(app).get("/").auth('admin', 'admin')
                .expect('Cannot GET /\n')
                .expect(404, done);
        });

    });

    describe('Create staff', function () {

        it("should return status 201 (created) staff on success", function (done) {
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

        it("should return status 400 (error) error in adding the user with invalid data", function (done) {
            supertest(app).put('/user/staff/a1').send("INVALID DATA").auth('admin', 'admin').expect("Content-type", /json/).expect(401).end(function (err, res) {
                expect(res.status).to.equal(400);
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

        it("should return status 400 (error) error in adding the user with invalid data", function (done) {
            supertest(app).put('/user/student/et').send("INVALID DATA").auth('admin', 'admin').expect("Content-type", /json/).expect(401).end(function (err, res) {
                expect(res.status).to.equal(400);
                done();
            });

        });
    });


    describe('Should output a list of users with sensitive data hidden', function () {

        before(function () {
            supertest(app).get('/clear').end(function (err, res) {
            });
            supertest(app).put('/user/staff/a1').send(jsonSta).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/staff/a2').send(jsonSta1).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/staff/a3').send(jsonSta2).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/student/et').send(jsonStu).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/student/oj').send(jsonStu1).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/student/og').send(jsonStu2).auth('admin', 'admin').end(function (err, res) {
            });
        });

        it('should return a list of all users stored on the system', function (done) {
            supertest(app).get('/user').auth('admin', 'admin').expect("Content-type", /json/).expect(200).end(function (err, res) {
                expect(res.status).to.equal(200);
                expect(res.body).to.include(utils.userToJSON(jsonSta));
                expect(res.body).to.include(utils.userToJSON(jsonSta1));
                expect(res.body).to.include(utils.userToJSON(jsonSta2));
                expect(res.body).to.include(utils.userToJSON(jsonStu));
                expect(res.body).to.include(utils.userToJSON(jsonStu1));
                expect(res.body).to.include(utils.userToJSON(jsonStu2));
                done();
            });
        });


    });

    describe('Should output a user for a given id with sensitive data hidden', function () {

        before(function () {
            supertest(app).get('/clear').end(function (err, res) {
            });
            supertest(app).put('/user/staff/a1').send(jsonSta).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/student/et').send(jsonStu).auth('admin', 'admin').end(function (err, res) {
            });
        });

        it('should return a user for a given id', function (done) {
            supertest(app).get('/user/id/a1').auth('admin', 'admin').expect("Content-type", /json/).expect(200).end(function (err, res) {
                expect(res.status).to.equal(200);
                expect(res.body).to.equal(utils.userToJSON(jsonSta));
                done();
            });
        });

        it('should return a user for a given id', function (done) {
            supertest(app).get('/user/id/et').auth('admin', 'admin').expect("Content-type", /json/).expect(200).end(function (err, res) {
                expect(res.status).to.equal(200);
                expect(res.body).to.equal(utils.userToJSON(jsonStu));
                done();
            });
        });

    });

    describe('Get user expect errors', function () {

        it('Should return 404 (not found) user not found error', function (done) {
            supertest(app).get('/user/id/').auth('admin', 'admin').expect("Content-type", /json/).expect(200).end(function (err, res) {
                expect(res.status).to.equal(404);
                done();
            });
        });

        it('Should return 400 (bad request) error', function (done) {
            supertest(app).get('/user/id/INVALID').auth('admin', 'admin').expect("Content-type", /json/).expect(200).end(function (err, res) {
                expect(res.status).to.equal(400);
                expect(res.text).to.equal("User not found");
                done();
            });
        });

    });


    describe('Should output all members of staff with sensitive data hidden', function () {

        before(function () {
            supertest(app).get('/clear').end(function (err, res) {
            });
            supertest(app).put('/user/staff/a1').send(jsonSta).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/staff/a2').send(jsonSta1).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/student/et').send(jsonStu).auth('admin', 'admin').end(function (err, res) {
            });
        });

        it('should return all staff', function (done) {
            supertest(app).get('/user').auth('admin', 'admin').expect("Content-type", /json/).expect(200).end(function (err, res) {
                expect(res.status).to.equal(200);
                expect(res.body).to.include(utils.userToJSON(jsonSta));
                expect(res.body).to.include(utils.userToJSON(jsonSta1));
                !expect(res.body).to.include(utils.userToJSON(jsonStu));
                done();
            });
        });

    });

    describe('Should delete a user', function () {

        before(function () {
            supertest(app).get('/clear').end(function (err, res) {
            });
            supertest(app).put('/user/staff/a1').send(jsonSta).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/staff/a2').send(jsonSta1).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/student/et').send(jsonStu).auth('admin', 'admin').end(function (err, res) {
            });
        });

        it('should delete a user with id a1', function (done) {
            supertest(app).delete('/user/a1').auth('admin', 'admin').expect("Content-type", /json/).expect(202).end(function (err, res) {
                expect(res.status).to.equal(202);
                expect(res.text).to.equal("Delete successful");
            });
            supertest(app).get('/user/id/a1').auth('admin', 'admin').expect("Content-type", /json/).expect(400).end(function (err, res) {
                expect(res.status).to.equal(400);
                expect(res.text).to.equal("User not found");
                done();
            });
        });

    });

    describe('Delete user expect errors', function () {

        it('Should return 400 (bad request) user not found error ', function (done) {
            supertest(app).delete('/user/INVALID').auth('admin', 'admin').expect("Content-type", /json/).expect(400).end(function (err, res) {
                expect(res.status).to.equal(400);
                expect(res.text).to.equal("User not found");
                done();
            });
        });

        it('Should return 401 (unauthorized)', function (done) {
            supertest(app).put('/user/staff/a1').send(jsonSta).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).delete('/user/a1').auth('a1', 'password').expect("Content-type", /json/).expect(400).end(function (err, res) {
                expect(res.status).to.equal(401);
                expect(res.text).to.equal("You do not have authorisation to do this");
                done();
            });
        });
    });


    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    describe('Create dissertation', function () {

        before(function () {
            supertest(app).get('/clear').end(function (err, res) {
            });
            supertest(app).put('/user/staff/a1').send(jsonSta).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/staff/a2').send(jsonSta1).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/staff/a3').send(jsonSta2).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/student/et').send(jsonStu).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/student/oj').send(jsonStu1).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/student/og').send(jsonStu2).auth('admin', 'admin').end(function (err, res) {
            });
        });

        it("should return status 201 (created) dissertation on success", function (done) {
            supertest(app).post('/dissertation').send(jsonDis1).auth('et', 'password').expect("Content-type", /json/).expect(201).end(function (err, res) {
                expect(res.status).to.equal(201);
                expect(res.body).to.eqls(utils.dissertationEntryToJSON(jsonDis1));
                done();
            });
        });
    });


    describe('Create dissertation expect errors', function () {

        it("should return status 401 (not authorized) current user does not have authorisation to add the dissertation", function (done) {
            supertest(app).put('/user/staff/a2').send(jsonSta1).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis2).auth('a1', 'password').expect("Content-type", /json/).expect(401).end(function (err, res) {
                expect(res.status).to.equal(401);
                expect(res.text).to.equal("You do not have authorisation to do this");
                done();
            });

        });

        it("should return status 400 (error) error in adding the user with invalid data", function (done) {
            supertest(app).post('/dissertation').send("INVALID DATA").auth('admin', 'admin').expect("Content-type", /json/).expect(401).end(function (err, res) {
                expect(res.status).to.equal(400);
                done();
            });

        });
    });


    describe('Should output a list of dissertations with sensitive data hidden', function () {

        before(function () {
            supertest(app).get('/clear').end(function (err, res) {
            });
            supertest(app).put('/user/staff/a1').send(jsonSta).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/staff/a2').send(jsonSta1).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/staff/a3').send(jsonSta2).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/student/et').send(jsonStu).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/student/oj').send(jsonStu1).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/student/og').send(jsonStu2).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis1).auth('et', 'password').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis2).auth('a2', 'password').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis3).auth('a1', 'password').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis4).auth('oj', 'password').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis5).auth('a2', 'password').end(function (err, res) {
            });
        });

        it('should return a list of all dissertations stored on the system', function (done) {
            supertest(app).get('/dissertation').auth('admin', 'admin').expect("Content-type", /json/).expect(200).end(function (err, res) {
                expect(res.status).to.equal(200);
                expect(res.body).not.include(utils.dissertationEntryToJSON(jsonDis1));
                expect(res.body).to.include(utils.dissertationEntryToJSON(jsonDis2));
                expect(res.body).to.include(utils.dissertationEntryToJSON(jsonDis3));
                expect(res.body).not.to.include(utils.dissertationEntryToJSON(jsonDis4));
                expect(res.body).to.include(utils.dissertationEntryToJSON(jsonDis5));
                done();
            });
        });
    });


    describe('Should output a dissertation for a given id with sensitive data hidden', function () {
        before(function () {
            supertest(app).get('/clear').end(function (err, res) {
            });
            supertest(app).put('/user/staff/a1').send(jsonSta).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/student/et').send(jsonStu).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis1).auth('et', 'password').end(function (err, res) {
            });
        });

        it('should return a dissertation for a given id if proposer', function (done) {
            supertest(app).get('/dissertation/id/1').auth('et', 'password').expect("Content-type", /json/).expect(200).end(function (err, res) {
                expect(res.status).to.equal(200);
                expect(res.body).to.equal(utils.dissertationEntryToJSON(jsonDis1));
                done();
            });
        });

        it('should return a dissertation for a given id if teacher', function (done) {
            supertest(app).get('/dissertation/id/1').auth('a1', 'password').expect("Content-type", /json/).expect(200).end(function (err, res) {
                expect(res.status).to.equal(200);
                expect(res.body).to.equal(utils.dissertationEntryToJSON(jsonDis1));
                done();
            });
        });

    });

    describe('Get dissertations expect errors', function () {

        before(function () {
            supertest(app).get('/clear').end(function (err, res) {
            });
            supertest(app).put('/user/staff/a1').send(jsonSta).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/staff/a2').send(jsonSta1).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/staff/a3').send(jsonSta2).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/student/et').send(jsonStu).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/student/oj').send(jsonStu1).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/student/og').send(jsonStu2).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis1).auth('et', 'password').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis2).auth('a2', 'password').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis3).auth('a1', 'password').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis4).auth('oj', 'password').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis5).auth('a2', 'password').end(function (err, res) {
            });
        });


        it('Should return 401 (not authorised) when student tries to view dissertation where the dissertation is assigned to someone else', function (done) {
            supertest(app).get('/dissertation/id/1').auth('og', 'password').expect("Content-type", /json/).expect(401).end(function (err, res) {
                expect(res.status).to.equal(401);
                expect(res.text).to.equal("You do not have authorisation to do this");
                done();
            });
        });

        it('Should return 400 (bad request) error', function (done) {
            supertest(app).get('/dissertation/id/INVALID').auth('admin', 'admin').expect("Content-type", /json/).expect(404).end(function (err, res) {
                expect(res.status).to.equal(404);
                expect(res.text).to.equal("Dissertation not found");
                done();
            });
        });


    });

    describe('Should delete a dissertation', function () {

        before(function () {
            supertest(app).get('/clear').end(function (err, res) {
            });
            supertest(app).put('/user/student/et').send(jsonStu).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis1).auth('et', 'password').end(function (err, res) {
            });
        });

        it('should delete a dissertation with id 1', function (done) {
            supertest(app).delete('/dissertation/1').auth('et', 'password').expect("Content-type", /json/).expect(202).end(function (err, res) {
                expect(res.status).to.equal(202);
                expect(res.text).to.equal("Delete successful");
            });
            supertest(app).delete('/dissertation/1').auth('admin', 'admin').expect("Content-type", /json/).expect(400).end(function (err, res) {
                expect(res.status).to.equal(400);
                expect(res.text).to.equal("Dissertation not found");
                done();
            });
        });

    });

    describe('Delete a dissertation expect errors', function () {

        before(function () {
            supertest(app).get('/clear').end(function (err, res) {
            });
            supertest(app).put('/user/student/et').send(jsonStu).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/student/og').send(jsonStu1).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis1).auth('et', 'password').end(function (err, res) {
            });
        });


        it('Should return 400 (bad request) dissertation not found error ', function (done) {
            supertest(app).delete('/dissertation/INVALID').auth('admin', 'admin').expect("Content-type", /json/).expect(400).end(function (err, res) {
                expect(res.status).to.equal(400);
                expect(res.text).to.equal("Dissertation not found");
                done();
            });
        });

        it('Should return 401 (unauthorized)', function (done) {
            supertest(app).delete('/dissertation/1').auth('og', 'password').expect("Content-type", /json/).expect(400).end(function (err, res) {
                expect(res.status).to.equal(401);
                expect(res.text).to.equal("You do not have authorisation to do this");
                done();
            });
        });

    });


    describe('Update a dissertation', function () {

        before(function () {
            supertest(app).get('/clear').end(function (err, res) {
            });
            supertest(app).put('/user/student/et').send(jsonStu).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/student/og').send(jsonStu2).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/student/oj').send(jsonStu1).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/staff/a2').send(jsonSta1).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis1).auth('et', 'password').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis5).auth('a2', 'password').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis4).auth('oj', 'password').end(function (err, res) {
            });
        });

        it('Should return 200 dissertation updated ', function (done) {
            supertest(app).put('/dissertation/id/4').auth('oj', 'password').send(jsonDisUpdate1).expect("Content-type", /json/).expect(200).end(function (err, res) {
                expect(res.status).to.equal(200);
                expect(res.body).to.equal(utils.dissertationEntryToJSON(jsonDisUpdate1));
                done();
            });
        });

        it('Should return 200 dissertation updated ', function (done) {
            supertest(app).put('/dissertation/id/5').auth('a2', 'password').send(jsonDisUpdate).expect("Content-type", /json/).expect(200).end(function (err, res) {
                expect(res.status).to.equal(200);
                expect(res.body).to.equal(utils.dissertationEntryToJSON(jsonDisUpdate));
                done();
            });
        });

        it('Should return 200 dissertation updated ', function (done) {
            supertest(app).put('/dissertation/id/4').auth('admin', 'admin').send(jsonDisUpdate1).expect("Content-type", /json/).expect(200).end(function (err, res) {
                expect(res.status).to.equal(200);
                expect(res.body).to.equal(utils.dissertationEntryToJSON(jsonDisUpdate1));
                done();
            });
        });

    });



    describe('Update a dissertation expect errors', function () {

        before(function () {
            supertest(app).get('/clear').end(function (err, res) {
            });
            supertest(app).put('/user/student/et').send(jsonStu).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/student/og').send(jsonStu2).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/student/oj').send(jsonStu1).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/staff/a2').send(jsonSta1).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis1).auth('et', 'password').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis5).auth('a2', 'password').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis4).auth('oj', 'password').end(function (err, res) {
            });
        });

        it('Should return 400 (bad request) when no data sent', function (done) {
            supertest(app).put('/dissertation/id/4').auth('oj', 'password').expect("Content-type", /json/).expect(400).end(function (err, res) {
                expect(res.status).to.equal(400);
                expect(res.text).to.equal("Query missing valid data and or parameters");
                done();
            });
        });

        it('Should return 400 (bad request) when invalid data sent', function (done) {
            supertest(app).put('/dissertation/id/4').send(jsonDisUpdateInvalid).auth('oj', 'password').expect("Content-type", /json/).expect(400).end(function (err, res) {
                expect(res.status).to.equal(400);
                expect(res.text).to.equal("Problem with update in new dissertation");
                done();
            });
        });

        it('Should return 404 (not found) when invalid ID sent', function (done) {
            supertest(app).put('/dissertation/id/INVALID').send(jsonDisUpdate1).auth('oj', 'password').expect("Content-type", /json/).expect(400).end(function (err, res) {
                expect(res.status).to.equal(400);
                expect(res.text).to.equal("Query missing valid data and or parameters");
                done();
            });
        });

        it('Should return 401 (Unauthorised)', function (done) {
            supertest(app).put('/dissertation/id/5').auth('et', 'password').send(jsonDisUpdate).expect("Content-type", /json/).expect(401).end(function (err, res) {
                expect(res.status).to.equal(401);
                expect(res.text).to.equal("You do not have authorisation to do this");
                done();
            });
        });

    });


    describe('Show interest in dissertation', function () {

        before(function () {
            supertest(app).get('/clear').end(function (err, res) {
            });
            supertest(app).put('/user/staff/a1').send(jsonSta).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/staff/a2').send(jsonSta1).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/staff/a3').send(jsonSta2).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/student/et').send(jsonStu).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/student/oj').send(jsonStu1).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/student/og').send(jsonStu2).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis1).auth('et', 'password').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis2).auth('a2', 'password').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis3).auth('a1', 'password').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis4).auth('oj', 'password').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis5).auth('a2', 'password').end(function (err, res) {
            });
        });

        it('Should return 200 interest added ', function (done) {
            supertest(app).post('/dissertation/3/interest/oj').auth('oj', 'password').expect("Content-type", /json/).expect(200).end(function (err, res) {
                expect(res.status).to.equal(200);
                expect(res.body).to.contain('oj');
                done();

            });
        });

    });

    describe('Add interest expect errors', function () {

        before(function () {
            supertest(app).get('/clear').end(function (err, res) {
            });
            supertest(app).put('/user/staff/a1').send(jsonSta).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/staff/a2').send(jsonSta1).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/staff/a3').send(jsonSta2).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/student/et').send(jsonStu).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/student/oj').send(jsonStu1).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/student/og').send(jsonStu2).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis1).auth('et', 'password').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis2).auth('a2', 'password').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis3).auth('a1', 'password').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis4).auth('oj', 'password').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis5).auth('a2', 'password').end(function (err, res) {
            });
        });

        it('Should return 401 (Unauthorised) ', function (done) {
            supertest(app).post('/dissertation/3/interest/et').auth('oj', 'password').expect("Content-type", /json/).expect(200).end(function (err, res) {
                expect(res.status).to.equal(401);
                expect(res.text).to.equal("You do not have authorisation to do this");
                done();

            });
        });

        it('Should return 4040 (Not found) ', function (done) {
            supertest(app).post('/dissertation/INVALID/interest/INVALID').auth('oj', 'password').send(jsonDisUpdate1).expect("Content-type", /json/).expect(404).end(function (err, res) {
                expect(res.status).to.equal(404);
                expect(res.text).to.equal("Not fond");
                done();
            });
        });

    });



    describe('Assign dissertations', function () {

        before(function () {
            supertest(app).get('/clear').end(function (err, res) {
            });
            supertest(app).put('/user/staff/a1').send(jsonSta).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/staff/a2').send(jsonSta1).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/staff/a3').send(jsonSta2).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/student/et').send(jsonStu).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/student/oj').send(jsonStu1).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/student/og').send(jsonStu2).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis1).auth('et', 'password').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis2).auth('a2', 'password').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis3).auth('a1', 'password').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis4).auth('oj', 'password').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis5).auth('a2', 'password').end(function (err, res) {
            });
            supertest(app).post('/dissertation/3/interest/oj').auth('oj', 'password').expect("Content-type", /json/).expect(200).end(function (err, res) {
            });
        });

        it('Should return 200 dissertation assigned', function (done) {
            supertest(app).post('/dissertation/3/allocation/oj').auth('a1', 'password').expect("Content-type", /json/).expect(200).end(function (err, res) {
                expect(res.status).to.equal(200);
                expect(res.body).to.eql({
                    "assignedTo": "oj",
                    "available": false,
                    "description": "test3",
                    "id": 3,
                    "interests": ["oj"],
                    "proposer": "a1",
                    "proposer_role": "staff",
                    "supervisor": "",
                    "title": "3"
                });
            });
            supertest(app).get('/user/id/oj').auth('oj', 'password').expect("Content-type", /json/).expect(200).end(function (err, res) {
                expect(res.status).to.equal(200);
                expect(res.body).to.include('3');
                done();
            });
        });

    });

    describe('Assign dissertations expect errors', function () {

        before(function () {
            supertest(app).get('/clear').end(function (err, res) {
            });
            supertest(app).put('/user/staff/a1').send(jsonSta).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/staff/a2').send(jsonSta1).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/staff/a3').send(jsonSta2).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/student/et').send(jsonStu).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/student/oj').send(jsonStu1).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/student/og').send(jsonStu2).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis1).auth('et', 'password').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis2).auth('a2', 'password').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis3).auth('a1', 'password').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis4).auth('oj', 'password').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis5).auth('a2', 'password').end(function (err, res) {
            });
        });

        it('Should return 401 (Unauthorized) users need show interest', function (done) {
            supertest(app).post('/dissertation/3/allocation/oj').auth('admin', 'admin').expect("Content-type", /json/).expect(401).end(function (err, res) {
                expect(res.status).to.equal(401);
                expect(res.text).to.equal("User needs to show interest in this dissertation before it can be adopted");
                done();
            });
        });

        it('Should return 401 (Unauthorized) users need show interest', function (done) {
            supertest(app).post('/dissertation/3/interest/oj').auth('oj', 'password').expect("Content-type", /json/).expect(200).end(function (err, res) {
            });
            supertest(app).post('/dissertation/1/allocation/oj').auth('admin', 'admin').expect("Content-type", /json/).expect(401).end(function (err, res) {
                expect(res.status).to.equal(401);
                expect(res.text).to.equal("Cannot adopt dissertation");
                done();
            });
        });

        it('Should return 404 (Not fond) when dissertation or user does not exist', function (done) {
            supertest(app).post('/dissertation/INVALID/allocation/INVALID').auth('admin', 'admin').expect("Content-type", /json/).expect(404).end(function (err, res) {
                expect(res.status).to.equal(404);
                expect(res.text).to.equal("Not fond");
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
            supertest(app).get('/clear').end(function (err, res) {
            });
            supertest(app).put('/user/staff/a1').send(jsonSta).auth('admin', 'admin').expect("Content-type", /json/).end(function (err, res) {
            });
        });

        it('Should return 200 user updated ', function (done) {
            supertest(app).put('/staff/id/a1').auth('a1', 'password').send(jsonStaffUpdate).expect("Content-type", /json/).expect(200).end(function (err, res) {
                expect(res.status).to.equal(200);
                expect(res.body).to.equal(utils.userToJSON(jsonStaffUpdate));
                done();
            });
        });


    });



    describe('Update a staff member expect errors', function () {

        before(function () {
            supertest(app).get('/clear').end(function (err, res) {
            });
            supertest(app).put('/user/student/et').send(jsonStu).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/student/og').send(jsonStu2).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/student/oj').send(jsonStu1).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/staff/a2').send(jsonSta1).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis1).auth('et', 'password').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis5).auth('a2', 'password').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis4).auth('oj', 'password').end(function (err, res) {
            });
        });

        it('Should return 401 (bad request) when no data sent', function (done) {
            supertest(app).put('/staff/id/a1').auth('a1', 'password').send().expect("Content-type", /json/).expect(401).end(function (err, res) {
                expect(res.status).to.equal(401);
                done();
            });
        });


        it('Should return 404 (not found) when invalid ID sent', function (done) {
            supertest(app).put('/staff/id/INVALID').send(jsonDisUpdate1).auth('oj', 'password').expect("Content-type", /json/).expect(401).end(function (err, res) {
                expect(res.status).to.equal(401);
                expect(res.text).to.equal("You do not have authorisation to do this");
                done();
            });
        });

        it('Should return 401 (Unauthorised)', function (done) {
            supertest(app).put('/staff/id/a1').auth('et', 'password').send(jsonDisUpdate).expect("Content-type", /json/).expect(401).end(function (err, res) {
                expect(res.status).to.equal(401);
                expect(res.text).to.equal("You do not have authorisation to do this");
                done();
            });
        });

    });


    describe('Update a student member', function () {

        before(function () {
            supertest(app).get('/clear').end(function (err, res) {
            });
            supertest(app).put('/user/student/et').send(jsonStu).auth('admin', 'admin').end(function (err, res) {
            });
        });

        it('Should return 200 user updated ', function (done) {
            supertest(app).put('/student/id/et').auth('et', 'password').send(jsonStudentUpdate).expect("Content-type", /json/).expect(200).end(function (err, res) {
                expect(res.status).to.equal(200);
                expect(res.body).to.equal(utils.userToJSON(jsonStudentUpdate));
                done();
            });
        });


    });



    describe('Update a student member expect errors', function () {

        before(function () {
            supertest(app).get('/clear').end(function (err, res) {
            });
            supertest(app).put('/user/student/et').send(jsonStu).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/student/og').send(jsonStu2).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/student/oj').send(jsonStu1).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).put('/user/student/a2').send(jsonSta1).auth('admin', 'admin').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis1).auth('et', 'password').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis5).auth('a2', 'password').end(function (err, res) {
            });
            supertest(app).post('/dissertation').send(jsonDis4).auth('oj', 'password').end(function (err, res) {
            });
        });


        it('Should return 401 (bad request) when no data sent', function (done) {
            supertest(app).put('/student/id/et').auth('et', 'password').send().expect("Content-type", /json/).expect(401).end(function (err, res) {
                expect(res.status).to.equal(401);
                done();
            });
        });


        it('Should return 404 (not found) when invalid ID sent', function (done) {
            supertest(app).put('/student/id/INVALID').send(jsonDisUpdate1).auth('oj', 'password').expect("Content-type", /json/).expect(401).end(function (err, res) {
                expect(res.status).to.equal(401);
                expect(res.text).to.equal("You do not have authorisation to do this");
                done();
            });
        });

        it('Should return 401 (Unauthorised)', function (done) {
            supertest(app).put('/student/id/et').auth('oj', 'password').send(jsonDisUpdate).expect("Content-type", /json/).expect(401).end(function (err, res) {
                expect(res.status).to.equal(401);
                expect(res.text).to.equal("You do not have authorisation to do this");
                done();
            });
        });

    });


});



