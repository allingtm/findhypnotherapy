'use client'

import { cn } from "@/lib/utils"
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTwitter,
  IconSun,
  IconMoon,
} from "@tabler/icons-react"
import Link from "next/link"
import React, { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { CookieSettingsLink } from "@/components/cookies/CookieSettingsLink"

export function Footer() {
  const pages = [
    { title: "Home", href: "/" },
    { title: "Find a Therapist", href: "#" },
    { title: "For Practitioners", href: "/waitlist" },
    { title: "Login", href: "/login" },
    { title: "Privacy", href: "#" },
    { title: "Terms", href: "#" },
  ]

  return (
    <div className="relative w-full overflow-hidden border-t border-neutral-100 bg-white px-8 py-20 dark:border-white/[0.1] dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl items-start justify-between text-sm text-neutral-500 md:px-8">
        <div className="relative flex w-full flex-col items-center justify-center">
          <div className="mr-0 mb-4 md:mr-4 md:flex">
            <Logo />
          </div>

          <ul className="flex list-none flex-col gap-4 text-neutral-600 transition-colors sm:flex-row dark:text-neutral-300">
            {pages.map((page, idx) => (
              <li key={"pages" + idx} className="list-none">
                <Link
                  className="hover:text-neutral-800 dark:hover:text-white transition-colors"
                  href={page.href}
                >
                  {page.title}
                </Link>
              </li>
            ))}
            <li className="list-none">
              <CookieSettingsLink />
            </li>
          </ul>

          <GridLineHorizontal className="mx-auto mt-8 max-w-7xl" />
        </div>
        <div className="mt-8 flex w-full flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-neutral-500 dark:text-neutral-400">
            &copy; {new Date().getFullYear()} Find Hypnotherapy
          </p>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex gap-4">
              <Link href="#" aria-label="Twitter">
                <IconBrandTwitter className="h-5 w-5 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors" />
              </Link>
              <Link href="#" aria-label="LinkedIn">
                <IconBrandLinkedin className="h-5 w-5 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors" />
              </Link>
              <Link href="#" aria-label="Facebook">
                <IconBrandFacebook className="h-5 w-5 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors" />
              </Link>
              <Link href="#" aria-label="Instagram">
                <IconBrandInstagram className="h-5 w-5 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800"
        aria-label="Toggle theme"
      >
        <div className="h-5 w-5" />
      </button>
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <IconSun className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
      ) : (
        <IconMoon className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
      )}
    </button>
  )
}

const GridLineHorizontal = ({
  className,
  offset,
}: {
  className?: string
  offset?: string
}) => {
  return (
    <div
      style={
        {
          "--background": "#ffffff",
          "--color": "rgba(0, 0, 0, 0.2)",
          "--height": "1px",
          "--width": "5px",
          "--fade-stop": "90%",
          "--offset": offset || "200px",
          "--color-dark": "rgba(255, 255, 255, 0.2)",
          maskComposite: "exclude",
        } as React.CSSProperties
      }
      className={cn(
        "h-[var(--height)] w-[calc(100%+var(--offset))]",
        "bg-[linear-gradient(to_right,var(--color),var(--color)_50%,transparent_0,transparent)]",
        "[background-size:var(--width)_var(--height)]",
        "[mask:linear-gradient(to_left,var(--background)_var(--fade-stop),transparent),_linear-gradient(to_right,var(--background)_var(--fade-stop),transparent),_linear-gradient(black,black)]",
        "[mask-composite:exclude]",
        "z-30",
        "dark:bg-[linear-gradient(to_right,var(--color-dark),var(--color-dark)_50%,transparent_0,transparent)]",
        className,
      )}
    ></div>
  )
}

const Logo = () => {
  return (
    <Link
      href="/"
      className="relative z-20 flex items-center space-x-2 px-2 py-1 text-sm font-normal"
    >
      <div className="h-5 w-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <span className="font-medium text-black dark:text-white">Find Hypnotherapy</span>
    </Link>
  )
}
