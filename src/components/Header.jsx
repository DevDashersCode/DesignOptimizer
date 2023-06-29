import CN_Logo from '../images/CN_logo.png';

const Header = ({ title }) => {
  return (
    <header className="Header">
      <img className="logo" src={CN_Logo} alt="cn_logo" />
      <h1>{title}</h1>
    </header>
  );
};

export default Header;
