"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[rgb(19,19,19)] group-[.toaster]:text-zinc-400 group-[.toaster]:shadow-lg min-h-20",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            " group-[.toast]:text-zinc-400 py-5 bg-[#ff0000]",
          cancelButton:
            " group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
