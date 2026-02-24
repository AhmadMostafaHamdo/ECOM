import * as React from "react";
import PropTypes from "prop-types";

// Simple className utility function
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

const Table = React.memo(React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div className="admin-modern-table-container">
      <table
        ref={ref}
        dir="ltr"
        className={cn("admin-modern-table", className)}
        {...props}
      />
    </div>
  );
}))
Table.displayName = "Table";

const createTableComponent = (Tag, baseClasses, displayName) =>
 React.memo( React.forwardRef(({ className, ...props }, ref) => {
  return (
    <Tag
      ref={ref}
      className={cn(
        baseClasses,
        className
      )}    
      {...props}
    />
  );
}))

const TableHeader = createTableComponent("thead", "", "TableHeader");
const TableBody = createTableComponent(
  "tbody",
  "",
  "TableBody"
);
const TableFooter = createTableComponent(
  "tfoot",
  "border-t",
  "TableFooter"
);
const TableRow = createTableComponent(
  "tr",
  "",
  "TableRow"
);
const TableHead = React.forwardRef(
  ({ className, isFixed = false, ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={cn(
          isFixed
            ? "fixed-left"
            : "",
          className
        )}
        {...props}
      />
    );
  }
);
TableHead.displayName = "TableHead";

  const TableCell = React.forwardRef(
    ({ className = "", isFixed = false, hasCheckbox = false, ...props }, ref) => {

      // Remove any existing padding classes from className
      const cleanedClassName = className
        .split(" ")
        .filter(
          (cls) =>
            !cls.startsWith("p-") &&
            !cls.startsWith("px-") &&
            !cls.startsWith("py-") &&
            !cls.startsWith("!p-") &&
            !cls.startsWith("!px-") &&
            !cls.startsWith("!py-")
        )
        .join(" ");

      return (
        <td
          ref={ref}
          className={cn(
            hasCheckbox ? "" : "",
            isFixed
              ? "fixed-left"
              : "",
            cleanedClassName
          )}
          {...props}
        />
      );
    }
  );
TableCell.displayName = "TableCell";

TableCell.propTypes = {
  className: PropTypes.string,
  isFixed: PropTypes.bool,
  hasCheckbox: PropTypes.bool,
};
const TableCaption = createTableComponent(
  "caption",
  "",
  "TableCaption"
);

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};

