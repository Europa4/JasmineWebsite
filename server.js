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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/storyArchive', (req, res) => {
    res.sendFile(path.join(__dirname, 'storyArchive.html'));
});

app.get('/eventsArchive', (req, res) => {
    res.sendFile(path.join(__dirname, 'storyArchive.html'));
});

app.get('/addNewStory', (req, res) => {
    res.sendFile(path.join(__dirname, 'addNewStory.html'));
});

app.get('/JasminesStory', (req, res) => {
    res.sendFile(path.join(__dirname, 'JasminesStory.html'));
});

app.get('/events', (req, res) => {
    res.sendFile(path.join(__dirname, 'events.html'));
});

app.get('/fundraisers', (req, res) => {
    res.sendFile(path.join(__dirname, 'fundraisers.html'));
});

app.get('/trustees', (req, res) => {
    res.sendFile(path.join(__dirname, 'trustees.html'));
});

app.get('/contactUs', (req, res) => {
    res.sendFile(path.join(__dirname, 'contactUs.html'));
});

app.get('/stories/:slug', (req, res) => {
    const slug = req.params.slug;
    generatePageHTML('wishes', slug, res);
});

app.get('/events/:slug', (req, res) => {
    const slug = req.params.slug;
    generatePageHTML('events', slug, res);
});

function generatePageHTML(file, slug, res){
    let firstUnderscore = slug.indexOf('_');
    let id = slug.substring(0, firstUnderscore);
    let givenTitle = slug.substring(firstUnderscore + 1);
    id = parseInt(id);
    givenTitle = givenTitle.replace(/_/g, ' ');
    fs.readFile('./Assets/Data/'+ file + '.csv', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading CSV file', err);
            return res.status(500).json({ success: false, message: 'Failed to read CSV file' });
        }
        const lines = data.split('\n');
        if (id >= lines.length) {
            console.log("Insufficient entires in CSV file");
            return res.redirect('/404');
        }
        const story = lines[id + 1];
        const [title, content, image, placeholder, date] = story.split('|');
        if (givenTitle === title) {
            const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${title} | ${date}</title>
                    <!-- Favicon -->
                    <link rel="icon" href="/Assets/Images/favicon.png" type="image/x-icon">
                    <!-- Remix icons -->
                    <link href="https://cdn.jsdelivr.net/npm/remixicon@2.5.0/fonts/remixicon.css" rel="stylesheet">
                    <!-- CSS Styles -->
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
                    <link rel="stylesheet" href="/Assets/css/main.css">
                    <script src="/Assets/js/main.js"></script>
                </head>
                <body>
                    <div id="header-placeholder"></div>
                    <div class="container">
                        <div class="element">
                            <div id="main-content" class="text-center"> <!-- Center text (title and paragraph) -->
                                <h1>${title} - ${date}</h1>
                                <div class="d-flex justify-content-center"> <!-- Flexbox to center image -->
                                    <img src="${image}" alt="${placeholder}" class="img-fluid"> <!-- Bootstrap img-fluid to make the image responsive -->
                                </div>
                                <p>${content}</p>
                            </div>
                        </div>
                    </div>
                    <br>
                    <div id="footer-placeholder"></div>
                </body>
            </html>
        `;
            return res.send(htmlContent);
        }
        else
        {
            res.redirect('/404');
        }
    });
}

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
            const [title, content, image, placeholder, date, id] = lines[i].split('|');
            stories.push({ title, content, image, placeholder, date, id });
        }
        return res.json({ success: true, data: stories });
    });
});

// Endpoint to handle requesting stories
app.get('/api/getEvents', (req, res) => {
    fs.readFile('./Assets/Data/events.csv', 'utf8', (err, data) => {
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
            const [title, content, image, placeholder, date, id] = lines[i].split('|');
            stories.push({ title, content, image, placeholder, date, id });
        }
        return res.json({ success: true, data: stories });
    });
});

app.get('/api/getDataForStoryArchiveTree', (req, res) => {
    let results = [];
    fs.readFile('./Assets/Data/wishes.csv', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading CSV file', err);
            return res.status(500).json({ success: false, message: 'Failed to read CSV file' });
        }
        let lines = data.split('\n');
        for (let i = 1; i < lines.length; i++) {
            results.push(lines[i])
        }
        const treeData = buildTreeStructure(results);
        res.json(treeData);
    });
});

function buildTreeStructure(data) {
    const tree = {};

    data.forEach((row) => {
        const [title, content, image, placeholder, date, id] = row.split('|');
        const [day, month, year] = date.split('-'); // Split DD-MM-YYYY format

        // Create the year node if it doesn't exist
        if (!tree[day]) {
            tree[day] = {};
        }

        // Get the full month name
        const monthName = new Date(`${year}-${month}-01`).toLocaleString('default', { month: 'long' });

        // Create the month node if it doesn't exist
        if (!tree[day][monthName]) {
            tree[day][monthName] = {};
        }

        // Create the date node if it doesn't exist
        if (!tree[day][monthName][year]) {
            tree[day][monthName][year] = [];
        }

        // Add the title and id to the specific date node
        tree[day][monthName][year].push({ title, id });
    });

    // Sort titles alphabetically for each date and return sorted tree
    return sortTree(tree);
}

// Function to sort the tree by year > month > day
function sortTree(tree) {
    const sortedTree = {};

    const sortedYears = Object.keys(tree).sort((a, b) => a - b);
    sortedYears.forEach(year => {
        sortedTree[year] = {};
        const sortedMonths = Object.keys(tree[year]).sort((a, b) =>
            new Date(`${year}-${new Date(`${a} 1`).getMonth() + 1}-01`) -
            new Date(`${year}-${new Date(`${b} 1`).getMonth() + 1}-01`)
        );
        
        sortedMonths.forEach(month => {
            sortedTree[year][month] = {};

            // Sort days in ascending order
            const sortedDays = Object.keys(tree[year][month]).sort((a, b) => a - b);

            sortedDays.forEach(day => {
                // Alphabetically sort the titles for each day
                sortedTree[year][month][day] = tree[year][month][day].sort((a, b) => a.title.localeCompare(b.title));
            });
        });
    });

    return sortedTree;
}

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
