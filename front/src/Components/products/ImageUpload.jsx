import React, { useState, useRef, useCallback } from "react";
import { apiUrl } from "../../api";
import "./ImageUpload.css";

const ImageUpload = ({ images = [], onChange, maxImages = 5 }) => {
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [urlInput, setUrlInput] = useState("");
    const [showUrlInput, setShowUrlInput] = useState(false);
    const fileInputRef = useRef(null);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    }, []);

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    const handleFiles = async (files) => {
        const fileArray = Array.from(files);
        const validFiles = fileArray.filter(file => 
            file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
        );

        if (validFiles.length === 0) {
            alert('Please select valid image files (JPEG, PNG, etc.) under 5MB');
            return;
        }

        setUploading(true);
        
        try {
            // Upload files to server
            const formData = new FormData();
            validFiles.forEach(file => {
                formData.append('images', file);
            });

            const response = await fetch(apiUrl("/upload/images"), {
                method: "POST",
                credentials: "include",
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Upload failed");
            }

            const result = await response.json();
            
            // Create image objects with server URLs
            const newImages = result.images.map((url, index) => ({
                url: apiUrl(url),
                base64: null,
                name: validFiles[index].name,
                size: validFiles[index].size,
                type: validFiles[index].type
            }));
            
            onChange([...images, ...newImages]);
        } catch (error) {
            console.error('Error uploading files:', error);
            alert('Error uploading images: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const handleUrlAdd = () => {
        if (!urlInput.trim()) return;
        
        // Basic URL validation
        try {
            new URL(urlInput);
            const newImage = {
                url: urlInput,
                base64: null,
                name: 'URL Image',
                isUrl: true
            };
            
            onChange([...images, newImage]);
            setUrlInput("");
            setShowUrlInput(false);
        } catch (error) {
            alert('Please enter a valid image URL');
        }
    };

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        onChange(newImages);
    };

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="image_upload_container">
            <label className="form_label">Product Images</label>
            
            <div className="image_upload_methods">
                <button 
                    type="button" 
                    className="upload_method_btn"
                    onClick={openFileDialog}
                    disabled={images.length >= maxImages}
                >
                    📁 Choose Files
                </button>
                
                <button 
                    type="button" 
                    className="upload_method_btn"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    disabled={images.length >= maxImages}
                >
                    🔗 Add URL
                </button>
            </div>

            {showUrlInput && (
                <div className="url_input_container">
                    <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="Enter image URL..."
                        className="url_input"
                    />
                    <button type="button" onClick={handleUrlAdd} className="add_url_btn">
                        Add
                    </button>
                    <button 
                        type="button" 
                        onClick={() => setShowUrlInput(false)} 
                        className="cancel_url_btn"
                    >
                        Cancel
                    </button>
                </div>
            )}

            <div 
                className={`image_drop_zone ${dragActive ? 'drag_active' : ''} ${uploading ? 'uploading' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={openFileDialog}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileInput}
                    style={{ display: 'none' }}
                />
                
                {uploading ? (
                    <div className="uploading_state">
                        <div className="spinner"></div>
                        <p>Processing images...</p>
                    </div>
                ) : (
                    <div className="drop_zone_content">
                        <div className="drop_icon">📸</div>
                        <h4>Drag & Drop Images Here</h4>
                        <p>or click to browse</p>
                        <small>Maximum {maxImages} images • Up to 5MB each</small>
                    </div>
                )}
            </div>

            {images.length > 0 && (
                <div className="image_preview_container">
                    <h4>Image Preview ({images.length}/{maxImages})</h4>
                    <div className="image_grid">
                        {images.map((image, index) => (
                            <div key={index} className="image_preview_item">
                                <img 
                                    src={image.url} 
                                    alt={`Preview ${index + 1}`}
                                    className="preview_image"
                                />
                                <button 
                                    type="button"
                                    className="remove_image_btn"
                                    onClick={() => removeImage(index)}
                                >
                                    ✕
                                </button>
                                <div className="image_info">
                                    <small>{image.name}</small>
                                    {!image.isUrl && <small>{(image.size / 1024).toFixed(1)}KB</small>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <input
                type="hidden"
                name="images"
                value={JSON.stringify(images)}
            />
        </div>
    );
};

export default ImageUpload;
