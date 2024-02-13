import {
  BrowserRouter,
  Route,
  Routes,
  Outlet,
  NavLink,
} from "react-router-dom";
import PropTypes from "prop-types";

// Firebase
import { SignIn, SignOut, auth } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";

// icons
import { SiGithub as GitHubLogo } from "react-icons/si";
import { FaLinkedinIn as LinkedLogo } from "react-icons/fa";
import { IoPersonCircleSharp as AboutLogo } from "react-icons/io5";

// Images
import google_normal from "./assets/btn_google_signin_dark_normal_web@2x.png";
import google_pressed from "./assets/btn_google_signin_dark_pressed_web@2x.png";

// Pages
import Dashboard from "./pages/Dashboard";
import Income from "./pages/Income";
import Spending from "./pages/Spending";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Root />} caseSensitive={true}>
          <Route index element={<Dashboard />} />
          <Route path="/income" element={<Income />} />
          <Route path="/spending" element={<Spending />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function Root(props) {
  const { children } = props;
  const [user] = useAuthState(auth);

  return (
    <div className="text min-h-screen w-full">
      <NavBarHost />
      <div>
        {user ? (
          <div
            className="bg h-full flex-grow px-20 pb-10"
            style={{ minHeight: "calc(100vh - 17.5rem)" }}
          >
            <main>{children || <Outlet />}</main>
          </div>
        ) : (
          <div
            className="bg h-full flex-grow px-20 py-10"
            style={{
              minHeight: "calc(100vh - 17.5rem)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <SignInDialogue />
          </div>
        )}
      </div>

      <footer className="bg-black px-20 h-[12.5rem] flex justify-around flex-col">
        <div className="flex flex-col gap-2">
          <p className="mx-auto">Find me here</p>
          <div className="flex gap-6 w-fit mx-auto">
            <OutsideLink className="" link="https://www.github.com/pdxgrantc">
              <GitHubLogo className="h-[3.25rem] w-auto mx-auto text-button hover:text-button_hover" />
            </OutsideLink>
            <OutsideLink link="https://pdxgrantc.com/">
              <AboutLogo className="h-[3.5rem] w-auto text-button hover:text-button_hover" />
            </OutsideLink>
            <OutsideLink link="https://www.linkedin.com/in/pdxgrantc">
              <LinkedLogo className="h-[3.5rem] w-auto text-button hover:text-button_hover" />
            </OutsideLink>
          </div>
          <p className="mx-auto text-m">Grant Conklin - 2024</p>
        </div>
      </footer>
    </div>
  );
}

function SignInDialogue() {
  const GoogleButton = () => {
    const handleMouseEnter = (event) => {
      // Change the source of the image to the second image
      event.target.src = google_pressed;
    };

    const handleMouseLeave = (event) => {
      // Change the source of the image back to the first image
      event.target.src = google_normal;
    };

    return (
      <button className="mx-auto transition rounded" onClick={SignIn}>
        <img
          src={google_normal}
          alt="Button"
          className="h-[5rem]"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      </button>
    );
  };

  return (
    <div className="my-auto">
      <div className="center flex flex-col gap-5 h-fit w-fit mx-auto">
        <div className="flex flex-col gap-2 w-fit">
          <h1 className="text-center text-5xl font-bold">
            Welcome to Easy Budget
          </h1>
          <p className="text-center text-2xl">
            Please sign in with Google to continue
          </p>
        </div>
        <div className="font-semibold mx-auto w-fit">
          <GoogleButton />
        </div>
      </div>
    </div>
  );
}

// validate prop types
Root.propTypes = {
  children: PropTypes.node,
};

const OutsideLink = ({ children, link }) => {
  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      className="buttons center w-fit flex gap-3 mt-1 hover:text-white hover:mt-0 hover:mb-1 font-semibold transition-all durration-300 ease-in-out"
    >
      {children}
    </a>
  );
};

OutsideLink.propTypes = {
  children: PropTypes.node,
  link: PropTypes.string,
};

function NavBarHost() {
  return (
    <div>
      <div className="on_desktop:hidden">
        <MobileNavBar />
      </div>
      <div className="on_mobile:hidden">
        <DesktopNavBar />
      </div>
    </div>
  );
}

function DesktopNavBar() {
  const [user] = useAuthState(auth);

  return (
    <nav className="h-20 bg-black px-20 flex flex-wrap items-center justify-between">
      <h1 className="text-lheader font-semibold on_mobile:hidden">
        Easy Budget
      </h1>
      <h1 className="text-lheader font-semibold on_desktop:hidden">EB</h1>
      <ul
        className="flex gap-5 text-subheader font-semibold mb-2"
        style={{ alignSelf: "flex-end" }}
      >
        {user && (
          <>
            <li className="custom-button">
              <NavLink to="/">Dashboard</NavLink>
            </li>
            <li className="custom-button">
              <NavLink to="/income">Income</NavLink>
            </li>
            <li className="custom-button">
              <NavLink to="/spending">Spending</NavLink>
            </li>
          </>
        )}
        <li className="custom-button">
          {!user ? (
            <button onClick={SignIn}>Sign In</button>
          ) : (
            <button className="flex gap-4" onClick={SignOut}>
              <p>Sign Out</p>
              <img
                src={user?.photoURL}
                alt="User"
                className="h-10 w-10 rounded-full my-auto"
              />
            </button>
          )}
        </li>
        {user && <li></li>}
      </ul>
    </nav>
  );
}

function MobileNavBar() {
  return <></>;
}
