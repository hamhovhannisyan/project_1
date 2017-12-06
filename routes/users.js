let express = require('express');
let User = require('../models/users');
let jwt = require('jsonwebtoken');
let config = require('../config');
let auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator/check');

let router = express.Router();

/* GET users listing. */
router.post('/register', [
    check('first_name')
        .exists().withMessage('first name field should be not empty'),
    check('last_name')
        .exists().withMessage('last name field should be not empty'),
    check('email')
        .isEmail().withMessage('email field should be an email')
        .custom(value => {
            return User.findOne({email: value})
                .then(user => {
                    return !user
                })
                .catch((err) => {
                    console.log(err);
                });
        }).withMessage('This email is already in use'),
    check('username')
        .isLength({ min: 4 }).withMessage("username should have minimum 4 chars")
        .custom(value => {
             return User.findOne({username: value})
                .then(user => {
                    return !user;
                })
                .catch((err) => {
                    console.log(err);
                });
        }).withMessage('This username is already in use'),
    check('password', 'passwords must be at least 6 chars long and contain one number')
        .isLength({ min: 6 }),
    check('pConfirmation', 'pConfirmation field must have the same value as the password field')
        .exists()
        .custom((value, { req }) => value === req.body.password),

], function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.mapped() });
    }
    new User(req.body).save()
        .then((result) => {
            res.json({message: "success"})
        })
        .catch((err) => {
            console.log(err);
            res.json({message: "error"})
        })
});
router.post('/login', function(req, res, next) {
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({username: username})
        .then(function(doc){
            if(!doc){
                res.statusCode(401).json({"authentication": false, "message": "Provided username does not exist"});
                return
            }
            doc.comparePassword(password)
                .then(function(isMatch){
                    if(!isMatch){
                        res.statusCode(401).json({"authentication": false, "message": "Provided password is wrong"});
                        return
                    }
                    jwt.sign({
                        id: doc._id
                    }, config.jwtSecret, { expiresIn: 60 * 60 }, function (err, jwt) {
                        if(err){
                            res.statusCode(401).json({"authentication": false});
                        }
                        res.json({"authentication": true, token: jwt});
                    });

                })
                .catch(function (err) {
                    console.log(err);

                })
        })
});

router.post('/upload', auth.isAuthenticated, function (req, res, next) {
    console.log(req.user)
})

module.exports = router;
