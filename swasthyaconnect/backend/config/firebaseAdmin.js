const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

let firebaseAdminApp = null;

const getServiceAccountPath = () => path.resolve(__dirname, '..', 'firebase-admin-key.json');

const initializeFirebaseAdmin = () => {
  if (firebaseAdminApp) {
    return firebaseAdminApp;
  }

  if (admin.apps?.length > 0) {
    firebaseAdminApp = admin.app();
    return firebaseAdminApp;
  }

  const serviceAccountPath = getServiceAccountPath();

  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error('Missing Firebase Admin service account key at backend/firebase-admin-key.json.');
  }

  const serviceAccount = require(serviceAccountPath);

  firebaseAdminApp = admin.initializeApp({
    credential: admin.credential.cert({
      ...serviceAccount,
      private_key: serviceAccount?.private_key?.replace(/\\n/g, '\n'),
    }),
  });

  return firebaseAdminApp;
};

module.exports = {
  admin,
  initializeFirebaseAdmin,
};