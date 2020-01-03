const express = require("express");
const app = express();
const fs = require("fs");
const http = require("http").Server(app);
const io = require("socket.io")(http);
const bodyParser = require("body-parser");
const port = process.env.PORT || 3000;

let clients = [];
let names = [];

app.use(express.static(__dirname + "/static"));

app.use(bodyParser.json());

app.post("/start", function(req, res) {
  let spy = clients[Math.floor(clients.length * Math.random())];
  let notSpy = clients.slice();
  notSpy.splice(notSpy.indexOf(spy), 1);
  spy.join("spyroom");
  io.to("spyroom").emit("spymessage", "You are the spy");

  let location = req.body.location;
  io.emit("start", location);
  res.json("Started game with location set: " + location);

  let contents = fs.readFileSync(
    __dirname + "/static/locations/" + location.toLowerCase() + ".txt",
    "utf8"
  );
  let locationList = contents.split("\n");
  let chosenLocation =
    locationList[Math.floor(locationList.length * Math.random())];
  console.log("The secret location is: " + chosenLocation);
  notSpy.forEach(nonSpy => {
    nonSpy.join("civilian-room");
  });
  io.to("civilian-room").emit("secret-location", chosenLocation);
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
