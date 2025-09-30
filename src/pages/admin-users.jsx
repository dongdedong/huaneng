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
        dataSourceName: 'users',
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
          dataSourceName: 'users',
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
          dataSourceName: 'users',
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
          dataSourceName: 'users',
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
          dataSourceName: 'users',
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
        dataSourceName: 'users',
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
    <div className="min-h-screen bg-gray-50">
      <TopNavBar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
              <p className="text-gray-600">管理系统用户信息</p>
            </div>
          </div>
        </div>

        {/* 操作栏 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              {/* 搜索框 */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索用户名、姓名、手机号或部门..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* 添加用户按钮 */}
              <Button onClick={handleAddUser} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <UserPlus className="h-4 w-4 mr-2" />
                添加用户
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 用户列表 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>用户列表</CardTitle>
                <CardDescription>
                  共 {filteredUsers.length} 个用户
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">加载中...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {searchTerm ? '没有找到匹配的用户' : '暂无用户数据'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">用户名</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">姓名</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">手机号</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">部门</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">角色</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">创建时间</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, index) => {
                      const roleDisplay = getRoleDisplay(user.role);
                      return (
                        <tr key={user._id} className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                          <td className="py-4 px-4">
                            <div className="font-medium text-gray-900">{user.username}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-medium text-gray-900">{user.name}</div>
                          </td>
                          <td className="py-4 px-4 text-gray-600">{user.phone}</td>
                          <td className="py-4 px-4 text-gray-600">{user.department}</td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleDisplay.color}`}>
                              {user.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                              {roleDisplay.label}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('zh-CN') : '-'}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditUser(user)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUser(user)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 用户编辑/新增对话框 */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              {editingUser ? '编辑用户' : '添加用户'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名 *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value.toLowerCase())}
                placeholder="请输入用户名（小写字母）"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">密码 {!editingUser && '*'}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder={editingUser ? "留空则不修改密码" : "请输入密码"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">姓名 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="请输入姓名"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">手机号 *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="请输入11位手机号"
                maxLength={11}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">部门 *</Label>
              <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择部门" />
                </SelectTrigger>
                <SelectContent>
                  {departmentOptions.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">角色 *</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择角色" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDialog(false)}>
              取消
            </Button>
            <Button onClick={handleSaveUser} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingUser ? '更新' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              确认删除
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-gray-600">
              确定要删除用户 <span className="font-semibold text-gray-900">{deletingUser?.name}</span> 吗？
            </p>
            <p className="text-sm text-red-600 mt-2">此操作不可撤销！</p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteUser}
              disabled={submitting}
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