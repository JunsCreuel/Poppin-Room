import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// base: './' — GitHub Pages처럼 하위 경로에 배포돼도 동작하도록 상대 경로로 빌드
// (라우팅은 HashRouter라서 서버 설정 없이도 새로고침이 된다).
export default defineConfig({
  base: './',
  plugins: [react()],
})
