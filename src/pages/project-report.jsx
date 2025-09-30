// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, useToast } from '@/components/ui';
// @ts-ignore;
import { Users, FileText, Clock, Loader2 } from 'lucide-react';

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
  const [records, setRecords] = useState([]);
  const [myRecords, setMyRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filterDate, setFilterDate] = useState(null);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateRecords, setDuplicateRecords] = useState([]);

  // 获取当前用户的_openid
  const getCurrentUserOpenid = async () => {
    try {
      // 使用云函数获取_openid，这样即使匿名用户也能获取到
      const result = await $w.cloud.callFunction({
        name: 'getOpenid',
        data: {}
      });
      return result.result.openid;
    } catch (error) {
      console.error('获取_openid失败:', error);
      // 如果云函数调用失败，尝试从auth获取
      return $w?.auth?.currentUser?.openid || 'anonymous';
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
      const currentOpenid = await getCurrentUserOpenid();
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
      // 加载全部记录
      const allRecords = await $w.cloud.callDataSource({
        dataSourceName: 'project_report',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          getCount: true
        }
      });
      setRecords(allRecords.records || []);

      // 加载当前用户的记录
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
    const checkOpenidStatus = async () => {
      const currentOpenid = await getCurrentUserOpenid();
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
  };

  // 实际提交数据
  const submitData = async () => {
    setSubmitting(true);
    try {
      const currentOpenid = await getCurrentUserOpenid();
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
  };
  const handleViewRecord = record => {
    setSelectedRecord(record);
  };
  const filteredRecords = filterDate ? records.filter(r => r.project_date === formatDateISO(filterDate)) : records;

  // 手动刷新我的记录
  const handleRefreshMyRecords = async () => {
    await loadMyRecords();
    toast({
      title: "刷新成功",
      description: "我的记录已更新"
    });
  };
  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>;
  }
  return <div className="min-h-screen bg-gray-50 px-3 py-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-xl font-bold text-center mb-4 text-gray-800">项目信息填报</h1>
        
        <Tabs defaultValue="form" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 bg-white rounded-lg p-1">
            <TabsTrigger value="form" className="rounded-md py-2 text-sm data-[state=active]:bg-green-600 data-[state=active]:text-white">
              {editingId ? '编辑' : '填报'}
            </TabsTrigger>
            <TabsTrigger value="all" className="rounded-md py-2 text-sm data-[state=active]:bg-green-600 data-[state=active]:text-white">
              全部
            </TabsTrigger>
            <TabsTrigger value="mine" className="rounded-md py-2 text-sm data-[state=active]:bg-green-600 data-[state=active]:text-white">
              我的
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="form" className="mt-0">
            <ProjectForm formData={formData} onInputChange={handleInputChange} onLocationSelect={handleLocationSelect} onSubmit={handleSubmit} onReset={resetForm} editingId={editingId} submitting={submitting} showDatePicker={showDatePicker} setShowDatePicker={setShowDatePicker} showLocationPicker={showLocationPicker} setShowLocationPicker={setShowLocationPicker} />
          </TabsContent>

          <TabsContent value="all" className="mt-0">
            <Card className="border-0 shadow-sm rounded-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  全部记录
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredRecords.map(record => <RecordCard key={record._id} record={record} onView={handleViewRecord} onEdit={handleEdit} />)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mine" className="mt-0">
            <Card className="border-0 shadow-sm rounded-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  我的记录
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {myRecords.length === 0 ? <div className="text-center py-8">
                      <p className="text-gray-500 mb-2">暂无记录</p>
                      <p className="text-sm text-gray-400">
                        {!$w?.auth?.currentUser?.openid ? "扫码用户也可以看到自己的记录" : "您还没有提交过项目信息"}
                      </p>
                    </div> : myRecords.map(record => <RecordCard key={record._id} record={record} onView={handleViewRecord} onEdit={handleEdit} isMine={true} />)}
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
    </div>;
}