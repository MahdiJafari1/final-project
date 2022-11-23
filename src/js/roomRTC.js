
const appId = "b6dea4178c9948bfbaa41ffbc62fd933";
const appCertificate = "1978f578c57b4e82be65408ed1a8a268";
const channelName = "meet";
let token =
  "007eJxTYJhSrdd7+GeE5rsbOr0T35z8wRRT33zgZqXf5/jZ9Q9bA7MUGJLMUlITTQzNLZItLU0sktKSEoG8tLSkZDOjtBRLY+O4TbXJDYGMDNaLhZgYGSAQxGdhyE1NLWFgAAAx3iIV";
let client;
let uid = sessionStorage.getItem("uid");

if (!uid) {
  uid = String(Math.floor(Math.random() * 1000000));
  sessionStorage.setItem("uid", uid);
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let roomId = urlParams.get("room");

if (!roomId) {
  roomId = "main";
}

// let displayName = sessionStorage.getItem('display_name')
// if(!displayName){
//     window.location = 'lobby.html'
// }

let localTracks = [];
let remoteUsers = {};

let localScreenTracks;
let sharingScreen = false;

let joinRoomInit = async () => {
  // channel.on('MemberJoined', handleMemberJoined)
  // channel.on('MemberLeft', handleMemberLeft)
  // channel.on('ChannelMessage', handleChannelMessage)

  // getMembers()
  // addBotMessageToDom(`Welcome to the room ${displayName}! 👋`)

  client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  await client.join(appId, channelName, token, uid);
  joinStream();
  client.on("user-published", handleUserPublished);
  client.on("user-left", handleUserLeft);
};

let joinStream = async () => {
  // document.getElementById('join-btn').style.display = 'none'
  // document.getElementsByClassName('stream__actions')[0].style.display = 'flex'

  localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();

  let player = `
            <div class="xl:w-1/4 md:w-1/2 p-4 flex flex-col space-y-6 items-center video__container"  id="user-container-${uid}">
                <div class="indicator">
                    <span class="indicator-item indicator-bottom indicator-center badge badge-ghost">
                        <p class="mr-2">Hussein</p>
                    </span>
                    <div class="video_wrapper w-64 h-64 rounded-box inline-flex items-center justify-center bg-gray-200 text-gray-400 ring ring-primary ring-offset-base-100 ring-offset-2" id="user-${uid}">

                    </div>
                </div>
            </div>
    `;

  document
    .getElementById("streams__container")
    .insertAdjacentHTML("beforeend", player);
  document
    .getElementById(`user-container-${uid}`)
    .addEventListener("click", expandVideoFrame);

  localTracks[1].play(`user-${uid}`);
  await client.publish([localTracks[0], localTracks[1]]);
};

let handleUserPublished = async (user, mediaType) => {
  remoteUsers[user.uid] = user;

  await client.subscribe(user, mediaType);

  let player = document.getElementById(`user-container-${user.uid}`);

  if (player === null) {
    player = `
        <div class="xl:w-1/4 md:w-1/2 p-4 flex flex-col space-y-6 items-center" id="user-container-${user.uid}">
            <div class="indicator">
                <span class="indicator-item indicator-bottom indicator-center badge badge-ghost">
                    <p class="mr-2">Hussein</p>
                </span>
                <div class="video_wrapper w-64 h-64 rounded-box inline-flex items-center justify-center bg-base-200 text-base-content ring ring-primary ring-offset-base-100 ring-offset-2" id="user-${user.uid}">
                </div>
            </div>
        </div>
`;

    document
      .getElementById("streams__container")
      .insertAdjacentHTML("beforeend", player);
      document
      .getElementById(`user-container-${user.uid}`)
      .addEventListener("click", expandVideoFrame);
  }

  if (mediaType === "video") {
    user.videoTrack.play(`user-${user.uid}`);
  }

  if (mediaType === "audio") {
    user.audioTrack.play();
  }
};

let handleUserLeft = async (user) => {
  delete remoteUsers[user.uid];
  let item = document.getElementById(`user-container-${user.uid}`);
  if (item) {
    item.remove();
  }

  if (userIdInDisplayFrame === `user-container-${user.uid}`) {
    displayFrame.style.display = null;

    let videoFrames = document.getElementsByClassName("video__container");

    for (let i = 0; videoFrames.length > i; i++) {
      videoFrames[i].style.height = "300px";
      videoFrames[i].style.width = "300px";
    }
  }
};

let toggleMic = async (e) => {
  let button = e.currentTarget;

  if (localTracks[0].muted) {
    await localTracks[0].setMuted(false);
  } else {
    await localTracks[0].setMuted(true);
  }
};

let toggleCamera = async (e) => {
  let button = e.currentTarget;
  if (localTracks[1].muted) {
    await localTracks[1].setMuted(false);
  } else {
    await localTracks[1].setMuted(true);
  }
};

let toggleScreen = async (e) => {
  let screenButton = e.currentTarget;
  let cameraButton = document.getElementById("camera-btn");

  if (!sharingScreen) {
    sharingScreen = true;

    screenButton.classList.add("active");
    cameraButton.classList.remove("active");
    cameraButton.style.display = "none";

    localScreenTracks = await AgoraRTC.createScreenVideoTrack();

    document.getElementById(`user-container-${uid}`).remove();
    displayFrame.style.display = "block";

    let player = `
    <div class="xl:w-1/4 md:w-1/2 p-4 flex flex-col space-y-6 items-center video__container"  id="user-container-${uid}">
        <div class="indicator">
            <span class="indicator-item indicator-bottom indicator-center badge badge-ghost">
                <p class="mr-2">Hussein</p>
            </span>
            <div class="video_wrapper w-64 h-64 rounded-box inline-flex items-center justify-center bg-gray-200 text-gray-400 ring ring-primary ring-offset-base-100 ring-offset-2" id="user-${uid}">

            </div>
        </div>
    </div>
    `;

    displayFrame.insertAdjacentHTML("beforeend", player);
    document
      .getElementById(`user-container-${uid}`)
      .addEventListener("click", expandVideoFrame);

    userIdInDisplayFrame = `user-container-${uid}`;
    localScreenTracks.play(`user-${uid}`);

    await client.unpublish([localTracks[1]]);
    await client.publish([localScreenTracks]);

    let videoFrames = document.getElementsByClassName("video__container");
    for (let i = 0; videoFrames.length > i; i++) {
      if (videoFrames[i].id != userIdInDisplayFrame) {
        videoFrames[i].style.height = "100px";
        videoFrames[i].style.width = "100px";
      }
    }
  } else {
    sharingScreen = false;
    cameraButton.style.display = "block";
    document.getElementById(`user-container-${uid}`).remove();
    await client.unpublish([localScreenTracks]);

    switchToCamera();
  }
};

document.getElementById("camera-btn").addEventListener("click", toggleCamera);
document.getElementById("mic-btn").addEventListener("click", toggleMic);
document
  .getElementById("screenshare-btn")
  .addEventListener("click", toggleScreen);

joinRoomInit();
