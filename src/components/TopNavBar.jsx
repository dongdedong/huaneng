// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';
// @ts-ignore;
import { User, LogOut, Users, FileText, Settings, BarChart3, Database } from 'lucide-react';

const TopNavBar = props => {
  const {
    $w,
    currentPage = 'project-data-dashboard' // 添加当前页面参数
  } = props;
  const [currentUser, setCurrentUser] = useState(null);
  const {
    toast
  } = useToast();
  useEffect(() => {
    // 获取当前登录用户信息
    try {
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }, []);

  // 导航到不同页面
  const navigateToPage = (pageId) => {
    try {
      if ($w && $w.utils && $w.utils.navigateTo) {
        $w.utils.navigateTo({
          pageId: pageId,
          params: {}
        });
      } else {
        // 备用方案：使用hash路由
        window.location.hash = `#/${pageId}`;
      }
    } catch (error) {
      console.error('页面跳转失败:', error);
      // 最后的备用方案
      window.location.hash = `#/${pageId}`;
    }
  };

  const handleLogout = () => {
    // 清除登录状态
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    toast({
      title: "已退出登录",
      description: "您已成功退出系统"
    });

    // 使用微搭平台的路由API进行跳转，避免Cannot GET错误
    setTimeout(() => {
      if ($w && $w.utils && $w.utils.redirectTo) {
        // 使用redirectTo而不是navigateTo，确保完全重定向
        $w.utils.redirectTo({
          pageId: 'login',
          params: {}
        });
      } else {
        // 备用方案：使用hash路由，确保路径正确
        window.location.hash = '#/login';
        // 如果hash路由也不行，则直接重载页面
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    }, 1000);
  };
  // 判断是否是活动页面
  const isActivePage = (pageId) => {
    return currentPage === pageId;
  };

  if (!currentUser) return null;
  return <div className="bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-lg sticky top-0 z-50">
      <div className="max-w-sm mx-auto px-2">
        <div className="flex items-center justify-between py-3">
          {/* 左侧：用户信息 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-800">{currentUser.name}</span>
              <span className="text-xs text-gray-600">{currentUser.department}</span>
            </div>
          </div>

          {/* 分界线 */}
          <div className="w-px h-8 bg-gray-200"></div>

          {/* 右侧：功能图标 */}
          <div className="flex items-center gap-1">
            {/* 项目统计 */}
            <button
              onClick={() => navigateToPage('project-data-dashboard')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isActivePage('project-data-dashboard')
                  ? 'bg-blue-100 text-blue-600 shadow-md scale-110'
                  : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
              }`}
              title="项目统计"
            >
              <BarChart3 className="h-5 w-5" />
            </button>

            {/* 项目填报 */}
            <button
              onClick={() => navigateToPage('project-report')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isActivePage('project-report')
                  ? 'bg-green-100 text-green-600 shadow-md scale-110'
                  : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
              }`}
              title="项目填报"
            >
              <FileText className="h-5 w-5" />
            </button>

            {/* 分界线 */}
            <div className="w-px h-6 bg-gray-200 mx-1"></div>

            {/* 退出登录 */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
              title="退出登录"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>;
};
export default TopNavBar;