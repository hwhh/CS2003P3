var basicAuth = require('basic-auth');
var user;
//var authLevel = -1;

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
/*exports.getLogIn = function () {
    var authLevel = 1;
    if (authLevel > 0)
        return new LogIn(user.name, authLevel);
};*/

/**
 * Removes sensitive data from a dissertation
 * @param dissertation
 */
exports.dissertationEntryToJSON = function (dissertation) {
    return JSON.stringify(dissertation, function (key, value) {
        //Check for sensitive data
        if (key == 'id' || key == 'assignedTo' || key == 'available' || key == '_id' || key == '__v') {
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
        if (key == 'userid' || key == 'password' || key == '_id' || key == '__v') {
            return undefined;//If the key in the dissertation is sensitive remove the attribute
        } else {
            return value;
        }
    });
};

/**
 * Authorise a user
 * @returns {Function}
 */
exports.basicAuth = function (Staff, Student) {
    return function (req, res, next) {
        user = basicAuth(req);
        //If the doesn't user exists
        if (!user) {
            invalidEntry(res);
        }
        else {
            //Check if admin and password correct
            if (user.name == 'admin' && user.pass == 'admin') {
                req.userid = 'admin';
                req.authLevel = 1;
                next();
            }
            //Try and staff member with the same id
            Staff.findOne({'userid': user.name}, function (err, staff) {
                if (err) {
                }
                else if (staff) {
                    if (staff.password == user.pass) {//Check if staff and password correct
                        req.userid = user.name;
                        req.authLevel = 2;
                        next();
                    }
                }
            });
            //Try and a student with the same id
            Student.findOne({'userid': user.name}, function (err, student) {
                if (err) {
                }
                else if (student) {
                    if (student.password == user.pass) { //Check if student and password correct
                        req.userid = user.name;
                        req.authLevel = 3;
                        next();
                    } else {
                        req.authLevel = -1;
                        invalidEntry(res)
                    }
                }
            });
        }
    };

    function invalidEntry(res) {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        return res.sendStatus(401);
    }
};







