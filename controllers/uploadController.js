/**
 * @file uploadController.js
 * @description 
 * @author Lombardi Michele 
 * @copyright Nanolever 
 */
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Funzione per configurare Multer per ogni tipo
function getMulterUpload(type) {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            const dir = path.join(__dirname, `../uploads/${type}`);
            fs.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        },
        filename: (req, file, cb) => {
            // Nome temporaneo
            cb(null, Date.now() + path.extname(file.originalname));
        }
    });

    return multer({
        storage,
        limits: { fileSize: 104857600 } // 100MB
    });
}

exports.uploadFile = (req, res, type) => {
    console.log("Entering uploadFile function");  // Log per verificare l'ingresso nella funzione
    const upload = getMulterUpload(type).single('file');

    upload(req, res, (err) => {
        if (err) {
            console.error('Errore durante l\'upload:', err);
            return res.status(500).send('Errore durante l\'upload del file');
        }

        console.log('File uploaded:', req.file);  // Log dopo il caricamento del file

        if (!req.file || !req.body.version) {
            console.log('File or version is missing');
            return res.status(400).send('File o versione mancante');
        }

        const version = req.body.version;
        const originalName = req.file.originalname;
        const newFilename = `${type}_v${version}${path.extname(originalName)}`;
        const newPath = path.join(req.file.destination, newFilename);

        if (fs.existsSync(newPath)) {
            console.log(`Version already exists: ${newPath}`);
            fs.unlinkSync(req.file.path);
            return res.status(400).send('Una versione con questo numero esiste già. Usa un nuovo numero di versione.');
        }

        fs.rename(req.file.path, newPath, (err) => {
            if (err) {
                console.error('Errore durante la rinomina del file:', err);
                return res.status(500).send('Errore durante il processamento del file');
            }

            console.log('File renamed successfully');

            const versionFilePath = path.join(req.file.destination, 'version.json');
            let versionInfo = [];
            if (fs.existsSync(versionFilePath)) {
                const data = fs.readFileSync(versionFilePath, 'utf-8');
                versionInfo = data ? JSON.parse(data) : [];
            }

            const newVersion = {
                version: version,
                link: `/uploads/${type}/${newFilename}`,
                date: new Date().toISOString()
            };

            versionInfo.push(newVersion);

            fs.writeFile(versionFilePath, JSON.stringify(versionInfo, null, 2), (writeErr) => {
                if (writeErr) {
                    console.error('Errore durante la scrittura di version.json:', writeErr);
                    return res.status(500).send('Errore durante la scrittura del file version.json');
                }

                console.log('Version updated:', version);
                res.send('File caricato e versione aggiornata');
            });
        });
    });
};

exports.getLatestVersion = (req, res, type) => {
    const versionFilePath = path.join(__dirname, `../uploads/${type}/version.json`);
    if (!fs.existsSync(versionFilePath)) {
        return res.status(404).json({ message: 'Nessuna versione trovata' });
    }
    const data = fs.readFileSync(versionFilePath, 'utf-8');
    const versionInfo = data ? JSON.parse(data) : [];
    if (versionInfo.length === 0) {
        res.status(404).json({ message: 'Nessuna versione trovata' });
    } else {
        const latestVersion = versionInfo[versionInfo.length - 1];
        res.json(latestVersion);
    }
};

exports.getAllVersions = (req, res, type) => {
    const versionFilePath = path.join(__dirname, `../uploads/${type}/version.json`);
    if (!fs.existsSync(versionFilePath)) {
        return res.status(404).json({ message: 'Nessuna versione trovata' });
    }
    const data = fs.readFileSync(versionFilePath, 'utf-8');
    const versionInfo = data ? JSON.parse(data) : [];
    res.json(versionInfo);
};
