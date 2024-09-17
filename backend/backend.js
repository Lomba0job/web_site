const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();


// Middleware to parse form data (important for parsing non-file fields like 'version')
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Parses incoming JSON requests

// Serve static files (HTML, CSS, JS, etc.)
app.use(express.static(path.join(__dirname, '../'))); // Serving all static assets from the parent directory

// Setup storage for file uploads, each file gets a unique name with version number
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        // Save the file with a temporary unique name
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 104857600 } // Optional: File size limit (100MB)
});

// Load version info from version.json
let versionInfo = [];
const versionFilePath = path.join(__dirname, 'version.json');

// Function to load the version.json file
function loadVersionInfo() {
    try {
        // Check if version.json exists
        if (fs.existsSync(versionFilePath)) {
            const data = fs.readFileSync(versionFilePath, 'utf-8');

            // Handle empty or malformed version.json
            if (data.trim() === '') {
                console.log('version.json is empty. Initializing as an empty array.');
                versionInfo = [];
            } else {
                versionInfo = JSON.parse(data);
            }

            // Ensure versionInfo is an array
            if (!Array.isArray(versionInfo)) {
                console.log('version.json does not contain an array. Reinitializing.');
                versionInfo = [];
            }
        } else {
            // If version.json doesn't exist, initialize it as an empty array
            console.log('version.json not found, initializing as a new array.');
            versionInfo = [];
            fs.writeFileSync(versionFilePath, JSON.stringify(versionInfo, null, 2)); // Create the file with an empty array
        }
    } catch (error) {
        console.log('Error loading version.json:', error);
        versionInfo = []; // In case of error, ensure versionInfo is initialized as an array

        // Optionally, overwrite the file with an empty array if it's corrupted
        fs.writeFileSync(versionFilePath, JSON.stringify(versionInfo, null, 2));
    }
}

// Call the function to load version information at server start
loadVersionInfo();
app.post('/upload', upload.single('file'), (req, res) => {
    const version = req.body.version;
    if (!version) {
        // Delete the uploaded file if version is missing
        fs.unlinkSync(req.file.path);
        return res.status(400).send('Version is required');
    }

    const newFilename = `software_v${version}.zip`;
    const newPath = path.join(req.file.destination, newFilename);

    // Check if file with the same version already exists
    if (fs.existsSync(newPath)) {
        // Delete the uploaded file to prevent accumulation of unused files
        fs.unlinkSync(req.file.path);
        return res.status(400).send('File with this version already exists. Please use a new version number.');
    }

    // Rename the file
    fs.rename(req.file.path, newPath, (err) => {
        if (err) {
            console.error('Error renaming file:', err);
            return res.status(500).send('Error processing file');
        }

        // Update versionInfo and write to version.json
        const newVersion = {
            version: version,
            link: `/downloads/${newFilename}`,
            date: new Date().toISOString()
        };

        versionInfo.push(newVersion);
        console.log('Updated versionInfo array:', versionInfo);

        // Write to version.json using absolute path
        try {
            console.log('Attempting to write to version.json...');
            fs.writeFileSync(versionFilePath, JSON.stringify(versionInfo, null, 2));
            console.log('Successfully wrote to version.json');
        } catch (writeError) {
            console.error('Error writing to version.json:', writeError);
            return res.status(500).send('Error saving version information');
        }

        res.send('File uploaded and version updated');
    });
});

// Endpoint to get the latest version
app.get('/version', (req, res) => {
    if (versionInfo.length === 0) {
        res.status(404).json({ message: 'No versions found' });
    } else {
        const latestVersion = versionInfo[versionInfo.length - 1];
        res.json(latestVersion);
    }
});

// Endpoint to get all versions
app.get('/all-versions', (req, res) => {
    res.json(versionInfo);
});

// Serve uploaded files
app.use('/downloads', express.static(path.join(__dirname, 'uploads')));

// Leggi i certificati SSL
const sslOptions = {
    key: fs.readFileSync('/home/lmb/ssl/privkey.pem'),
    cert: fs.readFileSync('/home/lmb/ssl/fullchain.pem')
  };
  
  // Avvia il server HTTPS sulla porta 443
  https.createServer(sslOptions, app).listen(443, () => {
    console.log('Server HTTPS in ascolto sulla porta 443');
  });
  
  // Server HTTP che reindirizza a HTTPS
  http.createServer((req, res) => {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
  }).listen(80, () => {
    console.log('Server HTTP in ascolto sulla porta 80 e reindirizza a HTTPS');
  });