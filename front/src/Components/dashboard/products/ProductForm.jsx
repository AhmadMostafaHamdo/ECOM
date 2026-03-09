import React from 'react';
import PhoneInput from '../../ui/PhoneInput';

const ProductForm = ({
    isEditing,
    form,
    categories,
    updateField,
    handleSubmit,
    resetForm,
    saving,
    t
}) => {
    return (
        <section
            className="admin_card"
            style={{
                position: "sticky",
                top: "104px",
                maxHeight: "calc(100vh - 140px)",
                overflowY: "auto",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "24px",
                }}
            >
                <h2
                    style={{
                        fontSize: "18px",
                        fontWeight: "800",
                        color: "#1e293b",
                        margin: 0,
                    }}
                >
                    {isEditing ? t("admin.editProduct") : t("admin.createProduct")}
                </h2>
                <button
                    onClick={resetForm}
                    style={{
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        color: "#94a3b8",
                    }}
                >
                    x
                </button>
            </div>
            <form className="admin_form" onSubmit={handleSubmit}>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "16px",
                    }}
                >
                    <div>
                        <label>Mark Name</label>
                        <input
                            type="text"
                            name="shortTitle"
                            value={form.shortTitle}
                            onChange={updateField}
                            required
                        />
                    </div>
                    <div>
                        <label>Sector</label>
                        <select
                            name="category"
                            value={form.category}
                            onChange={updateField}
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div>
                    <label>Legal Designation</label>
                    <input
                        type="text"
                        name="longTitle"
                        value={form.longTitle}
                        onChange={updateField}
                        required
                    />
                </div>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "16px",
                    }}
                >
                    <div style={{ position: "relative" }}>
                        <label>Market Price</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="number"
                                name="cost"
                                value={form.cost}
                                onChange={updateField}
                                required
                                style={{ flex: 1 }}
                            />
                            <select
                                name="currency"
                                value={form.currency}
                                onChange={updateField}
                                style={{ width: '80px' }}
                            >
                                <option value="SYP">سوري</option>
                                <option value="USD">دولار</option>
                                <option value="EUR">يورو</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label>Base MSRP</label>
                        <input
                            type="number"
                            name="mrp"
                            value={form.mrp}
                            onChange={updateField}
                            required
                        />
                    </div>
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "16px",
                        marginTop: "8px"
                    }}
                >
                    <div>
                        <label>الدولة</label>
                        <select
                            name="country"
                            value={form.country}
                            onChange={updateField}
                        >
                            <option value="">اختر الدولة</option>
                            <option value="Syria">سوريا</option>
                            <option value="Lebanon">لبنان</option>
                            <option value="Jordan">الأردن</option>
                        </select>
                    </div>
                    <div>
                        <label>المحافظة</label>
                        <select
                            name="province"
                            value={form.province}
                            onChange={updateField}
                        >
                            <option value="">اختر المحافظة</option>
                            {form.country === 'Syria' && (
                                <>
                                    <option value="Damascus">دمشق</option>
                                    <option value="Aleppo">حلب</option>
                                    <option value="Homs">حمص</option>
                                    <option value="Latakia">اللاذقية</option>
                                    <option value="Tartus">طرطوس</option>
                                    <option value="Hama">حماة</option>
                                </>
                            )}
                            {form.country !== 'Syria' && (
                                <option value="Other">أخرى</option>
                            )}
                        </select>
                    </div>
                    <div>
                        <label>المدينة</label>
                        <input
                            type="text"
                            name="city"
                            placeholder="المدينة"
                            value={form.city}
                            onChange={updateField}
                            style={{ padding: '8px' }}
                        />
                    </div>
                </div>

                <div style={{ marginTop: "16px" }}>
                    <label>{t("auth.mobile", "رقم الهاتف")}</label>
                    <PhoneInput
                        value={form.mobile}
                        onChange={(val) => updateField({ target: { name: 'mobile', value: val } })}
                        onCountryChange={(c) => {
                            if (c && !form.country) {
                                // Only auto-fill if country is empty
                                updateField({ target: { name: 'country', value: c.name } });
                            }
                        }}
                    />
                </div>

                <div>
                    <label>Product Resource URL</label>
                    <input
                        type="text"
                        name="url"
                        value={form.url}
                        onChange={updateField}
                        required
                    />
                </div>
                <div>
                    <label>Description</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={updateField}
                        rows="3"
                        style={{ resize: "none" }}
                    />
                </div>
                <div style={{ marginTop: "16px" }}>
                    <button
                        type="submit"
                        className="btn_primary"
                        style={{ width: "100%" }}
                        disabled={saving}
                    >
                        {saving
                            ? t("common.loading")
                            : isEditing
                                ? t("common.save")
                                : t("admin.createProduct")}
                    </button>
                </div>
            </form>
        </section>
    );
};

export default ProductForm;
