/**
 * @file userModel.js
 * @description 
 * @author Lombardi Michele 
 * @copyright Nanolever 
 */

// models/userModel.js
const users = [];

module.exports = {
    findUser: (username) => users.find(user => user.username === username),
    addUser: (user) => users.push(user)
};