let { body,validationResult } = require("express-validator");
let {Response} = require('./responseHandler')
let constants = require('./constants')
let util = require('util')
let options = {
    optionPassword: {
        minLength: 8,
        minNumbers: 1,
        minLowercase: 1,
        minSymbols: 1,
        minUppercase: 1
    }
}

module.exports = {
    validatorRegister: [
        body("email").isEmail().withMessage(constants.MESSAGE_ERROR_VALIDATOR_EMAIL),
        body("password").isStrongPassword(options.optionPassword).withMessage(util.format(constants.MESSAGE_ERROR_VALIDATOR_PASSWORD,
            options.optionPassword.minLength,
            options.optionPassword.minSymbols,
            options.optionPassword.minLowercase,
            options.optionPassword.minUppercase,
            options.optionPassword.minNumbers
        )),
        body("username").isAlphanumeric().withMessage(constants.MESSAGE_ERROR_VALIDATOR_USERNAME)
    ],
    validatorChangpassword: [
        body("newpassword").isStrongPassword(options.optionPassword).withMessage(util.format(constants.MESSAGE_ERROR_VALIDATOR_PASSWORD,
            options.optionPassword.minLength,
            options.optionPassword.minSymbols,
            options.optionPassword.minLowercase,
            options.optionPassword.minUppercase,
            options.optionPassword.minNumbers
        ))
    ],
      validatorForgotPassword: [
        body("email").isEmail().withMessage(constants.MESSAGE_ERROR_VALIDATOR_EMAIL)
    ],
    validatedResult: function (req, res, next) {
        let result = validationResult(req);
        console.log(result);
        if (result.errors.length > 0) {
            // Format error messages as readable string
            const errorMessages = result.errors.map(err => err.msg).join(', ');
            Response(res, 400, false, errorMessages);
        } else {
            next();
        }
    }
}