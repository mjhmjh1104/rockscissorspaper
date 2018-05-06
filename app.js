var express = require('express');
var app = express();
var mongoose = require('mongoose');

mongoose.connect(process.env.RSP_DB);
var db = mongoose.connection;
db.once('open', function() {
  console.log('DATABASE CONNECTED');
});
db.on('error', function() {
  console.log('DATABASE ERROR\n', err);
});

var dataSchema = mongoose.Schema({
  Name: String,
  Property: [{
    Num: Number,
    Main: String,
    Challenger: String,
    Waiting: Number,
    Challenge: [Number],
    StartMain: Number,
    StartChallenger: Number
  }],
  RoomCount: Number
});
var Data = mongoose.model('data', dataSchema);
Data.findOne({Name: 'main'}, function(err, data) {
  if (err) return console.log('DATA ERROR\n', err);
  if (!data) {
    Data.create({Name: 'main', RoomCount: 0}, function(err, data) {
      if (err) return console.log('DATA ERROR\n', err);
      console.log('DATA INITAILIZED\n', data);
    });
  }
});

app.set('view engine', 'ejs');

app.get('/', function (req, res) {
  Data.findOne({Name: 'main'}, function(err, data) {
    if (err) return console.log('DATA ERROR\n', err);
    for (var i = 0; i < data.Property.length; i++)
      if (data.Property[i].Waiting) break;
    var number = {num: 0};
    if (i == data.Property.length) {
      number.num = 0;
      res.render('Show', number);
    }
    else {
      number.num = 1;
      res.render('Show', number);
    }
  });
});

app.get('/create', function(req, res) {
  Data.findOne({Name: 'main'}, function(err, data) {
    if (err) return console.log('DATA ERROR\n', err);
    var length = data.Property.length;
    data.Property.push({Num: data.RoomCount++, Main: req.query.id, Waiting: 1, StartMain: 0, StartChallenger: 0});
    data.save(function(err){
      if (err) return console.log('DATA ERROR\n', err);
    });
    var number = {num: data.Property[length].Num};
    res.render('Show', number);
  });
});

app.get('/main', function(req, res) {
  Data.findOne({Name: 'main'}, function(err, data) {
    if (err) return console.log('DATA ERROR\n', err);
    for (var i = 0; i < data.Property.length; i++)
      if (data.Property[i].Waiting) {
        var number = {num: data.Property[i].Num};
        res.render('Show', number);
        break;
      }
  });
});

app.get('/join', function(req, res) {
  Data.findOne({Name: 'main'}, function(err, data) {
    if (err) return console.log('DATA ERROR\n', err);
    for (var i = 0; i < data.Property.length; i++)
      if (data.Property[i].Num == req.query.room) break;
    data.Property[i].Challenger = req.query.id;
    data.Property[i].Waiting = 0;
    data.save(function(err) {
      if (err) return console.log('DATA ERROR\n', err);
    });
    var number = {num: data.Property[i].Main};
    res.render('Show', number);
  });
});

app.get('/waiting', function(req, res) {
  Data.findOne({Name: 'main'}, function(err, data) {
    if (err) return console.log('DATA ERROR\n', err);
    for (var i = 0; i < data.Property.length; i++)
      if (data.Property[i].Num == req.query.room) break;
    var number = {num: data.Property[i].Waiting};
    res.render('Show', number);
  });
});

app.get('/challenger', function(req, res) {
  Data.findOne({Name: 'main'}, function(err, data) {
    if (err) return console.log('DATA ERROR\n', err);
    for (var i = 0; i < data.Property.length; i++)
      if (data.Property[i].Num == req.query.room) break;
    if (!data.Property[i].Waiting) {
      var number = {num: data.Property[i].Challenger};
      res.render('Show', number);
    }
  });
});

app.get('/init', function(req, res) {
  Data.findOne({Name: 'main'}, function(err, data) {
    if (err) return console.log('DATA ERROR\n', err);
  }).remove().exec();
  Data.create({Name: 'main', RoomCount: 0}, function(err, data) {
    if (err) return console.log('DATA ERROR\n', err);
    console.log('DATA INITAILIZED\n', data);
  });
  var string = {num: "done"};
  res.render('Show', string);
});

app.get('/start', function(req, res) {
  Data.findOne({Name: 'main'}, function(err, data) {
    if (err) return console.log('DATA ERROR\n', err);
    for (var i = 0; k < data.Property.length; i++)
      if (data.Property[i].Num == req.query.room) break;
    var number = {num: 0};
    if (req.query.main) {
      data.Property[i].StartMain = 1;
      number.num = data.Property[i].StartChallenger;
      res.render('Show', number);
    } else {
      data.Property[i].StartChallenger = 1;
      number.num =  data.Property[i].StartMain;
      res.render('Show', number);
    }
  });
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('SERVER STARTED');
});
