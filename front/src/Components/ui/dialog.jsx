"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

const DialogPortal = ({ children }) => (
  <DialogPrimitive.Portal>{children}</DialogPrimitive.Portal>
);

const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn("dialog-overlay", className)}
    {...props}
  />
));

export  const DialogContent = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    return (
      <DialogPortal>
        <DialogOverlay />

        <DialogPrimitive.Content
          ref={ref}
          className={cn("dialog-content", className)}
          {...props}
        >
          {children}

          <DialogPrimitive.Close className="dialog-close">
            <X size={18} />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  },
);

export const DialogHeader = ({ className, ...props }) => (
  <div className={cn("dialog-header", className)} {...props} />
);

export const DialogFooter = ({ className, ...props }) => (
  <div className={cn("dialog-footer", className)} {...props} />
);

export const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("dialog-title", className)}
    {...props}
  />
));

export const DialogDescription = React.forwardRef(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Description
      ref={ref}
      className={cn("dialog-description", className)}
      {...props}
    />
  ),
);
