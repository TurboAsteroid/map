'use strict';

//зависимости
var ActiveDirectory = require('activedirectory');
var fs = require('fs');
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var config = require('./ppm-map-config');
var async = require('async');
var session = require('express-session');
let MongoDBStore = require('connect-mongodb-session')(session);
var cookieParser = require('cookie-parser');
var MongoClient = require('mongodb').MongoClient;
var favicon = require('serve-favicon');

var app = express();

app.set('accessGroup', config.accessGroup);
app.set('portHttp', config.portHttp);
app.set('adServer', config.adServer);
app.set('adBaseDN', config.adBaseDN);
app.set('adUser', config.adUser);
app.set('adPassword', config.adPassword);
app.set('cookieSecret', config.cookieSecret);
app.set('dbHost', config.dbHost);
app.set('dbDatabase', config.dbDatabase);
app.set('dbUser', config.dbUser);
app.set('dbPassword', config.dbPassword);
/*
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://10.1.100.161:7070');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, origin, accept');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
*/
app.use(express.static('public')); //папка со статическими файлами
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(favicon(__dirname + '/public/favicon.ico'));

let store = new MongoDBStore(
    {
        uri: 'mongodb://' + app.get('dbUser') + ':' + app.get('dbPassword') + '@' + app.get('dbHost') + ':27017/' + app.get('dbDatabase'),
        collection: 'sessions'
    },
    function (error) {
    });

store.on('error', function(error) {
    assert.ifError(error);
    assert.ok(false);
});
app.use(
    session({
    secret: app.get('cookieSecret'),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
    store: store,
    resave: true,
    saveUninitialized: false
})
);


// Настройка модуля ActiveDirectory
var ad = new ActiveDirectory({
    url: app.get('adServer'),
    baseDN: app.get('adBaseDN'),
    username: app.get('adUser'),
    password: app.get('adPassword')
});

// Connection URL
var url = 'mongodb://' + app.get('dbUser') + ':' + app.get('dbPassword') + '@' + app.get('dbHost') + ':27017/' + app.get('dbDatabase');
var dbCon;
MongoClient.connect(url, function (err, db) {
    dbCon = db;
    app.listen(app.get('portHttp'));
});

var reportDate;

app.all('*', function (req, res, next) {
    async.parallel(
        [
            function (callback) {
                dbCon.collection('dates_list').find({}, {timestamp: 1}).sort({timestamp: -1}).limit(1).toArray(callback);
            }
        ],
        function (err, results) {
            reportDate = req.body.date ? parseInt(req.body.date) : results[0][0].timestamp;
            next();
        }
    )
});

var apiRoutes = express.Router(); //объявление роутера

app.all('*', function (req, res, next) {
    if (req.method === 'OPTIONS')
        next();
    else {
        let username, password;
        if (!req.session.username && !req.body.username && !req.body.password) {
            res.status(401).json({
                success: false,
                message: 'Некорректное имя пользователя или пароль'
            });
        }
        else if (req.body.username && req.body.password) {
            if (req.body.username.indexOf('@elem.ru') == -1 || req.body.username.indexOf('@') == -1)
                req.body.username += "@elem.ru";
            username = req.body.username;
            password = req.body.password;
            let isAuthenticatedPr = new Promise((resolve, reject) => {
                ad.authenticate(username, password, function (err, isAuthenticated) {
                    if (err || !isAuthenticated)
                        reject({
                            success: false,
                            message: 'Некорректное имя пользователя или пароль'
                        });
                    else
                        resolve({
                            success: true,
                            message: 'Аутентификация прошла успешно'
                        });
                });
            });
            let isMemberPr = new Promise((resolve, reject) => {
                ad.isUserMemberOf(username, app.get('accessGroup'), function (err, isMember) {
                    if (err || !isMember)
                        reject({
                            success: false,
                            message: 'Пользователь не принадлежит группе'
                        });
                    else
                        resolve({
                            success: true,
                            message: 'Пользователь принадлежит группе'
                        });
                });
            });
            Promise.all([isAuthenticatedPr, isMemberPr])
                .then(
                    result => {
                        req.session.username = req.body.username;
                        res.status(200).json({
                            success: true,
                            result : result
                        });
                    },
                    reason => {
                        res.status(400).send(reason);
                    }
                );
        }
        else if (req.session.username && req.session.id) {
            let username = req.session.username;
            let isMemberPr = new Promise((resolve, reject) => {
                ad.isUserMemberOf(username, app.get('accessGroup'), function (err, isMember) {
                    if (err || !isMember)
                        reject({
                            success: false,
                            message: 'Пользователь не принадлежит группе'
                        });
                    else
                        resolve({
                            success: true,
                            message: 'Пользователь принадлежит группе'
                        });
                });
            });
            Promise.all([isMemberPr])
                .then(
                    result => {
                        next();
                    },
                    reason => {
                        res.status(400).send(reason);
                    }
                );
        }
        else {
            res.status(401).json({
                success: false,
                message: 'Некорректное имя пользователя или пароль'
            });
        }
    }
});

apiRoutes.get('/api/authenticate', function (req, res) {
    res.status(200).json({success: true, message: 'Ok'});
});
apiRoutes.post('/api/authenticate', function (req, res) {
});

apiRoutes.get('/api/logout', function (req, res) {
    req.session = null;
    res.status(200).json({success: true, message: "Выполнен выход из системы"});
});

//Получение данных диаграмы, checkAuth
apiRoutes.post('/api/get_diagram', function (req, res) {
    var request = {};

    request.timestamp = reportDate;

    if (req.body.zone) {
        request.N_KART = req.body.zone.toString();
    }

    async.parallel(
        [
            function (callback) {
                dbCon.collection('sap_data').find(request, {LGORT: 1, MATNR_CPH_PPM: 1, MENGE: 1}).toArray(callback);
            }
        ],
        function (err, results) {
            if (err) throw err;
            var places = [];
            var raws = [];
            var tmp_data_r = {};
            var tmp_data_p = {};
            for (var i in results[0]) {
                var item = results[0][i];
                if (places.indexOf(item.LGORT) == -1) places.push(item.LGORT);
                if (raws.indexOf(item.MATNR_CPH_PPM) == -1) raws.push(item.MATNR_CPH_PPM);

                if (!tmp_data_r[item.MATNR_CPH_PPM]) tmp_data_r[item.MATNR_CPH_PPM] = {};
                if (!tmp_data_r[item.MATNR_CPH_PPM][item.LGORT]) tmp_data_r[item.MATNR_CPH_PPM][item.LGORT] = 0;
                tmp_data_r[item.MATNR_CPH_PPM][item.LGORT] += parseFloat(item.MENGE);

                if (!tmp_data_p[item.LGORT]) tmp_data_p[item.LGORT] = {};
                if (!tmp_data_p[item.LGORT][item.MATNR_CPH_PPM]) tmp_data_p[item.LGORT][item.MATNR_CPH_PPM] = 0;
                tmp_data_p[item.LGORT][item.MATNR_CPH_PPM] += parseFloat(item.MENGE);
            }

            var data_r = [];
            var data_p = [];
            for (i in tmp_data_r) {
                var arr_tmp = Array(places.length).join('0').split('');
                for (var p in places) {
                    arr_tmp[p] = tmp_data_r[i][places[p]] || 0;
                }
                data_r.push({name: i, data: arr_tmp});
            }
            for (i in tmp_data_p) {
                var arr_tmp = Array(raws.length).join('0').split('');
                for (var r in raws) {
                    arr_tmp[r] = tmp_data_p[i][raws[r]] || 0;
                }
                data_p.push({name: i, data: arr_tmp});
            }
            res.status(200).send({
                success: true,
                places: places,
                raws: raws,
                zone_name: results[0].name,
                data: data_r,
                data_raws: data_p
            });
        }
    );
});

//Получение данных для визуального представления складов
apiRoutes.get('/api/get_storages', function (req, res) {
    async.parallel(
        [
            function (callback) {
                dbCon.collection('sap_data').find({"timestamp": reportDate}).toArray(callback);
            }
        ],
        function (err, results) {
            if (err) throw err;
            res.status(200).send({
                success: true,
                data: results[0]
            });
        }
    );
});

//Получение данных сводной таблицы, checkAuth
apiRoutes.post('/api/get_table', function (req, res) {

    var N_KART = req.body.zone;
    var LGORT = req.body.place;
    var MATNR_CPH_PPM = req.body.raw;

    async.parallel(
        [
            function (callback) {
                var request = {};
                if (N_KART) request.N_KART = N_KART.toString();
                if (LGORT) request.LGORT = LGORT.toString();
                //TODO: Заменить на код сырья
                if (MATNR_CPH_PPM) request.MATNR_CPH_PPM = MATNR_CPH_PPM.toString();

                request.timestamp = reportDate;
                dbCon.collection('sap_data').find(request, {_id: 0}).toArray(callback);
            },
            function (callback) {
                var request = {};
                if (N_KART) request.N_KART = N_KART.toString();
                if (LGORT) request.LGORT = LGORT.toString();
                //TODO: Заменить на код сырья
                if (MATNR_CPH_PPM) request.MATNR_CPH_PPM = MATNR_CPH_PPM.toString();
//                request.timestamp = {$exists: true};
                dbCon.collection('sap_data').aggregate([
                    {$match: request},
                    {
                        $group: {
                            _id: "$timestamp",
                            total: {$sum: "$MENGE"}
                        }
                    }]).sort({_id: 1}).toArray(callback);
            },
            function (callback) {
                dbCon.collection('storages').findOne({storage_id: parseInt(N_KART)}, {name: 1}, callback);
            }
        ],
        function (err, results) {
            if (err) throw err;
            for (var i in results[0]) {
                results[0][i].PLOSH = results[2].name;
                results[0][i].MENGE = results[0][i].MENGE.toFixed(3);
            }

            var timeline = [];
            for (var j in results[1]) {
                timeline.push([
                    results[1][j]._id,
                    parseFloat(results[1][j].total.toFixed(3))
                ]);
            }

            res.status(200).send({
                timeline: timeline,
                data: results[0],
                success: true
            });
        }
    );
});

//Получение времени выгрузок
apiRoutes.post('/api/get_times', function (req, res) {
    async.parallel(
        [
            function (callback) {
                dbCon.collection('dates_list').find().sort({timestamp: -1}).toArray(callback);
            }
        ],
        function (err, results) {
            if (err) throw err;

            res.status(200).send({
                success: true,
                dates: results[0],
                lastDate: reportDate
            });
        }
    );
});
//Получение информации по карте
apiRoutes.get('/api/map_legend', function (req, res) {
    async.parallel(
        [
            function (callback) {
                dbCon.collection('areas').find().toArray(callback);
            },
            function (callback) {
                dbCon.collection('storages').find().toArray(callback);
            }
        ],
        function (err, results) {
            if (err) throw err;
            var areas = {};
            var storages = {};

            for (var i in results[0]) {
                areas[results[0][i].area_id] = results[0][i];
            }
            for (var j in results[1]) {
                storages[results[1][j].storage_id] = results[1][j];
            }

            res.status(200).send({
                success: true,
                areas: areas,
                storages: storages
            });
        }
    );
});

//Поиск
apiRoutes.post('/api/search', function (req, res) {
    var act = req.body.search_act;
    var timestamp = req.body.timestamp || reportDate;

    async.waterfall(
        [
            async.apply(function (callback) {
                dbCon.collection('sap_data').find({
                    PR_NUMBER_ACT: {$regex: '.*' + act + '.*'},
                    timestamp: parseInt(timestamp)
                }).toArray(callback);
            })
        ],
        function (err, results) {
            if (err) throw err;
            res.status(200).send({
                success: true,
                results: results,
                act: req.body.search_act
            });
        }
    );
});

app.use('/', apiRoutes);

