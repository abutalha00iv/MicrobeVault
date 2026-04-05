const REGIONS = [
  {
    id: "north-america",
    label: "N. America",
    d: "M 50,38 L 100,30 L 142,36 L 168,54 L 172,80 L 158,108 L 168,122 L 150,136 L 116,142 L 78,136 L 48,116 L 32,88 Z",
    cx: 104, cy: 88,
  },
  {
    id: "south-america",
    label: "S. America",
    d: "M 122,158 L 190,158 L 202,178 L 198,215 L 184,255 L 162,272 L 140,262 L 124,232 L 118,195 Z",
    cx: 160, cy: 214,
  },
  {
    id: "europe",
    label: "Europe",
    d: "M 246,58 L 272,38 L 312,36 L 342,46 L 350,62 L 344,82 L 320,96 L 288,98 L 254,82 Z",
    cx: 296, cy: 67,
  },
  {
    id: "africa",
    label: "Africa",
    d: "M 248,106 L 312,100 L 350,110 L 356,142 L 350,182 L 335,216 L 308,228 L 278,228 L 252,212 L 242,178 L 242,136 Z",
    cx: 296, cy: 162,
  },
  {
    id: "asia",
    label: "Asia",
    d: "M 352,44 L 422,28 L 492,32 L 540,50 L 556,72 L 552,108 L 520,130 L 474,148 L 414,142 L 368,122 L 348,88 Z",
    cx: 452, cy: 88,
  },
  {
    id: "oceania",
    label: "Oceania",
    d: "M 448,188 L 532,184 L 554,202 L 550,236 L 530,252 L 498,258 L 462,250 L 442,226 Z",
    cx: 496, cy: 220,
  },
];

export function DiseaseMap({ activeRegions }: { activeRegions: string[] }) {
  const activeCount = activeRegions.length;

  return (
    <div className="glass-panel overflow-hidden rounded-[2rem]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Global distribution</p>
        {activeCount > 0 ? (
          <span className="rounded-full border border-pathogen/30 bg-pathogen/10 px-2 py-0.5 text-[10px] text-pathogen">
            {activeCount} region{activeCount > 1 ? "s" : ""} affected
          </span>
        ) : (
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-500">
            No active regions
          </span>
        )}
      </div>

      {/* SVG Map */}
      <svg viewBox="0 0 580 290" className="w-full">
        <defs>
          <filter id="region-glow" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="ocean-bg" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="rgba(6,20,48,0.95)" />
            <stop offset="100%" stopColor="rgba(3,10,28,0.98)" />
          </radialGradient>
        </defs>

        {/* Ocean */}
        <rect x="0" y="0" width="580" height="290" fill="url(#ocean-bg)" />

        {/* Latitude guide lines */}
        {[72, 145, 218].map((y) => (
          <line key={y} x1="10" y1={y} x2="570" y2={y}
            stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4 8" />
        ))}
        {/* Equator — slightly more visible */}
        <line x1="10" y1={145} x2="570" y2={145}
          stroke="rgba(0,245,212,0.08)" strokeWidth="1" />

        {/* Continent regions */}
        {REGIONS.map((region) => {
          const active = activeRegions.includes(region.id);
          return (
            <g key={region.id}>
              {active && (
                <path
                  d={region.d}
                  fill="rgba(255,71,87,0.18)"
                  stroke="rgba(255,71,87,0.55)"
                  strokeWidth="6"
                  strokeLinejoin="round"
                  filter="url(#region-glow)"
                />
              )}
              <path
                d={region.d}
                fill={active ? "rgba(255,71,87,0.32)" : "rgba(80,130,160,0.2)"}
                stroke={active ? "rgba(255,71,87,0.95)" : "rgba(0,245,212,0.28)"}
                strokeWidth={active ? "1.5" : "1"}
                strokeLinejoin="round"
              />
              <text
                x={region.cx}
                y={region.cy}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={active ? "#FFD7DC" : "#64748B"}
                fontSize="8.5"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                fontWeight={active ? "700" : "400"}
                letterSpacing="0.02em"
              >
                {region.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-5 border-t border-white/[0.06] px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm border border-pathogen/70 bg-pathogen/40" />
          <span className="text-[11px] text-slate-400">Active / endemic</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm border border-cyan/25 bg-slate-700/50" />
          <span className="text-[11px] text-slate-400">Not reported</span>
        </div>
      </div>
    </div>
  );
}
