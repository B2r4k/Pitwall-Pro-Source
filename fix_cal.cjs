const admin = require('firebase-admin');
const serviceAccount = require('./firebase-applet-config.json');
// wait, we don't have service account, we have client config.
// I will just use the REST API to fetch the document.
