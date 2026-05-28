export const JOB_STATUSES = ["draft", "published", "closed", "archived"];

export const JOB_STATUS_META = {
  draft: { label: "Draft", labelAr: "مسودة", className: "draft" },
  published: { label: "Published", labelAr: "منشورة", className: "published" },
  closed: { label: "Closed", labelAr: "مغلقة", className: "closed" },
  archived: { label: "Archived", labelAr: "أرشيف", className: "archived" },
};

export const JOB_TYPES = [
  { value: "full_time", label: "Full-time", labelAr: "دوام كامل" },
  { value: "part_time", label: "Part-time", labelAr: "دوام جزئي" },
  { value: "remote", label: "Remote", labelAr: "عن بُعد" },
  { value: "freelance", label: "Freelance", labelAr: "عمل حر" },
  { value: "internship", label: "Internship", labelAr: "تدريب" },
];

export const getJobTypeLabel = (value, language = "en") => {
  const type = JOB_TYPES.find((item) => item.value === value);
  if (!type) return value?.replace(/_/g, " ") || "";
  return language === "ar" ? type.labelAr : type.label;
};
