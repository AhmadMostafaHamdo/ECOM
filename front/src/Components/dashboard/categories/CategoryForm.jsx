import React from 'react';

const CategoryForm = ({
    editingId,
    editName,
    categoryName,
    editImage,
    categoryImage,
    setEditName,
    setCategoryName,
    setEditImage,
    setCategoryImage,
    updateCategory,
    addCategory,
    setShowForm,
    setEditingId,
    saving,
    t
}) => {
    return (
        <section
            className="admin_card"
            style={{ position: "sticky", top: "88px" }}
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
                        color: "#0f1729",
                        margin: 0,
                    }}
                >
                    {editingId
                        ? t("admin.editCategory")
                        : t("admin.createCategory")}
                </h2>
                <button
                    onClick={() => {
                        setShowForm(false);
                        setEditingId("");
                        setCategoryName("");
                        setCategoryImage("");
                    }}
                    style={{
                        border: "1.5px solid #e2e8f0",
                        background: "#f8fafc",
                        cursor: "pointer",
                        color: "#94a3b8",
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                    }}
                >
                    ✕
                </button>
            </div>

            <form
                className="admin_form"
                onSubmit={editingId ? updateCategory : addCategory}
            >
                <div>
                    <label>Segment Identifier</label>
                    <input
                        type="text"
                        value={editingId ? editName : categoryName}
                        onChange={(e) =>
                            editingId
                                ? setEditName(e.target.value)
                                : setCategoryName(e.target.value)
                        }
                        required
                        placeholder="e.g. Next-Gen Tech"
                    />
                </div>
                <div>
                    <label>Image URL</label>
                    <input
                        type="url"
                        value={editingId ? editImage : categoryImage}
                        onChange={(e) =>
                            editingId
                                ? setEditImage(e.target.value)
                                : setCategoryImage(e.target.value)
                        }
                        placeholder="https://example.com/image.png"
                    />
                </div>
                <div style={{ marginTop: "20px" }}>
                    <button
                        type="submit"
                        className="btn_primary"
                        style={{ width: "100%" }}
                        disabled={saving}
                    >
                        {saving
                            ? t("common.loading")
                            : editingId
                                ? t("admin.editCategory")
                                : t("admin.createCategory")}
                    </button>
                </div>
            </form>
        </section>
    );
};

export default CategoryForm;
