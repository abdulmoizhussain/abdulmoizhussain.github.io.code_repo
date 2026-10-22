import { Link } from "react-router-dom";
import { AppRoute } from './../../common/constants';
import YouTubeUrlConverter from '../../components/you_tube_url_converter';
import GithubUrlConverter from '../../components/github_url_converter/index';
import MakeTextSearchable from '../../components/make_text_searchable';
import { forceUpdateServiceWorker } from '../../common/utils/service-worker';
import './app.css';

export default () => {
  let forceUpdateLastClickTime = new Date().getTime();

  function onForceUpdate() {
    if ((new Date().getTime() - forceUpdateLastClickTime) < 300) {
      if (window.confirm("Are you sure you want to force refresh?")) {
        forceUpdateServiceWorker();
      }
    }
    else {
      forceUpdateLastClickTime = new Date().getTime();
    }
  }

  return <div className="container-fluid font-lg text-center p-0 h-100">
    <button
      title="Double click for force-refresh to update this website with latest features."
      className="btn btn-sm btn-dark mt-1"
      onClick={onForceUpdate}
    >ForceUpdateSite</button>

    <div className="row p-0 m-0 mt-5">
      <div className="col p-0 m-0">

        <ul className='list-unstyled'>
          <UtilPageLink to={AppRoute.RgbToHex} text={"RGB-Hex"} />
          <UtilPageLink to={AppRoute.RenderMarkdown} text={"Render Markdown"} />
          <UtilPageLink to={AppRoute.Counter} text={"Counter"} />
          <UtilPageLink to={AppRoute.Percentage} text={"Percentage"} />
          <UtilPageLink to={AppRoute.Laundry} text={"Laundry"} />
          <li className="row m-0 mt-3"><MakeTextSearchable /></li>
          <li className="row m-0 mt-3"><GithubUrlConverter /></li>
          <li className="row m-0 mt-3"><YouTubeUrlConverter /></li>
        </ul>

      </div>
    </div>
  </div>;
};

function UtilPageLink(props: any) {
  return <li className="row mt-1 p-2">
    <div className="col p-0">
      <Link className='app_link border border-info p-1' to={props.to}>{props.text}</Link>
    </div>
  </li>;
}
