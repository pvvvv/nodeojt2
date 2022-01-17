var passport = require('passport'); // passport require
var LoaclStrategy = require('passport-local').Strategy; // passport-local.Strategy require
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt; 
var opts = {}
var db = require("../models"); // DB
const jwtKey = require('../config/jwt-index');
var bcrypt = require('bcrypt');


module.exports = function(res ,req){
    passport.serializeUser(function(user, done){
        done(null, user);
    });

    passport.deserializeUser(async function(user, done){
        console.log("11");
        try {    
            if(user === undefined || user === null){
                return done(null, false);
            }else{
                return done(null, user);
            }// 세션
        } catch (error) {
            
        };
    });
    
    passport.use(new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: jwtKey.jwtKey.SECRET
    },(paylode, next)=>{
        db.user.findOne({
            where:{
                id: paylode.id,
            }
        }).then(async (user)=>{
            console.log("1");
            if(!user){
                console.log("2");
                next(null, false);
            }else{
                console.log("3");
                next(null, user);
            }
        }).catch((err) =>{
            console.log(err);
            next(null, false);
        });
    }
    ));

};// export