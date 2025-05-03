export default function Turtle({ position, rotation }) {
  const fixedRotation = [
    rotation[0],
    rotation[1],
    -rotation[2] - Math.PI / 2, 
  ];

  return (
    <group position={position} rotation={fixedRotation}>
      <mesh>
        <coneGeometry args={[0.4, 1, 4]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    </group>
  );
}
