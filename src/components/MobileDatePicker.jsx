// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, Calendar } from '@/components/ui';
// @ts-ignore;
import { CalendarIcon, X } from 'lucide-react';

export function MobileDatePicker({
  open,
  onOpenChange,
  selectedDate,
  onSelect
}) {
  const formatDate = date => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] p-0 rounded-t-2xl" style={{
      position: 'fixed',
      bottom: 0,
      top: 'auto',
      transform: 'translate(-50%, 0)',
      left: '50%',
      borderRadius: '16px 16px 0 0'
    }}>
        <DialogHeader className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base">选择日期</DialogTitle>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="p-4">
          <Calendar mode="single" selected={selectedDate} onSelect={date => {
          onSelect(date || new Date());
          onOpenChange(false);
        }} initialFocus className="rounded-md" />
        </div>
        
        <div className="p-4 border-t">
          <Button onClick={() => onOpenChange(false)} className="w-full bg-green-600 hover:bg-green-700">
            确认选择
          </Button>
        </div>
      </DialogContent>
    </Dialog>;
}