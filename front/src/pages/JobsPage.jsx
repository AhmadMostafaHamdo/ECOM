import React, { useCallback, useEffect, useMemo, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { SearchX } from "lucide-react";

// Context & Services
import { Logincontext } from "../Components/context/Contextprovider";
import { fetchJobCategories, fetchJobs } from "../services/jobService";

// Components
import JobFilters from "../Components/jobs/JobFilters";
import JobCard from "../Components/jobs/JobCard";
import Pagination from "../Components/common/Pagination";
import Button from "../Components/common/Button";
import "../Components/jobs/jobs.css";

const JobsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { account } = useContext(Logincontext);
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [categories, setCategories] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    total_pages: 1,
    page: 1,
    limit: 10
  });

  // Derived State (URL Sync)
  const filters = useMemo(() => ({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    job_type: searchParams.get("job_type") || "",
    location: searchParams.get("location") || "",
    sort: searchParams.get("sort") || "newest",
    page: searchParams.get("page") || 1,
  }), [searchParams]);

  // Data Fetching
  const loadCategories = useCallback(async () => {
    try {
      const categoriesData = await fetchJobCategories();
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error("Failed to fetch job categories:", error);
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
      console.error("Failed to fetch jobs:", error);
      toast.error(t("jobs.loadError", "Unable to load job opportunities"));
      setJobs([]);
      setPagination((prev) => ({ ...prev, total: 0, total_pages: 1, page: 1 }));
    } finally {
      setLoading(false);
    }
  }, [filters, t]);

  // Effects
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  // Handlers
  const updateFilter = useCallback((key, value) => {
    const nextParams = new URLSearchParams(searchParams);

    if (!value) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }

    // Always reset to page 1 when filters change (unless the change IS the page)
    if (key !== "page") {
      nextParams.delete("page");
    }

    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const handlePageChange = useCallback((nextPage) => {
    if (nextPage < 1 || nextPage > pagination.total_pages) return;

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", nextPage.toString());

    setSearchParams(nextParams, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pagination.total_pages, searchParams, setSearchParams]);

  const handleReset = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const handleCreateJob = useCallback(() => {
    navigate(account ? "/jobs/new" : "/login");
  }, [account, navigate]);

  return (
    <div className="jobs_page_container">
      {/* Header Section */}
      <header className="jobs_page_header">
        <div className="jobs_header_content">
          <p className="jobs_page_tag">{t("jobs.browseTag", "Marketplace")}</p>
          <h1>{t("jobs.pageTitle", "Job Opportunities")}</h1>
          <p className="jobs_page_subtitle">
            {t("jobs.pageSubtitle", "Discover the latest published job listings from our marketplace")}
          </p>
        </div>
        <div className="jobs_page_actions">
          <Button variant="primary" onClick={handleCreateJob}>
            {t("jobs.postJob", "Post a Job")}
          </Button>
        </div>
      </header>

      {/* Main Content Section */}
      <main className="jobs_page_main">

        {/* Sidebar Area */}
        <aside>
          <JobFilters
            filters={filters}
            categories={categories}
            onFiltersChange={updateFilter}
            onReset={handleReset}
          />
        </aside>

        {/* Results Area */}
        <section className="jobs_page_results" aria-live="polite">

          <header className="jobs_page_resultsHeader">
            <h2>{t("jobs.availableJobs", "Available jobs")}</h2>
            <p className="jobs_page_resultsCount">
              <strong>{pagination.total}</strong> {t("jobs.listingsFound", "listings found")}
            </p>
          </header>

          {/* Results Display */}
          {loading ? (
            <div className="jobs_page_skeletons">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="job-card job-card--skeleton" />
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
              <div className="jobs_empty_state__icon">
                <SearchX size={32} strokeWidth={1.5} />
              </div>
              <div>
                <h3>{t("jobs.noResultsTitle", "No jobs found")}</h3>
                <p>{t("jobs.noResultsMessage", "Try changing your keyword or filter selection to find what you're looking for.")}</p>
              </div>
              <Button variant="outline" onClick={handleReset}>
                {t("jobs.clearFilters", "Clear Filters")}
              </Button>
            </div>
          )}

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div style={{ paddingTop: "var(--space-4)", display: "flex", justifyContent: "center" }}>
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.total_pages}
                totalItems={pagination.total}
                limit={pagination.limit}
                onPageChange={handlePageChange}
                showPageSizeSelector={false}
              />
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default JobsPage;
