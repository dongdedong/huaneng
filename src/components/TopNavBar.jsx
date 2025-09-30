// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';
// @ts-ignore;
import { User, LogOut, Users, FileText, Settings, BarChart3 } from 'lucide-react';

const TopNavBar = props => {
  const {
    $w
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
  if (!currentUser) return null;
  return <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className={`mx-auto px-4 py-3 flex items-center justify-between ${currentUser.role === 'admin' ? 'max-w-6xl' : 'max-w-lg'}`}>
        {/* 左侧：系统标题 */}
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-gray-800">项目填报系统</h1>
          {currentUser.role === 'admin' && (
            <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full font-medium">
              管理员
            </span>
          )}
        </div>

        {/* 中间：导航菜单 */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateToPage('project-data-dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-green-600 hover:bg-green-50"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">数据展示</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateToPage('project-report')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">项目填报</span>
          </Button>
          {currentUser.role === 'admin' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateToPage('admin-users')}
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">用户管理</span>
            </Button>
          )}
        </div>

        {/* 右侧：用户信息和退出按钮 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <div className="flex flex-col">
              <span className="font-medium">{currentUser.name}</span>
              {currentUser.department && <span className="text-xs text-gray-500">{currentUser.department}</span>}
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