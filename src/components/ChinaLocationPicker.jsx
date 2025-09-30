// @ts-ignore;
import React, { useState, useRef, useEffect, forwardRef } from 'react';
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
      name: '北京市'
    }],
    '12': [{
      code: '1201',
      name: '天津市'
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
    '15': [{
      code: '1501',
      name: '呼和浩特市'
    }, {
      code: '1502',
      name: '包头市'
    }, {
      code: '1503',
      name: '乌海市'
    }, {
      code: '1504',
      name: '赤峰市'
    }, {
      code: '1505',
      name: '通辽市'
    }, {
      code: '1506',
      name: '鄂尔多斯市'
    }, {
      code: '1507',
      name: '呼伦贝尔市'
    }, {
      code: '1508',
      name: '巴彦淖尔市'
    }, {
      code: '1509',
      name: '乌兰察布市'
    }, {
      code: '1522',
      name: '兴安盟'
    }, {
      code: '1525',
      name: '锡林郭勒盟'
    }, {
      code: '1529',
      name: '阿拉善盟'
    }],
    '21': [{
      code: '2101',
      name: '沈阳市'
    }, {
      code: '2102',
      name: '大连市'
    }, {
      code: '2103',
      name: '鞍山市'
    }, {
      code: '2104',
      name: '抚顺市'
    }, {
      code: '2105',
      name: '本溪市'
    }, {
      code: '2106',
      name: '丹东市'
    }, {
      code: '2107',
      name: '锦州市'
    }, {
      code: '2108',
      name: '营口市'
    }, {
      code: '2109',
      name: '阜新市'
    }, {
      code: '2110',
      name: '辽阳市'
    }, {
      code: '2111',
      name: '盘锦市'
    }, {
      code: '2112',
      name: '铁岭市'
    }, {
      code: '2113',
      name: '朝阳市'
    }, {
      code: '2114',
      name: '葫芦岛'
    }],
    '22': [{
      code: '2201',
      name: '长春市'
    }, {
      code: '2202',
      name: '吉林市'
    }, {
      code: '2203',
      name: '四平市'
    }, {
      code: '2204',
      name: '辽源市'
    }, {
      code: '2205',
      name: '通化市'
    }, {
      code: '2206',
      name: '白山市'
    }, {
      code: '2207',
      name: '松原市'
    }, {
      code: '2208',
      name: '白城市'
    }, {
      code: '2224',
      name: '延边朝鲜族自治州'
    }],
    '23': [{
      code: '2301',
      name: '哈尔滨市'
    }, {
      code: '2302',
      name: '齐齐哈尔市'
    }, {
      code: '2303',
      name: '鸡西市'
    }, {
      code: '2304',
      name: '鹤岗市'
    }, {
      code: '2305',
      name: '双鸭山市'
    }, {
      code: '2306',
      name: '大庆市'
    }, {
      code: '2307',
      name: '伊春市'
    }, {
      code: '2308',
      name: '佳木斯'
    }, {
      code: '2309',
      name: '七台河市'
    }, {
      code: '2310',
      name: '牡丹江市'
    }, {
      code: '2311',
      name: '黑河市'
    }, {
      code: '2312',
      name: '绥化市'
    }, {
      code: '2327',
      name: '大兴安岭地区'
    }],
    '31': [{
      code: '3101',
      name: '上海市'
    }],
    '32': [{
      code: '3201',
      name: '南京市'
    }, {
      code: '3202',
      name: '无锡市'
    }, {
      code: '3203',
      name: '徐州市'
    }, {
      code: '3204',
      name: '常州市'
    }, {
      code: '3205',
      name: '苏州市'
    }, {
      code: '3206',
      name: '南通市'
    }, {
      code: '3207',
      name: '连云港市'
    }, {
      code: '3208',
      name: '淮安市'
    }, {
      code: '3209',
      name: '盐城市'
    }, {
      code: '3210',
      name: '扬州市'
    }, {
      code: '3211',
      name: '镇江市'
    }, {
      code: '3212',
      name: '泰州市'
    }, {
      code: '3213',
      name: '宿迁市'
    }],
    '33': [{
      code: '3301',
      name: '杭州市'
    }, {
      code: '3302',
      name: '宁波市'
    }, {
      code: '3303',
      name: '温州市'
    }, {
      code: '3304',
      name: '嘉兴市'
    }, {
      code: '3305',
      name: '湖州市'
    }, {
      code: '3306',
      name: '绍兴市'
    }, {
      code: '3307',
      name: '金华市'
    }, {
      code: '3308',
      name: '衢州市'
    }, {
      code: '3309',
      name: '舟山市'
    }, {
      code: '3310',
      name: '台州市'
    }, {
      code: '3311',
      name: '丽水市'
    }],
    '34': [{
      code: '3401',
      name: '合肥市'
    }, {
      code: '3402',
      name: '芜湖市'
    }, {
      code: '3403',
      name: '蚌埠市'
    }, {
      code: '3404',
      name: '淮南市'
    }, {
      code: '3405',
      name: '马鞍山市'
    }, {
      code: '3406',
      name: '淮北市'
    }, {
      code: '3407',
      name: '铜陵市'
    }, {
      code: '3408',
      name: '安庆市'
    }, {
      code: '3410',
      name: '黄山市'
    }, {
      code: '3411',
      name: '滁州市'
    }, {
      code: '3412',
      name: '阜阳市'
    }, {
      code: '3413',
      name: '宿州市'
    }, {
      code: '3415',
      name: '六安市'
    }, {
      code: '3416',
      name: '亳州市'
    }, {
      code: '3417',
      name: '池州市'
    }, {
      code: '3418',
      name: '宣城市'
    }],
    '35': [{
      code: '3501',
      name: '福州市'
    }, {
      code: '3502',
      name: '厦门市'
    }, {
      code: '3503',
      name: '莆田市'
    }, {
      code: '3504',
      name: '三明市'
    }, {
      code: '3505',
      name: '泉州市'
    }, {
      code: '3506',
      name: '漳州市'
    }, {
      code: '3507',
      name: '南平市'
    }, {
      code: '3508',
      name: '龙岩市'
    }, {
      code: '3509',
      name: '宁德市'
    }],
    '36': [{
      code: '3601',
      name: '南昌市'
    }, {
      code: '3602',
      name: '景德镇市'
    }, {
      code: '3603',
      name: '萍乡市'
    }, {
      code: '3604',
      name: '九江市'
    }, {
      code: '3605',
      name: '新余市'
    }, {
      code: '3606',
      name: '鹰潭市'
    }, {
      code: '3607',
      name: '赣州市'
    }, {
      code: '3608',
      name: '吉安市'
    }, {
      code: '3609',
      name: '宜春市'
    }, {
      code: '3610',
      name: '抚州市'
    }, {
      code: '3611',
      name: '上饶市'
    }],
    '37': [{
      code: '3701',
      name: '济南市'
    }, {
      code: '3702',
      name: '青岛市'
    }, {
      code: '3703',
      name: '淄博市'
    }, {
      code: '3704',
      name: '枣庄市'
    }, {
      code: '3705',
      name: '东营市'
    }, {
      code: '3706',
      name: '烟台市'
    }, {
      code: '3707',
      name: '潍坊市'
    }, {
      code: '3708',
      name: '济宁市'
    }, {
      code: '3709',
      name: '泰安市'
    }, {
      code: '3710',
      name: '威海市'
    }, {
      code: '3711',
      name: '日照市'
    }, {
      code: '3713',
      name: '临沂市'
    }, {
      code: '3714',
      name: '德州市'
    }, {
      code: '3715',
      name: '聊城市'
    }, {
      code: '3716',
      name: '滨州市'
    }, {
      code: '3717',
      name: '菏泽'
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
      name: '三门峡'
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
      name: '济源市'
    }],
    '42': [{
      code: '4201',
      name: '武汉市'
    }, {
      code: '4202',
      name: '黄石市'
    }, {
      code: '4203',
      name: '十堰市'
    }, {
      code: '4205',
      name: '宜昌市'
    }, {
      code: '4206',
      name: '襄阳市'
    }, {
      code: '4207',
      name: '鄂州市'
    }, {
      code: '4208',
      name: '荆门市'
    }, {
      code: '4209',
      name: '孝感市'
    }, {
      code: '4210',
      name: '荆州市'
    }, {
      code: '4211',
      name: '黄冈市'
    }, {
      code: '4212',
      name: '咸宁市'
    }, {
      code: '4213',
      name: '随州市'
    }, {
      code: '4228',
      name: '恩施土家族苗族自治州'
    }, {
      code: '4290',
      name: '仙桃市'
    }, {
      code: '4291',
      name: '潜江市'
    }, {
      code: '4292',
      name: '天门市'
    }, {
      code: '4293',
      name: '神农架林区'
    }],
    '43': [{
      code: '4301',
      name: '长沙市'
    }, {
      code: '4302',
      name: '株洲市'
    }, {
      code: '4303',
      name: '湘潭市'
    }, {
      code: '4304',
      name: '衡阳市'
    }, {
      code: '4305',
      name: '邵阳市'
    }, {
      code: '4306',
      name: '岳阳市'
    }, {
      code: '4307',
      name: '常德市'
    }, {
      code: '4308',
      name: '张家界市'
    }, {
      code: '4309',
      name: '益阳市'
    }, {
      code: '4310',
      name: '郴州市'
    }, {
      code: '4311',
      name: '永州市'
    }, {
      code: '4312',
      name: '怀化市'
    }, {
      code: '4313',
      name: '娄底市'
    }, {
      code: '4331',
      name: '湘西土家族苗族自治州'
    }],
    '44': [{
      code: '4401',
      name: '广州市'
    }, {
      code: '4403',
      name: '深圳市'
    }, {
      code: '4404',
      name: '珠海市'
    }, {
      code: '4405',
      name: '汕头市'
    }, {
      code: '4406',
      name: '佛山市'
    }, {
      code: '4407',
      name: '江门市'
    }, {
      code: '4408',
      name: '湛江市'
    }, {
      code: '4409',
      name: '茂名市'
    }, {
      code: '4412',
      name: '肇庆市'
    }, {
      code: '4413',
      name: '惠州市'
    }, {
      code: '4414',
      name: '梅州市'
    }, {
      code: '4415',
      name: '汕尾市'
    }, {
      code: '4416',
      name: '河源市'
    }, {
      code: '4417',
      name: '阳江市'
    }, {
      code: '4418',
      name: '清远市'
    }, {
      code: '4419',
      name: '东莞市'
    }, {
      code: '4420',
      name: '中山市'
    }, {
      code: '4451',
      name: '潮州市'
    }, {
      code: '4452',
      name: '揭阳市'
    }, {
      code: '4453',
      name: '云浮市'
    }],
    '45': [{
      code: '4501',
      name: '南宁市'
    }, {
      code: '4502',
      name: '柳州市'
    }, {
      code: '4503',
      name: '桂林市'
    }, {
      code: '4504',
      name: '梧州市'
    }, {
      code: '4505',
      name: '北海市'
    }, {
      code: '4506',
      name: '防城港市'
    }, {
      code: '4507',
      name: '钦州市'
    }, {
      code: '4508',
      name: '贵港市'
    }, {
      code: '4509',
      name: '玉林市'
    }, {
      code: '4510',
      name: '百色市'
    }, {
      code: '4511',
      name: '贺州市'
    }, {
      code: '4512',
      name: '河池市'
    }, {
      code: '4513',
      name: '来宾市'
    }, {
      code: '4514',
      name: '崇左市'
    }],
    '46': [{
      code: '4601',
      name: '海口市'
    }, {
      code: '4602',
      name: '三亚市'
    }, {
      code: '4603',
      name: '三沙市'
    }, {
      code: '4604',
      name: '儋州市'
    }],
    '50': [{
      code: '5001',
      name: '重庆市'
    }],
    '51': [{
      code: '5101',
      name: '成都市'
    }, {
      code: '5103',
      name: '自贡市'
    }, {
      code: '5104',
      name: '攀枝花市'
    }, {
      code: '5105',
      name: '泸州市'
    }, {
      code: '5106',
      name: '德阳市'
    }, {
      code: '5107',
      name: '绵阳市'
    }, {
      code: '5108',
      name: '广元市'
    }, {
      code: '5109',
      name: '遂宁市'
    }, {
      code: '5110',
      name: '内江市'
    }, {
      code: '5111',
      name: '乐山市'
    }, {
      code: '5113',
      name: '南充市'
    }, {
      code: '5114',
      name: '眉山市'
    }, {
      code: '5115',
      name: '宜宾市'
    }, {
      code: '5116',
      name: '广安市'
    }, {
      code: '5117',
      name: '达州市'
    }, {
      code: '5118',
      name: '雅安市'
    }, {
      code: '5119',
      name: '巴中市'
    }, {
      code: '5120',
      name: '资阳市'
    }, {
      code: '5132',
      name: '阿坝藏族羌族自治州'
    }, {
      code: '5133',
      name: '甘孜藏族自治州'
    }, {
      code: '5134',
      name: '凉山彝族自治州'
    }],
    '52': [{
      code: '5201',
      name: '贵阳市'
    }, {
      code: '5202',
      name: '六盘水市'
    }, {
      code: '5203',
      name: '遵义市'
    }, {
      code: '5204',
      name: '安顺市'
    }, {
      code: '5205',
      name: '毕节市'
    }, {
      code: '5206',
      name: '铜仁市'
    }, {
      code: '5223',
      name: '黔西南布依族苗族自治州'
    }, {
      code: '5226',
      name: '黔东南苗族侗族自治'
    }, {
      code: '5227',
      name: '黔南布依族苗族自治州'
    }],
    '53': [{
      code: '5301',
      name: '昆明市'
    }, {
      code: '5303',
      name: '曲靖市'
    }, {
      code: '5304',
      name: '玉溪市'
    }, {
      code: '5305',
      name: '保山市'
    }, {
      code: '5306',
      name: '昭通市'
    }, {
      code: '5307',
      name: '丽江市'
    }, {
      code: '5308',
      name: '普洱市'
    }, {
      code: '5309',
      name: '临沧市'
    }, {
      code: '5323',
      name: '楚雄彝族自治州'
    }, {
      code: '5325',
      name: '红河哈尼族彝族自治州'
    }, {
      code: '5326',
      name: '文山壮族苗族自治州'
    }, {
      code: '5328',
      name: '西双版纳傣族自治州'
    }, {
      code: '5329',
      name: '大理白族自治州'
    }, {
      code: '5331',
      name: '德宏傣族景颇族自治州'
    }, {
      code: '5333',
      name: '怒江傈僳族自治州'
    }, {
      code: '5334',
      name: '迪庆藏族自治州'
    }],
    '54': [{
      code: '5401',
      name: '拉萨市'
    }, {
      code: '5402',
      name: '日喀则市'
    }, {
      code: '5403',
      name: '昌都市'
    }, {
      code: '5404',
      name: '林芝市'
    }, {
      code: '5405',
      name: '山南市'
    }, {
      code: '5406',
      name: '那曲市'
    }, {
      code: '5425',
      name: '阿里地区'
    }],
    '61': [{
      code: '6101',
      name: '西安市'
    }, {
      code: '6102',
      name: '铜川市'
    }, {
      code: '6103',
      name: '宝鸡市'
    }, {
      code: '6104',
      name: '咸阳市'
    }, {
      code: '6105',
      name: '渭南市'
    }, {
      code: '6106',
      name: '延安市'
    }, {
      code: '6107',
      name: '汉中市'
    }, {
      code: '6108',
      name: '榆林市'
    }, {
      code: '6109',
      name: '安康市'
    }, {
      code: '6110',
      name: '商洛市'
    }],
    '62': [{
      code: '6201',
      name: '兰州市'
    }, {
      code: '6202',
      name: '嘉峪关市'
    }, {
      code: '6203',
      name: '金昌市'
    }, {
      code: '6204',
      name: '白银市'
    }, {
      code: '6205',
      name: '天水市'
    }, {
      code: '6206',
      name: '武威市'
    }, {
      code: '6207',
      name: '张掖市'
    }, {
      code: '6208',
      name: '平凉市'
    }, {
      code: '6209',
      name: '酒泉市'
    }, {
      code: '6210',
      name: '庆阳市'
    }, {
      code: '6211',
      name: '定西市'
    }, {
      code: '6212',
      name: '陇南市'
    }, {
      code: '6229',
      name: '临夏回族自治州'
    }, {
      code: '6230',
      name: '甘南藏族自治州'
    }],
    '63': [{
      code: '6301',
      name: '西宁市'
    }, {
      code: '6302',
      name: '海东市'
    }, {
      code: '6322',
      name: '海北藏族自治州'
    }, {
      code: '6323',
      name: '黄南藏族自治州'
    }, {
      code: '6325',
      name: '海南藏族自治'
    }]
  },
  counties: {
    // 北京市区县
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
    // 河南省郑州市区县 - 重点扩展
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

// 简化版iPhone风格的滚动选择器列
const PickerColumn = forwardRef(({
  items,
  selectedValue,
  onSelect,
  className = '',
  label = ''
}, ref) => {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const itemHeight = 48;
  const visibleCount = 5;
  const totalHeight = itemHeight * visibleCount;
  const paddingItems = Math.floor(visibleCount / 2);

  // 初始化滚动位置
  useEffect(() => {
    if (selectedValue !== undefined && containerRef.current) {
      const selectedIndex = items.findIndex(item => item.code === selectedValue);
      if (selectedIndex >= 0) {
        // 让选中项居中
        const targetScrollTop = selectedIndex * itemHeight;
        containerRef.current.scrollTop = targetScrollTop;
        setScrollTop(targetScrollTop);
      }
    }
  }, [selectedValue, items]);

  // 极简的滚动处理
  const handleScroll = e => {
    const currentScrollTop = e.target.scrollTop;
    setScrollTop(currentScrollTop);

    // 简单计算：哪个项目最接近中心
    const selectedIndex = Math.round(currentScrollTop / itemHeight);
    const clampedIndex = Math.max(0, Math.min(selectedIndex, items.length - 1));

    // 更新选中值
    if (items[clampedIndex] && items[clampedIndex].code !== selectedValue) {
      onSelect(items[clampedIndex].code);
    }
  };
  return <div className={`relative ${className}`} ref={ref}>
      {/* 列标题 */}
      <div className="text-center mb-3">
        <div className="text-sm font-semibold text-gray-700 mb-1">{label}</div>
        <div className="w-8 h-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mx-auto"></div>
      </div>

      <div ref={containerRef} className="overflow-y-auto scrollbar-hide bg-white rounded-2xl shadow-inner border border-gray-100" style={{
      height: `${totalHeight}px`
    }} onScroll={handleScroll}>
        {/* 顶部填充 */}
        {Array.from({
        length: paddingItems
      }).map((_, i) => <div key={`top-${i}`} style={{
        height: `${itemHeight}px`
      }} />)}

        {/* 实际选项 */}
        {items.map((item, index) => {
        const itemTop = (paddingItems + index) * itemHeight;
        const itemCenter = itemTop + itemHeight / 2;
        const distance = Math.abs(itemCenter - (scrollTop + totalHeight / 2));
        const isSelected = distance < itemHeight / 2;
        const opacity = Math.max(0.4, 1 - distance / (itemHeight * 1.5));
        const scale = isSelected ? 1 : Math.max(0.9, 1 - distance / (itemHeight * 3));
        return <div key={item.code} className={`flex items-center justify-center text-center transition-all duration-200 cursor-pointer relative ${isSelected ? 'font-bold text-gray-900' : 'text-gray-500'}`} style={{
          height: `${itemHeight}px`,
          opacity,
          transform: `scale(${scale})`
        }} onClick={() => onSelect(item.code)}>
              {/* 选中背景 */}
              {isSelected && <div className="absolute inset-x-2 inset-y-1 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl border border-green-200 -z-10"></div>}
              <span className="px-2 text-sm">{item.name}</span>
            </div>;
      })}

        {/* 底部填充 */}
        {Array.from({
        length: paddingItems
      }).map((_, i) => <div key={`bottom-${i}`} style={{
        height: `${itemHeight}px`
      }} />)}
      </div>

      {/* 选中指示器 */}
      <div className="absolute left-2 right-2 border-y-2 border-green-300 bg-green-50/30 pointer-events-none rounded-xl" style={{
      top: `${totalHeight / 2 - itemHeight / 2 + 44}px`,
      height: `${itemHeight}px`
    }} />
    </div>;
});
PickerColumn.displayName = 'PickerColumn';
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

  // 省份变化时重置城市和县区
  const handleProvinceChange = provinceCode => {
    setSelectedProvince(provinceCode);
    setSelectedCity('');
    setSelectedCounty('');
  };

  // 城市变化时重置县区
  const handleCityChange = cityCode => {
    setSelectedCity(cityCode);
    setSelectedCounty('');
  };
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
      <DialogContent className="sm:max-w-[450px] max-h-[80vh] p-0 rounded-t-3xl shadow-2xl border-0" style={{
      position: 'fixed',
      bottom: 0,
      top: 'auto',
      transform: 'translate(-50%, 0)',
      left: '50%',
      borderRadius: '24px 24px 0 0',
      maxWidth: '100vw',
      backgroundColor: '#fafafa'
    }}>
        {/* 头部 */}
        <DialogHeader className="px-6 py-5 bg-white rounded-t-3xl border-b border-gray-100">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={handleCancel} className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 font-medium px-3 py-1.5">
              取消
            </Button>
            <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              选择项目地址
            </DialogTitle>
            <Button variant="ghost" onClick={handleConfirm} disabled={!selectedProvince || !selectedCity || !selectedCounty} className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 font-medium px-3 py-1.5 disabled:text-gray-400">
              确定
            </Button>
          </div>
        </DialogHeader>

        {/* 当前选择预览 */}
        <div className="px-6 py-4 bg-white border-b border-gray-100">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">当前选择</div>
            <div className="text-base font-semibold text-gray-900 min-h-[24px]">
              {(() => {
              const parts = [];
              if (selectedProvince) {
                parts.push(provinces.find(p => p.code === selectedProvince)?.name);
              }
              if (selectedCity) {
                parts.push(cities.find(c => c.code === selectedCity)?.name);
              }
              if (selectedCounty) {
                parts.push(counties.find(c => c.code === selectedCounty)?.name);
              }
              return parts.join(' / ') || '请选择省市县';
            })()}
            </div>
          </div>
        </div>

        {/* 选择器主体 */}
        <div className="bg-gradient-to-b from-gray-50 to-white">
          {/* 三级联动选择器 */}
          <div className="p-6">
            <div className="grid grid-cols-3 gap-4">
              {/* 省份选择 */}
              <PickerColumn items={provinces} selectedValue={selectedProvince} onSelect={handleProvinceChange} label="省份" className="w-full" />

              {/* 城市选择 */}
              <PickerColumn items={cities} selectedValue={selectedCity} onSelect={handleCityChange} label="城市" className={`w-full ${!selectedProvince ? 'opacity-40 pointer-events-none' : ''}`} />

              {/* 区县选择 */}
              <PickerColumn items={counties} selectedValue={selectedCounty} onSelect={setSelectedCounty} label="区县" className={`w-full ${!selectedCity ? 'opacity-40 pointer-events-none' : ''}`} />
            </div>
          </div>

          {/* 选择提示 */}
          <div className="px-6 pb-4">
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="text-blue-500 text-lg">💡</div>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-1">选择提示</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>• 请依次选择省份、城市和区县</p>
                    <p>• 滑动或点击选择项目所在的具体位置</p>
                    <p>• 选择完成后点击右上角"确定"按钮</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </DialogContent>
    </Dialog>;
}