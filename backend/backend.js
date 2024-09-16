const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();

// Setup storage for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, 'software.zip'); // Store the latest version as a fixed name
    }
});

const upload = multer({ storage });

// Serve the version info (you can use a database for this as well)
let versionInfo = {
    version: "2.5.2", // Initial version
    link: "/downloads/software.zip"
};

// Endpoint to upload a new version
app.post('/upload', upload.single('file'), (req, res) => {
    // Update version info
    versionInfo.version = req.body.version;
    versionInfo.link = `/downloads/software.zip`;
    
    // Save the updated version info
    fs.writeFileSync('./version.json', JSON.stringify(versionInfo, null, 2));
    
    res.send('File uploaded and version updated');
});

// Endpoint to serve the download link and version number to the front end
app.get('/version', (req, res) => {
    res.json(versionInfo);
});

// Serve uploaded files
app.use('/downloads', express.static(path.join(__dirname, 'uploads')));

// Start the server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
