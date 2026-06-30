/**
 * Ambient "dark gallery" lighting: a warm hemisphere + warm low ambient wash for mood,
 * a softened warm key "sun" (gentler shadows), a soft cool fill from the open front, a
 * cool RIM light from behind so the room separates from the dark, and a warm glow pool
 * over the desk (lamp-like) that gives a cozy, atmospheric feel and plays warm-against-cool
 * with the laptop screen. No external HDRI — pairs with the Lightformer <Environment>.
 */
export default function Lighting() {
  return (
    <>
      <hemisphereLight args={['#f7efe0', '#bcb4a6', 0.5]} />
      {/* warm low ambient wash */}
      <ambientLight intensity={0.26} color="#ece1cf" />
      {/* warm key sun — softened so shadows are gentler */}
      <directionalLight
        position={[6, 9, 4]}
        intensity={1.9}
        color="#ffeccf"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0004}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />
      {/* soft cool fill from the open front */}
      <directionalLight position={[-4, 5, 8]} intensity={0.5} color="#e3edf6" />
      {/* cool rim from behind-left — edge separation against the dark backdrop */}
      <directionalLight position={[-7, 8, -7]} intensity={0.6} color="#aebfd6" />
      {/* warm ambient glow pool over the desk (cozy, lamp-like) */}
      <pointLight position={[-1.0, 2.0, -1.9]} intensity={6} distance={5} decay={2} color="#ffb777" />
    </>
  )
}
