// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button, Input, Label, RadioGroup, RadioGroupItem, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
// @ts-ignore;
import { MapPin } from 'lucide-react';

// @ts-ignore;
import { MobileDatePicker } from '@/components/MobileDatePicker';
// @ts-ignore;
import { MobileDepartmentSelect } from '@/components/MobileDepartmentSelect';
export function ProjectForm({
  formData,
  onInputChange,
  onLocationSelect,
  onSubmit,
  onReset,
  editingId,
  submitting,
  showDatePicker,
  setShowDatePicker,
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
  return <Card className="border-0 shadow-sm rounded-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">{editingId ? '编辑项目信息' : '项目信息填报'}</CardTitle>
        <CardDescription className="text-gray-600">请填写项目相关信息</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-5">
        {/* 项目对接日期 - 移动端优化 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">项目对接日期</Label>
          <Button variant="outline" onClick={() => setShowDatePicker(true)} className="w-full h-12 justify-start text-left font-normal rounded-lg border-gray-300 bg-white">
            {formData.projectDate ? formatDate(formData.projectDate) : "请选择日期"}
          </Button>
          <MobileDatePicker open={showDatePicker} onOpenChange={setShowDatePicker} selectedDate={formData.projectDate} onSelect={date => onInputChange('projectDate', date)} />
        </div>

        {/* 项目所在地 - 移动端优化 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">项目所在地</Label>
          <Button variant="outline" onClick={() => setShowLocationPicker(true)} className="w-full h-12 justify-between rounded-lg border-gray-300 bg-white">
            <span className={formData.projectLocation.full_address ? 'text-gray-900' : 'text-gray-500'}>
              {formData.projectLocation.full_address || '请选择项目地址'}
            </span>
            <MapPin className="h-4 w-4 text-gray-400" />
          </Button>
          {formData.projectLocation.full_address && <p className="text-sm text-gray-600 px-1">
              {formData.projectLocation.province} {formData.projectLocation.city} {formData.projectLocation.county}
            </p>}
        </div>

        {/* 项目开发部 - 移动端优化 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">项目开发部</Label>
          <MobileDepartmentSelect value={formData.projectDepartment} onChange={value => onInputChange('projectDepartment', value)} departments={departments} />
        </div>

        {/* 项目类型 - 移动端优化 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">项目类型</Label>
          <RadioGroup value={formData.projectType} onValueChange={value => onInputChange('projectType', value)}>
            <div className="grid grid-cols-1 gap-2">
              {projectTypes.map(type => <div key={type} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 bg-white">
                  <RadioGroupItem value={type} id={type} className="text-green-600 border-gray-300" />
                  <Label htmlFor={type} className="text-sm font-normal text-gray-700 cursor-pointer">
                    {type}
                  </Label>
                </div>)}
            </div>
          </RadioGroup>
        </div>

        {/* 项目合作单位 - 移动端优化 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">项目合作单位</Label>
          <Input value={formData.partnerUnit} onChange={e => onInputChange('partnerUnit', e.target.value)} placeholder="请输入合作单位名称" className="h-12 rounded-lg border-gray-300 bg-white" />
        </div>

        {/* 填表人 - 移动端优化 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">填表人</Label>
          <Input value={formData.reporterName} onChange={e => onInputChange('reporterName', e.target.value)} placeholder="请输入您的姓名" className="h-12 rounded-lg border-gray-300 bg-white" />
        </div>

        {/* 填表人电话 - 移动端优化 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">填表人电话</Label>
          <Input type="tel" value={formData.reporterPhone} onChange={e => onInputChange('reporterPhone', e.target.value)} placeholder="请输入手机号" maxLength={11} className="h-12 rounded-lg border-gray-300 bg-white" />
        </div>

        {/* 操作按钮 - 移动端优化 */}
        <div className="flex gap-3 pt-2">
          <Button onClick={onSubmit} disabled={submitting} className="flex-1 h-12 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium">
            {submitting ? "处理中..." : editingId ? '更新信息' : '提交信息'}
          </Button>
          {editingId && <Button variant="outline" onClick={onReset} className="h-12 rounded-lg border-gray-300 text-gray-700">
              取消
            </Button>}
        </div>
      </CardContent>
    </Card>;
}