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

function App() {
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

export default App;

function Root(props) {
  const { children } = props;
  return (
    <>
      <nav>
        <ul className="flex gap-5">
          <li>
            <NavLink to="/">Home</NavLink>
          </li>
          <li>
            <NavLink to="/about">About</NavLink>
          </li>
        </ul>
      </nav>
      <main>{children || <Outlet />}</main>
    </>
  );
}

// validate prop types
Root.propTypes = {
  children: PropTypes.node,
};
