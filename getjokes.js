// fetch("https://us-central1-dadsofunny.cloudfunctions.net/DadJokes/random/jokes/5", {
// 	"method": "GET"
// })
// .then(response => {
// 	console.log(response.body);
// })
// .catch(err => {
// 	console.error(err);
// });

// Example POST method implementation:
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
  })
}

let newJokes = document.getElementsByClassName("newjoke")
for (let item of newJokes) {
  item.addEventListener('click', function(){ 
    let parent = this.parentNode
    let joke = parent.getElementsByClassName('joke')[0]
    let counter = parent.getElementsByClassName('counter')[0]
    counter.innerHTML = 0
    counter.style.color = "black";

    let newjoke = getNewJoke()
    .then(response => joke.innerHTML = response['setup'] + " " + response['punchline']);;
    
  })
}
