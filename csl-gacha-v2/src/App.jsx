import { HashRouter, Routes, Route, NavLink, Navigate, Outlet } from 'react-router-dom';
import { GameProvider, useGame } from './store/useGame';
import Landing from './pages/Landing';
import Wakpuball from './pages/Wakpuball';
import Keycap from './pages/Keycap';
import HiddenWakpuball from './pages/HiddenWakpuball';
import HiddenKeycap from './pages/HiddenKeycap';
import Gacha from './pages/Gacha';
import Collection from './pages/Collection';
import Secret from './pages/Secret';
import Shop from './pages/Shop';
import MyAccount from './pages/MyAccount';

function NavBar() {
  const linkClass = ({ isActive }) => (isActive ? 'is-active' : '');
  const { coins, loggedIn } = useGame();
  return (
    <header className="case-header">
      <NavLink to="/" className="brand" end>
        <span className="dot" />
        POPPIN ROOM
      </NavLink>
      <nav>
        <NavLink to="/wakpuball" className={linkClass}>왁뿌볼</NavLink>
        <NavLink to="/keycap" className={linkClass}>키캡</NavLink>
        <NavLink to="/gacha" className={linkClass}>뽑기</NavLink>
        <NavLink to="/collection" className={linkClass}>컬렉션</NavLink>
        <NavLink to="/secret" className={linkClass}>시크릿</NavLink>
        <NavLink to="/shop" className={linkClass}>상점 & 랭킹</NavLink>
        <span className="nav-coin-badge">🪙 {coins}</span>
        <NavLink to="/account" className={`nav-account-link ${linkClass({ isActive: false })}`}>
          {loggedIn ? '내 계정' : '로그인'}
        </NavLink>
      </nav>
    </header>
  );
}

// 랜딩(/)은 자체 네비게이션을 가진 풀페이지라 앱 헤더 없이 그리고,
// 나머지 화면은 공통 헤더(case-shell) 아래에 그린다.
function AppLayout() {
  return (
    <div className="case-shell">
      <NavBar />
      <Outlet />
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route element={<AppLayout />}>
            <Route path="/wakpuball" element={<Wakpuball />} />
            <Route path="/hidden/wakpuball" element={<HiddenWakpuball />} />
            <Route path="/keycap" element={<Keycap />} />
            <Route path="/hidden/keycap" element={<HiddenKeycap />} />
            <Route path="/gacha" element={<Gacha />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/secret" element={<Secret />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/account" element={<MyAccount />} />
            {/* 예전 주소 호환 — 스토어/랭킹은 상점 & 랭킹으로, LAB 홈은 랜딩으로 */}
            <Route path="/store" element={<Navigate to="/shop" replace />} />
            <Route path="/ranking" element={<Navigate to="/shop" replace />} />
            <Route path="/lab" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </GameProvider>
  );
}

export default App;
