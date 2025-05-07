import { useDispatch, useSelector } from "react-redux";
import { setPlaybackDirection } from "../store/appConfigSlice";

export default function PathMarker({ start }) {
    const pathPoints = useSelector((store) => store.appConfig.pathPoints);
    const dispatch = useDispatch();
    if (!pointPoints || pathPoints.length < 1) return null;
    let index = start ? 0 : pathPoints.length - 1;

    const playbackDirection = useSelector(
        (store) => store.appConfig.playbackDirection
    );
    const handleNodeClick = (direction) => {
        dispatch(setPlaybackDirection(direction));
    };
    return (
        <mesh
            position={pathPoints[index]}
            onClick={() => handleNodeClick(start)}
        >
            <sphereGeometry args={[0.3, 32, 32]} />
            <meshStandardMaterial
                color={playbackDirection === start ? "yellow" : "black"}
                emissive="black"
                emissiveIntensity={0.5}
            />
        </mesh>
    );
}
