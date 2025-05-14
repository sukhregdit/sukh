const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const usersFile = path.join(__dirname, "../data/users.json");

// Dummy admin credentials
const ADMIN_USERNAME = "nexx";
const ADMIN_PASSWORD = "4";

const loadUsers = () => {
    if (!fs.existsSync(usersFile)) {
        console.log("users.json file does not exist, creating a new one.");
        fs.writeFileSync(usersFile, JSON.stringify([]));  // Create file if it doesn't exist
        return [];
    }
    console.log("Loading users from users.json");
    return JSON.parse(fs.readFileSync(usersFile, "utf8") || "[]");
};

const saveUsers = (users) => {
    console.log("Saving users to users.json", users);
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
};

const requireAuth = (req, res, next) => {
    if (!req.session.admin) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    next();
};

router.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        req.session.admin = true;
        return res.json({ message: "Login successful!" });
    }
    res.status(401).json({ message: "Invalid credentials!" });
});

router.post("/logout", (req, res) => {
    req.session.destroy();
    res.json({ message: "Logged out successfully!" });
});

router.use(requireAuth);

router.get("/users", (req, res) => {
    res.json(loadUsers());
});

router.post("/add", (req, res) => {
    const { name, hwid, days } = req.body;
    if (!name || !hwid || !days) return res.json({ message: "Name, HWID, and days are required!" });

    let users = loadUsers();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    let userIndex = users.findIndex((user) => user.hwid === hwid);
    if (userIndex !== -1) {
        users[userIndex].name = name;
        users[userIndex].expiry = expiryDate;
        users[userIndex].banned = false;
    } else {
        users.push({ name, hwid, expiry: expiryDate, banned: false });
    }

    saveUsers(users);
    res.json({ message: "User added/updated successfully!" });
});

router.post("/ban", (req, res) => {
    const { hwid } = req.body;
    if (!hwid) return res.json({ message: "HWID is required!" });

    let users = loadUsers();
    let userIndex = users.findIndex((user) => user.hwid === hwid);

    if (userIndex === -1) return res.json({ message: "User not found!" });

    users[userIndex].banned = true;
    saveUsers(users);
    res.json({ message: "User banned successfully!" });
});

router.post("/unban", (req, res) => {
    const { hwid } = req.body;
    if (!hwid) return res.json({ message: "HWID is required!" });

    let users = loadUsers();
    let userIndex = users.findIndex((user) => user.hwid === hwid);

    if (userIndex === -1) return res.json({ message: "User not found!" });

    users[userIndex].banned = false;
    saveUsers(users);
    res.json({ message: "User unbanned successfully!" });
});

module.exports = router;
