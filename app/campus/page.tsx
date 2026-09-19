"use client";

export default function CampusPage() {
  return (
    <main className="min-h-screen p-10">
      <div className="mx-auto max-w-6xl">
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
          className="
            relative mx-auto mt-8
            h-[650px] w-full
            overflow-hidden rounded-[40px]
            border-4 border-white
            bg-[#e8f5e9]
            shadow-xl
          "
        >
          {/* Temporary paths */}
          <div className="absolute left-[48%] top-0 h-full w-16 bg-[#fffaf7]" />

          <div className="absolute left-0 top-[48%] h-16 w-full bg-[#fffaf7]" />

          {/* Low Rise 7 */}
          <button
            className="
              absolute left-[10%] top-[13%]
              h-32 w-48
              rounded-[28px]
              border-4 border-white
              bg-[#e8dff5]
              font-bold text-[#6f5c56]
              shadow-md
              transition hover:-translate-y-1 hover:shadow-lg
            "
          >
            🏠
            <span className="mt-2 block">Low Rise 7</span>
          </button>

          {/* Low Rise 6 */}
          <button
            className="
              absolute left-[12%] top-[62%]
              h-32 w-48
              rounded-[28px]
              border-4 border-white
              bg-[#e4f2fb]
              font-bold text-[#6f5c56]
              shadow-md
              transition hover:-translate-y-1 hover:shadow-lg
            "
          >
            🏠
            <span className="mt-2 block">Low Rise 6</span>
          </button>

          {/* North Star */}
          <button
            className="
              absolute right-[9%] top-[12%]
              h-36 w-56
              rounded-[28px]
              border-4 border-white
              bg-[#fff0bd]
              font-bold text-[#6f5c56]
              shadow-md
              transition hover:-translate-y-1 hover:shadow-lg
            "
          >
            🍽️
            <span className="mt-2 block">
              North Star
            </span>
            <span className="block text-xs font-medium text-[#a18a82]">
              Appel Commons
            </span>
          </button>

          {/* Morrison */}
          <button
            className="
              absolute bottom-[12%] right-[8%]
              h-36 w-56
              rounded-[28px]
              border-4 border-white
              bg-[#f3dce2]
              font-bold text-[#6f5c56]
              shadow-md
              transition hover:-translate-y-1 hover:shadow-lg
            "
          >
            🍽️
            <span className="mt-2 block">Morrison Dining</span>
          </button>

          {/* Map label */}
          <div
            className="
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