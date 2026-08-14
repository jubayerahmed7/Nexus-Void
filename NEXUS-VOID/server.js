const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper: Read Users
const getUsers = () => {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'users.json'), 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};

// Helper: Save Users
const saveUsers = (users) => {
    fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users, null, 2));
};

// Login Route
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const users = getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);

    if (user) {
        res.json({ message: `ACCESS GRANTED! WELCOME ${user.username.toUpperCase()}` });
    } else {
        res.status(401).json({ error: 'ACCESS DENIED: INVALID CREDENTIALS' });
    }
});

// Admin Route: Add New Authorized User/Member
app.post('/api/add-user', (req, res) => {
    const { adminPassword, newUsername, newPassword } = req.body;

    // Secure Admin Authentication
    if (adminPassword !== 'void1234') { 
        return res.status(403).json({ error: 'UNAUTHORIZED: INVALID ADMIN PASSCODE' });
    }

    if (!newUsername || !newPassword) {
        return res.status(400).json({ error: 'USERNAME & PASSWORD REQUIRED' });
    }

    const users = getUsers();
    const exists = users.find(u => u.username.toLowerCase() === newUsername.toLowerCase());

    if (exists) {
        return res.status(400).json({ error: 'USER ALREADY EXISTS' });
    }

    users.push({ username: newUsername, password: newPassword });
    saveUsers(users);

    res.json({ message: `NEW MEMBER [${newUsername.toUpperCase()}] AUTHORIZED SUCCESSFULLY!` });
});

// Socket Connections
io.on('connection', (socket) => {
    console.log('[+] Node Connection Established:', socket.id);

    socket.on('chat-message', (data) => {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        io.emit('chat-message', {
            sender: data.sender,
            message: data.message,
            time: time
        });
    });

    socket.on('disconnect', () => {
        console.log('[-] Connection Closed:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`[+] NEXUS-VOID SECURE NODE RUNNING ON PORT ${PORT}`);
});
