const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = require("./app");
const connectDB = require("./config/db");

dotenv.config();
app.get('/', (req, res) => {
  res.send('Server running!');
});

connectDB();

// Pornire server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

