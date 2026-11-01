import { Nav } from './components/Nav';
import { ScienceChapter } from './components/ScienceChapter';
import { PayloadStory } from './components/PayloadStory';
import { LaunchJourney, MissionJourney, PayloadOnStation, ReturnToEarth, ScienceOperations } from './components/MissionSections';
import { StationChapter } from './components/StationChapter';
import { RecordChapter } from './components/RecordChapter';
import { Closing } from './components/Closing';
import { SpecificationPage } from './components/SpecificationPage';

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/specification') return <SpecificationPage />;

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
