import { useState } from "react";
import { auth, db } from "./firebaseConfig";
import {
  signInAnonymously,
  createUserWithEmailAndPassword,
  signOut,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

export default function TestFirebase() {
  const [status, setStatus] = useState("Idle");
  const [uid, setUid] = useState(null);
  const [data, setData] = useState(null);

  const testAnon = async () => {
    try {
      setStatus("Signing in anonymously…");
      const { user } = await signInAnonymously(auth);
      setUid(user.uid);

      setStatus("Writing doc…");
      const ref = doc(db, "users", user.uid);
      await setDoc(ref, { hello: "world", ts: serverTimestamp() }, { merge: true });

      setStatus("Reading doc…");
      const snap = await getDoc(ref);
      setData(snap.exists() ? snap.data() : null);
      setStatus("Success ✅");
    } catch (e) {
      console.error(e);
      setStatus(`Error: ${e.code || e.message}`);
    }
  };

  const testEmailPassword = async () => {
    // Turn on Email/Password in Console → Authentication → Sign-in method
    const email = "tester@example.com";
    const password = "SuperSecret123!";

    try {
      setStatus("Creating/signing in with email+password…");
      let userCred;
      try {
        userCred = await createUserWithEmailAndPassword(auth, email, password);
      } catch (e) {
        if (e.code === "auth/email-already-in-use") {
          userCred = await signInWithEmailAndPassword(auth, email, password);
        } else throw e;
      }
      setUid(userCred.user.uid);

      setStatus("Writing doc…");
      const ref = doc(db, "users", userCred.user.uid);
      await setDoc(ref, { hello: "from email user", ts: serverTimestamp() }, { merge: true });

      setStatus("Reading doc…");
      const snap = await getDoc(ref);
      setData(snap.exists() ? snap.data() : null);
      setStatus("Success ✅");
    } catch (e) {
      console.error(e);
      setStatus(`Error: ${e.code || e.message}`);
    }
  };

  const doSignOut = async () => {
    await signOut(auth);
    setUid(null);
    setData(null);
    setStatus("Signed out");
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Firebase Smoke Test</h2>
      <p>Status: {status}</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={testAnon}>Test Anonymous + Firestore</button>
        <button onClick={testEmailPassword}>Test Email/Password + Firestore</button>
        <button onClick={doSignOut}>Sign out</button>
      </div>
      {uid && <p><strong>UID:</strong> {uid}</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
