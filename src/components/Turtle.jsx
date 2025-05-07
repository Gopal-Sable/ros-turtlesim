import { useSelector } from "react-redux";

export default function Turtle() {
    const turtlePos = useSelector((store) => store.appConfig.turtlePos);
    const fixedRotation = [0, 0, -turtlePos.theta - Math.PI / 2];
    const position = [turtlePos.x, turtlePos.y, turtlePos.z];
    return (
        <group position={position} rotation={fixedRotation}>
            <mesh>
                <coneGeometry args={[0.4, 1, 4]} />
                <meshStandardMaterial color="orange" />
            </mesh>
        </group>
    );
}
