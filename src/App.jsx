// 라우팅 — 랜딩(/)과 공통 헤더가 붙는 앱 화면들을 연결
import { useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
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
        <NavLink to="/wakpuball" className={linkClass}>팝볼</NavLink>
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

// 화면 전환 시 스크롤 맨 위로
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// 공통 헤더 레이아웃 — 랜딩(/)을 제외한 모든 화면에 적용
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
        <ScrollToTop />
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
            {/* 옛 주소 리다이렉트 */}
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
