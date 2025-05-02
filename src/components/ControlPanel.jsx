import ROSLIB from "roslib"

export default function ControlPanel({ ros }) {
    const sendCommand = (linear, angular) => {
      if (!ros) return
  
      const cmdVel = new ROSLIB.Topic({
        ros: ros,
        name: '/turtle1/cmd_vel',
        messageType: 'geometry_msgs/Twist'
      })
  
      const twist = new ROSLIB.Message({
        linear: { x: linear, y: 0, z: 0 },
        angular: { x: 0, y: 0, z: angular }
      })
  
      cmdVel.publish(twist)
    }
  
    const executeSquarePath = () => {
      if (!ros) return
  
      const moves = [
        { linear: 2.0, angular: 0.0, duration: 2000 },
        { linear: 0.0, angular: Math.PI/2, duration: 1000 },
        { linear: 2.0, angular: 0.0, duration: 2000 },
        { linear: 0.0, angular: Math.PI/2, duration: 1000 },
        { linear: 2.0, angular: 0.0, duration: 2000 },
        { linear: 0.0, angular: Math.PI/2, duration: 1000 },
        { linear: 2.0, angular: 0.0, duration: 2000 }
      ]
  
      moves.reduce((prev, move, i) => {
        return setTimeout(() => {
          sendCommand(move.linear, move.angular)
          if (i === moves.length - 1) {
            setTimeout(() => sendCommand(0, 0), move.duration)
          }
        }, prev)
      }, 0)
    }
  
    return (
      <div className="controls">
        <button onClick={() => sendCommand(1.0, 0.0)}>Move Forward</button>
        <button onClick={() => sendCommand(-1.0, 0.0)}>Move Backward</button>
        <button onClick={() => sendCommand(0.0, 1.0)}>Turn Left</button>
        <button onClick={() => sendCommand(0.0, -1.0)}>Turn Right</button>
        <button onClick={() => sendCommand(0.0, 0.0)}>Stop</button>
        <button onClick={executeSquarePath}>Execute Square Path</button>
      </div>
    )
  }