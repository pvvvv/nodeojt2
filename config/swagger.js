const swaggerUi = require('swagger-ui-express');
const swaggereJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Node.js OJT',
            version: '1.0.0',
            description: '스웨~~~~~~~~~ㄱ'
        },
        host: 'localhost:3000',
        basePath: '/'
    },
    apis: [
        path.join(__dirname, '../routes/*/*.yaml'),
        path.join(__dirname, '../routes/*/*.js'), 
    ]
};

const specs = swaggereJsdoc(options);

module.exports = {
    swaggerUi,
    specs
};