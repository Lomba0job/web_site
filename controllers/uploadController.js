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
    const upload = getMulterUpload(type).single('file');

    upload(req, res, (err) => {
        if (err) {
            console.error('Errore durante upload:', err);
            return res.status(500).send('Errore durante upload del file');
        }

        // Verifica che il file e la versione siano presenti
        if (!req.file || !req.body.version) {
            return res.status(400).send('File o versione mancante');
        }

        const version = req.body.version;
        const originalName = req.file.originalname;
        const newFilename = `${type}_v${version}${path.extname(originalName)}`;
        const newPath = path.join(req.file.destination, newFilename);

        // Controlla se il file con la stessa versione esiste già
        if (fs.existsSync(newPath)) {
            fs.unlinkSync(req.file.path);
            return res.status(400).send('Una versione con questo numero esiste già. Usa un nuovo numero di versione.');
        }

        // Rinomina il file
        fs.rename(req.file.path, newPath, (err) => {
            if (err) {
                console.error('Errore durante la rinomina del file:', err);
                return res.status(500).send('Errore durante il processamento del file');
            }
        
            // Aggiorna version.json
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
                } else {
                    res.send('File caricato e versione aggiornata');
                }
            });
        });
    });
};

exports.getLatestVersion = (req, res, type) => {
    console.log(`Fetching last versions for: ${type}`);  // Log aggiunto
    const versionFilePath = path.join(__dirname, `../uploads/${type}/version.json`);
    if (!fs.existsSync(versionFilePath)) {
        console.log(`No version.json file found for ${type}`);  // Log aggiunto
        return res.status(404).json({ message: 'Nessuna versione trovata' });
    }
    const data = fs.readFileSync(versionFilePath, 'utf-8');
    const versionInfo = data ? JSON.parse(data) : [];
    if (versionInfo.length === 0) {
        console.log(`vuoto per ${type}`);  // Log aggiunto
        res.status(404).json({ message: 'Nessuna versione trovata' });
    } else {
        const latestVersion = versionInfo[versionInfo.length - 1];
        console.log(`Version  for ${type}:`, latestVersion);  // Log aggiunto
        res.json(latestVersion);
    }
};

exports.getAllVersions = (req, res, type) => {
    console.log(`Fetching all versions for: ${type}`);  // Log aggiunto
    const versionFilePath = path.join(__dirname, `../uploads/${type}/version.json`);
    if (!fs.existsSync(versionFilePath)) {
        console.log(`No version.json file found for ${type}`);  // Log aggiunto
        return res.status(404).json({ message: 'Nessuna versione trovata' });
    }
    const data = fs.readFileSync(versionFilePath, 'utf-8');
    const versionInfo = data ? JSON.parse(data) : [];
    console.log(`Version data for ${type}:`, versionInfo);  // Log aggiunto
    res.json(versionInfo);
};
