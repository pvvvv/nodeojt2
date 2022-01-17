var express = require('express');
var router = express.Router();
var userController = require('../routes/user/user-controller');
var scheduleController = require('../routes/scheduler/scheduler-controller');

/* 로그인 페이지로 이동 */
router.get('/', userController.loginPage);
/* 회원가입 페이지로 이동 */
router.get('/join', userController.joinPage);


module.exports = router;



/**
 * http://localhost:3000/user/login
 * id : 1212
 * password : 123123
 * 
 * http://localhost:3000/user/findoverlap
 * id : 1212
 * 
 * http://localhost:3000/user/join
 * id : 1314
 * name : wow
 * password : 123123
 * 
 * http://localhost:3000/user/logout
 * 
 * 겟 http://localhost:3000/scheduler 
 * 
 * http://localhost:3000/scheduler/findDate
 * startDate : 2022-01-10
 * roomName : 301호
 * 포스트
 * 풋
 * 딜리트
 * 
 */