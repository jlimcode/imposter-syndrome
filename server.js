var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var bodyParser = require("body-parser");
var port = process.env.PORT || 3000;

var clients = [];
var names = [];

app.use(express.static(__dirname + "/static"));

app.use(bodyParser.json());

app.get("/sort", function(req, res) {});

app.post("/start", function(req, res) {
  console.log(req.body);
  let location = req.body.location;

  io.emit("start", location);
  res.json("Started game with location set: " + location);

  var spy = clients[Math.floor(clients.length * Math.random())];
  var notSpy = clients.slice();
  notSpy.splice(notSpy.indexOf(spy), 1);
  spy.join("spyroom");
  console.log(Object.keys(spy.rooms));
  io.to("spyroom").emit("spymessage", "You are a spy");
});

io.on("connection", function(socket) {
  socket.on("nickname", function(name) {
    console.log(name + " has joined");
    names.push(name);
    console.log(names);
    io.emit("joined", names);
  });
});

io.sockets.on("connect", function(client) {
  clients.push(client);
  console.log(clients.length);

  client.on("disconnect", function() {
    clients.splice(clients.indexOf(client), 1);
    console.log(clients.length);
  });
});

http.listen(port, function() {
  console.log("listening on " + port);
});
