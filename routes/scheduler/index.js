var express = require('express');
var router = express.Router();
var scheduleController = require('./scheduler-controller');
var auth = require('../../config/auth');

// schedule CRUD
/* GET schedule page. */
router.get('/',auth ,scheduleController.schedulerPage);
/* POST schedule page */
router.post('/',auth, scheduleController.scheduleInsert);
/* put schedule page */
router.put('/',auth, scheduleController.scheduleModify);
/* delete schedule page */
router.delete('/',auth, scheduleController.scheduleDelete);

// 페이지 이동
/* 인서트 페이지로 이동하기 */
router.get('/insertpage', scheduleController.scheduleInsertPage);
/* 수정 페이지로 이동하기. */
router.get('/modify', scheduleController.scheduleModifyPage);

// Ajax
/* 예약시 시간이 겹치지않도록 데이터를 조회하는 Ajax */
router.post('/findDate',auth, scheduleController.findDate);
/* 종료날짜 선택시 시간이 겹치지않도록 데이터를 조회하는 Ajax */
router.post('/findEndDate',auth, scheduleController.findEndDate);
/* 시간 클릭시 그 시간과 가장 가까운 데이터를 조회하는 Ajax */
router.post('/closestTime',auth, scheduleController.findClosestTime);



module.exports = router;