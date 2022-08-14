// Whew, this JS is a bit complex. Lemme walk you through it

let servers = [];

// So, when the page fully loads..
window.addEventListener('load', async () => {
  // Add event listener to the "Begin" button.
  document.getElementById('begin-btn').addEventListener('click', async () => {
    // Replace static Earth image in stage 1 with spinning Earth.
    const stage1Globe = document.getElementById('stage-1-globe');
    stage1Globe.setAttribute('src', stage1Globe.getAttribute('data-src'));

    // Load in stars.js
    await loadCDN('assets/js/stars.js');

    // Add background music
    document.getElementById('audio-player-container').innerHTML += `
    <audio src="assets/mp3/humming.mp3" id="hummingAudio" autoplay loop>
        <p>If you are reading this, it is because your browser does not support the audio element.</p>
    </audio>`;
    const hummingAudio = document.getElementById('hummingAudio');
    hummingAudio.volume = 0.5;

    // These CodePens are lifesavers:
    // https://codepen.io/idorenyinudoh/pen/GRjBXER
    // https://codepen.io/shahednasser/pen/XWgbGBN
    const soundButton = document.getElementsByClassName('sound-button')[0],
      volumeSlider = document.getElementById('volume-slider'),
      outputContainer = document.getElementById('volume-output');

    // Adds event listeners to mute button & volume slider.
    soundButton.addEventListener('click', (e) => {
      // Toggles mute.
      hummingAudio.muted = !hummingAudio.muted;
      if (hummingAudio.muted)
        // Adds class so stage 2 audio can check whether the muted button was ticked or not.
        soundButton.classList.add('muted');
      else soundButton.classList.remove('muted');
      // Modifies the image/alt text depending on state.
      const soundButtonImg =
        document.getElementsByClassName('sound-button-img')[0];
      soundButtonImg.src = hummingAudio.muted
        ? 'assets/img/stage1/muted.svg'
        : 'assets/img/stage1/unmuted.svg';
      soundButtonImg.alt = hummingAudio.muted ? 'Sound muted' : 'Sound unmuted';
    });

    // Adds event listener to volume slider.
    volumeSlider.addEventListener('input', (e) => {
      const value = e.target.value;

      // Modifies output text & volume of audio.
      outputContainer.textContent = value;
      hummingAudio.volume = value / 100;
    });

    // THEN hide the modal window.
    const modalWindow =
      document.getElementsByClassName('begin-modal-window')[0];
    modalWindow.style.visibility = 'hidden';
    modalWindow.style.opacity = 0;
    modalWindow.style['pointer-events'] = 'none';
  });
});

// The page has fully loaded. Now what?
// We add an event listener to the "Find your new home button".

document
  .getElementsByClassName('find-home-button')[0]
  .addEventListener('click', async () => {
    // ..Then we'll change the globe gif to a faster one, to tell the user something more is happening
    const globeImg = document.getElementsByClassName('globe')[0];
    globeImg.src =
      'assets/img/stage1/Rotating_earth_animated_transparent_fast.webp';

    // We'll first change the text of the find home button, to tell the user we're doing something
    const findHomeBtn = document.getElementsByClassName('find-home-button')[0];
    findHomeBtn.textContent = 'Finding your brotherhood..';

    // We'll disable it so they cannot trigger this 5000 times and break anything
    findHomeBtn.disabled = true;

    // Call the find-bros API to fetch the: closest server, and a list of all of the other servers.
    const joinBtn = document.getElementsByClassName('join-button')[0];

    let region_code = '',
      country = 'us';

    try {
      servers = await (await fetch('servers.json')).json();
    } catch (e) {
      console.error(e);
      alert('Could not load servers. Please reload the page');
    }

    try {
      let res = await (await fetch('https://ipapi.co/json/')).json();
      region_code = res.region_code.toLowerCase();
      country = res.country.toLowerCase();
    } catch (e) {
      console.error(e);
      alert("There's been an error getting your location. Defaulting to USA");
    }

    const geoServer =
      servers.find((s) => s.cc === `${country}-${region_code}`) || // First find exact match by country-region
      servers.find((s) => s.cc === country) || // Else find exact match by country
      servers.find((s) => s.cc.split('-')[0] === country) || // Then find by matching if no results
      null; // No server then

    // If there's a server for the country it was requested from:
    if (geoServer) {
      // Set the current country to that
      await setCurrentCountry(
        geoServer.country,
        geoServer.cc,
        geoServer.invite,
        false
      );

      // Preload the server list into a local array, if they want to select a different country
      for (const server of servers) {
        servers[server.match.toLowerCase()] = server;
      }

      // If there is no server for the country it was requested from..
    } else {
      document.getElementsByClassName('country-wrapper')[0].style.display =
        'none';
      // encourage them to make one
      document.getElementsByClassName(
        'no-country-found-wrapper'
      )[0].style.display = 'inline-flex';
    }

    // Then, we'll prepare to fade out the stage 1 page...

    await sleep(2000);

    // Set the stage 1 wrapper to fade out
    const stage1Wrapper = document.getElementById('stage-1');
    stage1Wrapper.classList.toggle('fade-out');
    await sleep(2000);
    stage1Wrapper.style.display = 'none';

    // Remove the current background audio element
    const hummingAudio = document.getElementById('hummingAudio');
    hummingAudio.remove();

    // Change the stage 2 globe image to the webp
    const stage2Globe = document.getElementById('stage-2-globe');
    stage2Globe.setAttribute('src', stage2Globe.getAttribute('data-src'));

    // Once that's done, fade in the new stage 2 wrapper.
    const stage2Wrapper = document.getElementById('stage-2');
    stage2Wrapper.style.display = 'block';
    stage2Wrapper.classList.toggle('fade-in');

    // Add the gigachad music, using settings from volume control
    document.getElementById(
      'stage-2'
    ).innerHTML += `<audio src="assets/mp3/gigachadmusic.mp3" id="gigachadaudio" autoplay>
<p>If you are reading this, it is because your browser does not support the audio element.</p>
</audio>`;
    const audio = document.getElementById('gigachadaudio');
    const soundButton = document.getElementsByClassName('sound-button')[0];
    const volumeSlider = document.getElementById('volume-slider');

    audio.volume = volumeSlider.value / 100;

    if (soundButton.classList.contains('muted')) {
      audio.muted = true;
    }

    // If the user wants to find another country's Discord server, we'll add the event listener now (since you cannot do it earlier)
    document
      .getElementsByClassName('not-your-country-button')[0]
      .addEventListener('click', async () => {
        // Clear value of search box & the list to make it less annoying to search again
        const countrySearchBox =
          document.getElementsByClassName('country-input')[0];
        countrySearchBox.value = '';

        const countryList = document.getElementById('countryList');
        countryList.replaceChildren();

        // Hide button, show input box & list

        const notYourCountryBtn = document.getElementsByClassName(
          'not-your-country-button'
        )[0];
        notYourCountryBtn.style.display = 'none';

        const countrySearch =
          document.getElementsByClassName('country-search')[0];
        countrySearch.style.display = 'flex';

        document.getElementsByClassName('country-input')[0].focus();
      });
  });

// This function basically sets the current country on the stage 2 page.
async function setCurrentCountry(
  name,
  countryCode,
  inviteURL,
  newCountrySelected
) {
  const joinBtn = document.getElementsByClassName('join-button')[0];

  const countryName = document.querySelector('.country-name');
  countryName.innerText = name;

  const flagImg = document.querySelector('.flag-img');
  flagImg.src = `https://flagcdn.com/${countryCode}.svg`;

  // Sets the button using onclick to open the invite link in the current tab.
  joinBtn.setAttribute('onclick', `openURL("${inviteURL}")`);

  // This is for if the user clicks one of the countries on "Not your true country?"
  // It just auto-hides the dialog and displays that button again
  if (newCountrySelected) {
    const notYourCountryBtn = document.getElementsByClassName(
      'not-your-country-button'
    )[0];
    notYourCountryBtn.style.display = '';

    const countrySearch = document.getElementsByClassName('country-search')[0];
    countrySearch.style.display = 'none';
  }
}

// This is a hacky auto-complete function I cobbled together using StackOverflow.
// Thanks: https://stackoverflow.com/a/38750895

function autocompleteMatch(input) {
  if (input === '') return [];

  const lowercase = input.toLowerCase();
  const reg = new RegExp(lowercase);

  const filtered = Object.keys(servers)
    .filter((term) => term.match(reg))
    .reduce((obj, key) => {
      obj[key] = servers[key];
      return obj;
    }, {});

  return filtered;
}

// This function is called every time the user pops a key into the "Enter your country" search box
function populateServerList(input) {
  const countryList = document.getElementById('countryList');

  try {
    // We'll run their input and try and find a match in the array of servers
    let terms = autocompleteMatch(input);

    // Split the keys/values into seperate arrays so it's less of a pain to iterate
    const keys = Object.keys(terms);
    const values = Object.values(terms);

    // Clear the existing country list
    countryList.replaceChildren();

    // If the match has been run against the server list, then..
    if (terms) {
      // If there actually is a few matches..
      if (keys.length > 0) {
        for (let i = 0; i < keys.length; i++) {
          const server = values[i];
          // Add the matches to the list
          countryList.insertAdjacentHTML(
            'beforeend',
            `
        <button class="country-btn" onclick='setCurrentCountry("${server.country}", "${server.cc}", "${server.invite}", true)'>
            <img class="country-btn-img" src="https://flagcdn.com/${server.cc}.svg"/>
            <span class="country-btn-name">${server.country}</span>
        </button>
        `
          );
        }
      } else if (keys.length === 0 && input !== '') {
        // If not.. encourage them to use their "FREEDOM" to create a server
        countryList.insertAdjacentHTML(
          'beforeend',
          `
        <button class="country-btn" onclick='window.location.href="#open-modal"'>
            <img class="country-btn-img" src="https://flagcdn.com/us.svg"/>
            <span class="country-btn-name">No brotherhood has been found for your country. Make one, and lead it, brother.</span>
        </button>
        `
        );
      }
    } else {
      // There is no way a user should be able to get this error, but just in case..
      countryList.append(`
        <button class="country-btn">
            <span class="country-btn-name">An error occurred. Reload, brother.</span>
        </button>
        `);
    }
  } catch (e) {
    console.log(e);
  }
}

// It kindof works.
// Thanks: https://markmichon.com/automatic-retries-with-fetch
const fetchPlus = (url, options = {}, retries) =>
  fetch(url, options)
    .then((res) => {
      if (res.ok) {
        return res.json();
      }
      if (retries > 0) {
        return fetchPlus(url, options, retries - 1);
      }
      throw new Error(res.status);
    })
    .catch((error) => console.error(error.message));

// Bog standard sleep function.
// My go-to, thanks! https://stackoverflow.com/a/39914235
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// A nice function that we can use for the buttons, to open the Discord server invite URLs in the same tab.
function openURL(url) {
  window.open(url, '_self');
}

// Thank you to https://stackoverflow.com/a/59613051
const loadCDN = (src) =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`head > script[src="${src}"]`) !== null)
      return resolve();
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    document.head.appendChild(script);
    script.onload = resolve;
    script.onerror = reject;
  });
