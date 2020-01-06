const express = require("express");
const app = express();
const fs = require("fs");
const http = require("http").Server(app);
const io = require("socket.io")(http);
const bodyParser = require("body-parser");
const port = process.env.PORT || 3000;

let clients = [];

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
  clients.push(socket);
  console.log(clients.length);

  socket.on("disconnect", function() {
    clients.splice(clients.indexOf(socket), 1);
    console.log(clients.length);
    console.log(this.name + " has left")
    let names = clients.map(client => client.name);
    io.emit("joined", names);
  });

  socket.on("nickname", function(name) {
    this.name = name;
    console.log(this.name + " has joined");
    let names = clients.map(client => client.name);
    io.emit("joined", names);
  });
});

http.listen(port, function() {
  console.log("listening on " + port);
});
