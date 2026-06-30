import Experience from './scene/Experience'
import Overlay from './ui/Overlay'
import TopNav from './ui/TopNav'
import ViewToggle from './ui/ViewToggle'
import ZoomControls from './ui/ZoomControls'
import LoadingScreen from './ui/LoadingScreen'
import IntroOverlay from './ui/IntroOverlay'
import PlacementPanel from './ui/PlacementPanel'
import LobbyHint from './ui/LobbyHint'
import NavGuide from './ui/NavGuide'
import CursorTooltip from './ui/CursorTooltip'

export default function App() {
  return (
    <>
      <Experience />
      <Overlay />
      <TopNav />
      {import.meta.env.DEV && <ViewToggle />}
      <PlacementPanel />
      <ZoomControls />
      <LobbyHint />
      <NavGuide />
      <CursorTooltip />
      <IntroOverlay />
      <LoadingScreen />
    </>
  )
}
