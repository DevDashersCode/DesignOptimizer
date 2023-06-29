import { Outlet } from 'react-router-dom';
import Header from './Header';
import Nav from './Nav';

const Layout = () => {
  return (
    <div className="App">
      <Header title="Design Optimizer Tool" />
      <Nav />
      <Outlet />
    </div>
  );
};

export default Layout;
