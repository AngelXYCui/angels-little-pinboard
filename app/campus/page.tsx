"use client";

import { useEffect, useRef, useState } from "react";
import Avatar from "../../components/Avatar";
import { createClient } from "../../lib/supabase/client";

export default function CampusPage() {
  const supabase = createClient();
  const mapRef = useRef<HTMLDivElement>(null);

  const [hair, setHair] = useState("Brown");
  const [shirt, setShirt] = useState("Blue");
  const [skinTone, setSkinTone] = useState("Light");
  const [hairstyle, setHairstyle] = useState("Short");

  // Default position: Low Rise 7
  const [position, setPosition] = useState({
    x: 900,
    y: 120,
  });

  const [dragging, setDragging] = useState(false);

  const [dragOffset, setDragOffset] = useState({
    x: 0,
    y: 0,
  });

  const [loading, setLoading] = useState(true);

  // Load avatar customization + saved campus position
  useEffect(() => {
    async function loadCampusProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "hair, shirt, skin_tone, hairstyle, campus_x, campus_y"
        )
        .eq("id", user.id)
        .single();

      if (error) {
        console.log(error);
        setLoading(false);
        return;
      }

      if (data) {
        setHair(data.hair ?? "Brown");
        setShirt(data.shirt ?? "Blue");
        setSkinTone(data.skin_tone ?? "Light");
        setHairstyle(data.hairstyle ?? "Short");

        setPosition({
          x: data.campus_x ?? 900,
          y: data.campus_y ?? 120,
        });
      }

      setLoading(false);
    }

    loadCampusProfile();
  }, []);

  // Start dragging
  function handlePointerDown(
    event: React.PointerEvent<HTMLDivElement>
  ) {
    const map = mapRef.current;

    if (!map) return;

    const mapRect = map.getBoundingClientRect();

    setDragging(true);

    setDragOffset({
      x: event.clientX - mapRect.left - position.x,
      y: event.clientY - mapRect.top - position.y,
    });

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  // Move avatar
  function handlePointerMove(
    event: React.PointerEvent<HTMLDivElement>
  ) {
    if (!dragging) return;

    const map = mapRef.current;

    if (!map) return;

    const mapRect = map.getBoundingClientRect();

    const newX =
      event.clientX -
      mapRect.left -
      dragOffset.x;

    const newY =
      event.clientY -
      mapRect.top -
      dragOffset.y;

    const boundedX = Math.max(
      0,
      Math.min(mapRect.width - 95, newX)
    );

    const boundedY = Math.max(
      0,
      Math.min(mapRect.height - 130, newY)
    );

    setPosition({
      x: boundedX,
      y: boundedY,
    });
  }

  // Stop dragging + save position
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

          {/* Your draggable avatar */}
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
              left: position.x,
              top: position.y,
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