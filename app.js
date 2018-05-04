var express = require('express');
var app = express();

app.set('view engine', 'ejs');

app.get('/', function (req, res) {
  res.render('emptyRoomExists');
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('SERVER STARTED');
});
