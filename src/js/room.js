let displayFrame = document.getElementById("stream__box");
let videoFrames = document.getElementsByClassName("video__container");

let expandVideoFrame = (e) => {
  let child = displayFrame.children[0];
  if (child) {
    document.getElementById("streams__container").appendChild(child);
  }

  displayFrame.style.display = "block";
  displayFrame.appendChild(e.currentTarget);
  userIdInDisplayFrame = e.currentTarget.id;

  for (let i = 0; videoFrames.length > i; i++) {
    if (videoFrames[i].id != userIdInDisplayFrame) {
      videoFrames[i].style.height = "100px";
      videoFrames[i].style.width = "100px";
    }
  }
};

for (let i = 0; videoFrames.length > i; i++) {
  videoFrames[i].addEventListener("click", expandVideoFrame);
}
