import React, { useState, useRef, useCallback } from "react";
import { ROOT_URL, getCookie, axiosInstance } from "../../api";
import "./ImageUpload.css";
import { useTranslation } from "react-i18next";
import {
    CloudUpload,
    Link,
    Delete,
    AddPhotoAlternate,
    Clear,
    PhotoLibrary
} from "@mui/icons-material";
import { CircularProgress } from "@mui/material";

const ImageUpload = ({ images = [], onChange, maxImages = 5 }) => {
    const { t } = useTranslation();
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

    const handleFiles = (files) => {
        const fileArray = Array.from(files);
        const validFiles = fileArray.filter(file =>
            file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024
        );

        if (validFiles.length === 0) {
            alert(t('productCreator.invalidFile', 'Please select valid image files under 10MB'));
            return;
        }

        if (images.length + validFiles.length > maxImages) {
            alert(t('productCreator.maxImagesReached', `You can only upload up to ${maxImages} images`));
            return;
        }

        const newImages = validFiles.map((file) => ({
            url: URL.createObjectURL(file),
            file: file, // Keep the original file object for later upload
            name: file.name,
            size: file.size,
            type: file.type,
            isLocal: true
        }));

        onChange([...images, ...newImages]);
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
            <label className="form_label">{t('productCreator.productImages', 'Product Images')}</label>

            <div className="image_upload_methods">
                <button
                    type="button"
                    className="upload_method_btn"
                    onClick={openFileDialog}
                    disabled={images.length >= maxImages}
                >
                    <PhotoLibrary fontSize="small" />
                    {t('productCreator.chooseFiles', 'Choose Files')}
                </button>

                <button
                    type="button"
                    className="upload_method_btn"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    disabled={images.length >= maxImages}
                >
                    <Link fontSize="small" />
                    {t('productCreator.addUrl', 'Add URL')}
                </button>
            </div>

            {showUrlInput && (
                <div className="url_input_container">
                    <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder={t('productCreator.urlPlaceholder', 'Enter image URL...')}
                        className="url_input"
                    />
                    <button type="button" onClick={handleUrlAdd} className="add_url_btn">
                        {t('common.add', 'Add')}
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowUrlInput(false)}
                        className="cancel_url_btn"
                    >
                        {t('common.cancel', 'Cancel')}
                    </button>
                </div>
            )}

            <div
                className={`image_drop_zone ${dragActive ? 'drag_active' : ''} ${uploading ? 'uploading' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
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
                        <CircularProgress size={40} thickness={4} />
                        <p>{t('productCreator.processingImages', 'Processing images...')}</p>
                    </div>
                ) : (
                    <div className="drop_zone_content" onClick={openFileDialog}>
                        <div className="drop_icon">
                            <CloudUpload fontSize="large" style={{ fontSize: '48px', color: 'var(--accent, #f5a623)' }} />
                        </div>
                        <h4>{t('productCreator.dragDrop', 'Drag & Drop Images Here')}</h4>
                        <p>{t('productCreator.clickBrowse', 'or click to browse')}</p>
                        <small>
                            {t('productCreator.maxImagesHint', `Maximum ${maxImages} images`)} •
                            {t('productCreator.maxSizeHint', 'Up to 10MB each')}
                        </small>
                    </div>
                )}
            </div>

            {images.length > 0 && (
                <div className="image_preview_container">
                    <h4>{t('productCreator.previewTitle', 'Image Preview')} ({images.length}/{maxImages})</h4>
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
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeImage(index);
                                    }}
                                    title={t('common.remove', 'Remove')}
                                >
                                    <Clear fontSize="small" />
                                </button>
                                <div className="image_info">
                                    <small>{image.name}</small>
                                    {!image.isUrl && <small>{(image.size / 1024).toFixed(1)} KB</small>}
                                    {image.isUrl && <small className="url_tag">URL</small>}
                                </div>
                            </div>
                        ))}
                        {images.length < maxImages && !uploading && (
                            <div className="image_preview_item add_more" onClick={openFileDialog}>
                                <AddPhotoAlternate fontSize="large" style={{ color: '#d1d5db' }} />
                                <span>{t('common.addMore', 'Add More')}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
