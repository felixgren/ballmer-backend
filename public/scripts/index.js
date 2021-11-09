// Deprecated method of asking and assigning user microphone & camera

// navigator.mediaDevices.getUserMedia(
//   { video: true, audio: true },
//   (stream) => {
//     const localVideo = document.getElementById('local-video');
//     if (localVideo) {
//       localVideo.srcObject = stream;
//     }
//   },
//   (error) => {
//     console.warn(error.message);
//   }
// );

// Ask & assign user mic & webcam to #local-video
let constraints = { audio: true, video: { width: 1280, height: 720 } };
navigator.mediaDevices
  .getUserMedia(constraints)
  .then(function (mediaStream) {
    let video = document.querySelector('#local-video');
    video.srcObject = mediaStream;
    video.onloadedmetadata = function (e) {
      video.play();
    };
  })
  .catch(function (err) {
    console.log(err.name + ': ' + err.message);
  });

// Handle socket connections [client side]
