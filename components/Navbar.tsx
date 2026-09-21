"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

const supabase = createClient();

export default function Navbar() {
  const router = useRouter();

  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Desktop Campus dropdown
  const [campusOpen, setCampusOpen] = useState(false);

  // Mobile menu + mobile Campus submenu
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCampusOpen, setMobileCampusOpen] =
    useState(false);

  const campusMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setLoggedIn(!!user);
      setLoading(false);
    }

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setLoggedIn(!!session?.user);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Close menus when clicking somewhere else
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;

      if (
        campusMenuRef.current &&
        !campusMenuRef.current.contains(target)
      ) {
        setCampusOpen(false);
      }

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target)
      ) {
        setMobileOpen(false);
        setMobileCampusOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);
  useEffect(() => {
  function handleScroll() {
    const currentScrollY = window.scrollY;

    // Always show navbar near the top
    if (currentScrollY < 20) {
      setNavVisible(true);
    }
    // Scrolling down -> hide
    else if (currentScrollY > lastScrollY.current) {
      setNavVisible(false);
      setMobileOpen(false);
      setMobileCampusOpen(false);
    }
    // Scrolling up -> show
    else {
      setNavVisible(true);
    }

    lastScrollY.current = currentScrollY;
  }

  window.addEventListener("scroll", handleScroll, {
    passive: true,
  });

  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
}, []);
  async function handleLogout() {
    await supabase.auth.signOut();

    setLoggedIn(false);
    setMobileOpen(false);
    setMobileCampusOpen(false);

    router.push("/login");
  }

  function closeMobileMenu() {
    setMobileOpen(false);
    setMobileCampusOpen(false);
  }

  return (
<nav
  className={`sticky top-0 z-50 border-b-2 border-pink-100 bg-[#fffaf7]/95 shadow-sm backdrop-blur-md transition-transform duration-300 ${
    navVisible ? "translate-y-0" : "-translate-y-full"
  }`}
>      <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-1.5 sm:px-6 sm:py-4">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2 sm:gap-3"
          onClick={closeMobileMenu}
        >
          {/* Little pinned note */}
          <div className="relative flex h-8 w-8 rotate-[-4deg] items-center justify-center rounded-lg border-2 border-[#e8d7c8] bg-[#fffdf8] shadow-sm transition group-hover:rotate-0 sm:h-12 sm:w-12">
            <span className="text-sm sm:text-xl">
              ☺
            </span>

            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-sm sm:-top-3 sm:text-xl">
              📌
            </span>
          </div>

          {/* Name */}
          <div className="leading-none">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-medium tracking-wide text-[#8b7267] sm:text-sm">                angel&apos;s little
              </span>

              <span className="text-base text-pink-400 sm:text-lg">
                ♡
              </span>
            </div>

            <div className="mt-0.5 text-base font-black tracking-wide text-[#f19aaa] sm:mt-1 sm:text-2xl">              PINBOARD
            </div>
          </div>
        </Link>

        {/* ============================= */}
        {/* DESKTOP NAVIGATION */}
        {/* ============================= */}

        <div className="hidden items-center gap-3 md:flex">
          {!loading && loggedIn && (
            <>
              {/* Campus dropdown */}
              <div
                ref={campusMenuRef}
                className="relative"
                onMouseEnter={() =>
                  setCampusOpen(true)
                }
                onMouseLeave={() =>
                  setCampusOpen(false)
                }
              >
                <button
                  type="button"
                  onClick={() =>
                    setCampusOpen(
                      (open) => !open
                    )
                  }
                  className="rounded-full border border-pink-100 bg-[#fff0f2] px-5 py-2.5 text-sm font-semibold text-[#806b67] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#ffe4e8] hover:shadow-md"
                >
                  ♡ Campus

                  <span
                    className={`ml-2 inline-block text-xs transition-transform ${
                      campusOpen
                        ? "rotate-180"
                        : ""
                    }`}
                  >
                    ▾
                  </span>
                </button>

                {campusOpen && (
                  <div className="absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 pt-2">
                    <div className="overflow-hidden rounded-2xl border border-pink-100 bg-[#fffaf7] p-2 shadow-lg">
                      <Link
                        href="/campus"
                        onClick={() =>
                          setCampusOpen(false)
                        }
                        className="block rounded-xl px-4 py-3 text-sm font-semibold text-[#806b67] transition hover:bg-[#fff0f2]"
                      >
                        ♡ North Campus
                      </Link>

                      <Link
                        href="/dorm/low-rise-6"
                        onClick={() =>
                          setCampusOpen(false)
                        }
                        className="block rounded-xl px-4 py-3 text-sm font-semibold text-[#806b67] transition hover:bg-[#f2efff]"
                      >
                        ♡ Low Rise 6
                      </Link>

                      <Link
                        href="/dorm/low-rise-7"
                        onClick={() =>
                          setCampusOpen(false)
                        }
                        className="block rounded-xl px-4 py-3 text-sm font-semibold text-[#806b67] transition hover:bg-[#edf8ef]"
                      >
                        ♡ Low Rise 7
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Leaderboard */}
              <Link
                href="/leaderboard"
                className="rounded-full border border-green-100 bg-[#edf8ef] px-5 py-2.5 text-sm font-semibold text-[#806b67] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#e0f3e4] hover:shadow-md"
              >
                ♡ Leaderboard
              </Link>

              {/* Profile */}
              <Link
                href="/profile"
                className="rounded-full border border-purple-100 bg-[#f2efff] px-5 py-2.5 text-sm font-semibold text-[#806b67] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#e9e3ff] hover:shadow-md"
              >
                ♡ Profile
              </Link>

              {/* Avatar */}
              <Link
                href="/avatar"
                className="rounded-full border border-green-100 bg-[#edf8ef] px-5 py-2.5 text-sm font-semibold text-[#806b67] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#e0f3e4] hover:shadow-md"
              >
                ♡ Avatar
              </Link>

              {/* Log Out */}
              <button
                type="button"
                onClick={handleLogout}
                className="ml-1 rounded-full bg-[#f3a1ad] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#ed8f9e] hover:shadow-md"
              >
                Log Out
              </button>
            </>
          )}

          {!loading && !loggedIn && (
            <Link
              href="/login"
              className="rounded-full bg-[#f3a1ad] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#ed8f9e] hover:shadow-md"
            >
              Log In
            </Link>
          )}
        </div>

        {/* ============================= */}
        {/* MOBILE NAVIGATION */}
        {/* ============================= */}

        <div
          ref={mobileMenuRef}
          className="relative md:hidden"
        >
          {!loading && loggedIn && (
            <>
              {/* Hamburger */}
              <button
                type="button"
                aria-label="Open navigation menu"
                onClick={() => {
                  setMobileOpen(
                    (open) => !open
                  );

                  if (mobileOpen) {
                    setMobileCampusOpen(
                      false
                    );
                  }
                }}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-pink-100 bg-[#fff0f2] text-xl font-bold text-[#806b67] shadow-sm transition active:scale-95"
              >
                {mobileOpen ? "×" : "☰"}
              </button>

              {/* Mobile dropdown */}
              {mobileOpen && (
                <div className="absolute right-0 top-full z-50 w-64 pt-3">
                  <div className="overflow-hidden rounded-3xl border border-pink-100 bg-[#fffaf7] p-3 shadow-xl">
                    {/* Campus */}
                    <button
                      type="button"
                      onClick={() =>
                        setMobileCampusOpen(
                          (open) => !open
                        )
                      }
                      className="flex w-full items-center justify-between rounded-2xl bg-[#fff0f2] px-4 py-3 text-left text-sm font-bold text-[#806b67] transition active:scale-[0.98]"
                    >
                      <span>
                        ♡ Campus
                      </span>

                      <span
                        className={`text-xs transition-transform ${
                          mobileCampusOpen
                            ? "rotate-180"
                            : ""
                        }`}
                      >
                        ▾
                      </span>
                    </button>

                    {/* Campus submenu */}
                    {mobileCampusOpen && (
                      <div className="mt-2 space-y-1 rounded-2xl bg-white/60 p-2">
                        <Link
                          href="/campus"
                          onClick={
                            closeMobileMenu
                          }
                          className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-[#806b67] transition active:bg-[#fff0f2]"
                        >
                          ♡ North Campus
                        </Link>

                        <Link
                          href="/dorm/low-rise-6"
                          onClick={
                            closeMobileMenu
                          }
                          className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-[#806b67] transition active:bg-[#f2efff]"
                        >
                          ♡ Low Rise 6
                        </Link>

                        <Link
                          href="/dorm/low-rise-7"
                          onClick={
                            closeMobileMenu
                          }
                          className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-[#806b67] transition active:bg-[#edf8ef]"
                        >
                          ♡ Low Rise 7
                        </Link>
                      </div>
                    )}

                    {/* Divider */}
                    <div className="my-2 h-px bg-pink-100" />

                    <Link
                      href="/leaderboard"
                      onClick={
                        closeMobileMenu
                      }
                      className="block rounded-2xl px-4 py-3 text-sm font-semibold text-[#806b67] transition active:bg-[#edf8ef]"
                    >
                      ♡ Leaderboard
                    </Link>

                    <Link
                      href="/profile"
                      onClick={
                        closeMobileMenu
                      }
                      className="block rounded-2xl px-4 py-3 text-sm font-semibold text-[#806b67] transition active:bg-[#f2efff]"
                    >
                      ♡ Profile
                    </Link>

                    <Link
                      href="/avatar"
                      onClick={
                        closeMobileMenu
                      }
                      className="block rounded-2xl px-4 py-3 text-sm font-semibold text-[#806b67] transition active:bg-[#edf8ef]"
                    >
                      ♡ Avatar
                    </Link>

                    <div className="my-2 h-px bg-pink-100" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full rounded-2xl bg-[#f3a1ad] px-4 py-3 text-left text-sm font-bold text-white transition active:scale-[0.98]"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {!loading && !loggedIn && (
            <Link
              href="/login"
              className="rounded-full bg-[#f3a1ad] px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
            >
              Log In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}