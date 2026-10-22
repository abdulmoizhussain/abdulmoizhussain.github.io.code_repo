import {
  BrowserRouter as Router,
  Routes,
  Navigate,
  Route,
} from "react-router-dom";
import { AppRoute } from './../common/constants';
import HomePage from './../screens/home_page';
import RgbToHex from './../screens/rgb_to_hex';
import RenderMarkdown from './../screens/render_markdown';
import Counter from './../screens/counter';
import Percentage from "../screens/Percentage";
import Laundry from "../screens/Laundry";
import Header from '../components/header';

export default function () {
  return (
    <Router>
      <>
        <Header />
        {/* A <Routes> looks through its children <Route>s and */}
        {/* renders the first one that matches the current URL. */}
        <Routes>
          <Route /*exact*/ path={AppRoute.HomePage} element={<HomePage />} />
          <Route path={AppRoute.RgbToHex} element={<RgbToHex />} />
          <Route path={AppRoute.RenderMarkdown} element={<RenderMarkdown />} />
          <Route path={AppRoute.Counter} element={<Counter />} />
          <Route path={AppRoute.Percentage} element={<Percentage />} />
          <Route path={AppRoute.Laundry} element={<Laundry />} />
          {/* <Redirect from='*' to={AppRoute.HomePage} /> */}
          <Route path={"*"} element={<Navigate to={AppRoute.HomePage} />} />
        </Routes>
      </>
    </Router>
  );
}