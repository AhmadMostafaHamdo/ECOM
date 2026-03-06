import React from 'react';

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
                    <div>
                        <label>Market Price ($)</label>
                        <input
                            type="number"
                            name="cost"
                            value={form.cost}
                            onChange={updateField}
                            required
                        />
                    </div>
                    <div>
                        <label>Base MSRP ($)</label>
                        <input
                            type="number"
                            name="mrp"
                            value={form.mrp}
                            onChange={updateField}
                            required
                        />
                    </div>
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
