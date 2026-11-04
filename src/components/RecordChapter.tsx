import { campaign, fmt, operation } from '../config/facts';
import { copy, fill } from '../content';
import { Reveal } from './Reveal';

export function RecordChapter() {
  const d = operation.duration;
  const share = operation.downlinkedGB / operation.recordedGB;
  const percent = Math.round(share * 100);
  const vars = {
    operationsStart: campaign.operationsStart,
    operationsEnd: campaign.operationsEnd,
    powerInterruptionHours: campaign.powerInterruptionHours,
    recordedGB: operation.recordedGB,
    downlinkedGB: operation.downlinkedGB,
    pumps: operation.pumps,
    pumpOperations: fmt(operation.pumpOperations),
    minutes: operation.pumpRuntime.minutes,
    seconds: operation.pumpRuntime.seconds,
    percent,
  };
  return (
    <section id="record" className="chapter chapter--record" aria-labelledby="record-title">
      <div className="container">
        <Reveal className="chapter-intro">
          <p className="eyebrow">{copy.record.eyebrow}</p>
          <h2 id="record-title" className="chapter-title">
            {copy.record.title}
          </h2>
          <p className="lead">{copy.record.lead}</p>
        </Reveal>

        <Reveal className="record-duration">
          <p className="record-kicker">{copy.record.kicker}</p>
          <p className="record-hero">
            <span className="num">{d.days}</span>
            <span className="unit"> {copy.record.days} </span>
            <span className="num">{d.hours}</span>
            <span className="unit"> {copy.record.hours} </span>
            <span className="num">{d.minutes}</span>
            <span className="unit"> {copy.record.minutes} </span>
            <span className="num">{d.seconds}</span>
            <span className="unit"> {copy.record.seconds}</span>
          </p>
          <p className="record-note">{fill(copy.record.note, vars)}</p>
        </Reveal>

        <div className="record-groups">
          <Reveal as="section" className="record-group" aria-labelledby="record-imaging" delay={1}>
            <h3 id="record-imaging" className="record-group-title">
              {copy.record.imagingTitle}
            </h3>
            <dl className="record-figures">
              <div>
                <dt>{copy.record.videoFiles}</dt>
                <dd>{fmt(operation.videoFiles)}</dd>
              </div>
              <div>
                <dt>{copy.record.dataRecorded}</dt>
                <dd>{fill(copy.record.recordedValue, vars)}</dd>
              </div>
              <div>
                <dt>{copy.record.downlinked}</dt>
                <dd>{fill(copy.record.downlinkedValue, vars)}</dd>
              </div>
            </dl>
            <figure className="data-bar">
              <div
                className="data-bar-track"
                role="img"
                aria-label={fill(copy.record.barAria, vars)}
              >
                <span className="data-bar-fill" style={{ width: `${share * 100}%` }} />
              </div>
              <figcaption>
                <span>
                  <span className="legend-swatch legend-swatch--fill" aria-hidden="true" />{' '}
                  {fill(copy.record.legendDownlinked, vars)}
                </span>
                <span>
                  <span className="legend-swatch legend-swatch--track" aria-hidden="true" />{' '}
                  {fill(copy.record.legendRecorded, vars)}
                </span>
              </figcaption>
            </figure>
          </Reveal>

          <Reveal as="section" className="record-group" aria-labelledby="record-commanding" delay={2}>
            <h3 id="record-commanding" className="record-group-title">
              {copy.record.commandTitle}
            </h3>
            <dl className="record-figures">
              <div>
                <dt>{copy.record.groundCommands}</dt>
                <dd>{fmt(operation.groundCommands)}</dd>
              </div>
              <div>
                <dt>{fill(copy.record.pumpOperations, vars)}</dt>
                <dd>{fmt(operation.pumpOperations)}</dd>
              </div>
              <div>
                <dt>{copy.record.pumpRuntime}</dt>
                <dd>{fill(copy.record.pumpRuntimeValue, vars)}</dd>
              </div>
            </dl>
            <p className="record-note">{fill(copy.record.pumpNote, vars)}</p>
          </Reveal>
        </div>

        <Reveal as="p" className="record-caveat">
          {copy.record.caveat}
        </Reveal>
      </div>
    </section>
  );
}
