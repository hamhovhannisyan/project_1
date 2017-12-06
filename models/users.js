let mongoose = require('mongoose');
let Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
const saltRounds = 10;



let userSchema = new Schema({
    first_name: String,
    last_name: String,
    username: {
        type: String,
        unique: true
    },
    email: {
        type:String,
        unique: true
    },
    password: String
}, {versionKey: false});
userSchema.pre("save", function(next){
    let password = this.password;
    bcrypt.hash(password, saltRounds)
        .then((hash) => {
            this.password = hash;
            next();
        })
        .catch((err) => {
            console.log(err);
        })
});

userSchema.methods.comparePassword = function (password) {
    let doc = this;
    return new Promise(function (resolve, reject) {

        bcrypt.compare(password, doc.password, function (err, res) {
            if(err)
                reject(err);
            else
                resolve(res)
        });
    })

}

let User = mongoose.model('users', userSchema);


module.exports = User;