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
  onSnapshot,
  where,
  orderBy,
  query,
  limit,
  getDocs,
} from "firebase/firestore";

// Chart.js
import { Bar } from "react-chartjs-2";
import { Chart, registerables, CategoryScale } from "chart.js";

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
      <div className="grid grid-cols-2 gap-10">
        <Graph />
        <div>
          <RecentTransactions />
          <CurrentBalance />
        </div>
      </div>
    </>
  );
}

function Graph() {
  const [user] = useAuthState(auth);
  const [monthlyEarning, setMonthlyEarning] = useState(null);
  const [monthlySpending, setMonthlySpending] = useState(null);

  useEffect(() => {
    // subscribe to the users income collection and pull the last 30 days of earnings and put them into an array by day
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

      const sortedByDay = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const formattedDate = `${date.getDate()}-${date.getMonth() + 1}`; // JavaScript months are 0-indexed

        const docsForDate = docs.filter((doc) => {
          const docDate = doc.date.toDate();
          const docFormattedDate = `${docDate.getDate()}-${
            docDate.getMonth() + 1
          }`;
          return docFormattedDate === formattedDate;
        });

        const totalAmountForDate = docsForDate.reduce(
          (total, doc) => total + Number(doc.amount),
          0
        );

        return totalAmountForDate || 0;
      });

      setMonthlyEarning(sortedByDay);
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    // subscribe to the users income collection and pull the last 30 days of earnings and put them into an array by day
    const incomeRef = collection(db, "users", user.uid, "spending");
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

      const sortedByDay = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const formattedDate = `${date.getDate()}-${date.getMonth() + 1}`; // JavaScript months are 0-indexed

        const docsForDate = docs.filter((doc) => {
          const docDate = doc.date.toDate();
          const docFormattedDate = `${docDate.getDate()}-${
            docDate.getMonth() + 1
          }`;
          return docFormattedDate === formattedDate;
        });

        const totalAmountForDate = docsForDate.reduce(
          (total, doc) => total + Number(doc.amount),
          0
        );

        return totalAmountForDate || 0;
      });

      setMonthlySpending(sortedByDay);
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  return (
    <BarGraph
      MonthlyEarning={monthlyEarning}
      MonthlySpending={monthlySpending}
    />
  );
}

Chart.register(...registerables);

Chart.register(CategoryScale);

function BarGraph({ MonthlyEarning, MonthlySpending }) {
  const labels = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return `${date.toLocaleString("default", {
      month: "short",
    })} ${date.getDate()}`;
  });

  const data = {
    labels: labels,
    datasets: [
      {
        label: "Earning",
        data: MonthlyEarning,
        backgroundColor: "rgba(75, 192, 192, 0.7)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
      {
        label: "Spending",
        data: MonthlySpending,
        backgroundColor: "rgba(255, 99, 132, 0.7)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    title: {
      display: false,
      text: "Earnings",
      font: {
        size: 25,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
          color: "#d6d6d6", // Change the x-axis title text color here
          font: {
            size: 18, // Change the x-axis title font size here
          },
        },
        grid: {
          color: "#383838", // Change the color of the x-axis lines here
        },
        ticks: {
          color: "#d6d6d6", // Change the x-axis label text color here
          font: {
            size: 14, // Change the x-axis label font size here
          },
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Amount",
          color: "#d6d6d6", // Change the y-axis title text color here
          font: {
            size: 18, // Change the y-axis title font size here
          },
        },
        grid: {
          color: "#383838", // Change the color of the x-axis lines here
        },
        ticks: {
          color: "#d6d6d6", // Change the y-axis label text color here
          font: {
            size: 18, // Change the y-axis label font size here
          },
        },
      },
    },
    plugins: {
      title: {
        display: true,
        text: "Recent Earnings and Spending",
        font: {
          size: 25,
        },
        color: "#d6d6d6", // Change the title text color here
      },
      legend: {
        display: false,
        labels: {
          color: "#d6d6d6", // Change the label text color here
          font: {
            size: 18, // Change the label font size here
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-auto">
      <Bar data={data} options={options} />
    </div>
  );
}

BarGraph.propTypes = {
  MonthlyEarning: PropTypes.array.isRequired,
  MonthlySpending: PropTypes.array.isRequired,
};

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

function RecentTransactions() {
  const [user] = useAuthState(auth);
  const [recentTransactions, setRecentTransactions] = useState(null);

  // pull the user's recent transactions from firestore
  useEffect(() => {
    const fetchRecentTransactions = async () => {
      const spendingRef = collection(db, "users", user.uid, "spending");
      const incomeRef = collection(db, "users", user.uid, "income");

      const spendingSnapshot = await getRecentTransactions(spendingRef);
      const incomeSnapshot = await getRecentTransactions(incomeRef);

      // adda a type property to each transaction to differentiate between spending and income
      spendingSnapshot.forEach(
        (transaction) => (transaction.type = "spending")
      );
      incomeSnapshot.forEach((transaction) => (transaction.type = "income"));

      const allTransactions = spendingSnapshot.concat(incomeSnapshot);

      console.log(allTransactions);

      const sortedTransactions = allTransactions.sort(
        (a, b) => b.date.toDate() - a.date.toDate()
      );

      // limit the transactions to the 5 most recent
      sortedTransactions.length = 5;

      setRecentTransactions(sortedTransactions);
    };

    fetchRecentTransactions();
  }, [user]);

  const getRecentTransactions = async (ref) => {
    const q = query(ref, orderBy("date", "desc"), limit(5));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data());
  };

  return (
    <>
      <h2 className="text-lheader font-light">Recent Transactions</h2>
      {recentTransactions !== null && (
        <div className="w-full">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Date</th>
                <th className="text-left">Category</th>
                <th className="text-left">Description</th>
                <th className="text-left">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((transaction, index) => (
                <tr key={index}>
                  <td>{transaction.date.toDate().toLocaleDateString()}</td>
                  <td>{transaction.category}</td>
                  <td>{transaction.description === "" ? ("N/A") : (transaction.description)}</td>
                  <td
                    className={
                      transaction.type === "spending"
                        ? "text-spending"
                        : "text-income"
                    }
                  >
                    ${transaction.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
