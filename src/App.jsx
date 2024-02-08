import {
  BrowserRouter,
  Route,
  Routes,
  Outlet,
  NavLink,
} from "react-router-dom";
import PropTypes from "prop-types";

import Dashboard from "./Dashboard";
import About from "./About";

// icons
import { SiGithub as GitHubLogo } from "react-icons/si";
import { FaLinkedinIn as LinkedLogo } from "react-icons/fa";
import { IoIosMail as MailLogo } from "react-icons/io";
import { IoPersonCircleSharp as AboutLogo } from "react-icons/io5";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Root />} caseSensitive={true}>
          <Route index element={<Dashboard />} />
          <Route path="/about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function Root(props) {
  const { children } = props;

  return (
    <div className="text min-h-screen w-full">
      <nav className="h-20 bg-black px-20">
        <ul className="flex gap-5">
          <h1 className="">Easy Recipes</h1>
          <li>
            <NavLink to="/">Dashboard</NavLink>
          </li>
          <li>
            <NavLink to="/about">About</NavLink>
          </li>
        </ul>
      </nav>

      <div
        className="bg h-full flex-grow px-20"
        style={{ minHeight: "calc(100vh - 17.5rem)" }}
      >
        <main>{children || <Outlet />}</main>
      </div>

      <footer className="bg-black px-20 h-[12.5rem] flex justify-around flex-col">
        <div className="flex flex-col gap-2">
          <div className="flex gap-6 w-fit mx-auto">
            <OutsideLink link="https://www.github.com/pdxgrantc">
              <GitHubLogo className="h-[4rem] w-auto py-2 mx--auto text-button hover:text-button_hover" />
            </OutsideLink>
            <OutsideLink link="mailto:pdxgrantc@gmail.com">
              <MailLogo className="h-[4rem] py-0 w-auto text-button hover:text-button_hover" />
            </OutsideLink>
            <OutsideLink link="https://pdxgrantc.com/">
              <AboutLogo className="h-[3.5rem] w-auto text-button hover:text-button_hover" />
            </OutsideLink>
            <OutsideLink link="https://www.linkedin.com/in/pdxgrantc">
              <LinkedLogo className="h-[3.5rem] w-auto text-button hover:text-button_hover" />
            </OutsideLink>
          </div>
          <p className="mx-auto">Grant Conklin - 2024</p>
        </div>
      </footer>
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
