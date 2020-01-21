const jwt = require("jsonwebtoken")
const JWT_SECRET = process.env.JWT_SECRET

// Utility class used to verify JWT tokens in the api
class AuthHelper {

    constructor() {

    }

    // Function verifies using the JWT secret enclosed in the serverless.yml file
    verify(token) {

        try {
            jwt.verify(token, JWT_SECRET);
            return 200;
        }
        catch (err) {
            return 401;
        }
    }
}


module.exports = AuthHelper
