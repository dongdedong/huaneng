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

  // 冲突项目数据
  const conflictProjects = [
    ['安阳光伏项目', '安阳风电项目'],
    ['洛阳产业园区项目', '洛阳分布式光伏项目', '洛阳储能项目'],
    ['南阳农光互补项目', '南阳牧光互补项目']
  ];

  // 页面切换函数
  const showPage = (pageId) => {
    setCurrentPage(pageId);
  };

  // 处理统计表单变化
  const handleStatisticsFormChange = (field, value) => {
    setStatisticsForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 提交统计查询
  const handleStatisticsSubmit = async () => {
    setLoading(true);
    try {
      // 模拟数据查询
      const categories = statisticsForm.filterType === 'department' ? departments : regions;
      let values;

      if (statisticsForm.filterType === 'department') {
        // 部门数据（模拟）
        values = statisticsForm.dataType === 'count'
          ? [15, 8, 12, 0, 20, 18, 7, 0, 13, 6, 9]
          : [120, 85, 95, 0, 180, 150, 75, 0, 110, 60, 80];
      } else {
        // 地区数据（模拟）
        values = statisticsForm.dataType === 'count'
          ? [5, 3, 0, 8, 7, 12, 15, 6, 0, 6, 9, 10, 13, 20, 8, 7]
          : [45, 30, 0, 75, 65, 110, 140, 55, 0, 60, 85, 95, 125, 190, 75, 65];
      }

      setChartData({
        categories,
        values,
        sortOrder: 'desc',
        hideZeroData: false
      });

      showPage('chart');

      toast({
        title: "查询成功",
        description: "数据已加载完成",
        duration: 1000
      });
    } catch (error) {
      toast({
        title: "查询失败",
        description: "请稍后重试",
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

        {/* 冲突项目组 */}
        <div className="space-y-6">
          {conflictProjects.map((group, groupIndex) => (
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
          ))}
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

    setLoading(true);
    try {
      toast({
        title: "登记成功",
        description: "项目信息已成功提交",
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
      toast({
        title: "登记失败",
        description: "请稍后重试",
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