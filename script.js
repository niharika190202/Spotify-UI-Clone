// console.log('Lets write JavaScript');
let songs;
let currentSong = new Audio();
let currFolder;

function convertToMinutesSeconds(totalSeconds) {
    if (isNaN(totalSeconds) || totalSeconds < 0) {
        return "00:00"
    }
    // Get the integer part of minutes
    const minutes = Math.floor(totalSeconds / 60);

    // Get the remaining seconds
    const seconds = Math.floor(totalSeconds % 60);

    // Return the formatted string
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

async function getSongs(folder){
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    // Show all the songs in the playlist
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> <img class="invert" src="https://cdn.hugeicons.com/icons/music-note-03-solid-sharp.svg" alt="music-note-03" width="28" height="28">
                 <div class="info">
                   <div>${song.replaceAll("%20", " ")}</div>
                   <div>Song Artist</div>
                 </div>
                 <div class="playnow">
                   <span>Play Now</span>
                   <img class="invert" src="https://cdn.hugeicons.com/icons/play-circle-solid-sharp.svg" alt="play-circle" width="28" height="28">
                 </div> </li>`;
    }
     
    // Attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e=>{
         e.addEventListener("click", element=>{
             console.log(e.querySelector(".info").firstElementChild.innerHTML);
             playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })
    })
    return songs
}

const playMusic = (track, pause=false) => {
    // let audio = new Audio("/songs/" + track);
    currentSong.src = `/${currFolder}/` + track;
    if(!pause){
        currentSong.play(); 
    }  
    play.src = "img/pause.svg";
    document.querySelector(".songinfo").innerHTML = decodeURI(track).split()
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    console.log("displaying albums")
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if(e.href.includes("/songs")){
            let folder = e.href.split("/").splice(-2)[0]
            // Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card rounded">
            <div class="play">
                <img
                    src="https://cdn.hugeicons.com/icons/play-solid-sharp.svg"
                    alt="play"
                    style="width: 28px; height: 28px;"
                />
            </div>
            <img src="/songs/${folder}/cover.png" alt=""/>
            <h3>${response.title}</h3>
            <p>${response.description}</p>
            </div>`
        }
    }

    //Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=> {
        e.addEventListener("click", async item=>{
            console.log("Fetching songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })
}

async function main(){

    // get the list of all the songs
    await getSongs("songs/ghazals")
    playMusic(songs[0], true)

    // Display all the albums on the page
    await displayAlbums()

    // Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if(currentSong.paused){
            currentSong.play();
            play.src = "img/pause.svg"
        }
        else{
            currentSong.pause();
            play.src = "img/play.svg"
        }
    })

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate" ,()=> {
        document.querySelector(".songtime").innerHTML = `${convertToMinutesSeconds(currentSong.currentTime)} / ${convertToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime/currentSong.duration)*100 + "%";
    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e=> {
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent)/100
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", ()=> {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", ()=> {
        document.querySelector(".left").style.left = "-130%"
    })

    // Add an event listener to previous
    previous.addEventListener("click", () =>{
        console.log("Previous clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0])
        if((index-1) >= 0)
         playMusic(songs[index-1])
    })

    // Add an event listener to next
    next.addEventListener("click", () =>{
        console.log("Next clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0])
        if((index+1) < songs.length)
         playMusic(songs[index+1])
    })

    // Add an event listener to volume range
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=> 
    {
        console.log("setting volume to", e.target.value, "/100")
        currentSong.volume = parseInt(e.target.value)/100
    })

    // Add event listener to mute the track
    document.querySelector(".volume img").addEventListener("click", e => {
        // console.log(e.target)
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            e.target.src = "volume.svg"
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
    })

}

main()

