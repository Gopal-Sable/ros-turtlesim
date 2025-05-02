export default function Turtle({ position }) {
    return (
      <mesh position={position}>
        <coneGeometry args={[0.5, 1, 3]} />
        <meshStandardMaterial color="green" />
      </mesh>
    )
  }