// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Eye, Edit3 } from 'lucide-react';

export function RecordCard({
  record,
  onView,
  onEdit,
  isMine = false
}) {
  return <div className="p-3 border rounded-lg hover:bg-gray-50">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">{record.reporter_name}</p>
          <p className="text-sm text-gray-600">{record.project_department}</p>
          <p className="text-xs text-gray-500">{record.project_location?.full_address || '未填写地址'}</p>
        </div>
        <div className="text-right">
          <p className="text-sm">{record.project_date}</p>
          <p className="text-xs text-gray-500">{record.project_type}</p>
          {isMine && <div className="flex gap-1 mt-1">
              <Button variant="ghost" size="sm" onClick={() => onView(record)}>
                <Eye className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onEdit(record)}>
                <Edit3 className="h-3 w-3" />
              </Button>
            </div>}
        </div>
      </div>
    </div>;
}