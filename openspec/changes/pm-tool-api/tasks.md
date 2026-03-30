## 1. 環境建置

- [x] 1.1 初始化 `pm-tool-api` Node.js 專案：`npm init -y`，安裝 express、prisma、@prisma/client、bcrypt、jsonwebtoken、dotenv、resend 等依賴
- [x] 1.2 建立專案目錄結構：`src/routes/`、`src/middleware/`、`src/controllers/`、`src/lib/`、`prisma/`
- [x] 1.3 建立 `index.js` Express 入口，掛載 JSON body parser、路由，設定 PORT 從 `.env` 讀取
- [x] 1.4 建立 `.env` 範本（`.env.example`），定義 `DATABASE_URL`、`JWT_SECRET`、`JWT_REFRESH_SECRET`、`RESEND_API_KEY`、`PORT`
- [x] 1.5 依照資料庫 ORM 選擇（Prisma）初始化：`npx prisma init`，建立 `prisma/schema.prisma`，定義 User、Task、Meeting、Branch、Notification、RefreshTokenBlacklist 資料模型及所有 enum（Role、TaskStatus、BranchType、NotificationType）
- [x] 1.6 建立 `src/lib/prismaClient.js`：匯出 singleton PrismaClient 實例
- [x] 1.7 執行 `npx prisma migrate dev --name init` 建立初始 migration
- [x] 1.8 部署至 Railway：建立 Railway 專案，加入 PostgreSQL add-on，設定環境變數，確認服務啟動正常

## 2. Auth — JWT 雙 Token 策略

- [ ] 2.1 建立 `src/lib/jwtHelper.js`：實作 `signAccessToken(userId, role)`（15 分鐘有效）、`signRefreshToken(userId)`（7 天有效）、`verifyAccessToken(token)`、`verifyRefreshToken(token)` 四個函式
- [ ] 2.2 建立 `src/middleware/authMiddleware.js`：驗證 `Authorization: Bearer <token>` header，將 `{ id, role }` 掛到 `req.user`；token 無效或缺少時回傳 HTTP 401（Auth Middleware）
- [ ] 2.3 建立 `src/controllers/authController.js` — 實作 User Registration：接收 `name`、`email`、`password`，bcrypt hash 密碼（cost 10），建立 User（role 預設 rd），回傳 HTTP 201（排除 passwordHash）；email 重複回傳 HTTP 409
- [ ] 2.4 實作 User Login：驗證 email/password，成功回傳 `{ accessToken, refreshToken, user }`（HTTP 200）；失敗回傳 HTTP 401 generic 訊息
- [ ] 2.5 實作 Token Refresh：驗證 refresh token 未在黑名單且未過期，發行新 access token（HTTP 200）；無效時 HTTP 401
- [ ] 2.6 實作 Logout：將 refresh token 加入 `RefreshTokenBlacklist` 資料表（儲存 token hash 與 `invalidatedAt`），回傳 HTTP 204
- [ ] 2.7 建立 `src/routes/authRoutes.js`：掛載 POST /auth/register、/auth/login（不需 auth middleware）；POST /auth/refresh、/auth/logout（需 auth middleware）

## 3. Role-Based Access Control

- [ ] 3.1 依照 Role-Based Access Control 實作決策，建立 `src/middleware/roleMiddleware.js`：實作 `requireRole(...roles)` middleware factory，比對 `req.user.role`；不在允許清單內回傳 HTTP 403（Role Middleware）
- [ ] 3.2 在 tasks 路由套用 role middleware：`POST /tasks` 與 `DELETE /tasks/:id` 使用 `requireRole('pm', 'admin')`（PM-Only Routes）
- [ ] 3.3 在 meetings 路由套用 role middleware：`POST`、`PATCH`、`DELETE`、`POST /:id/tasks` 使用 `requireRole('pm', 'admin')`
- [ ] 3.4 在 branches 路由套用 role middleware：`POST`、`PATCH`、`DELETE` 使用 `requireRole('rd')`
- [ ] 3.5 在 admin 路由套用 role middleware：所有 `/admin/*` 使用 `requireRole('admin')`（Admin-Only Routes）

## 4. Tasks CRUD

- [ ] 4.1 建立 `src/controllers/taskController.js` — 實作 List Tasks：PM 回傳全部任務，RD 只回傳 `assigneeId === req.user.id` 的任務；include assignee（id, name, email）與 meeting（id, title）（List Tasks、RD-Scoped Task Access）
- [ ] 4.2 依照通知觸發時機與方式決策，實作 Create Task：驗證 `title`、`assigneeId` 必填，確認 assigneeId 存在；設定 `creatorId = req.user.id`、`status = pending`；同步建立 Notification，非同步呼叫 Resend Email（fire-and-forget）；回傳 HTTP 201（Create Task、Automatic Notification Creation on Task Assignment）
- [ ] 4.3 建立 `src/lib/resendHelper.js`：封裝 Resend SDK，提供 `sendEmail({ to, subject, html })` 函式；失敗時 `console.error` 並不拋出錯誤
- [ ] 4.4 實作 Update Task：PM 可更新所有欄位（title, description, status, assigneeId, dueDate）；RD 只能更新 status（且只能操作自己的任務，否則 HTTP 403）；`status` 變更時建立 task_updated Notification 給 creator，非同步寄 Email；`assigneeId` 變更時建立 task_assigned Notification 給新 assignee；不存在回傳 HTTP 404（Update Task、RD-Scoped Task Access、Automatic Notification on Task Status Update）
- [ ] 4.5 實作 Delete Task：PM only，cascade 刪除相關 Branch 與 Notification；不存在回傳 HTTP 404；成功 HTTP 204（Delete Task）
- [ ] 4.6 建立 `src/routes/taskRoutes.js`：掛載 GET、POST /tasks；PATCH、DELETE /tasks/:id，套用 authMiddleware 與對應 roleMiddleware

## 5. Meetings CRUD

- [ ] 5.1 建立 `src/controllers/meetingController.js` — 實作 List Meetings：所有認證使用者可存取，include createdBy（id, name）；回傳 HTTP 200（List Meetings）
- [ ] 5.2 實作 Create Meeting：驗證 `title`、`meetingDate`、`content` 必填；設定 `createdById = req.user.id`；回傳 HTTP 201（Create Meeting）
- [ ] 5.3 實作 Get Single Meeting：include 所有欄位 + tasks 陣列（id, title, status, assignee id/name）；不存在回傳 HTTP 404（Get Single Meeting）
- [ ] 5.4 實作 Update Meeting：可更新 `title`、`meetingDate`、`content`；不存在回傳 HTTP 404（Update Meeting）
- [ ] 5.5 實作 Delete Meeting：刪除 Meeting，將關聯 Task 的 `meetingId` 設為 null（不刪除任務）；不存在回傳 HTTP 404；成功 HTTP 204（Delete Meeting）
- [ ] 5.6 實作 Generate Tasks from Meeting：接收 `tasks` 陣列（至少一個，否則 HTTP 400）；每筆任務設定 `meetingId`、`creatorId`；批次建立任務與 Notification；非同步寄 Email；meeting 不存在回傳 HTTP 404（Generate Tasks from Meeting）
- [ ] 5.7 建立 `src/routes/meetingRoutes.js`：掛載所有 meetings 路由，套用 authMiddleware 與 roleMiddleware

## 6. Branches 管理

- [ ] 6.1 建立 `src/controllers/branchController.js` — 實作 List Branches：只回傳 `createdById === req.user.id` 的分支，include task（id, title, status）（List Branches）
- [ ] 6.2 實作 Create Branch：驗證 `name`、`type`（BranchType enum）、`taskId` 必填；確認 taskId 存在（否則 HTTP 400）；設定 `createdById = req.user.id`；回傳 HTTP 201（Create Branch）
- [ ] 6.3 實作 Update Branch：可更新 `name`、`type`；確認 `createdById === req.user.id`（否則 HTTP 403）；不存在回傳 HTTP 404（Update Branch、RD-Scoped Branch Access）
- [ ] 6.4 實作 Delete Branch：確認 `createdById === req.user.id`（否則 HTTP 403）；不存在回傳 HTTP 404；成功 HTTP 204（Delete Branch、RD-Scoped Branch Access）
- [ ] 6.5 建立 `src/routes/branchRoutes.js`：掛載所有 branches 路由，套用 authMiddleware 與 `requireRole('rd')`

## 7. Notification 系統

- [ ] 7.1 建立 `src/controllers/notificationController.js` — 實作 List Notifications：只回傳 `userId === req.user.id` 的通知，按 `createdAt` 降序排列（List Notifications）
- [ ] 7.2 實作 Mark Single Notification as Read：確認通知屬於 req.user（否則 HTTP 403）；不存在回傳 HTTP 404；更新 `isRead = true`，回傳 HTTP 200（Mark Single Notification as Read）
- [ ] 7.3 實作 Mark All Notifications as Read：批次更新 `userId === req.user.id` 的所有通知 `isRead = true`；回傳 HTTP 200 with `{ count: N }`（Mark All Notifications as Read）
- [ ] 7.4 建立 `src/routes/notificationRoutes.js`：掛載 GET /notifications；PATCH /notifications/:id/read；PATCH /notifications/read-all，套用 authMiddleware

## 8. Admin 功能

- [ ] 8.1 建立 `src/controllers/adminController.js` — 實作 List All Users：回傳所有 User 記錄（排除 passwordHash）（List All Users）
- [ ] 8.2 實作 Create User Account：驗證 `name`、`email`、`password`、`role` 必填；role 須為 Role enum；bcrypt hash 密碼（cost 10）；email 重複回傳 HTTP 409；回傳 HTTP 201（Create User Account）
- [ ] 8.3 實作 Update User Role：驗證 `role` 為 Role enum（否則 HTTP 400）；user 不存在回傳 HTTP 404；更新角色回傳 HTTP 200（Update User Role）
- [ ] 8.4 建立 `src/routes/adminRoutes.js`：掛載所有 /admin/* 路由，套用 authMiddleware 與 `requireRole('admin')`

## 9. 整合與驗證

- [ ] 9.1 在 `index.js` 掛載所有路由：`/auth`、`/tasks`、`/meetings`、`/branches`、`/notifications`、`/admin`
- [ ] 9.2 新增全域錯誤處理 middleware：catch 未處理錯誤，回傳 HTTP 500 with 繁體中文錯誤訊息
- [ ] 9.3 使用 Postman 或 curl 手動測試完整 Auth 流程（register → login → refresh → logout）
- [ ] 9.4 手動測試 Tasks 角色權限：PM 建立任務、RD 更新 status、RD 嘗試刪除任務（應 403）
- [ ] 9.5 手動測試 Notification 自動建立：建立任務後確認通知記錄存在、Email 非同步呼叫觸發
- [ ] 9.6 確認 Railway 生產環境環境變數設定完整，`prisma migrate deploy` 執行成功
- [ ] 9.7 記錄 Refresh Token 黑名單清理策略：確認 `RefreshTokenBlacklist` 表初期不自動清理，待資料增長後再加入定期清理 job（Refresh Token 黑名單清理）
