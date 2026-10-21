# TIGERS-X — Technical Knowledge Summary

Updated: 21 October 2026

## 1. What I know, and how confidently

I can describe TIGERS-X at the system and subsystem level: its envelope, principal fluid-handling hardware, imaging system, computing architecture, station interface, and scientific purpose. I do not have an authoritative as-built CAD model, exploded assembly drawing, fluidic schematic, electrical schematic, or complete Bill of Materials. This document is therefore a technical knowledge inventory, not a manufacturing specification.

Evidence labels used below:

- **Documented:** explicitly stated in project material or an identified source.
- **Previously reported:** retained from earlier technical discussions, but not independently confirmed in the source material reviewed for this summary.
- **Interpretation:** an engineering explanation or functional grouping, not a quoted project specification.
- **Unknown:** insufficient evidence to provide a reliable value or physical arrangement.

## 2. Payload identity

**TIGERS-X** stands for **Thailand Innovative G-force Varied Emulsification Research for Space Exploration**. It is an active microfluidic experiment developed by Chulabhorn Royal Academy and ISHA Lab with engineering and institutional partners. Its core subject is the mixing and emulsification of medical fluids relevant to **Total Parenteral Nutrition (TPN)**. [S1, S3]

The experiment operates inside the **ICE Cubes Facility in the ISS Columbus module**. It is a hosted laboratory payload, rather than a free-flying satellite. Researchers send commands and receive data from the ground; crew involvement during nominal use is limited to installation and removal. [S3]

## 3. Dimensions, mass, materials, and power

| Parameter | Current understanding | Evidence / limitation |
|---|---|---|
| External envelope | **200 × 200 × 100 mm**, or **20 × 20 × 10 cm** | Documented in the project press-release draft and mission specification table. [S1, S2] |
| Form factor | **4U**, described as **2 × 2U** | Project terminology; this does not establish a CubeSat deployment interface. [S1] |
| Geometric envelope volume | **4 litres** | Calculated from the stated external dimensions; not usable fluid volume. |
| Mass | **2.5 kg** | Documented project value. [S1, S2] |
| Structural material | **Aluminum 7075** | Mission overview specification; temper, coating, and individual part materials are unknown. [S2] |
| Standby power | **9 W** | Project press-release draft. [S1] |
| Peak operating power | **18 W** | Project draft and mission overview. [S1, S2] |
| Installation | ICE Cubes Facility, Columbus | Documented. [S3] |

**Dimension discrepancy:** the mission overview also displays **100 × 100 × 200 mm** in its introductory section, conflicting with its own specification table. This is not merely a reordered set of dimensions: it implies half the volume. I use **200 × 200 × 100 mm**, supported by the project draft and the technical video transcript. A released mechanical drawing would settle the issue. [S1, S2, S4]

Earlier discussions mentioned 2.5–3.0 kg and 9–12 W. The more specific project figures above should take precedence for this summary, although I have not seen a signed final mass or power-budget report.

## 4. How many parts does it have?

The reliable answer is **one integrated payload with multiple subsystems**, not a verified total component count.

The available material explicitly identifies **eight peristaltic pumps** and **four cameras**. It also identifies a microfluidic static mixer, a dual emulsifier, sealed fluidics, an onboard computer, a microcontroller, and SSD storage. It does not establish the total number of boards, reservoirs, chips, fittings, valves, enclosure panels, or mechanical assemblies. [S1, S4, S5]

For explanation, I divide the system into **seven functional groups** below. This is my organizational scheme, not an official seven-module architecture.

| Functional group | Known components / quantity | Function | What remains unknown |
|---|---|---|---|
| 1. Structure and containment | Aluminum enclosure; double-containment fluidic strategy | Supports internal hardware and contains the experiment fluids | Panel count, wall thickness, internal mounting, sealing geometry, and containment boundaries |
| 2. Fluid storage and plumbing | Preloaded fluid samples and a sealed fluidic circuit | Holds and routes the aqueous and lipid phases | Reservoir count, capacities, tubing material, valves, and collection arrangement |
| 3. Fluid actuation | **8 precision peristaltic pumps** | Drives and regulates fluid delivery | Pump model, individual pump assignment, flow range, calibration, and pressure limits |
| 4. Microfluidic experiment | **Microfluidic static mixer and dual emulsifier** | Brings phases together and creates the mixing/emulsification conditions under study | Chip count, channel dimensions, exact geometry, material, and interpretation of “dual” |
| 5. Optical observation | **4 high-resolution cameras**, described as a **2 × 2 matrix** | Records the mixing process and interfacial behaviour | Sensor models, lenses, illumination, resolution, frame rate, and camera-to-channel mapping |
| 6. Computing and control | Orange Pi SBC, STM32 microcontroller, SSD | Runs higher-level operations, controls pumps, and records data | Exact flight configuration, electrical interfaces, software, and redundancy implementation |
| 7. Station services interface | ICE Cubes power and data connection | Supplies electrical power and routes commands and experiment data | Connector pinout, supply voltages, power conversion, and electrical protection |

Groups 1–5 draw primarily on the project draft; computing details are supported by the technical transcript. [S1, S4] The mission report independently confirms that all eight pumps were operated in orbit. [S5]

## 5. Fluidics: what actually does the experiment?

The project draft describes pumping **BFluid® glucose–electrolyte solution and lipid phases** into a microfluidic static mixer, with a dual emulsifier included in the experimental hardware. A sealed circuit and double containment are specified. [S1]

At a functional level, the experiment consists of **preloaded fluids, controlled pumping, a microfluidic interaction region, and optical recording**. This describes the process, not a verified plumbing diagram. In particular, I cannot yet map the eight pumps to individual inlets, outlets, flushing lines, or experimental channels.

A peristaltic pump moves fluid by progressively compressing flexible tubing. A static mixer instead uses a fixed flow-path geometry to promote interaction between streams. These are general operating principles; the exact pump mechanism and mixer geometry used in the flight assembly still require component documentation.

The phrase **“without mechanical intervention”** in the project draft needs qualification. TIGERS-X has mechanical pumps and consumes electrical power. My interpretation is that the experiment avoids manual handling and an actively moving mixing element in the static mixer; it should not be described as an entirely motionless or energy-free apparatus. [S1]

Likewise, **“dual emulsifier” does not establish that there are exactly two chips or two complete experiment modules**. Its physical implementation is not specified in the material available to me.

## 6. Computing, imaging, and data handling

The technical video transcript describes an **Orange Pi single-board computer commanding an STM32 microcontroller**, which controls the pumping system. **Four cameras** record the experiment, and an **SSD** stores imagery locally, including when connectivity is unavailable. [S4]

The project draft further describes the cameras as a synchronized **2 × 2 high-resolution matrix**. This confirms a stated four-camera arrangement, but does not provide an optical layout or demonstrate that the footage is stereoscopic or reconstructs three-dimensional flow. [S1]

Previously reported details, retained here as verification targets rather than confirmed flight specifications:

| Item | Previously reported configuration | Confidence limitation |
|---|---|---|
| SBC | Orange Pi 5 Ultra; 16 GB RAM; 64 GB storage | Orange Pi family confirmed; exact model and capacities not verified in reviewed primary material |
| Additional storage | 1 TB SSD | SSD presence supported by the transcript; capacity unverified |
| MCU | STM32; 320 KB memory; 1 MB storage | STM32 family supported by the transcript; exact part and memory terminology unverified |

The distinction between a high-level SBC and a low-level controller is consistent with separating networking/imaging from pump actuation. That division of responsibility is an engineering interpretation; I do not have the flight software architecture or timing specifications.

## 7. How it connects to the ground

Commands and telemetry pass through the **ICE Cubes / ISS network infrastructure**, with Space Applications Services in Belgium supporting the connection to mission control in Thailand. This is a hosted communications service, not evidence that TIGERS-X contains its own direct-to-Earth radio. [S2, S3]

The technical transcript names a **“DS Manager”** interface providing power and data. I retain that wording without treating it as a verified connector standard or pinout. [S4]

I do not have a validated throughput, guaranteed latency, command protocol, or complete list of telemetry fields. Near-real-time access also should not be interpreted as uninterrupted connectivity.

## 8. The scientific question

The central question is: **How do medical fluid phases mix, form emulsions, and evolve over time in microgravity, and can a compact static-mixing system produce a sufficiently stable dispersion under those conditions?** [S1, S3]

The project is motivated by TPN, which supplies nutrients intravenously when a patient cannot obtain adequate nutrition through the digestive tract. The flight experiment investigates formulation-related fluid behaviour; it is not evidence of clinical treatment aboard the ISS. [S1, S3]

The following are useful ways to express the experiment’s questions. They are a synthesis of the stated objectives, not a recovered formal test matrix:

1. **Emulsion formation:** Can the supplied aqueous and lipid phases form a repeatable dispersion using the microfluidic system?
2. **Interfacial dynamics:** How do the interfaces move and deform during pumping and mixing?
3. **Temporal stability:** Does the mixture remain dispersed, or develop visible separation or coalescence over time?
4. **Gravity dependence:** How does the observed behaviour compare with equivalent ground conditions and the earlier short-duration microgravity experiments?
5. **Engineering feasibility:** Can the experiment be operated remotely with controlled fluid handling and useful imaging inside a small power and volume budget?

Microgravity changes the relative importance of gravity-driven separation, surface forces, and transport processes. It does not eliminate viscosity or interfacial tension, and it does not automatically make immiscible fluids miscible. A visually dispersed mixture is also not, by itself, proof that a formulation satisfies clinical safety or stability requirements.

I do not have the final quantitative success criteria, droplet-size measurements, detailed formulation recipes, flow-rate test matrix, or statistically controlled science results. Those are needed to judge the scientific outcome beyond successful hardware operation.

## 9. What flight operations actually demonstrated

The team’s 5 June 2026 mission report records: [S5]

- **9 days, 14 hours, 57 minutes, 23 seconds** of payload operation.
- **4,342 experiment video files**, approximately **110 GB** recorded.
- **63 GB** downloaded before physical retrieval.
- **218 pump operations** across all eight pumps, with a combined pump runtime of **15 minutes, 22 seconds**.
- **1,407 ground commands** executed.

These figures demonstrate operation, commandability, fluid actuation, imaging, and data return. They should not be treated as quantitative proof that the intended medical emulsion achieved its required properties. The same report states that further scientific analysis would follow.

## 10. What I still cannot reconstruct reliably

- The exact internal layout or a defensible exploded view.
- The official number of mechanical modules and total parts.
- The fluidic schematic, including reservoir and outlet assignments.
- The relationship between the dual emulsifier, experiment channels, eight pumps, and four cameras.
- Chip geometry, channel dimensions, working fluid volumes, and wetted materials.
- Pump performance, optical specifications, and calibrated measurement capability.
- Final electrical architecture, component part numbers, thermal design, and fault responses.
- The approved test and safety documentation defining containment and qualification.
- The complete science protocol, controls, analysis methods, and final findings.

**Overall assessment:** I know enough to explain TIGERS-X’s system architecture and scientific intent, and to identify several concrete hardware specifications. I do not yet know enough to reproduce its physical construction or claim a complete part-by-part description.
