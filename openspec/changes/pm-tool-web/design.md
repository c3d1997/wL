## Context

pm-tool-api 已完成並部署於 Railway，提供完整的 REST API。前端 pm-tool-web 為全新建立的 Vue 3 SPA，透過 Axios 消費後端 API，部署於 Vercel。

技術限制：
- 語言：JavaScript（不使用 TypeScript）
- 框架：Vue 3 + Composition API
- 樣式：SCSS（BEM 命名或 Tailwind utility classes）
- 不使用 WebSocket

## Goals / Non-Goals

**Goals:**

- 提供完整的 Web UI 供 PM、RD、Admin 使用
- 依角色控制路由存取與介面元素顯示
- 整合 JWT 雙 Token 認證，支援 access token 自動 refresh
- 部署至 Vercel，可公開存取

**Non-Goals:**

- 不實作 WebSocket 即時推送
- 不實作檔案上傳
- 不實作深色模式
- 不實作分頁
- 不包含自動化測試

## Decisions

### 專案初始化方式

**決策**：使用 `npm create vue@latest` 建立專案，選擇 Vue Router、Pinia，不選 TypeScript。

**理由**：官方 scaffolding 工具，整合 Vue Router 與 Pinia 最省力。

### 狀態管理

**決策**：使用 Pinia，建立 `useAuthStore`、`useTaskStore`、`useMeetingStore`、`useBranchStore`、`useNotificationStore`。

**理由**：Vue 3 官方推薦，Composition API 風格，比 Vuex 更直覺。

**替代方案**：純 Composables 管理狀態 — 被拒絕，跨元件共享時易造成狀態不同步。

### HTTP Client 與 Token 管理

**決策**：建立 `src/lib/apiClient.js`，封裝 Axios instance，設定：
- `baseURL` 指向後端 API
- request interceptor：自動帶入 `Authorization: Bearer <accessToken>`
- response interceptor：遇到 401 時自動呼叫 `/auth/refresh` 換取新 token，重試原請求；refresh 失敗時清除 auth state 並跳回登入頁

**理由**：集中管理 token，各頁面不需要手動處理 refresh 邏輯。

**替代方案**：各頁面自行處理 token 過期 — 被拒絕，重複邏輯且容易遺漏。

### 路由守衛與角色控制

**決策**：在 `router/index.js` 使用 `router.beforeEach` 全域守衛，搭配路由 meta 欄位（`requiresAuth`、`roles`）控制存取。未登入導向 `/login`，無權限導向 `/403`。

**角色對應路由：**
| 路由 | 允許角色 |
|---|---|
| `/tasks` | admin, pm, rd |
| `/meetings` | admin, pm, rd |
| `/branches` | rd |
| `/admin` | admin |

**理由**：宣告式權限控制，路由檔即為權限文件。

### Token 儲存位置

**決策**：`accessToken` 存於 Pinia store（memory），`refreshToken` 存於 `localStorage`。

**理由**：accessToken 短效（15 分鐘），memory 存放可降低 XSS 風險；refreshToken 需跨頁面 / 重新整理後保留，localStorage 是合理選擇。

### 目錄結構

```
pm-tool-web/
  src/
    assets/          # 靜態資源、全域 SCSS
    components/      # 共用元件（AppHeader、NotificationBell 等）
    views/           # 頁面元件（對應路由）
      auth/          # LoginView
      tasks/         # TaskListView、TaskFormView
      meetings/      # MeetingListView、MeetingDetailView
      branches/      # BranchListView
      notifications/ # NotificationListView
      admin/         # AdminUserListView
    stores/          # Pinia stores
    router/          # Vue Router
    lib/             # apiClient.js
  .env.local         # VITE_API_BASE_URL
```

## Risks / Trade-offs

- **[Risk] Token 儲存於 localStorage 有 XSS 風險** → refreshToken 若被竊取可延長存取時間。緩解：確保不 eval 任何外部輸入，後端 refreshToken 黑名單機制可撤銷。
- **[Risk] access token 在 memory，重新整理後消失** → 頁面重整時需用 refreshToken 換取新 accessToken，初始化流程需處理此情況。緩解：`App.vue` mounted 時若無 accessToken 但有 refreshToken，自動呼叫 refresh。
- **[Trade-off] 無分頁** → 資料量大時效能下降。緩解：初期內部工具，使用者少，可接受。
