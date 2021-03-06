var db = require("../../models");
var sequelize = require('sequelize');
var moment = require('moment');
const logger = require("../../config/logger");
const { INTEGER } = require("sequelize");

/* 스케줄러 페이지로 이동 + 데이터 가지고가서 뿌리기 */
exports.schedulerPage = async function(req, res, next){
    var schedulerData = await db.scheduler.findAll({});
    data = schedulerData;
    for(i=0; i < data.length ; i++){
        var titleMix = "["+data[i].location+"]"+"["+data[i].name+"]"+"["+data[i].title+"]";
        if(data[i].location == "301호"){
            data[i].color = "#ff4040";
        }else if(data[i].location == "302호"){
            data[i].color = "#00a9ff";
        }
        else if(data[i].location == "303호"){
            data[i].color = "#9e5fff";
        }
        else if(data[i].location == "402호"){
            data[i].color = "#bbdc00";
        }
        data[i].title = titleMix;
    }

    try{
        if(data == null || data == undefined){
            res.status(206).json({
                code : 206,
                message : "데이터 없음"
            });
        }else{
            res.status(200).json({
                code : 200,
                message : "",
                data : data,
            });
        }
    } catch (error) {
        next(error);
    };
};
 

/* 특정 자원, 날짜 조회하여 예약된데이터 반환 */
exports.findDate = async function(req, res, next){
    var OP = sequelize.Op;
    var {startDate, roomName, calendarId, path} = req.query;
    var minTime = startDate+"T00:00:00";
    var maxTime = startDate+"T23:59:59";
    var modNum = calendarId;

    try {
        if(path !== undefined && path == "modify"){
            var findData = await db.scheduler.findAll({
                where : {
                    [OP.or]:[
                        {
                            startDate : {
                                [OP.gte] : minTime,// >=
                                [OP.lte] : maxTime // <= 
                            }
                        },
                        {
                            startDate :{
                                [OP.lte] : minTime // <=
                            },
                            endDate : {
                                [OP.gte] : maxTime // <=
                            }
                        },
                        {
                            endDate : {
                                [OP.lte] : maxTime,
                                [OP.gte] : minTime
                            }
                        },
                    ],
                    calendarId: {
                        [sequelize.Op.not]: modNum
                    },
                    location : {
                        [OP.like] : '%' + roomName + '%'
                    }
                },
                order: [['startDate', 'ASC']]
            });
        }else{
            logger.info("durl")
            var findData = await db.scheduler.findAll({
                where : {
                    [OP.or]:[
                        {
                            startDate : {
                                [OP.gte] : minTime,// >=
                                [OP.lte] : maxTime // <= 
                            }
                        },
                        {
                            startDate :{
                                [OP.lte] : minTime // <=
                            },
                            endDate : {
                                [OP.gte] : maxTime // <=
                            }
                        },
                        {
                            endDate : {
                                [OP.lte] : maxTime,
                                [OP.gte] : minTime
                            }
                        },
                    ],
                    location : {
                        [OP.like] : '%' + roomName + '%'
                    }
                },
                order: [['startDate', 'ASC']]
            });
        }

        res.status(200).json({
            code : 200,
            message : "조회성공",
            data : findData
        });
    } catch (error) {
        next(error);
    };
};

/* 시간에 맞는 인접값을 가져오는 함수 */
exports.findClosestTime = async function(req, res, next){
    var OP = sequelize.Op;
    var statusNum;
    var {startDate, startTime, roomName,calendarId, path} = req.query;
    var modNum = calendarId;
    var endDateMin = startDate+"T00:00:00";
    var endDateMax = startDate+"T23:59:59";
    var start = startDate+"T"+startTime;

    try {
        if(path !== undefined && path == "modify"){
            var tempData = await db.scheduler.findAll({
                where : {
                    startDate : {
                        [OP.gte] : start,// >=
                    },
                    startDate : {
                        [OP.gte] : endDateMin,
                        [OP.lte] : endDateMax
                    },
                    calendarId: {
                        [sequelize.Op.not]: modNum
                    },    
                    location : roomName
                },
                order : [['startDate', 'asc']],
            });

            /* 데이터가 1개 이상이거나 */
            if(tempData.length >= 1){
                var tempLastLength = tempData.length -1
                var tempEndDate = (tempData[tempLastLength].endDate).substring(0, 10);

                /* 가져온 데이터가 1개 이상이고 내가 선택한 시작 날짜와 가져온 데이터의 종료날짜가 같다면 */
                if(startDate == tempEndDate){
                    var findData = await db.scheduler.findOne({
                        where : {
                            startDate : {
                                [OP.gte] : start,// >=
                            },
                            calendarId: {
                                [sequelize.Op.not]: modNum
                            },
                            location : roomName
                        },
                        order : [['startDate', 'asc']],
                    });
                }/* 가져온 데이터가 1개 이상이고 내가 선택한 시작 날짜와 가져온 데이터의 종료날짜가 다르다면 */
                else if(startDate !== tempEndDate){
                    var findData = await db.scheduler.findOne({
                        where : {
                            startDate : {
                                [OP.gte] : start,// >=
                            },
                            calendarId: {
                                [sequelize.Op.not]: modNum
                            },
                            location : roomName
                        },
                        order : [['startDate', 'asc']],
                    });
                }
            }

            /* 만약 조회했는데 값이 없다면? */
            if(tempData == ""){
                var findData = await db.scheduler.findOne({
                    where : {
                        [OP.or] : [
                            {
                                startDate : {
                                    [OP.gte] : start,// >=
                                },
                            },
                            {
                                endDate : {
                                    [OP.gte] : endDateMin,
                                    [OP.lte] : endDateMax
                                }
                            },
                            db.sequelize.where(db.sequelize.literal('\''+endDateMax+'\''), {
                                [OP.between] : [
                                    db.sequelize.col("startDate"),
                                    db.sequelize.col("endDate"),
                                ],
                            }),
                        ],
                        calendarId: {
                            [sequelize.Op.not]: modNum
                        },
                        location : roomName
                    },
                    order : [['startDate', 'asc']],
                });
            }
        }else{
            /* 내가 정한 날짜에 시작하는 데이터가 있는지? */
            var tempData = await db.scheduler.findAll({
                where : {
                    startDate : {
                        [OP.gte] : start,// >=
                    },
                    startDate : {
                        [OP.gte] : endDateMin,
                        [OP.lte] : endDateMax
                    },     
                    location : roomName
                },
                order : [['startDate', 'asc']],
            });

            /* 데이터가 1개 이상이거나 */
            if(tempData.length >= 1){
                var tempLastLength = tempData.length -1
                var tempEndDate = (tempData[tempLastLength].endDate).substring(0, 10);

                /* 가져온 데이터가 1개 이상이고 내가 선택한 시작 날짜와 가져온 데이터의 종료날짜가 같다면 */
                if(startDate == tempEndDate){
                    var findData = await db.scheduler.findOne({
                        where : {
                            startDate : {
                                [OP.gte] : start,// >=
                            },
                            location : roomName
                        },
                        order : [['startDate', 'asc']],
                    });
                }/* 가져온 데이터가 1개 이상이고 내가 선택한 시작 날짜와 가져온 데이터의 종료날짜가 다르다면 */
                else if(startDate !== tempEndDate){
                    var findData = await db.scheduler.findOne({
                        where : {
                            startDate : {
                                [OP.gte] : start,// >=
                            },
                            location : roomName
                        },
                        order : [['startDate', 'asc']],
                    });
                }
            }
            /* 만약 조회했는데 값이 없다면? */
            if(tempData == ""){
                var findData = await db.scheduler.findOne({
                    where : {
                        [OP.or] : [
                            {
                                startDate : {
                                    [OP.gte] : start,// >=
                                },
                            },
                            {
                                endDate : {
                                    [OP.gte] : endDateMin,
                                    [OP.lte] : endDateMax
                                }
                            },
                            db.sequelize.where(db.sequelize.literal('\''+endDateMax+'\''), {
                                [OP.between] : [
                                    db.sequelize.col("startDate"),
                                    db.sequelize.col("endDate"),
                                ],
                            }),
                            
                        ],
                        location : roomName
                    },
                    order : [['startDate', 'asc']],
                });
            }
        }
        res.status(200).json({
            code : 200,
            message : "조회성공",
            data : findData
        });
    } catch (error) {
        next(error);
    };

}

/* 선택한 종료날짜와 종료시간으로 시간이 겹치지않도록 데이터를 조회하는 함수 */
exports.findEndDate = async function(req, res, next){
    var OP = sequelize.Op;
    var {endDate, roomName, endTime, calendarId, path} = req.query;
    var modNum = calendarId;
    var start = endDate+"T"+endTime;

    try{
        if(path !== undefined && path == "modify"){
            var findData = await db.scheduler.findOne({
                where : 
                {
                    startDate : {
                        [OP.gte] : start,// >=
                    },
                    calendarId: {
                        [sequelize.Op.not]: modNum
                    },
                    location : roomName
                },
                order : [['startDate', 'asc']],
            });
        }else{
            var findData = await db.scheduler.findOne({
                where : {
                    startDate : {
                        [OP.gte] : start,// >=
                    },
                    location : roomName
                },
                order : [['startDate', 'asc']],
            });
        }
        res.status(200).json({
            code : 200,
            message : "조회성공",
            data : findData
        });
    } catch (error) {
        next(error);
    }
}

/* 스케줄 인서트 */
exports.scheduleInsert = async function(req, res, next){
    var OP = sequelize.Op;
    var statusNum;
    var success = {};
    var findMiddleSchedule
    var {name, location, title, startDate, startTime, endDate, endTime, allday, id} = req.body;
    var category;
    var start = startDate+"T"+startTime;
    var end = endDate+"T"+endTime;

    if(allday === "true"){
        category = "allday";
        start = startDate+"T08:00:00"; 
        end = startDate+"T19:00:00";
    }else{
        category = "time";
    };

    try { 
        findMiddleSchedule = await db.scheduler.findAll({
            where : {
                [OP.or] : [
                    {
                        startDate : {
                            [OP.gte] : start,// >=
                            [OP.lte] : end,// >=
                        },
                    },
                    {
                        endDate : {
                            [OP.gte] : start,
                            [OP.lte] : end
                        },
                    },
                    db.sequelize.where(db.sequelize.literal('\''+start+'\''), {
                        [OP.between] : [
                            db.sequelize.col("startDate"),
                            db.sequelize.col("endDate"),
                        ],
                    }),
                ],     
                location : location
            },
            order : [['startDate', 'asc']],
        });
        
        if(category == "allday" && findMiddleSchedule !== undefined){ // 일정이 있으니까 들어가면 안됨
            success.text = "종일 예약이 불가능한 시간입니다. 달력을 확인해주세요";
            statusNum = 206;
        }else if(category == "time" && findMiddleSchedule !== undefined){
            success.text = "예약이 불가능한 시간입니다. 달력을 확인해주세요";
            statusNum = 206;
        }else if(findMiddleSchedule.length > 0){
            try { // 한번 더 묶어주지 않으면 에러페이지로 이동
                var insertSuccess = await db.scheduler.create({
                    id: id,
                    name : name,
                    title: title,
                    location: location,
                    category: category,
                    startDate: start,
                    endDate: end
                });
                if(insertSuccess !== null){
                    success.text = "성공";
                    statusNum = 200;
                }else{
                    success.text = "새로고침 후 다시 진행해주세요.";
                    statusNum = 400;
                }
            } catch (error) {
                next(error);
            }
        }
        res.status(statusNum).json({
            code : statusNum,
            message : success.text
        });
        logger.info("여기왓다6")
    }catch (error) {
        next(error);
    }
};

/* 스케줄 삭제 */
exports.scheduleDelete = async function(req, res, next){
    var statusNum;
    var findData
    var success = {}
    var {id, calendarId} = req.body;
    
    try {
        findData = await db.scheduler.findOne({
            where : {
                "calendarId" : calendarId,
                "id" : id
            }
        });
        if(findData !== null){
            var delSchedule = await db.scheduler.destroy({
                where: {
                    "calendarId" : calendarId,
                    "id" : id
                }
            });
            if(delSchedule == 1){
                success.text = "삭제완료";
                statusNum = 200;
            }else{
                success.text = "데이터 삭제 실패!";
                statusNum = 400;
            };
        }else{
            success.text = "데이터 찾을수 없음";
            statusNum = 409;
        };

        res.status(statusNum).json({
            code : statusNum,
            message : success.text
        });
    } catch (error) {
        next(error);
    };
};
 
/* 수정 페이지로 이동. */
exports.scheduleModifyPage = async function(req, res, next){
    var scheduleNum = req.query.scheduleNum;
    var nowLoginId = req.session.user.id;
    // 캘린더 번호가 내가 보낸 스케줄 넘버인것.
    var findData = await db.scheduler.findOne({
        where : {
            "calendarId" : scheduleNum,
        }
    });

    // 찾아온 데이터의 아이디가 내가 로그인해놓은 아이디와 같다면
    if(findData !== null && Number(findData.id) == nowLoginId){
        res.render('modify-scheduler.html', {findData : findData});
    }else{
        res.render("error.html", {errorMessage : "타인의 일정은 수정할 수 없습니다"});
    }

}



exports.scheduleModify = async function(req, res, next){
    var OP = sequelize.Op;
    var statusNum;
    var success = {};
    var findMiddleSchedule
    var {name, location, title, startDate, startTime, endDate, endTime, allday, id, calendarId} = req.body;
    var modNum = calendarId;
    var category;
    var start = startDate+"T"+startTime;
    var end = endDate+"T"+endTime;
    
    if(allday === "true"){
        category = "allday";
        start = startDate+"T08:00:00"; 
        end = startDate+"T19:00:00";
    }else{
        category = "time";
    };

    try { 
        findMiddleSchedule = await db.scheduler.findAll({
            where : {
                [OP.or] : [
                    {
                        startDate : {
                            [OP.gte] : start,// >=
                            [OP.lte] : end,// >=
                        },
                    },
                    {
                        endDate : {
                            [OP.gte] : start,
                            [OP.lte] : end
                        },
                    },
                    db.sequelize.where(db.sequelize.literal('\''+start+'\''), {
                        [OP.between] : [
                            db.sequelize.col("startDate"),
                            db.sequelize.col("endDate"),
                        ],
                    }),
                ],
                calendarId: {
                    [sequelize.Op.not]: modNum
                }, 
                location : location
            },
            order : [['startDate', 'asc']],
        });

        logger.info(findMiddleSchedule.length > 0);

        if(category == "allday" && findMiddleSchedule.length > 0){ // 일정이 있으니까 들어가면 안됨
            success.text = "종일 예약이 불가능한 시간입니다. 달력을 확인해주세요";
            statusNum = 406;
        }else if(category == "time" && findMiddleSchedule.length > 0){
            success.text = "예약이 불가능한 시간입니다. 달력을 확인해주세요";
            statusNum = 406;
        }else if(findMiddleSchedule.length == 0){
            try { // 한번 더 묶어주지 않으면 에러페이지로 이동
                var insertSuccess = await db.scheduler.update({
                    id: id,
                    name : name,
                    title: title,
                    location: location,
                    category: category,
                    startDate: start,
                    endDate: end
                },{ where : 
                    {
                        calendarId : modNum
                    }   
                  }
                );
                if(insertSuccess !== null){
                    success.text = "성공";
                    statusNum = 200;
                }else{
                    success.text = "새로고침 후 다시 진행해주세요.";
                    statusNum = 400;
                }
            } catch (error) {
                next(error);
            }
        }

        res.status(statusNum).json({
            code : statusNum,
            message : success.text
        });
    }catch (error) {
        next(error);
    }
}


/*
 * 선택기간 전체 일정조회 및 개인 전체 일정조회
 */
exports.scheduleAllStatistics = async function(req, res, next){
    logger.info("선택기간 일정 조회")
    var OP = sequelize.Op;
    var {startDateTime, endDateTime, location, id} = req.query

    console.log(startDateTime, endDateTime, location, id);
    if(location == "전체"){
        location = "호";
    }
    
    var likeQuery = {[OP.like]:'%'+location+'%'}

    try {
        if(id == "all"){
            var data = await db.scheduler.findAll({ // 선택기간 전체일정
                where : {
                    startDate : {
                        [OP.gte] : startDateTime,
                    },
                    endDate : {
                        [OP.lte] : endDateTime
                    },
                    location : likeQuery
                }
            }); 
        }else{
            var data = await db.scheduler.findAll({ // 선택기간 개인일정
                where : {
                    startDate : {
                        [OP.gte] : startDateTime,
                    },
                    endDate : {
                        [OP.lte] : endDateTime
                    },
                    location : likeQuery,
                    id : id
                }
            }); 
        }

        logger.info("data : " + data);
        res.status(200).json({
            code : 200,
            message : "통계완료",
            data : data
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};
/*
 * 일별 일정조회 및 개인 일별 일정조회
 */
exports.scheduleDayStatistics = async function(req, res, next){
    logger.info("일별 일정 조회")
    var OP = sequelize.Op;
    var {startDate, location, id} = req.query
    var maxDate = startDate.substring(0,10)+"T23:59:59";
    if(location == "전체"){
        location = "호";
    }

    var likeQuery = {[OP.like]:'%'+location+'%'}

    try {
        if(id == "all"){
            logger.info("일별로 전체일정 조회")
            var data = await db.scheduler.findAll({
                where : {
                    startDate : {
                        [OP.gte] : startDate,
                        [OP.lte] : maxDate
                    },
                    location : likeQuery
                }
            });
        }else{
            var data = await db.scheduler.findAll({
                where : {
                    startDate : {
                        [OP.gte] : startDate,
                        [OP.lte] : maxDate
                    },
                    location: likeQuery,
                    id : id
                }
            });
        }

        logger.info("data : " + data);
        res.status(200).json({
            code : 200,
            message : "통계완료",
            data : data
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};
/*
 * 주별 일정조회 및 개인 주별 일정조회
 */
exports.scheduleWeekStatistics = async function(req, res, next){
    logger.info("주별 일정 조회")
    var {startDate, location, id} = req.query
    var choiceDate = new Date(startDate);
    var day = choiceDate.getDay();
    var diff = choiceDate.getDate() - day + (day == 0 ? -6 : 1);
    var startWeeksunday = new Date(choiceDate.setDate(diff)).toISOString().substring(0, 10)+"T08:00:00";
    var endWeeksatday = new Date(choiceDate.setDate(diff+6)).toISOString().substring(0, 10)+"T23:59:59";;
    
    if(location == "전체"){
        location = "호";
    }
    var likeQuery = {[OP.like]:'%'+location+'%'}

    try {
        if(id == "all"){
            var data = await db.scheduler.findAll({
                where : {
                    startDate : {
                        [OP.gte] : startWeeksunday,
                    },
                    endDate : {
                        [OP.lte] : endWeeksatday
                    },
                    location : likeQuery
                }
            });
        }else{
            var data = await db.scheduler.findAll({
                where : {
                    startDate : {
                        [OP.gte] : startWeeksunday,
                    },
                    endDate : {
                        [OP.lte] : endWeeksatday
                    },
                    location : likeQuery,
                    id : id
                }
            });
        }

        logger.info("data : " + data);
        res.status(200).json({
            code : 200,
            message : "통계완료",
            data : data
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

exports.scheduleMonthStatistics = async function(req, res, next){
    logger.info("월별 일정 조회")
    var {startDate, location, id} = req.query
    var yyyy = startDate.substring(0,4)
    var mm = startDate.substring(5,7)
    var minDate = new Date(yyyy,mm-1,2).toISOString().substring(0,10)+"T23:59:59";
    var maxDate = new Date(yyyy,mm,1).toISOString().substring(0,10)+"T23:59:59";

    try {
        if(id == "all"){
            var data = await db.scheduler.findAll({
                where : {
                    startDate : {
                        [OP.gte] : minDate,
                    },
                    endDate : {
                        [OP.lte] : maxDate
                    },
                    location : {
                        [OP.like] : "%"+location+"%"
                    }
                }
            });
        }else{
            var data = await db.scheduler.findAll({
                where : {
                    startDate : {
                        [OP.gte] : minDate,
                    },
                    endDate : {
                        [OP.lte] : maxDate
                    },
                    location : location,
                    id : id
                }
            });
        }

        logger.info("data : " + data);
        res.status(200).json({
            code : 200,
            message : "통계완료",
            data : data
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};




