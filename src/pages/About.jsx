// About 페이지 — 서비스 소개, 기획 의도, 사운드 에셋 출처
export default function About() {
  return (
    <div className="case-page">
      <div className="case-eyebrow">ABOUT</div>
      <h1 className="case-title">POPPIN ROOM</h1>
      <p className="case-sub">누르고, 터뜨리고, 모으는 나만의 오브제 룸</p>

      <section className="account-section">
        <h3 className="collection-section-title">이곳은</h3>
        <ul className="about-list">
          <li>손끝으로 누르고 터뜨리며 스트레스 푸는 디지털 토이 공간</li>
          <li>왁뿌볼 연타 파괴, 키캡 타건으로 코인 적립</li>
          <li>모은 코인으로 뽑기·상점에서 오브제 수집, 컬렉션 완성</li>
          <li>1조 그룹 프로젝트</li>
        </ul>
      </section>

      <section className="account-section">
        <h3 className="collection-section-title">기획 의도</h3>
        <ul className="about-list">
          <li>짧은 틈에 가볍게 누르고 터뜨리며 긴장 해소</li>
          <li>실물 피젯 토이의 손맛과 소리를 화면 속 오브제로 재현</li>
          <li>칠수록 쌓이는 코인, 뽑기와 수집으로 다시 찾게 되는 재미</li>
          <li>등급마다 다른 디자인·깨지는 연출·타격음으로 모으는 즐거움</li>
        </ul>
      </section>

      <section className="account-section">
        <h3 className="collection-section-title">사운드 출처</h3>
        <ul className="about-list">
          <li>
            효과음 원본: <a href="https://pixabay.com/sound-effects/" target="_blank" rel="noopener noreferrer">Pixabay</a>, 앱에 맞게 길이·음량 편집
          </li>
          <li>일부 효과음은 Web Audio API로 직접 합성</li>
        </ul>
      </section>
    </div>
  );
}
