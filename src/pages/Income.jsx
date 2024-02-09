import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";

// Firebase
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";

export default function Income() {
  return (
    <>
      <Helmet>
        <title>Easy Budget - Income</title>
      </Helmet>
      <div>
        <h1 className="text-title font-semibold">Income</h1>
        <MonthlyEarning />
        <LatestTransactions />
        <AddTransaction />
      </div>
    </>
  );
}

function MonthlyEarning() {
  return (
    <div>
      <h2>This Month You&apos;ve Earned:</h2>
    </div>
  );
}

function LatestTransactions() {
  return (
    <div>
      <h2 className="text-lheader font-light">Latest Transactions</h2>
    </div>
  );
}

function AddTransaction() {
  const [user] = useAuthState(auth);
  const [budgetCategories, setBudgetCategories] = useState(null);

  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState("");

  // pull the user's budget categories from firestore
  useEffect(() => {
    const fetchBudgetCategories = async () => {
      const userRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userRef);

      if (userDocSnap.exists()) {
        setBudgetCategories(userDocSnap.data().budgetCategories);
      }
    };

    fetchBudgetCategories();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const incomeRef = collection(db, "users", user.uid, "income");
    const newIncomeDoc = {
      amount: amount,
      category: category,
    };

    try {
      const docRef = await addDoc(incomeRef, newIncomeDoc);
      console.log(`Document written with ID: ${docRef.id}`);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return (
    <>
      {budgetCategories !== null && (
        <div>
          <h2 className="text-lheader font-light">Add Transaction</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="amount">Amount:</label>
            <input
              className="rounded"
              type="number"
              id="amount"
              name="amount"
              placeholder="Enter Amount"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <label htmlFor="category">Category:</label>
            <select
              id="category"
              name="category"
              className="rounded"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select Category</option>
              {budgetCategories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <button type="submit">Add Transaction</button>
          </form>
        </div>
      )}
    </>
  );
}
