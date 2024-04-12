const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../models").userModel;

module.exports = (passport) =>{
    let opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
    opts.secretOrKey = process.env.PASSPORT_SECRET;
    passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
        User.findOne({_id: jwt_payload._id})
        .then((data) => {
            console.log(data);
            if(!data.username){
                console.log("User not found.");
                return done(null, false); 
                 
            }
            if(data.username){
                console.log("User found.");
                console.log(data);
                return done(null, data);
            }else{
                console.log("Error ocurred.");
                console.log(data);
                return done(null, false);   
            }
        })
    }))
}