import { useRef, useState, useEffect } from 'react';

// 컬렉션 "내 방" — 놓인 오브제를 드래그해서 방 안 원하는 위치로 옮기는
// 무대. 위치는 방 크기 기준 % 좌표(중심점)라 화면 크기가 바뀌어도 상대
// 위치가 유지된다. 마우스·터치 모두 포인터 이벤트 하나로 처리한다.
// 드래그 중엔 로컬 상태로만 움직이고, 손을 떼는 순간 onMove로 저장한다.
const ITEM_SIZE = 72; // px — CSS .room-item 크기와 맞출 것
const CLICK_MOVE_THRESHOLD = 4; // px — 이보다 덜 움직이면 클릭으로 본다

export default function RoomStage({ items, findToy, onMove, onRemove, maxItems }) {
  const stageRef = useRef(null);
  const dragRef = useRef(null); // { id, offX, offY, startX, startY, moved }
  const [dragPos, setDragPos] = useState(null); // { id, x, y } 드래그 중 임시 위치

  // 방 밖으로 못 나가게 — 오브제 절반 크기만큼 안쪽으로 제한.
  const clampToStage = (px, py, rect) => {
    const halfW = (ITEM_SIZE / 2 / rect.width) * 100;
    const halfH = (ITEM_SIZE / 2 / rect.height) * 100;
    const x = Math.min(100 - halfW, Math.max(halfW, (px / rect.width) * 100));
    const y = Math.min(100 - halfH, Math.max(halfH, (py / rect.height) * 100));
    return { x, y };
  };

  const handlePointerDown = (e, item) => {
    if (e.button !== undefined && e.button !== 0) return;
    const rect = stageRef.current.getBoundingClientRect();
    const centerX = (item.x / 100) * rect.width;
    const centerY = (item.y / 100) * rect.height;
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    dragRef.current = {
      id: item.id,
      offX: px - centerX,
      offY: py - centerY,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragPos({ id: item.id, x: item.x, y: item.y });
  };

  const handlePointerMove = (e) => {
    const d = dragRef.current;
    if (!d) return;
    if (Math.abs(e.clientX - d.startX) > CLICK_MOVE_THRESHOLD || Math.abs(e.clientY - d.startY) > CLICK_MOVE_THRESHOLD) {
      d.moved = true;
    }
    const rect = stageRef.current.getBoundingClientRect();
    const { x, y } = clampToStage(e.clientX - rect.left - d.offX, e.clientY - rect.top - d.offY, rect);
    setDragPos({ id: d.id, x, y });
  };

  const handlePointerUp = (e) => {
    const d = dragRef.current;
    if (!d) return;
    dragRef.current = null;
    if (d.moved) {
      const rect = stageRef.current.getBoundingClientRect();
      const { x, y } = clampToStage(e.clientX - rect.left - d.offX, e.clientY - rect.top - d.offY, rect);
      onMove(d.id, x, y);
    }
    setDragPos(null);
  };

  // 컴포넌트가 사라질 때 드래그 상태 정리.
  useEffect(() => () => { dragRef.current = null; }, []);

  return (
    <div className="room-stage">
      <div className="room-canvas" ref={stageRef}>
        {items.length === 0 && (
          <div className="room-empty-hint">가방에서 오브제 선택 → "방에 놓기", 놓인 오브제는 드래그로 이동</div>
        )}
        {items.map((item) => {
          const toy = findToy(item.id);
          if (!toy) return null;
          const isDragging = dragPos?.id === item.id;
          const pos = isDragging ? dragPos : item;
          return (
            <div
              key={item.id}
              className={`room-item ${isDragging ? 'is-dragging' : ''}`}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              onPointerDown={(e) => handlePointerDown(e, item)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              title={`${toy.name} · 드래그로 이동`}
              role="img"
              aria-label={toy.name}
            >
              <img src={toy.image} alt="" draggable={false} style={{ filter: toy.filter }} className={toy.isHolo ? 'is-holo' : ''} />
              <button
                type="button"
                className="room-item-remove"
                aria-label={`${toy.name} 가방으로 회수`}
                title="가방으로 회수"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => onRemove(item.id)}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
      <div className="room-foot">
        <span>방에 놓인 오브제 {items.length} / {maxItems}</span>
        <span>드래그로 위치 이동 · × 버튼으로 가방 회수</span>
      </div>
    </div>
  );
}
