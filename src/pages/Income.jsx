import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import PropTypes from "prop-types";

// Firebase
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  setDoc,
  query,
  orderBy,
  limit,
  where,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";

// Icons
import { MdOutlineDeleteOutline as DeleteIcon } from "react-icons/md";

export default function Income() {
  return (
    <>
      <Helmet>
        <title>Easy Budget - Income</title>
      </Helmet>
      <div>
        <h1 className="text-title font-semibold">Income</h1>
        <div className="grid on_desktop:grid-cols-2 on_mobile:grid-cols-1 gap-10">
          <AddTransaction />
          <div className="flex flex-col gap-2">
            <LatestTransactions />
            <MonthlyEarning />
          </div>
        </div>
      </div>
    </>
  );
}

function MonthlyEarning() {
  const [user] = useAuthState(auth);
  const [monthlyEarnings, setMonthlyEarnings] = useState(null);

  useEffect(() => {
    // subscribe to user's income collection and pull the current month's earnings
    const incomeRef = collection(db, "users", user.uid, "income");
    const q = query(
      incomeRef,
      orderBy("date", "desc"),
      where(
        "date",
        ">",
        new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      )
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => doc.data());

      // add the amount of each transaction to the total
      var total = 0;
      docs.forEach((doc) => {
        total += Number(doc.amount);
      });
      setMonthlyEarnings(total);
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  return (
    <>
      {monthlyEarnings !== null && (
        <div className="flex gap-2 text-xl">
          <h2>This month you have earned:</h2>
          <p>${Number(monthlyEarnings).toFixed(2)}</p>
        </div>
      )}
    </>
  );
}

function LatestTransactions() {
  const [user] = useAuthState(auth);
  // pull the last 10 income transactions from firestore if they exist
  const [transactions, setTransactions] = useState(null);

  useEffect(() => {
    const incomeRef = collection(db, "users", user.uid, "income");
    const q = query(incomeRef, orderBy("date", "desc"), limit(10)); // assuming the date field is named 'date'

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const incomeData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransactions(incomeData);
    });

    // Cleanup function to unsubscribe from the snapshot on component unmount
    return () => unsubscribe();
  }, [user]);

  return (
    <>
      {transactions && transactions.length > 0 && (
        <div>
          <h2 className="text-lheader font-light">Latest Transactions</h2>
          <div>
            <TransactionList transactions={transactions} />
          </div>
        </div>
      )}
    </>
  );
}

function TransactionList({ transactions }) {
  const [user] = useAuthState(auth);
  const handleDelete = async (id) => {
    const userConfrim = confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (userConfrim) {
      try {
        await deleteDoc(doc(db, "users", user.uid, "income", id));
      } catch (e) {
        alert("Error deleting income transaction please try again.");
      }

      // pull the user docuemnt from firestore and update the current balance
      const userRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userRef);
      const currentBalance = userDocSnap.data().currentBalance;
      const newBalance =
        currentBalance - transactions.find((t) => t.id === id).amount;

      try {
        await setDoc(userRef, { currentBalance: newBalance }, { merge: true });
      } catch (e) {
        alert("Error updating current balance please try again.");
      }
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="table-auto w-fit text-left whitespace-nowrap">
        <thead>
          <tr>
            <th className="px-1 py-1">Date</th>
            <th className="px-1 py-1">Amount</th>
            <th className="px-1 py-1">Category</th>
            <th className="px-1 py-1">Description</th>
            <th className="px-1 py-1"></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
            <td className="px-1 py-1">
              {transaction.date.toDate().toLocaleString("en-US", {
                month: "numeric",
                day: "numeric",
                year: "numeric",
              })}
            </td>
              <td className="px-1 py-1">
                ${Number(transaction.amount).toFixed(2)}
              </td>
              <td className="px-1 py-1">{transaction.category}</td>
              <td>
                {transaction.description === ""
                  ? "N/A"
                  : transaction.description}
              </td>
              <td>
                <button
                  className="custom-button"
                  onClick={() => handleDelete(transaction.id)}
                >
                  <DeleteIcon />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// add props validation
TransactionList.propTypes = {
  transactions: PropTypes.array.isRequired,
};

function AddTransaction() {
  const [user] = useAuthState(auth);
  const [budgetCategories, setBudgetCategories] = useState(null);

  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  // pull the user's budget categories from firestore
  useEffect(() => {
    const fetchBudgetCategories = async () => {
      const userRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userRef);

      if (userDocSnap.exists()) {
        setBudgetCategories(userDocSnap.data().incomeCategories);
      }
    };

    fetchBudgetCategories();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (category === "") {
      alert("Please select a category");
      return;
    }

    const incomeRef = collection(db, "users", user.uid, "income");

    const newIncomeDoc = {
      amount: amount,
      category: category,
      description: description,
      date: new Date(),
    };

    try {
      await addDoc(incomeRef, newIncomeDoc);
    } catch (e) {
      alert("Error writing income transaction please try again.");
    }

    // pull the user docuemnt from firestore and update the current balance
    const userRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userRef);
    const currentBalance = userDocSnap.data().currentBalance;
    const newBalance = currentBalance + Number(amount);

    try {
      await setDoc(userRef, { currentBalance: newBalance }, { merge: true });
    } catch (e) {
      alert("Error updating current balance please try again.");
    }
  };

  return (
    <>
      {budgetCategories !== null && (
        <div className="w-fit">
          <h2 className="text-lheader font-light">Add Transaction</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
            <div className="flex gap-5">
              <label htmlFor="category" className="font-semibold">
                Category:
              </label>
              <select
                id="category"
                name="category"
                className="rounded w-fit"
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
            </div>
            <div className="flex gap-5">
              <label htmlFor="amount" className="font-semibold">
                Amount:
              </label>
              <input
                className="rounded w-fit"
                type="number"
                id="amount"
                name="amount"
                placeholder="Enter Amount"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="flex gap-5">
              <label htmlFor="description" className="font-semibold">
                Description:
              </label>
              <input
                className="rounded w-fit"
                type="text"
                id="description"
                name="description"
                placeholder="Enter Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <button type="submit" className="border-b w-fit custom-button">
              Submit Transaction
            </button>
          </form>
        </div>
      )}
    </>
  );
}
