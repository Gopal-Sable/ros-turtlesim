import ROSConnection from "./components/ROSConnection";
import TurtleSimScene from "./components/TurtleSimScene";
import ControlPanel from "./components/ControlPanel";
import "./App.css";
export default function App() {
    return (
        <div className="app">
            <ROSConnection />
            <div style={{ width: "90vw", height: "90vh" }}>
                <TurtleSimScene />
            </div>
            <ControlPanel />
        </div>
    );
}
