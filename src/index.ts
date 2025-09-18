// Import the Express library, which helps us build the server
import express from 'express';

// Initialize the Express application
const app = express();
// Define the port number our server will run on
const port = 3000;

// This is a "route". It tells the server what to do when someone
// visits the main URL of our API (we call it the "root" or '/')
app.get('/', (req, res) => {
  // We're sending back a simple JSON object as the response
  res.json({ message: "Welcome to the Atlas API! It is alive." });
});

// This command starts the server and makes it listen for incoming requests
// on the port we defined. The message inside will print to your terminal.
app.listen(port, () => {
  console.log(`Atlas server is running at http://localhost:${port}`);
});