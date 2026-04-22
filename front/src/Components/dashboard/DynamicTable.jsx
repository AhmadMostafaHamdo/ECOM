import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { RefreshCcw, Search, X, ArrowUpDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import Pagination from "../common/Pagination";
import { ROOT_URL } from "../../api";

const tableCache = new Map();

export const invalidateCache = (cacheKey) => {
  if (cacheKey) {
    tableCache.delete(cacheKey);
    return;
  }

  tableCache.clear();
};

const cn = (...classes) => classes.filter(Boolean).join(" ");

const getPathValue = (item, path) => {
  if (!path) {
    return "";
  }

  return path.split(".").reduce((value, key) => value?.[key], item);
};

const getComparableValue = (item, column) => {
  if (typeof column.sortValue === "function") {
    return column.sortValue(item);
  }

  if (column.type === "avatar" && typeof column.getName === "function") {
    return column.getName(item);
  }

  const value = getPathValue(item, column.key);

  if (value == null) {
    return "";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return value;
};

const getSearchableValue = (item, searchKeys) => {
  const keys =
    searchKeys.length > 0
      ? searchKeys
      : Object.keys(item).filter((key) => {
        const value = item[key];
        return typeof value === "string" || typeof value === "number";
      });

  return keys
    .map((key) => getPathValue(item, key))
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

const getImageSource = (value) => {
  if (!value) {
    return "";
  }

  if (value.startsWith("http") || value.startsWith("blob:")) {
    return value;
  }

  if (value.startsWith("/uploads")) {
    return `${ROOT_URL}${value}`;
  }

  return value;
};

const SkeletonRows = ({ columns }) =>
  Array.from({ length: 5 }).map((_, rowIndex) => (
    <tr key={`skeleton-${rowIndex}`}>
      {columns.map((column, columnIndex) => (
        <td key={`${column.key}-${columnIndex}`}>
          <div className="admin-table__skeleton" />
        </td>
      ))}
    </tr>
  ));

const DynamicTable = ({
  data = [],
  columns = [],
  loading = false,
  emptyMessage = "No data found",
  loadingMessage = "Loading...",
  pagination = null,
  onPageChange = null,
  onPageSizeChange = null,
  actions = [],
  className = "",
  searchable = true,
  searchPlaceholder = "Search...",
  searchKeys = [],
  searchMode = "client",
  onSearch = null,
  searchDebounceMs = 300,
  filters = [],
  onFilterChange = null,
  onRefresh = null,
  cacheKey = null,
  cacheTTL = 30000,
  title = "",
  subtitle = "",
  ...props
}) => {
  const { t } = useTranslation();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [searchPending, setSearchPending] = useState(false);
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const searchTimeoutRef = useRef(null);

  const cachedData = useMemo(() => {
    if (!cacheKey) {
      return null;
    }

    const cacheEntry = tableCache.get(cacheKey);

    if (!cacheEntry) {
      return null;
    }

    if (Date.now() - cacheEntry.timestamp > cacheTTL) {
      tableCache.delete(cacheKey);
      return null;
    }

    return cacheEntry.data;
  }, [cacheKey, cacheTTL, loading]);

  useEffect(() => {
    if (cacheKey && data.length > 0) {
      tableCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });
    }
  }, [cacheKey, data]);

  useEffect(() => {
    if (searchMode !== "server" || !onSearch) {
      return undefined;
    }

    setSearchPending(true);
    clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      onSearch(searchTerm);
      setSearchPending(false);
    }, searchDebounceMs);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [onSearch, searchDebounceMs, searchMode, searchTerm]);

  const displayedData = cacheKey && cachedData && loading ? cachedData : data;

  const processedData = useMemo(() => {
    const collection = [...displayedData];

    let nextData = collection;

    if (searchMode === "client" && deferredSearchTerm.trim()) {
      const normalizedTerm = deferredSearchTerm.toLowerCase();
      nextData = nextData.filter((item) =>
        getSearchableValue(item, searchKeys).includes(normalizedTerm),
      );
    }

    if (searchMode === "client" && Object.keys(activeFilters).length > 0) {
      nextData = nextData.filter((item) =>
        Object.entries(activeFilters).every(([key, value]) => {
          if (!value || value === "all") {
            return true;
          }

          return String(getPathValue(item, key)) === String(value);
        }),
      );
    }

    if (sortConfig.key) {
      const sortColumn = columns.find((column) => column.key === sortConfig.key);

      if (sortColumn) {
        nextData.sort((leftItem, rightItem) => {
          const leftValue = getComparableValue(leftItem, sortColumn);
          const rightValue = getComparableValue(rightItem, sortColumn);

          if (leftValue === rightValue) {
            return 0;
          }

          const leftText = String(leftValue).toLowerCase();
          const rightText = String(rightValue).toLowerCase();
          const direction = sortConfig.direction === "asc" ? 1 : -1;

          return leftText > rightText ? direction : -direction;
        });
      }
    }

    return nextData;
  }, [activeFilters, columns, deferredSearchTerm, displayedData, searchKeys, searchMode, sortConfig]);

  const handleSort = useCallback((column) => {
    if (!column.sortable) {
      return;
    }

    setSortConfig((current) => ({
      key: column.key,
      direction:
        current.key === column.key && current.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  const handleFilterChange = useCallback(
    (key, value) => {
      setActiveFilters((current) => {
        if (!value || value === "all") {
          const nextFilters = { ...current };
          delete nextFilters[key];
          return nextFilters;
        }

        return {
          ...current,
          [key]: value,
        };
      });

      if (onFilterChange) {
        onFilterChange(key, value);
      }
    },
    [onFilterChange],
  );

  const handleRefresh = useCallback(() => {
    if (cacheKey) {
      tableCache.delete(cacheKey);
    }

    onRefresh?.();
  }, [cacheKey, onRefresh]);

  const renderCellContent = useCallback(
    (column, item, index) => {
      const value = getPathValue(item, column.key);

      switch (column.type) {
        case "avatar": {
          const avatarImage = column.getAvatarImage?.(item);
          const avatarLabel = column.getAvatarText?.(item) ?? String(value || "?").charAt(0);
          const title = column.getName?.(item) ?? value ?? "—";
          const subtitle = column.getSubtitle?.(item);

          return (
            <div className="admin-table__avatar-wrap">
              <div className="admin-table__avatar">
                {avatarImage ? (
                  <img src={getImageSource(avatarImage)} alt="" />
                ) : (
                  <span>{avatarLabel}</span>
                )}
              </div>
              <div className="admin-table__avatar-meta">
                <div className="admin-table__avatar-name">{title}</div>
                {subtitle ? (
                  <div className="admin-table__avatar-subtitle">{subtitle}</div>
                ) : null}
              </div>
            </div>
          );
        }

        case "status": {
          const statusClass = column.getStatusClass?.(value, item) ?? value ?? "default";
          const statusText = column.getStatusText?.(value, item) ?? value ?? "—";
          return (
            <span className={`admin-table__status status--${String(statusClass).toLowerCase()}`}>
              {statusText}
            </span>
          );
        }

        case "role": {
          const normalized = String(value || "default").toLowerCase();
          const roleClass =
            normalized === "admin" ? "admin" : normalized === "user" ? "user" : "default";
          const label =
            normalized === "admin"
              ? t("table.admin")
              : normalized === "user"
                ? t("table.user")
                : value ?? "—";

          return <span className={`admin-table__role role--${roleClass}`}>{label}</span>;
        }

        case "progress": {
          const numericValue = Number(value || 0);

          return (
            <div className="admin-table__progress">
              <progress className="admin-table__progress-bar" value={numericValue} max={10} />
              <span>{numericValue}</span>
            </div>
          );
        }

        case "actions":
          return (
            <div className="admin-table__actions-group">
              {actions.map((action, actionIndex) => {
                if (action.isVisible && !action.isVisible(item)) {
                  return null;
                }

                const Icon = action.icon;
                const variant = action.variant || "default";

                return (
                  <button
                    key={`${action.label}-${actionIndex}`}
                    type="button"
                    className={`admin-icon-button admin-icon-button--${variant}`}
                    aria-label={action.label}
                    title={action.label}
                    onClick={() => action.onClick(item)}
                    disabled={action.isDisabled?.(item) || false}
                  >
                    <Icon size={16} />
                  </button>
                );
              })}
            </div>
          );

        case "custom":
          return column.render ? column.render(item, index) : value ?? "—";

        default:
          return value ?? "—";
      }
    },
    [actions, t],
  );

  const showToolbar = searchable || filters.length > 0 || onRefresh || title || subtitle;
  const isLoading = loading && !(cacheKey && cachedData);

  return (
    <div className={cn("admin-table", className)} {...props}>
      {showToolbar ? (
        <div className="admin-table__toolbar">
          <div>
            {title ? <h2 className="admin-table__title">{title}</h2> : null}
            {subtitle ? <p className="admin-table__subtitle">{subtitle}</p> : null}
          </div>

          <div className="admin-table__actions">
            {filters.length > 0 ? (
              <>
                {filters.map((filter) => (
                  <label key={filter.key} className="admin-table__filter">
                    <select
                      value={activeFilters[filter.key] ?? "all"}
                      onChange={(event) => handleFilterChange(filter.key, event.target.value)}
                    >
                      {filter.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </>
            ) : null}

            {searchable ? (
              <label className="admin-table__search">
                <Search size={16} />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={searchPlaceholder}
                />
                {searchTerm ? (
                  <button type="button" onClick={() => setSearchTerm("")} aria-label={t("table.clear")}>
                    <X size={14} />
                  </button>
                ) : null}
              </label>
            ) : null}

            {onRefresh ? (
              <button
                type="button"
                className={cn("admin-table__refresh", (loading || searchPending) && "is-spinning")}
                onClick={handleRefresh}
                aria-label={t("common.refresh", "Refresh")}
              >
                <RefreshCcw size={16} />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="admin-table__scroll">
        <table className="admin-table__grid">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={column.align === "center" ? "admin-table__cell--center" : ""}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      className="admin-table__sort"
                      onClick={() => handleSort(column)}
                    >
                      <span>{column.title}</span>
                      <ArrowUpDown size={14} />
                    </button>
                  ) : (
                    column.title
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <SkeletonRows columns={columns} />
            ) : processedData.length > 0 ? (
              processedData.map((item, index) => (
                <tr key={item._id ?? index}>
                  {columns.map((column) => (
                    <td
                      key={`${column.key}-${item._id ?? index}`}
                      className={column.align === "center" ? "admin-table__cell--center" : ""}
                    >
                      {renderCellContent(column, item, index)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length}>
                  <div className="admin-table__empty">
                    <div>{emptyMessage}</div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-table-cards">
        {isLoading ? (
          <div className="admin-table__loading">{loadingMessage}</div>
        ) : processedData.length > 0 ? (
          processedData.map((item, index) => (
            <article key={`card-${item._id ?? index}`} className="admin-table-card">
              {columns.map((column) => (
                <div key={`${column.key}-card-${item._id ?? index}`} className="admin-table-card__field">
                  <span className="admin-table-card__label">{column.title}</span>
                  <div>{renderCellContent(column, item, index)}</div>
                </div>
              ))}
            </article>
          ))
        ) : (
          <div className="admin-table__empty">{emptyMessage}</div>
        )}
      </div>

      {pagination && onPageChange ? (
        <div className="admin-table__footer">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            limit={pagination.limit || 10}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            showItemsInfo
            showPageSizeSelector={Boolean(onPageSizeChange)}
            pageSizeOptions={[5, 10, 25, 50]}
          />
        </div>
      ) : null}
    </div>
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
    limit: PropTypes.number,
  }),
  onPageChange: PropTypes.func,
  onPageSizeChange: PropTypes.func,
  actions: PropTypes.array,
  className: PropTypes.string,
  searchable: PropTypes.bool,
  searchPlaceholder: PropTypes.string,
  searchKeys: PropTypes.arrayOf(PropTypes.string),
  searchMode: PropTypes.oneOf(["client", "server"]),
  onSearch: PropTypes.func,
  searchDebounceMs: PropTypes.number,
  filters: PropTypes.array,
  onFilterChange: PropTypes.func,
  onRefresh: PropTypes.func,
  cacheKey: PropTypes.string,
  cacheTTL: PropTypes.number,
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

export { tableCache };
export default React.memo(DynamicTable);
