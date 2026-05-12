import React, { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Save, Plus, Upload, X, Tag, Link2, Languages, Trash2 } from "lucide-react";
import { resolveImageUrl } from "../../../utils/categoryUtils";
import "./category-form.css";

const makePreview = (file) => (file ? URL.createObjectURL(file) : "");

const CategoryForm = ({
  editingId,
  draft,
  setDraft,
  onSubmit,
  onCancel,
  saving,
  t,
}) => {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const isEditing = Boolean(editingId);

  useEffect(() => {
    const url = makePreview(draft.file);
    setPreviewUrl(url);
    return () => url && URL.revokeObjectURL(url);
  }, [draft.file]);

  const updateDraft = (patch) => setDraft((prev) => ({ ...prev, ...patch }));
  const setFile = (file) => updateDraft({ file });

  const addSubCategory = () => {
    setDraft((prev) => ({
      ...prev,
      subCategories: [
        ...prev.subCategories,
        { nameEn: "", nameAr: "", image: "", file: null, active: true },
      ],
    }));
  };

  const updateSubCategory = (index, patch) => {
    setDraft((prev) => ({
      ...prev,
      subCategories: prev.subCategories.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    }));
  };

  const removeSubCategory = (index) => {
    setDraft((prev) => ({
      ...prev,
      subCategories: prev.subCategories.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const finalImageSrc = previewUrl || resolveImageUrl(draft.image);
  const canSubmit = (draft.nameEn || draft.nameAr).trim().length >= 2;

  return (
    <form className="cf-root" onSubmit={onSubmit} noValidate>
      <fieldset className="cf-section">
        <legend className="cf-section__legend">
          <Languages size={13} />
          {t("admin.categoryName", "Category Name")}
        </legend>

        <div className="cf-grid cf-grid--2">
          <div className="cf-field">
            <label className="cf-field__label" htmlFor="cf-name-en">
              {t("admin.englishName", "English name")}
            </label>
            <div className="cf-field__control">
              <span className="cf-field__icon" aria-hidden="true">
                <Tag size={15} />
              </span>
              <input
                id="cf-name-en"
                type="text"
                value={draft.nameEn}
                onChange={(e) => updateDraft({ nameEn: e.target.value })}
                required
                className="cf-input"
                placeholder={t("admin.enterCategoryName", "e.g. Electronics")}
                autoComplete="off"
              />
            </div>
          </div>

          <div className="cf-field">
            <label className="cf-field__label" htmlFor="cf-name-ar">
              {t("admin.arabicName", "Arabic name")}
            </label>
            <div className="cf-field__control">
              <span className="cf-field__icon" aria-hidden="true">
                <Tag size={15} />
              </span>
              <input
                id="cf-name-ar"
                type="text"
                value={draft.nameAr}
                onChange={(e) => updateDraft({ nameAr: e.target.value })}
                className="cf-input"
                placeholder="إلكترونيات"
                dir="auto"
                autoComplete="off"
              />
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset className="cf-section">
        <legend className="cf-section__legend">
          <ImageIcon size={13} />
          {t("admin.categoryImage", "Category Image")}
        </legend>

        <div
          className={`cf-dropzone${dragOver ? " cf-dropzone--active" : ""}${draft.file ? " cf-dropzone--has-file" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith("image/")) setFile(file);
          }}
          onClick={() => !draft.file && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && !draft.file && fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files[0] && setFile(e.target.files[0])}
            accept="image/*"
            className="cf-file-input"
            aria-hidden="true"
            tabIndex={-1}
          />

          {draft.file ? (
            <div className="cf-file-info">
              <div className="cf-file-info__icon">
                <ImageIcon size={20} />
              </div>
              <div className="cf-file-info__meta">
                <span className="cf-file-info__name">{draft.file.name}</span>
                <span className="cf-file-info__size">{(draft.file.size / 1024).toFixed(1)} KB</span>
              </div>
              <button
                type="button"
                className="cf-file-info__remove"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
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
              <p className="cf-dropzone__label">{t("admin.uploadLocalImage", "Click or drag & drop an image")}</p>
              <span className="cf-dropzone__hint">PNG, JPG, WEBP</span>
            </div>
          )}
        </div>

        <div className="cf-field">
          <label className="cf-field__label" htmlFor="cf-image-url">
            {t("admin.imageUrl", "Image URL")}
          </label>
          <div className="cf-field__control">
            <span className="cf-field__icon" aria-hidden="true">
              <Link2 size={15} />
            </span>
            <input
              id="cf-image-url"
              type="url"
              value={draft.image}
              onChange={(e) => updateDraft({ image: e.target.value })}
              placeholder={t("admin.imageUrlPlaceholder", "https://example.com/image.png")}
              disabled={!!draft.file}
              className="cf-input"
            />
          </div>
        </div>

        <div className="cf-preview">
          {finalImageSrc ? (
            <img
              src={finalImageSrc}
              alt={t("admin.imagePreview", "Preview")}
              className="cf-preview__img"
              onError={(e) => {
                e.currentTarget.style.display = "none";
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

      <fieldset className="cf-section">
        <legend className="cf-section__legend">
          <Plus size={13} />
          {t("admin.subCategories", "SubCategories")}
        </legend>

        <div className="cf-sub-list">
          {draft.subCategories.map((subCategory, index) => (
            <SubCategoryRow
              key={subCategory._id || index}
              index={index}
              subCategory={subCategory}
              updateSubCategory={updateSubCategory}
              removeSubCategory={removeSubCategory}
              t={t}
            />
          ))}
        </div>

        <button type="button" className="cf-btn cf-btn--ghost cf-btn--fit" onClick={addSubCategory}>
          <Plus size={16} />
          {t("admin.addSubCategory", "Add SubCategory")}
        </button>
      </fieldset>

      <div className="cf-actions">
        <button type="button" className="cf-btn cf-btn--ghost" onClick={onCancel} disabled={saving}>
          {t("dialog.cancel", "Cancel")}
        </button>
        <button type="submit" className="cf-btn cf-btn--primary" disabled={saving || !canSubmit}>
          {saving ? <span className="cf-btn__spinner" aria-hidden="true" /> : isEditing ? <Save size={16} /> : <Plus size={16} />}
          <span>
            {saving
              ? t("common.loading", "Saving...")
              : isEditing
                ? t("admin.editCategory", "Save Changes")
                : t("admin.createCategory", "Create Category")}
          </span>
        </button>
      </div>
    </form>
  );
};

const SubCategoryRow = ({ index, subCategory, updateSubCategory, removeSubCategory, t }) => {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    const url = makePreview(subCategory.file);
    setPreviewUrl(url);
    return () => url && URL.revokeObjectURL(url);
  }, [subCategory.file]);

  const imageSrc = previewUrl || resolveImageUrl(subCategory.image);

  return (
    <div className="cf-sub-row">
      <button
        type="button"
        className="cf-sub-remove"
        onClick={() => removeSubCategory(index)}
        aria-label={t("common.delete", "Delete")}
      >
        <Trash2 size={15} />
      </button>

      <button
        type="button"
        className="cf-sub-preview"
        onClick={() => fileInputRef.current?.click()}
        aria-label={t("admin.uploadLocalImage", "Upload local image")}
      >
        {imageSrc ? <img src={imageSrc} alt="" /> : <ImageIcon size={20} />}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="cf-hidden-file"
        onChange={(e) => updateSubCategory(index, { file: e.target.files[0] || null })}
      />

      <div className="cf-sub-fields">
        <input
          type="text"
          className="cf-input"
          value={subCategory.nameEn}
          onChange={(e) => updateSubCategory(index, { nameEn: e.target.value })}
          placeholder={t("admin.englishName", "English name")}
        />
        <input
          type="text"
          className="cf-input"
          value={subCategory.nameAr}
          onChange={(e) => updateSubCategory(index, { nameAr: e.target.value })}
          placeholder={t("admin.arabicName", "Arabic name")}
          dir="auto"
        />
        <input
          type="url"
          className="cf-input"
          value={subCategory.image}
          onChange={(e) => updateSubCategory(index, { image: e.target.value })}
          placeholder={t("admin.imageUrl", "Image URL")}
          disabled={!!subCategory.file}
        />
      </div>
    </div>
  );
};

export default CategoryForm;
