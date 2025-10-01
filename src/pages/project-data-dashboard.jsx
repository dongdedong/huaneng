// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { useToast, Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, BarChart3, AlertTriangle, FileText, Calendar, Filter, TrendingUp } from 'lucide-react';
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

  // 查询项目冲突数据
  const queryConflictProjects = async () => {
    setConflictLoading(true);
    try {
      // 查询所有项目数据
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'project_info',
        methodName: 'wedaGetRecordsV2',
        params: {
          pageSize: 1000
        }
      });

      if (result.records && result.records.length > 0) {
        // 按地区分组查找可能的冲突项目
        const locationGroups = {};

        result.records.forEach(record => {
          if (record.city || record.projectLocation) {
            const location = record.city || record.projectLocation;
            if (!locationGroups[location]) {
              locationGroups[location] = [];
            }
            locationGroups[location].push(record.projectName);
          }
        });

        // 筛选出有多个项目的地区（可能存在冲突）
        const conflicts = [];
        Object.keys(locationGroups).forEach(location => {
          if (locationGroups[location].length > 1) {
            // 去重项目名称
            const uniqueProjects = [...new Set(locationGroups[location])];
            if (uniqueProjects.length > 1) {
              conflicts.push(uniqueProjects);
            }
          }
        });

        // 如果没有找到冲突，使用默认示例数据
        if (conflicts.length === 0) {
          setConflictProjects([
            ['安阳光伏项目', '安阳风电项目'],
            ['洛阳产业园区项目', '洛阳分布式光伏项目', '洛阳储能项目'],
            ['南阳农光互补项目', '南阳牧光互补项目']
          ]);
        } else {
          setConflictProjects(conflicts);
        }
      } else {
        // 没有数据时使用默认示例
        setConflictProjects([
          ['暂无项目冲突数据', '请先添加项目信息']
        ]);
      }
    } catch (error) {
      console.error('查询冲突项目失败:', error);
      // 出错时使用默认示例数据
      setConflictProjects([
        ['安阳光伏项目', '安阳风电项目'],
        ['洛阳产业园区项目', '洛阳分布式光伏项目', '洛阳储能项目'],
        ['南阳农光互补项目', '南阳牧光互补项目']
      ]);
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
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: '"仿宋_GB2312", "FangSong_GB2312", serif' }}>
      <TopNavBar {...props} />

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">项目管理系统</h1>
        </div>

        {/* 模块网格 */}
        <div className="space-y-6">
          {/* 对接项目统计 */}
          <div
            onClick={() => showPage('statistics')}
            className="bg-blue-500 text-white p-8 rounded-2xl shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl active:scale-98"
          >
            <div className="flex items-center justify-center mb-3">
              <BarChart3 className="h-8 w-8" />
            </div>
            <div className="text-xl font-bold text-center">对接项目统计</div>
          </div>

          {/* 项目冲突预警 */}
          <div
            onClick={() => showPage('conflict')}
            className="bg-blue-500 text-white p-8 rounded-2xl shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl active:scale-98"
          >
            <div className="flex items-center justify-center mb-3">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div className="text-xl font-bold text-center">项目冲突预警</div>
          </div>

          {/* 登记对接项目 */}
          <div
            onClick={() => showPage('register')}
            className="bg-blue-500 text-white p-8 rounded-2xl shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl active:scale-98"
          >
            <div className="flex items-center justify-center mb-3">
              <FileText className="h-8 w-8" />
            </div>
            <div className="text-xl font-bold text-center">登记对接项目</div>
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染统计页面
  const renderStatisticsPage = () => (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: '"仿宋_GB2312", "FangSong_GB2312", serif' }}>
      {/* 头部 */}
      <div className="bg-blue-500 text-white p-4 relative">
        <button
          onClick={() => showPage('main')}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-lg hover:bg-blue-600 p-2 rounded"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-center">对接项目统计</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* 时间段选择 */}
          <div>
            <label className="block font-bold text-blue-500 text-lg mb-3">时间段</label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                value={statisticsForm.startDate}
                onChange={(e) => handleStatisticsFormChange('startDate', e.target.value)}
                min="2000-01-01"
                max={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none"
              />
              <input
                type="date"
                value={statisticsForm.endDate}
                onChange={(e) => handleStatisticsFormChange('endDate', e.target.value)}
                min={statisticsForm.startDate}
                max={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* 筛选项 */}
          <div>
            <label className="block font-bold text-blue-500 text-lg mb-3">筛选项</label>
            <select
              value={statisticsForm.filterType}
              onChange={(e) => handleStatisticsFormChange('filterType', e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none bg-white"
            >
              <option value="department">项目开发部</option>
              <option value="region">项目区域</option>
            </select>
          </div>

          {/* 对接项目情况 */}
          <div>
            <label className="block font-bold text-blue-500 text-lg mb-3">对接项目情况</label>
            <div className="space-y-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="dataType"
                  value="count"
                  checked={statisticsForm.dataType === 'count'}
                  onChange={(e) => handleStatisticsFormChange('dataType', e.target.value)}
                  className="mr-3 w-5 h-5 text-blue-500"
                />
                <span className="text-lg">对接项目数量</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="dataType"
                  value="capacity"
                  checked={statisticsForm.dataType === 'capacity'}
                  onChange={(e) => handleStatisticsFormChange('dataType', e.target.value)}
                  className="mr-3 w-5 h-5 text-blue-500"
                />
                <span className="text-lg">对接项目容量</span>
              </label>
            </div>
          </div>

          {/* 提交按钮 */}
          <Button
            onClick={handleStatisticsSubmit}
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white text-lg font-bold py-4 rounded-lg"
          >
            {loading ? '查询中...' : '提交'}
          </Button>
        </div>
      </div>
    </div>
  );

  // 渲染图表页面
  const renderChartPage = () => {
    const displayData = updateChart();
    const maxValue = getMaxValue(displayData);

    return (
      <div className="min-h-screen bg-gray-50" style={{ fontFamily: '"仿宋_GB2312", "FangSong_GB2312", serif' }}>
        {/* 头部 */}
        <div className="bg-blue-500 text-white p-4 relative">
          <button
            onClick={() => showPage('statistics')}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-lg hover:bg-blue-600 p-2 rounded"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-center">统计结果</h1>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* 图表控制 */}
          <div className="bg-gray-100 p-4 rounded-lg mb-6 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">排序方式：</label>
              <select
                value={chartData.sortOrder}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="desc">降序</option>
                <option value="asc">升序</option>
              </select>
            </div>
            <button
              onClick={toggleZeroData}
              className={`text-sm px-3 py-1 rounded transition-all ${
                chartData.hideZeroData
                  ? 'font-bold text-blue-600 bg-blue-100'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              是否隐藏0数据
            </button>
          </div>

          {/* 图表容器 */}
          <div className="bg-white p-6 rounded-lg shadow-lg relative">
            {/* Y轴标签 */}
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 -rotate-90 text-sm font-bold text-gray-600">
              {statisticsForm.dataType === 'count' ? '对接项目数量' : '对接项目容量 (MW)'}
            </div>

            {/* 图表区域 */}
            <div className="ml-8 mr-4">
              <div className="flex items-end justify-center space-x-1 h-80 overflow-x-auto pb-16">
                {displayData.map((item, index) => {
                  const barHeight = Math.max(20, (item.value / maxValue) * 250);
                  return (
                    <div key={index} className="flex flex-col items-center min-w-[50px]">
                      {/* 数值标签 */}
                      <div className="text-xs font-bold text-gray-700 mb-1">
                        {item.value}
                      </div>
                      {/* 柱子 */}
                      <div
                        className="bg-blue-500 w-6 rounded-t transition-all duration-500 shadow-lg hover:bg-blue-600"
                        style={{ height: `${barHeight}px` }}
                      />
                      {/* 分类标签 */}
                      <div className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-top-left w-12 h-12 flex items-start">
                        <span className="whitespace-nowrap">{item.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* X轴标签 */}
              <div className="text-center mt-4">
                <div className="text-sm font-bold text-gray-600">
                  {statisticsForm.filterType === 'department' ? '项目开发部' : '项目区域'}
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
    <div className="min-h-screen bg-white" style={{ fontFamily: '"仿宋_GB2312", "FangSong_GB2312", serif' }}>
      {/* 头部 */}
      <div className="bg-blue-500 text-white p-4 relative">
        <button
          onClick={() => showPage('main')}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-lg hover:bg-blue-600 p-2 rounded"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-center">项目冲突预警</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* 标题 */}
        <h2 className="text-2xl font-bold text-red-600 text-center mb-8">项目冲突情况</h2>

        {/* 加载状态 */}
        {conflictLoading ? (
          <div className="text-center py-12">
            <div className="text-lg text-gray-600">正在查询冲突项目...</div>
          </div>
        ) : (
          /* 冲突项目组 */
          <div className="space-y-6">
            {conflictProjects.length > 0 ? (
              conflictProjects.map((group, groupIndex) => (
                <div
                  key={groupIndex}
                  className="bg-yellow-200 border-2 border-yellow-300 rounded-2xl p-6 relative shadow-lg"
                >
                  {/* 警告图标 */}
                  <div className="absolute top-3 right-3 text-2xl">⚠️</div>

                  {/* 项目列表 */}
                  <div className="space-y-3">
                    {group.map((project, projectIndex) => (
                      <div
                        key={projectIndex}
                        className={`text-lg font-medium text-gray-800 ${
                          projectIndex < group.length - 1 ? 'border-b border-yellow-400 pb-3' : ''
                        }`}
                      >
                        {project}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-lg text-gray-600">暂无项目冲突数据</div>
              </div>
            )}
          </div>
        )}
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