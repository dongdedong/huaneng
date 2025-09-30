// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui';
// @ts-ignore;
import { AlertTriangle, MapPin, Calendar } from 'lucide-react';

export function DuplicateConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  duplicateRecords
}) {
  if (!duplicateRecords || duplicateRecords.length === 0) {
    return null;
  }
  const formatDate = dateString => {
    if (!dateString) return '未知日期';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            发现重复数据
          </DialogTitle>
          <DialogDescription>
            系统检测到以下重复的项目信息，是否继续提交？
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {duplicateRecords.map((record, index) => <div key={index} className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium">{record.project_location?.full_address || '未知地址'}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <div>项目类型：{record.project_type || '未知'}</div>
                  <div>合作单位：{record.partner_unit || '无'}</div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>提交时间：{formatDate(record.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>)}

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              💡 提示：重复提交可能导致数据冗余，请确认是否为同一项目。
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            取消提交
          </Button>
          <Button onClick={onConfirm} variant="destructive" className="flex-1 bg-amber-500 hover:bg-amber-600">
            继续提交
          </Button>
        </div>
      </DialogContent>
    </Dialog>;
}