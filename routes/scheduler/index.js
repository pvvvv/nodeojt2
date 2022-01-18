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

//스케줄러 통계 전체 일별 주별 월별 구분
router.get('/statistics/all', scheduleController.scheduleAllStatistics);
router.get('/statistics/day', scheduleController.scheduleDayStatistics);
router.get('/statistics/week', scheduleController.scheduleWeekStatistics);
router.get('/statistics/month', scheduleController.scheduleMonthStatistics);


// Ajax
/* 예약시 시간이 겹치지않도록 데이터를 조회하는 Ajax  ㄱ*/ 
router.get('/date',auth, scheduleController.findDate);
/* 종료날짜 선택시 시간이 겹치지않도록 데이터를 조회하는 Ajax ㄱ */
router.get('/end-date',auth, scheduleController.findEndDate);
/* 시간 클릭시 그 시간과 가장 가까운 데이터를 조회하는 Ajax ㄱ */
router.get('/closest-time',auth, scheduleController.findClosestTime);



module.exports = router;