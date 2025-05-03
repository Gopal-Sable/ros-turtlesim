import { useState, useEffect } from "react";
import ROSConnection from "./components/ROSConnection";
import TurtleSimScene from "./components/TurtleSimScene";
import ControlPanel from "./components/ControlPanel";

export default function App() {
    const [turtlePos, setTurtlePos] = useState([0, 0, 0]);
    const [pathPoints, setPathPoints] = useState([]);
    const [ros, setRos] = useState(null);

    return (
        <div className="app">
            <ROSConnection setRos={setRos} />
            <div style={{ width: "80vw", height: "70vh" }}>
                <TurtleSimScene
                    ros={ros}
                    turtlePos={turtlePos}
                    setTurtlePos={setTurtlePos}
                    pathPoints={pathPoints}
                    setPathPoints={setPathPoints}
                />
            </div>
            <ControlPanel ros={ros} />
        </div>
    );
}
