import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";

// Firebase
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc } from "firebase/firestore";

export default function Dashboard() {
  const [user] = useAuthState(auth);
  return (
    <>
      <Helmet>
        <title>Easy Budget - Dashboard</title>
      </Helmet>
      <div className="">
        <h2 className="text-subheader font-light">Welcome</h2>
        <h2 className="text-lheader font-semibold">{user.displayName}</h2>
      </div>
      <CurrentBalance />
    </>
  );
}

function CurrentBalance() {
  const [user] = useAuthState(auth);
  const [currentBalance, setCurrentBalance] = useState(null);

  // pull user's current balance from firestore within the user document
  useEffect(() => {
    const fetchUserData = async () => {
      const userRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userRef);

      if (userDocSnap.exists()) {
        setCurrentBalance(userDocSnap.data().currentBalance);
      }
    };

    fetchUserData();
  }, [user]);

  return (
    <>
      {currentBalance !== null && (
        <div className="flex gap-2 text-xl">
          <h2>Your Current Balance:</h2>
          <h2>${currentBalance.toFixed(2)}</h2>
        </div>
      )}
    </>
  );
}
