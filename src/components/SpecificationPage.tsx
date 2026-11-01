import { lazy, Suspense, useEffect, useState, type MouseEvent } from 'react';
import { assets } from '../config/site';
import '../styles/specification.css';

const SpecModel = lazy(() => import('./SpecModel'));

const toc = [
  { id: 'overview', label: 'Overview' },
  { id: 'mechanical', label: 'Mechanical' },
  { id: 'electrical', label: 'Electrical' },
  { id: 'imaging', label: 'Imaging' },
  { id: 'data', label: 'Data and command' },
  { id: 'fluidics', label: 'Fluidic system' },
  { id: 'safety', label: 'Qualification and safety' },
  { id: 'contact', label: 'Contact' },
] as const;

type SectionId = (typeof toc)[number]['id'];

function SpecFigure({ src, alt }: { src: string; alt: string }) {
  return (
    <figure className="spec-figure">
      <img src={src} width={1123} height={794} alt={alt} />
    </figure>
  );
}

function showSection(id: string, behavior: ScrollBehavior = 'smooth') {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : behavior, block: 'start' });
}

export function SpecificationPage() {
  const [active, setActive] = useState<SectionId>('overview');

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'TIGERS-X — Payload specification';
    const meta = document.querySelector('meta[name="description"]');
    const previousDesc = meta?.getAttribute('content') ?? null;
    meta?.setAttribute(
      'content',
      'Mechanical, electrical, imaging, data, fluidic, and safety limits for the TIGERS-X experiment cube.',
    );
    return () => {
      document.title = previousTitle;
      if (previousDesc !== null) meta?.setAttribute('content', previousDesc);
    };
  }, []);

  useEffect(() => {
    const els = toc.map((item) => document.getElementById(item.id)).filter((el): el is HTMLElement => el !== null);
    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const current = toc.find((item) => visible.has(item.id));
        if (current) setActive(current.id);
      },
      { rootMargin: '-15% 0px -75% 0px', threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const id = window.location.hash.slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    if (Math.abs(el.getBoundingClientRect().top) > 80) showSection(id, 'auto');
  }, []);

  function selectSection(event: MouseEvent<HTMLAnchorElement>, id: SectionId) {
    event.preventDefault();
    showSection(id);
    history.pushState(null, '', `#${id}`);
    setActive(id);
  }

  return (
    <div className="spec-page">
      <a className="skip-link" href="#overview">
        Skip to content
      </a>
      <div className="spec-wrap">
        <header className="spec-header">
          <a className="spec-home" href="/">
            <img src={assets.patch} alt="" width={28} height={28} />
            <span>TIGERS-X</span>
          </a>
          <a className="spec-back" href="/">
            Mission site
          </a>
        </header>
        <div className="spec-layout">
          <nav className="spec-toc" aria-label="On this page">
            <p className="spec-toc-label">On this page</p>
            <ol>
              {toc.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    aria-current={active === item.id ? 'location' : undefined}
                    onClick={(event) => selectSection(event, item.id)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <article className="spec-main">
            <p className="spec-kicker">Payload specification</p>
            <h1 className="spec-title">TIGERS-X experiment cube</h1>
            <p className="spec-lead">
              Technical limits, interfaces, and safety results for integrating an experiment with the TIGERS-X
              platform. The page brings together the product specification and the Payload User&apos;s Guide, version
              1.1 (April 2026), prepared by the ISHA and ARSL research teams.
            </p>
            <ul className="spec-sources">
              <li>Product specification, including the CRS-34 flight record.</li>
              <li>Payload User&apos;s Guide 1.1, April 2026.</li>
            </ul>

            <section className="spec-section" id="overview" aria-labelledby="overview-title">
              <h2 id="overview-title">Overview</h2>
              <p>
                The user&apos;s guide is the reference for researchers and experiment developers. It states the
                technical specifications, interface boundaries, and operational constraints for flying an experiment
                inside TIGERS-X.
              </p>
              <p>
                TIGERS-X is a 2U × 2U experiment cube for the ICE Cubes Facility on the International Space Station. It
                runs autonomous microfluidic mixing experiments, films them with four cameras, and downlinks data in
                near real time.
              </p>
              <div className="spec-scroll">
                <table className="spec-table">
                  <caption>Identity and flight record, from the product specification.</caption>
                  <tbody>
                    <tr>
                      <th scope="row">Full name</th>
                      <td>Thailand Innovative G-force Varied Emulsification Research for Space Exploration</td>
                    </tr>
                    <tr>
                      <th scope="row">Product type</th>
                      <td>Autonomous lab-on-a-chip experiment payload (Experiment Cube)</td>
                    </tr>
                    <tr>
                      <th scope="row">Host platform</th>
                      <td>ICE Cubes Facility, Columbus module, ISS</td>
                    </tr>
                    <tr>
                      <th scope="row">Primary application</th>
                      <td>Passive mixing and emulsion stability of medical fluids</td>
                    </tr>
                    <tr>
                      <th scope="row">Flight</th>
                      <td>
                        Launched on SpaceX CRS-34, 15 May 2026 (US time). Returned on CRS-34 Dragon, splashdown 17 June
                        2026.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <h3>Key features</h3>
              <ul>
                <li>2U × 2U cube, 200 × 200 × 100 mm, with a 2.5 kg experiment mass budget.</li>
                <li>
                  Sequences run on board. Ground commanding is through the ICE Cubes Mission Control Centre.
                </li>
                <li>
                  Two-tier computing: an Orange Pi 5 Ultra for processing and data handling, and an STM32F7
                  microcontroller for low-level hardware control.
                </li>
                <li>
                  Four global-shutter RGB and IR cameras in a 2 × 2 array, with overlapping fields of view and hardware
                  H.264 recording.
                </li>
                <li>
                  Optional microfluidic module: eight peristaltic pumps, sealed fluid bags, and 4-channel static-mixer
                  chips.
                </li>
                <li>One DB13W3P connector carries +12 V power and the LAN data link. The shell is bonded to the frame.</li>
                <li>IPv4 over TCP/HTTPS through a VPN, YAMCS telemetry, and SFTP file downlink.</li>
                <li>Designed to MIL-STD-461G EMC tests and ISS crew-safety standards (SSP and JSC).</li>
              </ul>
            </section>

            <section className="spec-section" id="mechanical" aria-labelledby="mechanical-title">
              <h2 id="mechanical-title">Mechanical</h2>
              <Suspense
                fallback={
                  <p className="spec-model-status" role="status">
                    Loading the payload model…
                  </p>
                }
              >
                <SpecModel />
              </Suspense>
              <p>The cube integrates with the host facility in a 2 × 2U form factor. Dimensions are in millimetres.</p>
              <div className="spec-scroll">
                <table className="spec-table">
                  <caption>Envelope and mass. Both documents are cited where the limits differ.</caption>
                  <thead>
                    <tr>
                      <th scope="col">Parameter</th>
                      <th scope="col">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">Form factor</th>
                      <td>2U × 2U cube</td>
                    </tr>
                    <tr>
                      <th scope="row">Envelope</th>
                      <td>200 × 200 × 100 mm</td>
                    </tr>
                    <tr>
                      <th scope="row">Maximum experiment mass</th>
                      <td>2.5 kg in the user&apos;s guide. The product specification allows up to 3 kg.</td>
                    </tr>
                    <tr>
                      <th scope="row">Maximum equivalent vent radius</th>
                      <td>
                        About 300 cm. The product specification cites an ISS limit of 5080 cm. The user&apos;s guide
                        describes the value as well within an ISS maximum of ≪ 5080 cm.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="spec-scroll">
                <table className="spec-table">
                  <caption>Parts list from the mechanical drawing.</caption>
                  <thead>
                    <tr>
                      <th scope="col">Item</th>
                      <th scope="col">Part</th>
                      <th scope="col">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['1', 'Base plate', '1'],
                      ['2', 'DB13', '1'],
                      ['3', 'Corner', '4'],
                      ['4', 'Edge', '2'],
                      ['5', 'Top plate', '1'],
                      ['6', 'Frame bracket 1', '2'],
                      ['7', 'Frame bracket 2', '2'],
                      ['8', 'Front plate', '2'],
                      ['9', 'Side plate', '2'],
                      ['10', 'Panel plate', '1'],
                      ['11', 'Panel bracket', '6'],
                      ['12', 'FOOT6.2xD15', '4'],
                    ].map(([item, part, qty]) => (
                      <tr key={item}>
                        <th scope="row">{item}</th>
                        <td>{part}</td>
                        <td>{qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="spec-section" id="electrical" aria-labelledby="electrical-title">
              <h2 id="electrical-title">Electrical</h2>
              <figure className="spec-figure spec-figure--connector">
                <img
                  src="/media/spec/DB13W3.svg"
                  width={300}
                  height={81}
                  alt="DB13W3 connector face. Large contacts are labeled A3, A2, and A1. The upper signal pins are labeled 5, 4, 3, 2, 1 and the lower pins 10, 9, 8, 7, 6."
                />
              </figure>
              <p>
                The power system supplies regulated power to the experimental subsystems. The primary input is +12 V
                DC through a DB13W3P mixed-layout connector. The connector shell is bonded to the structural frame for
                grounding. Regulated 5 V and 3.3 V rails are available for the payload.
              </p>
              <div className="spec-scroll">
                <table className="spec-table">
                  <caption>Connector contacts.</caption>
                  <thead>
                    <tr>
                      <th scope="col">Contact</th>
                      <th scope="col">Function</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">A1</th>
                      <td>+12 V</td>
                    </tr>
                    <tr>
                      <th scope="row">A2</th>
                      <td>Ground</td>
                    </tr>
                    <tr>
                      <th scope="row">A3</th>
                      <td>+5 V</td>
                    </tr>
                    <tr>
                      <th scope="row">1</th>
                      <td>B+ / R+</td>
                    </tr>
                    <tr>
                      <th scope="row">2</th>
                      <td>B− / R−</td>
                    </tr>
                    <tr>
                      <th scope="row">3</th>
                      <td>C+</td>
                    </tr>
                    <tr>
                      <th scope="row">4</th>
                      <td>C−</td>
                    </tr>
                    <tr>
                      <th scope="row">5</th>
                      <td>CD, cube detection</td>
                    </tr>
                    <tr>
                      <th scope="row">6</th>
                      <td>A+ / T+</td>
                    </tr>
                    <tr>
                      <th scope="row">7</th>
                      <td>A− / T−</td>
                    </tr>
                    <tr>
                      <th scope="row">8</th>
                      <td>D+</td>
                    </tr>
                    <tr>
                      <th scope="row">9</th>
                      <td>D−</td>
                    </tr>
                    <tr>
                      <th scope="row">10</th>
                      <td>SHLD, Ethernet cable shield</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <h3>Power phases</h3>
              <p>The user&apos;s guide requires the payload to stay inside these phases.</p>
              <div className="spec-scroll">
                <table className="spec-table">
                  <caption>Power phases from the user&apos;s guide.</caption>
                  <thead>
                    <tr>
                      <th scope="col">Mode</th>
                      <th scope="col">Duration</th>
                      <th scope="col">Consumption</th>
                      <th scope="col">Peak</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">Standby</th>
                      <td>—</td>
                      <td>9 W</td>
                      <td>12 W</td>
                    </tr>
                    <tr>
                      <th scope="row">Observation</th>
                      <td>40 minutes</td>
                      <td>12 W</td>
                      <td>15 W</td>
                    </tr>
                    <tr>
                      <th scope="row">Experiment run</th>
                      <td>20 minutes</td>
                      <td>15 W</td>
                      <td>18 W</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <h3>Operating limits</h3>
              <div className="spec-scroll">
                <table className="spec-table">
                  <caption>
                    Shared limits from both documents. Current and temperature maxima are given from each source.
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Parameter</th>
                      <th scope="col">Minimum</th>
                      <th scope="col">Nominal</th>
                      <th scope="col">Maximum</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">Input voltage</th>
                      <td>11.5 V</td>
                      <td>12.0 V</td>
                      <td>12.6 V</td>
                    </tr>
                    <tr>
                      <th scope="row">Input current</th>
                      <td>—</td>
                      <td>1.0 A</td>
                      <td>1.8 A in the user&apos;s guide. 3.1 A in the product specification.</td>
                    </tr>
                    <tr>
                      <th scope="row">Power consumption</th>
                      <td>—</td>
                      <td>12 W</td>
                      <td>18 W</td>
                    </tr>
                    <tr>
                      <th scope="row">Internal temperature</th>
                      <td>5 °C</td>
                      <td>25 °C</td>
                      <td>45 °C in the user&apos;s guide. Up to 40 °C in the product specification.</td>
                    </tr>
                    <tr>
                      <th scope="row">Boot time</th>
                      <td>—</td>
                      <td>60 s</td>
                      <td>90 s</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="spec-section" id="imaging" aria-labelledby="imaging-title">
              <h2 id="imaging-title">Imaging</h2>
              <SpecFigure
                src="/media/spec/Cam_View1.svg"
                alt="View of the imaging assembly: the camera hardware that records the experiment."
              />
              <p>Onboard diagnostics record the experiment. Processing and camera control are split across two computers.</p>
              <div className="spec-scroll">
                <table className="spec-table">
                  <caption>Processing hardware.</caption>
                  <tbody>
                    <tr>
                      <th scope="row">Main computer</th>
                      <td>Orange Pi 5 Ultra, 16 GB RAM, 64 GB eMMC, 1 TB NVMe SSD</td>
                    </tr>
                    <tr>
                      <th scope="row">Microcontroller</th>
                      <td>STM32F746VIT6, 1 MB flash, 320 KB SRAM, for low-level hardware control</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="spec-scroll">
                <table className="spec-table">
                  <caption>Camera and recording.</caption>
                  <tbody>
                    <tr>
                      <th scope="row">Array</th>
                      <td>4 cameras in a 2 × 2 matrix, with overlapping fields of view</td>
                    </tr>
                    <tr>
                      <th scope="row">Sensor</th>
                      <td>See3CAM_27CUG, 2 megapixel global shutter, 1600 × 1300, RGB and IR</td>
                    </tr>
                    <tr>
                      <th scope="row">Frame rate</th>
                      <td>15 fps</td>
                    </tr>
                    <tr>
                      <th scope="row">Stream</th>
                      <td>UYVY at 1280 × 720</td>
                    </tr>
                    <tr>
                      <th scope="row">Recording</th>
                      <td>Hardware H.264 in an MP4 container, 4000 kbit/s</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="spec-section" id="data" aria-labelledby="data-title">
              <h2 id="data-title">Data and command</h2>
              <SpecFigure
                src="/media/spec/EE_View1.svg"
                alt="View of the electronics that handle data and commanding."
              />
              <p>
                Power and data share the DB13W3P connector. An internal LAN port carries IPv4 over TCP/HTTPS through a
                secure VPN. Files are downlinked by SFTP. The Orange Pi 5 Ultra manages telemetry and the bulk transfer.
              </p>
              <div className="spec-scroll">
                <table className="spec-table">
                  <caption>Link budget.</caption>
                  <thead>
                    <tr>
                      <th scope="col">Parameter</th>
                      <th scope="col">Downlink</th>
                      <th scope="col">Uplink</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">Nominal allocation</th>
                      <td>1 Mbit/s</td>
                      <td>&lt; 0.1 Mbit/s</td>
                    </tr>
                    <tr>
                      <th scope="row">Burst limit</th>
                      <td>4 Mbit/s</td>
                      <td>&lt; 0.5 Mbit/s</td>
                    </tr>
                    <tr>
                      <th scope="row">Telecommand rate</th>
                      <td>—</td>
                      <td>0.5 Hz nominal, 1.0 Hz maximum</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <h3>Telemetry path</h3>
              <p>
                YAMCS server in the experiment cube, then the ICE Cubes Facility, the ISS Control Centre, the ICE Cubes
                Mission Control Centre (ICMCC), and finally the archive and Open MCT display.
              </p>
              <h3>Bulk downlink</h3>
              <p>About 1.8 GB takes about 240 minutes at 1 Mbit/s, and about 480 minutes at a degraded 0.5 Mbit/s.</p>
            </section>

            <section className="spec-section" id="fluidics" aria-labelledby="fluidics-title">
              <h2 id="fluidics-title">Fluidic system</h2>
              <p>
                An optional microfluidic module is available for biological or chemical experiments. The product
                specification notes that the mixer can be modified.
              </p>
              <h3>Pumps</h3>
              <SpecFigure src="/media/spec/Pump_View1.svg" alt="View of the peristaltic pumps." />
              <p>Eight peristaltic pumps. The user&apos;s guide names them Tagasako RP-QIII.</p>
              <h3>Fluid storage</h3>
              <SpecFigure src="/media/spec/Res_View1.svg" alt="View of the fluid storage bags." />
              <p>
                10 ml sealed storage bags. The product specification allows bags up to 20 ml. The user&apos;s guide
                states 10 ml secure storage bags.
              </p>
              <h3>Mixer</h3>
              <SpecFigure
                src="/media/spec/Fluidic_View1.svg"
                alt="View of the microfluidic static mixer, with four channels on the chip."
              />
              <p>Microfluidic static mixer, 4 channels per chip.</p>
            </section>

            <section className="spec-section" id="safety" aria-labelledby="safety-title">
              <h2 id="safety-title">Qualification and safety</h2>
              <p>
                TIGERS-X is qualified to the MIL-STD-461G EMC tests below and to the listed ISS crew-safety standards.
                The sealed container holds 64.59 J against a 19,307 J limit.
              </p>
              <div className="spec-scroll">
                <table className="spec-table">
                  <caption>MIL-STD-461G tests required for compliance.</caption>
                  <thead>
                    <tr>
                      <th scope="col">Test</th>
                      <th scope="col">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">CE101</th>
                      <td>Conducted emissions, audio-frequency currents, power leads</td>
                    </tr>
                    <tr>
                      <th scope="row">CE102</th>
                      <td>Conducted emissions, radio-frequency potential, power leads</td>
                    </tr>
                    <tr>
                      <th scope="row">CS101</th>
                      <td>Conducted susceptibility, power leads</td>
                    </tr>
                    <tr>
                      <th scope="row">CS114</th>
                      <td>Conducted susceptibility, bulk cable injection</td>
                    </tr>
                    <tr>
                      <th scope="row">RE101</th>
                      <td>Radiated emissions, magnetic field</td>
                    </tr>
                    <tr>
                      <th scope="row">RS101</th>
                      <td>Radiated susceptibility, magnetic field</td>
                    </tr>
                    <tr>
                      <th scope="row">RS103</th>
                      <td>Radiated susceptibility, electric field</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <h3>ISS crew safety</h3>
              <p>
                Results below are those recorded in the product specification, with the sharper wording from the
                user&apos;s guide kept where it adds a limit. A dash means the documents cite the standard and do not
                state a separate result.
              </p>
              <div className="spec-scroll">
                <table className="spec-table">
                  <caption>ISS safety hazards, standards, and payload results.</caption>
                  <thead>
                    <tr>
                      <th scope="col">Hazard</th>
                      <th scope="col">Standard</th>
                      <th scope="col">Payload result</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">Crew eye safety, UV and incoherent light above 10,000 nits</th>
                      <td>SSP 51721 §4.9.4; SSP 50005 §5.7.3.2.1.B, C 1) and 2)</td>
                      <td>Protection against excessive optical radiation</td>
                    </tr>
                    <tr>
                      <th scope="row">Battery leakage or rupture, low-BRC cells</th>
                      <td>JSC 20793; SSP 30599</td>
                      <td>—</td>
                    </tr>
                    <tr>
                      <th scope="row">Fire propagation</th>
                      <td>JSC 29353</td>
                      <td>—</td>
                    </tr>
                    <tr>
                      <th scope="row">Material offgassing in the habitable volume</th>
                      <td>—</td>
                      <td>Polymeric mass below 20 lb (9.072 kg)</td>
                    </tr>
                    <tr>
                      <th scope="row">Dust, toxic, or biological material</th>
                      <td>—</td>
                      <td>Toxicity Hazard Level 0 or N/A. Biological Safety Level ≤ 1</td>
                    </tr>
                    <tr>
                      <th scope="row">Sharp particles from glass or frangible parts</th>
                      <td>—</td>
                      <td>Parts enclosed, with positive protection against release of particles larger than 50 µm</td>
                    </tr>
                    <tr>
                      <th scope="row">Sharp edges, corners, and holes</th>
                      <td>SSP 57000 §3.1.4 and §3.12.8.2–3.12.8.6; COL-RIBRE-SPE-0164 §3.12.9.2–3.12.9.8</td>
                      <td>No safety violations identified, and no safety impact</td>
                    </tr>
                    <tr>
                      <th scope="row">Touch temperature</th>
                      <td>SSP 50005</td>
                      <td>—</td>
                    </tr>
                    <tr>
                      <th scope="row">Acoustic noise</th>
                      <td>SSP 57000; COL-RIBRE-SPE-0164</td>
                      <td>No safety impact</td>
                    </tr>
                    <tr>
                      <th scope="row">Power distribution and circuit protection</th>
                      <td>SSP 51700, Appendix E, letter TA-92-038</td>
                      <td>—</td>
                    </tr>
                    <tr>
                      <th scope="row">Non-ionizing electromagnetic radiation</th>
                      <td>SSP 30237 and SSP 30243, or COL-ESA-RQ-014 and/or OE-14-002</td>
                      <td>No safety impact</td>
                    </tr>
                    <tr>
                      <th scope="row">Rotating equipment</th>
                      <td>SSP 52005 or SSP 30558</td>
                      <td>Kinetic energy below 19,307 J (14,240 ft-lb). Not fracture critical</td>
                    </tr>
                    <tr>
                      <th scope="row">Sealed container</th>
                      <td>ISS limits: stored energy below 19,307 J, and ΔP ≤ 1.52 bar</td>
                      <td>64.59 J stored energy. Maximum ΔP 1.12 bar</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="spec-section" id="contact" aria-labelledby="contact-title">
              <h2 id="contact-title">Contact</h2>
              <address className="spec-contact">
                Potiwat Ngamkajornwiwat, Ph.D.
                <br />
                Co-project Leader
                <br />
                AstroRobotics &amp; Space Laboratory (ARSL)
                <br />
                Panyapiwat Institute of Management
                <br />
                <a href="tel:+66948296151">+66 94 829 6151</a>
                <br />
                <a href="mailto:potiwatnga@pim.ac.th">potiwatnga@pim.ac.th</a>
                <br />
                ISHA Lab: <a href="https://ishalab.space/">ishalab.space</a>
              </address>
              <p className="spec-footer">
                User&apos;s guide version 1.1, April 2026. Limits that differ between the guide and the product
                specification are written out in the tables.
              </p>
            </section>
          </article>
        </div>
      </div>
    </div>
  );
}
