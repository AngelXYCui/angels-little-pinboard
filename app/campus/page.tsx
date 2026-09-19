"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Avatar from "../../components/Avatar";
import { createClient } from "../../lib/supabase/client";

type CampusUser = {
  id: string;
  username: string;
  hair: string;
  shirt: string;
  skin_tone: string;
  hairstyle: string;
  campus_x: number;
  campus_y: number;
  current_location: string | null;
};

export default function CampusPage() {
  const supabase = createClient();
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);

  const [userId, setUserId] = useState("");

  const [username, setUsername] = useState("");
  const [hair, setHair] = useState("Brown");
  const [shirt, setShirt] = useState("Blue");
  const [skinTone, setSkinTone] = useState("Light");
  const [hairstyle, setHairstyle] = useState("Short");

  const [currentLocation, setCurrentLocation] = useState<
    string | null
  >(null);

  // Percentages of the campus map
  const [position, setPosition] = useState({
    x: 85,
    y: 15,
  });

  const [otherUsers, setOtherUsers] = useState<CampusUser[]>([]);
  const [dragging, setDragging] = useState(false);

  const [dragOffset, setDragOffset] = useState({
    x: 0,
    y: 0,
  });

  const [loading, setLoading] = useState(true);

  // Load yourself + everyone currently spawned on Campus
  useEffect(() => {
    async function loadCampus() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const { data: myProfile, error: myError } = await supabase
        .from("profiles")
        .select(
          "id, username, hair, shirt, skin_tone, hairstyle, campus_x, campus_y, current_location"
        )
        .eq("id", user.id)
        .single();

      if (myError) {
        console.log(myError);
        setLoading(false);
        return;
      }

      if (myProfile) {
        setUsername(myProfile.username ?? "");
        setHair(myProfile.hair ?? "Brown");
        setShirt(myProfile.shirt ?? "Blue");
        setSkinTone(myProfile.skin_tone ?? "Light");
        setHairstyle(myProfile.hairstyle ?? "Short");
        setCurrentLocation(myProfile.current_location ?? null);

        setPosition({
          x: myProfile.campus_x ?? 85,
          y: myProfile.campus_y ?? 15,
        });
      }

      const { data: people, error: peopleError } =
        await supabase
          .from("profiles")
          .select(
            "id, username, hair, shirt, skin_tone, hairstyle, campus_x, campus_y, current_location"
          )
          .eq("current_location", "campus")
          .neq("id", user.id);

      if (peopleError) {
        console.log(peopleError);
      }

      if (people) {
        setOtherUsers(people);
      }

      setLoading(false);
    }

    loadCampus();
  }, []);

  // Realtime updates from other users
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("campus-users")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
        },
        (payload) => {
          const updatedUser = payload.new as CampusUser;

          if (updatedUser.id === userId) {
            return;
          }

          setOtherUsers((currentUsers) => {
            // If this person is no longer on Campus,
            // remove them from the Campus map.
            if (updatedUser.current_location !== "campus") {
              return currentUsers.filter(
                (person) => person.id !== updatedUser.id
              );
            }

            const alreadyExists = currentUsers.some(
              (person) => person.id === updatedUser.id
            );

            if (alreadyExists) {
              return currentUsers.map((person) =>
                person.id === updatedUser.id
                  ? {
                      ...person,
                      ...updatedUser,
                    }
                  : person
              );
            }

            // They just spawned onto Campus.
            return [...currentUsers, updatedUser];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Spawn your avatar on Campus
  async function spawnOnCampus() {
  if (!userId) return;

  /*
   * LOUNGE TIME
   *
   * If the user was previously inside a lounge,
   * finish that lounge session before moving
   * them onto Campus.
   *
   * If no timer is running, the database
   * function simply does nothing.
   */
  const { error: timerError } =
    await supabase.rpc("stop_lounge_time");

  if (timerError) {
    console.log(
      "Couldn't stop lounge timer:",
      timerError
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      current_location: "campus",
    })
    .eq("id", userId);

  if (error) {
    console.log(
      "Couldn't spawn avatar:",
      error
    );
    return;
  }

  setCurrentLocation("campus");
}

  function handlePointerDown(
    event: React.PointerEvent<HTMLDivElement>
  ) {
    const map = mapRef.current;
    if (!map) return;

    const mapRect = map.getBoundingClientRect();

    // Current percentage position converted to pixels
    const currentX = (position.x / 100) * mapRect.width;
    const currentY = (position.y / 100) * mapRect.height;

    setDragging(true);

    setDragOffset({
      x: event.clientX - mapRect.left - currentX,
      y: event.clientY - mapRect.top - currentY,
    });

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(
    event: React.PointerEvent<HTMLDivElement>
  ) {
    if (!dragging) return;

    const map = mapRef.current;
    if (!map) return;

    const mapRect = map.getBoundingClientRect();

    const pixelX =
      event.clientX -
      mapRect.left -
      dragOffset.x;

    const pixelY =
      event.clientY -
      mapRect.top -
      dragOffset.y;

    const percentX =
      (pixelX / mapRect.width) * 100;

    const percentY =
      (pixelY / mapRect.height) * 100;

    setPosition({
      x: Math.max(0, Math.min(91, percentX)),
      y: Math.max(0, Math.min(80, percentY)),
    });
  }

  async function handlePointerUp() {
    if (!dragging) return;

    setDragging(false);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        campus_x: position.x,
        campus_y: position.y,
        current_location: "campus",
      })
      .eq("id", user.id);

    if (error) {
      console.log("Couldn't save campus position:", error);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen p-10">
        <p className="font-semibold text-[#a18a82]">
          Loading North Campus... ♡
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-10">
      <div className="mx-auto max-w-6xl">

        {/* Page heading */}
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#d8899a]">
            angel&apos;s little ♡ PINBOARD
          </p>

          <h1 className="mt-2 text-4xl font-bold text-[#6f5c56]">
            North Campus
          </h1>

          <p className="mt-2 text-[#a18a82]">
            {currentLocation === "campus"
              ? "Drag yourself somewhere on campus ♡"
              : "Your avatar is currently somewhere else ♡"}
          </p>

          {currentLocation !== "campus" && (
            <button
              type="button"
              onClick={spawnOnCampus}
              className="
                mt-4 rounded-full
                border-2 border-[#f0c7cf]
                bg-[#ffe4e9]
                px-6 py-2
                font-bold text-[#b87885]
                shadow-sm
                transition
                hover:-translate-y-0.5
                hover:shadow-md
              "
            >
              ♡ Spawn Avatar
            </button>
          )}
        </div>

        {/* Campus map */}
        <div
          ref={mapRef}
          className="
            relative mx-auto mt-8
            h-[650px] w-full
            overflow-hidden rounded-[40px]
            border-4 border-white
            bg-[#e8f5e9]
            shadow-xl
          "
        >

          {/* Morrison Dining */}
          <button
            type="button"
            className="
              absolute left-[5%] top-[15%]
              h-36 w-56
              rounded-[28px]
              border-4 border-white
              bg-[#f3dce2]
              font-bold text-[#6f5c56]
              shadow-md
            "
          >
            Morrison Dining
          </button>

          {/* Low Rise 6 */}
<button
  type="button"
  onClick={() => router.push("/dorm/low-rise-6")}
  className="
    group
    absolute left-[55%] top-[8%]
    h-32 w-48
    cursor-pointer
    rounded-[28px]
    border-4 border-white
    bg-[#e4f2fb]
    font-bold text-[#6f5c56]
    shadow-md
    transition-all duration-200
    hover:-translate-y-2
    hover:scale-[1.03]
    hover:border-[#c5dfef]
    hover:bg-[#d9edf9]
    hover:shadow-xl
    active:translate-y-0
    active:scale-[0.98]
  "
>
  <span className="block transition-transform duration-200 group-hover:-translate-y-1">
    Low Rise 6
  </span>

  <span
    className="
      mt-1 block
      text-xs font-semibold
      text-[#7896a8]
      opacity-0
      transition-all duration-200
      group-hover:translate-y-0
      group-hover:opacity-100
    "
  >
    Enter ♡
  </span>
</button>

{/* Low Rise 7 */}
<button
  type="button"
  onClick={() =>
  router.push("/dorm/low-rise-7?spawn=true")
}
  className="
    group
    absolute right-[7%] top-[13%]
    h-36 w-48
    cursor-pointer
    rounded-[28px]
    border-4 border-white
    bg-[#e8dff5]
    font-bold text-[#6f5c56]
    shadow-md
    transition-all duration-200
    hover:-translate-y-2
    hover:scale-[1.03]
    hover:border-[#d9caed]
    hover:bg-[#dfd3f0]
    hover:shadow-xl
    active:translate-y-0
    active:scale-[0.98]
  "
>
  <span className="block transition-transform duration-200 group-hover:-translate-y-1">
    Low Rise 7
  </span>

  <span
    className="
      mt-1 block
      text-xs font-semibold
      text-[#8d79a6]
      opacity-0
      transition-all duration-200
      group-hover:translate-y-0
      group-hover:opacity-100
    "
  >
    Enter ♡
  </span>
</button>

          {/* North Star / Appel */}
          <button
            type="button"
            className="
              absolute left-[65%] top-[70%]
              h-36 w-56
              rounded-[28px]
              border-4 border-white
              bg-[#fff0bd]
              font-bold text-[#6f5c56]
              shadow-md
            "
          >
            <span className="block">
              North Star
            </span>

            <span className="block text-xs font-medium text-[#a18a82]">
              Appel Commons
            </span>
          </button>

          {/* Other people currently spawned on Campus */}
          {otherUsers.map((otherUser) => (
            <div
              key={otherUser.id}
              className="pointer-events-none absolute z-10"
              style={{
                left: `${otherUser.campus_x ?? 85}%`,
                top: `${otherUser.campus_y ?? 15}%`,
                width: "95px",
                height: "130px",
              }}
            >
              <div
                className="pointer-events-none"
                style={{
                  transform: "scale(0.45)",
                  transformOrigin: "top left",
                }}
              >
                <Avatar
                  hair={otherUser.hair ?? "Brown"}
                  shirt={otherUser.shirt ?? "Blue"}
                  skinTone={otherUser.skin_tone ?? "Light"}
                  hairstyle={otherUser.hairstyle ?? "Short"}
                />
              </div>

              <div
                className="
                  absolute left-[47px] top-[112px]
                  -translate-x-1/2
                  whitespace-nowrap
                  rounded-full bg-white/90
                  px-2 py-1
                  text-xs font-semibold text-[#806b67]
                  shadow-sm
                "
              >
                {otherUser.username}
              </div>
            </div>
          ))}

          {/* Your avatar - ONLY visible if spawned on Campus */}
          {currentLocation === "campus" && (
            <div
              className={`
                absolute z-20
                touch-none select-none
                ${
                  dragging
                    ? "cursor-grabbing"
                    : "cursor-grab"
                }
              `}
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                width: "95px",
                height: "130px",
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <div
                className="pointer-events-none"
                style={{
                  transform: "scale(0.45)",
                  transformOrigin: "top left",
                }}
              >
                <Avatar
                  hair={hair}
                  shirt={shirt}
                  skinTone={skinTone}
                  hairstyle={hairstyle}
                />
              </div>

              {/* Your username */}
              <div
                className="
                  pointer-events-none
                  absolute left-[47px] top-[112px]
                  -translate-x-1/2
                  whitespace-nowrap
                  rounded-full bg-white/90
                  px-2 py-1
                  text-xs font-semibold text-[#806b67]
                  shadow-sm
                "
              >
                {username}
              </div>
            </div>
          )}

          {/* Map label */}
          <div
            className="
              pointer-events-none
              absolute bottom-5 left-1/2
              -translate-x-1/2
              rounded-full bg-white/80
              px-5 py-2
              text-sm font-semibold text-[#a18a82]
              shadow-sm
            "
          >
            North Campus · Cornell University
          </div>
        </div>
      </div>
    </main>
  );
}