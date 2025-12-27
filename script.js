console.log("lets write javaScript");
let currentSong = new Audio();
let songs;
let crrFolder;

function formatTime(seconds) {
  if (isNaN(seconds) || seconds === null || seconds === undefined) {
    return "00:00"; // Return "00:00" for invalid inputs
  }
 
  const totalSeconds = Math.floor(seconds);

  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

async function getSongs(folder) {
  crrFolder = folder
  let a = await fetch(`${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${crrFolder}/`)[1]);
    }
  }

  let songUL = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];

  songUL.innerHTML = ""
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li>
        
                <i class="fa-solid fa-music"></i>
                <div class="info">
                  <div>${song.replaceAll("%20", " ")}</div>
                  <div>Hamza</div>
                </div>
                  <div class="playnow" style="
                      display: flex;
                      justify-content: center;
                      align-items: center;">
                    <span>Play Now</span>
                    <i class="fa-solid fa-play"></i>
                  </div> </li>`;
  }
  // Attach an Eventlistner to each song
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", () => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  return songs
}

const playMusic = (track, shouldPause = false) => {
  try {
    // Set the audio source
    currentSong.src = `/${crrFolder}/${decodeURIComponent(track)}`;

    // Update song info
    document.querySelector(".songinfo").innerHTML = decodeURIComponent(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

    // Play or pause the song based on the parameter
    if (!shouldPause) {
      currentSong
        .play()
        .then(() => {
          // Update play/pause button visibility
          document.getElementById("play").style.display = "none";
          document.getElementById("pause").style.display = "inline-block";
        })
        .catch((error) => {
          console.error("Failed to play the song:", error);
        });
    }
  } catch (error) {
    console.error("Error in playMusic function:", error);
  }
};

async function displayAlbum() {
  try {
    let a = await fetch(`songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardcontainer = document.querySelector(".cardcontainer");
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
      const e = array[index];
      if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
        let folder = e.href.split("/").slice(-2)[0];
        try {
          let a = await fetch(`/songs/${folder}/info.json`);
          let response = await a.json();
          // console.log(response);
          cardcontainer.innerHTML += `
            <div data-folder="${folder}" class="card">
              <div class="play">
                <i class="fa-solid fa-play"></i>
              </div>
              <img src="/songs/${folder}/cover.jpg" alt="${response.title}" />
              <h3>${response.title}</h3>
              <p>${response.description}</p>
            </div>`;
        } catch (error) {
          console.error("Error fetching metadata:", error);
        }
      }
    }
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
      e.addEventListener("click", async (item) => {
        let folder = item.currentTarget.dataset.folder;
        let songs = await getSongs(`songs/${folder}`);
        playMusic(songs[0])
      });
    });
  } catch (error) {
    console.error("Error in displayAlbum:", error);
  }
}

async function main() {
  await displayAlbum();
  await getSongs("songs/cs");
  playMusic(songs[0], true);
  

  // Get elements
  const play = document.getElementById("play");
  const pause = document.getElementById("pause");

  // Fix pause button icon (your HTML had fa-play for both buttons)
  pause.classList.replace("fa-play", "fa-pause");

  // Initial state
  pause.style.display = "none";

  // Play button click handler
  play.addEventListener("click", () => {
    currentSong.play();
    play.style.display = "none";
    pause.style.display = "inline-block";
  });

  // Pause button click handler
  pause.addEventListener("click", () => {
    currentSong.pause();
    pause.style.display = "none";
    play.style.display = "inline-block";
  });

  //  Listen to the Event listener to see time duration
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${formatTime(
      currentSong.currentTime
    )} / ${formatTime(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Add an event listner to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });
  // Add an event listner to hammburger
  document.querySelector("#hammburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // Add an event listner to Close button
  document.querySelector("#closebtn").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
  });

  // Add an event listener to the previous button
  previous.addEventListener("click", () => {
    console.log("previous clicked");

    // Get the current song's filename
    const currentSongName = currentSong.src.split("/").pop();

    // Find the index of the current song in the songs array
    const index = songs.indexOf(currentSongName);

    // Play the previous song if it exists
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    } else {
      console.log("No previous song available.");
    }
  });

  // Add an event listener to the next button
  next.addEventListener("click", () => {
    console.log("next clicked");

    // Get the current song's filename
    const currentSongName = currentSong.src.split("/").pop();

    // Find the index of the current song in the songs array
    const index = songs.indexOf(currentSongName);

    // Play the next song if it exists
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    } else {
      console.log("No next song available.");
    }
  });

  // add an Event listner to volume
  document.querySelector(".range input").addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;

    if(currentSong.volume === 0){
      volume.style.display = "none";
      mute.style.display = "inline-block";
    } else{
      volume.style.display = "inline-block";
      mute.style.display = "none";
    }

  });

  const volume = document.getElementById("volume");
  const mute = document.getElementById("mute");

  mute.classList.replace("fa-volume-high", "fa-volume-xmark");

  mute.style.display = "none";

  volume.addEventListener("click", () => {
    currentSong.volume = 0;
    document.querySelector(".range input").value = 0;
    volume.style.display = "none";
    mute.style.display = "inline-block";
  });



  mute.addEventListener("click", () => {
    currentSong.volume = .50;
    document.querySelector(".range input").value = 50;
    mute.style.display = "none";
    volume.style.display = "inline-block";
  });
}

main();
