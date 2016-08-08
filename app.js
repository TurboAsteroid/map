//зависимости
var ActiveDirectory = require('activedirectory');
var fs = require('fs');
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var config = require('./config');
var request = require('request');
var async = require('async');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var app = express();

app.set('portHttp', config.portHttp);
app.set('adServer', config.adServer);
app.set('adBaseDN', config.adBaseDN);
app.set('adUser', config.adUser);
app.set('adPassword', config.adPassword);

app.use(cookieParser());

app.use(session({
    secret: 'cookie_secret',
    resave: false,
    saveUninitialized: false
}));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
request = request.defaults({jar: true});

// Настройка модуля ActiveDirectory
var groupName = 'GS11002';
var ad = new ActiveDirectory({
    url: app.get('adServer'),
    baseDN: app.get('adBaseDN'),
    username: app.get('adUser'),
    password: app.get('adPassword')
});

app.use(express.static('public')); //папка со статическими файлами

//аутентификация пользователя
function auth(userAndPassword, callback) {
    var username = userAndPassword.username;
    var password = userAndPassword.password;
    async.waterfall([
        function (callback) {
            ad.authenticate(username, password, function (err, isAuthenticated) {
                if (err) {
                    callback(err, {success: false, message: 'Некорректное имя пользователя или пароль'});
                }
                if (isAuthenticated) {
                    callback(err, {success: true, message: 'Аутентификация прошла успешно'});
                }
            })
        }
    ], function (err, result) {
        callback(err, result, username);
    });
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

app.all('*', function(req, res, next){
    if(!req.session.username && !req.session.password && !req.body.username && !req.body.password) {
        res.status(401).json({success: false, message: 'Некорректное имя пользователя или пароль'});
    }
    else if(req.body.username && req.body.password) {
        authenticate(req, res);
        next();
        //res.status(401).json({success: false, message: 'Некорректное имя пользователя или пароль'});
    }
    else {
        async.waterfall( //последовательно проверяем доступ пользователю
            [
                async.apply(auth, { username: req.session.username, password: req.session.password }),//правильный ли пароль
                checkGroup //входит ли в группу
            ], function (err, result) { //отправляем результат
                if(err)
                    res.status(400).send(result);
                else {
                    next();
                }
            }
        );
    }
});

var apiRoutes = express.Router(); //объявление роутера

var checkAuth = function (req, res, next) {
    if(!req.session.username || !req.session.password) {
        res.status(401).json({success: false, message: 'Некорректное имя пользователя или пароль'});
    }
    else {
        async.waterfall( //последовательно проверяем доступ пользователю
            [
                async.apply(auth, { username: req.session.username, password: req.session.password }),//правильный ли пароль
                checkGroup //входит ли в группу
            ], function (err, result) { //отправляем результат
                if(err)
                    res.status(400).send(result);
                else {
                    next();//res.status(200).json({success: true});
                }
            }
        );
    }
};

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

apiRoutes.post('/api/authenticate', function (req, res) {});

apiRoutes.get('/api/logout', function (req, res) {
    req.session = null;
    res.status(200).json({success: true, message: "Выполнен выход из системы"});
});

//Получение данных диаграмы, checkAuth
apiRoutes.post('/api/get_diagram', function (req, res, next) {
    var fs = require('fs');
    fs.readFile('./public/ppm.json', 'utf8', function (err, contents) {
        if (err) throw err;
        data = JSON.parse(contents);
        var places = [];
        var raws = [];
        var tmp_data = {};

        for (place in data) {
            var pl = data[place];
            for (raw in pl.raws) {
                var rw = pl.raws[raw];
                places.push(pl.place);
                raws.push(rw.raw);
                if (!tmp_data[rw.raw]) {
                    tmp_data[rw.raw] = {};
                }
                if (!tmp_data[rw.raw][pl.place]) {
                    tmp_data[rw.raw][pl.place] = 0;
                }
                tmp_data[rw.raw][pl.place] += rw.balance_at_start;
            }
        }
        places = places.filter(function (elem, pos) {
            return places.indexOf(elem) == pos;
        });
        raws = raws.filter(function (elem, pos) {
            return raws.indexOf(elem) == pos;
        });
        var tmp_data_raws = [];
        for (place in data) {
            var arr_tmp = Array(raws.length).join('0').split('');
            for (r in data[place].raws) {
                arr_tmp[raws.indexOf(data[place].raws[r].raw)] = data[place].raws[r].balance_at_start;
            }
            tmp_data_raws.push({name: data[place].place, data: arr_tmp})
        }

        var new_data = [];
        for (i in tmp_data) {
            tmp = [];
            for (k in places) {
                tmp.push(tmp_data[i][places[k]] || 0);
            }
            new_data.push({name: i, data: tmp});
        }

        res.status(200).send({
            success: true,
            zone_name: req.body.zone,
            zones: places,
            data: new_data,
            data_raws: tmp_data_raws,
            raws: raws
        });
    });
});

//Получение данных сводной таблицы, checkAuth
apiRoutes.post('/api/get_table', function (req, res) {
    var fs = require('fs');
    fs.readFile('./public/ppm.json', 'utf8', function (err, contents) {
        if (err) throw err;
        data = JSON.parse(contents);
        var new_data = [];
        for (d in data) {
            new_data = new_data.concat(data[d].raws);
        }
        res.status(200).send({
            success: true,
            place_name: req.body.place || req.body.raw,
            data: new_data
        });
    });
});

//Получение данных диаграмы, checkAuth
apiRoutes.post('/api/get_diagram2', function(req, res) {
    var fs = require('fs');

    fs.readFile('./public/ppm.json', 'utf8', function(err, contents) {
        if (err) throw err;
        data = JSON.parse(contents);

        var places = [];
        var tmp_data = {};
        for (place in data) {
            var pl = data[place];
            for (raw in pl.raws) {
                var rw = pl.raws[raw];
                places.push(pl.place);
                if (!tmp_data[rw.raw]) {tmp_data[rw.raw] = {};}
                if (!tmp_data[rw.raw][pl.place]) {tmp_data[rw.raw][pl.place] = 0;}
                tmp_data[rw.raw][pl.place] += rw.balance_at_start;
            }
        }
        places = places.filter(function(elem, pos) {
            return places.indexOf(elem) == pos;
        });
        var new_data = [];

        for(i in tmp_data) {
            tmp = [];
            for(k in places) {
                tmp.push(tmp_data[i][places[k]] || 0);
            }
            new_data.push({name: i, data: tmp});
        }

        var new_data_sum = [];
        for(var iii = 0; iii < new_data.length; iii++) {
            new_data_sum[iii] = 0;
        }
        for(var i = 0; i < new_data.length; i++) {
            for(var j = 0; j < new_data[i].data.length; j++) {
                new_data_sum[j] = new_data_sum[j] + new_data[i].data[j];
            }
        }

        for(var i = 0; i < new_data.length;i++) {
            for(var j = 0; j < new_data[i].data.length; j++) {
                new_data[i].data[j] = new_data[i].data[j]/new_data_sum[j]*100;
            }
        }

        res.status(200).send({
            success: true,
            zone_name: req.body.zone,
            zones: places,
            data: new_data
        });
    });
});

app.use('/', apiRoutes);

app.listen(app.get('portHttp'));