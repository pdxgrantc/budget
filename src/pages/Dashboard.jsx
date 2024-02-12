import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import PropTypes from "prop-types";

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

import { Line } from "react-chartjs-2";
import { Chart, registerables, CategoryScale } from "chart.js";

Chart.register(...registerables);

Chart.register(CategoryScale);

function LineGraph({
  inputData,
  inputLabel,
  inputBackgroundColor,
  inputBorderColor,
}) {
  const [input, setInput] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [label, setLabel] = useState("");
  const [backgroundColor, setBackgroundColor] = useState(
    "rgba(75,192,192,0.5)"
  );
  const [borderColor, setBorderColor] = useState("rgba(75,192,192,1)");

  useEffect(() => {
    setInput(inputData);
  }, [inputData]);

  useEffect(() => {
    if (inputLabel) {
      setLabel(inputLabel);
    } else {
      setLabel("");
    }
  }, [inputLabel]);

  useEffect(() => {
    if (inputBackgroundColor) {
      setBackgroundColor(inputBackgroundColor);
    } else {
      setBackgroundColor("rgba(75,192,192,0.5)");
    }
  }, [inputBackgroundColor]);

  useEffect(() => {
    if (inputBorderColor) {
      setBorderColor(inputBorderColor);
    } else {
      setBorderColor("rgba(75,192,192,1)");
    }
  }, [inputBorderColor]);

  const options = {
    scales: {
      x: {
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
      legend: {
        labels: {
          color: "#d6d6d6", // Change the label text color here
          font: {
            size: 18, // Change the label font size here
          },
        },
      },
    },
  };

  const data = {
    labels: [
      "6 Days Ago",
      "5 Days Ago",
      "4 Days Ago",
      "3 Days Ago",
      "2 Days Ago",
      "Yesterday",
      "Today",
    ],
    datasets: [
      {
        label: label,
        data: input,
        fill: true,
        backgroundColor: backgroundColor,
        borderColor: borderColor,
      },
    ],
  };

  return (
    <div className="w-full h-auto">
      <Line data={data} options={options} />
    </div>
  );
}

LineGraph.propTypes = {
  inputData: PropTypes.array.isRequired,
  inputLabel: PropTypes.string,
  inputBackgroundColor: PropTypes.string,
  inputBorderColor: PropTypes.string,
};