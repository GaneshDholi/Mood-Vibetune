const input = document.getElementById("myVideo");
const trackList = document.getElementById('trackList');
const moodContainer = document.querySelector(".mood-container");
const contentSection = document.querySelector(".content-section");
const moodDisplay = document.getElementById("moodDisplay");
const lottieContainer = document.getElementById("lottie-container");
const notFoundLottieContainer = document.getElementById("lottie-container-not-found");
trackList.innerHTML = `<dotlottie-wc src="https://lottie.host/3adada87-6e9b-43dd-903e-1bb3ec8ff0a4/SXt0LipvMU.lottie" style="width: 300px;height: 300px" speed="1" autoplay loop></dotlottie-wc>`
trackList.style.display = "flex";
trackList.style.justifyContent = "center";

//funciton for starting the webcamra
async function startVideo() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    input.srcObject = stream;
  } catch (err) {
    console.error("Error accessing camera:", err);
    trackList.innerHTML = `<dotlottie-wc
      src="https://lottie.host/54a880ef-411c-4bee-9db7-2508a1de09bc/cBmIJ3Hhah.lottie"
      style="width: 300px;height: 300px"
      speed="1"
      autoplay
      loop
    ></dotlottie-wc>`;
    moodContainer.style.display = "flex";
    moodContainer.innerHTML = "Please grant camera access to continue !";
    moodContainer.style.fontFamily = "IBM Plex Sans JP, sans-serif";
    moodContainer.style.fontSize = "13px";
    moodContainer.style.fontWeight = "400";
    contentSection.style.gap = "5px";
  }
}

//button fot start detecting face
document.getElementById("captureButton").addEventListener("click", () => {
  trackList.innerHTML = '';
  lottieContainer.style.display = "flex";
  lottieContainer.style.justifyContent = "center";
  trackList.appendChild(lottieContainer);
  detectface();
})

// loading models and detect face
async function detectface() {
  await faceapi.nets.tinyFaceDetector.loadFromUri('./modals')
  await faceapi.nets.ssdMobilenetv1.loadFromUri('./modals');
  await faceapi.nets.faceLandmark68Net.loadFromUri('./modals');
  await faceapi.nets.faceLandmark68TinyNet.loadFromUri('./modals');
  await faceapi.nets.faceExpressionNet.loadFromUri('./modals');
  await faceapi.nets.faceRecognitionNet.loadFromUri('./modals');


  const displaySize = { width: input.width, height: input.height }
  const canvas = document.getElementById("overlay")
  faceapi.matchDimensions(canvas, displaySize)

  function getTopMood(expr) {
    return Object.entries(expr).reduce((max, cur) => cur[1] > max[1] ? cur : max)[0];
  }
  //face expression
  try {
    const detectionsWithExpressions = await faceapi
      .detectSingleFace(input)
      .withFaceLandmarks()
      .withFaceExpressions()
    const mood = getTopMood(detectionsWithExpressions.expressions);
    if (moodDisplay) {
      moodDisplay.textContent = `${mood}`;
      moodContainer.style.display = "flex";
      contentSection.style.gap = "5px";
    } else {
      moodDisplay.textContent = `MOOD NOT FOUND !`;
      moodContainer.style.display = "flex";
      contentSection.style.gap = "5px";
      trackList.innerHTML = '';
      notFoundLottieContainer.style.display = "flex";
      notFoundLottieContainer.style.justifyContent = "center";
      trackList.appendChild(notFoundLottieContainer);
    }

    fetchTracks(mood);
  } catch {
    console.error("face not detected !")
    moodDisplay.textContent = `MOOD NOT FOUND !`;
    trackList.innerHTML = '';
    notFoundLottieContainer.style.display = "flex";
    notFoundLottieContainer.style.justifyContent = "center";
    trackList.appendChild(notFoundLottieContainer);
    moodContainer.style.display = "flex";
    contentSection.style.gap = "5px";
  }
}

document.addEventListener('DOMContentLoaded', () => {
  startVideo();
})

//audio setup with button
function setupAudioControls(audio, button) {
  button.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
      button.textContent = 'Pause';
    } else {
      audio.pause();
      button.textContent = 'Play';
    }
  });

  audio.addEventListener('ended', () => {
    button.textContent = 'Play';
  });
}

//fetching the data of mood
function fetchTracks(mood) {
  fetch(`https://mood-vibetune.onrender.com/api/${mood}`)
    .then(r => {
      if (!r.ok) throw new Error("Track fetch failed");
      return r.json();
    })
    .then(data => {
      trackList.innerHTML = '';
      if (data.length === 0) {
        trackList.innerHTML = `<li style="color:orange;">No songs found for "${mood}" mood.</li>`;
        return;
      }
      data.forEach(t => {
        lottieContainer.style.display = "none";
        trackList.style.display = "block";
        const li = document.createElement('li');
        li.innerHTML = `
          <div class="track-info">
            <strong>${t.title}</strong>
            <span>by ${t.artist}</span>
          </div>
          <div class="audio-controls">
            <div class="progress-bar-container" style="display: none;">
              <div class="progress-bar"></div>
            </div>
            <audio class="track-audio" src="${t.audio}"></audio>
            <button class="play-pause-btn">
              <img id="playPauseIcon" src="./assets/images/play.png" alt="Play">
            </button>
          </div>
        `;
        const audio = li.querySelector('.track-audio');
        const button = li.querySelector('.play-pause-btn');
        button.style.border = "none";
        button.style.backgroundColor = "#ffffff";
        const img = li.querySelector("#playPauseIcon");
        img.style.height = "35px";
        const progressBarContainer = li.querySelector('.progress-bar-container');
        const progressBar = li.querySelector('.progress-bar');

        // Setup the event listeners
        button.addEventListener('click', () => {
          // Pause all other audios first
          document.querySelectorAll('.track-audio').forEach(otherAudio => {
            if (otherAudio !== audio && !otherAudio.paused) {
              otherAudio.pause();
              otherAudio.nextElementSibling.src = "./assets/images/play.png";
              otherAudio.previousElementSibling.style.display = 'none'; // Hide progress bar
            }
          });

          if (audio.paused) {
            audio.play();
            img.src = "./assets/images/pause.png";
            progressBarContainer.style.display = 'block'; // Show progress bar
          } else {
            audio.pause();
            img.src = "./assets/images/play.png";
            progressBarContainer.style.display = 'none'; // Hide progress bar
          }
        });

        // Update the progress bar as the audio plays
        audio.addEventListener('timeupdate', () => {
          const progress = (audio.currentTime / audio.duration) * 100;
          progressBar.style.width = `${progress}%`;
        });

        // Reset the button and hide the bar when the song ends
        audio.addEventListener('ended', () => {
          button.textContent = 'Play';
          progressBarContainer.style.display = 'none';
          progressBar.style.width = '0%';
        });

        // Make the progress bar clickable to seek
        progressBarContainer.addEventListener('click', (e) => {
          const containerWidth = progressBarContainer.clientWidth;
          const clickPosition = e.offsetX;
          const newTime = (clickPosition / containerWidth) * audio.duration;
          audio.currentTime = newTime;
        });

        trackList.appendChild(li);
      });
    })
    .catch(err => {
      notFoundLottieContainer.style.display = "flex";
      notFoundLottieContainer.style.justifyContent = "center";
      console.error("Fetch Error:", err.message);
      moodContainer.style.display = "flex";
      moodContainer.innerHTML = `<li style="color:red;">Failed to load tracks: ${err.message}</li>`;
      moodContainer.style.fontFamily = "IBM Plex Sans JP, sans-serif";
      moodContainer.style.fontSize = "13px";
      moodContainer.style.fontWeight = "400";
      contentSection.style.gap = "5px";
    });
}
