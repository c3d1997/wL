## Context

pm-tool-api 是全新建立的後端服務，供 PM 與 RD 內部協作使用。目前團隊無統一工具，任務指派與會議記錄流程分散。本設計文件說明後端架構決策，前端（pm-tool-web）為獨立 repo，不在本次範圍內。

技術限制：
- 語言：JavaScript（不使用 TypeScript）
- 部署平台：Railway（支援 PostgreSQL add-on）
- Email 服務：Resend（免費額度足夠初期使用）

## Goals / Non-Goals

**Goals:**

- 建立可在 Railway 部署的 Express REST API
- 實作 JWT 雙 token（access + refresh）認證機制
- 實作三角色（admin / pm / rd）權限控制
- 提供 Tasks、Meetings、Branches、Notifications、Admin 五大業務模組
- 任務事件（指派、狀態更新）觸發站內通知與 Email

**Non-Goals:**

- 前端 Vue 3 介面
- WebSocket 即時推送
- 檔案上傳 / 附件功能
- 分頁（pagination）— 初期資料量小，可後續加入
- Rate limiting — 初期內部工具，後續視需求加入

## Decisions

### JWT 雙 Token 策略

**決策**：access token 有效期 15 分鐘，refresh token 7 天，儲存方式由客戶端管理（Bearer header）。

**理由**：短效 access token 降低 token 洩漏風險；refresh token 提供無感刷新體驗。不使用 cookie-based session 以保持 API stateless，方便前端 SPA 消費。

**替代方案**：單一長效 token — 被拒絕，因為 token 洩漏後無法及時撤銷。

**Refresh Token 撤銷**：logout 時，refresh token 加入 DB 黑名單（`refreshTokens` 資料表儲存已撤銷的 token hash）或直接標記 `invalidatedAt`。初期使用 DB 黑名單方案。

### Role-Based Access Control 實作

**決策**：使用 middleware 函式 `requireRole(...roles)` 掛在路由層，而非在 controller 內判斷。

**理由**：路由層宣告式權限控制，讓 `routes/` 檔案即為權限文件，降低 controller 複雜度。

**替代方案**：在每個 controller 手動判斷 `req.user.role` — 被拒絕，因為散落各處難以維護。

### 資料庫 ORM 選擇

**決策**：使用 Prisma（type-safe query builder）。

**理由**：`schema.prisma` 作為 single source of truth，migration 流程清晰，Railway 上部署友善。JavaScript 環境下 Prisma 自動補全與錯誤提示優於 Knex。

### 通知觸發時機與方式

**決策**：任務指派（POST /tasks）與狀態更新（PATCH /tasks/:id）發生時，在同一個 request 內同步建立 Notification 記錄，並非同步呼叫 Resend 寄送 Email（fire-and-forget，不阻塞主流程）。

**理由**：站內通知需要即時可見；Email 延遲幾秒不影響使用者體驗，非同步寄送避免 Resend API 延遲拖慢任務操作。

**替代方案**：Job queue（BullMQ）— 被拒絕，初期規模不需要，增加複雜度。

### 目錄結構

```
pm-tool-api/
  src/
    routes/        # 路由定義（掛載 middleware 與 controller）
    middleware/    # authMiddleware, requireRole
    controllers/   # 業務邏輯（每個模組一個 controller 檔案）
    lib/           # prismaClient.js, jwtHelper.js, resendHelper.js
  prisma/
    schema.prisma
  .env
  index.js
```

**理由**：扁平、單一職責。routes 只宣告路徑與權限，controllers 處理業務邏輯，lib 封裝第三方整合。

### Refresh Token 黑名單清理

**決策**：不自動清理過期黑名單。初期資料量小，待未來資料增長後再加定期清理 job。

## Risks / Trade-offs

- **[Risk] Refresh Token 黑名單增長** → 目前不清理過期記錄，長期會造成 DB 膨脹。緩解：未來加入定期清理 cron job（清除 `invalidatedAt` 超過 7 天的記錄）。
- **[Risk] 非同步 Email 失敗無重試** → Resend 寄送失敗只記 `console.error`，不會重試。緩解：初期接受，未來可引入 job queue。
- **[Trade-off] 無分頁** → 大量任務時效能下降。緩解：初期內部工具，使用者少，可接受。
- **[Risk] JWT Secret 洩漏** → access token 無法主動撤銷（只能等 15 分鐘過期）。緩解：短效 token + refresh token 黑名單機制已降低影響範圍。
