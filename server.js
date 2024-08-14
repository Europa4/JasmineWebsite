const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 5500;

// Import Popper.js
import { createPopper } from '@popperjs/core';

// Import Bootstrap JS
import 'bootstrap';

// Middleware to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Set up Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './Assets/Images/'); // Save files to images directory
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Use a unique filename
    }
});
const upload = multer({ storage: storage });

// Serve static files from the current directory
app.use(express.static(__dirname));

// Endpoint to handle form submissions
app.post('/addNewStory', (req, res) => {
    const { title, content, placeholderText, date } = req.body;
    const newLine = `\n ${title}|\"${content}\"|\"\"|\"${placeholderText}\"|\"${date}\"`;
    console.log(newLine);
    fs.appendFile('./Assets/Data/wishes.csv', newLine, (err) => {
        if (err) {
            console.error('Error writing to CSV file', err);
            return res.status(500).json({ success: false, message: 'Failed to write to CSV file' });
        }

        const successToast = new bootstrap.Toast(document.getElementById('successToast'));
        successToast.show();

        // Reset form fields to their default states
        document.getElementById('csvForm').reset();
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
