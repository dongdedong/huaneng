// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui';
// @ts-ignore;
import { ChevronDown, X } from 'lucide-react';

export function LocationPicker({
  open,
  onOpenChange,
  onSelect
}) {
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('');
  const provinces = {
    '北京市': ['东城区', '西城区', '朝阳区', '丰台区', '石景山区', '海淀区', '门头沟区', '房山区', '通州区', '顺义区', '昌平区', '大兴区', '怀柔区', '平谷区', '密云区', '延庆区'],
    '河南省': ['郑州市', '开封市', '洛阳市', '平顶山市', '安阳市', '鹤壁市', '新乡市', '焦作市', '濮阳市', '许昌市', '漯河市', '三门峡市', '南阳市', '商丘市', '信阳市', '周口市', '驻马店市', '济源市'],
    '河北省': ['石家庄市', '唐山市', '秦皇岛市', '邯郸市', '邢台市', '保定市', '张家口市', '承德市', '沧州市', '廊坊市', '衡水市'],
    '山西省': ['太原市', '大同市', '阳泉市', '长治市', '晋城市', '朔州市', '晋中市', '运城市', '忻州市', '临汾市', '吕梁市'],
    '山东省': ['济南市', '青岛市', '淄博市', '枣庄市', '东营市', '烟台市', '潍坊市', '济宁市', '泰安市', '威海市', '日照市', '临沂市', '德州市', '聊城市', '滨州市', '菏泽市']
  };
  const handleConfirm = () => {
    if (selectedProvince && selectedCity) {
      onSelect(selectedProvince, selectedCity, selectedCity); // 使用城市作为区县
      onOpenChange(false);
      resetSelection();
    }
  };
  const resetSelection = () => {
    setSelectedProvince('');
    setSelectedCity('');
    setSelectedCounty('');
  };
  const handleCancel = () => {
    onOpenChange(false);
    resetSelection();
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
            <DialogTitle className="text-base font-medium">选择项目地址</DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleCancel} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* 省份选择 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">省份</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(provinces).map(province => <Button key={province} variant={selectedProvince === province ? "default" : "outline"} size="sm" onClick={() => {
              setSelectedProvince(province);
              setSelectedCity('');
            }} className={`h-10 rounded-lg ${selectedProvince === province ? 'bg-green-600 text-white' : 'border-gray-300'}`}>
                  {province}
                </Button>)}
            </div>
          </div>

          {/* 城市选择 */}
          {selectedProvince && <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">城市</label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {provinces[selectedProvince].map(city => <Button key={city} variant={selectedCity === city ? "default" : "outline"} size="sm" onClick={() => setSelectedCity(city)} className={`h-10 rounded-lg ${selectedCity === city ? 'bg-green-600 text-white' : 'border-gray-300'}`}>
                    {city}
                  </Button>)}
              </div>
            </div>}

          {/* 已选地址预览 */}
          {(selectedProvince || selectedCity) && <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-sm text-gray-600">
                {selectedProvince && `${selectedProvince}`}
                {selectedCity && ` ${selectedCity}`}
              </p>
            </div>}
        </div>

        <div className="p-4 border-t">
          <Button onClick={handleConfirm} disabled={!selectedProvince || !selectedCity} className="w-full h-12 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium">
            确认选择
          </Button>
        </div>
      </DialogContent>
    </Dialog>;
}