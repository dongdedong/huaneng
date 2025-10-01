// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, useToast } from '@/components/ui';
// @ts-ignore;
import { User, Lock, LogIn } from 'lucide-react';

const LoginPage = props => {
  const {
    $w
  } = props;
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const {
    toast
  } = useToast();

  // 检查环境兼容性
  const checkEnvironmentSupport = () => {
    return $w && $w.cloud && typeof $w.cloud.callDataSource === 'function';
  };

  // 备用验证方案（当微搭环境不可用时）
  const fallbackValidateUser = async (username, password) => {
    try {
      console.log('使用备用验证方案');

      // 预定义的测试账号（实际项目中应该通过其他方式获取，比如直接的API调用）
      const testUsers = [
        { username: 'admin', password: '123456', name: '管理员', phone: '13800000000', department: '管理部', role: 'admin' },
        { username: 'zhangsan', password: '123456', name: '张三', phone: '13800000001', department: '技术部', role: 'user' },
        { username: 'lisi', password: '123456', name: '李四', phone: '13800000002', department: '业务部', role: 'user' }
      ];

      // 查找匹配的用户
      const user = testUsers.find(u => u.username === username && u.password === password);

      if (user) {
        console.log('备用验证成功，用户:', user.name);
        return {
          success: true,
          user: {
            username: user.username,
            name: user.name,
            phone: user.phone,
            department: user.department,
            role: user.role
          }
        };
      } else {
        return {
          success: false,
          message: '用户名或密码错误'
        };
      }
    } catch (error) {
      console.error('备用验证失败:', error);
      return {
        success: false,
        message: '验证过程出错，请稍后重试'
      };
    }
  };

  // 从数据库验证用户账号
  const validateUser = async (username, password) => {
    try {
      console.log('开始用户验证，用户名:', username);
      console.log('环境检查 - $w对象:', !!$w);
      console.log('环境检查 - $w.cloud:', !!($w && $w.cloud));
      console.log('环境检查 - callDataSource:', !!($w && $w.cloud && $w.cloud.callDataSource));

      // 检查微搭环境是否可用，如果不可用则使用备用验证方案
      if (!checkEnvironmentSupport()) {
        console.warn('微搭环境不支持，使用备用验证方案');
        return await fallbackValidateUser(username, password);
      }

      // 使用CloudBase数据源查询用户 - 使用MySQL的users_tbl表
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'users_tbl',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                username: {
                  $eq: username
                }
              }, {
                password: {
                  $eq: password
                }
              }, {
                status: {
                  $eq: 'active'
                }
              }]
            }
          },
          select: {
            username: true,
            name: true,
            phone: true,
            department: true,
            role: true,
            status: true
          },
          pageSize: 1,
          pageNumber: 1
        }
      });

      console.log('数据库查询结果:', result);
      if (result && result.records && result.records.length > 0) {
        const user = result.records[0];
        return {
          success: true,
          user: {
            username: user.username,
            name: user.name,
            phone: user.phone,
            department: user.department,
            role: user.role
          }
        };
      } else {
        return {
          success: false,
          message: '用户名或密码错误，或账户未激活'
        };
      }
    } catch (error) {
      console.error('登录验证失败:', error);
      console.error('错误详情:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });

      // 根据错误类型返回更具体的错误信息
      let errorMessage = '系统错误，请稍后重试';

      if (error.message && error.message.includes('network')) {
        errorMessage = '网络连接失败，请检查网络后重试';
      } else if (error.message && error.message.includes('timeout')) {
        errorMessage = '请求超时，请重试';
      } else if (error.message && error.message.includes('callDataSource')) {
        errorMessage = '数据源访问失败，可能是环境不兼容';
      }

      return {
        success: false,
        message: errorMessage,
        debugInfo: {
          error: error.message,
          environment: {
            hasWedaObject: !!$w,
            hasCloudObject: !!($w && $w.cloud),
            hasCallDataSource: !!($w && $w.cloud && $w.cloud.callDataSource),
            userAgent: navigator.userAgent,
            platform: navigator.platform
          }
        }
      };
    }
  };
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleLogin = async e => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      toast({
        title: "请填写完整信息",
        description: "用户名和密码都不能为空",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      // 从数据库验证用户
      const validation = await validateUser(formData.username, formData.password);
      if (validation.success) {
        // 登录成功，保存用户信息到localStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify({
          username: validation.user.username,
          name: validation.user.name,
          phone: validation.user.phone,
          department: validation.user.department,
          role: validation.user.role,
          loginTime: new Date().toISOString()
        }));
        toast({
          title: "登录成功",
          description: `欢迎回来，${validation.user.name}！`,
          duration: 1000
        });

        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          // 所有用户登录后都进入项目数据展示页面
          const targetPage = 'project-data-dashboard';

          console.log('尝试页面跳转到:', targetPage);
          console.log('$w.utils 可用性:', !!($w && $w.utils));

          // 使用微搭平台的路由跳转API，确保路由正确
          if ($w && $w.utils && $w.utils.navigateTo) {
            console.log('使用微搭平台路由跳转');
            $w.utils.navigateTo({
              pageId: targetPage,
              params: {}
            });
          } else if ($w && $w.utils && $w.utils.redirectTo) {
            console.log('使用微搭平台重定向');
            $w.utils.redirectTo({
              pageId: targetPage,
              params: {}
            });
          } else {
            console.log('使用备用路由方案');
            // 备用方案：多种路由方式
            try {
              // 方案1：直接修改URL路径
              if (window.location.pathname.includes('/')) {
                window.location.pathname = `/${targetPage}`;
              } else {
                // 方案2：使用hash路由
                window.location.hash = `#/${targetPage}`;
              }
            } catch (error) {
              console.error('路由跳转失败:', error);
              // 方案3：完整URL替换
              window.location.href = window.location.origin + `/#/${targetPage}`;
            }
          }
        }, 1000);
      } else {
        // 显示错误信息，如果有调试信息也在控制台输出
        if (validation.debugInfo) {
          console.error('登录失败调试信息:', validation.debugInfo);
        }

        toast({
          title: "登录失败",
          description: validation.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('登录错误:', error);
      toast({
        title: "登录失败",
        description: "网络错误，请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 flex items-center justify-center px-2 py-4">
      <div className="w-full max-w-sm">
        <Card className="border-0 shadow-2xl rounded-2xl bg-white/95 backdrop-blur-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-green-500 h-1"></div>

          <CardHeader className="text-center pb-4 pt-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mx-auto mb-3 flex items-center justify-center">
              <LogIn className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-800 mb-1">
              项目填报系统
            </CardTitle>
            <p className="text-gray-600 text-xs">
              请登录您的账户以继续
            </p>
          </CardHeader>

          <CardContent className="px-4 pb-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {/* 用户名输入 */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <User className="h-4 w-4 text-blue-600" />
                  用户名
                </Label>
                <Input type="text" value={formData.username} onChange={e => handleInputChange('username', e.target.value)} placeholder="请输入用户名" className="h-11 rounded-xl border-2 border-gray-200 bg-gray-50/50 focus:border-blue-400 focus:bg-white transition-all duration-200" disabled={isLoading} />
              </div>

              {/* 密码输入 */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Lock className="h-4 w-4 text-blue-600" />
                  密码
                </Label>
                <Input type="password" value={formData.password} onChange={e => handleInputChange('password', e.target.value)} placeholder="请输入密码" className="h-11 rounded-xl border-2 border-gray-200 bg-gray-50/50 focus:border-blue-400 focus:bg-white transition-all duration-200" disabled={isLoading} />
              </div>

              {/* 登录按钮 */}
              <Button type="submit" disabled={isLoading} className="w-full h-11 mt-6 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
                {isLoading ? <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    登录中...
                  </div> : <div className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    登录
                  </div>}
              </Button>
            </form>

            {/* 示例账号提示 */}
            <div className="mt-6 p-3 bg-blue-50 rounded-xl border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2 text-xs">测试账号</h4>
              <div className="text-xs text-blue-700 space-y-1">
                <div>• 管理员：admin / 123456</div>
                <div>• 张三：zhangsan / 123456</div>
                <div>• 李四：lisi / 123456</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default LoginPage;