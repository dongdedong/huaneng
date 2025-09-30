// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, Input } from '@/components/ui';
// @ts-ignore;
import { ChevronDown, Search, X } from 'lucide-react';

export function MobileDepartmentSelect({
  value,
  onChange,
  departments
}) {
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const filteredDepartments = departments.filter(dept => dept.toLowerCase().includes(searchText.toLowerCase()));
  return <div>
      <Button variant="outline" onClick={() => setOpen(true)} className="w-full justify-between h-12 rounded-lg border-gray-300 bg-white">
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {value || '请选择项目开发部'}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[70vh] p-0 rounded-2xl" style={{
        position: 'fixed',
        bottom: 0,
        top: 'auto',
        transform: 'translate(-50%, 0)',
        left: '50%',
        borderRadius: '16px 16px 0 0'
      }}>
          <DialogHeader className="px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base">选择开发部</DialogTitle>
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input placeholder="搜索开发部..." value={searchText} onChange={e => setSearchText(e.target.value)} className="pl-9 h-10 rounded-lg bg-gray-50 border-gray-200" />
            </div>
          </div>

          <div className="overflow-y-auto max-h-60">
            {filteredDepartments.map(dept => <Button key={dept} variant="ghost" onClick={() => {
            onChange(dept);
            setOpen(false);
          }} className={`w-full justify-start h-12 rounded-none border-b border-gray-100 ${value === dept ? 'bg-green-50 text-green-600' : 'text-gray-900'}`}>
                {dept}
              </Button>)}
          </div>
        </DialogContent>
      </Dialog>
    </div>;
}