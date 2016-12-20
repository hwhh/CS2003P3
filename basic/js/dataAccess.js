

(function() {

    var lookup = {};
    clear();


    /**
     * Clear the dictionaries
     */
    function clear() {
        lookup = {
            dissertationDict: {},
            staffDict: {},
            studentDict: {}
        }
    }

    /**
     * Add dissertation
     * @param newDissertation
     */
    function addDissertation(newDissertation) {
        if (lookup.dissertationDict[newDissertation.getID()] == null) {
            lookup.dissertationDict[newDissertation.getID()] = newDissertation;
        }
    }

    /**
     *Get a dissertation by id
     * @param id
     * @returns {*}
     */
    function getDissertation(id) {
        return lookup.dissertationDict[id];
    }

    /**
     * Get all dissertations
     * @returns {Array}
     */
    function getAllDissertations(){
        var array = [];
        //Add all the dissertations
        for(var id in lookup.dissertationDict) {
            //If its available add it to an array
            if (!lookup.dissertationDict[id].getAssignedTo() && lookup.dissertationDict[id].isAvailable())
                array.push(lookup.dissertationDict[id]);
        }
        return array;
    }

    /**
     * Delete a dissertation
     * @param id
     */
    function deleteDissertation(id){
        //Find the dissertation to be deleted
        var dissertation = lookup.dissertationDict[id];
        //If the dissertation is found
        if(dissertation != undefined) {
            //Get all users
            var users = getAllUsers();
            for (var key in users) {
                var user = users[key];
                //Check if the dissertation is in the users dissertations array
                if (user.getAllDissertations().indexOf(parseInt(id, 10)) > -1) {
                    //Get the index of the dissertation
                    var index = user.getAllDissertations().indexOf(parseInt(id, 10));
                    //Create a new array
                    var newArray = user.getAllDissertations();
                    //Remove the dissertation
                    newArray.splice(parseInt(index, 10), 1);
                    //Update the users arrays
                    user.setDissertations(newArray);
                }
            }
            delete lookup.dissertationDict[id];
        }
    }


    /**
     * Add member of staff
     * @param staffMember
     */
    function addStaffMember(staffMember) {
        //Check if user is member of staff
        if (staffMember.role == 'staff') {
            if (lookup.staffDict[staffMember.getUserID()] == null) {
                lookup.staffDict[staffMember.getUserID()] = staffMember;
            }
        }
    }

    /**
     * Get a memeber of staff by their id
     * @param id
     * @returns {*}
     */
    function getStaffMember(id) {
        return lookup.staffDict[id];
    }

    /**
     * Get all staff
     * @returns {Array}
     */
    function getAllStaff() {
        var array = [];
        //Add all users in the staff dictionary to an array
        for (var userid in lookup.staffDict) {
            array.push(lookup.staffDict[userid]);
        }
        return array;
    }

    /**
     * Delete a member of staff
     * @param id
     */
    function deleteStaffMember(id) {
        //Find the member of staff to delete
        var staffMember = lookup.staffDict[id];
        if (staffMember != undefined) {
            //Find all the dissertation they've proposed
            for (var key in lookup.dissertationDict) {
                var dis = lookup.dissertationDict[key];
                //Delete dissertations proposed by deleted staff member
                if (dis.getProposer() == id) {
                    deleteDissertation(id);
                }
            }
            delete lookup.staffDict[id];
        }
    }

    /**
     * Add a student
     * @param student
     */
    function addStudent(student) {
        //Check if user is student
        if (student.role == 'student') {
            if (lookup.studentDict[student.getUserID()] == null) {
                lookup.studentDict[student.getUserID()] = student;
            }
        }
    }

    /**
     * Get a student by ID
     * @param id
     * @returns {*}
     */
    function getStudent(id) {
        return lookup.studentDict[id];
    }

    /**
     * Get all students
     * @returns {Array}
     */
    function getAllStudents() {
        //Create new array
        var array = [];
        //Add all students to the array
        for (var userid in lookup.studentDict) {
            array.push(lookup.studentDict[userid]);
        }
        return array;
    }

    /**
     * Delete a student
     * @param id
     */
    function deleteStudent(id) {
        //Find the student
        var student = lookup.studentDict[id];
        if (student != undefined) {
            //Get all the dissertations
            for (var key in lookup.dissertationDict) {
                var dis = lookup.dissertationDict[key];
                //Check if the dissertation is assigned to the deleted user
                if (dis.getAssignedTo() == id){
                    dis.setAssignedTo("");
                }
                //Check the deleted user is not the proposer
                if (dis.getProposer() == id) {
                    deleteDissertation(id);
                }
            }
            delete lookup.studentDict[id];

        }
    }

    /**
     * Get all users
     * @returns {Array.<*>}
     */
    function getAllUsers() {
        var array = getAllStudents();
        return array.concat(getAllStaff());
    }

    /**
     * Get a user by id
     * @param id
     * @returns {*}
     */
    function getUser(id) {
        //Find user from staff and student dictionaries
        var student = getStudent(id);
        var staff = getStaffMember(id);
        //Return the found
        if (student) {
            return student;
        } else if (staff) {
            return staff;
        }
        return null;
    }

    /**
     * Delete a user
     * @param id
     */
    function deleteUser(id) {
        //Find a user
        var user = getUser(id).getRole();
        //Check the users status and call appropriate delete operation
        if (user.role === 'student') {
            deleteStudent(id)
        } else if (user.role === 'staff') {
            deleteStaffMember(id);
        }
    }


    /**
     * Exports
     * @type {{addDissertation: addDissertation, getDissertation: getDissertation, addStaffMember: addStaffMember, getStaffMember: getStaffMember, addStudent: addStudent, getStudent: getStudent, getAllDissertations: getAllDissertations, deleteDissertation: deleteDissertation, deleteStaffMember: deleteStaffMember, deleteStudent: deleteStudent, getAllStaff: getAllStaff, getAllStudents: getAllStudents, getUser: getUser, getAllUsers: getAllUsers, deleteUser: deleteUser, clear: clear}}
     */
    var moduleExports = {
        addDissertation : addDissertation,
        getDissertation : getDissertation,
        addStaffMember : addStaffMember,
        getStaffMember : getStaffMember,
        addStudent : addStudent,
        getStudent : getStudent,
        getAllDissertations : getAllDissertations,
        deleteDissertation: deleteDissertation,
        deleteStaffMember: deleteStaffMember,
        deleteStudent: deleteStudent,
        getAllStaff: getAllStaff,
        getAllStudents: getAllStudents,
        getUser: getUser,
        getAllUsers: getAllUsers,
        deleteUser: deleteUser,
        clear: clear
    };

    if(typeof __dirname == 'undefined') {
        window.hello = moduleExports;
    } else {
        module.exports = moduleExports;
    }


})();