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
  const [campusOpen, setCampusOpen] = useState(false);

  const campusMenuRef = useRef<HTMLDivElement>(null);

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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session?.user);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Close Campus dropdown when clicking somewhere else
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        campusMenuRef.current &&
        !campusMenuRef.current.contains(event.target as Node)
      ) {
        setCampusOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();

    setLoggedIn(false);
    router.push("/login");
  }

  return (
    <nav className="sticky top-0 z-50 border-b-2 border-pink-100 bg-[#fffaf7]/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">

          {/* Little pinned note */}
          <div className="relative flex h-12 w-12 rotate-[-4deg] items-center justify-center rounded-lg border-2 border-[#e8d7c8] bg-[#fffdf8] shadow-sm transition group-hover:rotate-0">
            <span className="text-xl">☺</span>

            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl">
              📌
            </span>
          </div>

          {/* Name */}
          <div className="leading-none">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium tracking-wide text-[#8b7267]">
                angel&apos;s little
              </span>

              <span className="text-lg text-pink-400">
                ♡
              </span>
            </div>

            <div className="mt-1 text-2xl font-black tracking-wide text-[#f19aaa]">
              PINBOARD
            </div>
          </div>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          {!loading && loggedIn && (
            <>

              {/* Campus dropdown */}
              <div
                ref={campusMenuRef}
                className="relative"
                onMouseEnter={() => setCampusOpen(true)}
                onMouseLeave={() => setCampusOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setCampusOpen((open) => !open)}
                  className="rounded-full border border-pink-100 bg-[#fff0f2] px-5 py-2.5 text-sm font-semibold text-[#806b67] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#ffe4e8] hover:shadow-md"
                >
                  ♡ Campus
                  <span
                    className={`ml-2 inline-block text-xs transition-transform ${
                      campusOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▾
                  </span>
                </button>

                {/* Dropdown */}
                {campusOpen && (
                  <div
                    className="
                      absolute left-1/2 top-full
                      z-50
                      w-56
                      -translate-x-1/2
                      pt-2
                    "
                  >
                    <div
                      className="
                        overflow-hidden
                        rounded-2xl
                        border border-pink-100
                        bg-[#fffaf7]
                        p-2
                        shadow-lg
                      "
                    >

                      {/* North Campus */}
                      <Link
                        href="/campus"
                        onClick={() => setCampusOpen(false)}
                        className="
                          block
                          rounded-xl
                          px-4 py-3
                          text-sm font-semibold
                          text-[#806b67]
                          transition
                          hover:bg-[#fff0f2]
                        "
                      >
                        ♡ North Campus
                      </Link>

                      {/* Low Rise 6 */}
                      <Link
                        href="/dorm/low-rise-6"
                        onClick={() => setCampusOpen(false)}
                        className="
                          block
                          rounded-xl
                          px-4 py-3
                          text-sm font-semibold
                          text-[#806b67]
                          transition
                          hover:bg-[#f2efff]
                        "
                      >
                        ♡ Low Rise 6 Lounge
                      </Link>

                      {/* Low Rise 7 */}
                      <Link
                        href="/dorm/low-rise-7"
                        onClick={() => setCampusOpen(false)}
                        className="
                          block
                          rounded-xl
                          px-4 py-3
                          text-sm font-semibold
                          text-[#806b67]
                          transition
                          hover:bg-[#edf8ef]
                        "
                      >
                        ♡ Low Rise 7 Lounge
                      </Link>

                    </div>
                  </div>
                )}
              </div>
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
      </div>
    </nav>
  );
}