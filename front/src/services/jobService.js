import { axiosInstance } from "../api";

export const JOB_TYPES = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "remote", label: "Remote" },
  { value: "freelance", label: "Freelance" },
  { value: "internship", label: "Internship" },
];

const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });

  return searchParams.toString();
};

export const fetchJobCategories = async () => {
  const response = await axiosInstance.get("/job-categories");
  const payload = response.data;
  return payload.data || payload || [];
};

export const fetchJobs = async (params = {}) => {
  const query = buildQueryString(params);
  const response = await axiosInstance.get(`/jobs?${query}`);
  return response.data;
};

export const fetchJobById = async (id) => {
  const response = await axiosInstance.get(`/jobs/${id}`);
  return response.data;
};

export const createJob = async (payload) => {
  const response = await axiosInstance.post("/jobs", payload);
  return response.data;
};
