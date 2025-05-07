import { useState } from "react";
import ROSConnection from "./components/ROSConnection";
import TurtleSimScene from "./components/TurtleSimScene";
import ControlPanel from "./components/ControlPanel";

export default function App() {
    const [ros, setRos] = useState(null);
    const [turtlePos, setTurtlePos] = useState({ x: 0, y: 0, z: 0, theta: 0 });
    const [pathPoints, setPathPoints] = useState([]);
    const [recordingStartIndex, setRecordingStartIndex] = useState(null);
    const [recordingEndIndex, setRecordingEndIndex] = useState(null);
    const [playbackDirection, setPlaybackDirection] = useState("forward");
    const [selectedNodes, setSelectedNodes] = useState({
        start: null,
        end: null,
    });

    return (
        <div className="app">
            <ROSConnection setRos={setRos} />
            <div style={{ width: "100vw", height: "80vh" }}>
                <TurtleSimScene
                    ros={ros}
                    turtlePos={turtlePos}
                    setTurtlePos={setTurtlePos}
                    pathPoints={pathPoints}
                    setPathPoints={setPathPoints}
                    recordingStartIndex={recordingStartIndex}
                    recordingEndIndex={recordingEndIndex}
                    selectedNodes={selectedNodes}
                    setSelectedNodes={setSelectedNodes}
                    setPlaybackDirection={setPlaybackDirection}
                    playbackDirection={playbackDirection}
                />
            </div>
            <ControlPanel
                ros={ros}
                recordingStartIndex={recordingStartIndex}
                setRecordingStartIndex={setRecordingStartIndex}
                recordingEndIndex={recordingEndIndex}
                setRecordingEndIndex={setRecordingEndIndex}
                pathPoints={pathPoints}
                setPathPoints={setPathPoints}
                selectedNodes={selectedNodes}
                setTurtlePos={setTurtlePos}
                setSelectedNodes={setSelectedNodes}
                playbackDirection={playbackDirection}
            />
        </div>
    );
}
