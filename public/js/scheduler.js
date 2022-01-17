
    var currentYearMonth = {
        year:'2022',
        month:'01',
        holiDays : []
    }

    var createCalendar = function () {

        var cal = new tui.Calendar('#calendar', {
            defaultView: 'month', // set 'week' or 'day'
            month: {
                daynames: ['일', '월', '화', '수', '목', '금', '토'],
                startDayOfWeek: 0,
                narrowWeekend: false
            }
            , useDetailPopup: true
            , useCreationPopup: true
            , template: {
                popupSave: function () {
                    return 'Save';
                },
                popupUpdate: function () {
                    return 'Update';
                },
                popupDetailDate: function (isAllDay, start, end) {
                    var isSameDate = moment(start).isSame(end);
                    var endFormat = (isSameDate ? '' : 'YYYY.MM.DD ') + 'hh:mm a';

                    if (true) {
                        return moment(start).format('YYYY.MM.DD') + (isSameDate ? '' : ' - ' + moment(end).format('YYYY.MM.DD'));
                    }

                    return (moment(start).format('YYYY.MM.DD hh:mm a') + ' - ' + moment(end).format(endFormat));
                },
                popupDetailLocation: function (schedule) {
                    return 'Location : ' + schedule.location;
                },
                popupDetailUser: function (schedule) {
                    return 'User : ' + (schedule.attendees || []).join(', ');
                },
                popupDetailState: function (schedule) {
                    return 'State : ' + schedule.state || 'Busy';
                },
                popupDetailRepeat: function (schedule) {
                    return 'Repeat : ' + schedule.recurrenceRule;
                },
                popupDetailBody: function (schedule) {
                    return 'Body : ' + schedule.body;
                },
                popupEdit: function () {
                    return 'Edit';
                },
                popupDelete: function () {
                    return 'Delete';
                }
            }
        });

        return cal;
    };

    function zeroPad(nr,base){
        if (base === undefined){
            base = 10
        }
        var  len = (String(base).length - String(nr).length)+1;
        return len > 0? new Array(len).join('0')+nr : nr;
    }

    function addCalendarListener(cal) {
        $('span#menu-navi > .btn').on('click', function (e) {
            var action = $(this).data('action');
            var year, month;
            switch (action) {
                case 'move-prev':
                    cal.prev();
                    break;
                case 'move-next':
                    cal.next();
                    break;
                case 'move-today':
                    cal.today();

                    break;
                default:
                    return;
            }
            setRenderRangeText(cal);

            setTimeout(function(){
                var r = getHoliDays(cal);
                currentYearMonth.holiDays = r;
                reColor();

            }, 10);
            e.stopPropagation();
            e.preventDefault();
            e.stopImmediatePropagation();
        })
    }


    function setRenderRangeText(cal) {
        var renderRange = document.getElementById('renderRange');
        var options = cal.getOptions();
        var viewName = cal.getViewName();
        var html = [];
        if (viewName === 'day') {
            html.push(moment(cal.getDate().getTime()).format('YYYY.MM.DD'));
        } else if (viewName === 'month' &&
            (!options.month.visibleWeeksCount || options.month.visibleWeeksCount > 4)) {
            html.push(moment(cal.getDate().getTime()).format('YYYY.MM'));
        } else {
            html.push(moment(cal.getDateRangeStart().getTime()).format('YYYY.MM.DD'));
            html.push(' ~ ');
            html.push(moment(cal.getDateRangeEnd().getTime()).format(' MM.DD'));
        }
        renderRange.innerHTML = html.join('');
    }

    function getUserData() {
        var users = [];
        var names = ['박태근', '윤우열', '정봉오', '김소정', '김혜란'];
        var colors = ['#9e5fff', '#00a9ff', '#ff5583', '#03bd9e', '#bbdc00'];
        var employ_type = ['regular', 'regular', 'regular', 'regular', 'regular']
        for (var i = 0; i < 5; i++) {
            var user = {
                'name': names[i],
                'id': String(i + 1),
                'employ_type': employ_type[i],
                'color': colors[i]
            };
            users.push(user);
        }

        return users;

    }

    function renderLNB(users) {
        var template = $('#template-lnb-calendars-item').html();
        Mustache.parse(template);   // optional, speeds up future uses
        var rendered = Mustache.render(template, {'users': users});
        $('#calendarList').html(rendered);
    }

    function addLNBListener(users, cal) {
        console.log('addLNBListener');
        $('div.lnb-calendars-item > label').off('click');
        $('div.lnb-calendars-item > label').on('click', function (e) {
            var id = $(this).find('input').val();
            var $firstSpan = $(this).find('span').first();
            var visible = $firstSpan.data('visible');
            if (visible == 'visible') {
                $firstSpan.css('background-color', 'transparent');
                cal.toggleSchedules(id, true, true);
                $firstSpan.data('visible', 'hidden');
            } else {
                $firstSpan.css('background-color', $firstSpan.css('border-color'));
                cal.toggleSchedules(id, false, true);
                $firstSpan.data('visible', 'visible');
            }
            e.stopPropagation();
            e.preventDefault();
            e.stopImmediatePropagation();
        });
    }

    var CalendarList = undefined;
    function getCalendars(users) {
        var calendars = [];
        for (var user of users) {
            calendars.push({
                id: user['id'],
                name: user['name'],
                color: '#ffffff',
                bgColor: user['color'],
                dragBgColor: user['color'],
                borderColor: user['color'],
                checked: true
            })
        }

        CalendarList = calendars;
        return calendars;
    }

    function getHoliDays(cal){
        var d = cal.getDate()['_date'];
        currentYearMonth.year = d.getFullYear();
        currentYearMonth.month = zeroPad(d.getMonth()+1, 10);

        var year = currentYearMonth.year,
            month = currentYearMonth.month;

        var holiyDays = {
            '2019':['0101','0204','0205','0206','0301','0505','0512','0606','0815','0912','0913','0914','1003','1009','1225']
        }

        var days = holiyDays[year];
        var day_arr = [];

        for (var day of days){

            if (day.startsWith(month)){
                day_arr.push(year+'-'+month+'-'+day.substring(2))
            }
        }

        var convertedMonth = month*1-1;

        var date = new Date(year, convertedMonth, 1);
        date.setMonth(convertedMonth);
        while(date.getMonth() == convertedMonth) {

            var day = date.getDay();
            if (  day == 0 || day == 6){
                day_arr.push(year+'-'+month+'-'+zeroPad(date.getDate()));
            }
            date.setDate(date.getDate()+1);
        }


        day_arr.sort();
        return day_arr;
    }

    function reColor(){
        $('.tui-full-calendar-weekday-grid-date').each(function(index){
            if($(this).parent().parent().parent().hasClass('tui-full-calendar-extra-date')){
                return true;
            }
           for(var date of currentYearMonth.holiDays){
               var d = date.split('-')[2]*1;
               console.log($(this).text())
               var p = $(this).parent();
               if($(this).text() == d){
                   $(this).parent().css('color', '#ff4040');
                   console.log(p.css('color'))
               }
           }
        });
    }
    var uniqueId = (function(){ var id=0; return function(){ return id++;} })();


    function addSchedules(cal, users) {
        var holiDays = getHoliDays(cal);

        function getDay(dateStr){
            var dateArr = dateStr.split('-');
            return new Date(dateArr[0], dateArr[1]*1-1, dateArr[2]*1).getDay();
        }

        function getFormatedDate(date){

            var year = date.getFullYear();
            var month = zeroPad(date.getMonth()+1);
            var dd = zeroPad(date.getDate());

            return year+'-'+month+'-'+dd;
        }

        function getNextDate(holiyDays, holyDay){
            var dateArr = holyDay.split('-');
            var date = new Date(dateArr[0], dateArr[1]*1-1, dateArr[2]*1);
            var stop = false;
            do {
                date.setDate(date.getDate()+1);
                if(date.getDay() == 0){
                    continue;
                }
                if(date.getDay() == 6){
                    continue;
                }

                var yyyyMMdd = getFormatedDate(date);
                for(var h of holiyDays){
                    if (h == yyyyMMdd){
                        continue;
                    }
                }
                stop=true;
                return yyyyMMdd;

            } while(!stop);
        }

        function getPreDate(holiyDays, holyDay){
            var dateArr = holyDay.split('-');
            var date = new Date(dateArr[0], dateArr[1]*1-1, dateArr[2]*1);
            var stop = false;
            do {
                date.setDate(date.getDate()-1);
                if(date.getDay() == 0){
                    continue;
                }
                if(date.getDay() == 6){
                    continue;
                }

                var yyyyMMdd = getFormatedDate(date);
                for(var h of holiyDays){
                    if (h == yyyyMMdd){
                        continue;
                    }
                }
                stop=true;
                return yyyyMMdd;

            } while(!stop);
        }

        var schedules = [];
        var lengthOfUsers = users.length;

        for (var index in holiDays){
            var user = users[index%lengthOfUsers];

            var holiDay = holiDays[index];
            schedules.push({
                id: String(uniqueId()),
                isAllDay: true,
                calendarId: user['id'],
                title: user['name']+' 휴일 근무',
                category: 'allday',
                dueDateClass: '',
                dragBgColor: user['color'],
                bgColor: user['color'],
                start: holiDay,
                end: holiDay
            });

            var day = getDay(holiDay);
            switch(day){
                case 0:
                    var preDate = getPreDate(holiDays, holiDay);
                    schedules.push({
                        id: String(uniqueId()),
                        isAllDay: true,
                        calendarId: user['id'],
                        title: user['name']+' 대체 휴일',
                        category: 'allday',
                        dueDateClass: '',
                        dragBgColor: user['color'],
                        bgColor: user['color'],
                        start: preDate,
                        end: preDate
                    });
                    break;
                case 6:
                    var nextDate = getNextDate(holiDays, holiDay);
                    schedules.push({
                        id: String(uniqueId()),
                        isAllDay: true,
                        calendarId: user['id'],
                        title: user['name']+' 대체 휴일',
                        category: 'allday',
                        dueDateClass: '',
                        dragBgColor: user['color'],
                        bgColor: user['color'],
                        start: nextDate,
                        end: nextDate
                    });
                    break;
            }


        }




        cal.createSchedules(schedules);

    }



    function onNewSchedule() {
        var title = $('#new-schedule-title').val();
        var location = $('#new-schedule-location').val();
        var isAllDay = true;
        var start = datePicker.getStartDate();
        var end = datePicker.getEndDate();
        var calendar = selectedCalendar ? selectedCalendar : CalendarList[0];

        if (!title) {
            return;
        }

        cal.createSchedules([{
            id: String(global_id++),
            calendarId: calendar.id,
            title: title,
            isAllDay: isAllDay,
            start: start,
            end: end,
            category: isAllDay ? 'allday' : 'time',
            dueDateClass: '',
            color: calendar.color,
            bgColor: calendar.bgColor,
            dragBgColor: calendar.bgColor,
            borderColor: calendar.borderColor,
            raw: {
                location: location
            },
            state: 'Busy'
        }]);

        $('#modal-new-schedule').modal('hide');
    }


    function createNewSchedule(event) {
        var start = event.start ? new Date(event.start.getTime()) : new Date();
        var end = event.end ? new Date(event.end.getTime()) : moment().add(1, 'hours').toDate();

        if (useCreationPopup) {
            cal.openCreationPopup({
                start: start,
                end: end
            });
        }
    }

    function onChangeNewScheduleCalendar(e) {
        var target = $(e.target).closest('a[role="menuitem"]')[0];
        var calendarId = getDataAction(target);
        changeNewScheduleCalendar(calendarId);
    }
    function findCalendar(calendarId) {

        var calendar = undefined;
        for(ccc of CalendarList){
            if(ccc.id == calendarId)
            {
                calendar = ccc;
                return ccc
            }
        }
        return calendar;
    }
    var selectedCalendar = undefined;

    function changeNewScheduleCalendar(calendarId) {
        var calendarNameElement = document.getElementById('calendarName');
        var calendar = findCalendar(calendarId);
        var html = [];

        html.push('<span class="calendar-bar" style="background-color: ' + calendar.bgColor + '; border-color:' + calendar.borderColor + ';"></span>');
        html.push('<span class="calendar-name">' + calendar.name + '</span>');

        calendarNameElement.innerHTML = html.join('');

        selectedCalendar = calendar;
    }


    var global_id = 100;
    function saveNewSchedule(scheduleData) {
        var calendar = scheduleData.calendar || findCalendar(scheduleData.calendarId);
        if ( calendar === undefined) {
            return
        }
        scheduleData.isAllDay = true;
        var schedule = {
            id: String(global_id++),
            title: scheduleData.title,
            isAllDay: scheduleData.isAllDay,
            start: scheduleData.start,
            end: scheduleData.end,
            category: scheduleData.isAllDay ? 'allday' : 'time',
            dueDateClass: '',
            color: calendar.color,
            bgColor: calendar.bgColor,
            dragBgColor: calendar.bgColor,
            borderColor: calendar.borderColor,
            location: scheduleData.location,
            raw: {
                class: scheduleData.raw['class']
            },
            state: scheduleData.state
        };
        if (calendar) {
            schedule.calendarId = calendar.id;
            schedule.color = calendar.color;
            schedule.bgColor = calendar.bgColor;
            schedule.borderColor = calendar.borderColor;
        }

        cal.createSchedules([schedule]);

        refreshScheduleVisibility();
    }

    function getDataAction(target) {
        return target.dataset ? target.dataset.action : target.getAttribute('data-action');
    }
    function refreshScheduleVisibility() {
        var calendarElements = Array.prototype.slice.call(document.querySelectorAll('#calendarList input'));

        CalendarList.forEach(function(calendar) {
            cal.toggleSchedules(calendar.id, !calendar.checked, false);
        });

        cal.render(true);

        calendarElements.forEach(function(input) {
            var span = input.nextElementSibling;
            span.style.backgroundColor = input.checked ? span.style.borderColor : 'transparent';
        });
    }
    var cal = undefined;
    $(document).ready(function () {
        var users = getUserData();
        renderLNB(users);
        var calendars = getCalendars(users);
//        cal = createCalendar(calendars);
        cal = createCalendar();
        cal.setCalendars(calendars)
        addLNBListener(users, cal);
        addCalendarListener(cal);
        setRenderRangeText(cal);
        addSchedules(cal, users);

        setTimeout(function(){
            var r = getHoliDays(cal);
            currentYearMonth.holiDays = r;
            reColor();

        }, 10);

        cal.on({
            'clickMore': function(e) {
                console.log('clickMore', e);
            },
            'clickSchedule': function(e) {
                console.log('clickSchedule', e);

            },
            'clickDayname': function(date) {
                console.log('clickDayname', date);
            },
            'beforeCreateSchedule': function(e) {
                console.log('beforeCreateSchedule', e);
                saveNewSchedule(e);
            },
            'beforeUpdateSchedule': function(e) {
                console.log('beforeUpdateSchedule', e);
                e.schedule.start = e.start;
                e.schedule.end = e.end;
                cal.updateSchedule(e.schedule.id, e.schedule.calendarId, e.schedule);
            },
            'beforeDeleteSchedule': function(e) {
                console.log('beforeDeleteSchedule', e);
                cal.deleteSchedule(e.schedule.id, e.schedule.calendarId);
            },
            'afterRenderSchedule': function(e) {
                var schedule = e.schedule;
                // var element = cal.getElement(schedule.id, schedule.calendarId);
                // console.log('afterRenderSchedule', element);
            },
            'clickTimezonesCollapseBtn': function(timezonesCollapsed) {
                console.log('timezonesCollapsed', timezonesCollapsed);

                if (timezonesCollapsed) {
                    cal.setTheme({
                        'week.daygridLeft.width': '77px',
                        'week.timegridLeft.width': '77px'
                    });
                } else {
                    cal.setTheme({
                        'week.daygridLeft.width': '60px',
                        'week.timegridLeft.width': '60px'
                    });
                }

                return true;
            }
        });


        $('#btn-save-schedule').on('click', onNewSchedule);
        $('#btn-new-schedule').on('click', createNewSchedule);

    });