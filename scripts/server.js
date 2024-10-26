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
const html2rtf = require('html2rtf');

app.set('views', path.join(__dirname, '..', 'views')); // Ensure the correct path to the views folder
app.set('view engine', 'html'); // Use 'html' if you're serving raw HTML files

app.engine('html', ejs.renderFile);  // Use EJS to render HTML files as templates

// Middleware to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Configure session middleware
app.use(session({
    secret: 'your-secret-key', // Change to a secure secret in production
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } 
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
        res.send('Logged in successfully. Would you like to <a href="/addNewStory">add a new story</a> or <a href="/">return to home page</a>?');
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

function generatePageHTML(file, slug, req, res) {
    let firstUnderscore = slug.indexOf('_');
    let id = slug.substring(0, firstUnderscore);
    let givenTitle = slug.substring(firstUnderscore + 1);
    id = parseInt(id);
    givenTitle = givenTitle.replace(/_/g, ' ');

    const filePath = path.join(__dirname, '../Data/' + file + '.csv');
    
    // Create a file stream and use readline to process the file line by line
    const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity // Recognizes all CR LF (Windows-style) line breaks
    });

    let found = false; // Flag to check if story is found
    let currentLine = 0; // Line counter

    rl.on('line', (line) => {
        currentLine++;
        if (currentLine === 1) return; // Skip the header line

        const [title, content, image, placeholder, date, storyId] = line.split('|');
        if (id === parseInt(storyId)) {
            found = true;
            rl.close(); // Close the readline interface since we found the row
            
            // Reverse the date from YYYY-MM-DD to DD-MM-YYYY
            const formattedDate = date.split('-').reverse().join('-');

            // Conditionally include the "Delete" and "Edit" buttons if the user is logged in
            const editButton = (req.session && req.session.user) ? `
                <button class="btn btn-warning" id="edit-btn" style="position: absolute; top: 10px; right: 100px;">
                    Edit
                </button>
                <script>
                    document.getElementById('edit-btn').addEventListener('click', function() {
                        window.location.href = '/editStory/${file}-${id}'; // Redirect to edit page
                    });
                </script>
            ` : '';

            const deleteButton = (req.session && req.session.user) ? `
                <button class="btn btn-danger" id="delete-btn" style="position: absolute; top: 10px; right: 10px;">
                    Delete
                </button>
                <script>
                    document.getElementById('delete-btn').addEventListener('click', function() {
                        if (confirm('Are you sure you want to delete this story?')) {
                            window.location.href = '/deleteStory/${file}-${id}';
                        }
                    });
                </script>
            ` : '';

            // Generate the HTML response
            const htmlContent = `
                <!DOCTYPE html>
                <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>${title} | ${formattedDate}</title>
                        <link rel="icon" href="/Images/favicon.png" type="image/x-icon">
                        <link href="https://cdn.jsdelivr.net/npm/remixicon@2.5.0/fonts/remixicon.css" rel="stylesheet">
                        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
                        <link rel="stylesheet" href="/css/main.css">
                        <script src="/JS/main.js"></script>
                    </head>
                    <body>
                        <div id="header-placeholder"></div>
                        <div class="container">
                            <div class="element">
                                <div id="main-content" class="text-center">
                                    <h1>${title} - ${formattedDate}</h1>
                                    <div class="d-flex justify-content-center">
                                        <img src="${image}" alt="${placeholder}" class="img-fluid">
                                    </div>
                                    <p>${content}</p>
                                </div>
                                ${deleteButton}${editButton}
                            </div>
                        </div>
                        <br>
                        <div id="footer-placeholder"></div>
                    </body>
                </html>
            `;

            // Send the generated HTML to the client
            res.send(htmlContent);
        }
    });

    rl.on('close', () => {
        if (!found) {
            res.redirect('/404'); // Redirect if the story is not found
        }
    });

    rl.on('error', (err) => {
        console.error('Error reading the file:', err);
        res.status(500).json({ success: false, message: 'Failed to read CSV file' });
    });
}
// Endpoint to handle form submissions with an image
app.post('/addNewStory', upload.single('image'), (req, res) => {
    const Title = req.body.title;
    const Content = req.body.content;
    const Placeholder = req.body.placeholder ? req.body.placeholder : '';
    const Date = req.body.date;
    const Type = req.body.type;
    let id = 0;
    let newLine = '';

    // If a file was uploaded, use its path
    const imagePath = req.file ? `/Images/${req.file.filename}` : '';

    // File paths for site data and CSV
    const siteDataFilePath = path.join(__dirname, '../Data/siteData.json');
    const csvFilePath = path.join(__dirname, '../Data/', Type + '.csv');

    // Stream-based approach for adding a new story

    // Step 1: Read the siteData.json file to get the story ID
    fs.readFile(siteDataFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            return res.status(500).json({ success: false, message: 'Failed to read siteData.json' });
        }

        // Parse the JSON data
        let jsonData;
        try {
            jsonData = JSON.parse(data);
        } catch (parseErr) {
            console.error('Error parsing JSON file:', parseErr);
            return res.status(500).json({ success: false, message: 'Failed to parse JSON' });
        }

        // Extract the current story ID
        id = jsonData.StoryNumber;

        // Create the new line for the CSV file (including the image path)
        newLine = `\n${Title}|${Content}|${imagePath}|${Placeholder}|${Date}|${id}`;

        // Increment the story number and update siteData.json
        id += 1;
        jsonData.StoryNumber = id;

        // Step 2: Update the siteData.json file with the new story number
        fs.writeFile(siteDataFilePath, JSON.stringify(jsonData, null, 4), (writeErr) => {
            if (writeErr) {
                console.error('Error writing updated JSON file:', writeErr);
                return res.status(500).json({ success: false, message: 'Failed to update siteData.json' });
            }

            // Step 3: Append the new story to the appropriate CSV file using streaming
            const csvStream = fs.createWriteStream(csvFilePath, { flags: 'a' }); // 'a' flag to append data
            csvStream.write(newLine, (err) => {
                if (err) {
                    console.error('Error writing to CSV file:', err);
                    return res.status(500).json({ success: false, message: 'Failed to write to CSV file' });
                }

                // Close the stream and respond to the client
                csvStream.end();
                res.json({ success: true, message: 'Successfully added to CSV' });
            });
        });
    });
});

app.get('/editStory/:slug', isAuthenticated, (req, res) => {
    const slug = req.params.slug;
    let firstDash = slug.indexOf('-');
    let file = slug.substring(0, firstDash);
    generateEditPage(file, slug, req, res); // Adjust based on file type
});

function generateEditPage(file, slug, req, res) {
    let firstUnderscore = slug.indexOf('-');
    //let id = slug.substring(0, firstUnderscore);
    let id = slug.substring(firstUnderscore + 1);
    id = parseInt(id);
    //givenTitle = givenTitle.replace(/_/g, ' ');

    const filePath = path.join(__dirname, '../Data/' + file + '.csv');

    const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let found = false; // Add a flag to prevent multiple responses

    rl.on('line', (line) => {
        const [title, content, image, placeholder, date, storyId] = line.split('|');
        if (id === parseInt(storyId) && !found) {
            found = true; // Set the flag to true to avoid multiple responses
            rl.close(); // Close the readline interface since we found the row
            const outputContent = sanitizeHtmlForQuill(content);
            //console.log(RTFcontent)
            // Render the edit page with pre-filled data
            res.render('editStory', {
                id : id,
                title : title,
                content : outputContent,
                image : image,
                placeholder : placeholder,
                date : date,
            });
        }
    });

    rl.on('close', () => {
        if (!found) {
            // Send 404 only if the story was not found
            res.redirect('/404');
        }
    });

    rl.on('error', (err) => {
        console.error('Error reading CSV file:', err);
        res.status(500).send('Internal Server Error');
    });
}

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
    //console.log("content", req.body);
    var { id, title, content, placeholder, date } = req.body;
    var imagePath = '';
    const url = req.body.currentUrl;
    var file = url.match(/editStory\/([^ -]+)/);
    file = file ? file[1] : null;
    const filePath = path.join(__dirname, '../Data/' + file + '.csv');

    try {
        // Read the original file content
        const data = fs.readFileSync(filePath, 'utf8');
        
        // Split the file into lines and modify the target line
        const updatedLines = data.split('\n').map(line => {
            const [oldTitle, oldContent, oldImage, oldPlaceholder, oldDate, storyId] = line.split('|');
            if (parseInt(storyId) === parseInt(id)) {
                // Return the updated line if ID matches
                if(!req.file){
                    if(req.body.changedImage === 'true'){
                        imagePath = '';
                        placeholder = '';
                    } else {
                        imagePath = oldImage;
                    }
                } else {
                    imagePath = req.file ? `/Images/${req.file.filename}` : '';
                }
                return `${title}|${content}|${imagePath}|${placeholder}|${date}|${storyId}`;
            }
            return line; // Return the original line if no match
        });

        // Rewrite the entire file with updated lines
        fs.writeFileSync(filePath, updatedLines.join('\n'), 'utf8');
        
        res.redirect('/' + file + `/${id}_${title.replace(/\s+/g, '_')}`);
        
    } catch (err) {
        console.error('Error processing file:', err);
        res.status(500).json({ success: false, message: 'Error updating the file' });
    }
});

app.get('/deleteStory/:id', (req, res) => {
    if (!req.session.user) {
        return res.status(403).send('Unauthorized');
    }

    const passedData = req.params.id;
    const [file, storyId] = passedData.split('-');
    const filePath = path.join(__dirname, '..', 'Data', file + '.csv');
    deleteRowById(filePath, storyId);

    res.redirect('/');  // Redirect to homepage or another page after deletion
});

function deleteRowById(filePath, idToDelete) {
    const tempFilePath = path.join(__dirname, 'temp.csv');
    
    // Create a write stream for the temporary file
    const writeStream = fs.createWriteStream(tempFilePath);
    writeStream.write('Title|Content|Image|Placeholder|Date|ID'); // Write the header row
    // Read the original CSV file as a stream and process it line by line
    fs.createReadStream(filePath)
        .pipe(csv({ separator: '|' }))  // Adjust the separator if needed
        .on('data', (row) => {
            const currentID = row.ID; // Assume 'ID' is the header of the ID column
            if (currentID !== idToDelete.toString()) {
                // Write the row to the temp file if it doesn't match the idToDelete
                writeStream.write('\n' + Object.values(row).join('|'));
            }
        })
        .on('end', () => {
            // When reading is finished, close the write stream
            writeStream.end();
            // Replace the original CSV file with the temporary file
            fs.rename(tempFilePath, filePath, (err) => {
                if (err) throw err;
            });
        })
        .on('error', (err) => {
            console.error('Error reading or processing CSV file:', err);
            writeStream.end(); // Ensure the write stream is closed on error
        });
}


function readCsvAndSendResponse(csvFilePath, res) {
    const stories = [];
    const preferencesPath = './Data/preferences.json'
    let storyMaxNumber = 5; // Default value

    // Step 1: Read preferences.json to get the max number of stories
    fs.readFile(preferencesPath, 'utf8', (err, prefData) => {
        if (!err) {
            try {
                const preferences = JSON.parse(prefData);
                storyMaxNumber = preferences.numberOfPostsOnMainPage || storyMaxNumber;
            } catch (err) {
                console.error('Error parsing preferences file:', err);
            }
        } else {
            console.error('Error reading preferences file:', err);
        }

        // Step 2: Stream the CSV file line by line
        const csvStream = fs.createReadStream(csvFilePath, { encoding: 'utf8' });
        const rl = readline.createInterface({
            input: csvStream,
            crlfDelay: Infinity, // Handle different line endings
        });

        let lineNumber = 0;

        rl.on('line', (line) => {
            lineNumber++;
            if (lineNumber === 1) return; // Skip the header line

            const [title, content, image, placeholder, date, id] = line.split('|');
            stories.push({ title, content, image, placeholder, date, id });

            // Stop reading if we hit the max story number
            if (stories.length >= storyMaxNumber) {
                rl.close();
            }
        });

        rl.on('close', () => {
            return res.json({ success: true, data: stories });
        });

        rl.on('error', (error) => {
            console.error('Error reading CSV file:', error);
            return res.status(500).json({ success: false, message: 'Failed to read CSV file' });
        });
    });
}

// Refactored /api/getStories endpoint
app.get('/api/getStories', (req, res) => {
    const csvFilePath = './Data/wishes.csv'
    readCsvAndSendResponse(csvFilePath, res);
});

// Refactored /api/getEvents endpoint
app.get('/api/getEvents', (req, res) => {
    const csvFilePath = './Data/events.csv'
    readCsvAndSendResponse(csvFilePath, res);
});

// Refactored /api/getFundraisers endpoint
app.get('/api/getFundraisers', (req, res) => {
    const csvFilePath = './Data/fundraisers.csv'
    readCsvAndSendResponse(csvFilePath, res);
});

// Utility function to stream CSV, build the tree structure, and send the response
function streamCsvAndBuildTree(csvFilePath, res, buildTreeStructure) {
    const results = [];

    // Step 1: Stream the CSV file line by line
    const csvStream = fs.createReadStream(csvFilePath, { encoding: 'utf8' });
    const rl = readline.createInterface({
        input: csvStream,
        crlfDelay: Infinity, // Handle different line endings
    });

    let lineNumber = 0;

    rl.on('line', (line) => {
        lineNumber++;
        if (lineNumber === 1) return; // Skip the header line

        // Add each line to the results array (without the header)
        results.push(line);
    });

    rl.on('close', () => {
        // Step 2: After reading all the lines, build the tree structure
        const treeData = buildTreeStructure(results);
        return res.json(treeData);
    });

    rl.on('error', (error) => {
        console.error('Error reading CSV file:', error);
        return res.status(500).json({ success: false, message: 'Failed to read CSV file' });
    });
}

// Refactored /api/getDataForStoryArchiveTree endpoint
app.get('/api/getDataForStoryArchiveTree', (req, res) => {
    const csvFilePath = './Data/wishes.csv'
    streamCsvAndBuildTree(csvFilePath, res, buildTreeStructure);
});

// Refactored /api/getDataForEventsArchiveTree endpoint
app.get('/api/getDataForEventsArchiveTree', (req, res) => {
    const csvFilePath = './Data/events.csv'
    streamCsvAndBuildTree(csvFilePath, res, buildTreeStructure);
});

// Refactored /api/getDataForFundraiserArchiveTree endpoint
app.get('/api/getDataForFundraiserArchiveTree', (req, res) => {
    const csvFilePath = './Data/fundraisers.csv'
    streamCsvAndBuildTree(csvFilePath, res, buildTreeStructure);
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
