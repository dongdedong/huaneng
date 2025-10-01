// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { useToast, Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
// @ts-ignore;
import { Loader2, UserPlus, Edit, Trash2, Search, Users, Shield, AlertTriangle } from 'lucide-react';
// @ts-ignore;
import TopNavBar from '@/components/TopNavBar';

export default function AdminUsers(props) {
  const { $w } = props;
  const { toast } = useToast();

  // 状态管理
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 弹窗状态
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  // 表单数据
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    phone: '',
    department: '',
    role: 'user'
  });

  // 部门选项
  const departmentOptions = [
    '规划部',
    '南阳项目开发部',
    '豫北项目开发部',
    '灵宝项目开发部',
    '省直项目开发部',
    '郑州项目开发部',
    '开封项目开发部',
    '漯河项目开发部',
    '许昌项目开发部',
    '商丘项目开发部',
    '周口项目开发部'
  ];

  // 角色选项
  const roleOptions = [
    { value: 'user', label: '普通用户' },
    { value: 'manager', label: '经理' },
    { value: 'admin', label: '管理员' }
  ];

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    loadUsers();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 加载用户列表
  const loadUsers = async () => {
    try {
      setLoading(true);
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'users_tbl',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {},
          pageSize: 100
        }
      });

      if (isMountedRef.current) {
        setUsers(result.records || []);
      }
    } catch (error) {
      console.error('加载用户列表失败:', error);
      if (isMountedRef.current) {
        toast({
          title: "加载失败",
          description: "无法加载用户列表，请稍后重试",
          variant: "destructive"
        });
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  // 处理表单输入
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      name: '',
      phone: '',
      department: '',
      role: 'user'
    });
    setEditingUser(null);
  };

  // 打开新增用户对话框
  const handleAddUser = () => {
    resetForm();
    setShowUserDialog(true);
  };

  // 打开编辑用户对话框
  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username || '',
      password: '', // 编辑时密码为空，如果用户不填写则不修改密码
      name: user.name || '',
      phone: user.phone || '',
      department: user.department || '',
      role: user.role || 'user'
    });
    setShowUserDialog(true);
  };

  // 保存用户（新增或编辑）
  const handleSaveUser = async () => {
    // 表单验证
    if (!formData.username || !formData.name || !formData.phone || !formData.department) {
      toast({
        title: "表单不完整",
        description: "请填写所有必填项",
        variant: "destructive"
      });
      return;
    }

    // 新增用户时密码必填
    if (!editingUser && !formData.password) {
      toast({
        title: "密码不能为空",
        description: "新增用户时必须设置密码",
        variant: "destructive"
      });
      return;
    }

    // 用户名格式验证（小写字母）
    const usernameRegex = /^[a-z]+$/;
    if (!usernameRegex.test(formData.username)) {
      toast({
        title: "用户名格式错误",
        description: "用户名必须是小写字母",
        variant: "destructive"
      });
      return;
    }

    // 手机号格式验证
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast({
        title: "手机号格式错误",
        description: "请输入正确的11位手机号",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);

      if (editingUser) {
        // 编辑用户
        const updateData = {
          username: formData.username,
          name: formData.name,
          phone: formData.phone,
          department: formData.department,
          role: formData.role
        };

        // 如果填写了密码，则更新密码
        if (formData.password.trim()) {
          updateData.password = formData.password;
        }

        await $w.cloud.callDataSource({
          dataSourceName: 'users_tbl',
          methodName: 'wedaUpdateV2',
          params: {
            filter: {
              where: {
                _id: editingUser._id
              }
            },
            data: updateData
          }
        });

        toast({
          title: "更新成功",
          description: "用户信息已更新",
          duration: 1000
        });
      } else {
        // 新增用户 - 检查用户名和手机号是否已存在
        const existingUserByUsername = await $w.cloud.callDataSource({
          dataSourceName: 'users_tbl',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              where: {
                username: formData.username
              }
            },
            pageSize: 1
          }
        });

        if (existingUserByUsername.records && existingUserByUsername.records.length > 0) {
          toast({
            title: "用户名已存在",
            description: "该用户名已被使用，请选择其他用户名",
            variant: "destructive"
          });
          return;
        }

        const existingUserByPhone = await $w.cloud.callDataSource({
          dataSourceName: 'users_tbl',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              where: {
                phone: formData.phone
              }
            },
            pageSize: 1
          }
        });

        if (existingUserByPhone.records && existingUserByPhone.records.length > 0) {
          toast({
            title: "手机号已存在",
            description: "该手机号已被其他用户使用",
            variant: "destructive"
          });
          return;
        }

        // 创建新用户
        await $w.cloud.callDataSource({
          dataSourceName: 'users_tbl',
          methodName: 'wedaCreateV2',
          params: {
            data: {
              username: formData.username,
              password: formData.password,
              name: formData.name,
              phone: formData.phone,
              department: formData.department,
              role: formData.role
            }
          }
        });

        toast({
          title: "创建成功",
          description: "新用户已创建",
          duration: 1000
        });
      }

      setShowUserDialog(false);
      resetForm();
      loadUsers();
    } catch (error) {
      console.error('保存用户失败:', error);
      toast({
        title: "保存失败",
        description: error.message || "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // 打开删除确认对话框
  const handleDeleteUser = (user) => {
    setDeletingUser(user);
    setShowDeleteDialog(true);
  };

  // 确认删除用户
  const confirmDeleteUser = async () => {
    try {
      setSubmitting(true);

      await $w.cloud.callDataSource({
        dataSourceName: 'users_tbl',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              _id: deletingUser._id
            }
          }
        }
      });

      toast({
        title: "删除成功",
        description: "用户已删除",
        duration: 1000
      });

      setShowDeleteDialog(false);
      setDeletingUser(null);
      loadUsers();
    } catch (error) {
      console.error('删除用户失败:', error);
      toast({
        title: "删除失败",
        description: error.message || "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // 过滤用户列表
  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm) ||
    user.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 角色显示映射
  const getRoleDisplay = (role) => {
    const roleMap = {
      'admin': { label: '管理员', color: 'text-red-600 bg-red-100' },
      'manager': { label: '经理', color: 'text-orange-600 bg-orange-100' },
      'user': { label: '普通用户', color: 'text-blue-600 bg-blue-100' }
    };
    return roleMap[role] || { label: '未知', color: 'text-gray-600 bg-gray-100' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50" style={{ fontFamily: '"仿宋_GB2312", "FangSong_GB2312", serif' }}>
      {/* 固定顶部导航栏 */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <TopNavBar {...props} currentPage="admin-users" />
      </div>

      {/* 装饰背景 */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-blue-500 to-green-600 opacity-10"></div>

      {/* 主内容区域 */}
      <div className="relative z-10 pt-20 pb-4">
        <div className="max-w-md mx-auto px-1">
          {/* 页面标题 */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-xl">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 mb-1">用户管理</h1>
            <p className="text-sm text-gray-600">管理系统用户信息</p>
          </div>

          {/* 操作栏 */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-0 p-4 mb-4">
            <div className="space-y-3">
              {/* 搜索框 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索用户名、姓名、手机号..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-11 pl-10 rounded-xl border-2 border-gray-200 bg-gray-50/50 focus:border-purple-400 focus:bg-white transition-all duration-200"
                />
              </div>

              {/* 添加用户按钮 */}
              <Button
                onClick={handleAddUser}
                className="w-full h-11 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                添加用户
              </Button>
            </div>
          </div>

          {/* 用户列表 */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-0 p-4">
            <div className="text-center mb-4">
              <h3 className="text-base font-bold text-gray-800 mb-1">👥 用户列表</h3>
              <p className="text-xs text-gray-600">共 {filteredUsers.length} 个用户</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2 text-sm text-gray-600">加载中...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600">
                  {searchTerm ? '没有找到匹配的用户' : '暂无用户数据'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((user, index) => {
                  const roleDisplay = getRoleDisplay(user.role);
                  return (
                    <div
                      key={user._id}
                      className="bg-gray-50/50 rounded-xl p-3 border border-gray-200 hover:border-purple-300 hover:bg-white transition-all duration-200"
                    >
                      <div className="space-y-2">
                        {/* 用户基本信息 */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                {user.name ? user.name.charAt(0) : user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900">{user.name}</div>
                              <div className="text-xs text-gray-600">@{user.username}</div>
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleDisplay.color}`}>
                            {user.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                            {roleDisplay.label}
                          </span>
                        </div>

                        {/* 详细信息 */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">📱</span>
                            <span className="text-gray-700">{user.phone}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">🏢</span>
                            <span className="text-gray-700 truncate">{user.department}</span>
                          </div>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex gap-2 pt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            className="flex-1 h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            编辑
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user)}
                            className="flex-1 h-8 text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            删除
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 用户编辑/新增对话框 */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="sm:max-w-sm mx-2 rounded-2xl border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <DialogHeader className="text-center pb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-lg">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <DialogTitle className="text-lg font-bold text-gray-800">
              {editingUser ? '编辑用户' : '添加用户'}
            </DialogTitle>
            <p className="text-xs text-gray-600">
              {editingUser ? '修改用户信息' : '创建新的系统用户'}
            </p>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold text-gray-700">用户名 *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value.toLowerCase())}
                placeholder="请输入用户名（小写字母）"
                className="h-11 rounded-xl border-2 border-gray-200 bg-gray-50/50 focus:border-purple-400 focus:bg-white transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">密码 {!editingUser && '*'}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder={editingUser ? "留空则不修改密码" : "请输入密码"}
                className="h-11 rounded-xl border-2 border-gray-200 bg-gray-50/50 focus:border-purple-400 focus:bg-white transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700">姓名 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="请输入姓名"
                className="h-11 rounded-xl border-2 border-gray-200 bg-gray-50/50 focus:border-purple-400 focus:bg-white transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">手机号 *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="请输入11位手机号"
                maxLength={11}
                className="h-11 rounded-xl border-2 border-gray-200 bg-gray-50/50 focus:border-purple-400 focus:bg-white transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm font-semibold text-gray-700">部门 *</Label>
              <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                <SelectTrigger className="h-11 rounded-xl border-2 border-gray-200 bg-gray-50/50 focus:border-purple-400 focus:bg-white transition-all duration-200">
                  <SelectValue placeholder="请选择部门" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2 shadow-xl">
                  {departmentOptions.map((dept) => (
                    <SelectItem key={dept} value={dept} className="rounded-lg">{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-semibold text-gray-700">角色 *</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger className="h-11 rounded-xl border-2 border-gray-200 bg-gray-50/50 focus:border-purple-400 focus:bg-white transition-all duration-200">
                  <SelectValue placeholder="请选择角色" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2 shadow-xl">
                  {roleOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value} className="rounded-lg">{role.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowUserDialog(false)}
              className="flex-1 h-11 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              取消
            </Button>
            <Button
              onClick={handleSaveUser}
              disabled={submitting}
              className="flex-1 h-11 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingUser ? '更新' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-sm mx-2 rounded-2xl border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <DialogHeader className="text-center pb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-lg">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <DialogTitle className="text-lg font-bold text-red-600">
              确认删除
            </DialogTitle>
            <p className="text-xs text-gray-600">此操作不可撤销</p>
          </DialogHeader>

          <div className="py-2 text-center">
            <p className="text-sm text-gray-700 mb-2">
              确定要删除用户
            </p>
            <div className="bg-red-50 rounded-xl p-3 mb-3">
              <p className="font-bold text-red-800">{deletingUser?.name}</p>
              <p className="text-xs text-red-600">@{deletingUser?.username}</p>
            </div>
            <p className="text-xs text-red-600">⚠️ 此操作不可撤销！</p>
          </div>

          <DialogFooter className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="flex-1 h-11 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              取消
            </Button>
            <Button
              onClick={confirmDeleteUser}
              disabled={submitting}
              className="flex-1 h-11 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}