/* eslint-disable react/prop-types */
import React from "react";
import {
  defaultCountries,
  FlagImage,
  parseCountry,
  usePhoneInput,
} from "react-international-phone";
import { ChevronDown, Check, Search } from "lucide-react";
import { parsePhoneNumber, format } from "libphonenumber-js";
import { cn } from "../../lib/utils";
import { useTranslation } from "react-i18next";
import {
  getTranslatedCountryName,
  getSearchableCountryNames,
} from "../../utils/countryTranslations";
import "./phone-input.css";

function PhoneInputComponent({
  value,
  filter,
  onChange,
  onCountryChange,
  defaultCountry = "om",
  inputClassName = "",
  id,
  name,
  placeholder = "",
  disabled = false,
  required = false,
  autoFocus = false,
  onFocus,
  onBlur,
  error = false,
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);
  const triggerRef = React.useRef(null);
  const searchInputRef = React.useRef(null);

  const { inputValue, inputRef, country, setCountry } = usePhoneInput({
    defaultCountry,
    value,
    countries: defaultCountries,
  });

  // Emit country change when country updates
  React.useEffect(() => {
    if (onCountryChange && country) {
      onCountryChange(country);
    }
  }, [country, onCountryChange]);

  const stripRegex = React.useMemo(() => {
    const dial = country?.dialCode || "";
    return new RegExp(`^\\+${dial}\\s*`);
  }, [country?.dialCode]);

  const national = React.useMemo(
    () => (inputValue || "").replace(stripRegex, ""),
    [inputValue, stripRegex],
  );

  const rafId = React.useRef(0);
  const emit = React.useCallback(
    (e164) => {
      if (!onChange) return;
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => onChange(e164));
    },
    [onChange],
  );

  const onNationalChange = React.useCallback(
    (e) => {
      const raw = e.target.value || "";
      const digits = raw.replace(/\D/g, ""); // Keep only digits

      if (!digits) {
        emit("");
        return;
      }

      const iso2 = country?.iso2?.toUpperCase();
      let e164 = digits;

      try {
        const parsed = iso2
          ? parsePhoneNumber(digits, iso2)
          : parsePhoneNumber(digits);

        if (parsed) {
          e164 = format(parsed, "E.164");
        }
      } catch {
        const dial = country?.dialCode;
        if (dial) {
           e164 = `+${dial}${digits}`;
        } else {
           e164 = `+${digits}`;
        }
      }

      emit(e164);
    },
    [country?.dialCode, country?.iso2, emit],
  );

  React.useEffect(() => () => cancelAnimationFrame(rafId.current), []);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const viewportRef = React.useRef(null);
  const itemRefs = React.useRef({});

  // Get current language for translations
  const { i18n, t } = useTranslation();
  const language = i18n.language;

  const countryList = React.useMemo(
    () =>
      defaultCountries.map((c) => {
        const parsed = parseCountry(c);
        return {
          raw: c,
          parsed,
          searchableNames: getSearchableCountryNames(parsed.iso2, parsed.name),
          displayName: getTranslatedCountryName(
            parsed.iso2,
            parsed.name,
            language,
          ),
        };
      }),
    [language],
  );

  const filteredCountries = React.useMemo(() => {
    if (!searchQuery.trim()) return countryList;
    const query = searchQuery.toLowerCase().replace(/^\+/, "").trim();
    return countryList.filter(
      (item) =>
        item.searchableNames.some((name) =>
          name.toLowerCase().includes(query),
        ) ||
        item.parsed.iso2.toLowerCase().includes(query) ||
        item.parsed.dialCode.includes(query),
    );
  }, [searchQuery, countryList]);

  const iso2 = country?.iso2 || defaultCountry;

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // When dropdown opens, start from the currently selected country
  React.useEffect(() => {
    if (isOpen) {
      const currentIndex = filteredCountries.findIndex(
        (item) => item.parsed.iso2.toLowerCase() === iso2.toLowerCase(),
      );
      setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
      
      // Focus search input after a short delay to allow animation
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery("");
      setHighlightedIndex(-1);
    }
  }, [isOpen]); // Removed iso2 and filteredCountries from deps to avoid jumping while searching

  // Reset highlighted index when search query changes
  React.useEffect(() => {
    if (searchQuery && filteredCountries.length > 0) {
      setHighlightedIndex(0);
    }
  }, [searchQuery, filteredCountries.length]);

  // Auto-scroll to highlighted item
  React.useEffect(() => {
    if (
      highlightedIndex >= 0 &&
      viewportRef.current &&
      itemRefs.current[highlightedIndex]
    ) {
      const item = itemRefs.current[highlightedIndex];
      const viewport = viewportRef.current;

      const itemTop = item.offsetTop;
      const itemHeight = item.offsetHeight;
      const viewportScrollTop = viewport.scrollTop;
      const viewportHeight = viewport.clientHeight;

      if (itemTop < viewportScrollTop) {
        viewport.scrollTop = itemTop;
      } else if (itemTop + itemHeight > viewportScrollTop + viewportHeight) {
        viewport.scrollTop = itemTop + itemHeight - viewportHeight;
      }
    }
  }, [highlightedIndex]);

  const handleKeyDown = React.useCallback(
    (e) => {
      if (!isOpen) {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredCountries.length - 1 ? prev + 1 : 0,
        );
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCountries.length - 1,
        );
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredCountries[highlightedIndex]) {
          setCountry(filteredCountries[highlightedIndex].parsed.iso2);
          setIsOpen(false);
          inputRef.current?.focus();
        }
        return;
      }

      if (e.key === "Escape" || e.key === "Tab") {
        setIsOpen(false);
        return;
      }
    },
    [isOpen, filteredCountries, highlightedIndex, setCountry, inputRef],
  );

  const handleCountrySelect = (countryIso2) => {
    setCountry(countryIso2);
    setIsOpen(false);
    // Focus the actual phone input after selection
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  return (
    <div className="w-full">
      <div 
        className={cn(
          "phone-input--container", 
          isOpen && "is-open",
          error && "error", 
          filter ? "h-8" : ""
        )}
      >
        <button
          ref={triggerRef}
          type="button"
          className="phone-input--trigger"
          aria-label="Select country"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
        >
          <FlagImage
            iso2={iso2}
            className="h-4 w-6 rounded-[2px] shrink-0"
          />
          <span className="dial-code">
            +{country?.dialCode || ""}
          </span>
          <ChevronDown
            className={cn("h-4 w-4 text-gray-400 transition-transform duration-200", isOpen && "rotate-180")}
          />
        </button>

        <div className="phone-input--divider" />

        <input
          ref={inputRef}
          type="tel"
          name={name}
          id={id}
          value={national}
          onChange={onNationalChange}
          placeholder={placeholder || t("auth.phonePlaceholder", "رقم الهاتف")}
          disabled={disabled}
          required={required}
          autoFocus={autoFocus}
          onFocus={onFocus}
          onBlur={onBlur}
          className={cn("phone-input--field", inputClassName)}
        />

        {isOpen && (
          <div
            ref={dropdownRef}
            className="phone-input--dropdown"
            role="listbox"
          >
            <div className="phone-input--search-wrap">
              <div className="relative flex items-center">
                <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("auth.searchCountry", "البحث عن دولة...")}
                  className="phone-input--search pl-9"
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>
            <div
              ref={viewportRef}
              className="phone-input--list"
            >
              {filteredCountries.length > 0 ? (
                filteredCountries.map(
                  ({ parsed: cc, displayName }, index) => {
                    const isSelected = cc.iso2.toLowerCase() === iso2.toLowerCase();
                    return (
                      <div
                        key={cc.iso2}
                        ref={(el) => {
                          if (el) itemRefs.current[index] = el;
                        }}
                        role="option"
                        aria-selected={isSelected}
                        className={cn(
                          "phone-input--item",
                          index === highlightedIndex && "highlighted",
                          isSelected && "selected"
                        )}
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent blur of search input
                          handleCountrySelect(cc.iso2);
                        }}
                        onMouseEnter={() => setHighlightedIndex(index)}
                      >
                        <FlagImage
                          iso2={cc.iso2}
                          className="h-4 w-6 rounded-[2px] shrink-0"
                        />
                        <span className="phone-input--country-name">
                          {displayName}
                        </span>
                        <span className="phone-input--dial-code">
                          +{cc.dialCode}
                        </span>
                        {isSelected && (
                          <Check className="phone-input--check" />
                        )}
                      </div>
                    );
                  }
                )
              ) : (
                <div className="phone-input--no-results">
                  {t("auth.noCountriesFound", "لا يوجد نتائج")}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PhoneInput({
  state,
  setState,
  value,
  onChange,
  onCountryChange,
  error,
  showError = false,
  className,
  inputClassName,
  inputClass,
  ...props
}) {
  const phoneValue = value ?? state;
  const phoneOnChange = onChange ?? setState;

  const finalInputClassName = inputClassName || inputClass || "";

  return (
    <div className={cn("relative", className)}>
      <PhoneInputComponent
        defaultCountry="sy"
        value={phoneValue}
        onChange={phoneOnChange}
        onCountryChange={onCountryChange}
        error={!!error}
        inputClassName={finalInputClassName}
        {...props}
      />
      {error && showError && (
        <p className="mt-1.5 text-xs font-semibold text-red-500 animate-[fadeUp_0.3s_ease]">
          {error}
        </p>
      )}
    </div>
  );
}

export default PhoneInput;

