import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import Pagination from "../common/Pagination";
import { Button } from "./Button";

// ─── Cache singleton ───────────────────────────────────────────────────────────
const tableCache = new Map();

export const invalidateCache = (cacheKey) => {
  if (cacheKey) tableCache.delete(cacheKey);
  else tableCache.clear();
};

// ─── Utility ───────────────────────────────────────────────────────────────────
const cn = (...classes) => classes.filter(Boolean).join(" ");

// ─── Icons ─────────────────────────────────────────────────────────────────────
const RefreshIcon = ({ spinning }) => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      transition: "transform 0.6s ease",
      transform: spinning ? "rotate(360deg)" : "rotate(0deg)",
    }}
  >
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const SearchIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const FilterIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const ChevronUp = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const ChevronDown = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const XIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ─── Skeleton Row ──────────────────────────────────────────────────────────────
const SkeletonRow = ({ cols }) => (
  <tr className="dt-skeleton-row">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} style={{ padding: "16px 20px" }}>
        <div
          className="dt-skeleton-cell"
          style={{ height: 16, borderRadius: 8 }}
        />
      </td>
    ))}
  </tr>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const DynamicTable = ({
  data = [],
  columns = [],
  loading = false,
  emptyMessage = "No data found",
  loadingMessage = "Loading...",
  pagination = null,
  onPageChange = null,
  actions = [],
  className = "",
  // ── Search props ──
  searchable = true,
  searchPlaceholder = "Search...",
  searchKeys = [],
  searchMode = "client", // "client" | "server"
  onSearch = null,
  searchDebounceMs = 300,
  // ── Filter props ──
  filters = [],
  // ── Refresh props ──
  onRefresh = null,
  // ── Cache props ──
  cacheKey = null,
  cacheTTL = 30000,
  // ── Title props ──
  title = "",
  subtitle = "",
  ...props
}) => {
  const { t } = useTranslation();
  // ── Sort ──
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // ── Search ──
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeout = useRef(null);

  // ── Filters ──
  const [activeFilters, setActiveFilters] = useState({});

  // ── Refresh ──
  const [refreshing, setRefreshing] = useState(false);
  const refreshTimeout = useRef(null);

  // ── Debounced server search ──
  const debouncedSearch = useCallback(
    (term) => {
      if (searchMode === "server" && onSearch) {
        setSearchLoading(true);
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
          onSearch(term);
          setSearchLoading(false);
        }, searchDebounceMs);
      }
    },
    [searchMode, onSearch, searchDebounceMs],
  );

  const handleSearchChange = useCallback(
    (value) => {
      setSearchTerm(value);
      if (searchMode === "server") debouncedSearch(value);
    },
    [searchMode, debouncedSearch],
  );

  useEffect(() => () => clearTimeout(searchTimeout.current), []);

  // ── Cache ──
  const cachedData = useMemo(() => {
    if (!cacheKey) return null;
    const entry = tableCache.get(cacheKey);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > cacheTTL) {
      tableCache.delete(cacheKey);
      return null;
    }
    return entry.data;
  }, [cacheKey, cacheTTL, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (cacheKey && data.length > 0) {
      tableCache.set(cacheKey, { data, timestamp: Date.now() });
    }
  }, [cacheKey, data]);

  const displayData = cacheKey && cachedData && loading ? cachedData : data;

  // ── Sort handler ──
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // ── Refresh handler ──
  const handleRefresh = useCallback(() => {
    if (refreshing) return;
    setRefreshing(true);
    if (cacheKey) tableCache.delete(cacheKey);
    if (onRefresh) onRefresh();
    clearTimeout(refreshTimeout.current);
    refreshTimeout.current = setTimeout(() => setRefreshing(false), 800);
  }, [refreshing, cacheKey, onRefresh]);

  useEffect(() => () => clearTimeout(refreshTimeout.current), []);

  // ── Filter handler ──
  const setFilter = (key, value) => {
    setActiveFilters((prev) =>
      value === "" || value === "all"
        ? (({ [key]: _, ...rest }) => rest)(prev)
        : { ...prev, [key]: value },
    );
  };

  const activeFilterCount = Object.keys(activeFilters).length;

  // ── Process data (client-side only) ──
  const processedData = useMemo(() => {
    let result = [...displayData];

    // Client search
    if (searchMode === "client" && searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((item) => {
        const keys = searchKeys.length
          ? searchKeys
          : Object.keys(item).filter(
              (k) => typeof item[k] === "string" || typeof item[k] === "number",
            );
        return keys.some((k) =>
          String(item[k] ?? "")
            .toLowerCase()
            .includes(term),
        );
      });
    }

    // Active filters (client-side; skip "all")
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value && value !== "all") {
        result = result.filter((item) => String(item[key]) === String(value));
      }
    });

    // Sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        const av = a[sortConfig.key],
          bv = b[sortConfig.key];
        if (av == null) return 1;
        if (bv == null) return -1;
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return sortConfig.direction === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [
    displayData,
    searchTerm,
    searchKeys,
    activeFilters,
    sortConfig,
    searchMode,
  ]);

  // ─── FIX: Render cell ──────────────────────────────────────────────────────
  // BUG 1 FIXED: "avatar" type was using `item[column.key]` as the value,
  //   but columns like `personalInfo` don't map to a real data field.
  //   Avatar type must rely entirely on getAvatarText/getName/getSubtitle callbacks.
  // BUG 2 FIXED: CSS class was `dt-avatar-meta` in old DynamicTable but the
  //   new document 16 version uses `dt-avatar-meta` — kept consistent as `dt-avatar-meta`.
  // BUG 3 FIXED: `progress` type had a `const` declaration inside a switch case
  //   without a block scope — wrapped in braces to fix potential linting/runtime issues.
  // BUG 4 FIXED: `status` type was calling getStatusClass/getStatusText with raw
  //   item value, but for columns like `status` where value is undefined (because
  //   the key doesn't exist on the data), it should fallback gracefully.
  // ──────────────────────────────────────────────────────────────────────────

  const renderCellContent = (column, item, rowIndex) => {
    // FIX: For "avatar" type, value is only used as fallback — primary data
    // comes from the callback functions (getName, getAvatarText, getSubtitle).
    const value = item[column.key];

    switch (column.type) {
      case "avatar":
        return (
          <div className="dt-user-info">
            <div className="dt-avatar">
              {column.getAvatarText
                ? column.getAvatarText(item)
                : (value?.toString().charAt(0).toUpperCase() ?? "?")}
            </div>
            {/* FIX: was "dt-avatar-meta" in old file — unified to "dt-avatar-meta" */}
            <div className="dt-avatar-meta">
              <div className="dt-name">
                {column.getName ? column.getName(item) : value}
              </div>
              {column.getSubtitle && (
                <div className="dt-subtitle">{column.getSubtitle(item)}</div>
              )}
            </div>
          </div>
        );

      case "rating":
        return (
          <div className="dt-rating">
            {"★".repeat(Math.min(5, Math.max(0, value || 0)))}
            <span className="dt-rating-empty">
              {"★".repeat(5 - Math.min(5, Math.max(0, value || 0)))}
            </span>
          </div>
        );

      case "status": {
        // FIX: when column.key is "status" but the item has no "status" field,
        // getStatusClass/getStatusText are called with undefined — they handle it
        // via their own callback so it's fine, but we need to pass `item` too
        // for callbacks that might need the full row context.
        const statusClass = column.getStatusClass
          ? column.getStatusClass(value, item)
          : (value ?? "inactive");
        const statusText = column.getStatusText
          ? column.getStatusText(value, item)
          : (value ?? "—");
        return (
          <span className={`dt-badge dt-badge--${statusClass}`}>
            <span className="dt-badge-dot" />
            {statusText}
          </span>
        );
      }

      case "role":
        return (
          <span
            className={`dt-role dt-role--${value === "admin" ? "admin" : "user"}`}
          >
            {value === "admin" ? t("table.admin") : t("table.user")}
          </span>
        );

      case "progress": {
        // FIX: wrapped in block scope to allow const inside switch
        const pct = Math.min(100, Math.max(0, (value || 0) * 10));
        return (
          <div className="dt-progress-wrap">
            <div className="dt-progress-bar">
              <div className="dt-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="dt-progress-val">{value || 0}</span>
          </div>
        );
      }

      case "actions":
        return (
          <div className="dt-actions">
            {actions.map((action, i) => {
              const Icon = action.icon;
              // FIX: isVisible returning false hides the button — render null
              if (action.isVisible && !action.isVisible(item)) return null;
              return (
                <Button
                  key={i}
                  variant={action.variant || "edit"}
                  size="icon"
                  aria-label={action.label}
                  tooltipLabel={action.tooltipKey}
                  onClick={() => action.onClick(item)}
                  disabled={action.isDisabled?.(item) || false}
                >
                  <Icon size={15} />
                </Button>
              );
            })}
          </div>
        );

      case "custom":
        return column.render ? column.render(item, rowIndex) : (value ?? "—");

      default:
        return value ?? "—";
    }
  };

  const showToolbar = searchable || filters.length > 0 || onRefresh || title;
  const isLoading = loading && !(cacheKey && cachedData);

  return (
    <>
      <style>{`
        /* ── DynamicTable Premium Styles ────────────────────────── */
        .dt-root {
          --dt-bg: #ffffff;
          --dt-surface: #f8fafc;
          --dt-border: #e2e8f0;
          --dt-text: #0f172a;
          --dt-muted: #64748b;
          --dt-accent: #e8853f;
          --dt-accent-light: rgba(232, 133, 63, 0.08);
          --dt-accent-hover: #c96b28;
          --dt-head-bg: #f8fafc;
          --dt-head-text: #64748b;
          --dt-row-hover: #f8fafc;
          --dt-radius: 14px;
          --dt-shadow: 0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04);
          font-family: 'DM Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dt-bg);
          border-radius: var(--dt-radius);
          box-shadow: var(--dt-shadow);
          overflow: hidden;
          border: 1px solid var(--dt-border);
        }
        .dt-root * { box-sizing: border-box; }

        /* ── Toolbar ── */
        .dt-toolbar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 22px 14px;
          background: #fff;
          border-bottom: 1px solid var(--dt-border);
          flex-wrap: wrap;
        }
        .dt-toolbar-left { flex: 1; min-width: 0; }
        .dt-title {
          font-size: 15px;
          font-weight: 800;
          color: var(--dt-text);
          letter-spacing: -0.01em;
          line-height: 1.3;
          margin-bottom: 2px;
        }
        .dt-subtitle-text {
          font-size: 12px;
          color: var(--dt-muted);
          font-weight: 500;
        }
        .dt-toolbar-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          flex-wrap: wrap;
        }

        /* ── Search ── */
        .dt-search-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .dt-search-icon {
          position: absolute;
          left: 11px;
          color: var(--dt-muted);
          pointer-events: none;
          display: flex;
          z-index: 2;
        }
        .dt-search {
          height: 36px;
          padding: 0 32px 0 34px;
          font-size: 13px;
          font-weight: 500;
          font-family: inherit;
          border: 1.5px solid var(--dt-border);
          border-radius: 9px;
          outline: none;
          background: #f8fafc;
          color: var(--dt-text);
          width: 210px;
          transition: all 0.2s ease;
        }
        .dt-search::placeholder { color: var(--dt-muted); font-weight: 400; }
        .dt-search:focus {
          border-color: var(--dt-accent);
          background: #fff;
          box-shadow: 0 0 0 3px rgba(232,133,63,0.12);
          width: 250px;
        }
        .dt-search-clear {
          position: absolute;
          right: 9px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--dt-muted);
          display: flex;
          padding: 4px;
          border-radius: 5px;
          transition: all 0.15s;
          z-index: 2;
        }
        .dt-search-clear:hover { color: var(--dt-text); background: rgba(0,0,0,0.06); }

        /* Search spinner */
        .dt-search-spinner {
          width: 14px; height: 14px;
          border: 2px solid var(--dt-border);
          border-top-color: var(--dt-accent);
          border-radius: 50%;
          animation: dt-spin 0.8s linear infinite;
        }
        @keyframes dt-spin { to { transform: rotate(360deg); } }

        /* ── Filters ── */
        .dt-filter-group {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .dt-filter-label {
          font-size: 12px;
          color: var(--dt-muted);
          display: flex;
          align-items: center;
          gap: 5px;
          font-weight: 600;
          padding: 5px 9px;
          background: #f1f5f9;
          border-radius: 7px;
          white-space: nowrap;
        }
        .dt-filter-select {
          height: 36px;
          padding: 0 30px 0 11px;
          font-size: 12.5px;
          font-weight: 500;
          font-family: inherit;
          border: 1.5px solid var(--dt-border);
          border-radius: 9px;
          outline: none;
          background: #fff;
          color: var(--dt-text);
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2364748b' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          transition: all 0.2s;
        }
        .dt-filter-select:focus { border-color: var(--dt-accent); box-shadow: 0 0 0 3px rgba(232,133,63,0.12); }
        .dt-filter-select.dt-filter-active {
          border-color: var(--dt-accent);
          background-color: rgba(232,133,63,0.06);
          color: var(--dt-accent-hover);
          font-weight: 600;
        }
        .dt-filter-count {
          background: var(--dt-accent);
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 10px;
        }
        .dt-clear-filters {
          height: 36px;
          padding: 0 11px;
          font-size: 12px;
          font-weight: 600;
          font-family: inherit;
          border: 1.5px solid #fecaca;
          border-radius: 9px;
          background: #fef2f2;
          cursor: pointer;
          color: #dc2626;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: all 0.15s;
        }
        .dt-clear-filters:hover {
          border-color: #f87171;
          background: #fee2e2;
          color: #b91c1c;
        }

        /* ── Refresh btn ── */
        .dt-refresh-btn {
          height: 36px; width: 36px;
          display: flex; align-items: center; justify-content: center;
          border: 1.5px solid var(--dt-border);
          border-radius: 9px;
          background: #f8fafc;
          cursor: pointer;
          color: var(--dt-muted);
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .dt-refresh-btn:hover:not(:disabled) {
          border-color: var(--dt-accent);
          color: var(--dt-accent);
          background: var(--dt-accent-light);
          transform: rotate(30deg);
        }
        .dt-refresh-btn:disabled { opacity: 0.45; cursor: default; }

        /* ── Table wrapper ── */
        .dt-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }

        /* ── Table ── */
        table.dt-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13.5px;
          background: #fff;
          /* FIX: min-width ensures columns don't collapse when few columns defined */
          min-width: 100%;
        }

        /* ── Head ── */
        .dt-table thead tr {
          background: var(--dt-head-bg);
        }
        .dt-table th {
          padding: 12px 20px;
          text-align: left;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--dt-head-text);
          white-space: nowrap;
          border-bottom: 1.5px solid var(--dt-border);
          user-select: none;
          /* FIX: consistent width behavior */
          vertical-align: middle;
        }
        .dt-table th.dt-center { text-align: center; }
        .dt-table th.dt-sortable { cursor: pointer; transition: color 0.18s; }
        .dt-table th.dt-sortable:hover { color: var(--dt-accent); }

        .dt-sort-icons {
          display: inline-flex;
          flex-direction: column;
          margin-left: 5px;
          vertical-align: middle;
          gap: 1px;
          position: relative;
          top: -1px;
        }
        .dt-sort-icons span {
          color: #d1d5db;
          line-height: 0;
          display: flex;
          transition: color 0.18s;
        }
        .dt-sort-icons span.dt-sort-active { color: var(--dt-accent); }

        /* ── Body rows ── */
        .dt-table tbody tr {
          border-bottom: 1px solid rgba(226,232,240,0.7);
          transition: background 0.12s;
        }
        .dt-table tbody tr:hover { background: var(--dt-row-hover); }
        .dt-table tbody tr:last-child { border-bottom: none; }
        .dt-table tbody tr.dt-skeleton-row:hover { background: transparent; }

        /* ── Cells ── */
        .dt-table td {
          padding: 14px 20px;
          color: var(--dt-text);
          vertical-align: middle;
          /* FIX: ensure cells never collapse to 0 */
          min-width: 60px;
        }
        .dt-table td.dt-center { text-align: center; }
        .dt-table tbody tr:last-child td { border-bottom: none; }

        /* ── Skeleton ── */
        .dt-skeleton-cell {
          height: 16px;
          border-radius: 8px;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: dt-shimmer 1.4s infinite;
        }
        @keyframes dt-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ── Empty state ── */
        .dt-empty {
          text-align: center;
          padding: 60px 24px;
          color: var(--dt-muted);
        }
        .dt-empty-icon {
          width: 44px; height: 44px;
          margin: 0 auto 14px;
          opacity: 0.25;
        }
        .dt-empty-text {
          font-size: 14px;
          font-weight: 600;
          color: var(--dt-muted);
        }

        /* ── Avatar cell ── */
        /* FIX: unified class name — old file used "dt-avatar-meta", CSS file
           used "dt-avatar-info". Standardized to "dt-avatar-meta" everywhere. */
        .dt-user-info {
          display: flex;
          align-items: center;
          gap: 11px;
          /* FIX: prevent wrapping / collapse in narrow columns */
          min-width: 0;
        }
        .dt-avatar {
          width: 38px; height: 38px;
          border-radius: 10px;
          background: rgba(232,133,63,0.12);
          color: #c96b28;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 800;
          flex-shrink: 0;
          border: 2px solid #fff;
          box-shadow: 0 1px 4px rgba(15,23,42,0.10);
        }
        .dt-avatar-meta {
          min-width: 0;
          /* FIX: allow text truncation in narrow columns */
          overflow: hidden;
        }
        .dt-name {
          font-weight: 700;
          font-size: 13.5px;
          color: var(--dt-text);
          line-height: 1.3;
          /* FIX: truncate long names */
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 180px;
        }
        .dt-subtitle {
          font-size: 11.5px;
          color: var(--dt-muted);
          margin-top: 2px;
          font-family: 'DM Mono', monospace;
          white-space: nowrap;
        }

        /* ── Status badge ── */
        .dt-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 11.5px;
          font-weight: 700;
          white-space: nowrap;
          letter-spacing: 0.02em;
        }
        .dt-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: currentColor;
          flex-shrink: 0;
        }
        .dt-badge--active, .dt-badge--approved {
          color: #065f46;
          background: rgba(16,185,129,0.10);
          border: 1px solid rgba(16,185,129,0.22);
        }
        .dt-badge--pending {
          color: #92400e;
          background: rgba(245,158,11,0.10);
          border: 1px solid rgba(245,158,11,0.22);
        }
        .dt-badge--inactive, .dt-badge--rejected {
          color: #991b1b;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.18);
        }

        /* ── Role chip ── */
        .dt-role {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 7px;
          font-size: 11.5px;
          font-weight: 700;
          white-space: nowrap;
          letter-spacing: 0.03em;
        }
        .dt-role--admin {
          background: rgba(124,58,237,0.09);
          color: #6d28d9;
          border: 1px solid rgba(124,58,237,0.18);
        }
        .dt-role--user {
          background: rgba(37,99,235,0.08);
          color: #1d4ed8;
          border: 1px solid rgba(37,99,235,0.18);
        }

        /* ── Rating ── */
        .dt-rating { color: #f59e0b; font-size: 14px; letter-spacing: 1px; }
        .dt-rating-empty { color: #e2e8f0; }

        /* ── Progress ── */
        .dt-progress-wrap { display: flex; align-items: center; gap: 9px; }
        .dt-progress-bar {
          flex: 1; max-width: 80px; height: 5px;
          background: #f1f5f9;
          border-radius: 999px;
          overflow: hidden;
        }
        .dt-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--dt-accent), #f97316);
          border-radius: 999px;
          transition: width 0.6s ease;
        }
        .dt-progress-val {
          font-size: 12px;
          color: var(--dt-muted);
          font-weight: 700;
          min-width: 20px;
          text-align: right;
          font-family: 'DM Mono', monospace;
        }

        /* ── Actions cell ── */
        .dt-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          /* FIX: prevent action buttons from being squeezed */
          flex-wrap: nowrap;
          min-width: max-content;
        }

        /* ── Results bar ── */
        .dt-results-bar {
          padding: 11px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid var(--dt-border);
          font-size: 12px;
          color: var(--dt-muted);
          background: #f8fafc;
          font-weight: 500;
        }
        .dt-results-bar strong { color: var(--dt-text); font-weight: 700; }

        /* ── Pagination wrapper ── */
        .dt-pagination {
          padding: 14px 22px 18px;
          background: #fff;
          border-top: 1px solid var(--dt-border);
        }
      `}</style>

      <div className={cn("dt-root", className)} {...props}>
        {/* ── Toolbar ──────────────────────────────────────────── */}
        {showToolbar && (
          <div className="dt-toolbar">
            {(title || subtitle) && (
              <div className="dt-toolbar-left">
                {title && <div className="dt-title">{title}</div>}
                {subtitle && <div className="dt-subtitle-text">{subtitle}</div>}
              </div>
            )}

            <div className="dt-toolbar-right">
              {/* Filters */}
              {filters.length > 0 && (
                <div className="dt-filter-group">
                  <span className="dt-filter-label">
                    <FilterIcon /> {t("table.filters")}
                    {activeFilterCount > 0 && (
                      <span className="dt-filter-count">
                        {activeFilterCount}
                      </span>
                    )}
                  </span>
                  {filters.map((f) => (
                    <select
                      key={f.key}
                      className={cn(
                        "dt-filter-select",
                        activeFilters[f.key] ? "dt-filter-active" : "",
                      )}
                      value={activeFilters[f.key] ?? ""}
                      onChange={(e) => setFilter(f.key, e.target.value)}
                      title={f.label}
                    >
                      <option value="">{f.label}</option>
                      {f.options.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ))}
                  {activeFilterCount > 0 && (
                    <button
                      className="dt-clear-filters"
                      onClick={() => setActiveFilters({})}
                    >
                      <XIcon /> {t("table.clear")}
                    </button>
                  )}
                </div>
              )}

              {/* Search */}
              {searchable && (
                <div className="dt-search-wrap">
                  <span className="dt-search-icon">
                    {searchLoading ? (
                      <div className="dt-search-spinner" />
                    ) : (
                      <SearchIcon />
                    )}
                  </span>
                  <input
                    type="text"
                    className="dt-search"
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      className="dt-search-clear"
                      onClick={() => handleSearchChange("")}
                      title="Clear search"
                    >
                      <XIcon />
                    </button>
                  )}
                </div>
              )}

              {/* Refresh */}
              {onRefresh && (
                <button
                  className="dt-refresh-btn"
                  onClick={handleRefresh}
                  disabled={refreshing || loading}
                  title="Refresh data"
                >
                  <RefreshIcon spinning={refreshing || loading} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Table ────────────────────────────────────────────── */}
        <div className="dt-table-wrap">
          <table className="dt-table">
            <thead>
              <tr>
                {columns.map((col, i) => (
                  <th
                    key={i}
                    className={cn(
                      col.align === "center" ? "dt-center" : "",
                      col.sortable ? "dt-sortable" : "",
                    )}
                    onClick={() => col.sortable && handleSort(col.key)}
                    /* FIX: add explicit width hint for "actions" column so it
                       doesn't steal space from data columns */
                    style={
                      col.type === "actions"
                        ? { width: 1, whiteSpace: "nowrap" }
                        : undefined
                    }
                  >
                    {col.title}
                    {col.sortable && (
                      <span className="dt-sort-icons">
                        <span
                          className={
                            sortConfig.key === col.key &&
                            sortConfig.direction === "asc"
                              ? "dt-sort-active"
                              : ""
                          }
                        >
                          <ChevronUp />
                        </span>
                        <span
                          className={
                            sortConfig.key === col.key &&
                            sortConfig.direction === "desc"
                              ? "dt-sort-active"
                              : ""
                          }
                        >
                          <ChevronDown />
                        </span>
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} cols={columns.length} />
                ))
              ) : processedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} style={{ padding: 0 }}>
                    <div className="dt-empty">
                      <svg
                        className="dt-empty-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                      <div className="dt-empty-text">{emptyMessage}</div>
                    </div>
                  </td>
                </tr>
              ) : (
                processedData.map((item, rowIndex) => (
                  <tr key={item._id ?? rowIndex}>
                    {columns.map((col, ci) => (
                      <td
                        key={ci}
                        className={cn(
                          col.align === "center" ? "dt-center" : "",
                          col.type === "actions" ? "dt-center" : "",
                          col.className || "",
                        )}
                        /* FIX: actions column keeps natural width */
                        style={
                          col.type === "actions"
                            ? { width: 1, whiteSpace: "nowrap" }
                            : undefined
                        }
                      >
                        {renderCellContent(col, item, rowIndex)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Results info */}
        {!isLoading && processedData.length > 0 && (
          <div className="dt-results-bar">
            <span>
              Showing <strong>{processedData.length}</strong>
              {pagination?.totalItems
                ? ` of ${pagination.totalItems}`
                : ""}{" "}
              results
              {(searchTerm || activeFilterCount > 0) && " (filtered)"}
            </span>
            {cacheKey && (
              <span style={{ fontSize: 11, opacity: 0.6 }}>● Cached</span>
            )}
          </div>
        )}

        {/* Enhanced Pagination */}
        {pagination && onPageChange && (
          <div className="dt-pagination">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              limit={pagination.limit || 10}
              onPageChange={onPageChange}
              onPageSizeChange={(newSize) => {
                // Reset to first page when changing page size
                onPageChange(1);
                // Trigger a refresh with new page size
                if (onRefresh) onRefresh();
              }}
              showItemsInfo={true}
              showPageSizeSelector={true}
              pageSizeOptions={[5, 10, 25, 50]}
              className="dt-pagination-enhanced"
            />
          </div>
        )}
      </div>
    </>
  );
};

DynamicTable.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  emptyMessage: PropTypes.string,
  loadingMessage: PropTypes.string,
  pagination: PropTypes.shape({
    currentPage: PropTypes.number,
    totalPages: PropTypes.number,
    totalItems: PropTypes.number,
  }),
  onPageChange: PropTypes.func,
  actions: PropTypes.array,
  className: PropTypes.string,
  searchable: PropTypes.bool,
  searchPlaceholder: PropTypes.string,
  searchKeys: PropTypes.arrayOf(PropTypes.string),
  searchMode: PropTypes.oneOf(["client", "server"]),
  onSearch: PropTypes.func,
  searchDebounceMs: PropTypes.number,
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      options: PropTypes.arrayOf(
        PropTypes.shape({ value: PropTypes.string, label: PropTypes.string }),
      ).isRequired,
    }),
  ),
  onRefresh: PropTypes.func,
  cacheKey: PropTypes.string,
  cacheTTL: PropTypes.number,
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

export { tableCache };
export default DynamicTable;
