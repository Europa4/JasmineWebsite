const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 5500;

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

app.use(bodyParser.json());

// Endpoint to handle form submissions
app.post('/addNewStory', upload.none(), (req, res) => {
    const Title = req.body.title;
    const Content = req.body.content;
    const Placeholder = req.body.placeholder;
    const Date = req.body.date;
    let id = 0;
    let newLine = '';

    // Read the current JSON file
    fs.readFile('./Assets/Data/siteData.json', 'utf8', (err, data) => {
        if (!err) {
            // Parse the existing JSON data
            let jsonData = JSON.parse(data);
    
            // Extract the current storyNumber
            id = jsonData.StoryNumber;
    
            // Create the new line (using the current id)
            newLine = `\n ${Title}|${Content}||${Placeholder}|${Date}|${id}`;
    
            // Increment the id
            id += 1;
    
            // Update the JSON object with the new id
            jsonData.StoryNumber = id;
    
            // Write the updated JSON object back to the file
            fs.writeFile('./Assets/Data/siteData.json', JSON.stringify(jsonData, null, 4), (err) => {
                if (err) {
                    console.error('Error writing updated JSON file', err);
                }
            });
            fs.appendFile('./Assets/Data/wishes.csv', newLine, (err) => {
                if (err) {
                    console.error('Error writing to CSV file', err);
                    return res.status(500).json({ success: false, message: 'Failed to write to CSV file' });
                }
                return res.json({ success: true, message: 'Successfully added to CSV' });
            });
        } else {
            console.error('Error reading JSON file', err);
        }
    });
});

// Endpoint to handle requesting stories
app.get('/api/getStories', (req, res) => {
    fs.readFile('./Assets/Data/wishes.csv', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading CSV file', err);
            return res.status(500).json({ success: false, message: 'Failed to read CSV file' });
        }

        const lines = data.split('\n');
        const stories = [];
        let storyMaxNumber = 5; //gives default value of 5
        fs.readFile('./Assets/preferences.json', 'utf8', (err, pref) => {
            if(!err)
                {
                    storyMaxNumber = pref.numberOfPostsOnMainPage;
                }
            else
                {
                    console.error('Error reading preference file', err);
                }
        });
        const storyNumber = Math.max(lines.length, storyMaxNumber);
        for (let i = 1; i < lines.length; i++) {
            const [title, content, image, placeholder, date] = lines[i].split('|');
            stories.push({ title, content, image, placeholder, date });
        }
        return res.json({ success: true, data: stories });
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
