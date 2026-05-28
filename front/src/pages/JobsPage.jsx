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
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <p className="text-sm font-semibold text-orange-500 uppercase tracking-wider mb-1">
              {t("jobs.browseTag", "Marketplace")}
            </p>
            <h1 className="text-3xl font-bold text-gray-900">
              {t("jobs.pageTitle", "Job Opportunities")}
            </h1>
            <p className="text-gray-500 mt-1">
              {t("jobs.pageSubtitle", "Discover the latest published job listings from our marketplace")}
            </p>
          </div>
          <div className="flex-shrink-0">
            {/* Keeping your custom Button component but mapping it to primary */}
            <Button variant="primary" onClick={handleCreateJob} className="bg-orange-500 hover:bg-orange-600 text-white shadow-sm">
              {t("jobs.postJob", "Post a Job")}
            </Button>
          </div>
        </header>

        {/* Main Content Section */}
        <main className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Area */}
          <aside className="col-span-1 h-fit">
            {/* Note: Ensure JobFilters renders with a white background, padding, and rounded-xl to match */}
            <JobFilters 
              filters={filters} 
              categories={categories} 
              onFiltersChange={updateFilter} 
              onReset={handleReset} 
            />
          </aside>

          {/* Results Area */}
          <section className="col-span-1 lg:col-span-3 space-y-4" aria-live="polite">
            
            <header className="bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between">
              <h2 className="font-medium text-gray-900">{t("jobs.availableJobs", "Available jobs")}</h2>
              <p className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full mt-2 sm:mt-0">
                <span className="font-semibold text-gray-900">{pagination.total}</span> {t("jobs.listingsFound", "listings found")}
              </p>
            </header>

            {/* Results Display */}
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={`skeleton-${index}`} className="h-32 bg-white rounded-xl border border-gray-100 shadow-sm animate-pulse p-6">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="flex gap-2">
                        <div className="h-6 bg-gray-100 rounded w-20"></div>
                        <div className="h-6 bg-gray-100 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : jobs.length > 0 ? (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                <div className="bg-gray-50 p-4 rounded-full">
                  <SearchX size={48} className="text-gray-400" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t("jobs.noResultsTitle", "No jobs found")}</h3>
                  <p className="text-gray-500 mt-1 max-w-md mx-auto">{t("jobs.noResultsMessage", "Try changing your keyword or filter selection to find what you're looking for.")}</p>
                </div>
                <div className="pt-2">
                  <Button variant="outline" onClick={handleReset} className="border-gray-200 text-gray-700 hover:bg-gray-50">
                    {t("jobs.clearFilters", "Clear Filters")}
                  </Button>
                </div>
              </div>
            )}

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="pt-6 pb-2 flex justify-center">
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
    </div>
  );
};

export default JobsPage;