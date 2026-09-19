"use client";

import { useEffect, useState } from "react";
import Avatar from "../../components/Avatar";
import { createClient } from "../../lib/supabase/client";

type LeaderboardUser = {
  id: string;
  username: string;
  hair: string;
  shirt: string;
  skin_tone: string;
  hairstyle: string;
  lounge_seconds: number;
  lounge_entered_at: string | null;
};

export default function LeaderboardPage() {
  const supabase = createClient();

  const [users, setUsers] = useState<
    LeaderboardUser[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  /*
   * Used to make active lounge timers
   * visibly count upward.
   */
  const [now, setNow] =
    useState(Date.now());

  useEffect(() => {
    async function loadLeaderboard() {
      const { data, error } =
        await supabase
          .from("profiles")
          .select(
            "id, username, hair, shirt, skin_tone, hairstyle, lounge_seconds, lounge_entered_at"
          );

      if (error) {
        console.log(
          "Could not load leaderboard:",
          error
        );

        setLoading(false);
        return;
      }

      setUsers(data ?? []);
      setLoading(false);
    }

    loadLeaderboard();

    /*
     * Realtime updates when someone starts
     * or finishes a lounge session.
     */
    const channel = supabase
      .channel("loungetime-leaderboard")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
        },
        () => {
          loadLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /*
   * Update active timers every second.
   */
  useEffect(() => {
    const interval =
      window.setInterval(() => {
        setNow(Date.now());
      }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  function getTotalSeconds(
    user: LeaderboardUser
  ) {
    let total =
      Number(user.lounge_seconds ?? 0);

    /*
     * Add current unfinished session.
     */
    if (user.lounge_entered_at) {
      const entered =
        new Date(
          user.lounge_entered_at
        ).getTime();

      const currentSession =
        Math.max(
          0,
          Math.floor(
            (now - entered) / 1000
          )
        );

      total += currentSession;
    }

    return total;
  }

  function formatTime(seconds: number) {
    const hours =
      Math.floor(seconds / 3600);

    const minutes =
      Math.floor(
        (seconds % 3600) / 60
      );

    const secs =
      seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }

    return `${secs}s`;
  }

  const sortedUsers = [...users].sort(
    (a, b) =>
      getTotalSeconds(b) -
      getTotalSeconds(a)
  );

  if (loading) {
    return null;
  }

  return (
    <main className="min-h-screen px-5 py-10 sm:p-10">
      <div className="mx-auto max-w-3xl">

        {/* Heading */}
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#d8899a]">
            angel&apos;s little ♡ PINBOARD
          </p>

          <h1 className="mt-2 text-4xl font-black text-[#6f5c56]">
            Loungetime Leaderboard
          </h1>

          <p className="mt-3 text-[#a18a82]">
            who&apos;s been in the lounge the most? ♡
          </p>
        </div>

        {/* Leaderboard */}
        <div className="mt-10 space-y-3">
          {sortedUsers.map(
            (user, index) => {
              const totalSeconds =
                getTotalSeconds(user);

              const rank = index + 1;

              let medal = "";

              if (rank === 1) {
                medal = "🥇";
              }

              if (rank === 2) {
                medal = "🥈";
              }

              if (rank === 3) {
                medal = "🥉";
              }

              return (
                <div
                  key={user.id}
                  className="
                    flex
                    items-center
                    gap-4
                    rounded-[24px]
                    border-2
                    border-[#f3d8dd]
                    bg-[#fffaf7]
                    px-5
                    py-4
                    shadow-sm
                    transition
                    hover:-translate-y-0.5
                    hover:shadow-md
                  "
                >
                  {/* Rank */}
                  <div className="w-10 text-center text-xl font-black text-[#b87885]">
                    {medal ||
                      rank}
                  </div>

                  {/* Tiny avatar */}
                  <div className="relative h-[62px] w-[55px] shrink-0 overflow-visible">
                    <div className="pointer-events-none absolute left-0 top-0 origin-top-left scale-[0.28]">
                      <Avatar
                        hair={
                          user.hair ??
                          "Brown"
                        }
                        shirt={
                          user.shirt ??
                          "Blue"
                        }
                        skinTone={
                          user.skin_tone ??
                          "Light"
                        }
                        hairstyle={
                          user.hairstyle ??
                          "Short"
                        }
                      />
                    </div>
                  </div>

                  {/* Name */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-[#6f5c56]">
                      {user.username}
                    </p>

                    {user.lounge_entered_at && (
                      <p className="mt-0.5 text-xs font-semibold text-[#e58e9d]">
                        in the lounge now ♡
                      </p>
                    )}
                  </div>

                  {/* Time */}
                  <div className="whitespace-nowrap rounded-full bg-[#ffe4e9] px-3 py-1.5 text-sm font-bold text-[#b87885]">
                    {formatTime(
                      totalSeconds
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>

        {sortedUsers.length === 0 && (
          <div className="mt-10 rounded-[28px] border-2 border-[#f3d8dd] bg-[#fffaf7] p-8 text-center">
            <p className="font-semibold text-[#a18a82]">
              nobody has any loungetime yet ♡
            </p>
          </div>
        )}

        <p className="mt-8 text-center text-sm font-semibold text-[#c19ba3]">
          ♡ certified lounge dwellers ♡
        </p>
      </div>
    </main>
  );
}