const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");

// get username and room from URL

const socket = io();
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

// join chatroom
socket.emit('joinRoom', { username, room });

// get room and users
socket.on("roomusers", ({ room, users }) => {
    outputRoomName(room);
    outputRoomUsers(users);
})

socket.on("message", (message) => {
    console.log(message);

    // display message from server
    displayMessage(message);

    // scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// message submit
chatForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // get message text
    const msg = e.target.elements.msg.value;

    // emit message to server
    socket.emit("chatMessage", msg);

    // clear input
    e.target.elements.msg.value = "";
    e.target.elements.msg.focus();
});

// output message to DOM
const displayMessage = (message) => {
    const div = document.createElement("div");
    div.classList.add("message");
    div.innerHTML = `<p class="meta">${message.username}<span style="padding-left:10px">${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector(".chat-messages").appendChild(div);
};

// add room name to DOM
const outputRoomName = (room) => {
    roomName.innerText = room;
}

// add users to DOM
const outputRoomUsers = (users) => {
    console.log(users);
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join("")}
    `;
}