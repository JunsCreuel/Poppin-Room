import { Link } from 'react-router-dom';
import { useGame } from '../store/useGame';
import '../landing.css';

// POPPIN ROOM 첫 화면 — poppin-room-landing-page/index.html 초안을 그대로
// 옮긴 것. 마크업·문구·스타일은 손대지 않았고, 링크만 앱의 실제 화면으로
// 연결했다(시작하기 → 왁뿌볼 룸, 컬렉션 보기 → 컬렉션, 상점 보기 → 상점 & 랭킹).
// 하단 통계 3칸은 초안의 고정 숫자 대신 실제 진행 상태를 보여준다.
export default function Landing() {
  const { totalBreaks, owned, hiddenCards } = useGame();

  return (
    <main className="landing">
      <section className="hero">
        <nav className="nav">
          <div className="logo">POPPIN ROOM</div>
          <div className="nav-menu">
            <a href="#play">PLAY</a>
            <a href="#collection">COLLECTION</a>
            <a href="#shop">SHOP</a>
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
              포핀룸은 팝볼을 누르고, 키캡을 두드리고,
              랜덤 오브제를 뽑아 나만의 장난감 방을 채우는 앱입니다.
            </p>

            <div className="buttons">
              <Link to="/wakpuball" className="btn pink">시작하기</Link>
              <Link to="/collection" className="btn white">컬렉션 보기</Link>
            </div>
          </div>

          <div className="phone-card">
            <div className="room-box">
              <div className="main-ball">POP!</div>
              <div className="mini-item item1">🍒</div>
              <div className="mini-item item2">⭐</div>
              <div className="mini-item item3">🧸</div>
            </div>

            <div className="stats">
              <div>
                <strong>{totalBreaks}</strong>
                <span>팝볼</span>
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
          <Link to="/wakpuball" className="card">
            <div className="emoji">🫧</div>
            <h3>팝볼 누르기</h3>
            <p>팝볼을 톡톡 누르고 코인을 모아요.</p>
          </Link>

          <Link to="/keycap" className="card">
            <div className="emoji">⌨️</div>
            <h3>탭키 타건</h3>
            <p>키캡을 두드리면서 사운드와 이펙트를 즐겨요.</p>
          </Link>

          <Link to="/gacha" className="card">
            <div className="emoji">🎁</div>
            <h3>랜덤 뽑기</h3>
            <p>랜덤 박스에서 새로운 오브제를 뽑아요.</p>
          </Link>

          <Link to="/collection" className="card">
            <div className="emoji">🧸</div>
            <h3>컬렉션</h3>
            <p>모은 장난감들을 내 방에 채워요.</p>
          </Link>

          <Link to="/secret" className="card">
            <div className="emoji">🚪</div>
            <h3>시크릿 룸</h3>
            <p>조건을 달성하면 숨겨진 방이 열려요.</p>
          </Link>

          <Link to="/shop" className="card">
            <div className="emoji">🏆</div>
            <h3>상점 & 랭킹</h3>
            <p>아이템을 사고 친구들과 점수를 비교해요.</p>
          </Link>
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
          <div>🍒</div>
          <div>🪩</div>
          <div>🐰</div>
          <div>🌈</div>
          <div>🍮</div>
          <div>💎</div>
        </div>
      </section>

      <section className="shop" id="shop">
        <div>
          <p className="tag">SHOP</p>
          <h2>오늘의 상점</h2>
          <p className="desc">
            팝볼, 키캡, 룸 데코, 시크릿 박스를 코인으로 구매하세요.
          </p>
        </div>
        <Link to="/shop" className="btn pink">상점 보기</Link>
      </section>
    </main>
  );
}
