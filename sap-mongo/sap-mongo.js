var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var schedule = require('node-schedule');
var http = require('http');
var bodyParser = require('body-parser');
var request = require('request');
var async = require('async');
var config = require('../config');
var app = express();
console.log(new Date());
app.set('dbHost', config.dbHost);
app.set('dbDatabase', config.dbDatabase);
app.set('dbUser', config.dbUser);
app.set('dbPassword', config.dbPassword);
app.set('sap', config.sap);

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

request = request.defaults({jar: true});

var url = 'mongodb://'+app.get('dbUser')+':'+app.get('dbPassword')+'@'+app.get('dbHost')+':27017/'+app.get('dbDatabase');
var dbCon;

var rule = new schedule.RecurrenceRule();

rule.minute = new schedule.Range(0, 59, 1);

schedule.scheduleJob('0-59 * * * * *', function(){
    console.log('This runs at the 30th mintue of every hour.');
});

schedule.scheduleJob(rule, function(){
    MongoClient.connect(url, function(err, db) {
        dbCon = db;
        var url = app.get('sap');
        var url_now;
        for (var i = 1; i < 2; i++) {
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
                    dbCon.TEST_Nightwelf.insert( body[0] );
                }
                else {
                    console.log('res stat: ' + response.statusCode + error);
                }
                end();
            });
        }
    });
});

// MongoClient.connect(url, function(err, db) {
//     dbCon = db;
//     AsyncPolling(function (end) {
//         var url = app.get('sap');
//         for (var i = 1; i < 2; i++) {
//             if (i < 10)
//                 url_now = url + '&kart=0' + i;
//             else
//                 url_now = url + '&kart=' + i;
//
//             request.get({ //формирование запроса и получение данных с сервера сапа
//                 url: url_now,
//                 headers: {
//                     'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'
//                 }
//             }, function (error, response, body) {
//                 if (!error && response.statusCode == 200) {
//
//                 }
//                 else {
//                     console.log('res stat: ' + response.statusCode + error);
//                 }
//                 end();
//             });
//         }
//
//         // Then notify the polling when your job is done:
//         //end();
//         // This will schedule the next call.
//     }, 3000).run();
// });