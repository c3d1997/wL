## Why

後端 API（pm-tool-api）已完成並部署於 Railway，目前缺乏前端介面，PM 與 RD 無法透過瀏覽器操作任務指派、會議管理與分支追蹤等功能。本次建立 Vue 3 前端應用程式（pm-tool-web），提供完整的 Web UI。

## What Changes

- 新增獨立前端專案 `pm-tool-web`（Vue 3 + Composition API + SCSS）
- 實作登入 / 登出頁面，整合 JWT 雙 Token 認證流程
- 實作任務列表與建立/編輯頁面（PM 看全部、RD 看自己的）
- 實作會議列表與詳情頁面（PM 可建立/編輯/刪除，含批次建任務）
- 實作分支管理頁面（RD 專用）
- 實作通知中心（站內通知列表、標記已讀）
- 實作 Admin 後台（使用者管理：建立帳號、修改角色）
- 依角色（admin / pm / rd）控制前端路由存取與 UI 元素顯示

## Non-Goals

- 不實作 WebSocket 即時推送（通知須手動刷新）
- 不實作檔案上傳 / 附件功能
- 不實作深色模式
- 不實作分頁（與後端一致，初期略過）
- 不包含單元測試或 E2E 測試

## Capabilities

### New Capabilities

- `fe-auth`: 登入/登出、JWT token 管理、自動 refresh、路由守衛
- `fe-task-management`: 任務列表、建立、編輯、刪除（依角色過濾）
- `fe-meeting-management`: 會議列表、詳情、建立、編輯、刪除、批次建任務
- `fe-branch-tracking`: 分支列表、建立、編輯、刪除（RD 專用）
- `fe-notification`: 通知列表、標記單筆/全部已讀
- `fe-admin`: 使用者列表、建立帳號、修改角色（Admin 專用）

### Modified Capabilities

（無）

## Impact

- 新增專案目錄：`pm-tool-web/`
- 技術棧：Vue 3、Vite、Vue Router、Pinia、Axios、SCSS
- 消費 API：`https://wl-production-13e9.up.railway.app`
- 部署目標：Vercel（靜態前端）
