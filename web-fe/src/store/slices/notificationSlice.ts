import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
	SystemNotification,
	SystemUserNotification,
} from "@/types/system-notification";
interface NotificationState {
	items: SystemUserNotification[];
	unreadCount: number;
}

const initialState: NotificationState = {
	items: [],
	unreadCount: 0,
};

const notificationSlice = createSlice({
	name: "notifications",
	initialState,
	reducers: {
		pushNotification(state, action: PayloadAction<SystemNotification>) {
			const newUserNotification: SystemUserNotification = {
				id: Date.now(), // Temporary ID, replace with real ID from backend if needed
				userId: 0, // This should be set to the current user's ID
				notificationId: action.payload.id,
				notification: action.payload,
				isRead: false,
				readAt: null,
				isDeleted: false,
				deletedAt: null,
				createdAt: new Date(),
			};
			state.items.unshift(newUserNotification);
			state.unreadCount++;
		},

		markAllRead(state) {
			state.unreadCount = 0;
			state.items.forEach((n) => {
				n.isRead = true;
				n.readAt = new Date();
			});
		},
		markOneRead(state, action: PayloadAction<number>) {
			const userNotificationId = action.payload;
			const notification = state.items.find((n) => n.id === userNotificationId);
			if (notification && !notification.isRead) {
				notification.isRead = true;
				notification.readAt = new Date();
				state.unreadCount = Math.max(0, state.unreadCount - 1);
			}
		},
		markOneReadByNotificationId(state, action: PayloadAction<number>) {
			const notificationId = action.payload;
			const notification = state.items.find(
				(n) => n.notificationId === notificationId,
			);
			if (notification && !notification.isRead) {
				notification.isRead = true;
				notification.readAt = new Date();
				state.unreadCount = Math.max(0, state.unreadCount - 1);
			}
		},
		initializeNotifications(
			state,
			action: PayloadAction<SystemUserNotification[]>,
		) {
			state.items = action.payload;
			state.unreadCount = action.payload.filter(
				(n: SystemUserNotification) => !n.isRead,
			).length;
		},
	},
});

export const {
	markOneRead,
	markOneReadByNotificationId,
	pushNotification,
	initializeNotifications,
	markAllRead,
} = notificationSlice.actions;
export default notificationSlice.reducer;
