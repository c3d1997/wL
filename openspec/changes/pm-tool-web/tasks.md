## 1. 專案初始化

- [x] 1.1 使用 `npm create vue@latest` 建立 `pm-tool-web` 專案（選擇 Vue Router、Pinia，不選 TypeScript）；採用 create-vue 作為專案初始化方式
- [x] 1.2 安裝依賴：`axios`、`scss`；設定 SCSS 全域變數
- [x] 1.3 建立 `.env.local`，設定 `VITE_API_BASE_URL=https://wl-production-13e9.up.railway.app`
- [x] 1.4 清除 create-vue 預設範例檔案，建立目錄結構：`src/views/`、`src/stores/`、`src/lib/`、`src/components/`

## 2. Auth — Token 管理與路由守衛

- [x] 2.1 建立 `src/lib/apiClient.js`：Axios instance 作為 HTTP Client 與 Token 管理核心，設定 baseURL，加入 request interceptor（帶入 accessToken）與 response interceptor（401 時自動呼叫 refresh，失敗則跳登入頁）（Token Auto-Refresh）
- [x] 2.2 建立 `src/stores/authStore.js`：Pinia store，管理 `user`、`accessToken` 狀態；Token 儲存位置採用 accessToken 存記憶體（Pinia）、refreshToken 存 localStorage；提供 `login`、`logout`、`refreshToken`、`restoreSession` actions（Token Auto-Refresh、Session Restore on Page Reload）
- [x] 2.3 建立 `src/views/auth/LoginView.vue`：email/password 表單，呼叫 authStore.login，成功導向 `/tasks`，失敗顯示錯誤訊息（Login Page）
- [x] 2.4 設定 `src/router/index.js`：路由守衛與角色控制由此實作，定義所有路由，加入 `meta.requiresAuth` 與 `meta.roles`；`beforeEach` 守衛處理未登入重導 `/login` 與角色不符重導 `/403`（Role-Based Route Guard）
- [x] 2.5 在 `App.vue` mounted 時呼叫 `authStore.restoreSession()`，確保頁面重整後自動還原 session（Session Restore on Page Reload）

## 3. 共用元件

- [x] 3.1 建立 `src/components/AppHeader.vue`：顯示使用者名稱、通知鈴鐺（含未讀數 badge）、登出按鈕（Notification Bell、Logout）
- [x] 3.2 建立 `src/components/AppLayout.vue`：包含 AppHeader 與側邊導覽列，依角色顯示對應選單項目
- [x] 3.3 建立 `src/views/ErrorView.vue`：通用 403 / 404 錯誤頁面

## 4. 任務管理

- [x] 4.1 建立 `src/stores/taskStore.js`：狀態管理採用 Pinia store，提供 `fetchTasks`、`createTask`、`updateTask`、`deleteTask` actions，`tasks` 與 `filteredTasks`（依 status filter）computed
- [x] 4.2 建立 `src/views/tasks/TaskListView.vue`：任務列表，顯示 title、status badge、assignee、dueDate、meeting；含 status 篩選器；PM/admin 顯示建立與刪除按鈕（Task List View、Delete Task）
- [x] 4.3 建立 `src/components/TaskFormModal.vue`：建立/編輯任務 modal；PM 顯示所有欄位，RD 只顯示 status 欄位；含 assignee 下拉選單（從 `/admin/users` 或固定清單取得）（Create Task、Edit Task）
- [x] 4.4 在 TaskListView 整合刪除確認 dialog（Delete Task）

## 5. 會議管理

- [x] 5.1 建立 `src/stores/meetingStore.js`：`fetchMeetings`、`fetchMeeting`、`createMeeting`、`updateMeeting`、`deleteMeeting`、`generateTasks` actions
- [x] 5.2 建立 `src/views/meetings/MeetingListView.vue`：會議列表，顯示 title、meetingDate、createdBy；PM/admin 顯示建立與刪除按鈕（Meeting List View、Delete Meeting）
- [x] 5.3 建立 `src/views/meetings/MeetingDetailView.vue`：顯示完整會議內容與關聯任務列表（title, status, assignee）；PM/admin 顯示編輯、刪除、Generate Tasks 按鈕（Meeting Detail View）
- [x] 5.4 建立 `src/components/MeetingFormModal.vue`：建立/編輯會議 modal（title, meetingDate, content）（Create and Edit Meeting）
- [x] 5.5 建立 `src/components/GenerateTasksModal.vue`：動態新增/移除任務輸入列（title, assignee 必填），提交後呼叫 generateTasks（Generate Tasks from Meeting）

## 6. 分支管理

- [x] 6.1 建立 `src/stores/branchStore.js`：`fetchBranches`、`createBranch`、`updateBranch`、`deleteBranch` actions
- [x] 6.2 建立 `src/views/branches/BranchListView.vue`：分支列表，顯示 name、type badge、linked task；含建立、編輯、刪除按鈕（Branch List View、Edit and Delete Branch）
- [x] 6.3 建立 `src/components/BranchFormModal.vue`：建立/編輯分支 modal（name, type select, taskId select from assigned tasks）（Create Branch）

## 7. 通知

- [x] 7.1 建立 `src/stores/notificationStore.js`：`fetchNotifications`、`markAsRead`、`markAllAsRead` actions；`unreadCount` computed（Notification Bell）
- [x] 7.2 建立 `src/views/notifications/NotificationListView.vue`：通知列表，顯示 message、type、相對時間；未讀通知加底色；點擊標記已讀；含「Mark All as Read」按鈕（Notification List View、Mark Notifications as Read）
- [x] 7.3 在 AppHeader 的通知鈴鐺顯示 `unreadCount` badge（Notification Bell）

## 8. Admin 後台

- [x] 8.1 建立 `src/stores/adminStore.js`：`fetchUsers`、`createUser`、`updateUserRole` actions
- [x] 8.2 建立 `src/views/admin/AdminUserListView.vue`：使用者列表，顯示 name、email、role badge、createdAt；含建立按鈕與 inline role 選擇器（Admin User List、Update User Role）
- [x] 8.3 建立 `src/components/CreateUserModal.vue`：建立使用者 modal（name, email, password, role select）（Create User Account）

## 9. 部署與收尾

- [x] 9.1 設定 `vite.config.js` 的 build 輸出，確認 SPA fallback 設定
- [x] 9.2 部署至 Vercel：連結 GitHub repo，設定 `VITE_API_BASE_URL` 環境變數，確認 build 成功
- [x] 9.3 手動測試完整流程：登入 → 建立任務 → RD 更新狀態 → 確認通知出現
