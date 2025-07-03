import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZXM4Q-eEcMVIW6e9imI-l4spoDMj7Eog",
  authDomain: "lovingyourskinshop.firebaseapp.com",
  projectId: "lovingyourskinshop",
  storageBucket: "lovingyourskinshop.firebasestorage.app",
  messagingSenderId: "422853239977",
  appId: "1:422853239977:web:a2017d4483c1d1e38035b8",
  measurementId: "G-H7ZYDXQFHP"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null

export default app