import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import { GameProvider, useGame } from './store/useGame';
import Lab from './pages/Lab';
import Wakpuball from './pages/Wakpuball';
import Keycap from './pages/Keycap';
import Gacha from './pages/Gacha';
import Collection from './pages/Collection';
import Store from './pages/Store';
import MyAccount from './pages/MyAccount';
import Ranking from './pages/Ranking';

function NavBar() {
  const linkClass = ({ isActive }) => (isActive ? 'is-active' : '');
  const { coins, loggedIn } = useGame();
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
        <NavLink to="/store" className={linkClass}>스토어</NavLink>
        <NavLink to="/ranking" className={linkClass}>랭킹</NavLink>
        <span className="nav-coin-badge">🪙 {coins}</span>
        <NavLink to="/account" className={`nav-account-link ${linkClass({ isActive: false })}`}>
          {loggedIn ? '내 계정' : '로그인'}
        </NavLink>
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
            <Route path="/store" element={<Store />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/account" element={<MyAccount />} />
          </Routes>
        </div>
      </HashRouter>
    </GameProvider>
  );
}

export default App;
