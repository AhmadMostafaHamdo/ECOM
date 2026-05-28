import React, { useCallback, useEffect, useMemo, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Logincontext } from "../Components/context/Contextprovider";
import { fetchJobCategories, fetchJobs } from "../services/jobService";
import JobFilters from "../components/jobs/JobFilters";
import JobCard from "../components/jobs/JobCard";
import Pagination from "../Components/common/Pagination";
import Button from "../Components/common/Button";
import { toast } from "react-toastify";
import "../components/jobs/jobs.css";

const JobsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { account } = useContext(Logincontext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, total_pages: 1, page: 1, limit: 10 });

  const filters = useMemo(() => ({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    job_type: searchParams.get("job_type") || "",
    location: searchParams.get("location") || "",
    sort: searchParams.get("sort") || "newest",
    page: searchParams.get("page") || 1,
  }), [searchParams]);

  const loadCategories = useCallback(async () => {
    try {
      const categoriesData = await fetchJobCategories();
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error(error);
      toast.error(t("jobs.categoryLoadError", "Unable to load job categories"));
    }
  }, [t]);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchJobs(filters);
      setJobs(response.data || []);
      setPagination({
        total: response.total || 0,
        total_pages: response.total_pages || 1,
        page: response.page || Number(filters.page) || 1,
        limit: response.limit || 10,
      });
    } catch (error) {
      console.error(error);
      toast.error(t("jobs.loadError", "Unable to load job opportunities"));
      setJobs([]);
      setPagination((prev) => ({ ...prev, total: 0, total_pages: 1, page: 1 }));
    } finally {
      setLoading(false);
    }
  }, [filters, t]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const updateFilter = useCallback((key, value) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (!value) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
    if (key !== "page") {
      nextParams.delete("page");
    }
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const handlePageChange = useCallback((nextPage) => {
    if (nextPage < 1 || nextPage > pagination.total_pages) return;
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("page", nextPage);
    setSearchParams(nextParams, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pagination.total_pages, searchParams, setSearchParams]);

  const handleReset = () => {
    setSearchParams({}, { replace: true });
  };

  const handleCreateJob = () => {
    if (!account) {
      navigate("/login");
      return;
    }
    navigate("/jobs/new");
  };

  return (
    <div className="jobs_page_container">
      <div className="jobs_page_header">
        <div>
          <p className="jobs_page_tag">{t("jobs.browseTag", "Marketplace")}</p>
          <h1>{t("jobs.pageTitle", "Job Opportunities")}</h1>
          <p className="jobs_page_subtitle">{t("jobs.pageSubtitle", "Discover the latest published job listings from our marketplace")}</p>
        </div>
        <div className="jobs_page_actions">
          <Button variant="primary" onClick={handleCreateJob}>{t("jobs.postJob", "Post a Job")}</Button>
        </div>
      </div>

      <div className="jobs_page_main">
        <JobFilters filters={filters} categories={categories} onFiltersChange={updateFilter} onReset={handleReset} />

        <div className="jobs_page_results">
          <div className="jobs_page_resultsHeader">
            <div>
              <h2>{t("jobs.availableJobs", "Available jobs")}</h2>
              <p>{pagination.total} {t("jobs.listingsFound", "listings found")}</p>
            </div>
          </div>

          {loading ? (
            <div className="jobs_page_skeletons">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="job-card job-card--skeleton" />
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <div className="jobs_page_grid">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          ) : (
            <div className="jobs_empty_state">
              <h3>{t("jobs.noResultsTitle", "No jobs found")}</h3>
              <p>{t("jobs.noResultsMessage", "Try changing your keyword or filter selection.")}</p>
            </div>
          )}

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.total_pages}
            totalItems={pagination.total}
            limit={pagination.limit}
            onPageChange={handlePageChange}
            showPageSizeSelector={false}
          />
        </div>
      </div>
    </div>
  );
};

export default JobsPage;
