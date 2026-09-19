"use client";

import { useEffect, useRef, useState } from "react";
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
};

export default function CampusPage() {
  const supabase = createClient();
  const mapRef = useRef<HTMLDivElement>(null);

  const [userId, setUserId] = useState("");

  const [username, setUsername] = useState("");
  const [hair, setHair] = useState("Brown");
  const [shirt, setShirt] = useState("Blue");
  const [skinTone, setSkinTone] = useState("Light");
  const [hairstyle, setHairstyle] = useState("Short");

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

  // Load yourself + everyone else
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
          "id, username, hair, shirt, skin_tone, hairstyle, campus_x, campus_y"
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

        setPosition({
          x: myProfile.campus_x ?? 85,
          y: myProfile.campus_y ?? 15,
        });
      }

      const { data: people, error: peopleError } = await supabase
        .from("profiles")
        .select(
          "id, username, hair, shirt, skin_tone, hairstyle, campus_x, campus_y"
        )
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

            return [...currentUsers, updatedUser];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

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
            Drag yourself somewhere on campus ♡
          </p>
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
            className="
              absolute left-[55%] top-[8%]
              h-32 w-48
              rounded-[28px]
              border-4 border-white
              bg-[#e4f2fb]
              font-bold text-[#6f5c56]
              shadow-md
            "
          >
            Low Rise 6
          </button>

          {/* Low Rise 7 */}
          <button
            type="button"
            className="
              absolute right-[7%] top-[13%]
              h-36 w-48
              rounded-[28px]
              border-4 border-white
              bg-[#e8dff5]
              font-bold text-[#6f5c56]
              shadow-md
            "
          >
            Low Rise 7
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

          {/* Other people */}
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

          {/* Your avatar */}
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