const socket = io();

let landingPage = document.querySelector(".landing-container");
let homePage = document.querySelector(".home-container");
homePage.style.display = "none";
let gamePage = document.querySelector(".game-container");
gamePage.style.display = "none";

async function populateLocations(locationSet) {
  const locationContainer = document.querySelector(".game-location-container");
  let res = await fetch("/locations/" + locationSet.toLowerCase() + ".txt");
  let locationList = (await res.text()).split("\n");

  for (let location of locationList) {
    let element = document.createElement("div");
    element.classList.add("game-location");
    element.classList.add("location-unselected");
    element.innerHTML = location;
    element.onclick = () => {
      if (element.classList.contains("location-unselected")) {
        element.classList.remove("location-unselected");
        element.classList.add("location-selected");
      } else {
        element.classList.remove("location-selected");
        element.classList.add("location-unselected");
      }
    };
    locationContainer.appendChild(element);
  }
}

document.querySelector(".landing-form").onsubmit = event => {
  event.preventDefault();
  let nameInput = document.querySelector(".landing-input");
  socket.emit("nickname", nameInput.value);
  nameInput.value = "";
  landingPage.style.display = "none";
  homePage.style.display = "";
};

document.querySelector(".home-button").onclick = async () => {
  let location = { location: document.querySelector(".home-select").value };
  let res = await fetch("/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(location)
  });
  console.log(await res.json());
};

document.querySelector(".game-button").onclick = () => {
  window.location.href = "/";
};

socket.on("joined", function(names) {
  console.log(names);
  document.querySelector(".home-players").innerHTML = names;
});

socket.on("start", function(location) {
  homePage.style.display = "none";
  gamePage.style.display = "";
  populateLocations(location);
});

socket.on("spymessage", function(message) {
  console.log(message);
  document.querySelector(".game-spy-or-location").innerHTML = "You are the spy";
});

socket.on("secret-location", function(location) {
  console.log(location);
  document.querySelector(".game-spy-or-location").innerHTML =
    "The secret location is: " + location;
});
