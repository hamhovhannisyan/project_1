const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = {
    isAuthenticated: function (req, res, next) {

        // check header or url parameters or post parameters for token
        let token = req.body.token || req.query.token || req.headers['x-access-token'];

        // decode token
        if (token) {

            // verifies secret and checks exp
            jwt.verify(token, config.jwtSecret, function (err, decoded) {
                if (err) {
                    return res.json({status: false, message: 'Failed to authenticate token.'});
                } else {
                    // if everything is good, save to request for use in other routes
                    req.user = decoded;
                    next();
                }
            });

        } else {

            // if there is no token
            // return an error
            return res.status(403).send({
                status: false,
                message: 'No token provided.'
            });

        }

    }
};


