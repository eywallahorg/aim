// Firebase configuration and initialization
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  onSnapshot 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Your Firebase configuration
// Replace these values with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789012"
};

// Initialize Firebase
let app, db;
let firebaseInitialized = false;

export function initFirebase() {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    firebaseInitialized = true;
    console.log('Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    firebaseInitialized = false;
    return false;
  }
}

// Score management functions
export async function saveScore(scoreData) {
  if (!firebaseInitialized) {
    throw new Error('Firebase not initialized');
  }

  try {
    const docRef = await addDoc(collection(db, 'scores'), {
      ...scoreData,
      createdAt: new Date(),
      userAgent: navigator.userAgent,
      platform: navigator.platform
    });
    
    console.log('Score saved with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving score:', error);
    throw error;
  }
}

export async function getHighScores(difficulty = 'all', limitCount = 10) {
  if (!firebaseInitialized) {
    throw new Error('Firebase not initialized');
  }

  try {
    let q;
    if (difficulty === 'all') {
      q = query(
        collection(db, 'scores'),
        orderBy('score', 'desc'),
        limit(limitCount)
      );
    } else {
      q = query(
        collection(db, 'scores'),
        where('difficulty', '==', difficulty),
        orderBy('score', 'desc'),
        limit(limitCount)
      );
    }

    const querySnapshot = await getDocs(q);
    const scores = [];
    
    querySnapshot.forEach((doc) => {
      scores.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return scores;
  } catch (error) {
    console.error('Error getting high scores:', error);
    throw error;
  }
}

export function subscribeToHighScores(callback, difficulty = 'all', limitCount = 10) {
  if (!firebaseInitialized) {
    throw new Error('Firebase not initialized');
  }

  let q;
  if (difficulty === 'all') {
    q = query(
      collection(db, 'scores'),
      orderBy('score', 'desc'),
      limit(limitCount)
    );
  } else {
    q = query(
      collection(db, 'scores'),
      where('difficulty', '==', difficulty),
      orderBy('score', 'desc'),
      limit(limitCount)
    );
  }

  return onSnapshot(q, (querySnapshot) => {
    const scores = [];
    querySnapshot.forEach((doc) => {
      scores.push({
        id: doc.id,
        ...doc.data()
      });
    });
    callback(scores);
  });
}

// Offline score management
export class OfflineScoreManager {
  constructor() {
    this.localKey = 'valorantScores';
    this.syncKey = 'valorantScoresSync';
  }

  saveOfflineScore(scoreData) {
    try {
      const scores = this.getOfflineScores();
      const scoreWithMeta = {
        ...scoreData,
        id: this.generateId(),
        offline: true,
        needsSync: true,
        savedAt: new Date().toISOString()
      };
      
      scores.push(scoreWithMeta);
      
      // Keep only last 100 scores to prevent storage overflow
      if (scores.length > 100) {
        scores.splice(0, scores.length - 100);
      }
      
      localStorage.setItem(this.localKey, JSON.stringify(scores));
      return scoreWithMeta.id;
    } catch (error) {
      console.error('Error saving offline score:', error);
      throw error;
    }
  }

  getOfflineScores() {
    try {
      const scores = localStorage.getItem(this.localKey);
      return scores ? JSON.parse(scores) : [];
    } catch (error) {
      console.error('Error getting offline scores:', error);
      return [];
    }
  }

  getHighScoresOffline(difficulty = 'all', limitCount = 10) {
    const scores = this.getOfflineScores();
    
    let filteredScores = scores;
    if (difficulty !== 'all') {
      filteredScores = scores.filter(score => score.difficulty === difficulty);
    }
    
    return filteredScores
      .sort((a, b) => b.score - a.score)
      .slice(0, limitCount);
  }

  async syncOfflineScores() {
    if (!firebaseInitialized) {
      console.log('Firebase not initialized, skipping sync');
      return;
    }

    const scores = this.getOfflineScores();
    const unsyncedScores = scores.filter(score => score.needsSync);
    
    if (unsyncedScores.length === 0) {
      return;
    }

    console.log(`Syncing ${unsyncedScores.length} offline scores...`);
    
    const syncPromises = unsyncedScores.map(async (score) => {
      try {
        await saveScore({
          score: score.score,
          difficulty: score.difficulty,
          won: score.won,
          timestamp: score.timestamp,
          sessionId: score.sessionId
        });
        
        // Mark as synced
        score.needsSync = false;
        score.synced = true;
        return true;
      } catch (error) {
        console.error('Error syncing score:', error);
        return false;
      }
    });

    const results = await Promise.allSettled(syncPromises);
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
    
    // Update local storage
    localStorage.setItem(this.localKey, JSON.stringify(scores));
    
    console.log(`Successfully synced ${successCount}/${unsyncedScores.length} scores`);
    return successCount;
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  clearOfflineScores() {
    localStorage.removeItem(this.localKey);
  }
}

// Network status management
export class NetworkManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.callbacks = [];
    
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyCallbacks('online');
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyCallbacks('offline');
    });
  }

  onStatusChange(callback) {
    this.callbacks.push(callback);
  }

  notifyCallbacks(status) {
    this.callbacks.forEach(callback => {
      try {
        callback(status, this.isOnline);
      } catch (error) {
        console.error('Error in network status callback:', error);
      }
    });
  }
}

// Initialize everything
export function initGameServices() {
  const firebaseReady = initFirebase();
  const offlineManager = new OfflineScoreManager();
  const networkManager = new NetworkManager();

  // Auto-sync when coming back online
  networkManager.onStatusChange((status) => {
    if (status === 'online') {
      setTimeout(() => {
        offlineManager.syncOfflineScores();
      }, 1000); // Wait a bit for connection to stabilize
    }
  });

  return {
    firebaseReady,
    offlineManager,
    networkManager,
    saveScore: firebaseReady ? saveScore : null,
    getHighScores: firebaseReady ? getHighScores : null
  };
}
