import { useMemo, useState } from "react";
import { ContainerItem } from "@/lib/types";
import { cn } from "@/lib/utils";

interface WorldContainerMapProps {
  containers: ContainerItem[];
  className?: string;
}

function project(lat: number, lng: number, width: number, height: number): [number, number] {
  const x = ((lng + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return [x, y];
}

const CONTINENTS = [
  {
    name: "North America",
    d: "M 90,55 L 108,50 125,52 140,58 155,65 170,70 185,82 195,95 200,110 210,118 215,130 220,140 225,148 230,152 222,158 210,160 200,155 188,150 175,148 165,152 155,160 145,165 138,162 130,155 120,148 112,142 105,138 100,130 95,120 88,105 82,90 80,75 82,65 Z",
  },
  {
    name: "Central America",
    d: "M 155,160 L 165,158 172,162 178,168 182,175 180,180 175,185 168,188 162,185 158,178 155,172 152,168 Z",
  },
  {
    name: "South America",
    d: "M 175,188 L 185,185 195,188 208,195 218,210 225,228 228,248 226,268 222,285 215,298 208,310 198,318 188,322 180,318 175,308 172,295 170,278 168,260 165,242 166,225 170,210 172,198 Z",
  },
  {
    name: "Europe",
    d: "M 370,52 L 385,48 400,50 415,52 428,55 435,60 440,68 438,78 432,85 425,90 418,92 410,88 400,85 392,82 385,78 380,72 375,65 372,58 Z",
  },
  {
    name: "Africa",
    d: "M 380,115 L 395,112 410,115 425,118 438,122 448,130 455,142 458,158 460,175 458,195 455,212 450,228 442,242 432,252 420,258 408,260 396,255 388,248 382,238 378,225 375,210 372,192 370,175 368,158 370,140 375,128 Z",
  },
  {
    name: "Asia",
    d: "M 440,42 L 460,38 480,35 500,32 520,30 540,32 560,35 580,38 600,42 618,48 630,55 638,65 640,78 642,90 640,100 635,108 625,115 615,120 605,125 595,130 585,135 575,138 562,140 548,138 535,135 520,138 510,142 500,145 490,148 480,145 470,140 460,132 452,122 446,110 442,98 438,85 435,72 438,58 Z",
  },
  {
    name: "India",
    d: "M 530,140 L 542,138 552,142 558,150 560,162 558,175 552,185 545,190 538,188 532,180 528,170 526,158 528,148 Z",
  },
  {
    name: "Southeast Asia",
    d: "M 580,140 L 595,138 608,142 618,148 625,158 622,168 615,175 605,178 595,175 588,168 582,158 580,148 Z",
  },
  {
    name: "Australia",
    d: "M 600,255 L 618,248 635,245 652,248 668,255 678,265 682,278 680,290 672,298 660,302 645,305 630,302 618,298 608,290 602,278 600,265 Z",
  },
  {
    name: "Indonesia",
    d: "M 588,195 L 600,192 615,190 628,192 640,195 648,200 642,206 630,208 618,210 605,208 595,204 590,200 Z",
  },
  {
    name: "Japan",
    d: "M 645,75 L 652,70 658,72 660,80 658,88 654,95 648,98 644,92 642,85 644,78 Z",
  },
  {
    name: "UK",
    d: "M 372,55 L 378,52 382,55 383,62 380,68 375,70 371,66 370,60 Z",
  },
  {
    name: "Greenland",
    d: "M 220,20 L 240,18 255,22 265,30 268,40 262,48 250,50 238,48 228,42 222,32 Z",
  },
];

export function WorldContainerMap({ containers, className }: WorldContainerMapProps) {
  const width = 800;
  const height = 400;
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const points = useMemo(() => {
    return containers
      .filter((c) => c.lat !== undefined && c.lng !== undefined)
      .map((c) => {
        const [x, y] = project(c.lat!, c.lng!, width, height);
        return { ...c, x, y };
      });
  }, [containers]);

  const arrived = points.filter((p) => p.arrived);
  const notArrived = points.filter((p) => !p.arrived);

  return (
    <div className={cn("bg-white border border-border rounded-xl p-6 shadow-card", className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Container Locations</h2>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "hsl(142 70% 45%)" }} />
            <span className="text-muted-foreground">Arrived ({arrived.length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "hsl(0 72% 51%)" }} />
            <span className="text-muted-foreground">Not Arrived ({notArrived.length})</span>
          </div>
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-lg border border-border/30">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto block"
          style={{ maxHeight: 340 }}
        >
          <rect width={width} height={height} fill="hsl(210 40% 98%)" />

          {Array.from({ length: 7 }).map((_, i) => {
            const x = (width / 8) * (i + 1);
            return (
              <line
                key={`vg-${i}`}
                x1={x} y1={0} x2={x} y2={height}
                stroke="hsl(210 20% 93%)" strokeWidth={0.5}
              />
            );
          })}
          {Array.from({ length: 3 }).map((_, i) => {
            const y = (height / 4) * (i + 1);
            return (
              <line
                key={`hg-${i}`}
                x1={0} y1={y} x2={width} y2={y}
                stroke="hsl(210 20% 93%)" strokeWidth={0.5}
              />
            );
          })}

          <line
            x1={0} y1={height / 2} x2={width} y2={height / 2}
            stroke="hsl(210 15% 88%)" strokeWidth={0.8} strokeDasharray="6 4"
          />

          {CONTINENTS.map((continent) => (
            <path
              key={continent.name}
              d={continent.d}
              fill="hsl(210 15% 92%)"
              stroke="hsl(210 10% 85%)"
              strokeWidth={0.8}
              strokeLinejoin="round"
            />
          ))}

          {notArrived.map((p, i) => (
            <g key={`na-${i}`}>
              <circle cx={p.x} cy={p.y} r={8} fill="hsl(0 72% 51% / 0.08)" stroke="none">
                <animate
                  attributeName="r"
                  values="5;14;5"
                  dur="2.5s"
                  repeatCount="indefinite"
                  begin={`${i * 0.4}s`}
                />
                <animate
                  attributeName="opacity"
                  values="0.5;0;0.5"
                  dur="2.5s"
                  repeatCount="indefinite"
                  begin={`${i * 0.4}s`}
                />
              </circle>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredId === p.id ? 6 : 4.5}
                fill="hsl(0 72% 51%)"
                stroke="white"
                strokeWidth={1.5}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredId(p.id)}
                onMouseLeave={() => setHoveredId(null)}
              />
            </g>
          ))}

          {arrived.map((p, i) => (
            <g key={`a-${i}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredId === p.id ? 6 : 4.5}
                fill="hsl(142 70% 45%)"
                stroke="white"
                strokeWidth={1.5}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredId(p.id)}
                onMouseLeave={() => setHoveredId(null)}
              />
            </g>
          ))}

          {points.map((p) => (
            <g key={`tooltip-${p.id}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r={12}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredId(p.id)}
                onMouseLeave={() => setHoveredId(null)}
              />

              {hoveredId === p.id && (
                <g>
                  <rect
                    x={p.x + 10}
                    y={p.y - 35}
                    width={Math.max(110, (p.port || "").length * 6.5 + 20)}
                    height={42}
                    rx={6}
                    fill="hsl(220 13% 15%)"
                    opacity={0.92}
                  />
                  <text
                    x={p.x + 18}
                    y={p.y - 19}
                    fill="white"
                    fontSize={10}
                    fontWeight={600}
                  >
                    {p.id}
                  </text>
                  <text
                    x={p.x + 18}
                    y={p.y - 5}
                    fill="hsl(0 0% 75%)"
                    fontSize={9}
                  >
                    {p.port || "Unknown port"}
                  </text>
                </g>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
