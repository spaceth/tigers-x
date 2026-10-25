import { Nav } from './components/Nav';
import { ScienceChapter } from './components/ScienceChapter';
import { PayloadStory } from './components/PayloadStory';
import { MissionJourney, PayloadOnStation, ReturnToEarth } from './components/MissionSections';
import { StationChapter } from './components/StationChapter';
import { RecordChapter } from './components/RecordChapter';
import { ResultsChapter } from './components/ResultsChapter';
import { Closing } from './components/Closing';

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <ScienceChapter />
        <div className="theme-night">
          <PayloadStory />
        </div>
        <MissionJourney />
        <StationChapter />
        <PayloadOnStation />
        <ReturnToEarth />
        <RecordChapter />
        <ResultsChapter />
        <Closing />
      </main>
    </>
  );
}
