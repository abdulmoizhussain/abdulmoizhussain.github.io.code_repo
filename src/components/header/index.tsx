import GitHubSvg from '../github_svg';
import { Link } from 'react-router-dom';
import { AppRoute } from './../../common/constants';

export default () => (
  <nav className='navbar'>
    <a href="https://github.com/abdulmoizhussain" title="Abdul Moiz's Github Repositories" className='p-1 border border-primary'>
      My Github <GitHubSvg />
    </a>

    <Link to={AppRoute.HomePage} title="Home Page" className='ml-auto p-1 border border-primary'>
      <b>Home</b>
    </Link>
  </nav >
);
