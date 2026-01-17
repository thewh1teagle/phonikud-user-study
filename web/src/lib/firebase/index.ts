import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, writeBatch, doc } from 'firebase/firestore';

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
  name: string;
  email: string;
  sentence_id: string;
  model: string;
  naturalness: number;  // 1-5
  accuracy: number;     // 1-5
  timestamp?: Date;
}

export interface CommentSubmission {
  name: string;
  email: string;
  comments: string;
  sessionId: string;
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
 * Submit multiple ratings in a batch (more efficient)
 */
export async function submitBatch(submissions: Submission[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    
    submissions.forEach((submission) => {
      const docRef = doc(collection(db, 'submissions'));
      batch.set(docRef, {
        ...submission,
        timestamp: new Date()
      });
    });
    
    await batch.commit();
    console.log(`Batch of ${submissions.length} submissions added successfully`);
  } catch (error) {
    console.error('Error submitting batch:', error);
    throw error;
  }
}

/**
 * Submit user comments to Firestore
 */
export async function submitComments(commentData: CommentSubmission): Promise<void> {
  try {
    const docRef = await addDoc(collection(db, 'comments'), {
      ...commentData,
      timestamp: new Date()
    });
    console.log('Comments submitted with ID:', docRef.id);
  } catch (error) {
    console.error('Error submitting comments:', error);
    throw error;
  }
}

/**
 * Get all comments from Firestore
 */
export async function getAllComments(): Promise<CommentSubmission[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'comments'));
    return querySnapshot.docs.map(doc => doc.data() as CommentSubmission);
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
}

/**
 * Get all submissions from Firestore
 */
export async function getAllSubmissions(): Promise<Submission[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'submissions'));
    return querySnapshot.docs.map(doc => doc.data() as Submission);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    throw error;
  }
}

/**
 * Calculate statistics per model
 */
export interface ModelStats {
  model: string;
  count: number;
  meanNaturalness: number;
  meanAccuracy: number;
  stderrNaturalness: number;
  stderrAccuracy: number;
}

export function calculateStats(submissions: Submission[]): ModelStats[] {
  const modelGroups = submissions.reduce((acc, sub) => {
    if (!acc[sub.model]) {
      acc[sub.model] = [];
    }
    acc[sub.model].push(sub);
    return acc;
  }, {} as Record<string, Submission[]>);

  return Object.entries(modelGroups).map(([model, subs]) => {
    const naturalness = subs.map(s => s.naturalness);
    const accuracy = subs.map(s => s.accuracy);
    
    const meanNat = naturalness.reduce((a, b) => a + b, 0) / naturalness.length;
    const meanAcc = accuracy.reduce((a, b) => a + b, 0) / accuracy.length;
    
    const varNat = naturalness.reduce((a, b) => a + Math.pow(b - meanNat, 2), 0) / naturalness.length;
    const varAcc = accuracy.reduce((a, b) => a + Math.pow(b - meanAcc, 2), 0) / accuracy.length;
    
    return {
      model,
      count: subs.length,
      meanNaturalness: meanNat,
      meanAccuracy: meanAcc,
      stderrNaturalness: Math.sqrt(varNat / subs.length),
      stderrAccuracy: Math.sqrt(varAcc / subs.length)
    };
  });
}

/**
 * Export all submissions as CSV string
 */
export async function exportToCSV(): Promise<string> {
  try {
    const querySnapshot = await getDocs(collection(db, 'submissions'));

    // CSV header
    const headers = ['name', 'email', 'sentence_id', 'model', 'naturalness', 'accuracy', 'timestamp'];
    const rows = [headers.join(',')];

    // CSV rows
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const row = [
        data.name,
        data.email,
        data.sentence_id,
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
