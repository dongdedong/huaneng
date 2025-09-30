// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui';
// @ts-ignore;
import { AlertTriangle } from 'lucide-react';

export function DuplicateConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  duplicateRecords
}) {
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle>重复数据提醒</DialogTitle>
          </div>
          <DialogDescription className="text-amber-700">
            以下类似的项目信息已存在，确认要继续提交吗？
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {duplicateRecords.map((record, index) => <div key={index} className="p-2 border border-amber-200 rounded-md bg-amber-50">
              <p className="text-sm font-medium">项目：{record.project_type}</p>
              <p className="text-xs text-gray-600">地点：{record.project_location?.full_address}</p>
              <p className="text-xs text-gray-600">合作单位：{record.partner_unit || '未填写'}</p>
              <p className="text-xs text-gray-500">填报人：{record.reporter_name}</p>
            </div>)}
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            确认提交
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}