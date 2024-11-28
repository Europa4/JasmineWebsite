const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const readline = require('readline');
const path = require('path');
const csv = require('csv-parser');
const app = express();
const port = 5500;
const session = require('express-session');
const bcrypt = require('bcryptjs');
const ejs = require('ejs');
const sqlite = require("better-sqlite3");

app.set('views', path.join(__dirname, '..', 'views')); // Ensure the correct path to the views folder
app.set('view engine', 'html'); // Use 'html' if you're serving raw HTML files

app.engine('html', ejs.renderFile);  // Use EJS to render HTML files as templates

const SqliteStore = require("better-sqlite3-session-store")(session)
const session_db = new sqlite("sessions.db");
const db = new sqlite('./Data/data.db');

// Create tables if they don't exist
const createTables = () => {
    db.exec(`
        CREATE TABLE IF NOT EXISTS events (
            story_id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT,
            image TEXT,
            placeholder TEXT,
            date TEXT
        );

        CREATE TABLE IF NOT EXISTS fundraisers (
            story_id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT,
            image TEXT,
            placeholder TEXT,
            date TEXT
        );

        CREATE TABLE IF NOT EXISTS wishes (
            story_id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT,
            image TEXT,
            placeholder TEXT,
            date TEXT
        );
    `);
};

createTables();

// Middleware to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Configure session middleware
app.use(session({
    store: new SqliteStore({
        client: session_db, 
        expired: {
          clear: true,
          intervalMs: 900000 //ms = 15min
        }
      }),
    secret: 'your-secret-key', // Change to a secure secret in production
    resave: false,
    saveUninitialized: false
}));

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login'); // Redirect to login if not authenticated
}

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const usersFilePath = './Data/users.json';

    // Read users from the JSON file
    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading users file:', err);
            return res.status(500).send('Server error');
        }

        // Parse the JSON data
        const users = JSON.parse(data);

        // Find the user by username
        const user = users.find(user => user.username === username);

        if (!user) {
            return res.status(400).send('Invalid username or password');
        }

        // Compare the hashed password
        const isMatch = bcrypt.compareSync(password, user.password);

        if (!isMatch) {
            return res.status(400).send('Invalid username or password');
        }

        // Save the user session
        req.session.user = user;
        res.redirect('/admin'); // Redirect to admin after login
    });
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Failed to log out');
        }
        res.redirect('/login'); // Redirect to login after logout
    });
});

app.post('/addUser', (req, res) => {
    const { username, password } = req.body;
    const usersFilePath = './Data/users.json';

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Read the existing users
    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading users file:', err);
            return res.status(500).send('Server error');
        }

        // Parse the JSON data
        const users = JSON.parse(data);

        // Check if the username already exists
        const userExists = users.some(user => user.username === username);

        if (userExists) {
            return res.status(400).send('User already exists');
        }

        // Add the new user
        users.push({ username, password: hashedPassword });

        // Write the updated users back to the JSON file
        fs.writeFile(usersFilePath, JSON.stringify(users, null, 4), (err) => {
            if (err) {
                console.error('Error writing to users file:', err);
                return res.status(500).send('Server error');
            }
            res.send('User added successfully');
        });
    });
});

app.delete('/deleteUser/:username', (req, res) => {
    const { username } = req.params;
    const usersFilePath = './Data/users.json';

    // Read the existing users
    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading users file:', err);
            return res.status(500).send('Server error');
        }

        // Parse the JSON data
        let users = JSON.parse(data);

        // Filter out the user to delete
        users = users.filter(user => user.username !== username);

        // Write the updated users back to the JSON file
        fs.writeFile(usersFilePath, JSON.stringify(users, null, 4), (err) => {
            if (err) {
                console.error('Error writing to users file:', err);
                return res.status(500).send('Server error');
            }
            res.send(`User ${username} deleted successfully`);
        });
    });
});


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
    res.sendFile(path.join(__dirname, '..', 'views', 'JasminesStory.html'));
});

app.get('/wishes', (req, res) => {
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

app.get('/editStory', isAuthenticated, (req, res) => {
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

app.get('/donate', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'donate.html'));
});

app.get('/admin', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'admin.html'));
});

app.get('/stories/:slug', (req, res) => {
    const slug = req.params.slug;
    generatePageHTML('wishes', slug, req, res);
});

app.get('/events/:slug', (req, res) => {
    const slug = req.params.slug;
    generatePageHTML('events', slug, req, res);
});

app.get('/fundraisers/:slug', (req, res) => {
    const slug = req.params.slug;
    generatePageHTML('fundraisers', slug, req, res);
});

function generatePageHTML(table, slug, req, res) {
    // Extract the ID and title from the slug
    const firstUnderscore = slug.indexOf('_');
    const id = parseInt(slug.substring(0, firstUnderscore), 10);
    const givenTitle = slug.substring(firstUnderscore + 1).replace(/_/g, ' ');

    try {
        // Query the database for the specific story
        const row = db.prepare(`
            SELECT title, content, image, placeholder, date, story_id
            FROM ${table}
            WHERE story_id = ?
        `).get(id);

        if (!row) {
            return res.redirect('/404'); // Redirect to 404 if not found
        }

        // Format the date for display
        const formattedDate = row.date.split('-').reverse().join('-');

        // Conditional edit and delete buttons if logged in
        const userControls = (req.session && req.session.user) ? `
            <div class="button-container d-flex gap-2">
                <button class="btn btn-warning" id="edit-btn">Edit</button>
                <button class="btn btn-danger" id="delete-btn">Delete</button>
            </div>
            <script>
                document.getElementById('edit-btn').addEventListener('click', function() {
                    window.location.href = '/editStory/${table}-${id}';
                });
                document.getElementById('delete-btn').addEventListener('click', function() {
                    if (confirm('Are you sure you want to delete this story?')) {
                        window.location.href = '/deleteStory/${table}-${id}';
                    }
                });
            </script>
        ` : '';

        // Build the HTML content
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${row.title} | ${formattedDate}</title>
                    <link rel="icon" href="/Images/favicon.png" type="image/x-icon">
                    <link href="https://cdn.jsdelivr.net/npm/remixicon@2.5.0/fonts/remixicon.css" rel="stylesheet">
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
                    <link rel="stylesheet" href="/css/main.css">
                    <script src="/JS/main.js"></script>
                    <style>
                        .button-container {
                            position: absolute;
                            top: 10px;
                            right: 10px;
                            display: flex;
                            gap: 10px;
                        }
                        @media (max-width: 576px) {
                            .button-container {
                                top: 5px;
                                right: 5px;
                                flex-direction: column;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div id="header-placeholder"></div>
                    <div class="container position-relative mt-4">
                        <div class="element">
                            <div id="main-content" class="text-center">
                                <h1>${row.title} - ${formattedDate}</h1>
                                <div class="d-flex justify-content-center">
                                    <img src="${row.image}" alt="${row.placeholder}" class="img-fluid">
                                </div>
                                <p>${row.content}</p>
                            </div>
                            ${userControls}
                        </div>
                    </div>
                    <br>
                    <div id="footer-placeholder"></div>
                </body>
            </html>
        `;

        // Send the HTML content as the response
        res.send(htmlContent);
    } catch (err) {
        console.error('Error fetching story from database:', err);
        res.status(500).send('Internal Server Error');
    }
}


// Endpoint to handle form submissions with an image
app.post('/addNewStory', upload.single('image'), (req, res) => {
    const title = req.body.title;
    const content = req.body.content;
    const placeholder = req.body.placeholder || ''; // Default to empty if not provided
    const date = req.body.date;
    const type = req.body.type; // Determines which table to insert into

    // If a file was uploaded, use its path
    const imagePath = req.file ? `/Images/${req.file.filename}` : '';

    // Determine the target table based on `type`
    let targetTable = '';
    if (type === 'events') {
        targetTable = 'events';
    } else if (type === 'fundraisers') {
        targetTable = 'fundraisers';
    } else if (type === 'wishes') {
        targetTable = 'wishes';
    } else {
        return res.status(400).json({ success: false, message: 'Invalid type specified' });
    }

    try {
        // Insert the new story into the database
        const stmt = db.prepare(`
            INSERT INTO ${targetTable} (title, content, image, placeholder, date)
            VALUES (?, ?, ?, ?, ?)
        `);

        stmt.run(title, content, imagePath, placeholder, date);

        // Respond to the client with success
        res.json({ success: true, message: 'Story successfully added to the database' });
    } catch (err) {
        console.error('Error inserting story into database:', err);
        res.status(500).json({ success: false, message: 'Failed to add story to the database' });
    }
});

app.get('/editStory/:slug', isAuthenticated, (req, res) => {
    const slug = req.params.slug;

    // Extract file type (table) and story ID from the slug
    const firstDash = slug.indexOf('-');
    const table = slug.substring(0, firstDash); // e.g., 'events', 'fundraisers', 'wishes'
    const storyId = parseInt(slug.substring(firstDash + 1), 10);

    // Validate table type
    const validTables = ['events', 'fundraisers', 'wishes'];
    if (!validTables.includes(table)) {
        return res.status(400).send('Invalid story type');
    }

    // Fetch the story from the database
    try {
        const story = db.prepare(`SELECT * FROM ${table} WHERE story_id = ?`).get(storyId);

        if (!story) {
            return res.redirect('/404'); // Redirect if story not found
        }

        // Sanitize content for rendering in the editor
        const sanitizedContent = sanitizeHtmlForQuill(story.content);

        // Render the edit page with pre-filled data
        res.render('editStory', {
            id: story.story_id,
            title: story.title,
            content: sanitizedContent,
            image: story.image,
            placeholder: story.placeholder,
            date: story.date,
        });
    } catch (err) {
        console.error('Error fetching story from database:', err);
        res.status(500).send('Internal Server Error');
    }
});

function sanitizeHtmlForQuill(html) {
    // Strip tags Quill doesn’t interpret correctly, preserving only formatting tags.
    // Allowed tags: p, br, strong, em, u, ul, ol, li, blockquote, h1-h6
    return html
        .replace(/<(\/?)(div|span|img|table|tr|td|th|html|body|style|script)[^>]*>/gi, '')  // Remove unsupported tags
        .replace(/<\/?[^>]+(>|$)/g, match => {
            return /<\/?(p|br|strong|em|u|ul|ol|li|blockquote|h[1-6])\b/.test(match) ? match : '';
        });
}
app.post('/updateStory', upload.single('image'), (req, res) => {
    const { id, title, content, placeholder, date, changedImage, currentUrl } = req.body;
    let imagePath = '';

    // Extract the table type from the URL
    const match = currentUrl.match(/editStory\/([^ -]+)/);
    const table = match ? match[1] : null;

    const validTables = ['events', 'fundraisers', 'wishes'];
    if (!validTables.includes(table)) {
        return res.status(400).json({ success: false, message: 'Invalid story type' });
    }

    try {
        // Determine the new image path
        if (!req.file) {
            if (changedImage === 'true') {
                // Image was removed
                imagePath = '';
            } else {
                // Keep the existing image path from the database
                const existingStory = db.prepare(`SELECT image FROM ${table} WHERE story_id = ?`).get(id);
                imagePath = existingStory ? existingStory.image : '';
            }
        } else {
            // Use the uploaded file's path
            imagePath = `/Images/${req.file.filename}`;
        }

        // Update the story in the database
        const stmt = db.prepare(`
            UPDATE ${table}
            SET title = ?, content = ?, image = ?, placeholder = ?, date = ?
            WHERE story_id = ?
        `);
        stmt.run(title, content, imagePath, placeholder, date, id);

        // Redirect to the updated story's page
        const storyType = table === 'wishes' ? 'stories' : table; // Adjust "wishes" to "stories" for redirection
        res.redirect(`/${storyType}/${id}_${title.replace(/\s+/g, '_')}`);
    } catch (err) {
        console.error('Error updating story in database:', err);
        res.status(500).json({ success: false, message: 'Error updating the story' });
    }
});

app.get('/deleteStory/:id', (req, res) => {
    if (!req.session.user) {
        return res.status(403).send('Unauthorized');
    }

    // Extract the table name and story ID from the parameter
    const passedData = req.params.id;
    const [table, storyId] = passedData.split('-');

    // Validate the table name
    const validTables = ['events', 'fundraisers', 'wishes'];
    if (!validTables.includes(table)) {
        return res.status(400).json({ success: false, message: 'Invalid story type' });
    }

    try {
        // Delete the row from the database
        const stmt = db.prepare(`DELETE FROM ${table} WHERE story_id = ?`);
        stmt.run(storyId);

        // Redirect to the homepage or another appropriate page
        res.redirect('/' + table);
    } catch (err) {
        console.error('Error deleting story from database:', err);
        res.status(500).json({ success: false, message: 'Failed to delete the story' });
    }
});


function getStoriesFromDatabase(table, maxNumber, res) {
    try {
        // Query the database to get stories, sorted by date (descending)
        const stories = db.prepare(`
            SELECT title, content, image, placeholder, date, story_id AS id
            FROM ${table}
            ORDER BY date ASC
            LIMIT ?
        `).all(maxNumber).reverse();

        res.json({ success: true, data: stories });
    } catch (err) {
        console.error(`Error fetching data from ${table}:`, err);
        res.status(500).json({ success: false, message: 'Failed to fetch stories' });
    }
}

function getStoryDisplayNumber()
{
    const defaultMaxNumber = 5;

    // Fetch preferences if available
    const preferencesPath = './Data/preferences.json';
    let storyMaxNumber = defaultMaxNumber;

    try {
        const preferences = JSON.parse(fs.readFileSync(preferencesPath, 'utf8'));
        storyMaxNumber = preferences.numberOfPostsOnMainPage || defaultMaxNumber;
    } catch (err) {
        console.error('Error reading or parsing preferences file:', err);
    }

    return storyMaxNumber;
}

app.get('/api/getStories', (req, res) => {
    let storyMaxNumber = getStoryDisplayNumber();

    // Fetch stories from the wishes table
    getStoriesFromDatabase('wishes', storyMaxNumber, res);
});

// Endpoint to fetch a limited number of events
app.get('/api/getEvents', (req, res) => {
    const storyMaxNumber = getStoryDisplayNumber();
    getStoriesFromDatabase('events', storyMaxNumber, res);
});

// Endpoint to fetch a limited number of fundraisers
app.get('/api/getFundraisers', (req, res) => {
    const storyMaxNumber = getStoryDisplayNumber();
    getStoriesFromDatabase('fundraisers', storyMaxNumber, res);
});

function fetchAndBuildTree(table, res) {
    try {
        // Query the database for all rows in the table, sorted by date
        const rows = db.prepare(`
            SELECT title, content, image, placeholder, date, story_id AS id
            FROM ${table}
            ORDER BY date DESC
        `).all();

        // Build the tree structure from the rows
        const treeData = buildTreeStructure(rows);

        // Send the response
        res.json(treeData);
    } catch (err) {
        console.error(`Error fetching data from ${table}:`, err);
        res.status(500).json({ success: false, message: 'Failed to fetch and process data' });
    }
}

// Endpoint to fetch story archive tree
app.get('/api/getDataForStoryArchiveTree', (req, res) => {
    fetchAndBuildTree('wishes', res);
});

// Endpoint to fetch events archive tree
app.get('/api/getDataForEventsArchiveTree', (req, res) => {
    fetchAndBuildTree('events', res);
});

// Endpoint to fetch fundraiser archive tree
app.get('/api/getDataForFundraiserArchiveTree', (req, res) => {
    fetchAndBuildTree('fundraisers', res);
});
function buildTreeStructure(data) {
    const tree = [];

    data.forEach((row) => {
        const { title, content, image, placeholder, date, id } = row;
        const [year, month, day] = date.split('-'); // Split YYYY-MM-DD format

        // Check if the year exists
        let yearNode = tree.find((element) => element.year === year);
        if (!yearNode) {
            yearNode = { year, months: [] };
            tree.push(yearNode);
        }

        // Check if the month exists
        let monthNode = yearNode.months.find((element) => element.month === month);
        if (!monthNode) {
            monthNode = { month, days: [] };
            yearNode.months.push(monthNode);
        }

        // Check if the day exists
        let dayNode = monthNode.days.find((element) => element.day === day);
        if (!dayNode) {
            dayNode = { day, events: [] };
            monthNode.days.push(dayNode);
        }

        // Add the event to the correct day node
        dayNode.events.push({ title, id });
    });

    // Sort data within the tree
    tree.forEach((yearNode) => {
        yearNode.months.forEach((monthNode) => {
            monthNode.days.forEach((dayNode) => {
                dayNode.events.sort((a, b) => a.title.localeCompare(b.title)); // Alphabetical order by title
            });

            monthNode.days.sort((a, b) => parseInt(b.day) - parseInt(a.day)); // Numerical descending order
        });

        yearNode.months.sort((a, b) => parseInt(b.month) - parseInt(a.month)); // Numerical descending order
    });

    tree.sort((a, b) => parseInt(b.year) - parseInt(a.year)); // Numerical descending order

    // Convert month numbers to names
    tree.forEach((yearNode) => {
        yearNode.months.forEach((monthNode) => {
            const monthName = new Date(`${yearNode.year}-${monthNode.month}-01`).toLocaleString('default', { month: 'long' });
            monthNode.month = monthName;
        });
    });

    return tree;
}

    // API to retrieve committee members
app.get('/api/getComitteMembers', (req, res) => {
    const filePath = path.join(__dirname, '../Data/committee.json');

    // Read the JSON file
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading committee.json file:', err);
            return res.status(500).json({ success: false, message: 'Failed to read committee members file' });
        }
        
        // Parse and return the JSON data
        try {
            const committeeMembers = JSON.parse(data);
            res.json(committeeMembers);
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            res.status(500).json({ success: false, message: 'Failed to parse committee members file' });
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
