export const DB_NAME: string = "bits-of-code";

export const nameless: string = "xyz";

export const NotificationPayload = (title: string, body: string) => {
	return {
		notification: {
			title,
			body,
		},
	};
};
