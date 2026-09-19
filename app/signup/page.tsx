"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function SignupPage() {
  const supabase = createClient();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,

      options: {
        data: {
          username,
        },
      },
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    router.push("/avatar");
  }

  return (
    <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-5 py-12">
      <div className="w-full max-w-md rounded-[32px] border-2 border-[#e1d3ee] bg-[#fffaf7] p-8 shadow-lg sm:p-10">
        <div className="text-center">
          <p className="text-sm font-bold text-[#9a86b2]">
            join the pinboard ♡
          </p>

          <h1 className="mt-2 text-4xl font-black text-[#6f5c56]">
            Create Account
          </h1>

          <p className="mt-2 text-sm text-[#a18a82]">
            make your little corner of campus ✿
          </p>
        </div>

        <form
          onSubmit={handleSignup}
          className="mt-8 space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm font-bold text-[#806b67]">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              required
              placeholder="angel"
              className="w-full rounded-2xl border-2 border-[#eadfe2] bg-white px-4 py-3 text-[#6f5c56] outline-none transition focus:border-[#cbbbe5]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-[#806b67]">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
              placeholder="you@cornell.edu"
              className="w-full rounded-2xl border-2 border-[#eadfe2] bg-white px-4 py-3 text-[#6f5c56] outline-none transition focus:border-[#cbbbe5]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-[#806b67]">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
              minLength={6}
              placeholder="at least 6 characters"
              className="w-full rounded-2xl border-2 border-[#eadfe2] bg-white px-4 py-3 text-[#6f5c56] outline-none transition focus:border-[#cbbbe5]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#e8dff5] px-6 py-3 font-bold text-[#806b96] shadow-md transition hover:-translate-y-0.5 hover:bg-[#ddd0ef] hover:shadow-lg disabled:opacity-60"
          >
            {loading
              ? "creating account..."
              : "create my account ♡"}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-[#9b8882]">
          already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-[#9a86b2] hover:underline"
          >
            log in ♡
          </Link>
        </p>

        <div className="mt-5 text-center">
          <Link
            href="/"
            className="text-xs font-semibold text-[#b8a5a0] hover:text-[#806b67]"
          >
            ← back to pinboard
          </Link>
        </div>
      </div>
    </main>
  );
}