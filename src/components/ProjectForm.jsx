// @ts-ignore;
import React, { useEffect, useState } from 'react';
// @ts-ignore;
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
// @ts-ignore;
import { MapPin, Calendar, Building2, Lightbulb, Users, User, Phone, Zap, ChevronDown } from 'lucide-react';


export function ProjectForm({
  formData,
  onInputChange,
  onLocationSelect,
  onSubmit,
  onReset,
  submitting,
  showLocationPicker,
  setShowLocationPicker,
  projectId
}) {
  const [currentUser, setCurrentUser] = useState(null);
  const departments = ['规划部', '豫北项目开发部', '灵宝项目开发部', '南阳项目开发部', '省直项目开发部', '郑州项目开发部', '开封项目开发部', '许昌项目开发部', '漯河项目开发部', '商丘项目开发部', '周口项目开发部'];
  const projectTypes = ['分布式光伏', '集中式光伏', '分散式风电', '集中式风电', '源网荷储项目', '千乡万村御风行动'];

  useEffect(() => {
    // 获取当前登录用户信息
    try {
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }, []);

  const formatDate = date => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
  };

  return (
    <div className="space-y-3">
      {/* 表单卡片 */}
      <Card className="border-0 shadow-lg rounded-xl bg-white overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-blue-500 h-1"></div>

        <CardContent className="p-3 space-y-4">
          {/* 项目对接日期 */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <Calendar className="h-4 w-4 text-green-600" />
              项目对接日期
            </Label>
            <div className="w-full h-12 flex items-center px-3 rounded-xl border-2 border-gray-200 bg-gray-50/30">
              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-gray-900 font-medium text-sm">
                {formatDate(new Date())}
              </span>
              <span className="ml-2 text-xs text-gray-500">(今日)</span>
            </div>
          </div>

          {/* 项目所在地 */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <MapPin className="h-4 w-4 text-green-600" />
              项目所在地 <span className="text-red-500">*</span>
            </Label>
            <Button
              variant="outline"
              onClick={() => setShowLocationPicker(true)}
              className="w-full h-12 justify-between rounded-xl border-2 border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-green-300 transition-all duration-200"
            >
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                <span className={formData.projectLocation.full_address ? 'text-gray-900 text-sm' : 'text-gray-500 text-sm'}>
                  {formData.projectLocation.full_address || '请选择项目所在地址'}
                </span>
              </div>
            </Button>
            {formData.projectLocation.full_address && (
              <div className="px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs text-green-800 font-medium">
                  📍 {formData.projectLocation.province}-{formData.projectLocation.city}-{formData.projectLocation.county}
                </p>
              </div>
            )}
          </div>

          {/* 项目开发部 */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <Building2 className="h-4 w-4 text-green-600" />
              项目开发部
            </Label>
            <div className="w-full h-12 flex items-center px-3 rounded-xl border-2 border-gray-200 bg-gray-50/30">
              <Building2 className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-gray-900 font-medium text-sm">
                {currentUser?.department || '加载中...'}
              </span>
              <span className="ml-2 text-xs text-gray-500">(当前用户部门)</span>
            </div>
          </div>

          {/* 项目类型 */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <Lightbulb className="h-4 w-4 text-green-600" />
              项目类型 <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.projectType} onValueChange={value => onInputChange('projectType', value)}>
              <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 bg-gray-50/50 focus:border-green-500 focus:bg-white transition-all duration-200">
                <div className="flex items-center">
                  <Lightbulb className="h-4 w-4 text-gray-400 mr-2" />
                  <SelectValue placeholder="请选择项目类型" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {projectTypes.map(type => (
                  <SelectItem key={type} value={type} className="text-sm">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 项目容量 */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <Zap className="h-4 w-4 text-green-600" />
              项目容量 <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.projectCapacity}
                onChange={e => {
                  const value = e.target.value;
                  // 只允许输入数字和小数点，并限制小数点后两位
                  if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                    onInputChange('projectCapacity', value);
                  }
                }}
                placeholder="请输入项目容量"
                className="h-14 pl-12 pr-16 rounded-2xl border-2 border-gray-200 bg-gray-50/50 focus:border-green-500 focus:bg-white transition-all duration-200"
              />
              <Zap className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">MW</span>
            </div>
            {formData.projectCapacity && (
              <div className="px-4 py-2 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-800">
                  ⚡ 项目容量: {parseFloat(formData.projectCapacity || 0).toFixed(2)} MW
                </p>
              </div>
            )}
          </div>

          {/* 项目合作单位 */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-semibold text-gray-800">
              <Users className="h-5 w-5 text-green-600" />
              项目合作单位 <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                value={formData.partnerUnit}
                onChange={e => onInputChange('partnerUnit', e.target.value)}
                placeholder="请输入合作单位名称"
                className="h-12 pl-10 rounded-xl border-2 border-gray-200 bg-gray-50/50 focus:border-green-500 focus:bg-white transition-all duration-200"
              />
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* 填表人信息 */}
          <div className="space-y-6 pt-4 border-t border-gray-100">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">👤 填表人信息</h3>
              <p className="text-sm text-gray-600">请填写您的真实姓名和联系方式</p>
            </div>

            {/* 填表人姓名 */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-semibold text-gray-800">
                <User className="h-5 w-5 text-green-600" />
                填表人姓名 <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  value={formData.reporterName}
                  onChange={e => onInputChange('reporterName', e.target.value)}
                  placeholder="请输入您的真实姓名"
                  className="h-12 pl-10 rounded-xl border-2 border-gray-200 bg-gray-50/50 focus:border-green-500 focus:bg-white transition-all duration-200"
                />
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* 填表人电话 */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-semibold text-gray-800">
                <Phone className="h-5 w-5 text-green-600" />
                填表人电话 <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type="tel"
                  value={formData.reporterPhone}
                  onChange={e => onInputChange('reporterPhone', e.target.value)}
                  placeholder="请输入11位手机号"
                  maxLength={11}
                  className="h-12 pl-10 rounded-xl border-2 border-gray-200 bg-gray-50/50 focus:border-green-500 focus:bg-white transition-all duration-200"
                />
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* 对接项目编号 */}
          <div className="space-y-6 pt-4 border-t border-gray-100">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">🔢 对接项目编号</h3>
              <p className="text-sm text-gray-600">系统自动生成，无需手动填写</p>
            </div>

            <div className="space-y-3">
              <div className="w-full h-16 flex items-center justify-center px-4 rounded-2xl border-2 border-blue-200 bg-blue-50/30">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-900 mb-1">
                    {projectId || '待生成...'}
                  </div>
                  <div className="text-xs text-blue-600">
                    提交时自动生成编号
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onSubmit}
              disabled={submitting}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  处理中...
                </div>
              ) : (
                '📤 提交信息'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 温馨提示 */}
      <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-start gap-2">
          <div className="text-blue-500 text-base">💡</div>
          <div>
            <h4 className="font-semibold text-blue-800 mb-1 text-sm">温馨提示</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• 请确保填写的信息真实准确</li>
              <li>• 手机号将用于后续项目沟通联系</li>
              <li>• 提交后系统将保存项目信息</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}