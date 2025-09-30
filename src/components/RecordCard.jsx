// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Eye, Edit3, Calendar, MapPin, Building2, Lightbulb, User } from 'lucide-react';

export function RecordCard({
  record,
  onView,
  onEdit,
  isMine = false
}) {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
  };

  const getProjectTypeColor = (type) => {
    const colors = {
      '分布式光伏': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      '集中式光伏': 'bg-orange-100 text-orange-800 border-orange-200',
      '分散式风电': 'bg-blue-100 text-blue-800 border-blue-200',
      '集中式风电': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      '源网荷储项目': 'bg-purple-100 text-purple-800 border-purple-200',
      '千乡万村御风行动': 'bg-green-100 text-green-800 border-green-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* 卡片头部 */}
      <div className="p-4 border-b border-gray-50">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-base">{record.reporter_name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Building2 className="h-3 w-3 text-gray-400" />
                <span className="text-sm text-gray-600">{record.project_department}</span>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          {isMine && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(record)}
                className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(record)}
                className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 rounded-lg"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 卡片内容 */}
      <div className="p-4 space-y-3">
        {/* 项目日期 */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">对接日期：</span>
          <span className="text-sm font-medium text-gray-900">{formatDate(record.project_date)}</span>
        </div>

        {/* 项目地址 */}
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
          <div className="flex-1">
            <span className="text-sm text-gray-600">项目地址：</span>
            <span className="text-sm font-medium text-gray-900 block">
              {record.project_location?.full_address || '未填写地址'}
            </span>
          </div>
        </div>

        {/* 项目类型 */}
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">项目类型：</span>
          <span className={`text-xs px-2 py-1 rounded-lg border font-medium ${getProjectTypeColor(record.project_type)}`}>
            {record.project_type}
          </span>
        </div>

        {/* 合作单位（如果有） */}
        {record.partner_unit && (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">合作单位：</span>
            <span className="text-sm font-medium text-gray-900">{record.partner_unit}</span>
          </div>
        )}
      </div>

      {/* 卡片底部 */}
      <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>提交时间：{new Date(record.createdAt).toLocaleString()}</span>
          {isMine && (
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
              我的记录
            </span>
          )}
        </div>
      </div>
    </div>
  );
}