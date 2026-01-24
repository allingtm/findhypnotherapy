"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  IconMenu2 as Menu,
  IconX as X,
  IconChevronRight as ChevronRight,
} from "@tabler/icons-react"
import { AnimatePresence, motion } from "framer-motion"

const items = [
  { label: "Home", href: "/" },
  { label: "Directory", href: "/directory" },
  { label: "Videos", href: "/videos" },
  { label: "About Us", href: "/about" },
  { label: "For Practitioners", href: "/for-practitioners" },
]

const tapProps = {
  whileTap: { scale: 0.98 },
  transition: {
    type: "spring" as const,
    stiffness: 500,
    damping: 30,
    mass: 0.6,
  },
}

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: isAdminResult } = await supabase.rpc('is_admin')
        setIsAdmin(isAdminResult === true)
      }
      setAuthLoading(false)
    }

    checkAuth()
  }, [])

  return (
    <header className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md w-full border-b border-gray-200 dark:border-neutral-800 sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex w-full items-center justify-between gap-3 md:w-auto">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-5 w-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
              <span className="font-semibold text-gray-900 dark:text-white">Find Hypnotherapy</span>
            </Link>
            <motion.button
              aria-label="Toggle menu"
              className="inline-flex size-10 items-center justify-center rounded-md border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 md:hidden"
              onClick={() => setOpen((s) => !s)}
              whileTap={{ scale: 0.92 }}
            >
              {open ? <X size={20} className="text-gray-700 dark:text-gray-300" /> : <Menu size={20} className="text-gray-700 dark:text-gray-300" />}
            </motion.button>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {items.map((i) => (
              <motion.div key={i.label} whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href={i.href}
                  className="text-gray-600 dark:text-gray-400 relative px-3 py-2 text-sm hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {i.label}
                  <span
                    className={`pointer-events-none absolute right-2 -bottom-0.5 left-2 h-0.5 rounded-full transition-all ${
                      pathname === i.href
                        ? "bg-purple-600 dark:bg-purple-400"
                        : "bg-transparent"
                    }`}
                  />
                </Link>
              </motion.div>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {!authLoading && user ? (
              <motion.div {...tapProps}>
                <Link
                  href={isAdmin ? "/admin" : "/dashboard"}
                  className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-lg hover:from-purple-500 hover:to-blue-500 transition-all"
                >
                  Dashboard
                </Link>
              </motion.div>
            ) : !authLoading ? (
              <>
                <motion.div {...tapProps}>
                  <Link
                    href="/login"
                    className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                </motion.div>
                <motion.div {...tapProps}>
                  <Link
                    href="/register"
                    className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-lg hover:from-purple-500 hover:to-blue-500 transition-all"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </>
            ) : null}
          </div>
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="border-t border-gray-200 dark:border-neutral-700 py-2 md:hidden"
            >
              <nav className="grid gap-1">
                {items.map((i) => (
                  <motion.div key={i.label} whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href={i.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center justify-between rounded-md px-3 py-2 text-left text-sm ${
                        pathname === i.href
                          ? "bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800"
                      }`}
                    >
                      <span>{i.label}</span>
                      <ChevronRight size={16} className="text-gray-400 dark:text-gray-500" />
                    </Link>
                  </motion.div>
                ))}
                <div className="flex items-center gap-2 px-3 pt-2">
                  {!authLoading && user ? (
                    <motion.div {...tapProps} className="flex-1">
                      <Link
                        href={isAdmin ? "/admin" : "/dashboard"}
                        onClick={() => setOpen(false)}
                        className="block w-full text-center rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white"
                      >
                        Dashboard
                      </Link>
                    </motion.div>
                  ) : !authLoading ? (
                    <>
                      <motion.div {...tapProps} className="flex-1">
                        <Link
                          href="/login"
                          onClick={() => setOpen(false)}
                          className="block w-full text-center rounded-full border border-gray-300 dark:border-neutral-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Login
                        </Link>
                      </motion.div>
                      <motion.div {...tapProps} className="flex-1">
                        <Link
                          href="/register"
                          onClick={() => setOpen(false)}
                          className="block w-full text-center rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white"
                        >
                          Sign Up
                        </Link>
                      </motion.div>
                    </>
                  ) : null}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
