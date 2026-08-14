const socket = io();
let currentUser = '';

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const statusMsg = document.getElementById('status-msg');

    statusMsg.className = '';
    statusMsg.innerText = 'AUTHENTICATING IDENTITY...';

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = username;
            document.getElementById('auth-section').classList.add('hidden');
            document.getElementById('chat-section').classList.remove('hidden');
            document.getElementById('user-display').innerText = currentUser.toUpperCase();
        } else {
            statusMsg.className = 'error';
            statusMsg.innerText = data.error || 'ACCESS DENIED!';
        }
    } catch (err) {
        statusMsg.className = 'error';
        statusMsg.innerText = 'SERVER OFFLINE!';
    }
});

// Admin Panel Toggle
document.getElementById('toggle-admin-btn').addEventListener('click', () => {
    document.getElementById('admin-panel').classList.toggle('hidden');
});

// Authorize New Member Logic
document.getElementById('create-user-btn').addEventListener('click', async () => {
    const adminPassword = document.getElementById('admin-pass').value;
    const newUsername = document.getElementById('new-user').value;
    const newPassword = document.getElementById('new-pass').value;
    const adminMsg = document.getElementById('admin-msg');

    try {
        const response = await fetch('/api/add-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminPassword, newUsername, newPassword })
        });

        const data = await response.json();

        if (response.ok) {
            adminMsg.className = 'success';
            adminMsg.innerText = data.message;
            document.getElementById('new-user').value = '';
            document.getElementById('new-pass').value = '';
        } else {
            adminMsg.className = 'error';
            adminMsg.innerText = data.error;
        }
    } catch (err) {
        adminMsg.className = 'error';
        adminMsg.innerText = 'CONNECTION ERROR!';
    }
});

// Chat Send Logic
document.getElementById('chat-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const msgInput = document.getElementById('msg-input');
    const msg = msgInput.value.trim();

    if (msg) {
        socket.emit('chat-message', {
            sender: currentUser.toUpperCase(),
            message: msg
        });
        msgInput.value = '';
    }
});

// Realtime Receive
socket.on('chat-message', (data) => {
    const msgBox = document.getElementById('messages-box');
    const msgElement = document.createElement('div');
    msgElement.className = 'msg';
    msgElement.innerHTML = `<span class="sender">[${data.sender}]:</span> ${data.message} <span class="time">${data.time}</span>`;
    msgBox.appendChild(msgElement);
    msgBox.scrollTop = msgBox.scrollHeight;
});
