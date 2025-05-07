import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    ros: null,
    turtlePos: { x: 0, y: 0, z: 0, theta: 0 },
    pathPoints: [],
    playbackDirection: true,
};
const appConfigSlice = createSlice({
    name: "appConfig",
    initialState,
    reducers: {
        resetConfig(state, action) {
            return initialState;
        },
        setRos(state, action) {
            state.ros = action.payload;
        },
        setPath(state, action) {
            state.pathPoints = action.payload;
        },
        addPathPoints(state, action) {
            state.pathPoints.push(action.payload);
        },
        setTurtlePos(state, action) {
            state.turtlePos = action.payload;
        },
        setPlaybackDirection(state, action) {
            state.playbackDirection = action.payload;
        },
    },
});

export const { resetConfig, setRos, setPath, addPathPoints, setTurtlePos, setPlaybackDirection } =
    appConfigSlice.actions;
export default appConfigSlice.reducer;
