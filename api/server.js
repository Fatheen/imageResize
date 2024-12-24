const express = require("express");
const uploadHandler = require("./upload");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define the upload route
app.post("/api/upload", uploadHandler);

// Root route for testing
app.get("/", (req, res) => {
    res.send("Backend is running!");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
