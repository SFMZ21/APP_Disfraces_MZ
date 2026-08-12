const { onCall } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const {
  createReservationHandler,
  updateReservationStatusHandler,
} = require("./src/reservations");

initializeApp();

const db = getFirestore();
const callableOptions = { region: "us-central1", cors: true };

exports.createReservation = onCall(callableOptions, (request) =>
  createReservationHandler({ db, request }));

exports.updateReservationStatus = onCall(callableOptions, (request) =>
  updateReservationStatusHandler({ db, request }));
