import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { ROOT_URL, axiosInstance } from "../../api";
import { useLocalize } from "../context/LocalizeContext";
import ImageUpload from "./ImageUpload";
import Input from "../common/Input";
import "./create-product.css";
import { LocalOffer, ShoppingBag, Map, FilterFrames } from "@mui/icons-material";
import PhoneInput from "../ui/PhoneInput";

const initialForm = {
  shortTitle: "",
  longTitle: "",
  description: "",
  mrp: "",
  cost: "",
  priceDiscount: "",
  offerText: "",
  tagline: "",
  url: "",
  detailUrl: "",
  category: "",
  currency: "SYP",
  country: "",
  province: "",
  city: "",
  mobile: "",
};

const CreateProduct = ({ mode = "create" }) => {
  const { t } = useTranslation();
  const { activeCountry } = useLocalize();
  const navigate = useNavigate();
  const { id: editId } = useParams();
  const isEdit = mode === "edit" && Boolean(editId);

  const CATEGORY_ALL = t("navigation.allCategories", "All Categories");

  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [images, setImages] = useState([]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const profileRes = await axiosInstance.get("/profile");
        // axiosInstance ensures credentials and handles errors via interceptor or status check

        let categoryList = [];
        const categoryRes = await axiosInstance.get("/getcategories");

        if (categoryRes.status === 200) {
          const payload = categoryRes.data;
          const categoriesArray = payload.data || payload;
          const list = Array.isArray(categoriesArray)
            ? categoriesArray
              .map((item) => (typeof item === "string" ? item : item.name))
              .filter((name) => name !== CATEGORY_ALL)
            : [];
          categoryList = list;
          setCategories(list);
          if (!isEdit) {
            setForm((prev) => ({
              ...prev,
              category: list[0] || "",
            }));
          }
        }

        if (isEdit && editId) {
          const productRes = await axiosInstance.get(`/products/${editId}`);
          const productPayload = productRes.data;

          if (
            productPayload?.category &&
            !categoryList.includes(productPayload.category)
          ) {
            setCategories((prev) => [...prev, productPayload.category]);
          }

          setForm({
            shortTitle: productPayload?.title?.shortTitle || "",
            longTitle: productPayload?.title?.longTitle || "",
            description: productPayload?.description || "",
            mrp: productPayload?.price?.mrp ?? "",
            cost: productPayload?.price?.cost ?? "",
            priceDiscount: productPayload?.price?.discount || "",
            offerText: productPayload?.discount || "",
            tagline: productPayload?.tagline || "",
            url: productPayload?.url || "",
            detailUrl: productPayload?.detailUrl || "",
            category: productPayload?.category || categoryList[0] || "",
            currency: productPayload?.price?.currency || "SYP",
            country: productPayload?.locationDetail?.country || "",
            province: productPayload?.locationDetail?.province || "",
            city: productPayload?.locationDetail?.city || "",
            mobile: productPayload?.mobile || "",
          });

          const normalizedImages = Array.isArray(productPayload?.images)
            ? productPayload.images.filter(Boolean).map((url, index) => ({
              url: url.startsWith('http') ? url : (url.startsWith('/') ? `${ROOT_URL}${url}` : `${ROOT_URL}/${url}`),
              name: `Image ${index + 1}`,
              isUrl: true,
            }))
            : [];
          setImages(normalizedImages);
        }
      } catch (loadError) {
        console.error("Load error:", loadError);
        if (loadError.response?.status === 401) {
          navigate("/login");
          return;
        }
        setError(loadError.message);
        if (isEdit) {
          setTimeout(() => navigate("/profile"), 800);
        }
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [editId, isEdit, navigate, t]);


  const updateField = useCallback((event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const submitProduct = useCallback(async (event) => {
    event.preventDefault();

    // Validation
    if (images.length === 0) {
      toast.error(t("productCreator.errorNoImages", "At least one image is required"));
      return;
    }

    if (Number(form.mrp) < Number(form.cost)) {
      toast.error(t("productCreator.errorPriceRelation", "MRP cannot be less than selling price"));
      return;
    }

    if (Number(form.cost) <= 0) {
      toast.error(t("productCreator.errorPositivePrice", "Selling price must be greater than zero"));
      return;
    }

    if (!form.category) {
      toast.error(t("productCreator.errorNoCategory", "Please select a category"));
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      
      // Basic fields
      formData.append("shortTitle", form.shortTitle);
      formData.append("longTitle", form.longTitle);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("mrp", form.mrp);
      formData.append("cost", form.cost);
      formData.append("currency", form.currency);
      formData.append("priceDiscount", form.priceDiscount);
      formData.append("offerText", form.offerText);
      formData.append("tagline", form.tagline);
      formData.append("country", form.country);
      formData.append("province", form.province);
      formData.append("city", form.city);
      formData.append("mobile", form.mobile);

      // Handle images
      const existingUrls = [];
      images.forEach((image) => {
        if (image.file) {
          // New file to upload
          formData.append("images", image.file);
        } else if (image.url) {
          // Existing remote URL or relative path
          // If it's a blob URL (from current session), we skip it as it should have a 'file' property
          if (!image.url.startsWith('blob:')) {
            const urlToSend = image.url.startsWith(ROOT_URL) 
              ? image.url.replace(ROOT_URL, "") 
              : image.url;
            existingUrls.push(urlToSend);
          }
        }
      });
      
      // Send existing URLs as well
      existingUrls.forEach(url => formData.append("images", url));

      // Append primary and detail URLs if they were manually set
      if (form.url) {
        formData.append("url", form.url.startsWith(ROOT_URL) ? form.url.replace(ROOT_URL, "") : form.url);
      }
      if (form.detailUrl) {
        formData.append("detailUrl", form.detailUrl.startsWith(ROOT_URL) ? form.detailUrl.replace(ROOT_URL, "") : form.detailUrl);
      }

      const endpoint = isEdit ? `/products/${editId}` : "/products";
      const config = {
        headers: { "Content-Type": "multipart/form-data" },
      };

      const res = await (isEdit 
        ? axiosInstance.put(endpoint, formData, config) 
        : axiosInstance.post(endpoint, formData, config));

      const successMsg = isEdit ? t("productCreator.updateSuccess") : t("productCreator.success");
      setMessage(successMsg);
      toast.success(successMsg);
      setTimeout(() => navigate("/profile"), 900);
    } catch (submitError) {
      const errorMsg = submitError.response?.data?.error || submitError.message;
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  }, [form, images, isEdit, editId, navigate, t]);

  if (loading) {
    return (
      <section className="create_product_page">
        <div className="create_product_card">
          <h2>{t("productCreator.loading")}</h2>
        </div>
      </section>
    );
  }

  return (
    <section className="create_product_page">
      <div className="create_product_card">
        <header className="create_product_header">
          <p className="kicker">
            {isEdit
              ? t("productCreator.editProduct", "Edit your product")
              : t("productCreator.kicker")}
          </p>
          <h1>
            {isEdit
              ? t("productCreator.updateProduct", "Update product")
              : t("productCreator.title")}
          </h1>
          <p>
            {isEdit
              ? t(
                "productCreator.editSub",
                "Make changes and save to keep your listing fresh.",
              )
              : t("productCreator.subtitle")}
          </p>
        </header>

        <form className="create_product_form" onSubmit={submitProduct}>
          {/* Section 1: Basic Information */}
          <div className="form_section">
            <div className="section_title">
              <ShoppingBag />
              {t("productCreator.basicInfo", "Basic Information")}
            </div>

            <Input
              label={t("productCreator.productName")}
              id="shortTitle"
              name="shortTitle"
              value={form.shortTitle}
              onChange={updateField}
              required
            />

            <Input
              label={t("productCreator.fullTitle")}
              id="longTitle"
              name="longTitle"
              value={form.longTitle}
              onChange={updateField}
              required
            />

            <Input
              as="select"
              label={t("navigation.categories")}
              id="category"
              name="category"
              value={form.category}
              onChange={updateField}
              required
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Input>

            <Input
              as="textarea"
              label={t("product.description")}
              id="description"
              name="description"
              value={form.description}
              onChange={updateField}
              rows={4}
            />
          </div>

          {/* Section 2: Pricing & Offers */}
          <div className="form_section">
            <div className="section_title">
              <LocalOffer />
              {t("productCreator.pricingOffers", "Pricing & Offers")}
            </div>

            <div className="split_fields">
              <Input
                label={t("productCreator.mrp")}
                id="mrp"
                name="mrp"
                type="number"
                value={form.mrp}
                onChange={updateField}
                required
              />

              <div className="price_group">
                <Input
                  label={t("productCreator.sellingPrice")}
                  id="cost"
                  name="cost"
                  type="number"
                  value={form.cost}
                  onChange={updateField}
                  required
                  className="price_input"
                />
                <Input
                  as="select"
                  label=""
                  id="currency"
                  name="currency"
                  value={form.currency}
                  onChange={updateField}
                  className="currency_select"
                >
                  <option value="SYP">S.P</option>
                  <option value="USD">$</option>
                  <option value="EUR">€</option>
                </Input>
              </div>
            </div>

            <div className="split_fields">
              <Input
                label={t("productCreator.discountText")}
                id="priceDiscount"
                name="priceDiscount"
                value={form.priceDiscount}
                onChange={updateField}
              />
              <Input
                label={t("productCreator.offerBadge")}
                id="offerText"
                name="offerText"
                value={form.offerText}
                onChange={updateField}
              />
            </div>

            <Input
              label={t("productCreator.tagline")}
              id="tagline"
              name="tagline"
              value={form.tagline}
              onChange={updateField}
            />
          </div>

          {/* Section 3: Location & Logistics */}
          <div className="form_section">
            <div className="section_title">
              <Map />
              {t("productCreator.locationLogistics", "Location & Logistics")}
            </div>

            <div className="split_fields three_cols">
              <Input
                label={t("productCreator.country")}
                id="country"
                name="country"
                value={form.country}
                onChange={updateField}
                placeholder={t("productCreator.countryPlaceholder")}
              />
              <Input
                label={t("productCreator.province")}
                id="province"
                name="province"
                value={form.province}
                onChange={updateField}
                placeholder={t("productCreator.provincePlaceholder")}
              />
              <Input
                label={t("productCreator.city")}
                id="city"
                name="city"
                value={form.city}
                onChange={updateField}
                placeholder={t("productCreator.cityPlaceholder")}
              />
            </div>

            <div className="field">
              <label>{t("auth.mobile")}</label>
              <PhoneInput
                value={form.mobile}
                onChange={(val) => setForm({ ...form, mobile: val })}
                onCountryChange={(c) => {
                  if (c && !form.country) {
                    setForm((prev) => ({ ...prev, country: c.name }));
                  }
                }}
              />
            </div>
          </div>

          {/* Section 4: Media & Display */}
          <div className="form_section">
            <div className="section_title">
              <FilterFrames />
              {t("productCreator.mediaDisplay", "Media & Display")}
            </div>

            <ImageUpload images={images} onChange={setImages} maxImages={5} />

            <div className="split_fields">
              <Input
                label={t("productCreator.primaryImage")}
                id="url"
                name="url"
                value={form.url}
                onChange={updateField}
                placeholder={t("productCreator.primaryImagePlaceholder")}
              />
              <Input
                label={t("productCreator.detailImage")}
                id="detailUrl"
                name="detailUrl"
                value={form.detailUrl}
                onChange={updateField}
                placeholder={t("productCreator.detailImagePlaceholder")}
              />
            </div>
          </div>

          <button type="submit" className="submit_product_btn" disabled={saving}>
            {saving
              ? isEdit
                ? t("productCreator.saving")
                : t("productCreator.publishing")
              : isEdit
                ? t("productCreator.saveChanges")
                : t("productCreator.publish")}
          </button>
        </form>

        {message ? <p className="create_notice success">{message}</p> : null}
        {error ? <p className="create_notice error">{error}</p> : null}
      </div>
    </section>
  );
};

export default CreateProduct;
