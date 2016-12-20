/***********************************************************************************
 * RESTful API implementation for Web2
 ***********************************************************************************/

const PORT = 8080;

var bodyParser = require("body-parser");
var express = require("express");
var app = express();

var _ = require('lodash');
var dao = require('./dataAccess.js');
var utils = require('./utils');
var model = require("./model.js");
var router = express.Router();



app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use('/', utils.basicAuth(), router);
express.static('static');


app.listen(PORT, function () {
    console.log("I am listening at PORT: " + PORT);
});

/**
 * Handles GET request for displaying all the dissertation that are available
 */
router.get('/dissertation', function (req, res) {
    var session = utils.getLogIn();
    //Check if a valid user is logged in
    if (session) {
        var dissertations = dao.getAllDissertations();
        //Converts a JavaScript value to a JSON string
        var json = JSON.stringify(dissertations, function (key, value) {
            //Check if there is a ID attribute in the file
            if (key == 'id' || key == 'assignedTo' || key == 'available') {
                return undefined;
            } else {
                return value;
            }
        });
        //Causes the Web server to stop processing the script and return the current result
        res.status(200).json(json);
    }
});

/**
 * Handle GET request for specific dissertation
 */
router.get('/dissertation/id/:id', function (req, res) {
    var session = utils.getLogIn();
    var id = req.params.id;
    //Check if a valid user is logged in
    if (session) {
        //Look for dissertation
        var dissertation = dao.getDissertation(id);
        if (!dissertation) {
            res.status(404).send("Dissertation not found");
        }
        //If authorised return the dissertation
        else if (dissertation.isAvailable() || dissertation.getAssignedTo() === session.userName || dissertation.getProposer() === session.userName || session.level < 3) {
            res.status(200).json(utils.dissertationEntryToJSON(dissertation));
        } else if (!dissertation.isAvailable() && dissertation.getAssignedTo != session.userName && session.level == 3) {
            res.status(401).send("You do not have authorisation to do this");
        }
    }
});

/**
 * Handles POST request for adding a dissertation
 */
router.post('/dissertation', function (req, res) {
    var session = utils.getLogIn();
    //Check if a valid user is logged in
    if (session) {
        try {
            //Create a new dissertation object using the request body and validate it
            var dissertation = new model.DissertationFromJSON(req.body);
            //Check the current user is the proposer
            if (dissertation.proposer == session.userName) {
                //Save the dissertation
                dao.addDissertation(dissertation);
                //Add the dissertation to the user
                dao.getUser(session.userName).addNewDissertation(dissertation);
                //Return the newly created dissertation
                res.status(201).json(utils.dissertationEntryToJSON(dissertation));
            } else {
                res.status(401).send("You do not have authorisation to do this");
            }
        } catch (err) {
            res.status(400).json(err);
        }
    }

});

/**
 * Handle DELETE request for a given dissertation
 */
router.delete('/dissertation/:id', function (req, res) {
    var session = utils.getLogIn();
    //Check if a valid user is logged in
    if (session) {
        //Check if the dissertation exists
        var dissertation = dao.getDissertation(req.params.id);
        if (!dissertation) {
            res.status(400).send("Dissertation not found");
        }
        //If the dissertation exists and the proposer is the currently logged in user or admin is logged in
        else if (session.userName == dissertation.getProposer() || session.level == 1) {
           //Remove the dissertation
            dao.deleteDissertation(req.params.id);
            res.status(202).send("Delete successful");
        } else {
            res.status(401).send("You do not have authorisation to do this");
        }
    }
});

/**
 * Handle PUT request for a given dissertation
 */
router.put('/dissertation/id/:id', function (req, res) {
    var session = utils.getLogIn();
    //Check if a valid user is logged in
    if (session) {
        //Get the content from the request
        var update = req.body;
        var id = req.params.id;
        //Find the dissertation
        var originalDissertation = dao.getDissertation(id);
        if (update.id == id && originalDissertation) { // never update the id field
            //Remove the ID from the found dissertation
            update.id = -1;
            try {
                //Check if the update sent in the request is valid
                var updatedDissertation = new model.DissertationFromJSON(update);
                //Check the supervisor has not changed
                if (updatedDissertation && (originalDissertation.getSupervisor() == updatedDissertation.getSupervisor() || session.level > 3)) {
                    updatedDissertation.setID(id);
                    //Check the auth level of the current user
                    if (session.level < 3) {
                        //Update the dissertation
                        _.merge(originalDissertation, updatedDissertation);
                        res.status(200).json(utils.dissertationEntryToJSON(updatedDissertation));
                    } else if (session.userName == updatedDissertation.proposer) {
                        _.merge(originalDissertation, updatedDissertation);
                        res.status(200).json(utils.dissertationEntryToJSON(updatedDissertation));
                    }
                    //If nto correct permission
                    else {
                        res.status(401).send("You do not have authorisation to do this");
                    }
                    //If not found
                } else {
                    res.status(404).send("Not fond");
                }
                //If the update contains errors
            } catch (err) {
                res.status(400).send("Problem with update in new dissertation");
            }
            //If the URI was invalid
        } else {
            res.status(400).send("Query missing valid data and or parameters");
        }
    }
});

/**
 * Handles GET request for all users
 */
router.get('/user', function (req, res) {
    var session = utils.getLogIn();
    //Check if a valid user is logged in
    if (session) {
        var users = dao.getAllUsers();
        //Converts a JavaScript value to a JSON string
        var json = JSON.stringify(users, function (key, value) {
            //Check if there is a ID attribute in the file
            if (key == 'userid' || key == 'password') {
                return undefined;
            } else {
                return value;
            }
        });
        //Causes the Web server to stop processing the script and return the current result
        res.status(200).json(json);
    }
});

/**
 * Handles GET request for a specified user
 */
router.get('/user/id/:id', function (req, res) {
    var session = utils.getLogIn();
    //Check if a valid user is logged in
    if (session) {
        var id = req.params.id;
        //Find the user using the id
        var user = dao.getUser(id);
        if (user) {
            //Return the user with sensitive data hidden
            res.status(200).json(utils.userToJSON(user));
        } else {
            res.status(400).send("User not found");
        }
    }
});

/**
 * Handles GET request for a specified staff member
 */
router.get('/user/staff', function (req, res) {
    var session = utils.getLogIn();
    //Check if a valid user is logged in
    if (session) {
        var staffMembers = dao.getAllStaff();
        var json = JSON.stringify(staffMembers, function (key, value) {
            //Check if there is a ID attribute in the file
            if (key == 'userid' || key == 'password') {
                return undefined;
            } else {
                return value;
            }
        });
        //Causes the Web server to stop processing the script and return the current result
        res.status(200).json(json);
    }
});

/**
 * Handles PUT request for creating new staff
 */
router.put('/user/staff/:id', function createStaff(req, res) {
    var session = utils.getLogIn();
    //Check if a valid user is logged in
    if (session) {
        try {
            //Check admin is logged in
            if (session.level == 1) {
                //Validate new user
                var staffMember = new model.StaffFromJSON(req.body);
                //Add new user and return the new user
                dao.addStaffMember(staffMember);
                res.status(201).json(utils.userToJSON(staffMember));
            } else {
                //If not admin
                res.status(401).send("You do not have authorisation to do this");
            }
            //If update contains errors
        } catch (err) {
            res.status(400).json(err);
        }
    }
});

/**
 * Handles PUT request for creating new student
 */
router.put('/user/student/:id', function createStudent(req, res) {
    var session = utils.getLogIn();
    //Check if a valid user is logged in
    if (session) {
        try {
            //Check admin is logged in
            if (session.level == 1) {
                //Validate new user
                var student = new model.StudentFromJSON(req.body);
                //Add new user and return the new user
                dao.addStudent(student);
                res.status(201).json(utils.userToJSON(student));
            } else {
                //If not admin
                res.status(401).send("You do not have authorisation to do this");
            }
        } catch (err) {
            //If update contains errors
            res.status(400).json(err);
        }
    }
});

/**
 * Handles PUT requests for updating a member of staff
 */
router.put('/staff/id/:id', function (req, res) {
    var session = utils.getLogIn();
    //Check if a valid user is logged in
    if (session) {
        var update = req.body;
        var id = req.params.id;
        //Find user
        var originalStaffMember = dao.getStaffMember(id);
        //if the ids are the same and logged in user is updating their own account
            if (update.userid == id && originalStaffMember && update.userid == session.userName && session.level === 2) { // never update the id field
                update.userid = -1;
                try {
                    //Validate new user
                    var updatedStaff = new model.StaffFromJSON(update);
                    //Set the id back to the original
                    updatedStaff.setUserID(id);
                    //Update the dissertation
                    _.merge(originalStaffMember, updatedStaff);
                    res.status(200).json(utils.userToJSON(updatedStaff));
                } catch (err) {
                    //If update contains errors
                    res.status(400).send("Problem with update");
                }
            } else {
                res.status(401).send("You do not have authorisation to do this");
            }
        }

});

/**
 * Handles PUT requests for updating a student
 */
router.put('/student/id/:id', function (req, res) {
    var session = utils.getLogIn();
    //Check if a valid user is logged in
    if (session) {
        var update = req.body;
        var id = req.params.id;
        //Find user
        var originalStudent = dao.getStudent(id);
        //if the ids are the same and logged in user is updating their own account
        if (update.userid == id && originalStudent && update.userid == session.userName && session.level === 3) { // never update the id field
            update.userid = -1;
            try {
                //Validate new user
                var updateStudent = new model.StudentFromJSON(update);
                //Set the id back to the original
                updateStudent.setUserID(id);
                //Update the dissertation
                _.merge(originalStudent, updateStudent);
                res.status(200).json(utils.userToJSON(updateStudent));
            } catch (err) {
                //If update contains errors
                res.status(400).send("Problem with update");
            }
        } else {
            res.status(401).send("You do not have authorisation to do this");
        }

    }
});


/**
 * Handles DELETE request for deleting users
 */
router.delete('/user/:id', function deleteUser(req, res) {
    var session = utils.getLogIn();
    //Check if a valid user is logged in
    if (session) {
        //Check admin logged in
        if (session.level == 1) {
            //Get user id from query parameters
            var id = req.params.id;
            var user = dao.getUser(id);
            //Check user is found
            if (user) {
                //Delete user
                dao.deleteStaffMember(id);
                res.status(202).send("Delete successful");
            } else {
                res.status(400).send("User not found");
            }
        } else {
            res.status(401).send("You do not have authorisation to do this");
        }
    }
});

/**
 * Handle POST request for adding interest to a dissertation
 */

router.post('/dissertation/:id/interest/:userid', function showInterest(req, res) {
    var session = utils.getLogIn();
    //Check if a valid user is logged in
    if (session) {
        //Find the dissertation
        var dissertation = dao.getDissertation(req.params.id);
        var userID = req.params.userid;
        //Check the dissertation is found
        if (dissertation && userID) {
            //Check access level of user logged in
            if (session.userName == userID || session.level < 3) {
                //Add interest
                dissertation.addInterest(userID);
                res.status(200).json(utils.dissertationEntryToJSON(dissertation));
            } else {
                res.status(401).send("You do not have authorisation to do this");
            }
        } else {
            res.status(404).send("Not fond");
        }
    }
});

/**
 * Handle POST request to assign a given dissertation to a given user
 */
router.post('/dissertation/:id/allocation/:userid', function assignDissertation(req, res) {
    var session = utils.getLogIn();
    //Check if a valid user is logged in
    if (session) {
        //Checks the permission level of the currently logged in user
        if (session.level == 2 || session.level == 1) {
            //Find the dissertation to be updates
            var dissertation = dao.getDissertation(req.params.id);
            var user =req.params.userid;
            if (dissertation && user) {
                //Check the dissertation has a supervisor or the proposer is a member of staff and the dissertation is available
                if ((dissertation.getSupervisor() || dao.getStaffMember(dissertation.proposer)) && dissertation.isAvailable()) {
                    //Check the user has shown interest in the dissertation
                    if (dissertation.getInterests().indexOf(user) > -1) {
                        try {
                            //Assign the dissertation the user
                            dissertation.setAssignedTo(user);
                            dao.getStudent(user).addNewDissertation(dissertation);
                            res.status(200).json(dissertation);
                        } catch (err) {
                            res.status(406).send("Something went wrong :(");
                        }
                    } else {
                        //If the student hasn't shown interest in the dissertation
                        res.status(401).send('User needs to show interest in this dissertation before it can be adopted');
                    }
                } else {
                    res.status(401).send('Cannot adopt dissertation');
                }
            } else {
                res.status(404).send("Not fond");
            }
        } else {
            res.status(401).send('Unauthorized');
        }

    }
});

router.get('/clear', function (req, res) {
    dao.clear();
});


module.exports.getApp = app;

