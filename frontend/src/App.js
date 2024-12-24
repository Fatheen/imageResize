import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; 

function App() {
    const [file, setFile] = useState(null);
    const [processedImages, setProcessedImages] = useState([]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            alert('Please upload a file.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('/api/upload', formData, {
                responseType: 'blob', 
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);

            const img = new Image();
            img.src = url;
            img.onload = () => {
                setProcessedImages((prevImages) => [
                    ...prevImages,
                    {
                        name: file.name,
                        url,
                        width: img.width,
                        height: img.height,
                    },
                ]);
                setFile(null);
            };
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    return (
        <div className="modern-container">
            <h1 className="modern-title">Image Resizer</h1>

            {/* Upload Section */}
            <div className="upload-section">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="custom-file-input"
                />
                <button className="modern-button" onClick={handleUpload} disabled={!file}>
                    Process Image
                </button>
            </div>

            {/* Processed Images Section */}
            <div className="processed-section">
                <h2 className="modern-subtitle">Processed Images</h2>
                {processedImages.length === 0 ? (
                    <p className="no-images-message">No images processed yet.</p>
                ) : (
                    <div className="image-grid">
                        {processedImages.map((image, index) => (
                            <div key={index} className="image-card">
                                <img src={image.url} alt={image.name} className="image-preview" />
                                <div className="image-info">
                                    <p className="image-name">{image.name}</p>
                                    <p className="image-dimensions">
                                        {image.width} x {image.height}
                                    </p>
                                    <a
                                        href={image.url}
                                        download={`scaled_${image.name}`}
                                        className="modern-download-button"
                                    >
                                        Download
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
