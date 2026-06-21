require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getDatabase } = require('firebase/database');

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAwqh5JlOu5mEdLgLHI3AXaYQbxHKIGozM",
  authDomain: "vespera-7da88.firebaseapp.com",
  projectId: "vespera-7da88",
  storageBucket: "vespera-7da88.firebasestorage.app",
  messagingSenderId: "501953267232",
  appId: "1:501953267232:web:274e017131cefd39c7de45",
  measurementId: "G-PQ6SRS2LJJ"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

module.exports = { db };
