import { Line } from "@react-three/drei";
// import * as THREE from "three";
import { useSelector } from "react-redux";

export default function Path() {
    const pathPoints = useSelector((store) => store.appConfig.pathPoints);
    const linePoints =
        pathPoints.length >= 2
            ? pathPoints.flatMap((p) => [p.x, p.y, p.z ?? 0])
            : null;

    return (
        <>
            {linePoints && linePoints.length % 3 === 0 && (
                <Line points={linePoints} color="hotpink" lineWidth={2} />
            )}
        </>
    );
}
