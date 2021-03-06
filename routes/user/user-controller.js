var db = require("../../models");
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const jwtKey = require('../../config/jwt-index');

/* 로그인(메인) 페이지 */
exports.loginPage = async function(req, res, next){
    try{   
        res.render('login.html');
    } catch (error) {
        next(error);
    };
};

/* 회원가입 페이지 */
exports.joinPage = async function(req, res, next){
    try{   
        res.render('join.html');
    } catch (error) {
        next(error);
    };
};

/* 중복확인 */
exports.findoverlap = async function(req, res, next){
    var statusNum;
    var success = {};
    var id = req.body.id;
    
    if(id.length > 4){
        statusNum = 400;
        success.text = "사번을 확인해주세요";
        success.overlapCheck = 0;
        res.status(statusNum
            ).json(success);
    }else{
        try{
            var findData = await db.user.findOne({
                where: {id: id}
            });
            
            if(findData === null){
                statusNum = 200;
                success.text = "사용이 가능한 사번입니다.";
                success.overlapCheck = 1;
            }else{
                statusNum = 409
                success.text = "사용중인 아이디입니다.";
                success.overlapCheck = 0;
            };
            res.status(statusNum).json({
                code : statusNum,
                message : success.text,
                data : success.overlapCheck 
            });
        } catch (error) {
            next(error);
        };
    }
}

/* 회원가입 */
exports.doJoin = async function(req, res, next){
    var success = {};
    var statusNum;
    var {id,name, password} = req.body;
    console.log(id, name, password);
    var regId = /^[0-9]{4}$/;
    var regPw = /^[A-Za-z0-9+]{4,8}$/;

    try{
        var findData = await db.user.findOne({
            where: {id: id}
        });
        
        if(findData !== null){
            statusNum = 409;
            success.text = "이미 가입된 계정입니다";
        }else if(!regId.test(id) || !regPw.test(password)){
            success.text = "잘못된 접근입니다.";
            statusNum = 400;
        }else{
            var saltRounds = 10;
            var salt = bcrypt.genSaltSync(saltRounds);
            var encryptedPassword = bcrypt.hashSync(password, salt);

            try {
                db.user.create({
                    id : id,
                    name : name,
                    password: encryptedPassword
                });
                success.text = "가입되셨습니다!"
                statusNum = 200;
            } catch (error) {
                statusNum = 401;
                success.text = "가입에 실패했습니다. 고객센터로 전화주세요";
            }
        };
        res.status(statusNum).json({
            code : statusNum,
            message : success.text
        });
    } catch (error) {
        next(error);
    };
}

exports.doLogin = async function(req, res, next){
    var {id,password} = req.body;
    var statusNum;

    try {
        var findData = await db.user.findOne({
            where : {
                ID : id
            }
        });

        if(findData === null){
            statusNum = 406;
            res.status(statusNum).json({
                code : 406,
                message : '아이디가 없습니다.'
            });
        }else if(!bcrypt.compareSync(password, findData.password)){
            statusNum = 401;
            res.status(statusNum).json({
                code : 401,
                message : '비밀번호가 다릅니다'
            });
        }else{
            var token = jwt.sign(
                {id: findData.id},
                jwtKey.jwtKey.SECRET
            );
            statusNum = 200;
            res.status(statusNum).json({
                code: 200,
                message: '토큰이 발급되었습니다.',
                token
            });
        }
    } catch (error) {
        next(error);
    }; 
}

exports.logout = async function(req, res, next){

    try{
        req.session.destroy(function(){ 
            req.session;
        });
        res.status(200).json({
            code : 200,
            message: '로그아웃 완료',
        });
    } catch (error) {
        next(error);
    };
}