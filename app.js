/*
npm install --prefix ./public bootstrap
npm install --prefix ./public angular
*/

//зависимости
/*
var ActiveDirectory = require('activedirectory');
var jwt             = require('jsonwebtoken');
var multiparty      = require('connect-multiparty');
*/
var fs              = require('fs');
var https           = require('https');
var http            = require('http');
var express 	    = require('express');
var bodyParser      = require('body-parser');
var config          = require('./config');
var request         = require('request');
var async           = require('async');

var app             = express();

app.set('portHttp', config.portHttp);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('public')); //папка со статическими файлами

var apiRoutes = express.Router(); //объявление роутера

//точка входа в роутер
apiRoutes.get('/', function(req, res) {
    res.status(403).send('API входа и получения данных');
});

//проводим авторизацию
apiRoutes.post('/authenticate', function(req, res) {
    res.status(200).send('ok');
});

app.use('/api', apiRoutes);

app.listen(app.get('portHttp'));