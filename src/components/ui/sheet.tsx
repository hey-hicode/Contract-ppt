"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "~/lib/utils"

type SheetSide = "top" | "right" | "bottom" | "left"

function Sheet({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root {...props} />
}

function SheetTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger {...props} />
}

function SheetClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close {...props} />
}

function SheetPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal {...props} />
}

function SheetOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-500 data-[state=open]:opacity-100 data-[state=closed]:opacity-0",
        className
      )}
      {...props}
    />
  )
}

interface SheetContentProps
  extends React.ComponentProps<typeof DialogPrimitive.Content> {
  side?: SheetSide
}

function sideClasses(side: SheetSide) {
  switch (side) {
    case "top":
      return "inset-x-0 top-0 border-b data-[state=open]:translate-y-0 data-[state=closed]:-translate-y-full data-[state=open]:opacity-100 data-[state=closed]:opacity-0"
    case "bottom":
      return "inset-x-0 bottom-0 border-t data-[state=open]:translate-y-0 data-[state=closed]:translate-y-full data-[state=open]:opacity-100 data-[state=closed]:opacity-0"
    case "left":
      return "left-0 inset-y-0 h-full border-r data-[state=open]:translate-x-0 data-[state=closed]:-translate-x-full data-[state=open]:opacity-100 data-[state=closed]:opacity-0"
    case "right":
    default:
      return "right-0 inset-y-0 h-full border-l data-[state=open]:translate-x-0 data-[state=closed]:translate-x-full data-[state=open]:opacity-100 data-[state=closed]:opacity-0"
  }
}

function SheetContent({ side = "right", className, ...props }: SheetContentProps) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 bg-white w-[85vw] sm:w-[500px] p-0 shadow-lg focus:outline-none max-h-[100vh] overflow-hidden transition-transform transition-opacity duration-500 ease-out",
          sideClasses(side),
          className
        )}
        {...props}
      />
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("p-6 border-b border-slate-100 bg-slate-50/50", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("p-4 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2 justify-end", className)}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("text-lg font-semibold text-slate-900", className)}
      {...props}
    />
  )
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-sm text-slate-600", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}