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
  getDocs,
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
        <div className="flex flex-col gap-5">
          <MonthlyEarning />
          <LatestTransactions />
          <AddTransaction />
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
    const fetchTransactions = async () => {
      const incomeRef = collection(db, "users", user.uid, "income");
      const q = query(incomeRef, orderBy("date", "desc"), limit(10)); // assuming the date field is named 'date'
      const incomeSnapshot = await getDocs(q);
      const incomeData = incomeSnapshot.docs.map((doc) => doc.data());
      setTransactions(incomeData);
    };

    fetchTransactions();
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
    const incomeRef = collection(db, "users", user.uid, "income");
    const q = query(incomeRef, orderBy("date", "desc"), limit(10));
    const incomeSnapshot = await getDocs(q);
    const incomeData = incomeSnapshot.docs.map((doc) => doc.data());
    const docToDelete = incomeData[id];

    try {
      await deleteDoc(doc(incomeRef, docToDelete.id));
    } catch (e) {
      alert("Error deleting income transaction please try again.");
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="table-auto w-fit text-left whitespace-nowrap">
        <thead></thead>
        <tbody>
          {transactions.map((transaction, index) => (
            <tr key={index}>
              <td className="px-1 py-1">
                ${Number(transaction.amount).toFixed(2)}
              </td>
              <td className="px-1 py-1">{transaction.category}</td>
              <td className="px-1 py-1">
                {transaction.date.toDate().toLocaleString("en-US", {
                  month: "numeric",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                })}
              </td>
              <td>
                <button
                  className="custom-button"
                  onClick={() => handleDelete(index)}
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
      date: new Date(),
    };

    try {
      await addDoc(incomeRef, newIncomeDoc);
    } catch (e) {
      alert("Error writing income transaction please try again.");
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
