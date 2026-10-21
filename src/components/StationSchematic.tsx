export const stationViews = [
  { id: 'station', crumb: 'Space Station', scale: 'Whole station · plan view, simplified' },
  { id: 'columbus', crumb: 'Columbus', scale: 'Columbus module · enlarged, schematic' },
  { id: 'icecubes', crumb: 'ICE Cubes Facility', scale: 'ICE Cubes Facility · enlarged, schematic' },
  { id: 'payload', crumb: 'TIGERS-X', scale: 'TIGERS-X · 20 × 20 × 10 cm' },
] as const;

export type StationViewId = (typeof stationViews)[number]['id'];

const descriptions: Record<StationViewId, string> = {
  station:
    'Simplified plan view of the International Space Station with the direction of travel toward the top. A long truss with solar arrays crosses a central line of pressurised modules. At the forward end, the Harmony node carries Kibo on its port side and Columbus, highlighted, on its starboard side.',
  columbus:
    'Enlarged schematic of the Columbus module, attached to Harmony at one end. Equipment racks line its interior; one rack, highlighted, hosts the ICE Cubes Facility. The rack position is illustrative.',
  icecubes:
    'Enlarged schematic of the ICE Cubes Facility: a frame of slots for plug-in experiment cubes. A two-by-two block of slots, highlighted, represents TIGERS-X. The slot layout is simplified.',
  payload: 'The TIGERS-X payload drawn as a box 20 centimetres wide, 20 centimetres deep and 10 centimetres tall.',
};

function StationPlan() {
  const arrays = [70, 140, 552, 622];
  return (
    <g>
      {/* Truss and solar arrays */}
      <rect className="ss-structure" x="54" y="228" width="612" height="12" rx="2" />
      {arrays.map((x) => (
        <g key={x}>
          <rect className="ss-array" x={x} y="112" width="28" height="110" />
          <rect className="ss-array" x={x} y="246" width="28" height="110" />
          <line className="ss-thin" x1={x + 14} y1="222" x2={x + 14} y2="246" />
        </g>
      ))}
      {/* Pressurised spine, forward at top */}
      <rect className="ss-module" x="352" y="86" width="16" height="16" rx="3" />
      <rect className="ss-module" x="344" y="102" width="32" height="46" rx="6" />
      <rect className="ss-module" x="346" y="148" width="28" height="78" rx="6" />
      <rect className="ss-module" x="342" y="226" width="36" height="20" rx="5" />
      <rect className="ss-module" x="346" y="246" width="28" height="56" rx="6" />
      <rect className="ss-module" x="344" y="302" width="32" height="74" rx="6" />
      {/* Kibo (port) */}
      <rect className="ss-module" x="262" y="108" width="82" height="34" rx="6" />
      {/* Columbus (starboard) */}
      <rect className="ss-highlight" x="376" y="111" width="62" height="28" rx="6" />
      <text className="ss-label" x="304" y="99" textAnchor="middle">Kibo</text>
      <line className="ss-leader" x1="376" y1="144" x2="396" y2="164" />
      <text className="ss-label ss-label--muted" x="400" y="174">Harmony node</text>
      <line className="ss-leader" x1="440" y1="125" x2="486" y2="96" />
      <text className="ss-label ss-label--strong" x="490" y="92">Columbus</text>
      <text className="ss-label ss-label--muted" x="490" y="108">European laboratory</text>
      {/* Orientation */}
      <g className="ss-orient" transform="translate(70 70)">
        <line x1="0" y1="26" x2="0" y2="0" markerEnd="url(#ss-arrow)" />
        <text x="10" y="10">Direction of travel</text>
        <line x1="0" y1="40" x2="26" y2="40" markerEnd="url(#ss-arrow)" />
        <text x="32" y="44">Starboard</text>
      </g>
    </g>
  );
}

function ColumbusView() {
  const racks = [0, 1, 2, 3];
  return (
    <g>
      <rect className="ss-module" x="72" y="170" width="70" height="120" rx="12" />
      <text className="ss-label ss-label--muted" x="107" y="312" textAnchor="middle">Harmony</text>
      <path className="ss-hull" d="M150 150 H560 Q620 150 640 230 Q620 310 560 310 H150 Z" />
      {racks.map((i) => (
        <g key={i}>
          <rect className={i === 1 ? 'ss-rack ss-rack--active' : 'ss-rack'} x={186 + i * 92} y="164" width="80" height="54" rx="4" />
          <rect className="ss-rack" x={186 + i * 92} y="242" width="80" height="54" rx="4" />
        </g>
      ))}
      <line className="ss-leader" x1="318" y1="164" x2="360" y2="110" />
      <text className="ss-label ss-label--strong" x="364" y="104">ICE Cubes Facility</text>
      <text className="ss-label ss-label--muted" x="364" y="120">Mounted in an equipment rack · position illustrative</text>
      <text className="ss-label ss-label--muted" x="186" y="336">Equipment racks</text>
    </g>
  );
}

function IceCubesView() {
  const cols = 4;
  const rows = 3;
  const s = 58;
  const ox = 244;
  const oy = 116;
  const cells = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const inPayload = r >= 1 && c >= 1 && c <= 2;
      if (inPayload) continue;
      cells.push(<rect key={`${r}-${c}`} className="ss-slot" x={ox + c * s + 3} y={oy + r * s + 3} width={s - 6} height={s - 6} rx="4" />);
    }
  return (
    <g>
      <rect className="ss-hull" x={ox - 18} y={oy - 18} width={cols * s + 36} height={rows * s + 36} rx="10" />
      {cells}
      <rect className="ss-highlight" x={ox + s + 3} y={oy + s + 3} width={2 * s - 6} height={2 * s - 6} rx="6" />
      <text className="ss-label ss-label--inverse" x={ox + 2 * s} y={oy + 2 * s + 4} textAnchor="middle">TIGERS-X</text>
      <text className="ss-label ss-label--muted" x={ox - 18} y={oy + rows * s + 46}>Plug-in experiment cubes · slot layout simplified</text>
      <line className="ss-leader" x1={ox + cols * s + 18} y1={oy + 40} x2={ox + cols * s + 50} y2={oy + 20} />
      <text className="ss-label ss-label--muted" x={ox + cols * s + 54} y={oy + 16}>Power and data</text>
      <text className="ss-label ss-label--muted" x={ox + cols * s + 54} y={oy + 32}>at every slot</text>
    </g>
  );
}

function PayloadView() {
  return (
    <g transform="translate(360 250)">
      <path className="ss-box-top" d="M-150 -20 L0 -95 L150 -20 L0 55 Z" />
      <path className="ss-box-side" d="M-150 -20 L-150 30 L0 105 L0 55 Z" />
      <path className="ss-box-side ss-box-side--dark" d="M150 -20 L150 30 L0 105 L0 55 Z" />
      <g className="ss-dim">
        <line x1="-160" y1="44" x2="-10" y2="119" />
        <line x1="10" y1="119" x2="160" y2="44" />
        <line x1="170" y1="-20" x2="170" y2="30" />
      </g>
      <text className="ss-label" x="-118" y="104">20 cm</text>
      <text className="ss-label" x="86" y="104">20 cm</text>
      <text className="ss-label" x="178" y="10">10 cm</text>
      <text className="ss-label ss-label--strong" x="0" y="-118" textAnchor="middle">TIGERS-X</text>
    </g>
  );
}

const views: Record<StationViewId, () => React.JSX.Element> = {
  station: StationPlan,
  columbus: ColumbusView,
  icecubes: IceCubesView,
  payload: PayloadView,
};

export function StationSchematic({ active }: { active: number }) {
  const current = stationViews[active];
  return (
    <figure className="station-figure">
      <nav className="breadcrumb" aria-label="Scale">
        <ol>
          {stationViews.map((v, i) => (
            <li key={v.id} aria-current={i === active ? 'step' : undefined} className={i <= active ? 'is-reached' : ''}>
              {v.crumb}
            </li>
          ))}
        </ol>
      </nav>
      <div className="station-canvas">
        <svg viewBox="0 0 720 440" role="img" aria-label={descriptions[current.id]}>
          <defs>
            <marker id="ss-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M1 1 L8 5 L1 9" fill="none" stroke="var(--ink-secondary)" strokeWidth="1.5" />
            </marker>
          </defs>
          {stationViews.map((v, i) => {
            const View = views[v.id];
            const state = i === active ? 'current' : i < active ? 'past' : 'future';
            return (
              <g key={v.id} className="ss-view" data-state={state} aria-hidden={i !== active}>
                <View />
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption>
        <span className="scale-tag">{current.scale}</span>
        <span className="figure-note">Schematic. Each view is drawn at its own scale.</span>
      </figcaption>
    </figure>
  );
}
