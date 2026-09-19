type AvatarProps = {
  hair?: string;
  shirt?: string;
  skinTone?: string;
  hairstyle?: string;
};

export default function Avatar({
  hair = "Brown",
  shirt = "Blue",
  skinTone = "Light",
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
      "brightness(1.80) saturate(0.75) sepia(0.45) hue-rotate(370deg)",
  };

  const shirtFilters: Record<string, string> = {
  Red:
    "sepia(0.65) saturate(10) hue-rotate(293deg) brightness(1.02)",

  Orange:
    "sepia(0.7) saturate(10) hue-rotate(300deg) brightness(1.05)",

  Yellow:
    "sepia(0.75) saturate(5) hue-rotate(330deg) brightness(0.95)",

  Green:
    "sepia(0.8) saturate(2) hue-rotate(80deg) brightness(0.90)",

  Blue:
    "sepia(0.55) saturate(7) hue-rotate(160deg) brightness(0.90)",

  Purple:
    "sepia(0.00) saturate(15) hue-rotate(290deg) brightness(0.90)",

  Pink:
    "sepia(0.55) saturate(6) hue-rotate(285deg) brightness(1.00)",
};

const shirtFilter = shirtFilters[shirt] ?? shirtFilters.Blue;

  const hairstyleStyles: Record<
    string,
    { width: string; top: string; left: string }
  > = {
    Short: {
      width: "105%",
      top: "-7px",
      left: "50.16%",
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
  const skinColors: Record<string, string> = {
  Light: "#ffd9c7",
  Fair: "#f4c7ae",
  Medium: "#dca47e",
  Tan: "#bd805d",
  Deep: "#8c5a43",
  Dark: "#654237",
};

const skinColor = skinColors[skinTone] ?? skinColors.Light;

  return (
    <div className="relative h-72 w-52">
      {/* Base avatar */}
      {/* Base avatar + skin color */}
<div className="pointer-events-none absolute left-1/2 top-0 w-[130%] max-w-none -translate-x-1/2 select-none">
  <img
    src="/avatar-parts/base/light.png"
    alt=""
    draggable={false}
    className="block w-full"
  />
 
  {/*Body*/}
  <div
    className="absolute inset-0"
    style={{
      backgroundColor: skinColor,
      WebkitMaskImage: 'url("/avatar-parts/base/skin-mask.png")',
      maskImage: 'url("/avatar-parts/base/skin-mask.png")',
      WebkitMaskSize: "100% 100%",
      maskSize: "100% 100%",
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
    }}
  />
</div>
{/* Shirt */}
<img
  src="/avatar-parts/shirt/shirt.png"
  alt=""
  draggable={false}
  className="pointer-events-none absolute max-w-none select-none"
  style={{
    width: "65%",
    top: "79px",
    left: "50%",
    transform: "translateX(-50%)",
    filter: shirtFilter,
  }}
/>
{/* Eyes + mouth */}
<img
  src="/avatar-parts/face/features.png"
  alt=""
  draggable={false}
  className="pointer-events-none absolute max-w-none select-none"
  style={{
    width: "88%",
    top: "57px",
    left: "50%",
    transform: "translateX(-50%)",
  }}
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