import { configureStore } from "@reduxjs/toolkit";
import appConfig from "./appConfigSlice.js";

export const store = configureStore({
    reducer: {
        appConfig,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredPaths: ['appConfig.ros','appConfig.pathPoints'],
                ignoredActionPaths: ['appConfig/setRos','appConfig/setTurtlePos','appConfig/setPath'], 
            },
        }),
});
