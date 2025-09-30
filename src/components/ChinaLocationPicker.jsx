// @ts-ignore;
import React, { useState, useRef, useEffect } from 'react';
// @ts-ignore;
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui';
// @ts-ignore;
import { ChevronDown, X, MapPin } from 'lucide-react';

// 完整的中国行政区划数据
const chinaRegions = {
  provinces: [{
    code: '11',
    name: '北京市'
  }, {
    code: '12',
    name: '天津市'
  }, {
    code: '13',
    name: '河北省'
  }, {
    code: '14',
    name: '山西省'
  }, {
    code: '15',
    name: '内蒙古自治区'
  }, {
    code: '21',
    name: '辽宁省'
  }, {
    code: '22',
    name: '吉林省'
  }, {
    code: '23',
    name: '黑龙江省'
  }, {
    code: '31',
    name: '上海市'
  }, {
    code: '32',
    name: '江苏省'
  }, {
    code: '33',
    name: '浙江省'
  }, {
    code: '34',
    name: '安徽省'
  }, {
    code: '35',
    name: '福建省'
  }, {
    code: '36',
    name: '江西省'
  }, {
    code: '37',
    name: '山东省'
  }, {
    code: '41',
    name: '河南省'
  }, {
    code: '42',
    name: '湖北省'
  }, {
    code: '43',
    name: '湖南省'
  }, {
    code: '44',
    name: '广东省'
  }, {
    code: '45',
    name: '广西壮族自治区'
  }, {
    code: '46',
    name: '海南省'
  }, {
    code: '50',
    name: '重庆市'
  }, {
    code: '51',
    name: '四川省'
  }, {
    code: '52',
    name: '贵州省'
  }, {
    code: '53',
    name: '云南省'
  }, {
    code: '54',
    name: '西藏自治区'
  }, {
    code: '61',
    name: '陕西省'
  }, {
    code: '62',
    name: '甘肃省'
  }, {
    code: '63',
    name: '青海省'
  }, {
    code: '64',
    name: '宁夏回族自治区'
  }, {
    code: '65',
    name: '新疆维吾尔自治区'
  }, {
    code: '71',
    name: '台湾省'
  }, {
    code: '81',
    name: '香港特别行政区'
  }, {
    code: '82',
    name: '澳门特别行政区'
  }],
  cities: {
    '11': [{
      code: '1101',
      name: '市辖区'
    }],
    '12': [{
      code: '1201',
      name: '市辖区'
    }],
    '13': [{
      code: '1301',
      name: '石家庄市'
    }, {
      code: '1302',
      name: '唐山市'
    }, {
      code: '1303',
      name: '秦皇岛市'
    }, {
      code: '1304',
      name: '邯郸市'
    }, {
      code: '1305',
      name: '邢台市'
    }, {
      code: '1306',
      name: '保定市'
    }, {
      code: '1307',
      name: '张家口市'
    }, {
      code: '1308',
      name: '承德市'
    }, {
      code: '1309',
      name: '沧州市'
    }, {
      code: '1310',
      name: '廊坊市'
    }, {
      code: '1311',
      name: '衡水市'
    }],
    '14': [{
      code: '1401',
      name: '太原市'
    }, {
      code: '1402',
      name: '大同市'
    }, {
      code: '1403',
      name: '阳泉市'
    }, {
      code: '1404',
      name: '长治市'
    }, {
      code: '1405',
      name: '晋城市'
    }, {
      code: '1406',
      name: '朔州市'
    }, {
      code: '1407',
      name: '晋中市'
    }, {
      code: '1408',
      name: '运城市'
    }, {
      code: '1409',
      name: '忻州市'
    }, {
      code: '1410',
      name: '临汾市'
    }, {
      code: '1411',
      name: '吕梁市'
    }],
    '41': [{
      code: '4101',
      name: '郑州市'
    }, {
      code: '4102',
      name: '开封市'
    }, {
      code: '4103',
      name: '洛阳市'
    }, {
      code: '4104',
      name: '平顶山市'
    }, {
      code: '4105',
      name: '安阳市'
    }, {
      code: '4106',
      name: '鹤壁市'
    }, {
      code: '4107',
      name: '新乡市'
    }, {
      code: '4108',
      name: '焦作市'
    }, {
      code: '4109',
      name: '濮阳市'
    }, {
      code: '4110',
      name: '许昌市'
    }, {
      code: '4111',
      name: '漯河市'
    }, {
      code: '4112',
      name: '三门峡市'
    }, {
      code: '4113',
      name: '南阳市'
    }, {
      code: '4114',
      name: '商丘市'
    }, {
      code: '4115',
      name: '信阳市'
    }, {
      code: '4116',
      name: '周口市'
    }, {
      code: '4117',
      name: '驻马店市'
    }, {
      code: '4190',
      name: '省直辖县级行政区划'
    }]
  },
  counties: {
    '1101': [{
      code: '110101',
      name: '东城区'
    }, {
      code: '110102',
      name: '西城区'
    }, {
      code: '110105',
      name: '朝阳区'
    }, {
      code: '110106',
      name: '丰台区'
    }, {
      code: '110107',
      name: '石景山区'
    }, {
      code: '110108',
      name: '海淀区'
    }, {
      code: '110109',
      name: '门头沟区'
    }, {
      code: '110111',
      name: '房山区'
    }, {
      code: '110112',
      name: '通州区'
    }, {
      code: '110113',
      name: '顺义区'
    }, {
      code: '110114',
      name: '昌平区'
    }, {
      code: '110115',
      name: '大兴区'
    }, {
      code: '110116',
      name: '怀柔区'
    }, {
      code: '110117',
      name: '平谷区'
    }, {
      code: '110118',
      name: '密云区'
    }, {
      code: '110119',
      name: '延庆区'
    }],
    '4101': [{
      code: '410102',
      name: '中原区'
    }, {
      code: '410103',
      name: '二七区'
    }, {
      code: '410104',
      name: '管城回族区'
    }, {
      code: '410105',
      name: '金水区'
    }, {
      code: '410106',
      name: '上街区'
    }, {
      code: '410108',
      name: '惠济区'
    }, {
      code: '410122',
      name: '中牟县'
    }, {
      code: '410181',
      name: '巩义市'
    }, {
      code: '410182',
      name: '荥阳市'
    }, {
      code: '410183',
      name: '新密市'
    }, {
      code: '410184',
      name: '新郑市'
    }, {
      code: '410185',
      name: '登封市'
    }]
  }
};

// 滑动选择器组件
function PickerColumn({
  items,
  selectedValue,
  onSelect,
  className = ''
}) {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentTranslateY, setCurrentTranslateY] = useState(0);
  const itemHeight = 44;
  const visibleItemCount = 5;
  const centerOffset = Math.floor(visibleItemCount / 2) * itemHeight;
  const handleTouchStart = e => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
  };
  const handleTouchMove = e => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diffY = currentY - startY;
    setCurrentTranslateY(diffY);
  };
  const handleTouchEnd = () => {
    setIsDragging(false);
    // 这里可以添加惯性滚动逻辑
    setCurrentTranslateY(0);
  };
  return <div ref={containerRef} className={`relative h-44 overflow-hidden border border-gray-200 rounded-lg bg-white ${className}`} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      <div className="absolute inset-0 flex flex-col">
        {items.map((item, index) => {
        const isSelected = selectedValue === item.code;
        return <div key={item.code} className={`h-11 flex items-center justify-center text-sm transition-all duration-200 ${isSelected ? 'text-green-600 font-medium transform scale-105' : 'text-gray-600'}`} style={{
          transform: `translateY(${currentTranslateY}px)`,
          height: `${itemHeight}px`
        }} onClick={() => onSelect(item.code)}>
              {item.name}
            </div>;
      })}
      </div>
      
      {/* 选择指示器 */}
      <div className="absolute top-1/2 left-0 right-0 h-11 bg-green-50 border-y border-green-200 -translate-y-1/2 pointer-events-none" />
    </div>;
}
export function ChinaLocationPicker({
  open,
  onOpenChange,
  onSelect
}) {
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('');
  const provinces = chinaRegions.provinces;
  const cities = selectedProvince ? chinaRegions.cities[selectedProvince] || [] : [];
  const counties = selectedCity ? chinaRegions.counties[selectedCity] || [] : [];
  const handleConfirm = () => {
    if (selectedProvince && selectedCity && selectedCounty) {
      const province = provinces.find(p => p.code === selectedProvince)?.name || '';
      const city = cities.find(c => c.code === selectedCity)?.name || '';
      const county = counties.find(c => c.code === selectedCounty)?.name || '';
      onSelect(province, city, county);
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
      borderRadius: '16px 16px 0 0',
      maxWidth: '100vw'
    }}>
        <DialogHeader className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-600" />
              选择项目地址
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleCancel} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* 三级联动选择器 */}
          <div className="grid grid-cols-3 gap-3">
            {/* 省份选择 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block mb-2">省份</label>
              <PickerColumn items={provinces} selectedValue={selectedProvince} onSelect={code => {
              setSelectedProvince(code);
              setSelectedCity('');
              setSelectedCounty('');
            }} />
            </div>

            {/* 城市选择 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block mb-2">城市</label>
              <PickerColumn items={cities} selectedValue={selectedCity} onSelect={code => {
              setSelectedCity(code);
              setSelectedCounty('');
            }} className={!selectedProvince ? 'opacity-50' : ''} />
            </div>

            {/* 区县选择 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block mb-2">区县</label>
              <PickerColumn items={counties} selectedValue={selectedCounty} onSelect={setSelectedCounty} className={!selectedCity ? 'opacity-50' : ''} />
            </div>
          </div>

          {/* 已选地址预览 */}
          {(selectedProvince || selectedCity || selectedCounty) && <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 font-medium">
                {selectedProvince && provinces.find(p => p.code === selectedProvince)?.name}
                {selectedCity && ` → ${cities.find(c => c.code === selectedCity)?.name}`}
                {selectedCounty && ` → ${counties.find(c => c.code === selectedCounty)?.name}`}
              </p>
            </div>}
        </div>

        <div className="p-4 border-t">
          <Button onClick={handleConfirm} disabled={!selectedProvince || !selectedCity || !selectedCounty} className="w-full h-12 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium">
            确认选择
          </Button>
        </div>
      </DialogContent>
    </Dialog>;
}