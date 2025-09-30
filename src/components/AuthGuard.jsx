// @ts-ignore;
import React, { useEffect, useState, useRef } from 'react';

const AuthGuard = ({
  children,
  $w
}) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    // 检查用户是否已登录
    const checkAuth = () => {
      try {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const currentUser = localStorage.getItem('currentUser');

        // 如果有登录标识和用户信息，则认为已登录
        if (isLoggedIn && currentUser) {
          const userData = JSON.parse(currentUser);
          // 可以在这里添加更多验证逻辑，比如检查token是否过期
          if (isMountedRef.current) {
            setIsAuthenticated(true);
          }
        } else {
          if (isMountedRef.current) {
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        if (isMountedRef.current) {
          setIsAuthenticated(false);
        }
      } finally {
        if (isMountedRef.current) {
          setIsChecking(false);
        }
      }
    };

    checkAuth();

    // 清理函数
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 正在检查认证状态时显示加载界面
  if (isChecking) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">正在验证身份...</p>
        </div>
      </div>;
  }

  // 未登录则重定向到登录页
  if (!isAuthenticated) {
    // 使用系统内置的导航功能而不是react-router-dom
    if ($w && $w.utils) {
      $w.utils.redirectTo({
        pageId: 'login',
        params: {}
      });
    } else {
      // 备用方案：直接修改URL
      window.location.href = '/login';
    }
    return null;
  }

  // 已登录则显示受保护的内容
  return children;
};
export default AuthGuard;