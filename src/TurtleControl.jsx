import { useEffect } from 'react';
import ROSLIB from 'roslib';

const TurtleControl = () => {
  useEffect(() => {
    const ros = new ROSLIB.Ros({
      url: 'ws://localhost:9090', // Connect to ROSBridge
    });

    ros.on('connection', () => {
      console.log('Connected to websocket server.');
    });

    ros.on('error', (error) => {
      console.log('Error connecting to websocket server:', error);
    });

    ros.on('close', () => {
      console.log('Connection to websocket server closed.');
    });

    // Subscribe to pose
    const turtlePose = new ROSLIB.Topic({
      ros,
      name: '/turtle1/pose',
      messageType: 'turtlesim/Pose',
    });

    turtlePose.subscribe((message) => {
      console.log('Turtle Position:', message);
    });

    // Move turtle forward
    const cmdVel = new ROSLIB.Topic({
      ros,
      name: '/turtle1/cmd_vel',
      messageType: 'geometry_msgs/Twist',
    });

    const moveTurtle = () => {
      const twist = new ROSLIB.Message({
        linear: { x: 1.0, y: 0.0, z: 0.0 },
        angular: { x: 0.0, y: 0.0, z: 0.0 },
      });
      cmdVel.publish(twist);
    };

    // Move after 2 seconds
    const timer = setTimeout(moveTurtle, 2000);

    return () => {
      turtlePose.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  return (
    <div>
      <h2>Turtle Controller</h2>
      <p>Check the browser console for live turtle pose data.</p>
    </div>
  );
};

export default TurtleControl;
