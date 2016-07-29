/*
 npm install --prefix ./public angular
 npm install --prefix ./public angular-route
 npm install --prefix ./public angular-material
 npm install --prefix ./public d3
 npm install --prefix ./public highcharts
 npm install --prefix ./public jquery
 npm install --prefix ./public angular-local-storage
 */

//зависимости
var ActiveDirectory = require('activedirectory');
var jwt = require('jsonwebtoken');
//var multiparty      = require('connect-multiparty');
var fs = require('fs');
var https = require('https');
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var config = require('./config');
var request = require('request');
var async = require('async');

var app = express();

app.set('portHttp', config.portHttp);
app.set('adServer', config.adServer);
app.set('adBaseDN', config.adBaseDN);
app.set('adUser', config.adUser);
app.set('adPassword', config.adPassword);

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
request = request.defaults({jar: true});

// Настройка модуля ActiveDirectory
var groupNames = ['GS11002'];
var ad = new ActiveDirectory({
    url: app.get('adServer'),
    baseDN: app.get('adBaseDN'),
    username: app.get('adUser'),
    password: app.get('adPassword')
});

app.use(express.static('public')); //папка со статическими файлами

var apiRoutes = express.Router(); //объявление роутера

//точка входа в роутер
apiRoutes.get('/', function (req, res) {
    res.status(403).send('API входа и получения данных');
});

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
        callback(err, result, username, password);
    });
}

//проверка принадлежности к группе
function checkGroup(authenticated, username, password, callback) {
    if (authenticated.success) {
        //проверяем на членство в группах
        async.parallel({
                GS11008: function (callback) {
                    ad.isUserMemberOf(username, groupNames[0], function (err, isMember) {
                        callback(err, isMember);
                    });
                },
                GS11002: function (callback) {
                    ad.isUserMemberOf(username, groupNames[1], function (err, isMember) {
                        callback(err, isMember);
                    });
                },
                GSGive: function (callback) {
                    ad.isUserMemberOf(username, groupNames[2], function (err, isMember) {
                        callback(err, isMember);
                    });
                }
            },
            function (err, userGroup) {
                if (!userGroup.GS11008 && !userGroup.GS11002 && !userGroup.GSGive)
                //при авторизации обнаружилось, что пользователь не принадлежит группе
                    callback(true, {
                        success: false,
                        GS11008: userGroup.GS11008,
                        GS11002: userGroup.GS11002,
                        GSGive: userGroup.GSGive,
                        message: 'Доступ запрещен'
                    });
                else if (userGroup.GS11008 && userGroup.GS11002 && userGroup.GSGive)
                //при авторизации обнаружилось, что пользователь не принадлежит группе
                    callback(true, {
                        success: false,
                        GS11008: userGroup.GS11008,
                        GS11002: userGroup.GS11002,
                        GSGive: userGroup.GSGive,
                        message: 'Пользователь имеет двусмысленные права'
                    });
                else
                //все хорошо, продолжаем
                    callback(err, userGroup, username, password);
            });
    }
    else {
        callback(true, {"GS11008": false, "GS11002": false, "GSGive": false, message: 'Неизвестная ошибка 1'});
    }
}

//генерация токенов (кодирование имени пользователя и пароля)
function createTokens(userGroup, username, password, callback) {
    var tokenUser = jwt.sign(username, app.get('superSecret')); //шифруем имя пользователя
    var tokenPassword = jwt.sign(password, app.get('superSecret')); //шифруем пароль
    //вычисляем интерфейс
    var give = false;
    var ckeckpoint = null;
    //выдача пропуска
    if (userGroup.GSGive) {
        give = true;
    }
    //кпп инженерный корпус
    if (userGroup.GS11008) {
        ckeckpoint = 11008;
    }
    //кпп 7
    if (userGroup.GS11002) {
        ckeckpoint = 11002;
    }
    callback(null, {
        success: true,
        tokenUser: tokenUser,
        tokenPassword: tokenPassword,
        ckeckpoint: ckeckpoint,
        give: give
    });
}

//декодирование токенов
function decodeTokens(data, callback) {
    var tokenUser = data.tokenuser; //получаем токен имени пользователя
    var tokenPassword = data.tokenpassword; //получаем токен папроля
    async.parallel({ //дешифруем токен пользователя и пароля параллельно
            user: function (callback) {
                jwt.verify(tokenUser, app.get('superSecret'), function (err, decoded) {
                    callback(err, decoded);
                });
            },
            password: function (callback) {
                jwt.verify(tokenPassword, app.get('superSecret'), function (err, decoded) {
                    callback(err, decoded);
                });
            }
        },
        function (err, userAndPassword) {
            //выполняем действия и проверки после дешифрации и отправляем результат
            if (err)
                callback(err, {
                    success: false,
                    message: 'Доступ запрещен. Ошибка декодирования имени пользователя и пароля'
                });
            else
                callback(err, {
                    success: true,
                    message: 'Декодирование токенов завершено успешно',
                    username: userAndPassword.user,
                    password: userAndPassword.password
                });
        });
}

//проводим авторизацию
apiRoutes.post('/authenticate', function (req, res) {

    res.status(200).send({success: true, tokenUser: "TUUUUUUUUUUUUUUUU", tokenPassword: "Tpppppppppppppppp"});
    /*
     async.waterfall([ //последовательно проверяем (водопадом)
     async.apply(auth, { username: req.headers['username'], password: req.headers['password']}),//входит ли в группу
     checkGroup, //входит ли в группу
     createTokens //создаем токен
     ], function (err, result) { //отправляем результат
     if(err)
     res.status(400).send(result);
     else
     res.status(200).send(result);
     });*/
});

//Получение данных диаграмы
apiRoutes.post('/get_diagram', function (req, res) {
    var fs = require('fs');

    fs.readFile('./public/ppm.json', 'utf8', function (err, contents) {
        if (err) throw err;
        data = JSON.parse(contents);

        var places = [];
        var tmp_data = {};
        for (place in data) {
            var pl = data[place];
            for (raw in pl.raws) {
                var rw = pl.raws[raw];
                places.push(pl.place);
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
        })
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
            data: new_data
        });
    });
});

//Получение данных сводной таблицы
apiRoutes.post('/get_table', function (req, res) {
    var fs = require('fs');
    fs.readFile('./public/ppm.json', 'utf8', function (err, contents) {
        if (err) throw err;
        data = JSON.parse(contents);
        res.status(200).send({
            success: true,
            place_name: req.body.place,
            data: data
        });
    });
});

//Получение данных диаграмы
apiRoutes.post('/get_diagram2', function(req, res) {
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

app.use('/api', apiRoutes);

app.listen(app.get('portHttp'));