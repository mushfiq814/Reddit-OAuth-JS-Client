// import environment variables
// REMEMBER to put the required values into .config/config.js
// Refer to .config/config.example.js for structure
import ENV_VARS from '../.config/config.js';

let after = '';
let token = '';
let refreshToken = '';

// check if redirected
const url = new URLSearchParams(window.location.search);
if (refreshToken.length>0) getAcessToken(refreshToken);
if (url.has('code')) getAcessToken(url.get('code'));

// BUTTONS
// sign in to reddit
const authButton = document.getElementById('authButton');
authButton.addEventListener('click', (e) => {
  e.preventDefault();
  redirectReddit();
})

// load more
const loadMoreBtn = document.getElementById('load-more-btn');
loadMoreBtn.addEventListener('click', (e) => {
  e.preventDefault();
  getSavedPosts(token);
})

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

  window.location.replace(repairedUri);
}

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
  if (refreshToken == '') {
    form.append('grant_type', 'authorization_code');
    form.append('redirect_uri', ENV_VARS.REDIRECT_URI);
  } else {
    form.append('grant_type', 'refresh_token');
    form.append('refresh_token', refreshToken);
  }

  const header = {
    "Authorization" : "Basic " + basicAuthHeaderEncoded
  }

  return fetch(tokenUri, {
    method: "POST",
    headers: header,
    body: form
  }).then(res => res.json())
    .then(data => {
      console.log(data)
      token = data.access_token;
      const refreshToken = data.refresh_token;
      const expiresIn = data.expires_in;
      console.log(`refreshToken: ${refreshToken}`);
      console.log(`expiresIn: ${expiresIn} s`);
      // getSubscribedSubreddits(data.access_token);
      getSavedPosts(data.access_token);
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
  let query = "?limit=100";

  const header = {
    "Authorization" : "Bearer " + token
  }

  if (after.length > 0) query += ('&after=' + after.toString());

  return fetch(oauthUri+path+query, {
    method: "GET",
    headers: header
  }).then(res => res.json())
    .then(data => {
      after = data.data.after;
      var results = data.data.children;
      // console.log(results);
      
      // loop through each item
      results.forEach(element => {
        if (!element.data.over_18) {
          console.log(element);
          // create card
          var card = document.createElement('div');
          card.classList.add('card');

          // create card Body
          var cardBody = document.createElement('div');
          cardBody.classList.add('card-body');

          // create link to post
          var anchorTag = document.createElement('a');
          anchorTag.href = "https://www.reddit.com" + element.data.permalink;

          // card Title
          var cardTitle = document.createElement('h5');
          cardTitle.classList.add('card-title');
          cardTitle.innerText = element.data.title;

          // card Text
          var cardText = document.createElement('p');
          cardText.classList.add('card-text');          

          cardText.innerText = element.data.body ? truncateText(element.data.body,100) : 'nothing to show';

          // if it is a post
          if (element.kind=='t3') {
            anchorTag.appendChild(cardTitle);
            cardBody.appendChild(anchorTag);
            cardBody.appendChild(cardText);
            // for gfycats only
            if (element.data.domain == 'gfycat.com') {
              const str = element.data.url;
              const gfycatUrlArray = str.split('https://gfycat.com/');
              var imageUrl = 'https://gfycat.com/ifr/' + gfycatUrlArray[1];
              var imgElement = document.createElement('img');
              imgElement.src = imageUrl;
              cardBody.appendChild(imgElement); 
            } else {
              var preview = element.data.preview;
              if (preview) {
                var previewUrl = preview.images[0].source.url;
                var newPreviewUrl = previewUrl.replace('amp;','');
                while (newPreviewUrl.indexOf('amp;')>0) {newPreviewUrl = newPreviewUrl.replace('amp;','');}
                var imgElement = document.createElement('img');
                // imgElement.src = newPreviewUrl;
                cardBody.appendChild(imgElement);   
              } 
            }                     
          } 
          // if it is a comment
          else if (element.kind=='t1') {
            cardBody.appendChild(cardTitle);
            cardBody.appendChild(cardText);
          }
          
          card.appendChild(cardBody); 
          var cardColumn = document.getElementById('cardColumns');
          cardColumn.appendChild(card);
          document.getElementById('results').appendChild(cardColumn);

        }
      })
      // var bricklayer = new Bricklayer(document.getElementById('cardColumns'));
    })
    .catch(err => console.log('Error: ' + err))
}

/**
 * Truncate Text
 * @param {*} text text to truncate
 * @param {*} limit char limit to next end of word
 */
function truncateText(text, limit) {
  const shortened = text.indexOf(' ', limit);
  if (shortened == -1) return text;
  return text.substring(0, shortened) + "...";
}