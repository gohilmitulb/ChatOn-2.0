const socket = io('http://localhost:8000');
const form = document.getElementById('send_form');
const enterMessage = document.getElementById('enterMessage');
const messageContainer = document.querySelector('.message_container');
const notification = new Audio('static/notification.mp3');

const append = (message,position)=>{
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageElement.classList.add('message');
    messageElement.classList.add(position);
    messageContainer.append(messageElement);
    if(position == 'left' || position == 'center'){
        notification.play();    
    }
}

form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const message = enterMessage.value;
    // const profile_img = localStorage.getItem('profile');
    append(`${message} : You`,'right');
    socket.emit('send',message);
    enterMessage.value = '';
})

// const name = localStorage.getItem('username');
// const name = prompt('To join enter your name: ');
// socket.emit('new-user-joined',name);

// const listAppend = (list_name) =>{
//     const list_container = document.querySelector('.list_container');
//     const listdiv = document.createElement('div');
//     listdiv.classList.add('listdiv');
//     listdiv.innerHTML = list_name;
//     list_container.append(listdiv);
// }

// socket.on('list-user', name=>{
//    listAppend(users)
// });

socket.on('connect', () => {
    const name = localStorage.getItem('username');
    socket.emit('new-user-joined', name);
});

socket.on('user-joined', name =>{
    append(`${name} joined ChatOn.`,'center');
    listAppend(`${name}`)
});

socket.on('receive', data=>{
    append(`${data.name}: ${data.message}`,'left');
});

socket.on('left', name=>{
    append(`${name} left ChatOn`,'center');
});

messageContainer.addEventListener('DOMSubtreeModified', function () {
    if (messageContainer.scrollHeight > messageContainer.clientHeight) {
        messageContainer.scrollTop = messageContainer.scrollHeight - messageContainer.clientHeight;
    }
});
