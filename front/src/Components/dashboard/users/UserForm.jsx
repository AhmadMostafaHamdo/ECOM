import React from "react";
import { useTranslation } from "react-i18next";

const UserForm = ({ form, setForm, isEditing, saving, onSubmit, onCancel, error }) => {
    const { t } = useTranslation();

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <section
            className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 sticky top-22 animate-slide-in-right"
            style={{
                position: "sticky",
                top: "88px",
                animation: "slideRight 0.3s ease",
            }}
        >
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 m-0">
                    {isEditing ? t("admin.modifyPortalAccess") : t("admin.grantNewAccess")}
                </h2>
                <button
                    onClick={onCancel}
                    className="w-8 h-8 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 cursor-pointer flex items-center justify-center transition-all duration-200"
                >
                    ✕
                </button>
            </div>

            <form className="admin_form" onSubmit={onSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t("auth.firstName")}
                        </label>
                        <input
                            type="text"
                            name="fname"
                            value={form.fname}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t("auth.lastName")}
                        </label>
                        <input
                            type="text"
                            name="lname"
                            value={form.lname}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("auth.email")}
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("auth.mobile")}
                    </label>
                    <input
                        type="text"
                        name="mobile"
                        value={form.mobile}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("auth.role")}
                    </label>
                    <select
                        name="role"
                        value={form.role}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                        <option value="user">{t("auth.role_user") || "User"}</option>
                        <option value="admin">{t("auth.role_admin") || "Admin"}</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("auth.password")} {isEditing && `(${t("common.optional") || "Optional"})`}
                    </label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleInputChange}
                        required={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm mb-4">
                        {error}
                    </div>
                )}

                <div className="mt-6">
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        disabled={saving}
                    >
                        {saving ? t("common.loading") : isEditing ? t("admin.editUser") : t("admin.createUser")}
                    </button>
                </div>
            </form>
        </section>
    );
};

export default React.memo(UserForm);
