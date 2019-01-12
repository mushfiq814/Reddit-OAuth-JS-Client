// import environment variables
// REMEMBER to put the required values into .config/config.js
// Refer to .config/config.example.js for structure
import ENV_VARS from './.config/config.js';

// check if redirected
const url = new URLSearchParams(window.location.search);
if (url.has('code')) getAcessToken(url.get('code'));

// sign in to reddit
const authButton = document.getElementById('authButton');
authButton.addEventListener('click', (e) => {
  e.preventDefault();
  redirectReddit();
})

/**
 * function to get Access Token
 * @param {*} code access code from reddit
 */
function getAcessToken(code) {
  const tokenUri = "https://www.reddit.com/api/v1/access_token";
  const basicAuthHeader = ENV_VARS.CLIENT_ID + ":" + ENV_VARS.CLIENT_SECRET;
  const basicAuthHeaderEncoded = btoa(basicAuthHeader);

  var form = new FormData();
  form.append('code', code);
  form.append('grant_type', 'authorization_code');
  form.append('redirect_uri', ENV_VARS.REDIRECT_URI);
  // form.append('grant_type', 'authorization_code');
  // form.append('refresh_token', '25858625-Vvj1N42E7a__8fOJ7OhKhDhpF4Q');

  const header = {
    "Authorization" : "Basic " + basicAuthHeaderEncoded
  }

  return fetch(tokenUri, {
    method: "POST",
    headers: header,
    body: form
  }).then(res => res.json())
    .then(data => {
      getSubscribedSubreddits(data.access_token);
      // getSavedPosts(data.access_token);
    })
    .catch(err => console.log("Error: " + err)) 
}

/**
 * function to get subscribed subreddits for user
 * @param {*} token access_token from reddit
 */
function getSubscribedSubreddits(token) {
  const oauthUri = "https://oauth.reddit.com/";
  const path = "subreddits/mine/subscriber";

  const header = {
    "Authorization" : "Bearer " + token
  }

  return fetch(oauthUri+path, {
    method: "GET",
    headers: header
  }).then(res => res.json())
    .then(data => {
      var results = data.data.children;
      console.log(results);
      let output = '<div class="card-columns">';
      results.forEach(element => {
        output+=`
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">${element.data.display_name}</h5>
            <p class="card-text">${element.data.description}</p>
          </div>
        </div>`;
      })
      output+= '</div>';
      document.getElementById('results').innerHTML = output;
    })
    .catch(err => console.log('Error: ' + err))
}

/**
 * function to get saved posts
 * @param {*} token access_token from reddit
 */
function getSavedPosts(token) {
  const oauthUri = "https://oauth.reddit.com/";
  const path = "/user/mushfiq_814/saved";

  const header = {
    "Authorization" : "Bearer " + token
  }

  return fetch(oauthUri+path, {
    method: "GET",
    headers: header
  }).then(res => res.json())
    .then(data => {
      var results = data.data.children;
      console.log(results);

      let output = '<div class="card-columns">';
      
      // loop through each item
      results.forEach(element => {
        // if it is an image post
        if (element.kind=='t3') {
          if (element.data.domain == 'gfycat.com') {
            const str = element.data.url;
            const gfycatUrlArray = str.split('https://gfycat.com/');
            var imageUrl = 'https://gfycat.com/ifr/' + gfycatUrlArray[1];
          } else {
            var imageUrl = element.data.url;
          }
          

          output+=`
          <div class="card">
            <div class="card-body">
            <h5 class="card-title">${element.data.title}</h5>
            <img src="${imageUrl}">
            </div>
          </div>`;
        } 
        // if it is a text post
        else if (element.kind=='t1') {
          output+=`
          <div class="card">
            <div class="card-body">
            <h5 class="card-title">${element.data.link_title}</h5>
            <p class="card-text">${element.data.body}</p>
            </div>
          </div>`;
        }  
      })
      
      output+= '</div>';
      document.getElementById('results').innerHTML = output;
    })
    .catch(err => console.log('Error: ' + err))
}

/**
 * redirect to reddit authorization url
 */
function redirectReddit() {
  const authUri = 'https://www.reddit.com/api/v1/authorize'
  const scope = 'history,mysubreddits'

  const authUriparams = {
    'client_id' : ENV_VARS.CLIENT_ID,
    'response_type' : 'code',
    'state':'rstr',
    'redirect_uri': ENV_VARS.REDIRECT_URI,
    'duration' : 'permanent',
    'scope': scope
  }

  const completeUri = `${authUri}?
  client_id=${authUriparams.client_id}&
  response_type=${authUriparams.response_type}&
  state=${authUriparams.state}&
  redirect_uri=${authUriparams.redirect_uri}&
  duration=${authUriparams.duration}&
  scope=${authUriparams.scope}`

  const repairedUri = completeUri.replace(/[\s\n]/g, '');

  window.location.replace(repairedUri,"_blank");
}