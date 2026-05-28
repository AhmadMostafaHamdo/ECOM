const JOB_STATUSES = ["draft", "published", "closed", "archived"];
const JOB_STATUS_META = {
  draft: { label: "Draft", labelAr: "مسودة", className: "draft" },
  published: { label: "Published", labelAr: "منشورة", className: "published" },
  closed: { label: "Closed", labelAr: "مغلقة", className: "closed" },
  archived: { label: "Archived", labelAr: "أرشيف", className: "archived" },
};

const JOB_TYPES = [
  "full_time",
  "part_time",
  "remote",
  "freelance",
  "internship",
];

module.exports = {
  JOB_STATUSES,
  JOB_STATUS_META,
  JOB_TYPES,
};
