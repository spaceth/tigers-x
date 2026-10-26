import { Nav } from './components/Nav';
import { ScienceChapter } from './components/ScienceChapter';
import { PayloadStory } from './components/PayloadStory';
import { LaunchJourney, MissionJourney, PayloadOnStation, ReturnToEarth, ScienceOperations } from './components/MissionSections';
import { StationChapter } from './components/StationChapter';
import { RecordChapter } from './components/RecordChapter';
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
        <LaunchJourney />
        <StationChapter />
        <PayloadOnStation />
        <ScienceOperations />
        <ReturnToEarth />
        <RecordChapter />
        <Closing />
      </main>
    </>
  );
}
