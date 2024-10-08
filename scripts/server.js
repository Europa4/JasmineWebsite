const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 5500;
const session = require('express-session');
const bcrypt = require('bcryptjs');

// Middleware to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Configure session middleware
app.use(session({
    secret: 'your-secret-key', // Change to a secure secret in production
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true when using HTTPS
}));

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login'); // Redirect to login if not authenticated
}

const loginpassword = "$2a$10$kxrLOPodrCsCqVFZqYdmU.sKmQS1jgNDquADtbwbS7HVT9xr6uFoC";
const loginname = "admin";

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // Find the user
    const user = username === loginname
    
    if (!user) {
        return res.status(400).send('Invalid username or password');
    }
    
    // Compare the hashed password
    const isMatch = bcrypt.compareSync(password, loginpassword);
    
    if (!isMatch) {
        return res.status(400).send('Invalid username or password');
    }
    
    // Save user session
    req.session.user = user;
    res.send('Logged in successfully. Would you like to <a href="/addNewStory">add a new story</a> or <a href="/">return to home page</a>?');
});


// Set up Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './Images/'); // Save files to images directory
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Use a unique filename
    }
});
const upload = multer({ storage: storage });

// Serve static files from the above directory
app.use(express.static(path.join(__dirname, '..', 'Assets')));

app.use(bodyParser.json());

app.get('/404', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', '404.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'login.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
});

app.get('/storyArchive', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'storyArchive.html'));
});

app.get('/eventsArchive', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'eventsArchive.html'));
});

app.get('/fundraiserArchive', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'fundraiserArchive.html'));
});

app.get('/addNewStory', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'addNewStory.html'));
});

app.get('/JasminesStory', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'JasminesStory.html'));
});

app.get('/events', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'events.html'));
});

app.get('/fundraisers', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'fundraisers.html'));
});

app.get('/trustees', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'trustees.html'));
});

app.get('/contactUs', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'contactUs.html'));
});

app.get('/stories/:slug', (req, res) => {
    const slug = req.params.slug;
    generatePageHTML('wishes', slug, res);
});

app.get('/events/:slug', (req, res) => {
    const slug = req.params.slug;
    generatePageHTML('events', slug, res);
});

app.get('/fundraisers/:slug', (req, res) => {
    const slug = req.params.slug;
    generatePageHTML('fundraisers', slug, res);
});

function generatePageHTML(file, slug, res){
    let firstUnderscore = slug.indexOf('_');
    let id = slug.substring(0, firstUnderscore);
    let givenTitle = slug.substring(firstUnderscore + 1);
    id = parseInt(id);
    givenTitle = givenTitle.replace(/_/g, ' ');
    fs.readFile('./Data/'+ file + '.csv', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading CSV file', err);
            return res.status(500).json({ success: false, message: 'Failed to read CSV file' });
        }
        const lines = data.split('\n');
        if (id >= lines.length - 1) {
            console.log("Insufficient entires in CSV file");
            return res.redirect('/404');
        }
        let storyIndex = 0;
        for (let i = 1; i < lines.length; i++)
        {
            const [title, content, image, placeholder, date, storyId] = lines[i].split('|');
            if (id === parseInt(storyId))
            {
                storyIndex = i;
                break;
            }
        }
        if(storyIndex === 0)
        {
            return res.redirect('/404');
        }
        const [title, content, image, placeholder, date] = lines[storyIndex].split('|');
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
                    <link rel="icon" href="/Images/favicon.png" type="image/x-icon">
                    <!-- Remix icons -->
                    <link href="https://cdn.jsdelivr.net/npm/remixicon@2.5.0/fonts/remixicon.css" rel="stylesheet">
                    <!-- CSS Styles -->
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
                    <link rel="stylesheet" href="/css/main.css">
                    <script src="/JS/main.js"></script>
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

// Endpoint to handle form submissions with an image
app.post('/addNewStory', upload.single('image'), (req, res) => {
    const Title = req.body.title;
    const Content = req.body.content;
    const Placeholder = req.body.placeholder;
    const Date = req.body.date;
    let id = 0;
    let newLine = '';
    
    // If a file was uploaded, use its path
    const imagePath = req.file ? `./Images/${req.file.filename}` : '';

    // Read the current JSON file
    fs.readFile('../Data/siteData.json', 'utf8', (err, data) => {
        if (!err) {
            // Parse the existing JSON data
            let jsonData = JSON.parse(data);
    
            // Extract the current storyNumber
            id = jsonData.StoryNumber;
    
            // Create the new line (using the current id) and include the image path
            newLine = `\n${Title}|${Content}|${imagePath}|${Placeholder}|${Date}|${id}`;
    
            // Increment the id
            id += 1;
    
            // Update the JSON object with the new id
            jsonData.StoryNumber = id;
    
            // Write the updated JSON object back to the file
            fs.writeFile('../Data/siteData.json', JSON.stringify(jsonData, null, 4), (err) => {
                if (err) {
                    console.error('Error writing updated JSON file', err);
                }
            });
            
            // Append the new line to the CSV file
            fs.appendFile('../Data/wishes.csv', newLine, (err) => {
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
    fs.readFile('./Data/wishes.csv', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading CSV file', err);
            return res.status(500).json({ success: false, message: 'Failed to read CSV file' });
        }

        const lines = data.split('\n');
        const stories = [];
        let storyMaxNumber = 5; //gives default value of 5
        fs.readFile('./Data/preferences.json', 'utf8', (err, pref) => {
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
    fs.readFile('./Data/events.csv', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading CSV file', err);
            return res.status(500).json({ success: false, message: 'Failed to read CSV file' });
        }

        const lines = data.split('\n');
        const stories = [];
        let storyMaxNumber = 5; //gives default value of 5
        fs.readFile('./Data/preferences.json', 'utf8', (err, pref) => {
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
app.get('/api/getFundraisers', (req, res) => {
    fs.readFile('./Data/fundraisers.csv', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading CSV file', err);
            return res.status(500).json({ success: false, message: 'Failed to read CSV file' });
        }

        const lines = data.split('\n');
        const stories = [];
        let storyMaxNumber = 5; //gives default value of 5
        fs.readFile('./Data/preferences.json', 'utf8', (err, pref) => {
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
    fs.readFile('./Data/wishes.csv', 'utf8', (err, data) => {
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

app.get('/api/getDataForEventsArchiveTree', (req, res) => {
    let results = [];
    fs.readFile('./Data/events.csv', 'utf8', (err, data) => {
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

app.get('/api/getDataForFundraiserArchiveTree', (req, res) => {
    let results = [];
    fs.readFile('./Data/fundraisers.csv', 'utf8', (err, data) => {
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
    const tree = [];

    data.forEach((row) => {
        const [title, content, image, placeholder, date, id] = row.split('|');
        const [year, month, day] = date.split('-'); // Split YYYY-MM-DD format
        
        // Ensure ID values are correctly tracked
        let yearID = -1, monthID = -1, dayID = -1;

        // Check if the year exists
        let yearNode = tree.find(element => element.year === year);
        if (!yearNode) {
            yearNode = { year: year, months: [] };
            tree.push(yearNode);
        }
        yearID = tree.indexOf(yearNode);

        // Check if the month exists
        let monthNode = yearNode.months.find(element => element.month === month);
        if (!monthNode) {
            monthNode = { month: month, days: [] };
            yearNode.months.push(monthNode);
        }
        monthID = yearNode.months.indexOf(monthNode);

        // Check if the day exists
        let dayNode = monthNode.days.find(element => element.day === day);
        if (!dayNode) {
            dayNode = { day: day, events: [] };
            monthNode.days.push(dayNode);
        }
        dayID = monthNode.days.indexOf(dayNode);

        // Push the event into the correct day node
        dayNode.events.push({ title: title, id: id });
    });

    // After populating the tree, we will sort the data

    // Sort events by title within each day
    tree.forEach(yearNode => {
        yearNode.months.forEach(monthNode => {
            monthNode.days.forEach(dayNode => {
                dayNode.events.sort((a, b) => a.title.localeCompare(b.title)); // Alphabetical order by title
            });
        });
    });

    // Sort days in decending numerical order
    tree.forEach(yearNode => {
        yearNode.months.forEach(monthNode => {
            monthNode.days.sort((a, b) => parseInt(b.day) - parseInt(a.day));
        });
    });

    // Sort months in decending numerical order
    tree.forEach(yearNode => {
        yearNode.months.sort((a, b) => parseInt(b.month) - parseInt(a.month));
    });

    // Sort years in decending numerical order
    tree.sort((a, b) => parseInt(b.year) - parseInt(a.year));

    tree.forEach(yearNode => {
        yearNode.months.forEach(monthNode => {
            const monthName = new Date(`${yearNode.year}-${monthNode.month}-01`).toLocaleString('default', { month: 'long' });
            monthNode.month = monthName;
        })
    });
    return tree;
}

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
