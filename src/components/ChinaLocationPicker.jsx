// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui';
// @ts-ignore;
import { MapPin, Check } from 'lucide-react';

// 中国省市县数据
const CHINA_LOCATION_DATA = {
  provinces: ['北京市', '天津市', '河北省', '山西省', '内蒙古自治区', '辽宁省', '吉林省', '黑龙江省', '上海市', '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省', '河南省', '湖北省', '湖南省', '广东省', '广西壮族自治区', '海南省', '重庆市', '四川省', '贵州省', '云南省', '西藏自治区', '陕西省', '甘肃省', '青海省', '宁夏回族自治区', '新疆维吾尔自治区'],
  cities: {
    '河南省': ['郑州市', '开封市', '洛阳市', '平顶山市', '安阳市', '鹤壁市', '新乡市', '焦作市', '濮阳市', '许昌市', '漯河市', '三门峡市', '南阳市', '商丘市', '信阳市', '周口市', '驻马店市', '济源市'],
    '河北省': ['石家庄市', '唐山市', '秦皇岛市', '邯郸市', '邢台市', '保定市', '张家口市', '承德市', '沧州市', '廊坊市', '衡水市'],
    '山东省': ['济南市', '青岛市', '淄博市', '枣庄市', '东营市', '烟台市', '潍坊市', '济宁市', '泰安市', '威海市', '日照市', '临沂市', '德州市', '聊城市', '滨州市', '菏泽市'],
    '江苏省': ['南京市', '无锡市', '徐州市', '常州市', '苏州市', '南通市', '连云港市', '淮安市', '盐城市', '扬州市', '镇江市', '泰州市', '宿迁市'],
    '安徽省': ['合肥市', '芜湖市', '蚌埠市', '淮南市', '马鞍山市', '淮北市', '铜陵市', '安庆市', '黄山市', '滁州市', '阜阳市', '宿州市', '六安市', '亳州市', '池州市', '宣城市']
  },
  counties: {
    '郑州市': ['中原区', '二七区', '管城回族区', '金水区', '上街区', '惠济区', '中牟县', '巩义市', '荥阳市', '新密市', '新郑市', '登封市'],
    '开封市': ['龙亭区', '顺河回族区', '鼓楼区', '禹王台区', '祥符区', '杞县', '通许县', '尉氏县', '兰考县'],
    '洛阳市': ['老城区', '西工区', '瀍河回族区', '涧西区', '吉利区', '洛龙区', '孟津县', '新安县', '栾川县', '嵩县', '汝阳县', '宜阳县', '洛宁县', '伊川县', '偃师市'],
    '南阳市': ['宛城区', '卧龙区', '南召县', '方城县', '西峡县', '镇平县', '内乡县', '淅川县', '社旗县', '唐河县', '新野县', '桐柏县', '邓州市']
  }
};
export function ChinaLocationPicker({
  open,
  onOpenChange,
  onSelect
}) {
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('');
  const [cities, setCities] = useState([]);
  const [counties, setCounties] = useState([]);

  // 获取省份列表
  const provinces = CHINA_LOCATION_DATA.provinces;

  // 当省份改变时更新城市列表
  useEffect(() => {
    if (selectedProvince && CHINA_LOCATION_DATA.cities[selectedProvince]) {
      setCities(CHINA_LOCATION_DATA.cities[selectedProvince]);
      setSelectedCity('');
      setSelectedCounty('');
      setCounties([]);
    } else {
      setCities([]);
      setSelectedCity('');
      setSelectedCounty('');
      setCounties([]);
    }
  }, [selectedProvince]);

  // 当城市改变时更新区县列表
  useEffect(() => {
    if (selectedCity && CHINA_LOCATION_DATA.counties[selectedCity]) {
      setCounties(CHINA_LOCATION_DATA.counties[selectedCity]);
      setSelectedCounty('');
    } else {
      setCounties([]);
      setSelectedCounty('');
    }
  }, [selectedCity]);
  const handleConfirm = () => {
    if (selectedProvince && selectedCity && selectedCounty) {
      onSelect(selectedProvince, selectedCity, selectedCounty);
      onOpenChange(false);

      // 重置选择
      setSelectedProvince('');
      setSelectedCity('');
      setSelectedCounty('');
    }
  };
  const handleCancel = () => {
    onOpenChange(false);
    setSelectedProvince('');
    setSelectedCity('');
    setSelectedCounty('');
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            选择项目所在地
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 省份选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">省份</label>
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {provinces.map(province => <button key={province} onClick={() => setSelectedProvince(province)} className={`p-2 text-sm rounded-lg border transition-colors ${selectedProvince === province ? 'bg-green-500 text-white border-green-500' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}>
                  {province}
                </button>)}
            </div>
          </div>

          {/* 城市选择 */}
          {selectedProvince && cities.length > 0 && <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">城市</label>
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {cities.map(city => <button key={city} onClick={() => setSelectedCity(city)} className={`p-2 text-sm rounded-lg border transition-colors ${selectedCity === city ? 'bg-green-500 text-white border-green-500' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}>
                    {city}
                  </button>)}
              </div>
            </div>}

          {/* 区县选择 */}
          {selectedCity && counties.length > 0 && <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">区县</label>
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {counties.map(county => <button key={county} onClick={() => setSelectedCounty(county)} className={`p-2 text-sm rounded-lg border transition-colors ${selectedCounty === county ? 'bg-green-500 text-white border-green-500' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}>
                    {county}
                  </button>)}
              </div>
            </div>}

          {/* 已选择地址显示 */}
          {selectedProvince && selectedCity && selectedCounty && <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 font-medium">
                已选择：{selectedProvince} {selectedCity} {selectedCounty}
              </p>
            </div>}

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              取消
            </Button>
            <Button onClick={handleConfirm} disabled={!selectedProvince || !selectedCity || !selectedCounty} className="flex-1 bg-green-500 hover:bg-green-600">
              <Check className="h-4 w-4 mr-2" />
              确认
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
}