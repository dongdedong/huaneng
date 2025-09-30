// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, useToast } from '@/components/ui';
// @ts-ignore;
import { FileText, Clock, Loader2 } from 'lucide-react';

// @ts-ignore;
import { ProjectForm } from '@/components/ProjectForm';
// @ts-ignore;
import { RecordCard } from '@/components/RecordCard';
// @ts-ignore;
import { ChinaLocationPicker } from '@/components/ChinaLocationPicker';
// @ts-ignore;
import { DuplicateConfirmDialog } from '@/components/DuplicateConfirmDialog';

// 日期格式化工具函数（原生实现）
const formatDateISO = date => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const formatDateTime = date => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};
export default function ProjectReport(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [formData, setFormData] = useState({
    projectDate: new Date(),
    projectLocation: {
      province: '',
      city: '',
      county: '',
      full_address: ''
    },
    projectDepartment: '',
    projectType: '',
    partnerUnit: '',
    reporterName: '',
    reporterPhone: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [myRecords, setMyRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateRecords, setDuplicateRecords] = useState([]);
  const [activeTab, setActiveTab] = useState('form');

  // 获取当前用户的_openid - 直接使用auth信息
  const getCurrentUserOpenid = () => {
    try {
      // 直接从auth获取_openid，避免云函数调用失败
      return $w?.auth?.currentUser?.openid || 'anonymous';
    } catch (error) {
      console.error('获取_openid失败:', error);
      return 'anonymous';
    }
  };

  // 检查重复数据
  const checkDuplicateRecords = async formData => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'project_report',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          filter: {
            where: {
              $and: [{
                'project_location.full_address': {
                  $eq: formData.projectLocation.full_address
                }
              }, {
                project_type: {
                  $eq: formData.projectType
                }
              }, {
                partner_unit: {
                  $eq: formData.partnerUnit || ''
                }
              }]
            }
          },
          getCount: true
        }
      });
      return result.records || [];
    } catch (error) {
      console.error('检查重复数据失败:', error);
      return [];
    }
  };

  // 加载当前用户的记录
  const loadMyRecords = async () => {
    try {
      const currentOpenid = getCurrentUserOpenid();
      console.log('当前用户_openid:', currentOpenid);
      if (currentOpenid && currentOpenid !== 'anonymous') {
        const userRecords = await $w.cloud.callDataSource({
          dataSourceName: 'project_report',
          methodName: 'wedaGetRecordsV2',
          params: {
            select: {
              $master: true
            },
            filter: {
              where: {
                _openid: {
                  $eq: currentOpenid
                }
              }
            },
            orderBy: [{
              createdAt: 'desc'
            }],
            getCount: true
          }
        });
        console.log('查询到的用户记录:', userRecords.records);
        setMyRecords(userRecords.records || []);
      } else {
        console.log('未获取到_openid，可能是匿名状态');
        setMyRecords([]);
      }
    } catch (error) {
      console.error('加载我的记录失败:', error);
      toast({
        title: "加载失败",
        description: "获取我的记录失败，请稍后重试",
        variant: "destructive"
      });
    }
  };

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      // 只加载当前用户的记录
      await loadMyRecords();
    } catch (error) {
      console.error('加载数据失败:', error);
      toast({
        title: "加载失败",
        description: error.message || "获取数据失败，请稍后重试",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadData();
  }, []);

  // 监听_openid变化
  useEffect(() => {
    const checkOpenidStatus = () => {
      const currentOpenid = getCurrentUserOpenid();
      console.log('_openid状态变化，当前_openid:', currentOpenid);
      if (currentOpenid && currentOpenid !== 'anonymous') {
        loadMyRecords();
      }
    };

    // 定期检查_openid状态
    const interval = setInterval(checkOpenidStatus, 3000);
    return () => clearInterval(interval);
  }, []);
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleLocationSelect = (province, city, county) => {
    setFormData(prev => ({
      ...prev,
      projectLocation: {
        province,
        city,
        county,
        full_address: `${province}${city}${county}`
      }
    }));
  };
  const resetForm = () => {
    setFormData({
      projectDate: new Date(),
      projectLocation: {
        province: '',
        city: '',
        county: '',
        full_address: ''
      },
      projectDepartment: '',
      projectType: '',
      partnerUnit: '',
      reporterName: '',
      reporterPhone: ''
    });
    setEditingId(null);
    // 如果正在编辑，切换回我的填报标签页
    if (editingId) {
      setActiveTab('mine');
    }
  };

  // 实际提交数据
  const submitData = async () => {
    setSubmitting(true);
    try {
      const currentOpenid = getCurrentUserOpenid();
      console.log('提交时的_openid:', currentOpenid);
      const recordData = {
        project_date: formatDateISO(formData.projectDate),
        project_location: {
          province: formData.projectLocation.province,
          city: formData.projectLocation.city,
          county: formData.projectLocation.county,
          full_address: formData.projectLocation.full_address
        },
        project_department: formData.projectDepartment,
        project_type: formData.projectType,
        partner_unit: formData.partnerUnit || '',
        reporter_name: formData.reporterName,
        reporter_phone: formData.reporterPhone,
        _openid: currentOpenid,
        status: 'submitted',
        remark: ''
      };
      if (editingId) {
        // 更新记录
        const updateResult = await $w.cloud.callDataSource({
          dataSourceName: 'project_report',
          methodName: 'wedaUpdateV2',
          params: {
            data: recordData,
            filter: {
              where: {
                _id: {
                  $eq: editingId
                }
              }
            }
          }
        });
        if (updateResult.count > 0) {
          toast({
            title: "更新成功",
            description: "记录已更新"
          });
        } else {
          throw new Error('更新失败：未找到记录');
        }
      } else {
        // 新增记录
        const createResult = await $w.cloud.callDataSource({
          dataSourceName: 'project_report',
          methodName: 'wedaCreateV2',
          params: {
            data: recordData
          }
        });
        if (createResult.id) {
          toast({
            title: "提交成功",
            description: "项目信息已保存"
          });
        } else {
          throw new Error('创建失败：未返回记录ID');
        }
      }
      resetForm();

      // 提交后重新加载数据，确保显示最新记录
      setTimeout(() => {
        loadData();
      }, 1000);
    } catch (error) {
      console.error('提交失败:', error);
      toast({
        title: editingId ? "更新失败" : "提交失败",
        description: error.message || "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  const handleSubmit = async () => {
    // 表单验证
    if (!formData.projectDepartment || !formData.projectType || !formData.reporterName || !formData.reporterPhone) {
      toast({
        title: "表单不完整",
        description: "请填写所有必填项",
        variant: "destructive"
      });
      return;
    }

    // 手机号验证
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(formData.reporterPhone)) {
      toast({
        title: "手机号格式错误",
        description: "请输入正确的11位手机号",
        variant: "destructive"
      });
      return;
    }

    // 如果是编辑模式，直接提交
    if (editingId) {
      await submitData();
      return;
    }

    // 检查重复数据
    const duplicates = await checkDuplicateRecords(formData);
    if (duplicates.length > 0) {
      setDuplicateRecords(duplicates);
      setShowDuplicateDialog(true);
    } else {
      await submitData();
    }
  };
  const handleConfirmDuplicate = async () => {
    setShowDuplicateDialog(false);
    await submitData();
  };
  const handleCancelDuplicate = () => {
    setShowDuplicateDialog(false);
    toast({
      title: "已取消提交",
      description: "您取消了重复数据的提交"
    });
  };
  const handleEdit = record => {
    setFormData({
      projectDate: new Date(record.project_date),
      projectLocation: record.project_location || {
        province: '',
        city: '',
        county: '',
        full_address: ''
      },
      projectDepartment: record.project_department,
      projectType: record.project_type,
      partnerUnit: record.partner_unit || '',
      reporterName: record.reporter_name,
      reporterPhone: record.reporter_phone
    });
    setEditingId(record._id);
    // 自动切换到填报标签页
    setActiveTab('form');
  };
  const handleViewRecord = record => {
    setSelectedRecord(record);
  };

  // 删除记录
  const handleDeleteRecord = async record => {
    if (!confirm(`确定要删除这条记录吗？\n项目地址：${record.project_location?.full_address || '未知'}\n提交时间：${new Date(record.createdAt).toLocaleString()}`)) {
      return;
    }
    try {
      const deleteResult = await $w.cloud.callDataSource({
        dataSourceName: 'project_report',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: record._id
              }
            }
          }
        }
      });
      if (deleteResult.count > 0) {
        toast({
          title: "删除成功",
          description: "记录已删除"
        });
        // 重新加载我的记录
        await loadMyRecords();
      } else {
        throw new Error('删除失败：未找到记录');
      }
    } catch (error) {
      console.error('删除记录失败:', error);
      toast({
        title: "删除失败",
        description: error.message || "请稍后重试",
        variant: "destructive"
      });
    }
  };

  // 手动刷新我的记录
  const handleRefreshMyRecords = async () => {
    await loadMyRecords();
    toast({
      title: "刷新成功",
      description: "我的记录已更新"
    });
  };
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-2xl shadow-lg flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
          <p className="text-gray-600 font-medium">加载中...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50">
      {/* 顶部装饰 */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-green-500 to-blue-600 opacity-10"></div>

      <div className="relative z-10 pb-8">
        <div className="max-w-lg mx-auto px-4">
          {/* 页面头部 */}
          <div className="pt-8 pb-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-2xl shadow-lg flex items-center justify-center">
              <div className="text-2xl">🏗️</div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">新能源项目管理</h1>
            <p className="text-gray-600">项目信息填报与管理系统</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* 标签页导航 */}
            <div className="mb-6">
              <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm rounded-2xl p-1 shadow-lg border border-white/20">
                <TabsTrigger value="form" className="rounded-xl py-2.5 px-3 text-sm font-medium transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 hover:text-gray-800 flex items-center justify-center min-h-[44px]">
                  <div className="flex items-center gap-2">
                    <span>{editingId ? '✏️' : '📝'}</span>
                    <span>{editingId ? '编辑' : '填报'}</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="mine" className="rounded-xl py-2.5 px-3 text-sm font-medium transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 hover:text-gray-800 flex items-center justify-center min-h-[44px]">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>我的填报</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* 填报页面 */}
            <TabsContent value="form" className="mt-0">
              <ProjectForm formData={formData} onInputChange={handleInputChange} onLocationSelect={handleLocationSelect} onSubmit={handleSubmit} onReset={resetForm} editingId={editingId} submitting={submitting} showDatePicker={showDatePicker} setShowDatePicker={setShowDatePicker} showLocationPicker={showLocationPicker} setShowLocationPicker={setShowLocationPicker} />
            </TabsContent>


            {/* 我的记录页面 */}
            <TabsContent value="mine" className="mt-0">
              <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm mx-4 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-1"></div>
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold flex items-center gap-3 text-gray-900">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div>我的填报</div>
                      <div className="text-sm font-normal text-gray-600">共 {myRecords.length} 条记录</div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {myRecords.length === 0 ? <div className="text-center py-12">
                        <div className="text-6xl mb-4">🗂️</div>
                        <p className="text-gray-500 text-lg font-medium mb-2">暂无记录</p>
                        <p className="text-sm text-gray-400 mb-4">
                          {!$w?.auth?.currentUser?.openid ? "扫码用户也可以看到自己的记录" : "您还没有提交过项目信息"}
                        </p>
                        <div className="space-y-2 text-xs text-gray-500 bg-gray-50 rounded-xl p-4">
                          <p>💡 提示：</p>
                          <p>• 提交后的记录会显示在这里</p>
                          <p>• 您可以随时查看、编辑和删除自己的记录</p>
                          <p>• 点击记录右上角的图标进行操作</p>
                        </div>
                      </div> : myRecords.map(record => <RecordCard key={record._id} record={record} onView={handleViewRecord} onEdit={handleEdit} onDelete={handleDeleteRecord} isMine={true} />)}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* 地址选择器 */}
          {showLocationPicker && <ChinaLocationPicker open={showLocationPicker} onOpenChange={setShowLocationPicker} onSelect={handleLocationSelect} />}

          {/* 重复数据确认弹框 */}
          <DuplicateConfirmDialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog} onConfirm={handleConfirmDuplicate} onCancel={handleCancelDuplicate} duplicateRecords={duplicateRecords} />
        </div>
      </div>
    </div>;
}