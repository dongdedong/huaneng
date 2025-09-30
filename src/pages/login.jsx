// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
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

  // 用于跟踪组件是否已卸载
  const isMountedRef = useRef(true);
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 从数据库验证用户账号
  const validateUser = async (username, password) => {
    try {
      // 使用CloudBase数据源查询用户 - 使用正确的V2 API
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'users',
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
      return {
        success: false,
        message: '系统错误，请稍后重试'
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

    // 检查组件是否仍然挂载
    if (!isMountedRef.current) return;
    if (!formData.username || !formData.password) {
      toast({
        title: "请填写完整信息",
        description: "用户名和密码都不能为空",
        variant: "destructive"
      });
      return;
    }
    if (!isMountedRef.current) return;
    setIsLoading(true);
    try {
      // 从数据库验证用户
      const validation = await validateUser(formData.username, formData.password);
      if (!isMountedRef.current) return;
      if (validation.success) {
        // 登录成功，保存用户信息到localStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify({
          username: validation.user.username,
          name: validation.user.name,
          phone: validation.user.phone,
          department: validation.user.department,
          loginTime: new Date().toISOString()
        }));
        if (isMountedRef.current) {
          toast({
            title: "登录成功",
            description: `欢迎回来，${validation.user.name}！`
          });
        }

        // 使用平台提供的路由方法进行页面跳转
        setTimeout(() => {
          if (isMountedRef.current && $w && $w.utils) {
            $w.utils.redirectTo({
              pageId: 'project-report',
              params: {}
            });
          }
        }, 1000);
      } else {
        if (isMountedRef.current) {
          toast({
            title: "登录失败",
            description: validation.message,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('登录错误:', error);
      if (isMountedRef.current) {
        toast({
          title: "登录失败",
          description: "网络错误，请稍后重试",
          variant: "destructive"
        });
      }
    } finally {
      // 只有组件仍然挂载时才更新状态
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl rounded-3xl bg-white/95 backdrop-blur-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-green-500 h-2"></div>

          <CardHeader className="text-center pb-8 pt-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <LogIn className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
              项目填报系统
            </CardTitle>
            <p className="text-gray-600 text-sm">
              请登录您的账户以继续
            </p>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* 用户名输入 */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-base font-semibold text-gray-700">
                  <User className="h-4 w-4 text-blue-600" />
                  用户名
                </Label>
                <Input type="text" value={formData.username} onChange={e => handleInputChange('username', e.target.value)} placeholder="请输入用户名" className="h-12 rounded-xl border-2 border-gray-200 bg-gray-50/50 focus:border-blue-400 focus:bg-white transition-all duration-200" disabled={isLoading} />
              </div>

              {/* 密码输入 */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-base font-semibold text-gray-700">
                  <Lock className="h-4 w-4 text-blue-600" />
                  密码
                </Label>
                <Input type="password" value={formData.password} onChange={e => handleInputChange('password', e.target.value)} placeholder="请输入密码" className="h-12 rounded-xl border-2 border-gray-200 bg-gray-50/50 focus:border-blue-400 focus:bg-white transition-all duration-200" disabled={isLoading} />
              </div>

              {/* 登录按钮 */}
              <Button type="submit" disabled={isLoading} className="w-full h-12 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
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
            <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2 text-sm">测试账号</h4>
              <div className="text-xs text-blue-700 space-y-1">
                <div>• 管理员：admin / 123456</div>
                <div>• 张三：zhangsan / 123456</div>
                <div>• 李四：lisi / 123456</div>
              </div>
              <div className="mt-2 text-xs text-blue-600">
                如需更多账号，请先使用
                <a href="/create-users-data" className="underline ml-1">用户数据源创建工具</a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default LoginPage;