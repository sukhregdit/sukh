const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const usersFile = path.join(__dirname, "../data/users.json");

// Load users data
const loadUsers = () => {
    if (!fs.existsSync(usersFile)) return [];
    return JSON.parse(fs.readFileSync(usersFile, "utf8") || "[]");
};

// Check HWID Authentication
router.post("/check", (req, res) => {
    const { hwid } = req.body;
    if (!hwid) return res.status(400).json({ message: "HWID is required!" });

    let users = loadUsers();
    let user = users.find((u) => u.hwid === hwid);

    if (!user) return res.status(401).json({ message: "Unauthorized HWID" });

    if (user.banned) return res.status(403).json({ message: "HWID is banned!" });

    const expiry = new Date(user.expiry);
    if (expiry < new Date()) return res.status(401).json({ message: "HWID Expired" });

    res.json({ message: "HWID Authenticated", expiry: user.expiry });
});

module.exports = router;
