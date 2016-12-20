/***********************************************************************************
 * RESTful API implementation for Web2
 ***********************************************************************************/

const PORT = 8080;

var bodyParser = require("body-parser");
var express = require("express");
var app = express();
var _ = require('lodash');
var utils = require('./utils');
var model = require("./model.js");
var router = express.Router();
var mongoose = require('mongoose');

var Dissertation = require('./Schemas/dissertation');
var Staff = require('./Schemas/staff');
var Student = require('./Schemas/student');


//var authController = require('./authController');




mongoose.connect('mongodb://admin:admin@ds147797.mlab.com:47797/cs2003web2'); // connect to our database


function makeSchemaDissertation(dissertation) {
    var dis = new Dissertation();
    dis.id = dissertation.id;
    dis.title = dissertation.title;
    dis.description = dissertation.description;
    dis.proposer = dissertation.proposer;
    dis.proposer_role = dissertation.proposer_role;
    dis.supervisor = dissertation.supervisor;
    dis.interests = dissertation.interests;
    dis.assignedTo = dissertation.assignedTo;
    dis.available = dissertation.available;
    return dis;
}

function makeSchemaStaff(staff) {
    var staffMember = new Staff();
    staffMember.userid = staff.userid;
    staffMember.role = staff.role;
    staffMember.given = staff.given;
    staffMember.surname = staff.surname;
    staffMember.dissertations = staff.dissertations;
    staffMember.password = staff.password;
    staffMember.jobtitle = staff.profile.jobtitle;
    staffMember.email = staff.profile.email;
    staffMember.telephone = staff.profile.telephone;
    staffMember.roomnumber = staff.profile.roomnumber;
    staffMember.research = staff.profile.research;
    return staffMember;
}

function makeSchemaStudent(student) {
    var studentMember = new Student();
    studentMember.userid = student.userid;
    studentMember.role = student.role;
    studentMember.given = student.given;
    studentMember.surname = student.surname;
    studentMember.dissertations = student.dissertations;
    studentMember.password = student.password;
    return studentMember;
}


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use('/', utils.basicAuth(Staff, Student), router);
express.static('static');


app.listen(PORT, function () {
    console.log("I am listening at PORT: " + PORT);
});


/**
 * Clear the database
 */
router.get('/clear', function (req, res) {
    Dissertation.remove({}, function (err) {
    });
    Staff.remove({}, function (err) {
    });
    Student.remove({}, function (err) {
    });
    res.status(200).send("Collections removed");
});

/**
 * Handles GET request for displaying all the dissertation that are available
 */
router.get('/dissertation', function (req, res) {
    //Check if a valid user is logged in
    if (req.authLevel > 0) {
        Dissertation.find({available: true}, function (err, dissertations) {
            if (err) {
                res.send(err);
            }
            else {
                var json = JSON.stringify(dissertations, function (key, value) {
                    //Check if there is a ID attribute in the file
                    if (key == 'id' || key == 'assignedTo' || key == 'available' || key == 'available' || key == '_id' || key == '__v') {
                        return undefined;
                    } else {
                        return value;
                    }
                });
                //Causes the Web server to stop processing the script and return the current result
                res.status(200).json(json);
            }
        });
    }
});

/**
 * Handle GET request for specific dissertation
 */
router.get('/dissertation/id/:id', function (req, res) {
    var id = req.params.id;
    //Check if a valid user is logged in
    if (req.authLevel) {
        //Look for dissertation
        Dissertation.findOne({'id': id}, function (err, dissertation) {
            if (err) {
                res.status(400).json(err);
            }
            //If authorised return the dissertation
            else if (dissertation) {
                if (dissertation.available || dissertation.assignedTo === req.userid || dissertation.proposer === req.userid || req.level < 3)
                    res.status(200).json(utils.dissertationEntryToJSON(dissertation));
                else
                    res.status(401).send("You do not have authorisation to do this");
            } else {
                res.status(404).send("Dissertation not found");
            }
        });
    }
});

/**
 * Handles POST request for adding a dissertation
 */
router.post('/dissertation', function (req, res) {
    //Check if a valid user is logged in
    if (req.authLevel) {
        try {
            var json = req.body;
            //Automatically sanitise the dissertation
            if (req.body.proposer == req.userid) {
                if(req.authLevel == 3){
                    json.available = false;
                    json.proposer_role = 'student';
                    json.assignedTo = '';
                }else if(req.authLevel < 3){
                    json.available = true;
                    json.proposer_role = 'staff';
                    json.supervisor = req.userid;
                }
                //Create a new dissertation object using the request body and validate it
                var newDissertation = new model.DissertationFromJSON(json);
                var dissertationTemp = makeSchemaDissertation(newDissertation);
                //Check if dissertation already exists
                Dissertation.findOne({'id': req.body.id}, function (err, dissertation) {
                    if (err) {
                        res.status(400).json(err);
                    }
                    //Save the dissertation
                    else if (dissertation == null) {
                        dissertationTemp.save();
                        res.status(201).json(utils.dissertationEntryToJSON(newDissertation));
                    } else {
                        res.status(401).send("There is a dissertation with this ID already saved");
                    }
                });
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
    //Check if a valid user is logged in
    if (req.authLevel) {
        //Check if the dissertation exists
        Dissertation.findOne({'id': req.params.id}, function (err, dissertation) {
            if (err) {
                res.status(400).send(err);
            }
            else if (dissertation) {
                //If the dissertation exists and the proposer is the currently logged in user or admin is logged in
                if (dissertation.proposer === req.userid || req.authLevel < 3) {
                    //Remove the dissertation
                    Dissertation.remove({'id': req.params.id}, function (err) {
                        if (err) {
                            res.status(400).json(err);
                        }
                        else {
                            res.status(202).send("Delete successful");
                        }
                    });
                }
                else
                    res.status(401).send("You do not have authorisation to do this");
            } else {
                res.status(404).send("Dissertation not found");
            }
        });
    }
});

/**
 * Handle PUT request for a given dissertation
 */
router.put('/dissertation/id/:id', function (req, res) {
    //Check if a valid user is logged in
    if (req.authLevel) {
        //Get the content from the request
        var updatedDissertation = req.body;
        var id = req.params.id;
        try {
            //Check if the update sent in the request is valid
            model.DissertationFromJSON(updatedDissertation);
            //Find the dissertation
            Dissertation.findOne({'id': id}, function (err, dissertation) {
                if (err) {
                    res.status(400).send(err);
                }

                else {
                    if (dissertation == null) {
                        res.status(404).send("Dissertation not found");
                    }
                    //If the dissertation is found
                    else {
                        var valid = false;
                        //Check the supervisor has not changed
                        if (req.userid == updatedDissertation.proposer && req.authLevel == 3 && updatedDissertation.id == id) {
                            //Update the dissertation
                            dissertation.title = updatedDissertation.title;
                            dissertation.description = updatedDissertation.description;
                            valid = true;
                        } else if (req.authLevel < 3 && updatedDissertation.id == id) {
                            //Update the dissertation
                            dissertation.title = updatedDissertation.title;
                            dissertation.description = updatedDissertation.description;
                            dissertation.proposer_role = updatedDissertation.proposer_role;
                            dissertation.supervisor = updatedDissertation.supervisor;
                            dissertation.interests = updatedDissertation.interests;
                            dissertation.assignedTo = updatedDissertation.assignedTo;
                            dissertation.available = updatedDissertation.available;
                            valid = true;
                        }
                        //Save the dissertation if valid
                        if (valid) {
                            dissertation.save(function (err) {
                                if (err) {
                                    res.status(400).send("Error");
                                }
                                else {
                                    res.status(200).json(utils.dissertationEntryToJSON(updatedDissertation));
                                }
                            });
                        } else {
                            res.status(401).send("You do not have authorisation to do this");
                        }
                    }
                }
            });
        } catch (err) {
            res.status(400).send("Update contains invalid data");
        }
    }
});


/**
 * Handles GET request for all staff
 */
router.get('/staff', function (req, res) {
    //Check if a valid user is logged in
    if (req.authLevel) {
        Staff.find(function (err, staff) {
            if (err) {
                res.send(err);
            }
            //If there are users in the database
            else {
                var json = JSON.stringify(staff, function (key, value) {
                    //Check if there is a ID attribute in the file
                    if (key == 'userid' || key == 'password' || key == '_id' || key == '__v') {
                        return undefined;
                    }
                    else return value;
                });
                //Causes the Web server to stop processing the script and return the current result
                res.status(200).json(json);
            }
        });
    }
});

/**
 * Handles GET request for all students
 */
router.get('/student', function (req, res) {
    //Check if a valid user is logged in
    if (req.authLevel) {
        Student.find(function (err, student) {
            if (err) {
                res.send(err);
            }
            //If there are users in the database
            else {
                var json = JSON.stringify(student, function (key, value) {
                    //Check if there is a ID attribute in the file
                    if (key == 'userid' || key == 'password' || key == '_id' || key == '__v') {
                        return undefined;
                    }
                    else return value;
                });
                //Causes the Web server to stop processing the script and return the current result
                res.status(200).json(json);
            }
        });
    }
});

/**
 * Handles GET request for a specified staff
 */
router.get('/staff/id/:id', function (req, res) {
    //Check if a valid user is logged in
    if (req.authLevel) {
        var id = req.params.id;
        //Find the user using the id
        Staff.findOne({'userid': id}, function (err, staff) {
            if (err) {
                res.send(err);
            }
            //Return the user with sensitive data hidden
            else if (staff) {
                res.status(200).json(utils.userToJSON(staff));
            }
            else {
                res.status(400).send("Staff member not found");
            }
        });
    }
});

/**
 * Handles GET request for a specified student
 */
router.get('/student/id/:id', function (req, res) {
    //Check if a valid user is logged in
    if (req.authLevel) {
        var id = req.params.id;
        //Find the user using the id
        Student.findOne({'userid': id}, function (err, student) {
            if (err) {
                res.send(err);
            }
            //Return the user with sensitive data hidden
            else if (student) {
                res.status(200).json(utils.userToJSON(student));
            }
            else {
                res.status(400).send("Student member not found");
            }
        });
    }
});

/**
 * Handles PUT request for creating new staff
 */
router.put('/user/staff/:id', function createStaff(req, res) {
    //var session = utils.getLogIn();
    //Check if a valid user is logged in
    if (req.authLevel) {
        try {
            //Check admin is logged in
            if (req.authLevel == 1 && req.params.id === req.body.userid) {
                //Validate new user
                var staffTemp = new model.StaffFromJSON(req.body);
                var staffMember = makeSchemaStaff(staffTemp);
                //Find the user to see if already exists
                Staff.findOne({'userid': req.body.userid}, function (err, staff) {
                    if (err) {
                        res.status(400).json(err);
                    }
                    //Add new user and return the new user
                    else if (staff == null) {
                        staffMember.save();
                        res.status(201).json(utils.userToJSON(staffTemp));
                    } else {
                        res.status(401).send("There is a member of staff with this ID already saved");
                    }
                });
            } else {
                res.status(401).send("You do not have authorisation to do this");
            }
        } catch (err) {
            res.status(400).json(err);
        }
    }
});

/**
 * Handles PUT request for creating new student
 */
router.put('/user/student/:id', function createStudent(req, res) {
    //Check if a valid user is logged in
    if (req.authLevel) {
        try {
            //Check admin is logged in
            if (req.authLevel == 1 && req.params.id === req.body.userid) {
                //Validate new user
                var studentTemp = new model.StudentFromJSON(req.body);
                var studentMember = makeSchemaStudent(studentTemp);
                //Find the user to see if already exists
                Staff.findOne({'userid': req.body.userid}, function (err, student) {
                    if (err) {
                        res.status(400).json(err)
                    }
                    //Add new user and return the new user
                    else if (student == null) {
                        studentMember.save();
                        res.status(201).json(utils.userToJSON(studentTemp));
                    } else {
                        res.status(401).send("There is a member of staff with this ID already saved");
                    }
                });
            } else {
                res.status(401).send("You do not have authorisation to do this");
            }
        } catch (err) {
            res.status(400).json(err);
        }
    }
});

/**
 * Handles DELETE request for deleting staff
 */
router.delete('/staff/:id', function deleteUser(req, res) {
    //Check if a valid user is logged in
    if (req.authLevel) {
        //Check admin logged in
        if (req.authLevel == 1) {
            //Get user id from query parameters
            Staff.findOne({'userid': req.params.id}, function (err, staffMember) {
                if (err) {
                    res.status(400).send(err);
                }
                //Check user is found
                if (staffMember == null) {
                    res.status(400).send("Staff member not fond");
                }
                else {
                    //Delete user
                    Staff.remove({'userid': req.params.id}, function (err) {
                        if (err) {
                            res.status(400).json(err);
                        }
                        else {
                            res.status(202).send("Delete successful");
                        }
                    });
                }
            });
        } else
            res.status(401).send("You do not have authorisation to do this");
    }
});


/**
 * Handles DELETE request for deleting student
 */
router.delete('/student/:id', function deleteUser(req, res) {
    //var session = utils.getLogIn();
    //Check if a valid user is logged in
    if (req.authLevel) {
        //Check admin logged in
        if (req.authLevel == 1) {
            //Get user id from query parameters
            Student.findOne({'userid': req.params.id}, function (err, student) {
                if (err) {
                    res.status(400).send(err);
                }
                //Check user is found
                if (student == null) {
                    res.status(400).send("Student not fond");
                }
                else {
                    //Delete user
                    Student.remove({'userid': req.params.id}, function (err) {
                        if (err) {
                            res.status(400).json(err);
                        }
                        else {
                            res.status(202).send("Delete successful");
                        }
                    });
                }
            });
        } else
            res.status(401).send("You do not have authorisation to do this");
    }
});


/**
 * Handle POST request for adding interest to a dissertation
 */

router.post('/dissertation/:id/interest/:userid', function showInterest(req, res) {
    //Check if a valid user is logged in
    if (req.authLevel) {
        //Find the dissertation
        Dissertation.findOne({'id': req.params.id}, function (err, dissertation) {
            if (err) {
                res.status(400).send(err);
            }
            else {
                //Check the dissertation is found
                if (dissertation == null) {
                    res.status(404).send("Not fond");
                }
                else {
                    //Check access level of user logged in
                    if (req.userid == req.params.userid) {
                        //Add interest
                        dissertation.interests.push(req.params.userid);
                        dissertation.save(function (err) {
                            if (err) {
                                res.status(400).send(err);
                            }
                            else {
                                res.status(200).json(utils.dissertationEntryToJSON(dissertation));
                            }
                        });
                    } else {
                        res.status(401).send("You do not have authorisation to do this");
                    }
                }
            }

        });
    }
});

function addDissertation (userid, dissid){
    //Find student in database
    Student.findOne( {'userid' : userid}, function (err, student) {
        if (err) {
            res.status(400).send(err);
        }else{
            if(student){
                student.dissertations.push(dissid);
            }
        }
    });
}


router.post('/dissertation/:id/allocation/:userid', function assignDissertation(req, res) {
    //var session = utils.getLogIn();
    //Check if a valid user is logged in
    if (req.authLevel) {
        //Checks the permission level of the currently logged in user
        if (req.authLevel == 2 || req.authLevel == 1) {
            //Find the dissertation to be updates
            Dissertation.findOne({'id': req.params.id}, function (err, dissertation) {
                if (err) {
                    res.status(400).send(err);
                }
                else{
                    if (dissertation == null) {
                        res.status(404).send("Not fond");
                    }
                    else {
                        //Check the dissertation has a supervisor or the proposer is a member of staff and the dissertation is available
                        if (dissertation.supervisor && dissertation.available) {
                            //Check the user has shown interest in the dissertation
                            if (dissertation.interests.indexOf(req.params.userid) > -1) {
                                try {
                                    //Assign the dissertation the user
                                    dissertation.assignedTo = req.params.userid;
                                    dissertation.available = false;
                                    dissertation.save(function (err) {
                                        if (err) {
                                            res.status(400).send(err);
                                        }
                                        else {
                                            dissertation.available = false;
                                            dissertation.assignedTo =req.params.userid;
                                            addDissertation(req.params.userid, dissertation.id);
                                            res.status(200).json(utils.dissertationEntryToJSON(dissertation));
                                        }
                                    });
                                } catch (err) {
                                    res.status(406).send("Something went wrong :(");
                                }
                            } else {
                                //If the student hasn't shown interest in the dissertation
                                res.status(401).send('User needs to show interest in this dissertation before it can be adopted');
                            }
                        } else {
                            res.status(401).send("Dissertation either not available or needs to be assigned a supervisor");
                        }
                    }
                }
            });
        } else {
            res.status(401).send('Unauthorized');
        }
    }
});

/**
 * Handles PUT requests for updating a staff
 */
router.put('/staff/id/:id', function (req, res) {
    //var session = utils.getLogIn();
    //Check if a valid user is logged in
    if (req.authLevel) {
        var update = req.body;
        var id = req.params.id;
        //Find user
        try {
            model.StaffFromJSON(update);
            //Find the staff member
            Staff.findOne({'userid': id}, function (err, staff) {
                if (err) {res.status(400).send(err);}
                else {
                    if (staff == null) {res.status(404).send("Staff not found");}
                    //If the staff member is found
                    else {
                        var valid = false;
                        //Check the supervisor has not changed
                        if (staff.userid == req.userid && staff.userid == update.userid) {
                            valid = true;
                            _.merge(staff, update);
                        }if (valid) {
                            staff.save(function (err) {
                                if (err) {res.status(400).send("Error");}
                                else {res.status(200).json(utils.userToJSON(update));
                               }
                            });
                        } else {res.status(401).send("You do not have authorisation to do this");}
                    }
                }
            });
        } catch (err) {res.status(401).send("Update contains invalid data");}
    }
});

/**
 * Handles PUT requests for updating a student
 */
router.put('/student/id/:id', function (req, res) {
    //var session = utils.getLogIn();
    //Check if a valid user is logged in
    if (req.authLevel) {
        var update = req.body;
        var id = req.params.id;
        //Find user
        try {
            model.StudentFromJSON(update);
            //Find the student
            Student.findOne({'userid': id}, function (err, student) {
                if (err) {res.status(400).send(err);}
                else {
                    if (student == null) {res.status(404).send("Student not found");}
                    //If the student member is found
                    else {
                        var valid = false;
                        //Check the supervisor has not changed
                        if (student.userid == req.userid && student.userid == update.userid) {
                            valid = true;
                            _.merge(student, update);
                        }if (valid) {
                            student.save(function (err) {
                                if (err) {res.status(400).send("Error");}
                                else {res.status(200).json(utils.userToJSON(update));
                                }
                            });
                        } else {res.status(401).send("You do not have authorisation to do this");}
                    }
                }
            });
        } catch (err) {res.status(401).send("Update contains invalid data");}
    }
});


module.exports.getApp = app;

