var passport = require('passport'); // passport require
var LoaclStrategy = require('passport-local').Strategy; // passport-local.Strategy require
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var logger = require('../config/logger')
var opts = {}
var db = require("../models"); // DB
const jwtKey = require('../config/jwt-index');
var bcrypt = require('bcrypt');

module.exports = () => {
    passport.serializeUser(function(user, done){
        done(null, user);
    });

    passport.deserializeUser(async function(user, done){
        logger.info("PASSPORT : deserializeUser");
        try {    
            if(user === undefined || user === null){
                return done(null, false);
            }else{
                return done(null, user);
            }
        } catch (error) {
            console.log(error);
            return done(null, false);
        };
    });
    
    passport.use(new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: jwtKey.jwtKey.SECRET
    },(paylode, next)=>{
        logger.info("PASSPORT : paylode.id : " + paylode.id);
        db.user.findOne({
            where:{
                id: paylode.id,
            }
        }).then(async (user)=>{
            logger.info("PASSPORT : user.id : " + user.id);
            if(!user){
                next(null, false);
            }else{
                next(null, user);
            }
        }).catch((err) =>{
            logger.error("PASSPORT : err : " + err);
            next(null, false);
        });
    }
    ));

};// export