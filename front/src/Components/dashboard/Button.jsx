import * as React from "react";
import { useTranslation } from "react-i18next";

// Simple className utility function
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

// Button variant configurations
const buttonVariants = {
  default: "btn btn-default",
  destructive: "btn btn-destructive", 
  outline: "btn btn-outline",
  secondary: "btn btn-secondary",
  ghost: "btn btn-ghost",
  link: "btn btn-link",
  password: "btn btn-password",
  show: "btn btn-show",
  print: "btn btn-print",
  filter: "btn btn-filter",
  upload: "btn btn-upload",
  confirm: "btn btn-confirm",
  hold: "btn btn-hold",
  download: "btn btn-download",
  refresh: "btn btn-refresh",
  save: "btn btn-save",
  undo: "btn btn-undo",
  delete: "btn btn-delete",
  edit: "btn btn-edit",
  add: "btn btn-add",
  settings: "btn btn-settings",
  sidebarAdd: "btn btn-sidebarAdd",
  close: "btn btn-close",
  export: "btn btn-export",
  empty: "btn btn-empty",
  toggle: "btn btn-toggle",
  sendOtp: "btn btn-sendOtp",
  addSettlement: "btn btn-addSettlement"
};

const buttonSizes = {
  xs: "btn-xs",
  sm: "btn-sm", 
  default: "btn-default",
  lg: "btn-lg",
  icon: "btn-icon"
};

const getChildEnhancementClass = (variant) => {
  switch (variant) {
    case "filter":
    case "confirm":
    case "upload":
    case "sendOtp":
    case "addSettlement":
      return "btn-icon-sm";

    case "refresh":
    case "edit":
    case "password":
    case "print":
    case "add":
    case "sidebar":
    case "delete":
    case "hold":
    case "empty":
    case "toggle":
      return "btn-icon-md";

    default:
      return "";
  }
};

const variantsWithTooltip = [
  "refresh",
  "filter", 
  "upload",
  "download",
  "password",
  "print",
  "delete",
  "edit",
  "hold",
  "confirm",
  "add",
  "save",
  "settings",
  "close",
  "export",
  "undo",
  "empty",
  "toggle",
  "sendOtp",
  "addSettlement"
];

const Button = React.forwardRef(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      children,
      tooltipLabel,
      ...props
    },
    ref
  ) => {
    const { t } = useTranslation();
    const Comp = asChild ? "span" : "button";
    const enhancementClass = getChildEnhancementClass(variant);

    const enhancedChildren = React.Children.map(children, (child) =>
      React.isValidElement(child)
        ? React.cloneElement(child, {
          className: cn(child.props.className, enhancementClass),
        })
        : child
    );

    const buttonElement = (
      <Comp
        className={cn(
          buttonVariants[variant] || buttonVariants.default,
          buttonSizes[size] || buttonSizes.default,
          className
        )}
        ref={ref}
        {...props}
      >
        {enhancedChildren}
      </Comp>
    );

    // Simple tooltip implementation (you can replace with your preferred tooltip library)
    if (variantsWithTooltip.includes(variant) && tooltipLabel) {
      return (
        <div className="tooltip-container">
          {buttonElement}
          <div className="tooltip-content">
            {t(tooltipLabel ? tooltipLabel : variant)}
          </div>
        </div>
      );
    }

    return buttonElement;
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
