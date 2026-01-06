import React, { useState, useRef, useEffect } from "react";
import { BiColorFill } from "react-icons/bi";
import { IoChevronDown } from "react-icons/io5";

export default function ColorPickerPopup({
  label,
  recentColors,
  initialColor,
  onChange,
  onClose,
}: {
  label: string;
  recentColors: string[];
  initialColor: string;
  onChange: (color: string) => void;
  onClose: () => void;
}) {
  const [selectedColor, setSelectedColor] = useState<string>(initialColor);
  const [hue, setHue] = useState<number>(217);
  const [saturation, setSaturation] = useState<number>(91);
  const [lightness, setLightness] = useState<number>(60);
  const [alpha, setAlpha] = useState<number>(100);
  const [inputValue, setInputValue] = useState<string>(initialColor);
  const [format, setFormat] = useState<string>("hex");

  const [isFormatDropdownOpen, setIsFormatDropdownOpen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const hex = hslToHex(hue, saturation, lightness);
    const alphaDecimal = alpha / 100;
    const colorWithAlpha =
      alpha < 100
        ? `${hex}${Math.round(alphaDecimal * 255)
            .toString(16)
            .padStart(2, "0")}`
        : hex;
    onChange(colorWithAlpha);
  }, [hue, saturation, lightness, alpha]);

  useEffect(() => {
    const hsl = hexToHSL(initialColor);
    setHue(hsl.h);
    setSaturation(hsl.s);
    setLightness(hsl.l);
    setAlpha(hsl.a ?? 100);
    setSelectedColor(initialColor.substring(0, 7)); // Ensure only hex part is set
    setInputValue(initialColor);
  }, []);

  useEffect(() => {
    updateColorFromHSL();
  }, [hue, saturation, lightness, alpha]);

  useEffect(() => {
    drawSaturationLightness();
  }, [hue]);

  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const hslToRgb = (
    h: number,
    s: number,
    l: number
  ): { r: number; g: number; b: number } => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color);
    };
    return { r: f(0), g: f(8), b: f(4) };
  };

  const hexToHSL = (
    hex: string
  ): { h: number; s: number; l: number; a?: number } => {
    const result =
      /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);
    if (!result) return { h: 0, s: 0, l: 0 };

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;
    let a = result[4]
      ? Math.round((parseInt(result[4], 16) / 255) * 100)
      : undefined;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h: number, s: number;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
        default:
          h = 0;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
      a,
    };
  };

  const updateColorFromHSL = (): void => {
    const hex = hslToHex(hue, saturation, lightness);
    setSelectedColor(hex);
    setInputValue(getFormattedColor(hex));
  };

  const getFormattedColor = (hex: string, formatOverride?: string): string => {
    const rgb = hslToRgb(hue, saturation, lightness);
    const alphaDecimal = alpha / 100;
    const currentFormat = formatOverride || format;

    switch (currentFormat) {
      case "hex":
        return alpha < 100
          ? `${hex}${Math.round(alphaDecimal * 255)
              .toString(16)
              .padStart(2, "0")}`
          : hex;
      case "rgb":
        return alpha < 100
          ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alphaDecimal.toFixed(2)})`
          : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      case "hsl":
        return alpha < 100
          ? `hsla(${hue}, ${saturation}%, ${lightness}%, ${alphaDecimal.toFixed(
              2
            )})`
          : `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      default:
        return hex;
    }
  };

  const drawSaturationLightness = (): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    // Optimization: Pre-calculate hue-dependent values
    const hPr = hue / 30;
    const kr = hPr % 12;
    const kg = (8 + hPr) % 12;
    const kb = (4 + hPr) % 12;

    const f = (k: number) => Math.max(Math.min(k - 3, 9 - k, 1), -1);
    const fKr = f(kr);
    const fKg = f(kg);
    const fKb = f(kb);

    for (let y = 0; y < height; y++) {
      const lNorm = 1 - y / height;
      const minL = Math.min(lNorm, 1 - lNorm);

      for (let x = 0; x < width; x++) {
        const sNorm = x / width;
        const a = sNorm * minL;

        // Calculate RGB
        const r = 255 * (lNorm - a * fKr);
        const g = 255 * (lNorm - a * fKg);
        const b = 255 * (lNorm - a * fKb);

        const index = (y * width + x) * 4;
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  };

  const isDraggingRef = useRef(false);

  useEffect(() => {
    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

      const newSaturation = Math.round((x / rect.width) * 100);
      const newLightness = Math.round(100 - (y / rect.height) * 100);

      setSaturation(newSaturation);
      setLightness(newLightness);
    };

    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const handleCanvasMouseDown = (
    e: React.MouseEvent<HTMLCanvasElement>
  ): void => {
    isDraggingRef.current = true;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newSaturation = Math.round((x / rect.width) * 100);
    const newLightness = Math.round(100 - (y / rect.height) * 100);

    setSaturation(newSaturation);
    setLightness(newLightness);
  };

  const handleInputChange = (value: string): void => {
    setInputValue(value);
    if (
      value.startsWith("#") &&
      (/^#[0-9A-Fa-f]{6}$/.test(value) || /^#[0-9A-Fa-f]{8}$/.test(value))
    ) {
      const hsl = hexToHSL(value);
      setHue(hsl.h);
      setSaturation(hsl.s);
      setLightness(hsl.l);
      if (hsl.a !== undefined) setAlpha(hsl.a);
    }
  };

  return (
    <div className="bg-main-300 rounded-lg shadow-2xl w-full max-w-xs overflow-hidden">
      <span className="block text-tertiary-500 m-3">{label}</span>
      <div className="relative border-y border-stroke-500">
        <canvas
          ref={canvasRef}
          width={300}
          height={200}
          onMouseDown={handleCanvasMouseDown}
          className="w-full h-60 cursor-crosshair"
        />
        <div
          className="absolute w-4 h-4 border-2 border-white rounded-full shadow-xl pointer-events-none"
          style={{
            left: `${saturation}%`,
            top: `${100 - lightness}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>

      <div className="flex items-center justify-between py-4 pr-4">
        <div className="min-w-16 flex items-center justify-center">
          <BiColorFill size={25} />
        </div>
        <div className="w-full">
          <div className="relative w-full h-4 rounded-full mb-2">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
              }}
            />
            <div
              className="absolute top-1/2  w-4 h-4 border-2 border-white rounded-full shadow-md pointer-events-none bg-black/20"
              style={{
                left: `calc(${hue / 360} * (100% - 20px) + 10px)`,
                transform: "translate(-50%, -50%)",
              }}
            />
            <input
              type="range"
              min="0"
              max="360"
              value={hue}
              onChange={(e) => setHue(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {/* Alpha Slider */}
          <div className="relative w-full h-4 rounded-full">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                backgroundColor: "white",
                backgroundImage:
                  "linear-gradient(45deg, #e5e5e5 25%, transparent 25%), linear-gradient(-45deg, #e5e5e5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e5e5 75%), linear-gradient(-45deg, transparent 75%, #e5e5e5 75%)",
                backgroundSize: "10px 10px",
                backgroundPosition: "0 0, 0 5px, 5px -5px, -5px 0px",
              }}
            />
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `linear-gradient(to right, transparent, ${selectedColor})`,
              }}
            />
            <div
              className="absolute top-1/2  w-4 h-4 border-2 border-white rounded-full shadow-md pointer-events-none bg-black/20"
              style={{
                left: `calc(${alpha / 100} * (100% - 20px) + 10px)`,
                transform: "translate(-50%, -50%)",
              }}
            />
            <input
              type="range"
              min="0"
              max="100"
              value={alpha}
              onChange={(e) => setAlpha(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 px-3 border-y border-stroke-500 py-4">
        <div className="relative">
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsFormatDropdownOpen(!isFormatDropdownOpen);
            }}
            className={`px-2 py-1.5 rounded focus:outline-none text-sm bg-main-900 flex items-center justify-between min-w-[60px] gap-2 duration-200 border border-transparent hover:border-stroke-500 ${
              isFormatDropdownOpen ? "border-stroke-500!" : ""
            }`}
          >
            <span>{format.toUpperCase()}</span>
            <IoChevronDown
              size={14}
              className={`transition-transform ${
                isFormatDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isFormatDropdownOpen && (
            <div className="absolute top-full left-0 mt-0.5 w-full bg-main-300 border border-main-650 rounded-xs shadow z-50 flex flex-col">
              {["hex", "rgb", "hsl"].map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setFormat(f);
                    setInputValue(getFormattedColor(selectedColor, f));
                    setIsFormatDropdownOpen(false);
                  }}
                  className={`
                        px-1 py-0.5 m-0.5 rounded text-left text-sm transition-colors hover:bg-main-650 
                        ${format === f ? "bg-main-700" : ""}
                      `}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 flex items-center bg-main-900 rounded border border-transparent hover:border-main-700 focus-within:border-main-700 transition-colors">
          <div className="relative flex-1">
            <div
              className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded border-2 border-main-300 pointer-events-none shadow-sm"
              style={{
                backgroundColor: selectedColor,
                opacity: alpha / 100,
              }}
            />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-full pl-9 pr-1 py-1 bg-transparent focus:outline-none text-sm text-tertiary-500"
            />
          </div>
          <div className="w-px h-4  mx-1 bg-main-700" />
          <div className="relative w-12">
            <input
              type="text"
              value={alpha}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (!isNaN(val) && val >= 0 && val <= 100) {
                  setAlpha(val);
                }
              }}
              className="w-full pl-1 pr-5 py-1 bg-transparent focus:outline-none text-sm text-tertiary-500 text-right"
            />
            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs text-tertiary-500 pointer-events-none">
              %
            </span>
          </div>
        </div>
      </div>

      {recentColors && recentColors.length > 0 && (
        <div className="flex gap-3 px-3 py-3">
          {recentColors.map((color, idx) => (
            <button
              key={idx}
              onClick={() => {
                const hsl = hexToHSL(color);
                setHue(hsl.h);
                setSaturation(hsl.s);
                setLightness(hsl.l);
              }}
              className="w-6 h-6 rounded-lg hover:scale-110  cursor-pointer duration-200  border-2 border-main-500"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}
      <div className="px-1">
        <button
          onClick={(e) => {
            e.preventDefault();
            onClose();
          }}
          className="w-full box-border my-1 py-2 rounded-lg bg-main-550 hover:bg-main-650 duration-200 cursor-pointer text-center"
        >
          Done
        </button>
      </div>
    </div>
  );
}
