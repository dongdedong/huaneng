// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, Input } from '@/components/ui';
// @ts-ignore;
import { ChevronDown, Search, X, Building2 } from 'lucide-react';

export function MobileDepartmentSelect({
  value,
  onChange,
  departments
}) {
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const filteredDepartments = departments.filter(dept =>
    dept.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-full justify-between h-14 rounded-2xl border-2 border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-green-300 transition-all duration-200"
      >
        <div className="flex items-center">
          <Building2 className="h-5 w-5 text-gray-400 mr-3" />
          <span className={value ? 'text-gray-900' : 'text-gray-500'}>
            {value || '请选择项目开发部'}
          </span>
        </div>
        <ChevronDown className="h-5 w-5 text-gray-400" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="sm:max-w-[425px] max-h-[75vh] p-0 rounded-t-3xl shadow-2xl border-0"
          style={{
            position: 'fixed',
            bottom: 0,
            top: 'auto',
            transform: 'translate(-50%, 0)',
            left: '50%',
            borderRadius: '24px 24px 0 0',
            maxWidth: '100vw',
            backgroundColor: '#fafafa'
          }}
        >
          {/* 头部 */}
          <DialogHeader className="px-6 py-4 bg-white rounded-t-3xl border-b border-gray-100">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setOpen(false)}
                className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 font-medium px-3 py-1"
              >
                取消
              </Button>
              <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-500" />
                选择开发部
              </DialogTitle>
              <div className="w-12"></div>
            </div>
          </DialogHeader>

          {/* 搜索栏 */}
          <div className="p-4 bg-white border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="搜索开发部门..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="pl-12 h-12 rounded-2xl bg-gray-50 border-gray-200 focus:border-blue-500 focus:bg-white transition-all duration-200"
              />
            </div>
          </div>

          {/* 部门列表 */}
          <div className="overflow-y-auto max-h-80 bg-white">
            {filteredDepartments.length === 0 ? (
              <div className="py-8 text-center">
                <div className="text-gray-400 text-lg mb-2">🔍</div>
                <p className="text-gray-500">未找到匹配的部门</p>
              </div>
            ) : (
              filteredDepartments.map((dept, index) => (
                <Button
                  key={dept}
                  variant="ghost"
                  onClick={() => {
                    onChange(dept);
                    setOpen(false);
                    setSearchText('');
                  }}
                  className={`w-full justify-start h-14 rounded-none px-6 transition-all duration-200 ${
                    value === dept
                      ? 'bg-green-50 text-green-600 border-r-4 border-green-500 font-semibold'
                      : 'text-gray-800 hover:bg-gray-50'
                  } ${index !== filteredDepartments.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <div className="flex items-center gap-3 w-full">
                    <Building2 className={`h-4 w-4 ${value === dept ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className="flex-1 text-left">{dept}</span>
                    {value === dept && (
                      <div className="text-green-600 text-lg">✓</div>
                    )}
                  </div>
                </Button>
              ))
            )}
          </div>

          {/* 当前选择显示 */}
          {value && (
            <div className="px-6 py-4 bg-green-50 border-t border-green-100">
              <div className="text-center">
                <div className="text-sm text-green-600 mb-1">已选择</div>
                <div className="text-base font-semibold text-green-800">{value}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}