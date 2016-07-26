var koa = require('koa');
var app = koa();

// x-response-time

app.use(function *(next){
  var start = new Date;
    console.log(next, this.method, this.url, ms);
    yield next;
    var ms = new Date - start;
    this.set('X-Response-Time', ms + '1ms');
    console.log(3, this.method, this.url, ms);
});

// logger

app.use(function *(next){
        var start = new Date;
        console.log(2, this.method, this.url, ms);
        yield next;
        var ms = new Date - start;
        console.log(4, this.method, this.url, ms);

});

// response

app.use(function *(){
  this.body = 'Hello World';
});

app.listen(5000);