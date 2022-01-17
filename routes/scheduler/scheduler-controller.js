var db = require("../../models");
var sequelize = require('sequelize');
var moment = require('moment');

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
            res.status(206);
        }else{
            res.status(200).json(data);
        }
    } catch (error) {
        next(error);
    };
};
 
/* 스케줄러 인서트 페이지로 이동 */
exports.scheduleInsertPage = async function(req, res, next){
    res.render('insert-scheduler.html');
};

/* 특정 자원, 날짜 조회하여 예약된데이터 반환 */
exports.findDate = async function(req, res, next){
    var OP = sequelize.Op;
    var {startDate, roomName, calendarId, path} = req.body;
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
        return res.status(200).json(findData);
    } catch (error) {
        next(error);
    };
};

/* 시간에 맞는 인접값을 가져오는 함수 */
exports.findClosestTime = async function(req, res, next){
    var OP = sequelize.Op;
    var statusNum;
    var {startDate, startTime, roomName,calendarId, path} = req.body;
    var modNum = calendarId;
    var endDateMin = startDate+"T00:00:00";
    var endDateMax = startDate+"T23:59:59";
    var start = startDate+"T"+startTime;

    console.log("2번")
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
        res.status(200).json(findData);
    } catch (error) {
        next(error);
    };

}

/* 선택한 종료날짜와 종료시간으로 시간이 겹치지않도록 데이터를 조회하는 함수 */
exports.findEndDate = async function(req, res, next){
    var OP = sequelize.Op;
    var {endDate, roomName, endTime, calendarId, path} = req.body;
    var modNum = calendarId;
    var start = endDate+"T"+endTime;
    console.log("3번")
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
        return res.status(200).json(findData);
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
    var {name, location, title, startDate, startTime, endDate, endTime, allday} = req.body;
    var id = req.session.user.id;
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
        if(category == "allday"){
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
        };

        if(startTime == undefined || endTime == undefined){
            if(findMiddleSchedule !== undefined){
                success.text = "종일 예약이 불가능한 시간입니다. 달력을 확인해주세요";
                statusNum = 205;
            }else{
                success.text = "예약이 불가능한 시간입니다. 달력을 확인해주세요";
                statusNum = 206;
            }
        }else if(findMiddleSchedule !== undefined && findMiddleSchedule.length > 0){
            success.text = "종일 예약이 불가능한 시간입니다. 달력을 확인해주세요";
            statusNum = 204;
        }else{
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
                    statusNum = 201;
                }else{
                    success.text = "새로고침 후 다시 진행해주세요.";
                    statusNum = 400;
                }
            } catch (error) {
                next(error);
            }
        }
        res.status(statusNum).json(success);
    }catch (error) {
        next(error);
    }
};

/* 스케줄 삭제 */
exports.scheduleDelete = async function(req, res, next){
    var statusNum;
    var findData
    var success = {}
    var nowLoginId = req.session.user.id;
    var {id, calendarId} = req.body;
    
    try {
        if(nowLoginId !== Number(id)){
            success.errorMessage = "타인의 일정은 지울 수 없습니다.";
            statusNum = 401;
        }else{
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
                    success.errorMessage = "데이터 삭제 실패!";
                    statusNum = 410;
                };
            }else{
                success.errorMessage = "고객센터로 문의해주세요";
                statusNum = 400;
            };
        };
        res.status(statusNum).json(success);
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
    var {name, location, title, startDate, startTime, endDate, endTime, allday} = req.body;
    var id = req.session.user.id;
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
        if(category == "allday"){
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
        };

        if(startTime == undefined || endTime == undefined){
            if(findMiddleSchedule !== undefined){
                success.text = "종일 예약이 불가능한 시간입니다. 달력을 확인해주세요";
                statusNum = 205;
            }else{
                success.text = "예약이 불가능한 시간입니다. 달력을 확인해주세요";
                statusNum = 205;
            }
        }else if(findMiddleSchedule !== undefined && findMiddleSchedule.length > 0){
            success.text = "종일 예약이 불가능한 시간입니다. 달력을 확인해주세요";
            statusNum = 204;
        }else{
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
                    statusNum = 201;
                }else{
                    success.text = "새로고침 후 다시 진행해주세요.";
                    statusNum = 205;
                }
            } catch (error) {
                next(error);
            }
        }
        res.status(statusNum).json(success);
    }catch (error) {
        next(error);
    }



}