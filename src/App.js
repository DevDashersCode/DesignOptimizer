import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import Upload from './components/Upload';

import './App.css';
function App() {
  localStorage.clear();
  return (
    <>
      {/* <div className="header">
        <img className="logo" src={CN_Logo} alt="cn_logo" />
        <h2>JSON Schema Validator and Generator</h2>
      </div> */}
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="generate-files" element={<Upload />} />
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
