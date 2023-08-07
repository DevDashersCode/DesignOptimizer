import CN_Logo from '../images/CN_logo.png';
import acc_logo from '../images/acc.jpg';
import acc_logo_1 from '../images/acc1.png';

const Header = ({ title }) => {
  return (
    <header className="Header">
      <img className="logo" src={acc_logo_1} alt="cn_logo" />
      <h1>{title}</h1>
    </header>
  );
};

export default Header;
