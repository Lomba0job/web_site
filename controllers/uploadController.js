/**
 * @file uploadController.js
 * @description 
 * @author Lombardi Michele 
 * @copyright Nanolever 
 */

// controllers/uploadController.js
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Funzione per caricare i file
exports.uploadFile = (req, res, type) => {
    const upload = getMulterUpload(type);
    upload.single('file')(req, res, (err) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        const version = req.body.version;
        if (!version) {
            // Elimina il file caricato se la versione manca
            fs.unlinkSync(req.file.path);
            return res.status(400).send('La versione è richiesta');
        }

        const newFilename = `${type}_v${version}.zip`;
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
            const versionFilePath = path.join(__dirname, `../uploads/${type}/version.json`);
            let versionInfo = [];
            if (fs.existsSync(versionFilePath)) {
                const data = fs.readFileSync(versionFilePath, 'utf-8');
                versionInfo = data ? JSON.parse(data) : [];
            }

            const newVersion = {
                version: version,
                link: `/downloads/${newFilename}`,
                date: new Date().toISOString()
            };

            versionInfo.push(newVersion);

            fs.writeFileSync(versionFilePath, JSON.stringify(versionInfo, null, 2));

            res.send('File caricato e versione aggiornata');
        });
    });
};

// Funzione per ottenere l'ultima versione
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

// Funzione per ottenere tutte le versioni
exports.getAllVersions = (req, res, type) => {
    const versionFilePath = path.join(__dirname, `../uploads/${type}/version.json`);
    if (!fs.existsSync(versionFilePath)) {
        return res.status(404).json({ message: 'Nessuna versione trovata' });
    }
    const data = fs.readFileSync(versionFilePath, 'utf-8');
    const versionInfo = data ? JSON.parse(data) : [];
    res.json(versionInfo);
};

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