import { configureStore } from "@reduxjs/toolkit";
import actionBlockReducer from "./slices/actionBlockSlice";
import notificationReducer from "./slices/notificationSlice";
export const store = configureStore({
	reducer: {
		actionBlock: actionBlockReducer,
		notification: notificationReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
