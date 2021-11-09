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

const socket = io.connect('localhost:5000');

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
socket.on('update-user-list', ({ users }) => {
  updateUserList(users);
});

socket.on('remove-user', ({ socketId }) => {
  const elToRemove = document.getElementById(socketId);

  if (elToRemove) {
    elToRemove.remove();
  }
});

// Handle socket requested functions
function updateUserList(socketIds) {
  const activeUserContainer = document.getElementById('active-user-container');

  socketIds.forEach((socketId) => {
    const alreadyExistingUser = document.getElementById(socketId);
    if (!alreadyExistingUser) {
      const userContainerEl = createUserItemContainer(socketId);
      activeUserContainer.appendChild(userContainerEl);
    }
  });
}

function createUserItemContainer(socketId) {
  const userContainerEl = document.createElement('div');

  const usernameEl = document.createElement('p');

  userContainerEl.setAttribute('class', 'active-user');
  userContainerEl.setAttribute('id', socketId);
  usernameEl.setAttribute('class', 'username');
  usernameEl.innerHTML = `Socket: ${socketId}`;

  userContainerEl.appendChild(usernameEl);

  userContainerEl.addEventListener('click', () => {
    unselectUsersFromList();
    userContainerEl.setAttribute('class', 'active-user active-user--selected');
    const talkingWithInfo = document.getElementById('talking-with-info');
    talkingWithInfo.innerHTML = `Talking with: "Socket: ${socketId}"`;
    callUser(socketId);
  });
  return userContainerEl;
}

function callUser(socketId) {
  console.log(
    `Ill bloode call soket id ${socketId} and tellem what i tink bout his bloody stuped id!`
  );
}
