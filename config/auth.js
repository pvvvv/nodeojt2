const passport = require('passport');
const jwt = require('jsonwebtoken');
const jwtKey = require('../config/jwt-index');
var logger = require('../config/logger')

module.exports = (req, res, next) => 
    passport.authenticate('jwt',{session : false}, async (error, user, info) => {
        logger.info(info);
        logger.info("토큰검증");
        logger.info(user);
        logger.info(error);

        if(error !== null && error.name === 'TokenExpiredError'){
            return res.status(419).json({
                code: 419,
                message: '토큰이 만료되었습니다.'
            });
        }
        if(user) {
            logger.info("토큰검증성공");
            next();
        }else{
            logger.info("토큰검증실패");
            res.status(401).json({
                code : 401,
                message : "유효하지 않은 토큰입니다."
            });
        }  
    })(req, res, next);