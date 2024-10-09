/**
 * @file authMiddleware.js
 * @description 
 * @author Lombardi Michele 
 * @copyright Nanolever 
 */

// middlewares/authMiddleware.js
module.exports = function (req, res, next) {
    if (req.session && req.session.loggedIn) {
        next();
    } else {
        res.redirect('/login');
    }
};