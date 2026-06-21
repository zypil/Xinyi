require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getDatabase } = require('firebase/database');

const firebaseConfig = {
  apiKey: process.env.AIzaSyAwqh5JlOu5mEdLgLHI3AXaYQbxHKIGozM,
  authDomain: process.env.vespera-7da88.firebaseapp.com,
  projectId: process.env.vespera-7da88,
  storageBucket: process.env.vespera-7da88.firebasestorage.app,
  messagingSenderId: process.env.501953267232,
  appId: process.env.1:501953267232:web:274e017131cefd39c7de45,
  measurementId: process.env.G-PQ6SRS2LJJ
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

module.exports = { db };
