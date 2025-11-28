// src/firebase/firebase-config.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

class FirebaseService {
  private static instance: FirebaseService;
  private app: FirebaseApp;
  private _auth: Auth;
  private _db: Firestore;
  private _storage: FirebaseStorage;
  private initialized: boolean = false;

  private constructor() {
    console.log("🚀 Initializing Firebase Service...");
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
    };

    try {
      this.app = getApps().length ? getApp() : initializeApp(firebaseConfig);
      this._auth = getAuth(this.app);
      this._db = getFirestore(this.app);
      this._storage = getStorage(this.app);
      this.initialized = true;
      console.log("✅ Firebase Service initialized successfully");
    } catch (error) {
      console.error("❌ Error initializing Firebase Service:", error);
      this.app = null as unknown as FirebaseApp;
      this._auth = null as unknown as Auth;
      this._db = null as unknown as Firestore;
      this._storage = null as unknown as FirebaseStorage;
      this.initialized = false;
    }
  }

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      console.log("📦 Creating new Firebase Service instance");
      FirebaseService.instance = new FirebaseService();
    } else {
      console.log("♻️ Reusing existing Firebase Service instance");
    }
    return FirebaseService.instance;
  }

  get auth(): Auth {
    if (!this.initialized) {
      console.warn("⚠️ Firebase Service not properly initialized");
    }
    return this._auth;
  }

  get db(): Firestore {
    if (!this.initialized) {
      console.warn("⚠️ Firebase Service not properly initialized");
    }
    return this._db;
  }

  get storage(): FirebaseStorage {
    if (!this.initialized) {
      console.warn("⚠️ Firebase Service not properly initialized");
    }
    return this._storage;
  }
}

// Export a single instance
export const firebaseService = FirebaseService.getInstance();
