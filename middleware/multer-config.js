const multer = require('multer');
const SharpMulter = require('sharp-multer');

// const MIME_TYPES = {
//   'image/jpg': 'jpg',
//   'image/jpeg': 'jpg',
//   'image/png': 'png'
// };

// create file name
const newFileName = (originalname, options) => {
    const name = originalname.split('.').slice(0, -1).join('.') +
    "-" + Date.now() +
    "." + options.fileFormat;
    return name;
  };

// where to store the documents
const storage = SharpMulter ({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  // sharp option to convert images into lower quality
  imageOptions:{
    fileFormat:"webp",
    resize: { width: 412, height: 520 },
    quality: 80,
  },
  filename: newFileName,
});


module.exports = multer({ storage }).single('image');