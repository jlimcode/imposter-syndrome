const socket = io();

let landingPage = document.querySelector(".landing-container");
let homePage = document.querySelector(".home-container");
homePage.hidden = true;
let gamePage = document.querySelector(".game-container");
gamePage.hidden = true;

async function populateLocations(locationSet) {
    const locationContainer = document.querySelector(".game-location-container")
    let res = await fetch("/locations/" + locationSet.toLowerCase() + ".txt")
    let locationList = (await res.text()).split("\n");
    
    for(let location of locationList) {
        let element = document.createElement("div")
        element.classList.add("game-location")
        element.classList.add("location-unselected")
        element.innerHTML = location
        element.onclick = () => {
            if(element.classList.contains("location-unselected")) {
                element.classList.remove("location-unselected")
                element.classList.add("location-selected")
            }
        }
        locationContainer.appendChild(element)
    }
}

document.querySelector(".landing-form").onsubmit = event => {
  event.preventDefault();
  let nameInput = document.querySelector(".landing-input");
  socket.emit("nickname", nameInput.value);
  nameInput.value = "";
  landingPage.hidden = true;
  homePage.hidden = false;
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
    window.location.href = "/"
}

socket.on("joined", function(names) {
  console.log(names);
  document.querySelector(".home-players").innerHTML = names;
});

socket.on("start", function(location) {
  homePage.hidden = true;
  gamePage.hidden = false;
  populateLocations(location);
});

socket.on("spymessage", function(message) {
    console.log(message);
    document.querySelector(".game-spy").innerHTML = "You are the spy"
})
