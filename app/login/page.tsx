"use client";

import { useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");

  async function signUp() {
  setMessage("Creating account...");

  if (!username.trim()) {
    setMessage("Please choose a username.");
    return;
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username.trim(),
      },
    },
  });

  if (error) {
    setMessage(error.message);
    return;
  }

  setMessage("Account created! ♡");
}

  async function logIn() {
    setMessage("Logging in...");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Logged in!");
    router.push("/dorm");
    router.refresh();
  }

  return (
    <main className="min-h-screen p-10">
      <div className="mx-auto max-w-md">
        <h1 className="text-center text-3xl font-bold text-[#806b67]">
        angel&apos;s little ♡
        <span className="block text-[#f19aaa]">PINBOARD</span>
        </h1>

        <p className="mt-2 text-gray-500">
          Create an account or log in.
        </p>
        <div>
        <label className="mb-2 block font-bold">Username</label>

        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Choose a username"
          className="w-full rounded border p-3"
        />
      </div>
        <div className="mt-10 flex flex-col gap-5">
          <div>
            <label className="mb-2 block font-bold">Email</label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-bold">Password</label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              className="w-full rounded border p-3"
            />
          </div>

          <button
            onClick={signUp}
            className="rounded bg-black p-3 font-bold text-white hover:bg-gray-800"
          >
            Sign Up
          </button>

          <button
            onClick={logIn}
            className="rounded border p-3 font-bold"
          >
            Log In
          </button>

          {message && (
            <p className="rounded bg-gray-100 p-3 text-black">
              {message}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}