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
import { IoChevronForward as OpenIcon } from "react-icons/io5";
import { IoChevronDown as ClosedIcon } from "react-icons/io5";

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
  return (
    <div className="overflow-x-auto">
      <table className="table-auto w-fit text-left whitespace-nowrap">
        <thead>
          <tr>
            <th></th>
            <th className="px-1 py-1">Date</th>
            <th className="px-1 py-1">Amount</th>
            <th className="px-1 py-1">Category</th>
            <th className="px-1 py-1"></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <TransactionRow key={transaction.id} transaction={transaction} />
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
  const [date, setDate] = useState(new Date());

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

    // code to fix date for firestore
    // convert date to firestore timestamp
    const fixedDate = new Date(date);
    // set the time to current time
    fixedDate.setHours(new Date().getHours());
    fixedDate.setMinutes(new Date().getMinutes());
    fixedDate.setSeconds(new Date().getSeconds());
    fixedDate.setMilliseconds(new Date().getMilliseconds());
    // add one day
    fixedDate.setDate(fixedDate.getDate() + 1);

    const incomeRef = collection(db, "users", user.uid, "income");
    const newIncomeDoc = {
      amount: amount,
      category: category,
      description: description,
      date: fixedDate,
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

    // reset the form
    setAmount(0);
    setCategory("");
    setDescription("");
  };

  return (
    <>
      {budgetCategories !== null && (
        <div className="w-fit">
          <h2 className="text-lheader font-light">Add Transaction</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-fit">
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
                {budgetCategories.active.map((category, index) => (
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
                className="rounded on_mobile:w-full"
                type="number"
                step={0.01}
                id="amount"
                name="amount"
                placeholder="Enter Amount"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="flex gap-5">
              <label
                htmlFor="description"
                className="font-semibold on_mobile:hidden"
              >
                Description:
              </label>
              <input
                className="rounded w-full"
                type="text"
                id="description"
                name="description"
                placeholder="Enter Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex gap-5">
              <label htmlFor="date" className="font-semibold">
                Date:
              </label>
              <input
                className="rounded"
                type="date"
                id="date"
                name="date"
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <button type="submit" className="border-b-2 w-fit custom-button">
              Submit Transaction
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function TransactionRow({ transaction }) {
  const [user] = useAuthState(auth);
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async (id, amount) => {
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
      const newBalance = currentBalance - Number(amount);

      try {
        await setDoc(userRef, { currentBalance: newBalance }, { merge: true });
      } catch (e) {
        alert("Error updating current balance please try again.");
      }
    }
  };

  return (
    <>
      <tr>
        <td>
          <button onClick={() => setIsOpen((prev) => !prev)}>
            {isOpen ? <ClosedIcon /> : <OpenIcon />}
          </button>
        </td>
        <td>
          {new Date(transaction.date.seconds * 1000).toLocaleDateString()}
        </td>
        <td>${transaction.amount}</td>
        <td>{transaction.category}</td>
        <td>
          <button
            className="custom-button"
            onClick={() => handleDelete(transaction.id, transaction.amount)}
          >
            <DeleteIcon />
          </button>
        </td>
      </tr>
      {isOpen && (
        <tr>
          <td colSpan="1"></td>
          <td colSpan="4">
            {transaction.descrition === ""
              ? "Description: N/A"
              : transaction.description}
          </td>
        </tr>
      )}
    </>
  );
}

TransactionRow.propTypes = {
  transaction: PropTypes.object,
};
