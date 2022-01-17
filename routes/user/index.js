var express = require('express');
var passport = require('passport');
var router = express.Router();
var userController = require('./user-controller');
var auth = require('../../config/auth');

/* 사번 중복확인 */
router.post('/findoverlap', userController.findoverlap);
/* 회원가입 */
router.post('/join', userController.doJoin);
/* 로그인 + Passport */
router.post('/login', userController.doLogin);
/* 로그아웃 */
router.get('/logout', auth, userController.logout);






module.exports = router;