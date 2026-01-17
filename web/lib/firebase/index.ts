import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDhX8O6T5v1wNVFQsQQ4j9_K9jQTNarf2s",
  authDomain: "phonikud-user-study.firebaseapp.com",
  projectId: "phonikud-user-study",
  storageBucket: "phonikud-user-study.firebasestorage.app",
  messagingSenderId: "689783511490",
  appId: "1:689783511490:web:c67b072cff4bc6754a9e5b",
  measurementId: "G-G6SD739KV4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export interface Submission {
  email: string;
  q_id: number;
  model: string;
  naturalness: number;  // 1-5
  accuracy: number;     // 1-5
  timestamp?: Date;
}

/**
 * Submit a rating to Firestore
 */
export async function submitSubmission(submission: Submission) {
  try {
    const docRef = await addDoc(collection(db, 'submissions'), {
      ...submission,
      timestamp: new Date()
    });
    console.log('Submission added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding submission:', error);
    throw error;
  }
}

/**
 * Export all submissions as CSV string
 */
export async function exportToCSV(): Promise<string> {
  try {
    const querySnapshot = await getDocs(collection(db, 'submissions'));

    // CSV header
    const headers = ['email', 'q_id', 'model', 'naturalness', 'accuracy', 'timestamp'];
    const rows = [headers.join(',')];

    // CSV rows
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const row = [
        data.email,
        data.q_id,
        data.model,
        data.naturalness,
        data.accuracy,
        data.timestamp?.toDate?.().toISOString() || data.timestamp
      ];
      rows.push(row.join(','));
    });

    return rows.join('\n');
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw error;
  }
}
