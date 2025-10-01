// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { useToast, Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, BarChart3, AlertTriangle, FileText, Calendar, Filter, TrendingUp, Building, MapPin, Hash, Zap, Search } from 'lucide-react';
// @ts-ignore;
import TopNavBar from '@/components/TopNavBar';

export default function ProjectDataDashboard(props) {
  const { $w } = props;
  const { toast } = useToast();

  // 页面状态管理
  const [currentPage, setCurrentPage] = useState('main');
  const [loading, setLoading] = useState(false);

  // 统计页面状态
  const [statisticsForm, setStatisticsForm] = useState({
    startDate: '2023-01-01',
    endDate: new Date().toISOString().split('T')[0],
    filterType: 'department', // department 或 region
    dataType: 'count' // count 或 capacity
  });

  // 图表数据状态
  const [chartData, setChartData] = useState({
    categories: [],
    values: [],
    sortOrder: 'desc', // asc 或 desc
    hideZeroData: false
  });

  // 部门选项
  const departments = [
    '规划部',
    '南阳项目开发部',
    '豫北项目开发部',
    '灵宝项目开发部',
    '省直项目开发部',
    '郑州项目开发部',
    '开封项目开发部',
    '漯河项目开发部',
    '许昌项目开发部',
    '商丘项目开发部',
    '周口项目开发部'
  ];

  // 河南省地市（按首字母排序）
  const regions = [
    '安阳', '鹤壁', '济源', '焦作', '开封', '洛阳', '南阳', '平顶山',
    '三门峡', '商丘', '新乡', '信阳', '许昌', '郑州', '周口', '驻马店'
  ];

  // 冲突项目数据状态
  const [conflictProjects, setConflictProjects] = useState([]);
  const [conflictLoading, setConflictLoading] = useState(false);

  // 计算字符串相似度（基于编辑距离算法）
  const calculateStringSimilarity = (str1, str2) => {
    if (!str1 || !str2) return 0;

    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 1;

    const len1 = s1.length;
    const len2 = s2.length;

    // 创建编辑距离矩阵
    const matrix = Array(len1 + 1).fill().map(() => Array(len2 + 1).fill(0));

    // 初始化矩阵
    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    // 填充矩阵
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        if (s1[i - 1] === s2[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,     // 删除
            matrix[i][j - 1] + 1,     // 插入
            matrix[i - 1][j - 1] + 1  // 替换
          );
        }
      }
    }

    // 计算相似度百分比
    const maxLen = Math.max(len1, len2);
    const editDistance = matrix[len1][len2];
    return maxLen === 0 ? 0 : (maxLen - editDistance) / maxLen;
  };

  // 检查合作单位相似度
  const hasPartnerUnitSimilarity = (units, threshold = 0.6) => {
    if (!units || units.length < 2) return false;

    for (let i = 0; i < units.length; i++) {
      for (let j = i + 1; j < units.length; j++) {
        const similarity = calculateStringSimilarity(units[i], units[j]);
        console.log(`合作单位相似度比较: "${units[i]}" vs "${units[j]}" = ${(similarity * 100).toFixed(1)}%`);
        if (similarity >= threshold) {
          return true;
        }
      }
    }
    return false;
  };

  // 查询项目冲突数据
  const queryConflictProjects = async () => {
    setConflictLoading(true);
    try {
      console.log('=== 开始查询项目冲突数据 ===');

      // 查询所有项目数据
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'project_info',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              // 确保关键字段不为空
              province: { $ne: null },
              city: { $ne: null },
              district: { $ne: null },
              project_type: { $ne: null },
              partner_unit: { $ne: null }
            }
          },
          pageSize: 1000
        }
      });

      console.log('查询到的项目数据:', result);

      if (result.records && result.records.length > 0) {
        console.log(`共查询到 ${result.records.length} 条项目记录`);

        // 按照省市区和项目类型进行分组
        const locationTypeGroups = {};

        result.records.forEach(record => {
          // 创建分组键：省-市-区-项目类型
          const groupKey = `${record.province}-${record.city}-${record.district}-${record.project_type}`;

          if (!locationTypeGroups[groupKey]) {
            locationTypeGroups[groupKey] = [];
          }

          locationTypeGroups[groupKey].push({
            project_id: record.project_id || record._id,
            project_location: `${record.province}-${record.city}-${record.district}`,
            project_type: record.project_type,
            partner_unit: record.partner_unit,
            // 保存完整记录用于调试
            _fullRecord: record
          });
        });

        console.log('按地区和类型分组结果:', locationTypeGroups);

        // 查找有冲突的分组
        const conflicts = [];

        Object.keys(locationTypeGroups).forEach(groupKey => {
          const group = locationTypeGroups[groupKey];

          // 只检查有2个或以上项目的分组
          if (group.length >= 2) {
            console.log(`检查分组 ${groupKey}:`, group);

            // 提取所有合作单位
            const partnerUnits = group.map(item => item.partner_unit).filter(unit => unit);

            console.log(`分组 ${groupKey} 的合作单位:`, partnerUnits);

            // 检查合作单位相似度
            if (hasPartnerUnitSimilarity(partnerUnits, 0.6)) {
              console.log(`发现冲突分组 ${groupKey}:`, group);
              conflicts.push({
                groupKey: groupKey,
                projects: group,
                location: group[0].project_location,
                type: group[0].project_type
              });
            }
          }
        });

        console.log('最终发现的冲突项目:', conflicts);

        setConflictProjects(conflicts);
      } else {
        console.log('没有查询到项目数据');
        setConflictProjects([]);
      }
    } catch (error) {
      console.error('查询冲突项目失败:', error);
      setConflictProjects([]);
    } finally {
      setConflictLoading(false);
    }
  };

  // 页面切换函数
  const showPage = (pageId) => {
    setCurrentPage(pageId);

    // 如果切换到冲突预警页面，查询冲突数据
    if (pageId === 'conflict') {
      queryConflictProjects();
    }
  };

  // 处理统计表单变化
  const handleStatisticsFormChange = (field, value) => {
    setStatisticsForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 初始化CloudBase SDK以支持预编译SQL
  const [cloudbaseApp, setCloudbaseApp] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // 初始化CloudBase
  const initializeCloudBase = async () => {
    if (initialized && cloudbaseApp) return cloudbaseApp;

    try {
      // 优先使用微搭平台的$w.cloud
      if ($w && $w.cloud) {
        console.log('使用微搭平台云开发接口');
        setCloudbaseApp($w.cloud);
        setInitialized(true);
        return $w.cloud;
      }

      // 尝试使用全局cloudbase对象
      if (window.cloudbase) {
        console.log('使用全局cloudbase实例');
        const envId = "huanneng-0g1guqcgf3264f38";
        const app = window.cloudbase.init({
          env: envId,
          debug: true
        });

        const auth = app.auth({ persistence: "local" });
        await auth.signInAnonymously();

        setCloudbaseApp(app);
        setInitialized(true);
        return app;
      }

      throw new Error('CloudBase SDK未找到');
    } catch (error) {
      console.error('CloudBase初始化失败:', error);
      throw error;
    }
  };

  // 预编译SQL查询统计数据
  const queryProjectStatisticsWithSQL = async (startDate, endDate, filterType, dataType) => {
    console.log('=== 开始预编译SQL查询统计数据 ===');
    console.log('查询参数:', { startDate, endDate, filterType, dataType });

    try {
      // 确保CloudBase已初始化
      const cloudbase = await initializeCloudBase();

      let sqlTemplate = '';
      let sqlParams = {};
      let categories = [];

      // 根据筛选类型和数据类型构造SQL
      if (filterType === 'department') {
        categories = departments;
        if (dataType === 'count') {
          // 按部门统计项目数量
          sqlTemplate = `
            SELECT
              project_department as groupField,
              COUNT(*) as value
            FROM \`{{tableName}}\`
            WHERE project_date >= {{startDate}}
              AND project_date <= {{endDate}}
              AND project_department IS NOT NULL
            GROUP BY project_department
            ORDER BY project_department
          `;
        } else {
          // 按部门统计项目容量
          sqlTemplate = `
            SELECT
              project_department as groupField,
              COALESCE(SUM(CAST(project_capacity AS DECIMAL(10,2))), 0) as value
            FROM \`{{tableName}}\`
            WHERE project_date >= {{startDate}}
              AND project_date <= {{endDate}}
              AND project_department IS NOT NULL
              AND project_capacity IS NOT NULL
            GROUP BY project_department
            ORDER BY project_department
          `;
        }
      } else {
        categories = regions;
        if (dataType === 'count') {
          // 按城市统计项目数量
          sqlTemplate = `
            SELECT
              city as groupField,
              COUNT(*) as value
            FROM \`{{tableName}}\`
            WHERE project_date >= {{startDate}}
              AND project_date <= {{endDate}}
              AND city IS NOT NULL
            GROUP BY city
            ORDER BY city
          `;
        } else {
          // 按城市统计项目容量
          sqlTemplate = `
            SELECT
              city as groupField,
              COALESCE(SUM(CAST(project_capacity AS DECIMAL(10,2))), 0) as value
            FROM \`{{tableName}}\`
            WHERE project_date >= {{startDate}}
              AND project_date <= {{endDate}}
              AND city IS NOT NULL
              AND project_capacity IS NOT NULL
            GROUP BY city
            ORDER BY city
          `;
        }
      }

      sqlParams = {
        tableName: 'project_info',
        startDate: startDate,
        endDate: endDate
      };

      console.log('SQL模板:', sqlTemplate);
      console.log('SQL参数:', sqlParams);

      let result;

      // 检查是否为微搭平台环境
      if (cloudbase.callDataSource) {
        console.log('微搭平台环境：使用数据源API模拟SQL查询');

        // 微搭平台下使用数据源API替代SQL（回退到原始方法）
        return await queryProjectStatisticsFallback(startDate, endDate, filterType, dataType);
      }
      // 标准CloudBase环境 - 使用预编译SQL
      else if (cloudbase.models && cloudbase.models.$runSQL) {
        console.log('使用CloudBase标准$runSQL方法执行预编译SQL');
        result = await cloudbase.models.$runSQL(sqlTemplate, sqlParams);
        console.log('预编译SQL执行结果:', result);

        // 处理SQL查询结果
        const sqlData = result.data || [];
        const resultMap = {};

        // 将SQL查询结果转换为map
        sqlData.forEach(row => {
          if (row.groupField && row.value !== undefined) {
            resultMap[row.groupField] = parseFloat(row.value) || 0;
          }
        });

        // 按照预定义的categories顺序生成最终数据
        const finalValues = categories.map(category => resultMap[category] || 0);

        console.log('SQL查询结果处理:', { resultMap, finalValues });

        return {
          categories: categories,
          values: finalValues
        };
      }
      // 其他可能的SQL接口
      else if (typeof cloudbase.runSQL === 'function') {
        console.log('使用直接runSQL方法');
        result = await cloudbase.runSQL(sqlTemplate, sqlParams);
        console.log('直接runSQL结果:', result);

        // 处理结果（格式可能与$runSQL不同）
        const resultMap = {};
        if (result && result.length) {
          result.forEach(row => {
            if (row.groupField && row.value !== undefined) {
              resultMap[row.groupField] = parseFloat(row.value) || 0;
            }
          });
        }

        const finalValues = categories.map(category => resultMap[category] || 0);

        return {
          categories: categories,
          values: finalValues
        };
      }
      else {
        console.warn('当前环境不支持预编译SQL功能，回退到数据源API方式');
        return await queryProjectStatisticsFallback(startDate, endDate, filterType, dataType);
      }

    } catch (error) {
      console.error('=== 预编译SQL查询失败，回退到数据源API ===');
      console.error('错误详情:', error);
      return await queryProjectStatisticsFallback(startDate, endDate, filterType, dataType);
    }
  };

  // 回退查询方法（使用数据源API）
  const queryProjectStatisticsFallback = async (startDate, endDate, filterType, dataType) => {
    console.log('=== 使用数据源API查询统计数据（回退方案） ===');

    try {
      // 查询所有符合时间范围的数据
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'project_info',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              project_date: {
                $gte: startDate,
                $lte: endDate
              }
            }
          },
          pageSize: 1000
        }
      });

      console.log('数据源API查询结果:', result);
      console.log('查询到的记录数量:', result.records ? result.records.length : 0);

      if (filterType === 'department') {
        // 按项目开发部分组
        const departmentData = {};
        departments.forEach(dept => departmentData[dept] = 0);

        if (result.records) {
          result.records.forEach(record => {
            const dept = record.project_department;
            if (dept && departmentData.hasOwnProperty(dept)) {
              if (dataType === 'count') {
                departmentData[dept]++;
              } else {
                const capacity = parseFloat(record.project_capacity) || 0;
                departmentData[dept] += capacity;
              }
            }
          });
        }

        const finalValues = departments.map(dept =>
          dataType === 'capacity'
            ? Math.round((departmentData[dept] || 0) * 100) / 100
            : departmentData[dept] || 0
        );

        return {
          categories: departments,
          values: finalValues
        };
      } else {
        // 按城市分组
        const cityData = {};
        regions.forEach(city => cityData[city] = 0);

        if (result.records) {
          result.records.forEach(record => {
            const city = record.city;
            if (city && cityData.hasOwnProperty(city)) {
              if (dataType === 'count') {
                cityData[city]++;
              } else {
                const capacity = parseFloat(record.project_capacity) || 0;
                cityData[city] += capacity;
              }
            }
          });
        }

        const finalValues = regions.map(city =>
          dataType === 'capacity'
            ? Math.round((cityData[city] || 0) * 100) / 100
            : cityData[city] || 0
        );

        return {
          categories: regions,
          values: finalValues
        };
      }
    } catch (error) {
      console.error('数据源API查询也失败:', error);
      throw error;
    }
  };

  // 查询项目统计数据（主入口）
  const queryProjectStatistics = async (startDate, endDate, filterType, dataType) => {
    return await queryProjectStatisticsWithSQL(startDate, endDate, filterType, dataType);
  };

  // 提交统计查询
  const handleStatisticsSubmit = async () => {
    console.log('=== 开始提交统计查询 ===');
    console.log('当前表单数据:', statisticsForm);

    setLoading(true);
    try {
      // 查询真实数据
      const { categories, values } = await queryProjectStatistics(
        statisticsForm.startDate,
        statisticsForm.endDate,
        statisticsForm.filterType,
        statisticsForm.dataType
      );

      console.log('查询结果 - categories:', categories);
      console.log('查询结果 - values:', values);
      console.log('总数据量:', values.reduce((sum, val) => sum + val, 0));

      setChartData({
        categories,
        values,
        sortOrder: 'desc',
        hideZeroData: false
      });

      showPage('chart');

      toast({
        title: "查询成功",
        description: `已查询到 ${values.reduce((sum, val) => sum + val, 0)} 条数据`,
        duration: 1000
      });
    } catch (error) {
      console.error('=== 统计查询失败 ===');
      console.error('失败详情:', error);
      toast({
        title: "查询失败",
        description: error.message || "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 更新图表
  const updateChart = () => {
    let displayData = [];

    for (let i = 0; i < chartData.categories.length; i++) {
      if (!chartData.hideZeroData || chartData.values[i] > 0) {
        displayData.push({
          label: chartData.categories[i],
          value: chartData.values[i]
        });
      }
    }

    // 排序
    if (chartData.sortOrder === 'asc') {
      displayData.sort((a, b) => a.value - b.value);
    } else {
      displayData.sort((a, b) => b.value - a.value);
    }

    return displayData;
  };

  // 切换零值数据显示
  const toggleZeroData = () => {
    setChartData(prev => ({
      ...prev,
      hideZeroData: !prev.hideZeroData
    }));
  };

  // 切换排序方式
  const handleSortChange = (value) => {
    setChartData(prev => ({
      ...prev,
      sortOrder: value
    }));
  };

  // 获取图表最大值
  const getMaxValue = (data) => {
    return Math.max(...data.map(item => item.value), 1);
  };

  // 渲染主页面
  const renderMainPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50" style={{ fontFamily: '"仿宋_GB2312", "FangSong_GB2312", serif' }}>
      {/* 固定顶部导航栏 */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <TopNavBar {...props} currentPage="project-data-dashboard" />
      </div>

      {/* 装饰背景 */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-blue-500 to-green-600 opacity-10"></div>

      {/* 主内容区域 */}
      <div className="relative z-10 pt-20 pb-4">
        <div className="max-w-sm mx-auto px-2">
          {/* 功能模块网格 */}
          <div className="space-y-4">
            {/* 对接项目统计 */}
            <div
              onClick={() => showPage('statistics')}
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-0 p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl active:scale-[0.98] group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-lg font-bold text-gray-800 mb-1">对接项目统计</div>
                  <div className="text-sm text-gray-600">查看项目数据和统计分析</div>
                </div>
                <div className="text-blue-500 group-hover:translate-x-1 transition-transform duration-200">
                  <ArrowLeft className="h-5 w-5 rotate-180" />
                </div>
              </div>
            </div>

            {/* 项目冲突预警 */}
            <div
              onClick={() => showPage('conflict')}
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-0 p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl active:scale-[0.98] group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-lg font-bold text-gray-800 mb-1">项目冲突预警</div>
                  <div className="text-sm text-gray-600">检测项目位置和合作单位冲突</div>
                </div>
                <div className="text-red-500 group-hover:translate-x-1 transition-transform duration-200">
                  <ArrowLeft className="h-5 w-5 rotate-180" />
                </div>
              </div>
            </div>

            {/* 登记对接项目 */}
            <div
              onClick={() => showPage('register')}
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-0 p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl active:scale-[0.98] group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-lg font-bold text-gray-800 mb-1">登记对接项目</div>
                  <div className="text-sm text-gray-600">添加新的项目对接信息</div>
                </div>
                <div className="text-green-500 group-hover:translate-x-1 transition-transform duration-200">
                  <ArrowLeft className="h-5 w-5 rotate-180" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染统计页面
  const renderStatisticsPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50" style={{ fontFamily: '"仿宋_GB2312", "FangSong_GB2312", serif' }}>
      {/* 装饰背景 */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-blue-500 to-green-600 opacity-10"></div>

      {/* 固定头部 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-sm mx-auto px-2">
          <div className="flex items-center justify-center h-16 relative">
            <button
              onClick={() => showPage('main')}
              className="absolute left-2 text-gray-600 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-800">对接项目统计</h1>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="relative z-10 pt-20 pb-4">
        <div className="max-w-sm mx-auto px-2">

          {/* 表单容器 */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-0 p-6 space-y-5">
            {/* 时间选择区域 */}
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-base font-bold text-gray-800 mb-1">📅 时间范围</h3>
                <p className="text-xs text-gray-600">选择项目对接的时间段</p>
              </div>

              {/* 开始时间 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  开始时间
                </label>
                <input
                  type="date"
                  value={statisticsForm.startDate}
                  onChange={(e) => handleStatisticsFormChange('startDate', e.target.value)}
                  min="2000-01-01"
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full h-11 px-3 border-2 border-gray-200 bg-gray-50/50 rounded-xl focus:border-blue-400 focus:bg-white transition-all duration-200 outline-none"
                />
              </div>

              {/* 结束时间 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  结束时间
                </label>
                <input
                  type="date"
                  value={statisticsForm.endDate}
                  onChange={(e) => handleStatisticsFormChange('endDate', e.target.value)}
                  min={statisticsForm.startDate}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full h-11 px-3 border-2 border-gray-200 bg-gray-50/50 rounded-xl focus:border-blue-400 focus:bg-white transition-all duration-200 outline-none"
                />
              </div>
            </div>

            {/* 分隔线 */}
            <div className="border-t border-gray-100 my-5"></div>

            {/* 筛选项区域 */}
            <div>
              <div className="text-center mb-4">
                <h3 className="text-base font-bold text-gray-800 mb-1">🔍 筛选维度</h3>
                <p className="text-xs text-gray-600">按部门或区域进行统计</p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all duration-200 bg-gray-50/50">
                  <input
                    type="radio"
                    name="filterType"
                    value="department"
                    checked={statisticsForm.filterType === 'department'}
                    onChange={(e) => handleStatisticsFormChange('filterType', e.target.value)}
                    className="mr-3 w-4 h-4 text-blue-500 border-gray-300"
                  />
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-800">项目开发部</span>
                  </div>
                </label>
                <label className="flex items-center cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all duration-200 bg-gray-50/50">
                  <input
                    type="radio"
                    name="filterType"
                    value="region"
                    checked={statisticsForm.filterType === 'region'}
                    onChange={(e) => handleStatisticsFormChange('filterType', e.target.value)}
                    className="mr-3 w-4 h-4 text-blue-500 border-gray-300"
                  />
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-800">项目区域</span>
                  </div>
                </label>
              </div>
            </div>

            {/* 分隔线 */}
            <div className="border-t border-gray-100 my-5"></div>

            {/* 统计类型区域 */}
            <div>
              <div className="text-center mb-4">
                <h3 className="text-base font-bold text-gray-800 mb-1">📊 统计类型</h3>
                <p className="text-xs text-gray-600">选择要统计的数据指标</p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all duration-200 bg-gray-50/50">
                  <input
                    type="radio"
                    name="dataType"
                    value="count"
                    checked={statisticsForm.dataType === 'count'}
                    onChange={(e) => handleStatisticsFormChange('dataType', e.target.value)}
                    className="mr-3 w-4 h-4 text-blue-500 border-gray-300"
                  />
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-800">对接项目数量</span>
                  </div>
                </label>
                <label className="flex items-center cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all duration-200 bg-gray-50/50">
                  <input
                    type="radio"
                    name="dataType"
                    value="capacity"
                    checked={statisticsForm.dataType === 'capacity'}
                    onChange={(e) => handleStatisticsFormChange('dataType', e.target.value)}
                    className="mr-3 w-4 h-4 text-blue-500 border-gray-300"
                  />
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-800">对接项目容量 (MW)</span>
                  </div>
                </label>
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="pt-4">
              <Button
                onClick={handleStatisticsSubmit}
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none disabled:shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    查询中...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    开始统计
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染图表页面
  const renderChartPage = () => {
    const displayData = updateChart();
    const maxValue = getMaxValue(displayData);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50" style={{ fontFamily: '"仿宋_GB2312", "FangSong_GB2312", serif' }}>
        {/* 装饰背景 */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-blue-500 to-green-600 opacity-10"></div>

        {/* 固定头部 */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
          <div className="max-w-sm mx-auto px-2">
            <div className="flex items-center justify-center h-16 relative">
              <button
                onClick={() => showPage('statistics')}
                className="absolute left-2 text-gray-600 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <div className="text-center">
                  <h1 className="text-lg font-bold text-gray-800">统计结果</h1>
                  <p className="text-xs text-gray-600 -mt-1">
                    {statisticsForm.filterType === 'department' ? '按部门' : '按区域'} ·
                    {statisticsForm.dataType === 'count' ? '数量' : '容量'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 主内容区域 */}
        <div className="relative z-10 pt-20 pb-4">
          <div className="max-w-sm mx-auto px-2">

            {/* 图表控制卡片 */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-0 p-4 mb-6">
              <div className="flex flex-col space-y-3">
                {/* 排序控制 */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Filter className="h-4 w-4 text-blue-600" />
                    排序方式
                  </label>
                  <select
                    value={chartData.sortOrder}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="px-3 py-2 border-2 border-gray-200 bg-gray-50/50 rounded-lg text-sm focus:border-blue-400 focus:bg-white transition-all duration-200 outline-none"
                  >
                    <option value="desc">从高到低</option>
                    <option value="asc">从低到高</option>
                  </select>
                </div>

                {/* 零值数据控制 */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">隐藏零值数据</span>
                  <button
                    onClick={toggleZeroData}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      chartData.hideZeroData
                        ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {chartData.hideZeroData ? '已隐藏' : '未隐藏'}
                  </button>
                </div>
              </div>
            </div>

            {/* 图表容器 */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-0 p-4 relative overflow-hidden">
              {/* 图表标题 */}
              <div className="text-center mb-4">
                <h3 className="text-base font-bold text-gray-800">
                  {statisticsForm.dataType === 'count' ? '📊 项目数量统计' : '⚡ 项目容量统计 (MW)'}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {statisticsForm.filterType === 'department' ? '各部门' : '各区域'}数据对比
                </p>
              </div>

              {/* 移动端优化的图表区域 */}
              <div className="overflow-x-auto">
                <div className="flex items-end justify-start space-x-2 h-64 min-w-max px-2 pb-8">
                  {displayData.map((item, index) => {
                    const barHeight = Math.max(10, (item.value / maxValue) * 200);
                    const barColor = index % 2 === 0
                      ? 'bg-gradient-to-t from-blue-500 to-blue-400'
                      : 'bg-gradient-to-t from-green-500 to-green-400';

                    return (
                      <div key={index} className="flex flex-col items-center min-w-[40px]">
                        {/* 数值标签 */}
                        <div className="text-xs font-bold text-gray-700 mb-1 bg-white/80 px-1 rounded">
                          {item.value}
                        </div>
                        {/* 柱子 */}
                        <div
                          className={`${barColor} w-8 rounded-t-lg shadow-md transition-all duration-500 hover:shadow-lg`}
                          style={{ height: `${barHeight}px` }}
                        />
                        {/* 分类标签 */}
                        <div className="text-xs text-gray-600 mt-2 text-center max-w-[60px]">
                          <span className="block truncate" title={item.label}>
                            {item.label.length > 4 ? item.label.substring(0, 4) + '...' : item.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 图例和说明 */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-2">
                    {statisticsForm.filterType === 'department' ? '📍 部门' : '🗺️ 区域'}: {displayData.length} 个
                  </p>
                  <div className="flex justify-center items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-gradient-to-t from-blue-500 to-blue-400 rounded"></div>
                      <span className="text-gray-600">数据项1</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-gradient-to-t from-green-500 to-green-400 rounded"></div>
                      <span className="text-gray-600">数据项2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染冲突预警页面
  const renderConflictPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50" style={{ fontFamily: '"仿宋_GB2312", "FangSong_GB2312", serif' }}>
      {/* 装饰背景 */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-blue-500 to-green-600 opacity-10"></div>

      {/* 固定头部 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-sm mx-auto px-2">
          <div className="flex items-center justify-center h-16 relative">
            <button
              onClick={() => showPage('main')}
              className="absolute left-2 text-gray-600 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-800">项目冲突预警</h1>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="relative z-10 pt-20 pb-4">
        <div className="max-w-sm mx-auto px-2">

          {/* 加载状态 */}
          {conflictLoading ? (
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-0 p-8">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <div className="text-base font-medium text-gray-600">正在检测项目冲突...</div>
                <div className="text-sm text-gray-500 mt-2">请稍候，正在分析项目数据</div>
              </div>
            </div>
          ) : (
            /* 冲突项目组 */
            <div className="space-y-4">
              {conflictProjects.length > 0 ? (
                conflictProjects.map((group, groupIndex) => (
                  <div
                    key={groupIndex}
                    className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-4 relative shadow-xl backdrop-blur-sm"
                  >
                    {/* 警告图标 */}
                    <div className="absolute top-3 right-3">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <AlertTriangle className="h-4 w-4 text-white" />
                      </div>
                    </div>

                    {/* 冲突信息标题 */}
                    <div className="mb-4 pr-12">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-bold text-red-700">
                          {group.location || '未知位置'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Building className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-semibold text-red-600">
                          {group.projectType || '未知类型'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3 text-orange-600" />
                        <span className="text-xs text-gray-700">
                          发现 {group.projects ? group.projects.length : 0} 个冲突项目
                        </span>
                      </div>
                    </div>

                    {/* 项目列表 */}
                    <div className="space-y-3">
                      {group.projects && group.projects.map((project, projectIndex) => (
                        <div
                          key={projectIndex}
                          className="bg-white/90 backdrop-blur-sm p-3 rounded-xl border-l-4 border-red-400 shadow-md"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <FileText className="h-3 w-3 text-blue-600" />
                              <span className="text-xs font-semibold text-gray-700">项目编号</span>
                              <span className="text-xs text-gray-800 font-mono bg-gray-100 px-2 py-1 rounded">
                                {project.project_id}
                              </span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Building className="h-3 w-3 text-green-600 mt-0.5" />
                              <div className="flex-1">
                                <span className="text-xs font-semibold text-gray-700 block">合作单位</span>
                                <span className="text-xs text-gray-800">{project.partner_unit}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3 text-orange-600" />
                              <span className="text-xs font-semibold text-gray-700">位置</span>
                              <span className="text-xs text-gray-800">
                                {project.province}-{project.city}-{project.district}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-2xl p-8 text-center shadow-xl">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <div className="text-2xl">✅</div>
                  </div>
                  <div className="text-lg font-bold text-green-700 mb-2">未发现冲突项目</div>
                  <div className="text-sm text-gray-600">所有项目位置和合作单位都没有冲突</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // 登记表单状态
  const [registerForm, setRegisterForm] = useState({
    projectName: '',
    projectLocation: '',
    contactDate: '',
    projectCapacity: ''
  });

  // 处理登记表单变化
  const handleRegisterFormChange = (field, value) => {
    setRegisterForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 提交项目登记
  const handleRegisterSubmit = async () => {
    // 表单验证
    if (!registerForm.projectName || !registerForm.projectLocation ||
        !registerForm.contactDate || !registerForm.projectCapacity) {
      toast({
        title: "请填写完整信息",
        description: "所有字段都不能为空",
        variant: "destructive"
      });
      return;
    }

    // 容量数值验证
    const capacity = parseFloat(registerForm.projectCapacity);
    if (isNaN(capacity) || capacity <= 0) {
      toast({
        title: "项目容量格式错误",
        description: "请输入有效的项目容量数值",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // 获取当前用户信息
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

      // 保存到数据库
      await $w.cloud.callDataSource({
        dataSourceName: 'project_info',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            projectName: registerForm.projectName,
            projectLocation: registerForm.projectLocation,
            city: registerForm.projectLocation, // 同时保存到city字段用于统计
            contactDate: registerForm.contactDate,
            projectCapacity: capacity,
            department: currentUser.department || '未知部门',
            reporterName: currentUser.name || '未知用户',
            reporterPhone: currentUser.phone || '',
            reportTime: new Date().toISOString(),
            dataSource: 'dashboard-register' // 标识数据来源
          }
        }
      });

      toast({
        title: "登记成功",
        description: "项目信息已成功提交到数据库",
        duration: 1000
      });

      // 重置表单
      setRegisterForm({
        projectName: '',
        projectLocation: '',
        contactDate: '',
        projectCapacity: ''
      });

      // 返回主页面
      setTimeout(() => {
        showPage('main');
      }, 1000);
    } catch (error) {
      console.error('项目登记失败:', error);
      toast({
        title: "登记失败",
        description: error.message || "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 渲染登记页面
  const renderRegisterPage = () => (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: '"仿宋_GB2312", "FangSong_GB2312", serif' }}>
      {/* 头部 */}
      <div className="bg-blue-500 text-white p-4 relative">
        <button
          onClick={() => showPage('main')}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-lg hover:bg-blue-600 p-2 rounded"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-center">登记对接项目</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* 项目名称 */}
          <div>
            <label className="block font-bold text-blue-500 text-lg mb-3">项目名称</label>
            <input
              type="text"
              value={registerForm.projectName}
              onChange={(e) => handleRegisterFormChange('projectName', e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none"
              placeholder="请输入项目名称"
            />
          </div>

          {/* 项目区域 */}
          <div>
            <label className="block font-bold text-blue-500 text-lg mb-3">项目区域</label>
            <select
              value={registerForm.projectLocation}
              onChange={(e) => handleRegisterFormChange('projectLocation', e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none bg-white"
            >
              <option value="">请选择区域</option>
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          {/* 对接日期 */}
          <div>
            <label className="block font-bold text-blue-500 text-lg mb-3">对接日期</label>
            <input
              type="date"
              value={registerForm.contactDate}
              onChange={(e) => handleRegisterFormChange('contactDate', e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none"
            />
          </div>

          {/* 项目容量 */}
          <div>
            <label className="block font-bold text-blue-500 text-lg mb-3">项目容量（MW）</label>
            <input
              type="number"
              value={registerForm.projectCapacity}
              onChange={(e) => handleRegisterFormChange('projectCapacity', e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none"
              placeholder="请输入项目容量"
              min="0"
              step="0.1"
            />
          </div>

          {/* 提交按钮 */}
          <Button
            onClick={handleRegisterSubmit}
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white text-lg font-bold py-4 rounded-lg"
          >
            {loading ? '提交中...' : '提交登记'}
          </Button>
        </div>
      </div>
    </div>
  );

  // 主渲染函数
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'main':
        return renderMainPage();
      case 'statistics':
        return renderStatisticsPage();
      case 'chart':
        return renderChartPage();
      case 'conflict':
        return renderConflictPage();
      case 'register':
        return renderRegisterPage();
      default:
        return renderMainPage();
    }
  };

  return renderCurrentPage();
}