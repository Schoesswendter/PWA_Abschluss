const butInstall = document.getElementById("butInstall");
const butSend = document.getElementById("butSend");

let defferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
  console.log("Installation event fired");
  e.preventDefault();

  defferredPrompt = e;
  return false;
});

butInstall.addEventListener("click", () => {
  if (defferredPrompt) {
    defferredPrompt.prompt();

    defferredPrompt.userChoice.then((res) => {
      if (res.outcome == "dismissed") {
        console.log("User canceled installation");
      } else {
        console.log("User installed app");
      }
    });
  }
});

butSend.addEventListener("click", () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.controller.postMessage({
      name: "Tarik",
      surname: "Huber",
    });
    console.log("Message send");
  }
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("message", (event) => {
    console.log("Recaived message from sw:", event.data);
  });
}

const listenForWaitingServiceWorker = (reg, callback) => {
  function awaitStateChange() {
    reg.installing.addEventListener("statechange", function () {
      if (this.state === "installed") callback(reg);
    });
  }
  if (!reg) return;
  if (reg.waiting) return callback(reg);
  if (reg.installing) awaitStateChange();
  reg.addEventListener("updatefound", awaitStateChange);
};

const showUpdateButton = (reg) => {
  if (reg) {
    let button = document.querySelector("#update");
    button.addEventListener("click", () => {
      reg.waiting.postMessage("skipWaiting");
    });
    button.style.display = "inline";
  }
};

if ("serviceWorker" in navigator) {
  console.log("we support SW");
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then((reg) => {
      listenForWaitingServiceWorker(reg, showUpdateButton);
    });
  });
}

let refreshing;
navigator.serviceWorker.addEventListener("controllerchange", () => {
  if (refreshing) return;
  refreshing = true;
  window.location.reload(true);
});

let thumbsUps = document.getElementsByClassName("thumbsup")
for (let item of thumbsUps) {
  item.addEventListener('click', function(){ 
    let parent = this.parentNode
    let counter = parent.getElementsByClassName('counter')[0]
    counter.innerHTML = parseInt(counter.innerHTML) + 1
    
    if(counter.innerHTML > 0) {
      counter.style.color = "rgb(4, 230, 4)";
    }
    if(counter.innerHTML == 0) {
      counter.style.color = "black";
    }

    let num = parseInt(counter.innerHTML)

    sendMsgToSW({ value: num, counter: parent.id });
  })
}

let thumbsDowns = document.getElementsByClassName("thumbsdown")
for (let item of thumbsDowns) {
  item.addEventListener('click', function(){ 
    let parent = this.parentNode
    let counter = parent.getElementsByClassName('counter')[0]
    counter.innerHTML = parseInt(counter.innerHTML) - 1

    if(counter.innerHTML < 0) {
      counter.style.color = "red";
    }
    if(counter.innerHTML == 0) {
      counter.style.color = "black";
    }

    let num = parseInt(counter.innerHTML)

    sendMsgToSW({ value: num, counter: parent.id });
  })
}

const sendMsgToSW = (data = { msg: "hello" }) => {
  if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(data);
  } else {
      window.location.reload();
  }

}

navigator.serviceWorker.addEventListener('message', event => {
  if(event.data.value && event.data.counter) {
    num = event.data.value;
    parent = document.getElementById(event.data.counter)

    counter = parent.getElementsByClassName('counter')[0]
    
    counter.innerHTML = num

    if(counter.innerHTML < 0) {
      counter.style.color = "red";
    }
    if(counter.innerHTML > 0) {
      counter.style.color = "rgb(4, 230, 4)";
    }
    if(counter.innerHTML == 0) {
      counter.style.color = "black";
    }
  }
  if(event.data.joke && event.data.counter){
    parent = document.getElementById(event.data.counter)
    let joke = parent.getElementsByClassName('joke')[0]

    joke.innerHTML = event.data.joke

    let counter = parent.getElementsByClassName('counter')[0]
    counter.innerHTML = 0
    counter.style.color = "black";
  }
});

async function postData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'GET', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
  });
  return response.json(); // parses JSON response into native JavaScript objects
}

async function getNewJoke() {
  let returndata = await postData('https://us-central1-dadsofunny.cloudfunctions.net/DadJokes/random/jokes')
  .then(data => {
    console.log(data); // JSON data parsed by `data.json()` call
    return data;
  });
  return returndata;
}

let newJokes = document.getElementsByClassName("newjoke")
for (let item of newJokes) {
  item.addEventListener('click', function(){ 
    let parent = this.parentNode
    let joke = parent.getElementsByClassName('joke')[0]
    let counter = parent.getElementsByClassName('counter')[0]
    counter.innerHTML = 0
    counter.style.color = "black";

    getNewJoke()
    .then(function(response){
      let newjoke = response['setup'] + " " + response['punchline']
      joke.innerHTML = newjoke

      sendMsgToSW({ joke: newjoke, counter: parent.id });
  })    
  })
}