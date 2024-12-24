const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const express = require("express");
const app = express();

const PORT = process.env.PORT || 5000; // Render will set PORT dynamically
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


const upload = multer({ storage: multer.memoryStorage() });

module.exports = async (req, res) => {
    // Ensure POST method
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Method not allowed' });
        return;
    }

    try {
        // Parse the uploaded image
        upload.single('file')(req, {}, async (err) => {
            if (err) {
                res.status(400).json({ error: 'File upload error' });
                return;
            }

            const fileBuffer = req.file.buffer;
            const fileName = req.file.originalname;

            // Process the image
            const metadata = await sharp(fileBuffer).metadata();
            const currentPixels = metadata.width * metadata.height;

            let processedBuffer;
            if (currentPixels < 4_000_000) {
                const scaleFactor = Math.sqrt(4_500_000 / currentPixels);
                const newWidth = Math.round(metadata.width * scaleFactor);
                const newHeight = Math.round(metadata.height * scaleFactor);

                processedBuffer = await sharp(fileBuffer)
                    .resize(newWidth, newHeight)
                    .jpeg({ quality: 99 })
                    .toBuffer();
            } else {
                processedBuffer = fileBuffer; // Return original if no scaling needed
            }

            // Send processed image back
            res.setHeader('Content-Type', 'image/jpeg');
            res.setHeader('Content-Disposition', `attachment; filename="scaled_${fileName}"`);
            res.send(processedBuffer);
        });
    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
