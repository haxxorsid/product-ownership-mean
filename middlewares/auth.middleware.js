const { header } = require('express-validator/check');
const tokenModule = require('../scripts/token.script');
let decoded = {role: ""};

exports.validateCIN = function(location, bypassForAdmin) {
    return location('cin').custom((value) => {
        if(bypassForAdmin==true&& decoded.role === "Admin"){
            return true;
        }else {
            if(decoded.cin != value){
                let err = new Error('You are not authorized to perform this action:');
                err.name = 'UnauthorizedError';
                throw err;
            }else{
                return true;
            }
        }
    });
}

exports.validateRole = function(role) {
    return header('Authorization').exists().withMessage("Access token required").custom((value) => {
        decoded = tokenModule.verify(value.split(' ')[1]);
        if(decoded == false){
            let err = new Error('Token is invalid');
            err.name = 'UnauthorizedError';
            throw err;
        }else{
            if(decoded.role !== role && role !== "Any"){
                let err = new Error('You are not authorized to perform this action'+role);
                err.name = 'UnauthorizedError';
                throw err;
            }else{
                return value;
            }
        }
    });
}

exports.decoded = decoded;