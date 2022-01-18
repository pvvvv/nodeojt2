const winston = require('winston');
const winstonDaily = require('winston-daily-rotate-file');
const logDir = './logs';

// const logFormat = function(){
//     return `${info.timestamp} ${info.level}: ${info.message}`;
// };


const colors = {error: 'red', warn: 'yellow', info: 'green', http: 'magenta', debug: 'blue'}
winston.addColors(colors);

const format = winston.format.combine(
    winston.format.timestamp({format:'YYYY-MM-DD HH:MM:SS'}),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level} ${info.message}`
    )
)

/*
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */
const logger = winston.createLogger({
    format,
    transports: [
      // info 레벨 로그를 저장할 파일 설정
        new winstonDaily({
            level: 'info',
            datePattern: 'YYYY-MM-DD',
            dirname: `${logDir}/log`,
            filename: `%DATE%.log`,
            maxFiles: 30,  // 30일치 로그 파일 저장
            zippedArchive: true, 
        }),
      // error 레벨 로그를 저장할 파일 설정
        new winstonDaily({
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            dirname: `${logDir}/error`,  // error.log 파일은 /logs/error 하위에 저장 
            filename: `%DATE%.error.log`,
            maxFiles: 30,
            zippedArchive: true,
        }),
        new winston.transports.Console({
            handleExceptions: true
        })
    ]
});

module.exports = logger;
module.exports.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
}