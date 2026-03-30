/**
 * Role-Based Access Control middleware factory
 * 路由層宣告式權限控制，讓 routes/ 檔案即為權限文件
 *
 * @param {...string} roles - 允許存取的角色清單（admin / pm / rd）
 * @returns {import('express').RequestHandler} Express middleware
 *
 * @example
 * router.post('/tasks', authMiddleware, requireRole('pm', 'admin'), createTask)
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    // authMiddleware 必須在此之前執行，確保 req.user 已存在
    if (!req.user) {
      return res.status(401).json({ message: '未提供認證 token' })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: '權限不足，無法執行此操作' })
    }

    next()
  }
}
