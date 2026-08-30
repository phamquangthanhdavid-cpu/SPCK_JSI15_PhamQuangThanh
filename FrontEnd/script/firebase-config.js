// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBNVG8kYv_bemqbF-tqQVdDd-oxL0HgT10",
  authDomain: "jsi15-spck.firebaseapp.com",
  projectId: "jsi15-spck",
  storageBucket: "jsi15-spck.firebasestorage.app",
  messagingSenderId: "655726153453",
  appId: "1:655726153453:web:5b4d857f28cb5b9c4e86e4",
  measurementId: "G-7R3YDQZ3KZ"
};

var db; // Declare db variable to hold Firestore instance

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully.");
  db = firebase.firestore();
}