import React, { useRef, useState, useEffect } from 'react';
import { Image as ImageIcon, Save, Plus, Upload, X } from 'lucide-react';
import { ROOT_URL } from '../../../api';

const CategoryForm = ({
    editingId,
    editName,
    categoryName,
    editImage,
    categoryImage,
    categoryFile,
    editFile,
    setEditName,
    setCategoryName,
    setEditImage,
    setCategoryImage,
    setCategoryFile,
    setEditFile,
    updateCategory,
    addCategory,
    setShowForm,
    setEditingId,
    saving,
    t
}) => {
    const fileInputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const currentName = editingId ? editName : categoryName;
    const currentImage = editingId ? editImage : categoryImage;
    const currentFile = editingId ? editFile : categoryFile;

    useEffect(() => {
        if (currentFile) {
            const url = URL.createObjectURL(currentFile);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreviewUrl(null);
        }
    }, [currentFile]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (editingId) {
                setEditFile(file);
            } else {
                setCategoryFile(file);
            }
        }
    };

    const removeFile = () => {
        if (editingId) {
            setEditFile(null);
        } else {
            setCategoryFile(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Helper to get image src: local file preview > URL
    const getImageSrc = () => {
        if (previewUrl) return previewUrl;
        if (currentImage) {
            // Check if it's a relative path starting with /uploads
            if (currentImage.startsWith('/uploads')) {
                return `${ROOT_URL}${currentImage}`;
            }
            return currentImage;
        }
        return null;
    };

    const finalImageSrc = getImageSrc();

    return (
        <form
            className="admin_form"
            onSubmit={editingId ? updateCategory : addCategory}
        >
            <div className="premium-input-group">
                <label>{t("admin.categoryName") || "Category Name"}</label>
                <div className="input-wrapper">
                    <input
                        type="text"
                        value={currentName}
                        onChange={(e) =>
                            editingId
                                ? setEditName(e.target.value)
                                : setCategoryName(e.target.value)
                        }
                        required
                        placeholder={t("admin.enterCategoryName") || "e.g. Electronics"}
                    />
                </div>
            </div>

            <div className="premium-input-group">
                <label>{t("admin.categoryImage") || "Category Image"}</label>
                
                <div className="upload-options">
                    <div className="file-upload-section">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                        <button
                            type="button"
                            className="upload-btn"
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'var(--brand-light)',
                                color: 'var(--brand)',
                                border: '1px dashed var(--brand)',
                                padding: '10px 16px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                width: '100%',
                                justifyContent: 'center',
                                fontWeight: '600'
                            }}
                        >
                            <Upload size={18} />
                            {currentFile ? currentFile.name : (t("admin.uploadLocalImage") || "Upload Local Image")}
                        </button>
                        
                        {currentFile && (
                            <button 
                                type="button" 
                                onClick={removeFile}
                                style={{
                                    marginTop: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    color: '#ef4444',
                                    fontSize: '12px',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={14} /> Remove local file
                            </button>
                        )}
                    </div>

                    <div className="divider" style={{ margin: '16px 0', textAlign: 'center', position: 'relative' }}>
                        <span style={{ background: 'white', padding: '0 10px', fontSize: '12px', color: '#94a3b8', position: 'relative', zIndex: 1 }}>{t("common.or") || "OR"}</span>
                        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: '#e2e8f0' }}></div>
                    </div>

                    <div className="input-wrapper">
                        <input
                            type="url"
                            value={currentImage}
                            onChange={(e) =>
                                editingId
                                    ? setEditImage(e.target.value)
                                    : setCategoryImage(e.target.value)
                            }
                            placeholder={t("admin.imageUrlPlaceholder") || "https://example.com/image.png"}
                            disabled={!!currentFile}
                            style={{ opacity: currentFile ? 0.6 : 1 }}
                        />
                    </div>
                </div>

                <div className="image-preview-container" style={{ marginTop: '16px' }}>
                    {finalImageSrc ? (
                        <img
                            src={finalImageSrc}
                            alt="Preview"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/150?text=Invalid+Image";
                            }}
                            style={{
                                width: '100%',
                                maxHeight: '200px',
                                objectFit: 'contain',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0'
                            }}
                        />
                    ) : (
                        <div className="empty-preview" style={{
                            height: '150px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px dashed #cbd5e1',
                            color: '#64748b'
                        }}>
                            <ImageIcon size={32} />
                            <span style={{ fontSize: '13px', marginTop: '8px' }}>{t("admin.noImageProvided") || "No image provided"}</span>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ marginTop: "24px" }}>
                <button
                    type="submit"
                    className="submit-btn-premium"
                    disabled={saving || !currentName.trim()}
                    style={{ width: '100%' }}
                >
                    {saving ? (
                        <div className="dt-search-spinner" />
                    ) : (
                        editingId ? <Save size={18} /> : <Plus size={18} />
                    )}
                    {saving
                        ? t("common.loading")
                        : editingId
                            ? t("admin.editCategory")
                            : t("admin.createCategory")}
                </button>
            </div>
        </form>
    );
};

export default CategoryForm;

