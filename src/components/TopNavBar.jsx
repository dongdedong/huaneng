// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';
// @ts-ignore;
import { User, LogOut, Building } from 'lucide-react';

const TopNavBar = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const isMountedRef = useRef(true);
  const {
    toast
  } = useToast();
  useEffect(() => {
    // 获取当前登录用户信息
    try {
      const userData = localStorage.getItem('currentUser');
      if (userData && isMountedRef.current) {
        setCurrentUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }

    // 清理函数
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  const handleLogout = () => {
    // 清除登录状态
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    if (isMountedRef.current) {
      toast({
        title: "已退出登录",
        description: "您已成功退出系统"
      });
    }

    // 延迟跳转到登录页
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  };
  if (!currentUser) return null;
  return <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        {/* 左侧：系统标题 */}
        <div className="flex items-center gap-2">
          <Building className="h-5 w-5 text-green-600" />
          <h1 className="text-lg font-bold text-gray-800">新能源项目填报</h1>
        </div>

        {/* 右侧：用户信息和退出按钮 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-800">{currentUser.name}</span>
              <span className="text-xs text-gray-500">{currentUser.department}</span>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={handleLogout} className="h-8 px-3 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-200" title="退出登录">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>;
};
export default TopNavBar;