var admin = require("firebase-admin");

import serviceAccount from "./../../serviceAccountKey.json";

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

export const messaging = admin.messaging();

export default admin;
