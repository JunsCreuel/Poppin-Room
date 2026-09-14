import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import { GameProvider } from './store/useGame';
import Lab from './pages/Lab';
import Wakpuball from './pages/Wakpuball';
import Keycap from './pages/Keycap';
import Gacha from './pages/Gacha';
import Collection from './pages/Collection';

function NavBar() {
  const linkClass = ({ isActive }) => (isActive ? 'is-active' : '');
  return (
    <header className="case-header">
      <NavLink to="/" className="brand" end>
        <span className="dot" />
        CSL // LAB
      </NavLink>
      <nav>
        <NavLink to="/" className={linkClass} end>LAB</NavLink>
        <NavLink to="/wakpuball" className={linkClass}>왁뿌볼</NavLink>
        <NavLink to="/keycap" className={linkClass}>키캡</NavLink>
        <NavLink to="/gacha" className={linkClass}>뽑기</NavLink>
        <NavLink to="/collection" className={linkClass}>컬렉션</NavLink>
      </nav>
    </header>
  );
}

function App() {
  return (
    <GameProvider>
      <HashRouter>
        <div className="case-shell">
          <NavBar />
          <Routes>
            <Route path="/" element={<Lab />} />
            <Route path="/wakpuball" element={<Wakpuball />} />
            <Route path="/keycap" element={<Keycap />} />
            <Route path="/gacha" element={<Gacha />} />
            <Route path="/collection" element={<Collection />} />
          </Routes>
        </div>
      </HashRouter>
    </GameProvider>
  );
}

export default App;
