type AvatarProps = {
  hair?: string;
  shirt?: string;
  skinTone?: string;
  hairstyle?: string;
};

export default function Avatar({
  hair = "Brown",
  hairstyle = "Short",
}: AvatarProps) {
  const hairstyleFiles: Record<string, string> = {
    Short: "short",
    Braids: "braids",
    Long: "long",
    Ponytail: "ponytail",
    Buns: "buns",
  };

  const hairFilters: Record<string, string> = {
    Brown: "none",
    Black: "brightness(0.38) saturate(0.7)",
    Blonde:
      "brightness(1.35) saturate(0.75) sepia(0.45) hue-rotate(355deg)",
  };

  const hairstyleStyles: Record<
    string,
    { width: string; top: string; left: string }
  > = {
    Short: {
      width: "105%",
      top: "-7px",
      left: "50%",
    },
    Braids: {
      width: "129%",
      top: "0px",
      left: "50%",
    },
    Long: {
      width: "130%",
      top: "10px",
      left: "50%",
    },
    Ponytail: {
      width: "117%",
      top: "-13px",
      left: "58%",
    },
    Buns: {
      width: "113%",
      top: "-20px",
      left: "50%",
    },
  };

  const hairFile = hairstyleFiles[hairstyle] ?? "short";
  const hairStyle =
    hairstyleStyles[hairstyle] ?? hairstyleStyles.Short;
  const hairFilter = hairFilters[hair] ?? "none";

  return (
    <div className="relative h-72 w-52">
      {/* Base avatar */}
      <img
        src="/avatar-parts/base/light.png"
        alt=""
        draggable={false}
        className="pointer-events-none absolute left-1/2 top-0 w-[130%] max-w-none -translate-x-1/2 select-none"
        />

      {/* Hair */}
      <img
        src={`/avatar-parts/hair/${hairFile}-brown.png`}
        alt=""
        draggable={false}
        className="pointer-events-none absolute max-w-none -translate-x-1/2 select-none"
        style={{
            width: hairStyle.width,
            top: hairStyle.top,
            left: hairStyle.left,
            filter: hairFilter,
        }}
        />
    </div>
  );
}