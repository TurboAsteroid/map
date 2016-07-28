/*
npm install --prefix ./public angular
npm install --prefix ./public angular-route
npm install --prefix ./public angular-material
npm install --prefix ./public d3
npm install --prefix ./public highcharts
npm install --prefix ./public jquery
*/

//зависимости
var ActiveDirectory = require('activedirectory');
var jwt             = require('jsonwebtoken');
//var multiparty      = require('connect-multiparty');
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
app.set('adServer', config.adServer);
app.set('adBaseDN', config.adBaseDN);
app.set('adUser', config.adUser);
app.set('adPassword', config.adPassword);

app.use(bodyParser.urlencoded({ extended: false }));
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
apiRoutes.get('/', function(req, res) {
    res.status(403).send('API входа и получения данных');
});

//аутентификация пользователя
function auth(userAndPassword, callback){
    var username = userAndPassword.username;
    var password = userAndPassword.password;
    async.waterfall([
        function(callback) {
            ad.authenticate(username, password, function (err, isAuthenticated) {
                if (err) {
                    callback(err,{success: false, message: 'Некорректное имя пользователя или пароль'});
                }
                if (isAuthenticated) {
                    callback(err,{success: true, message: 'Аутентификация прошла успешно'});
                }
            })
        }
    ], function (err, result) {
        callback(err, result, username, password );
    });
}

//проверка принадлежности к группе
function checkGroup(authenticated, username, password, callback){
    if(authenticated.success) {
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
                    callback(true, {success:false, GS11008: userGroup.GS11008, GS11002: userGroup.GS11002, GSGive: userGroup.GSGive,  message: 'Доступ запрещен'});
                else if (userGroup.GS11008 && userGroup.GS11002 && userGroup.GSGive)
                //при авторизации обнаружилось, что пользователь не принадлежит группе
                    callback(true, {success:false, GS11008: userGroup.GS11008, GS11002: userGroup.GS11002, GSGive: userGroup.GSGive,  message: 'Пользователь имеет двусмысленные права'});
                else
                //все хорошо, продолжаем
                    callback(err, userGroup, username, password);
            });
    }
    else {
        callback(true, { "GS11008": false, "GS11002": false, "GSGive": false, message: 'Неизвестная ошибка 1' } );
    }
}

//генерация токенов (кодирование имени пользователя и пароля)
function createTokens(userGroup, username, password, callback){
    var tokenUser = jwt.sign(username, app.get('superSecret')); //шифруем имя пользователя
    var tokenPassword = jwt.sign(password, app.get('superSecret')); //шифруем пароль
    //вычисляем интерфейс
    var give = false;
    var ckeckpoint = null;
    //выдача пропуска
    if(userGroup.GSGive) {
        give = true;
    }
    //кпп инженерный корпус
    if(userGroup.GS11008) {
        ckeckpoint = 11008;
    }
    //кпп 7
    if(userGroup.GS11002) {
        ckeckpoint = 11002;
    }
    callback(null,{success: true, tokenUser: tokenUser, tokenPassword: tokenPassword, ckeckpoint: ckeckpoint, give: give});
}

//декодирование токенов
function decodeTokens(data, callback){
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
            if(err)
                callback(err, {success: false, message: 'Доступ запрещен. Ошибка декодирования имени пользователя и пароля'});
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
apiRoutes.post('/authenticate', function(req, res) {

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

/*
//получаем листы
apiRoutes.get('/list', function(req, res) {
    //создадим алиасы (для удобства и передачи после водопада)
    var tu = req.headers['tokenuser'],
        tp = req.headers['tokenpassword'],
        c = req.headers['ckeckpoint'],
        g = req.headers['give'],
        l = req.headers['list'];
    try { //переданы ли какие-нибудь вообще данные
        tu.length;
        tp.length;
        c.length;
        l.length;
        if(g == null || g == undefined)
            throw g;
    }
    catch (err) { //если длина одного из алиасов кривая
        return res.status(403).send({success: false, message: 'Доступ запрещен. Ошибка передачи параметра', err: err});
    }
    async.waterfall([ //водопадом
        async.apply(decodeTokens, { tokenuser: tu, tokenpassword: tp}), //декодируем токены
        auth,//входит ли в группу
        checkGroup, //входит ли в группу
        createTokens //создаем токен
    ], function (err, result) {
        var url_sap = '';
        if(err)
            res.status(400).send(result); //отправляем ошибку
        try { //повторная проверка (избыточно, но все же) переданы ли какие-нибудь вообще данные
            tu.length;
            tp.length;
            c.length;
            l.length;
            if(g == null || g == undefined)
                throw g;
        }
        catch (err2) {
            return res.status(403).send({success: false, message: 'Доступ запрещен. Ошибка передачи параметра', err: err2});
        } //ниже проверки на все
        if (!err && c.toString() === (result.ckeckpoint).toString() && g.toString() === (result.give).toString() &&
            (l).toString() === '57') { //если статус 57 (согласованы) - выдавать всем двум группам
            url_sap = app.get('url') + //формирование ссылки до сапа
                '/list?status=' + l +
                '&ckeckpoint=' + c +
                '&sap-user=' + app.get('sapUser') +
                '&sap-password=' + app.get('sapPassword');
            request.get({ //формирование запроса и получение данных с сервера сапа
                url: url_sap,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'
                }
            }, function (error, response, body) {
                try {//обработка полученных данных
                    if (response.body == 'Login Error' || response.body == undefined) //если пришла ошибка
                        res.status(403).send({success: false, message: 'Доступ запрещен (SAP)'}); //отправляем ошибку
                    else if (!error && response.statusCode == 200) //если проишла не ошибка
                        res.status(200).send({ //отправляем список пропусков
                            success: true,
                            message: 'Список пропусков предоставлен. Статус пропусков ' + l,
                            data: body
                        });
                } catch (error) { //отправляем ошибку сервера
                    res.status(500).send({success: false, message: 'Доступ запрещен. Ошибка сервера'});
                }
            });
        }
        else if (!err && c.toString() === (result.ckeckpoint).toString() && //только для охраны
            (g.toString() === (false).toString() && g.toString() === (result.give).toString()) &&
            ((l).toString() === '51' || (l).toString() === '53' )) { //если статус 53 и 51 (на территории и на согласовании) - выдавать всем двум группам
            url_sap = app.get('url') + //формирование ссылки до сапа
                '/list?status=' + l +
                '&ckeckpoint=' + c +
                '&sap-user=' + app.get('sapUser') +
                '&sap-password=' + app.get('sapPassword');
            request.get({ //формирование запроса и получение данных с сервера сапа
                url: url_sap,
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36' }
            }, function (error, response, body) {
                try { //обработка полученных данных
                    if (response.body == 'Login Error' || response.body == undefined) //если пришла ошибка
                        res.status(403).send({success: false, message: 'Доступ запрещен (SAP)'}); //отправляем ошибку
                    else if (!error && response.statusCode == 200)
                        res.status(200).send({ //если проишла не ошибка
                            success: true,
                            message: 'Список пропусков предоставлен. Статус пропусков ' + l,
                            data: body
                        });
                } catch (error) { //отправляем ошибку сервера
                    res.status(500).send({success: false, message: 'Доступ запрещен. Ошибка сервера'});
                }
            });
        }
        else //отправляем ошибку
            res.status(400).send({success: false, message: 'Доступ запрещен'});
    });
});

*/

app.use('/api', apiRoutes);

app.listen(app.get('portHttp'));