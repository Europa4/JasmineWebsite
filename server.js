const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 5500;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the current directory
app.use(express.static(__dirname));

// Define a route to serve the index.html file as a fallback for other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint to handle form submissions
app.post('/add-to-csv', (req, res) => {
    const { name, age, city } = req.body;
    const newLine = `${name},${age},${city}\n`;

    fs.appendFile('path/to/your/file.csv', newLine, (err) => {
        if (err) {
            console.error('Error writing to CSV file', err);
            return res.status(500).json({ success: false, message: 'Failed to write to CSV file' });
        }

        res.json({ success: true, message: 'Successfully added to CSV' });
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
