import {
  BrowserRouter,
  Route,
  Routes,
  Outlet,
  NavLink,
} from "react-router-dom";
import PropTypes from "prop-types";

import Home from "./Home";
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
          <Route index element={<Home />} />
          <Route path="/about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function Root(props) {
  const { children } = props;
  return (
    <div className="text bg-black min-h-screen w-full">
      <nav className="h-20">
        <ul className="flex gap-5">
          <h1 className="">Easy Recipes</h1>
          <li>
            <NavLink to="/">Home</NavLink>
          </li>
          <li>
            <NavLink to="/about">About</NavLink>
          </li>
        </ul>
      </nav>
      <main>{children || <Outlet />}</main>

      <footer className="bg-black mx-auto h-20 w-fit flex flex-col gap-2">
        <div className="h-16"></div>
        <div className="flex gap-6">
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
