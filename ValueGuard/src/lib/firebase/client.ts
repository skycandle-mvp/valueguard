import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFirebaseConfig } from './config';

function initializeFirebase() {
    const apps = getApps();
    if (apps.length > 0) {
        return getApp();
    }

    const firebaseConfig = getFirebaseConfig();
    if (!firebaseConfig) {
        console.error("Could not initialize Firebase. Please check your .env file.");
        return null;
    }
    
    try {
        return initializeApp(firebaseConfig);
    } catch (e) {
        console.error("Could not initialize Firebase. Please check your .env file.", e);
        return null;
    }
}

const app = initializeFirebase();

export const auth = app ? getAuth(app) : ({} as any);
export const db = app ? getFirestore(app) : ({} as any);
