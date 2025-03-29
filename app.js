const express = require("express");
const path = require("path");
const cors = require("cors");
const session = require("express-session");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use(
    session({
        secret: "3d8c4b1f89a74e9c52f58f69e90a6b3d23f64b32c7a889e4cb9f2d86c7e4a2b3",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }, // Secure should be true in production with HTTPS
    })
);

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));

// Serve admin panel
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
