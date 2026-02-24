
import { NextRequest, NextResponse } from 'next/server';
import { db } from './firebase';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const rateLimits = collection(db, 'rate-limits');

export async function rateLimiter(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const limit = 100;
  const window = 15 * 60 * 1000;

  const docRef = doc(rateLimits, ip);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const { count, timestamp } = docSnap.data();
    const now = Date.now();

    if (now - timestamp > window) {
      await setDoc(docRef, { count: 1, timestamp: now });
    } else {
      if (count >= limit) {
        return new NextResponse('Too many requests', { status: 429 });
      }
      await updateDoc(docRef, { count: count + 1 });
    }
  } else {
    await setDoc(docRef, { count: 1, timestamp: Date.now() });
  }
}
