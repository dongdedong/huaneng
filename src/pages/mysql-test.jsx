// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Database, Play, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
// @ts-ignore;
import TopNavBar from '@/components/TopNavBar';

export default function MySQLTest(props) {
  const { $w } = props;
  const { toast } = useToast();

  // 页面状态
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('');

  // CloudBase 实例
  const [cloudbaseApp, setCloudbaseApp] = useState(null);

  // 测试结果
  const [testResults, setTestResults] = useState([]);

  // 表单数据
  const [testData, setTestData] = useState({
    tableName: 'test_table',
    insertData: JSON.stringify({
      name: '测试项目',
      description: '这是一个测试项目',
      created_at: new Date().toISOString()
    }, null, 2),
    queryCondition: JSON.stringify({
      name: '测试项目'
    }, null, 2)
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
        const envId = window.cloudbaseConfig?.env || "test-env-id";

        const app = window.cloudbase.init({
          env: envId,
          debug: true // 开启调试模式
        });

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

      // 加载CloudBase SDK脚本
      const script = document.createElement('script');
      script.src = 'https://static.cloudbase.net/cloudbase-js-sdk/1.7.1/cloudbase.full.js';
      script.onload = () => {
        console.log('CloudBase SDK加载完成，重新尝试初始化');
        // 递归调用自身
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

  // 测试数据库连接
  const testDatabaseConnection = async () => {
    if (!cloudbaseApp) {
      toast({
        title: "请先初始化SDK",
        description: "需要先成功连接CloudBase",
        variant: "destructive"
      });
      return;
    }

    console.log('=== 测试数据库连接 ===');
    setLoading(true);

    try {
      // 方法1：使用微搭平台的数据源API
      if (cloudbaseApp.callDataSource) {
        console.log('使用微搭平台数据源API测试连接');

        const result = await cloudbaseApp.callDataSource({
          dataSourceName: testData.tableName,
          methodName: 'wedaGetRecordsV2',
          params: {
            pageSize: 1
          }
        });

        console.log('微搭数据源连接测试结果:', result);
        addTestResult('连接测试', true, '微搭数据源连接正常', result);

        toast({
          title: "数据源连接成功",
          description: "可以正常访问微搭数据源",
          duration: 2000
        });
        return;
      }

      // 方法2：使用标准CloudBase数据库API
      if (cloudbaseApp.database) {
        console.log('使用CloudBase数据库API测试连接');

        const db = cloudbaseApp.database();
        console.log('数据库实例获取成功:', db);

        // 测试简单查询
        const testQuery = await db.collection(testData.tableName).limit(1).get();
        console.log('CloudBase数据库连接测试结果:', testQuery);

        addTestResult('连接测试', true, 'CloudBase数据库连接正常', testQuery);

        toast({
          title: "数据库连接成功",
          description: "可以正常访问CloudBase数据库",
          duration: 2000
        });
        return;
      }

      throw new Error('未找到可用的数据库接口');

    } catch (error) {
      console.error('数据库连接测试失败:', error);
      addTestResult('连接测试', false, error.message);

      toast({
        title: "数据库连接失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 测试插入数据
  const testInsertData = async () => {
    if (!cloudbaseApp) {
      toast({
        title: "请先初始化SDK",
        description: "需要先成功连接CloudBase",
        variant: "destructive"
      });
      return;
    }

    console.log('=== 测试插入数据 ===');
    setLoading(true);

    try {
      const insertDataObj = JSON.parse(testData.insertData);
      console.log('准备插入的数据:', insertDataObj);

      // 方法1：使用微搭平台的数据源API
      if (cloudbaseApp.callDataSource) {
        console.log('使用微搭数据源API插入数据');

        const result = await cloudbaseApp.callDataSource({
          dataSourceName: testData.tableName,
          methodName: 'wedaCreateV2',
          params: {
            data: insertDataObj
          }
        });

        console.log('微搭数据源插入结果:', result);
        addTestResult('插入数据', true, '微搭数据源插入成功', result);

        toast({
          title: "插入成功",
          description: `成功插入数据到${testData.tableName}`,
          duration: 2000
        });
        return;
      }

      // 方法2：使用标准CloudBase数据库API
      if (cloudbaseApp.database) {
        console.log('使用CloudBase数据库API插入数据');

        const db = cloudbaseApp.database();
        const result = await db.collection(testData.tableName).add(insertDataObj);

        console.log('CloudBase数据库插入结果:', result);
        addTestResult('插入数据', true, 'CloudBase数据库插入成功', result);

        toast({
          title: "插入成功",
          description: `成功插入数据到${testData.tableName}`,
          duration: 2000
        });
        return;
      }

      throw new Error('未找到可用的数据插入接口');

    } catch (error) {
      console.error('数据插入失败:', error);
      addTestResult('插入数据', false, error.message);

      toast({
        title: "插入失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 测试查询数据
  const testQueryData = async () => {
    if (!cloudbaseApp) {
      toast({
        title: "请先初始化SDK",
        description: "需要先成功连接CloudBase",
        variant: "destructive"
      });
      return;
    }

    console.log('=== 测试查询数据 ===');
    setLoading(true);

    try {
      const queryConditionObj = JSON.parse(testData.queryCondition);
      console.log('查询条件:', queryConditionObj);

      // 方法1：使用微搭平台的数据源API
      if (cloudbaseApp.callDataSource) {
        console.log('使用微搭数据源API查询数据');

        const result = await cloudbaseApp.callDataSource({
          dataSourceName: testData.tableName,
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              where: queryConditionObj
            },
            pageSize: 10
          }
        });

        console.log('微搭数据源查询结果:', result);
        const recordCount = result.records ? result.records.length : 0;
        addTestResult('查询数据', true, `微搭数据源查询到${recordCount}条记录`, result);

        toast({
          title: "查询成功",
          description: `从${testData.tableName}查询到${recordCount}条记录`,
          duration: 2000
        });
        return;
      }

      // 方法2：使用标准CloudBase数据库API
      if (cloudbaseApp.database) {
        console.log('使用CloudBase数据库API查询数据');

        const db = cloudbaseApp.database();
        const result = await db.collection(testData.tableName).where(queryConditionObj).get();

        console.log('CloudBase数据库查询结果:', result);
        const recordCount = result.data ? result.data.length : 0;
        addTestResult('查询数据', true, `CloudBase数据库查询到${recordCount}条记录`, result);

        toast({
          title: "查询成功",
          description: `从${testData.tableName}查询到${recordCount}条记录`,
          duration: 2000
        });
        return;
      }

      throw new Error('未找到可用的数据查询接口');

    } catch (error) {
      console.error('数据查询失败:', error);
      addTestResult('查询数据', false, error.message);

      toast({
        title: "查询失败",
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

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: '"仿宋_GB2312", "FangSong_GB2312", serif' }}>
      <TopNavBar {...props} />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Database className="h-8 w-8 text-blue-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">MySQL数据库测试</h1>
          </div>
          <p className="text-gray-600">测试CloudBase Web SDK连接和操作MySQL数据库</p>
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

        {/* 测试操作区 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">测试操作</h2>

          {/* 表名配置 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              测试表名
            </label>
            <input
              type="text"
              value={testData.tableName}
              onChange={(e) => handleFormChange('tableName', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
              placeholder="输入要测试的表名"
            />
          </div>

          {/* 插入数据配置 */}
          <div className="mb-4">
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
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              查询条件 (JSON格式)
            </label>
            <textarea
              value={testData.queryCondition}
              onChange={(e) => handleFormChange('queryCondition', e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 outline-none font-mono text-sm"
              placeholder="输入查询条件的JSON数据"
            />
          </div>

          {/* 测试按钮组 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={testDatabaseConnection}
              disabled={loading || !connected}
              className="bg-green-500 hover:bg-green-600 text-white w-full"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
              测试连接
            </Button>

            <Button
              onClick={testInsertData}
              disabled={loading || !connected}
              className="bg-blue-500 hover:bg-blue-600 text-white w-full"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              测试插入
            </Button>

            <Button
              onClick={testQueryData}
              disabled={loading || !connected}
              className="bg-purple-500 hover:bg-purple-600 text-white w-full"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              测试查询
            </Button>
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
            <li>• 首先点击"初始化SDK"按钮连接CloudBase</li>
            <li>• 修改表名为您要测试的实际表名</li>
            <li>• 调整插入数据和查询条件的JSON格式</li>
            <li>• 依次测试连接、插入、查询功能</li>
            <li>• 查看测试结果区域了解操作是否成功</li>
            <li>• 打开浏览器开发者工具查看详细的console日志</li>
          </ul>
        </div>
      </div>
    </div>
  );
}