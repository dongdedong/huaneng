// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button, Input, Label, RadioGroup, RadioGroupItem, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
// @ts-ignore;
import { MapPin, Calendar, Building2, Lightbulb, Users, User, Phone } from 'lucide-react';

// @ts-ignore;
import { MobileDepartmentSelect } from '@/components/MobileDepartmentSelect';

export function ProjectForm({
  formData,
  onInputChange,
  onLocationSelect,
  onSubmit,
  onReset,
  submitting,
  showLocationPicker,
  setShowLocationPicker
}) {
  const departments = ['规划部', '豫北项目开发部', '灵宝项目开发部', '南阳项目开发部', '省直项目开发部', '郑州项目开发部', '开封项目开发部', '许昌项目开发部', '漯河项目开发部', '商丘项目开发部', '周口项目开发部'];
  const projectTypes = ['分布式光伏', '集中式光伏', '分散式风电', '集中式风电', '源网荷储项目', '千乡万村御风行动'];

  const formatDate = date => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          📝 项目信息填报
        </h1>
        <p className="text-gray-600 text-sm">
          请准确填写项目相关信息，带 * 的为必填项
        </p>
      </div>

      {/* 表单卡片 */}
      <Card className="border-0 shadow-lg rounded-2xl bg-white mx-4 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-blue-500 h-1"></div>

        <CardContent className="p-6 space-y-8">
          {/* 项目对接日期 */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-semibold text-gray-800">
              <Calendar className="h-5 w-5 text-green-600" />
              项目对接日期
            </Label>
            <div className="w-full h-14 flex items-center px-4 rounded-2xl border-2 border-gray-200 bg-gray-50/30">
              <Calendar className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-gray-900 font-medium">
                {formatDate(new Date())}
              </span>
              <span className="ml-2 text-sm text-gray-500">(今日)</span>
            </div>
          </div>

          {/* 项目所在地 */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-semibold text-gray-800">
              <MapPin className="h-5 w-5 text-green-600" />
              项目所在地 <span className="text-red-500">*</span>
            </Label>
            <Button
              variant="outline"
              onClick={() => setShowLocationPicker(true)}
              className="w-full h-14 justify-between rounded-2xl border-2 border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-green-300 transition-all duration-200"
            >
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                <span className={formData.projectLocation.full_address ? 'text-gray-900' : 'text-gray-500'}>
                  {formData.projectLocation.full_address || '请选择项目所在地址'}
                </span>
              </div>
            </Button>
            {formData.projectLocation.full_address && (
              <div className="px-4 py-3 bg-green-50 rounded-xl border border-green-200">
                <p className="text-sm text-green-800 font-medium">
                  📍 {formData.projectLocation.province} {formData.projectLocation.city} {formData.projectLocation.county}
                </p>
              </div>
            )}
          </div>

          {/* 项目开发部 */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-semibold text-gray-800">
              <Building2 className="h-5 w-5 text-green-600" />
              项目开发部 <span className="text-red-500">*</span>
            </Label>
            <MobileDepartmentSelect
              value={formData.projectDepartment}
              onChange={value => onInputChange('projectDepartment', value)}
              departments={departments}
            />
          </div>

          {/* 项目类型 */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2 text-base font-semibold text-gray-800">
              <Lightbulb className="h-5 w-5 text-green-600" />
              项目类型 <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={formData.projectType}
              onValueChange={value => onInputChange('projectType', value)}
              className="space-y-3"
            >
              {projectTypes.map(type => (
                <div
                  key={type}
                  className={`flex items-center space-x-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                    formData.projectType === type
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-200 bg-gray-50/50 hover:border-green-300 hover:bg-green-50/50'
                  }`}
                  onClick={() => onInputChange('projectType', type)}
                >
                  <RadioGroupItem
                    value={type}
                    id={type}
                    className="text-green-600 border-gray-400 w-5 h-5"
                  />
                  <Label
                    htmlFor={type}
                    className="text-sm font-medium text-gray-800 cursor-pointer flex-1"
                  >
                    {type}
                  </Label>
                  {formData.projectType === type && (
                    <div className="text-green-600 text-lg">✓</div>
                  )}
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* 项目合作单位 */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-semibold text-gray-800">
              <Users className="h-5 w-5 text-green-600" />
              项目合作单位
            </Label>
            <div className="relative">
              <Input
                value={formData.partnerUnit}
                onChange={e => onInputChange('partnerUnit', e.target.value)}
                placeholder="请输入合作单位名称（选填）"
                className="h-14 pl-12 rounded-2xl border-2 border-gray-200 bg-gray-50/50 focus:border-green-500 focus:bg-white transition-all duration-200"
              />
              <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
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
                  className="h-14 pl-12 rounded-2xl border-2 border-gray-200 bg-gray-50/50 focus:border-green-500 focus:bg-white transition-all duration-200"
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
                  className="h-14 pl-12 rounded-2xl border-2 border-gray-200 bg-gray-50/50 focus:border-green-500 focus:bg-white transition-all duration-200"
                />
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-4 pt-6">
            <Button
              onClick={onSubmit}
              disabled={submitting}
              className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
      <div className="mx-4 p-4 bg-blue-50 rounded-2xl border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="text-blue-500 text-lg">💡</div>
          <div>
            <h4 className="font-semibold text-blue-800 mb-1">温馨提示</h4>
            <ul className="text-sm text-blue-700 space-y-1">
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