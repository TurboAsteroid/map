//зависимости
var ActiveDirectory = require('activedirectory');
var fs = require('fs');
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var config = require('./config');
var async = require('async');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var MongoClient = require('mongodb').MongoClient;
// require('./sap-mongo');

var app = express();

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

app.use(cookieParser());

app.use(session({
    secret: app.get('cookieSecret'),
    resave: false,
    saveUninitialized: false
}));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Настройка модуля ActiveDirectory
var groupName = 'PpmMap';
var ad = new ActiveDirectory({
    url: app.get('adServer'),
    baseDN: app.get('adBaseDN'),
    username: app.get('adUser'),
    password: app.get('adPassword')
});

// Connection URL
var url = 'mongodb://'+app.get('dbUser')+':'+app.get('dbPassword')+'@'+app.get('dbHost')+':27017/'+app.get('dbDatabase');
var dbCon;
MongoClient.connect(url, function(err, db) {
    dbCon = db;
    app.listen(app.get('portHttp'));
});

app.use(express.static('public')); //папка со статическими файлами

var reportDate;

app.all('*', function(req, res, next){
    async.parallel(
        [
            function(callback){
                dbCon.collection('dates_list').find({},{timestamp:1}).sort({timestamp: -1}).limit(1).toArray(callback);
            }
        ],
        function(err, results){
            reportDate = req.body.date ? parseInt(req.body.date) : results[0][0].timestamp;
            next();
        }
    )
});

//аутентификация пользователя
function auth(userAndPassword, callback) {
    var username = userAndPassword.username;
    var password = userAndPassword.password;
    ad.authenticate(username, password, function (err, isAuthenticated) {
        var json;
        if (!err) {
            json = {success: true, message: 'Аутентификация прошла успешно'};
        }
        else {
            json = {success: false, message: 'Некорректное имя пользователя или пароль'};
        }
        callback(err, json, username);
    })
}

//проверка принадлежности к группе
function checkGroup(authenticated, username, callback) {
    if (authenticated.success) {
        //проверяем на членство в группах
        ad.isUserMemberOf(username, groupName, function (err, isMember) {
            if (err) {
                callback(err, {success: false, message: 'Некорректное имя пользователя или пароль'});
            }
            if (isMember) {
                callback(err, {success: true, message: 'Пользователь принадлежит группе'});
            }
        });
    }
    else {
        callback(true, { success: false, message: 'Неизвестная ошибка'});
    }
}

var apiRoutes = express.Router(); //объявление роутера

var authenticate = function (req, res) {
    async.waterfall( //последовательно проверяем доступ пользователю
        [
            async.apply(auth, { username: req.body.username, password: req.body.password }),//правильный ли пароль
            checkGroup //входит ли в группу
        ], function (err, result) { //отправляем результат
            if(err)
                res.status(400).send(result);
            else { //делаем куки
                req.session.username = req.body.username;
                req.session.password = req.body.password;
                res.status(200).json({success: true});
            }
        }
    );
};

// app.all('*', function(req, res, next){
//     if(!req.session.username && !req.session.password && !req.body.username && !req.body.password) {
//         res.status(401).json({success: false, message: 'Некорректное имя пользователя или пароль'});
//     }
//     else if(req.body.username && req.body.password) {
//         if(req.body.username.indexOf('@elem.ru') == -1 || req.body.username.indexOf('@') == -1)
//             req.body.username += "@elem.ru";
//         authenticate(req, res);
//         next();
//     }
//     else {
//         async.waterfall( //последовательно проверяем доступ пользователю
//             [
//                 async.apply(auth, { username: req.session.username, password: req.session.password }),//правильный ли пароль
//                 checkGroup //входит ли в группу
//             ], function (err, result) { //отправляем результат
//                 if(err)
//                     res.status(400).send(result);
//                 else {
//                     next();
//                 }
//             }
//         );
//     }
// });

apiRoutes.get('/api/is', function (req, res) {
    res.status(200).json({success: true, message: 'Ok'});
});
apiRoutes.post('/api/authenticate', function (req, res) {});

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
            function(callback){
                dbCon.collection('sap_data').find(request, {LGORT: 1,MATNR_CPH_PPM: 1,MENGE: 1}).toArray(callback);
            }
        ],
        function(err, results){
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
                data_r.push({name: i,data: arr_tmp});
            }
            for (i in tmp_data_p) {
                var arr_tmp = Array(raws.length).join('0').split('');
                for (var r in raws) {
                    arr_tmp[r] = tmp_data_p[i][raws[r]] || 0;
                }
                data_p.push({name: i,data: arr_tmp});
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
            function(callback){
                dbCon.collection('sap_data').find({"timestamp": reportDate}).toArray(callback);
            }
        ],
        function(err, results){
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
            function(callback){
                var request = {};
                if (N_KART) request.N_KART = N_KART.toString();
                if (LGORT) request.LGORT = LGORT.toString();
                //TODO: Заменить на код сырья
                if (MATNR_CPH_PPM) request.MATNR_CPH_PPM = MATNR_CPH_PPM.toString();

                request.timestamp = reportDate;
                dbCon.collection('sap_data').find(request, {_id: 0}).toArray(callback);
            },
            function(callback){
                var request = {};
                if (N_KART) request.N_KART = N_KART.toString();
                if (LGORT) request.LGORT = LGORT.toString();
                //TODO: Заменить на код сырья
                if (MATNR_CPH_PPM) request.MATNR_CPH_PPM = MATNR_CPH_PPM.toString();
                request.timestamp = {$exists: true};
                dbCon.collection('sap_data').aggregate([
                    {$match: request},
                    {$group: {
                        _id: "$timestamp",
                        total: { $sum: "$MENGE" }
                    }
                }]).sort({_id: 1}).toArray(callback);
            },
            function(callback){
                dbCon.collection('storages').findOne({storage_id: parseInt(N_KART)},{name: 1},callback);
            }
        ],
        function(err, results){
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
            function(callback) {
                dbCon.collection('dates_list').find().sort({timestamp: -1}).toArray(callback);
            }
        ],
        function(err, results){
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
            function(callback){
                dbCon.collection('areas').find().toArray(callback);
            },
            function(callback){
                dbCon.collection('storages').find().toArray(callback);
            }
        ],
        function(err, results){
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
            async.apply(function(callback){
                dbCon.collection('sap_data').find({PR_NUMBER_ACT: {$regex: '.*'+act+'.*'}, timestamp: parseInt(timestamp) }).toArray(callback);
            })
        ],
        function(err, results){
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

