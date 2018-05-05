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
    Challenge: [Number]
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
    if (i == data.Property.length) res.render('ShowNumber', 0);
    res.render('ShowNumber', 1);
  });
});

app.get('/create', function(req, res) {
  Data.findOne({Name: 'main'}, function(err, data) {
    if (err) return console.log('DATA ERROR\n', err);
    var length = data.Property.length;
    data.Property.push({Num: data.RoomCount++, Main: req.query.id, Waiting: 1});
    data.save(function(err){
      if (err) return console.log('DATA ERROR\n', err);
    });
    var number = {num: data.Property[length].Num};
    res.render('ShowNumber', number);
  });
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('SERVER STARTED');
});
