/***********************************************************************************
 *
 * Model for Web2
 *
 ***********************************************************************************/

var validator = require('validator');
var valid = false;
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
(function(){ // wrap into a function to scope content

    /**
     * Dissertation constructor
     * @constructor
     */
    function Dissertation(id, title, description, proposer, proposer_role, supervisor, interests, available) {
        //Check if the call has been validated
        if (valid) {
            this.id = id;
            this.title = title;
            this.description = description;
            this.proposer = proposer;
            this.proposer_role = proposer_role;
            this.supervisor = supervisor;
            this.interests = interests;
            this.assignedTo = "";
            this.available = available;
        } else {
            throw new ValidationError("Invalid data passed in", this, 0);
        }
        //Reset the validation variable
        valid = false;
    }

    /**
     * Get the data from the input JSON  file and validate it
     * @param dissertationData
     * @constructor
     */
    function DissertationFromJSON(dissertationData) {
        valid = false;
        var available = false;
        //Check ID is number
        if (isNaN(parseInt(dissertationData.id, 10)))
            throw new ValidationError("ID not valid", dissertationData, 1);
        //Validation checks
        if (!dissertationData.title)
            throw new ValidationError("Title Required", dissertationData, 2);
        if (!dissertationData.description)
            throw new ValidationError("Description Required", dissertationData, 3);
        if (!dissertationData.proposer)
            throw new ValidationError("Proposer Required", dissertationData, 4);
        if (!dissertationData.proposer_role)
            throw new ValidationError("Proposer Role Required", dissertationData, 5);
        //Set validation variable to true and call super constructor
        valid = true;
        Dissertation.call(this, parseInt(dissertationData.id, 10), dissertationData.title, dissertationData.description, dissertationData.proposer,
            dissertationData.proposer_role, dissertationData.supervisor, dissertationData.interests, dissertationData.available);
    }


    /**
     * Super class for staff and students
     * @constructor
     */
    function User(userid, role, given, surname, dissertations, password) {
        //Check if the call has been validated
        if (valid) {
            this.userid = userid;
            this.role = role;
            this.given = given;
            this.surname = surname;
            this.dissertations = dissertations;
            this.password = password;
        } else {
            throw new ValidationError("Invalid data passed in", this, 0);
        }
        valid = false;
    }


    /**
     * Get the data from the input JSON  file and validate it
     * @param userData
     * @constructor
     */
    function UserValidation(userData) {
        //Check all fields are present and valid from input JSON file
        if (!userData.userid)
            throw new ValidationError("ID not valid", userData, 1);
        if (!userData.role)
            throw new ValidationError("Role Required", userData, 2);
        if (!userData.given)
            throw new ValidationError("Forename Required", userData, 3);
        if (!userData.surname)
            throw new ValidationError("Surname Required", userData, 4);
        if (!userData.password)
            throw new ValidationError("Password Required", userData, 11);
        //If any dissertations in dissertations array validate them
        if (userData.dissertations.length > 0) {
            dissertationsValidation(userData.dissertations);
        }
    }

    /**
     *Constructor for Staff objects
     * @constructor
     */
    function Staff(userid, role, given, surname, dissertations, password, jobtitle, email, telephone, roomnumber, research) {
        //Check if the call has been validated
        User.call(this, userid, role, given, surname, dissertations, password);
        this.profile = new Profile(jobtitle, email, telephone, roomnumber, research);
    }

    /**
     * Object for a staff members profile
     * @constructor
     */
    function Profile(jobtitle, email, telephone, roomnumber, research) {
        this.jobtitle = jobtitle;
        this.email = email;
        this.telephone = telephone;
        this.roomnumber = roomnumber;
        this.research = research;
    }

    /**
     * Get the data from the input JSON  file and validate it
     * @param staffData
     * @constructor
     */
    function StaffFromJSON(staffData) {
        valid = false;
        new UserValidation(staffData);
        //Check all fields are present and valid from input JSON file
        if (!staffData.profile.jobtitle)
            throw new ValidationError("Profile Required", staffData, 6);
        //Validate is proper email
        if (!staffData.profile.email || !validator.isEmail(staffData.profile.email))
            throw new ValidationError("Valid Email Required", staffData, 7);
        //Validate is UK phone number
        if (!staffData.profile.telephone || !validator.isMobilePhone(staffData.profile.telephone, 'en-GB'))
            throw new ValidationError("Valid Phone Number Required", staffData, 8);
        if (!staffData.profile.roomnumber)
            throw new ValidationError("Room Number Required", staffData, 9);
        //Set validation variable to true and call super constructor
        valid = true;
        Staff.call(this, staffData.userid, staffData.role, staffData.given, staffData.surname, staffData.dissertations, staffData.password,
            staffData.profile.jobtitle, staffData.profile.email, staffData.profile.telephone, staffData.profile.roomnumber, staffData.profile.research);
    }


    /**
     * Student constructor
     * @constructor
     */
    function Student(userid, role, given, surname, dissertations, password) {
        User.call(this, userid, role, given, surname, dissertations, password);
    }

    /**
     * Get the data from the input JSON  file and validate it
     * @param studentData
     * @constructor
     */
    function StudentFromJSON(studentData) {
        valid = false;
        new UserValidation(studentData);
        //Set validation variable to true and call super constructor
        valid = true;
        User.call(this, studentData.userid, studentData.role, studentData.given, studentData.surname, studentData.dissertations, studentData.password);
    }


    /**
     * DISSERTATION GETTERS AND SETTERS
     */
    DissertationFromJSON.prototype = Dissertation.prototype = {
        getID: function (){
            return this.id;
        },
        getTitle: function (){
            return this.title;
        },
        getDescription: function (){
            return this.description;
        },
        getProposer: function () {
            return this.proposer;
        },
        getProposerRole: function () {
            return this.proposer_role;
        },
        getSupervisor: function () {
            return this.supervisor;
        },
        getInterests: function () {
            return this.interests;
        },
        getAssignedTo: function () {
            return this.assignedTo;
        },

        isAvailable: function () {
            return this.available;
        },


        setID: function (ID) {
            this.id = ID;
        },
        setTitle: function (title){
            this.title = title;
        },
        setDescription: function (description){
            this.description = description;
        },
        setProposer: function (proposer) {
            this.proposer = proposer;
            this.available = true;


        },
        setProposerRole: function (proposer_role) {
            this.proposer_role = proposer_role;
        },

        setSupervisor: function (supervisor) {
            this.supervisor = supervisor;
        },
        setInterests: function (interests) {
            this.interests = interests;
        },
        setAssignedTo: function (userid) {
            this.assignedTo = userid;
            this.available = false;
        },

        addInterest: function (userid) {
            this.interests.push(userid);
        },
        setAvailable: function (available) {
            this.available = available;
        }
    };

    /**
     * USER GETTERS AND SETTERS
     */
    User.prototype.addNewDissertation = function (dissertation) {
        dissertationsValidation(dissertation);
        this.dissertations.push(dissertation);
    };

    User.prototype.getUserID = function () {return this.userid;};

    User.prototype.getRole = function () {return this.role;};

    User.prototype.getGiven = function () {return this.given;};

    User.prototype.getSurname = function () {return this.surname;};

    User.prototype.getAllDissertations = function () {return this.dissertations;};

    User.prototype.getPassword = function () {return this.password;};

    User.prototype.setDissertations = function (dissertations) {
        if (dissertations.length > 0)
            dissertationsValidation(dissertations);
        this.dissertations = dissertations;
    };

    User.prototype.setUserID = function (userid) {this.userid = userid;};

    User.prototype.setRole = function (role) {this.role = role;};

    User.prototype.setGiven = function (given) {this.given = given;};

    User.prototype.setSurname = function (surname) {this.surname = surname;};

    User.prototype.setPassword = function (password) {this.password = password;};

    Staff.prototype = Object.create(User.prototype);

    Staff.prototype.getJobTitle = function () {return this.profile.jobtitle;};

    Staff.prototype.getEmail = function () {return this.profile.email;};

    Staff.prototype.getTelephone = function () {return this.profile.telephone;};

    Staff.prototype.getRoomNumber = function () {return this.profile.roomnumber;};

    Staff.prototype.getResearch = function () {return this.profile.research;};

    Staff.prototype.setJobTitle = function (jobtitle) {this.profile.jobtitle = jobtitle;};

    Staff.prototype.setEmail = function (email) {this.profile.email = email;};

    Staff.prototype.setTelephone = function (telephone) {this.profile.telephone = telephone;};

    Staff.prototype.setRoomNumber = function (roomnumber) {this.profile.roomnumber = roomnumber;};

    Staff.prototype.setResearch = function (research) {this.profile.research = research;};

    StaffFromJSON.prototype = Staff.prototype;

    Student.prototype = User.prototype;

    StudentFromJSON.prototype = Student.prototype;


  /***********************************************************************************
   * Exception classes
   ***********************************************************************************/

  /**
   * Error thrown when validation of inputs fails.
   */
  function ValidationError(msg, filename, linenumber) {
      Error.call(this, msg, filename, linenumber);
  }

  ValidationError.prototype = Error.prototype;

  /***********************************************************************************
   * Module imports and exports - to work in browser and node.js
   ***********************************************************************************/
  var moduleExports = {
      Dissertation : Dissertation,
      DissertationFromJSON: DissertationFromJSON,
      User: User,
      Student: Student,
      StudentFromJSON: StudentFromJSON,
      Staff: Staff,
      StaffFromJSON: StaffFromJSON,
      ValidationError: ValidationError,
  };

  if(typeof __dirname == 'undefined') {
    window.hello = moduleExports;
    // remember to add the following to the page:
    // https://www.npmjs.com/package/validator
  } else {
    module.exports = moduleExports;
    // use require() to import module dependencies
    var validator = require('validator');
  }

})();


