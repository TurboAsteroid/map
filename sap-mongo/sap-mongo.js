var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var schedule = require('node-schedule');
var request = require('request');
var fs = require('fs');
var config = require('../config');

var app = express();

app.set('dbHost', config.dbHost);
app.set('dbDatabase', config.dbDatabase);
app.set('dbUser', config.dbUser);
app.set('dbPassword', config.dbPassword);
app.set('sap', config.sap);

request = request.defaults({jar: true});

var url = 'mongodb://'+app.get('dbUser')+':'+app.get('dbPassword')+'@'+app.get('dbHost')+':27017/'+app.get('dbDatabase');
var dbCon;

schedule.scheduleJob('0 0 0 * * *', function(){
//schedule.scheduleJob('0-59 * * * * *', function(){
    if (test == 0 || test == 1 || test == 2)
    MongoClient.connect(url, function(err, db) {
        dbCon = db;
        var url = app.get('sap');
        var url_now;
        for (var i = 1; i < 33; i++) {
            if (i < 10)
                url_now = url + '&kart=0' + i;
            else
                url_now = url + '&kart=' + i;
            request.get({ //формирование запроса и получение данных с сервера сапа
                url: url_now,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'
                }
            }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var json = JSON.parse(body);
                    for(var j = 0; j < json.length; j++) {
                            json[j].MENGE = parseFloat(json[j].MENGE);
                        if(json[j].PR_ZDAT_PROB == '00000000')
                            json[j].PR_ZDAT_PROB = '';
                    }
                    dbCon.collection('sap_data').insert(json);
                }
                else {
                    var str = new Date() +
                             '\nerror: ' + error +
                             '\nresponse.statusCode: ' + response.statusCode +
                             '\nbody:\n' + body + '\n\n\n\n\n\n';
                    fs.appendFile('sap-mongo.log', str, function (err) {
                        if (err)
                            return console.log(err);
                    });
                }
            });
        }
    });
});