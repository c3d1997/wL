## Why

PM 與 RD 團隊缺乏統一的內部協作工具，目前任務指派、會議記錄與分支進度分散在不同地方管理，效率低落。本變更建立 `pm-tool-api` 後端服務，提供核心 API 以支援會議記錄、任務管理、分支追蹤與通知功能。

## What Changes

- 建立 Express + Prisma + PostgreSQL 後端服務
- 實作手刻 JWT 認證（access token 15 分鐘、refresh token 7 天）
- 實作 role-based 權限控制（admin / pm / rd）
- 提供 Auth、Tasks、Meetings、Branches、Notifications、Admin 六大模組 API
- 任務指派與狀態更新時，自動建立站內通知並透過 Resend 寄送 Email

## Non-Goals

- 前端 Vue 3 介面（獨立 repo `pm-tool-web`，之後才開）
- 即時通訊（WebSocket / SSE）
- 檔案上傳功能
- 多租戶（multi-tenant）支援

## Capabilities

### New Capabilities

- `user-auth`: JWT 認證流程，包含 register、login、refresh token、logout，以及 auth middleware
- `role-access-control`: Role middleware 控制 admin / pm / rd 各角色的存取範圍
- `task-management`: 任務 CRUD，PM 可完整操作，RD 只能更新自己任務的 status
- `meeting-management`: 會議記錄 CRUD，以及從會議產生任務的功能
- `branch-tracking`: RD 建立與管理分支記錄，關聯至任務
- `notification-system`: 站內通知（任務指派、狀態更新），並透過 Resend 寄送 Email
- `admin-user-management`: Admin 管理帳號與角色

### Modified Capabilities

(none)

## Impact

- 影響的 API：全新服務，無現有 API 受影響
- 影響的程式碼：
  - `src/routes/` — auth, tasks, meetings, branches, notifications, admin 路由
  - `src/middleware/` — authMiddleware, roleMiddleware
  - `src/controllers/` — 各模組 controller
  - `src/lib/` — prisma client、jwt helper、resend helper
  - `prisma/schema.prisma` — User, Task, Meeting, Branch, Notification 資料模型
  - `index.js` — Express 入口
  - `.env` — 環境變數（DATABASE_URL, JWT_SECRET, RESEND_API_KEY 等）
- 外部依賴：PostgreSQL（Railway 部署）、Resend Email 服務
