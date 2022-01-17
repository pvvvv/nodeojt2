const passport = require('passport');

module.exports = function(req, res, next){
    console.log("456");
    passport.authenticate('jwt',{session : false});
    next();
}
    // passport.authenticate('jwt',{session : false}, async (error, user, info) => {
    //     console.log("hi");
    //     if(error){
    //         next(error);
    //     }
    //     if(user) {
    //         next();
    //     }else{
    //         res.status(403)
    //     }  
    // });



    
