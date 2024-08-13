const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Configuración de CORS
app.use(cors({
  origin: 'http://localhost:4200'  // Permitir solicitudes desde el frontend Angular
}));

// Configuración de multer para manejar archivos
const storageImages = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'src', 'images'));  // Directorio para imágenes
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);  // Usar el nombre original del archivo
  }
});

const storageVideos = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'src', 'videos'));  // Directorio para videos
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);  // Usar el nombre original del archivo
  }
});

const uploadImages = multer({ storage: storageImages });
const uploadVideos = multer({ storage: storageVideos });

// Middleware para parsear el cuerpo de las solicitudes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos desde el directorio 'src/videos' para videos
app.use('/videos', express.static(path.join(__dirname, 'src', 'videos')));

// Ruta para obtener la lista de videos
app.get('/api/videos', (req, res) => {
  fs.readdir(path.join(__dirname, 'src', 'videos'), (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error al leer el directorio de videos' });
    }
    // Filtrar solo archivos de video y devolver la lista en JSON
    const videoFiles = files.filter(file => /\.(mp4|avi|mov)$/i.test(file));
    res.json(videoFiles);
  });
});

// Ruta para agregar un video
app.post('/api/videos', uploadVideos.single('video'), (req, res) => {
  if (req.file) {
    res.json({ filename: req.file.filename });
  } else {
    res.status(400).json({ error: 'El archivo es requerido' });
  }
});

// Ruta para eliminar un video
app.delete('/api/videos/:filename', (req, res) => {
  const filename = req.params.filename;
  fs.unlink(path.join(__dirname, 'src', 'videos', filename), (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error al eliminar el video' });
    }
    res.json({ filename });
  });
});

// Servir archivos estáticos desde el directorio 'src/images' para imágenes
app.use('/images', express.static(path.join(__dirname, 'src', 'images')));

// Ruta para obtener la lista de imágenes
app.get('/api/images', (req, res) => {
  fs.readdir(path.join(__dirname, 'src', 'images'), (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error al leer el directorio de imágenes' });
    }
    // Filtrar solo archivos de imagen y devolver la lista en JSON
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
    res.json(imageFiles);
  });
});

// Ruta para agregar una imagen
app.post('/api/images', uploadImages.single('image'), (req, res) => {
  if (req.file) {
    res.json({ filename: req.file.filename });
  } else {
    res.status(400).json({ error: 'El archivo es requerido' });
  }
});

// Ruta para eliminar una imagen
app.delete('/api/images/:filename', (req, res) => {
  const filename = req.params.filename;
  fs.unlink(path.join(__dirname, 'src', 'images', filename), (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error al eliminar la imagen' });
    }
    res.json({ filename });
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
