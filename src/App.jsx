import ROSConnection from "./components/ROSConnection";
import TurtleSimScene from "./components/TurtleSimScene";
import ControlPanel from "./components/ControlPanel";

export default function App() {
    return (
        <div className="app">
            <ROSConnection />
            <div style={{ width: "100vw", height: "100vh" }}>
                <TurtleSimScene />
            </div>
            <ControlPanel />
        </div>
    );
}
