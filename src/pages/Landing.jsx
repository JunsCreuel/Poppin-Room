// 랜딩 페이지 — 첫 화면, 6개 플레이 모드 카드로 각 기능 진입
import { Link, useNavigate } from 'react-router-dom';
import { useGame } from '../store/useGame';
import '../landing.css';

// 사용자가 로그인 창을 닫은 경우 — 실패 문구 안 띄움
const LOGIN_CANCEL_CODES = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request'];

// 입구 두 개 — 회원 로그인(구글, 계정별 저장) / 비회원 로그인(테스트 모드, 탭 닫으면 기록 삭제)
// 6개 카드는 어떤 모드가 있는지 보여주는 소개용, 눌러도 이동 안 함
// 하단 숫자 3칸 = 누적 깬 횟수 / 보유 오브제 수 / 히든카드 수
const FIRST_ROOM = '/wakpuball';

export default function Landing() {
  const { totalBreaks, owned, hiddenCards, requireLogin, authError, loggedIn, guestMode, startGuest } = useGame();
  const navigate = useNavigate();

  const startMember = async () => {
    if (await requireLogin()) navigate(FIRST_ROOM);
  };

  const startAsGuest = async () => {
    await startGuest();
    navigate(FIRST_ROOM);
  };

  // 상점 보기 — 이미 회원·비회원으로 들어와 있으면 바로, 아니면 회원 로그인부터
  const openShop = async (e) => {
    e.preventDefault();
    if (loggedIn || guestMode || (await requireLogin())) navigate('/shop');
  };

  // 페이지 내 섹션 이동 — HashRouter가 #앵커를 경로로 해석하므로 직접 스크롤
  const scrollTo = (id) => (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="landing">
      <section className="hero">
        <nav className="nav">
          <div className="logo">POPPIN ROOM</div>
          <div className="nav-menu">
            <a href="#play" onClick={scrollTo('play')}>PLAY</a>
            <a href="#collection" onClick={scrollTo('collection')}>COLLECTION</a>
            <a href="#shop" onClick={scrollTo('shop')}>SHOP</a>
            <Link to="/about">ABOUT</Link>
            <Link to="/account">내 프로필</Link>
          </div>
        </nav>

        <div className="hero-content">
          <div className="hero-text">
            <p className="tag">DIGITAL TOY COLLECTION</p>
            <h1>
              누르고,<br />
              터뜨리고,<br />
              모으는<br />
              나만의 오브제 룸.
            </h1>
            <p className="desc">
              포핀룸에서 왁뿌볼을 누르고, 키캡을 두드리고,
              랜덤 오브제를 뽑아 스트레스를 풀어보세요!
              시크릿 키를 찾아 실물 상품을 받아보세요!
            </p>

            <div className="buttons">
              <button type="button" className="btn pink" onClick={startMember}>회원 로그인</button>
              <button type="button" className="btn white" onClick={startAsGuest}>비회원 로그인</button>
            </div>
            <p className="entry-note">회원은 계정별로 기록 저장, 비회원은 테스트 모드로 사이트를 나가면 기록 삭제</p>
            {authError && !LOGIN_CANCEL_CODES.includes(authError) && (
              <p className="entry-note is-error">로그인 실패: {authError}</p>
            )}
          </div>

          <div className="phone-card">
            <div className="room-box">
              <div className="main-ball"><img src="images/wakpuball_02.png" alt="왁뿌볼" /></div>
              <div className="mini-item item1"><img src="images/keycap_07.png" alt="키캡" /></div>
              <div className="mini-item item2"><img src="images/wakpuball_watermelon.png" alt="왁뿌볼" /></div>
              <div className="mini-item item3"><img src="images/keycap_pudding.png" alt="키캡" /></div>
            </div>

            <div className="stats">
              <div>
                <strong>{totalBreaks}</strong>
                <span>왁뿌볼</span>
              </div>
              <div>
                <strong>{owned.length}</strong>
                <span>오브제</span>
              </div>
              <div>
                <strong>{hiddenCards.length}</strong>
                <span>시크릿</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="play" id="play">
        <p className="tag center">PLAY MODES</p>
        <h2>그냥 눌러. 모이면 끝.</h2>

        <div className="cards">
          <div className="card">
            <div className="emoji"><img src="images/wakpuball_02.png" alt="" /></div>
            <h3>왁뿌볼 누르기</h3>
            <p>왁뿌볼을 톡톡 누르고 코인을 모아요.</p>
          </div>

          <div className="card">
            <div className="emoji"><img src="images/keycap_01.png" alt="" /></div>
            <h3>탭키 타건</h3>
            <p>키캡을 두드리면서 사운드와 이펙트를 즐겨요.</p>
          </div>

          <div className="card">
            <div className="emoji"><img src="images/gacha_machine.png" alt="" /></div>
            <h3>랜덤 뽑기</h3>
            <p>랜덤 박스에서 새로운 오브제를 뽑아요.</p>
          </div>

          <div className="card">
            <div className="emoji"><img src="images/wakpuball_peach.png" alt="" /></div>
            <h3>컬렉션</h3>
            <p>모은 오브제 확인, 장착 가능</p>
          </div>

          <div className="card">
            <div className="emoji"><img src="images/hidden_keycap.png" alt="" /></div>
            <h3>시크릿 룸</h3>
            <p>조건을 달성하면 숨겨진 방이 열려요.</p>
          </div>

          <div className="card">
            <div className="emoji">🏆</div>
            <h3>상점 & 랭킹</h3>
            <p>아이템을 사고 친구들과 점수를 비교해요.</p>
          </div>
        </div>
      </section>

      <section className="collection" id="collection">
        <div>
          <p className="tag">COLLECTION</p>
          <h2>
            작은 오브제들이 모여<br />
            하나의 방이 됩니다.
          </h2>
          <p className="desc">
            매일 조금씩 누르고 모으다 보면,
            어느새 나만의 장난감 방이 완성됩니다.
          </p>
        </div>

        <div className="objects">
          <div><img src="images/wakpuball_grape.png" alt="왁뿌볼" /></div>
          <div><img src="images/keycap_lemon.png" alt="키캡" /></div>
          <div><img src="images/wakpuball_mango.png" alt="왁뿌볼" /></div>
          <div><img src="images/keycap_watermelon.png" alt="키캡" /></div>
          <div><img src="images/wakpuball_08.png" alt="왁뿌볼" /></div>
          <div><img src="images/keycap_banana.png" alt="키캡" /></div>
        </div>
      </section>

      <section className="shop" id="shop">
        <div>
          <p className="tag">SHOP</p>
          <h2>오늘의 상점</h2>
          <p className="desc">
            왁뿌볼, 키캡, 룸 데코, 시크릿 박스를 코인으로 구매하세요.
          </p>
        </div>
        <Link to="/shop" className="btn pink" onClick={openShop}>상점 보기</Link>
      </section>
    </main>
  );
}
