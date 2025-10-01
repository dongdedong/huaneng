// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Database, Play, RefreshCw, AlertCircle, CheckCircle, Code, FileText, Search, Plus } from 'lucide-react';
// @ts-ignore;
import TopNavBar from '@/components/TopNavBar';

export default function MySQLTest(props) {
  const { $w } = props;
  const { toast } = useToast();

  // 页面状态
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('');
  const [currentTab, setCurrentTab] = useState('models'); // models, sql, raw

  // CloudBase 实例
  const [cloudbaseApp, setCloudbaseApp] = useState(null);

  // 测试结果
  const [testResults, setTestResults] = useState([]);

  // 表单数据
  const [testData, setTestData] = useState({
    // Models API 相关
    modelName: 'users_tbl',
    envType: 'pre', // pre: 体验环境, prod: 正式环境
    insertData: JSON.stringify({
      password: "test123",
      name: "测试用户",
      phone_num: 13112345678
    }, null, 2),
    updateData: JSON.stringify({
      name: "更新后的用户名",
      phone_num: 13987654321
    }, null, 2),
    filterCondition: JSON.stringify({
      where: {
        $and: [
          {
            name: {
              $eq: "测试用户"
            }
          }
        ]
      }
    }, null, 2),

    // SQL 相关
    sqlTemplate: 'SELECT * FROM `{{tableName}}` WHERE name = {{userName}} LIMIT {{limit}}',
    sqlParams: JSON.stringify({
      tableName: 'users_tbl',
      userName: '测试用户',
      limit: 10
    }, null, 2),
    rawSql: 'SELECT * FROM `users_tbl` WHERE name = \'测试用户\' LIMIT 10'
  });

  // 添加测试结果
  const addTestResult = (operation, success, message, data = null) => {
    const result = {
      id: Date.now(),
      operation,
      success,
      message,
      data,
      timestamp: new Date().toLocaleString()
    };
    setTestResults(prev => [result, ...prev]);
  };

  // 初始化CloudBase SDK
  const initializeCloudBase = async () => {
    console.log('=== 开始初始化CloudBase SDK ===');
    setLoading(true);

    try {
      // 方法1：尝试使用微搭平台的$w.cloud
      if ($w && $w.cloud) {
        console.log('使用微搭平台的$w.cloud接口');
        setCloudbaseApp($w.cloud);
        setConnected(true);
        setConnectionStatus('已连接到微搭云开发环境');

        addTestResult('初始化', true, '使用微搭平台云开发接口连接成功');

        toast({
          title: "连接成功",
          description: "已连接到微搭云开发环境",
          duration: 2000
        });
        return;
      }

      // 方法2：尝试使用全局cloudbase对象
      if (window.cloudbase) {
        console.log('使用全局cloudbase实例');

        // 从配置文件或环境变量获取环境ID
        const envId = "huanneng-0g1guqcgf3264f38"; // 使用参考文档中的环境ID

        const app = window.cloudbase.init({
          env: envId,
          debug: true
        });

        // 初始化认证
        const auth = app.auth({
          persistence: "local",
        });
        await auth.signInAnonymously();

        console.log('CloudBase SDK初始化成功:', app);
        setCloudbaseApp(app);
        setConnected(true);
        setConnectionStatus(`CloudBase SDK连接成功 (环境: ${envId})`);

        addTestResult('初始化', true, `CloudBase SDK初始化成功，环境ID: ${envId}`);

        toast({
          title: "连接成功",
          description: "CloudBase SDK已成功初始化",
          duration: 2000
        });
        return;
      }

      // 方法3：尝试动态加载CloudBase SDK
      console.log('尝试动态加载CloudBase SDK...');

      const script = document.createElement('script');
      script.src = 'https://static.cloudbase.net/cloudbase-js-sdk/1.7.1/cloudbase.full.js';
      script.onload = () => {
        console.log('CloudBase SDK加载完成，重新尝试初始化');
        setTimeout(() => initializeCloudBase(), 1000);
      };
      script.onerror = () => {
        throw new Error('CloudBase SDK加载失败');
      };
      document.head.appendChild(script);

    } catch (error) {
      console.error('CloudBase SDK初始化失败:', error);
      setConnected(false);
      setConnectionStatus(`连接失败: ${error.message}`);

      addTestResult('初始化', false, error.message);

      toast({
        title: "连接失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Models API - 创建数据
  const testModelsCreate = async () => {
    if (!cloudbaseApp) {
      toast({
        title: "请先初始化SDK",
        description: "需要先成功连接CloudBase",
        variant: "destructive"
      });
      return;
    }

    console.log('=== 测试Models API创建数据 ===');
    setLoading(true);

    try {
      const insertDataObj = JSON.parse(testData.insertData);
      console.log('准备创建的数据:', insertDataObj);

      const { data } = await cloudbaseApp.models[testData.modelName].create({
        data: insertDataObj,
        envType: testData.envType
      });

      console.log('Models API创建结果:', data);
      addTestResult('Models创建', true, `成功创建数据，ID: ${data.id}`, data);

      toast({
        title: "创建成功",
        description: `成功在${testData.modelName}中创建数据`,
        duration: 2000
      });

    } catch (error) {
      console.error('Models API创建失败:', error);
      addTestResult('Models创建', false, error.message);

      toast({
        title: "创建失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Models API - 查询数据
  const testModelsList = async () => {
    if (!cloudbaseApp) {
      toast({
        title: "请先初始化SDK",
        description: "需要先成功连接CloudBase",
        variant: "destructive"
      });
      return;
    }

    console.log('=== 测试Models API查询数据 ===');
    setLoading(true);

    try {
      const filterObj = JSON.parse(testData.filterCondition);
      console.log('查询条件:', filterObj);

      const { data } = await cloudbaseApp.models[testData.modelName].list({
        filter: filterObj,
        pageSize: 10,
        pageNumber: 1,
        getCount: true,
        envType: testData.envType
      });

      console.log('Models API查询结果:', data);
      addTestResult('Models查询', true, `查询到${data.records.length}条记录，总数: ${data.total}`, data);

      toast({
        title: "查询成功",
        description: `从${testData.modelName}查询到${data.records.length}条记录`,
        duration: 2000
      });

    } catch (error) {
      console.error('Models API查询失败:', error);
      addTestResult('Models查询', false, error.message);

      toast({
        title: "查询失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 预编译SQL模式
  const testPrecompiledSQL = async () => {
    if (!cloudbaseApp) {
      toast({
        title: "请先初始化SDK",
        description: "需要先成功连接CloudBase",
        variant: "destructive"
      });
      return;
    }

    console.log('=== 测试预编译SQL模式 ===');
    setLoading(true);

    try {
      const sqlParamsObj = JSON.parse(testData.sqlParams);
      console.log('SQL模板:', testData.sqlTemplate);
      console.log('SQL参数:', sqlParamsObj);

      const result = await cloudbaseApp.models.$runSQL(
        testData.sqlTemplate,
        sqlParamsObj
      );

      console.log('预编译SQL执行结果:', result);
      addTestResult('预编译SQL', true, `查询到${result.data.total}条记录`, result);

      toast({
        title: "SQL执行成功",
        description: `预编译SQL查询到${result.data.total}条记录`,
        duration: 2000
      });

    } catch (error) {
      console.error('预编译SQL执行失败:', error);
      addTestResult('预编译SQL', false, error.message);

      toast({
        title: "SQL执行失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 原始SQL模式
  const testRawSQL = async () => {
    if (!cloudbaseApp) {
      toast({
        title: "请先初始化SDK",
        description: "需要先成功连接CloudBase",
        variant: "destructive"
      });
      return;
    }

    console.log('=== 测试原始SQL模式 ===');
    setLoading(true);

    try {
      console.log('原始SQL:', testData.rawSql);

      const result = await cloudbaseApp.models.$runSQLRaw(testData.rawSql);

      console.log('原始SQL执行结果:', result);
      addTestResult('原始SQL', true, `查询到${result.data.total}条记录`, result);

      toast({
        title: "SQL执行成功",
        description: `原始SQL查询到${result.data.total}条记录`,
        duration: 2000
      });

    } catch (error) {
      console.error('原始SQL执行失败:', error);
      addTestResult('原始SQL', false, error.message);

      toast({
        title: "SQL执行失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 清除测试结果
  const clearResults = () => {
    setTestResults([]);
  };

  // 处理表单数据变化
  const handleFormChange = (field, value) => {
    setTestData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 页面加载时自动初始化
  useEffect(() => {
    // 可以选择是否自动初始化
    // initializeCloudBase();
  }, []);

  // 渲染Models API标签页
  const renderModelsTab = () => (
    <div className="space-y-6">
      {/* 模型配置 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            模型名称
          </label>
          <input
            type="text"
            value={testData.modelName}
            onChange={(e) => handleFormChange('modelName', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
            placeholder="输入模型名称，如: users_tbl"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            环境类型
          </label>
          <select
            value={testData.envType}
            onChange={(e) => handleFormChange('envType', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 outline-none bg-white"
          >
            <option value="pre">体验环境 (pre)</option>
            <option value="prod">正式环境 (prod)</option>
          </select>
        </div>
      </div>

      {/* 插入数据配置 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          插入数据 (JSON格式)
        </label>
        <textarea
          value={testData.insertData}
          onChange={(e) => handleFormChange('insertData', e.target.value)}
          rows={6}
          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 outline-none font-mono text-sm"
          placeholder="输入要插入的JSON数据"
        />
      </div>

      {/* 查询条件配置 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          查询条件 (Filter JSON格式)
        </label>
        <textarea
          value={testData.filterCondition}
          onChange={(e) => handleFormChange('filterCondition', e.target.value)}
          rows={8}
          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 outline-none font-mono text-sm"
          placeholder="输入查询条件的JSON数据"
        />
      </div>

      {/* 操作按钮 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          onClick={testModelsCreate}
          disabled={loading || !connected}
          className="bg-green-500 hover:bg-green-600 text-white w-full"
        >
          {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          创建数据
        </Button>

        <Button
          onClick={testModelsList}
          disabled={loading || !connected}
          className="bg-blue-500 hover:bg-blue-600 text-white w-full"
        >
          {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
          查询数据
        </Button>
      </div>
    </div>
  );

  // 渲染预编译SQL标签页
  const renderSQLTab = () => (
    <div className="space-y-6">
      {/* SQL模板 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          SQL模板 (支持 Mustache 语法 {`{{参数名}}`})
        </label>
        <textarea
          value={testData.sqlTemplate}
          onChange={(e) => handleFormChange('sqlTemplate', e.target.value)}
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 outline-none font-mono text-sm"
          placeholder="输入SQL模板，如: SELECT * FROM `{{tableName}}` WHERE name = {{userName}} LIMIT {{limit}}"
        />
      </div>

      {/* SQL参数 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          SQL参数 (JSON格式)
        </label>
        <textarea
          value={testData.sqlParams}
          onChange={(e) => handleFormChange('sqlParams', e.target.value)}
          rows={6}
          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 outline-none font-mono text-sm"
          placeholder="输入SQL参数的JSON数据"
        />
      </div>

      {/* 执行按钮 */}
      <Button
        onClick={testPrecompiledSQL}
        disabled={loading || !connected}
        className="bg-purple-500 hover:bg-purple-600 text-white w-full"
      >
        {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Code className="h-4 w-4 mr-2" />}
        执行预编译SQL
      </Button>
    </div>
  );

  // 渲染原始SQL标签页
  const renderRawSQLTab = () => (
    <div className="space-y-6">
      {/* 原始SQL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          原始SQL语句
        </label>
        <textarea
          value={testData.rawSql}
          onChange={(e) => handleFormChange('rawSql', e.target.value)}
          rows={8}
          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 outline-none font-mono text-sm"
          placeholder="输入完整的SQL语句"
        />
      </div>

      {/* 执行按钮 */}
      <Button
        onClick={testRawSQL}
        disabled={loading || !connected}
        className="bg-red-500 hover:bg-red-600 text-white w-full"
      >
        {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
        执行原始SQL
      </Button>

      {/* 警告提示 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
          <span className="text-yellow-800 font-medium">注意</span>
        </div>
        <p className="text-yellow-700 text-sm mt-1">
          原始SQL模式直接执行SQL语句，请确保语句的安全性，避免SQL注入风险。推荐使用预编译模式。
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: '"仿宋_GB2312", "FangSong_GB2312", serif' }}>
      <TopNavBar {...props} />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Database className="h-8 w-8 text-blue-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">CloudBase数据库测试</h1>
          </div>
          <p className="text-gray-600">测试CloudBase Models API和SQL查询功能</p>
        </div>

        {/* 连接状态 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              {connected ? (
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
              ) : (
                <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
              )}
              连接状态
            </h2>
            <Button
              onClick={initializeCloudBase}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              初始化SDK
            </Button>
          </div>

          <div className={`p-4 rounded-lg ${connected ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className={`font-medium ${connected ? 'text-green-800' : 'text-red-800'}`}>
              {connectionStatus || '未连接'}
            </p>
          </div>
        </div>

        {/* 标签页导航 */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setCurrentTab('models')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  currentTab === 'models'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Models API
              </button>
              <button
                onClick={() => setCurrentTab('sql')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  currentTab === 'sql'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Code className="h-4 w-4 inline mr-2" />
                预编译SQL
              </button>
              <button
                onClick={() => setCurrentTab('raw')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  currentTab === 'raw'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Database className="h-4 w-4 inline mr-2" />
                原始SQL
              </button>
            </nav>
          </div>

          {/* 标签页内容 */}
          <div className="p-6">
            {currentTab === 'models' && renderModelsTab()}
            {currentTab === 'sql' && renderSQLTab()}
            {currentTab === 'raw' && renderRawSQLTab()}
          </div>
        </div>

        {/* 测试结果区 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">测试结果</h2>
            <Button
              onClick={clearResults}
              variant="outline"
              className="text-gray-600 hover:text-gray-800"
            >
              清除结果
            </Button>
          </div>

          {testResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              暂无测试结果
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {testResults.map((result) => (
                <div
                  key={result.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    result.success
                      ? 'bg-green-50 border-green-400'
                      : 'bg-red-50 border-red-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {result.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                      )}
                      <span className="font-medium text-gray-800">
                        {result.operation}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {result.timestamp}
                    </span>
                  </div>

                  <p className={`mb-2 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                    {result.message}
                  </p>

                  {result.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                        查看详细数据
                      </summary>
                      <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 使用说明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-bold text-blue-800 mb-3">使用说明</h3>
          <ul className="text-blue-700 space-y-2 text-sm">
            <li>• <strong>Models API</strong>：使用CloudBase提供的高级数据模型API，支持创建、查询等操作</li>
            <li>• <strong>预编译SQL</strong>：使用参数化查询，通过 Mustache 语法 {`{{参数名}}`} 绑定参数，防止SQL注入</li>
            <li>• <strong>原始SQL</strong>：直接执行完整SQL语句，需要注意安全性</li>
            <li>• 环境类型：pre（体验环境）用于测试，prod（正式环境）用于生产</li>
            <li>• 推荐优先使用Models API，复杂查询可使用预编译SQL模式</li>
          </ul>
        </div>
      </div>
    </div>
  );
}