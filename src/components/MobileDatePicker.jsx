// @ts-ignore;
import React, { useState, useRef, useEffect } from 'react';
// @ts-ignore;
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui';
// @ts-ignore;
import { Calendar, X } from 'lucide-react';

// 简化版iPhone风格的滚动选择器列
function ScrollPicker({ items, selectedValue, onSelect, className = '' }) {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const itemHeight = 40;
  const visibleCount = 7;
  const totalHeight = itemHeight * visibleCount;
  const paddingItems = Math.floor(visibleCount / 2);

  // 初始化滚动位置
  useEffect(() => {
    if (selectedValue !== undefined && containerRef.current) {
      const selectedIndex = items.findIndex(item => item.value === selectedValue);
      if (selectedIndex >= 0) {
        // 让选中项居中，考虑padding
        const targetScrollTop = selectedIndex * itemHeight;
        containerRef.current.scrollTop = targetScrollTop;
        setScrollTop(targetScrollTop);
      }
    }
  }, [selectedValue, items]);

  // 极简的滚动处理
  const handleScroll = (e) => {
    const currentScrollTop = e.target.scrollTop;
    setScrollTop(currentScrollTop);

    // 简单计算：哪个项目最接近中心
    const selectedIndex = Math.round(currentScrollTop / itemHeight);
    const clampedIndex = Math.max(0, Math.min(selectedIndex, items.length - 1));

    // 更新选中值
    if (items[clampedIndex] && items[clampedIndex].value !== selectedValue) {
      onSelect(items[clampedIndex].value);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div
        ref={containerRef}
        className="overflow-y-auto scrollbar-hide"
        style={{ height: `${totalHeight}px` }}
        onScroll={handleScroll}
      >
        {/* 顶部填充 */}
        {Array.from({ length: paddingItems }).map((_, i) => (
          <div key={`top-${i}`} style={{ height: `${itemHeight}px` }} />
        ))}

        {/* 实际选项 */}
        {items.map((item, index) => {
          // 简化视觉效果计算
          const itemTop = (paddingItems + index) * itemHeight;
          const itemCenter = itemTop + itemHeight / 2;
          const viewportCenter = scrollTop + totalHeight / 2;
          const distance = Math.abs(itemCenter - viewportCenter);
          const isSelected = distance < itemHeight / 2;
          const opacity = Math.max(0.4, 1 - distance / (itemHeight * 1.5));
          const scale = isSelected ? 1 : Math.max(0.9, 1 - distance / (itemHeight * 4));

          return (
            <div
              key={item.value}
              className={`flex items-center justify-center text-center transition-all duration-200 ${
                isSelected ? 'font-semibold text-gray-900' : 'text-gray-500'
              }`}
              style={{
                height: `${itemHeight}px`,
                opacity,
                transform: `scale(${scale})`,
              }}
              onClick={() => onSelect(item.value)}
            >
              {item.label}
            </div>
          );
        })}

        {/* 底部填充 */}
        {Array.from({ length: paddingItems }).map((_, i) => (
          <div key={`bottom-${i}`} style={{ height: `${itemHeight}px` }} />
        ))}
      </div>

      {/* 选中指示器 */}
      <div
        className="absolute left-0 right-0 border-y border-gray-300 bg-gray-50/30 pointer-events-none"
        style={{
          top: `${totalHeight / 2 - itemHeight / 2}px`,
          height: `${itemHeight}px`,
        }}
      />
    </div>
  );
}

export function MobileDatePicker({
  open,
  onOpenChange,
  selectedDate,
  onSelect
}) {
  const currentDate = selectedDate || new Date();
  const [tempYear, setTempYear] = useState(currentDate.getFullYear());
  const [tempMonth, setTempMonth] = useState(currentDate.getMonth() + 1);
  const [tempDay, setTempDay] = useState(currentDate.getDate());

  // 生成年份选项（当前年份前后10年）
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => {
    const year = currentYear - 10 + i;
    return { value: year, label: `${year}年` };
  });

  // 生成月份选项
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}月`
  }));

  // 生成日期选项（根据年月计算天数）
  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(tempYear, tempMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}日`
  }));

  // 当月份或年份改变时，调整日期
  useEffect(() => {
    const maxDay = getDaysInMonth(tempYear, tempMonth);
    if (tempDay > maxDay) {
      setTempDay(maxDay);
    }
  }, [tempYear, tempMonth, tempDay]);

  const handleConfirm = () => {
    const newDate = new Date(tempYear, tempMonth - 1, tempDay);
    onSelect(newDate);
    onOpenChange(false);
  };

  const handleCancel = () => {
    // 重置为原来的日期
    const originalDate = selectedDate || new Date();
    setTempYear(originalDate.getFullYear());
    setTempMonth(originalDate.getMonth() + 1);
    setTempDay(originalDate.getDate());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[400px] max-h-[70vh] p-0 rounded-t-3xl shadow-2xl border-0"
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
              onClick={handleCancel}
              className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 font-medium px-3 py-1"
            >
              取消
            </Button>
            <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              选择日期
            </DialogTitle>
            <Button
              variant="ghost"
              onClick={handleConfirm}
              className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 font-medium px-3 py-1"
            >
              确定
            </Button>
          </div>
        </DialogHeader>

        {/* 日期选择器 */}
        <div className="bg-white">
          <div className="grid grid-cols-3 gap-0 px-4 py-6">
            {/* 年份选择 */}
            <div className="flex flex-col items-center">
              <div className="text-sm font-medium text-gray-500 mb-3">年</div>
              <ScrollPicker
                items={years}
                selectedValue={tempYear}
                onSelect={setTempYear}
                className="w-full"
              />
            </div>

            {/* 月份选择 */}
            <div className="flex flex-col items-center">
              <div className="text-sm font-medium text-gray-500 mb-3">月</div>
              <ScrollPicker
                items={months}
                selectedValue={tempMonth}
                onSelect={setTempMonth}
                className="w-full"
              />
            </div>

            {/* 日期选择 */}
            <div className="flex flex-col items-center">
              <div className="text-sm font-medium text-gray-500 mb-3">日</div>
              <ScrollPicker
                items={days}
                selectedValue={tempDay}
                onSelect={setTempDay}
                className="w-full"
              />
            </div>
          </div>

          {/* 选中日期预览 */}
          <div className="px-6 py-4 bg-blue-50 border-t border-gray-100">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">已选择</div>
              <div className="text-lg font-semibold text-blue-600">
                {tempYear}年{tempMonth}月{tempDay}日
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </Dialog>
  );
}