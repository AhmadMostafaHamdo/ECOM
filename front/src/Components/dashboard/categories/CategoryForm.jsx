import React, { useRef, useState, useEffect } from "react";
import { Image as ImageIcon, Save, Plus, Upload, X, Tag, Link2 } from "lucide-react";
import { ROOT_URL } from "../../../api";
import "./category-form.css";

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
  t,
}) => {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const isEditing = Boolean(editingId);
  const currentName = isEditing ? editName : categoryName;
  const currentImage = isEditing ? editImage : categoryImage;
  const currentFile = isEditing ? editFile : categoryFile;

  useEffect(() => {
    if (currentFile) {
      const url = URL.createObjectURL(currentFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [currentFile]);

  const setFile = (file) => (isEditing ? setEditFile(file) : setCategoryFile(file));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) setFile(file);
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getImageSrc = () => {
    if (previewUrl) return previewUrl;
    if (currentImage) {
      return currentImage.startsWith("/uploads")
        ? `${ROOT_URL}${currentImage}`
        : currentImage;
    }
    return null;
  };

  const finalImageSrc = getImageSrc();

  const handleCancel = () => {
    setShowForm(false);
    if (isEditing) setEditingId(null);
  };

  return (
    <form
      className="cf-root"
      onSubmit={isEditing ? updateCategory : addCategory}
      noValidate
    >
      {/* ── Category Name ─────────────────────────────────────────── */}
      <fieldset className="cf-section">
        <legend className="cf-section__legend">
          <Tag size={13} />
          {t("admin.categoryName", "Category Name")}
        </legend>

        <div className="cf-field">
          <div className="cf-field__control">
            <span className="cf-field__icon" aria-hidden="true">
              <Tag size={15} />
            </span>
            <input
              id="cf-name"
              type="text"
              value={currentName}
              onChange={(e) =>
                isEditing
                  ? setEditName(e.target.value)
                  : setCategoryName(e.target.value)
              }
              required
              className="cf-input"
              placeholder={t("admin.enterCategoryName", "e.g. Electronics")}
              autoComplete="off"
            />
          </div>
        </div>
      </fieldset>

      {/* ── Category Image ────────────────────────────────────────── */}
      <fieldset className="cf-section">
        <legend className="cf-section__legend">
          <ImageIcon size={13} />
          {t("admin.categoryImage", "Category Image")}
        </legend>

        {/* Drop zone / upload button */}
        <div
          className={`cf-dropzone${dragOver ? " cf-dropzone--active" : ""}${currentFile ? " cf-dropzone--has-file" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !currentFile && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && !currentFile && fileInputRef.current?.click()}
          aria-label={t("admin.uploadLocalImage", "Upload local image")}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="cf-file-input"
            aria-hidden="true"
            tabIndex={-1}
          />

          {currentFile ? (
            <div className="cf-file-info">
              <div className="cf-file-info__icon">
                <ImageIcon size={20} />
              </div>
              <div className="cf-file-info__meta">
                <span className="cf-file-info__name">{currentFile.name}</span>
                <span className="cf-file-info__size">
                  {(currentFile.size / 1024).toFixed(1)} KB
                </span>
              </div>
              <button
                type="button"
                className="cf-file-info__remove"
                onClick={(e) => { e.stopPropagation(); removeFile(); }}
                aria-label="Remove file"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="cf-dropzone__empty">
              <div className="cf-dropzone__icon">
                <Upload size={22} />
              </div>
              <p className="cf-dropzone__label">
                {t("admin.uploadLocalImage", "Click or drag & drop an image")}
              </p>
              <span className="cf-dropzone__hint">PNG, JPG, WEBP — max 5 MB</span>
            </div>
          )}
        </div>

        {/* OR divider */}
        <div className="cf-divider">
          <span>{t("common.or", "OR")}</span>
        </div>

        {/* URL input */}
        <div className="cf-field">
          <div className="cf-field__label-row">
            <label className="cf-field__label" htmlFor="cf-image-url">
              {t("admin.imageUrl", "Image URL")}
            </label>
            {currentFile && (
              <span className="cf-field__hint">
                {t("admin.urlDisabledWhenFile", "Disabled while a file is selected")}
              </span>
            )}
          </div>
          <div className="cf-field__control">
            <span className="cf-field__icon" aria-hidden="true">
              <Link2 size={15} />
            </span>
            <input
              id="cf-image-url"
              type="url"
              value={currentImage}
              onChange={(e) =>
                isEditing
                  ? setEditImage(e.target.value)
                  : setCategoryImage(e.target.value)
              }
              placeholder={t("admin.imageUrlPlaceholder", "https://example.com/image.png")}
              disabled={!!currentFile}
              className="cf-input"
            />
          </div>
        </div>

        {/* Image preview */}
        <div className="cf-preview">
          {finalImageSrc ? (
            <img
              src={finalImageSrc}
              alt={t("admin.imagePreview", "Preview")}
              className="cf-preview__img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/300x160?text=Invalid+Image";
              }}
            />
          ) : (
            <div className="cf-preview__empty">
              <ImageIcon size={28} />
              <span>{t("admin.noImageProvided", "No image provided")}</span>
            </div>
          )}
        </div>
      </fieldset>

      {/* ── Actions ──────────────────────────────────────────────── */}
      <div className="cf-actions">
        <button
          type="button"
          className="cf-btn cf-btn--ghost"
          onClick={handleCancel}
          disabled={saving}
        >
          {t("dialog.cancel", "Cancel")}
        </button>
        <button
          type="submit"
          className="cf-btn cf-btn--primary"
          disabled={saving || !currentName.trim()}
        >
          {saving ? (
            <span className="cf-btn__spinner" aria-hidden="true" />
          ) : isEditing ? (
            <Save size={16} />
          ) : (
            <Plus size={16} />
          )}
          <span>
            {saving
              ? t("common.loading", "Saving…")
              : isEditing
                ? t("admin.editCategory", "Save Changes")
                : t("admin.createCategory", "Create Category")}
          </span>
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;
    