// backend/index.js
const express = require('express');
const cors = require('cors');
const catalogueRoutes = require('./routes/catalogue');
const authRoutes = require('./routes/auth');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Charger les variables d'environnement
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Utiliser le stockage en mémoire avec Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques du dossier 'public' pour d'autres assets, si besoin
app.use('/public', express.static('public'));

// Route racine
app.get('/', (req, res) => {
  res.send('Bienvenue sur le backend Express!');
});

// Exemple de route API
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Bonjour depuis le backend Express!' });
});

app.post('/api/data', (req, res) => {
  const data = req.body;
  res.json({ message: 'Données reçues', data });
});

// Route d'upload d'image vers Cloudinary
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier envoyé' });
    }

    // Uploader l'image avec transformation pour suppression de fond
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        transformation: [{ effect: 'background_removal' }],
        format: 'png' // Utiliser le format PNG pour conserver la transparence
      },
      (error, result) => {
        if (error) {
          console.error("Erreur lors de l'upload de l'image:", error);
          return res.status(500).json({ error: "Erreur lors de l'upload de l'image" });
        }

        // Renvoyer l'URL de l'image avec fond supprimé
        res.json({ imageUrl: result.secure_url });
      }
    ).end(req.file.buffer);

  } catch (error) {
    console.error("Erreur lors de l'upload vers Cloudinary:", error);
    res.status(500).json({ error: "Erreur lors de l'upload de l'image" });
  }
});




// Routes du catalogue
app.use('/api/catalogue', catalogueRoutes);

// Route d'authentification
app.use('/api', authRoutes);

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Backend Express en cours d'exécution sur http://localhost:${PORT}`);
});
