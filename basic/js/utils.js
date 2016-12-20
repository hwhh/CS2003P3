var basicAuth = require('basic-auth');
var dao = require('./dataAccess.js');

var user;
var authLevel = -1;
/**
 * Creates a login session
 * @param userName the user name of the currently logged in user
 * @param level the access level of the currently logged in user
 * @constructor
 */
function LogIn(userName, level) {
    this.userName = userName;
    this.level = level;
}

/**
 * Return the current login session
 * @returns {LogIn}
 */
exports.getLogIn = function () {
    if (authLevel > 0)
        return new LogIn(user.name, authLevel);
};

/**
 * Removes sensitive data from a dissertation
 * @param dissertation
 */
exports.dissertationEntryToJSON = function (dissertation) {
    return JSON.stringify(dissertation, function (key, value) {
        //Check for sensitive data
        if (key == 'id' || key == 'assignedTo' || key == 'available') {
            return undefined;//If the key in the dissertation is sensitive remove the attribute
        } else {
            return value;
        }
    });
};

/**
 * Removes sensitive data from a user
 * @param user
 */
exports.userToJSON = function (user) {
    return JSON.stringify(user, function (key, value) {
        if (key == 'userid' || key == 'password') {//If the key in the user is sensitive remove the attribute
            return undefined;
        } else {
            return value;
        }
    });
};

/**
 * Authorise a user
 * @returns {Function}
 */
exports.basicAuth = function () {
    return function (req, res, next) {
        user = basicAuth(req);
        //If the doesn't user exists
        if (!user) {
            invalidEntry(res);
        }
        else {
            //Try and a student or staff member with the same id
            var student = dao.getStudent(user.name);
            var staffMember = dao.getStaffMember(user.name);
            //Check if student and password correct
            if (student != null && student.getPassword() == user.pass) {
                authLevel = 3;
            }
            //Check if staff and password correct
            else if (staffMember != null && staffMember.getPassword() == user.pass) {
                authLevel = 2;
            //Check if admin and password correct
            } else if (user.name === 'admin' && user.pass === 'admin') {
                authLevel = 1;
            } else {
                invalidEntry(res);
            }
        }
        next();
    };

    function invalidEntry(res) {
        authLevel = -1;
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        return res.sendStatus(401);
    }
};







