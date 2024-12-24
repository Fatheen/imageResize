// server.js
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });
const cors = require('cors');


app.use(cors({
    origin: 'http://localhost:3000'
}));

app.post('/api/upload', upload.single('file'), async (req, res) => {
    const file = req.file;

    try {
      
        console.log('Uploaded file is a single image.');
        const processedImage = await processImage(file.path);

        if (processedImage) {
            console.log(`Processed image: ${processedImage}`);
            res.download(processedImage, 'processed_image.jpg', (err) => {
                if (err) {
                    console.error('Error sending processed image:', err);
                    res.status(500).send('Error sending processed image');
                }
                
                safeDelete(processedImage);
            });
        } else {
            console.log(`Image does not require processing, sending original: ${file.path}`);
            res.download(file.path, 'original_image.jpg', (err) => {
                if (err) {
                    console.error('Error sending original image:', err);
                    res.status(500).send('Error sending original image');
                }
                
                safeDelete(file.path);
            });
        }
    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).send('Internal Server Error');
    }
});



const ensureTempDirExists = () => {
    const tempDir = './temp';
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
        console.log('Created temp directory.');
    }
};

const processImage = async (filePath) => {
    try {
        const metadata = await sharp(filePath).metadata();
        console.log(`Processing file: ${filePath}`);
        console.log(`Current dimensions: ${metadata.width}x${metadata.height}`);

        const currentPixels = metadata.width * metadata.height;

        if (currentPixels < 4_000_000) {
            const scaleFactor = Math.sqrt(4_500_000 / currentPixels);
            const newWidth = Math.round(metadata.width * scaleFactor);
            const newHeight = Math.round(metadata.height * scaleFactor);

            const outputPath = `scaled_${path.basename(filePath, path.extname(filePath))}.jpg`;
            console.log(`Scaling image to: ${newWidth}x${newHeight}, output: ${outputPath}`);
            await sharp(filePath)
                .resize(newWidth, newHeight)
                .jpeg({ quality: 99 }) 
                .toFile(outputPath);
            return outputPath;
        } else {
            console.log(`Image ${filePath} already has sufficient resolution. Keeping original.`);
            return filePath;
        }
    } catch (error) {
        console.error(`Error processing image ${filePath}:`, error);
        return null;
    }
    return null; 
};

const safeDelete = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Deleted file: ${filePath}`);
        }
    } catch (error) {
        console.error(`Error deleting file ${filePath}:`, error);
    }
};



app.listen(5000, () => {
    console.log('Server started on http://localhost:5000');
});
