// 라우팅 — 랜딩(/)과 공통 헤더가 붙는 앱 화면들을 연결
import { useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { GameProvider, useGame } from './store/useGame';
import { installAudioUnlock } from './utils/sound';
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
import About from './pages/About';

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
        <NavLink to="/about" className={linkClass}>About</NavLink>
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

// 게임 화면은 로그인해야 이용 가능 — 비로그인이면 내 프로필(로그인 화면)로 보내고,
// 로그인하면 원래 가려던 화면으로 돌아오도록 경로를 넘겨줌
function RequireLogin() {
  const { authReady, loggedIn } = useGame();
  const location = useLocation();
  // 새로고침 직후엔 저장된 로그인 복원 전이라, 확인 끝날 때까지 기다림(로그인된 사람이 튕기지 않게)
  if (!authReady) return <div className="account-loading-overlay">로그인 확인 중</div>;
  if (!loggedIn) return <Navigate to="/account" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

function App() {
  // 모바일: 첫 탭에서 오디오 세션을 깨워둠(iOS 무음 스위치 무시, 첫 소리 묵음 방지)
  useEffect(() => installAudioUnlock(), []);

  return (
    <GameProvider>
      <HashRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route element={<AppLayout />}>
            <Route element={<RequireLogin />}>
              <Route path="/wakpuball" element={<Wakpuball />} />
              <Route path="/keycap" element={<Keycap />} />
              <Route path="/hidden/wakpuball" element={<HiddenWakpuball />} />
              <Route path="/hidden/keycap" element={<HiddenKeycap />} />
              <Route path="/gacha" element={<Gacha />} />
              <Route path="/collection" element={<Collection />} />
              <Route path="/secret" element={<Secret />} />
              <Route path="/shop" element={<Shop />} />
            </Route>
            <Route path="/account" element={<MyAccount />} />
            <Route path="/about" element={<About />} />
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
