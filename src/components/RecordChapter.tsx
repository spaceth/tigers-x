import { campaign, fmt, operation } from '../config/facts';
import { Reveal } from './Reveal';

export function RecordChapter() {
  const d = operation.duration;
  const share = operation.downlinkedGB / operation.recordedGB;
  return (
    <section id="record" className="chapter chapter--record" aria-labelledby="record-title">
      <div className="container">
        <Reveal className="chapter-intro">
          <p className="eyebrow">Mission record</p>
          <h2 id="record-title" className="chapter-title">
            Operational record.
          </h2>
          <p className="lead">
            The mixing results above come from the imagery. The figures here are the operational account: how long
            the cube ran, and how much it recorded, commanded, and returned.
          </p>
        </Reveal>

        <Reveal className="record-duration">
          <p className="record-kicker">Payload operation</p>
          <p className="record-hero">
            <span className="num">{d.days}</span>
            <span className="unit"> days </span>
            <span className="num">{d.hours}</span>
            <span className="unit"> hours </span>
            <span className="num">{d.minutes}</span>
            <span className="unit"> minutes </span>
            <span className="num">{d.seconds}</span>
            <span className="unit"> seconds</span>
          </p>
          <p className="record-note">
            Science operations ran from {campaign.operationsStart} to {campaign.operationsEnd}, within the available
            acquisition-of-signal windows. A power interruption of about {campaign.powerInterruptionHours} hours did
            not compromise the campaign.
          </p>
        </Reveal>

        <div className="record-groups">
          <Reveal as="section" className="record-group" aria-labelledby="record-imaging" delay={1}>
            <h3 id="record-imaging" className="record-group-title">
              Imaging and data
            </h3>
            <dl className="record-figures">
              <div>
                <dt>Experiment video files recorded</dt>
                <dd>{fmt(operation.videoFiles)}</dd>
              </div>
              <div>
                <dt>Data recorded</dt>
                <dd>≈ {operation.recordedGB} GB</dd>
              </div>
              <div>
                <dt>Downlinked before physical retrieval</dt>
                <dd>{operation.downlinkedGB} GB</dd>
              </div>
            </dl>
            <figure className="data-bar">
              <div
                className="data-bar-track"
                role="img"
                aria-label={`${operation.downlinkedGB} GB of approximately ${operation.recordedGB} GB recorded was downlinked before physical retrieval, about ${Math.round(share * 100)} percent.`}
              >
                <span className="data-bar-fill" style={{ width: `${share * 100}%` }} />
              </div>
              <figcaption>
                <span>
                  <span className="legend-swatch legend-swatch--fill" aria-hidden="true" /> Downlinked: {operation.downlinkedGB} GB
                </span>
                <span>
                  <span className="legend-swatch legend-swatch--track" aria-hidden="true" /> Recorded in total: ≈ {operation.recordedGB} GB
                </span>
              </figcaption>
            </figure>
          </Reveal>

          <Reveal as="section" className="record-group" aria-labelledby="record-commanding" delay={2}>
            <h3 id="record-commanding" className="record-group-title">
              Commanding and fluid actuation
            </h3>
            <dl className="record-figures">
              <div>
                <dt>Ground commands executed</dt>
                <dd>{fmt(operation.groundCommands)}</dd>
              </div>
              <div>
                <dt>Pump operations, across all {operation.pumps} pumps</dt>
                <dd>{fmt(operation.pumpOperations)}</dd>
              </div>
              <div>
                <dt>Combined pump runtime</dt>
                <dd>
                  {operation.pumpRuntime.minutes} min {operation.pumpRuntime.seconds} s
                </dd>
              </div>
            </dl>
            <p className="record-note">
              The pumps did not run continuously. Across {operation.pumpOperations} operations their combined runtime
              was 15 min 22 s.
            </p>
          </Reveal>
        </div>

        <Reveal as="p" className="record-caveat">
          These figures are from the team’s mission report, not from the mixing analysis. They record that the
          payload accepted commands, moved fluid, stored imagery, and returned data, with no crew involvement
          beyond installation and removal.
        </Reveal>
      </div>
    </section>
  );
}
