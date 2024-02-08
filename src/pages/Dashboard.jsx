import { Helmet } from "react-helmet";

// Firebase
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

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
    </>
  );
}
