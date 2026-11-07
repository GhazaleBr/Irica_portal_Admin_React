import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ShieldX } from 'lucide-react';

export default function ProtectedRoute({
  isAuthenticated,
  isLoadingUser,
  userData,
  allowedRoles = [], // لیست نقش‌های مجاز مثل ['admin', 'content_manager']
  children,
}) {
  const location = useLocation();

  // ۱. اگر توکن داریم اما دیتای کاربر هنوز از API در حال لود شدن است
  if (isAuthenticated && isLoadingUser) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', fontFamily: 'inherit' }}>
        <span>در حال بررسی سطح دسترسی کاربر...</span>
      </div>
    );
  }

  // ۲. کاربر اصلاً لاگین نکرده است
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // ۳. بررسی دسترسی‌ها (در صورتی که allowedRoles تعریف شده باشد)
  if (allowedRoles.length > 0) {
    // بسته به ساختار آبجکت userData در پروژه شما:
    // فرض: userData.roles = ['admin'] یا userData.role = 'admin'
    const userRoles = Array.isArray(userData?.roles)
      ? userData.roles
      : userData?.role
      ? [userData.role]
      : [];

    const hasPermission = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasPermission) {
      return (
        <div style={{ textAlign: 'center', padding: '50px 20px', direction: 'rtl' }}>
          <ShieldX size={56} color="#d32f2f" style={{ marginBottom: '16px' }} />
          <h3 style={{ margin: '0 0 8px 0', color: '#d32f2f' }}>دسترسی غیرمجاز (۴۰۳)</h3>
          <p style={{ color: '#666', fontSize: '14px' }}>
            شما سطح دسترسی لازم برای مشاهده و مدیریت این بخش را ندارید.
          </p>
        </div>
      );
    }
  }

  return children;
}
