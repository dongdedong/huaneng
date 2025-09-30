// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';
// @ts-ignore;
import { Loader2 } from 'lucide-react';

// @ts-ignore;
import { ProjectForm } from '@/components/ProjectForm';
// @ts-ignore;
import { ChinaLocationPicker } from '@/components/ChinaLocationPicker';
// @ts-ignore;
import { DuplicateConfirmDialog } from '@/components/DuplicateConfirmDialog';
// @ts-ignore;
import TopNavBar from '@/components/TopNavBar';

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
    projectLocation: {
      province: '',
      city: '',
      county: '',
      full_address: ''
    },
    projectType: '',
    projectCapacity: '',
    partnerUnit: '',
    reporterName: '',
    reporterPhone: '',
    projectDepartment: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateRecords, setDuplicateRecords] = useState([]);
  const [projectId, setProjectId] = useState('');

  // 使用ref来跟踪组件是否已挂载
  const isMountedRef = useRef(true);
  useEffect(() => {
    // 组件挂载时设置ref为true
    isMountedRef.current = true;

    // 自动填入登录用户信息
    try {
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        const currentUser = JSON.parse(userData);
        setFormData(prev => ({
          ...prev,
          reporterName: currentUser.name || '',
          reporterPhone: currentUser.phone || '',
          projectDepartment: currentUser.department || ''
        }));
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }

    // 清理函数：组件卸载时设置ref为false
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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

  // 生成项目编号
  const generateProjectId = async () => {
    try {
      const now = new Date();
      const datePrefix = now.getFullYear().toString() +
                        String(now.getMonth() + 1).padStart(2, '0') +
                        String(now.getDate()).padStart(2, '0');
      const yearPrefix = now.getFullYear().toString();

      // 查询当前年度已有的项目编号数量
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'project_report',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              project_id: {
                $regex: `^${yearPrefix}`
              }
            }
          },
          getCount: true,
          pageSize: 1
        }
      });

      // 计算下一个序号（按年度递增）
      const count = result.total || 0;
      const nextSequence = String(count + 1).padStart(3, '0');
      const newProjectId = `${datePrefix}-${nextSequence}`;

      return newProjectId;
    } catch (error) {
      console.error('生成项目编号失败:', error);
      // 如果查询失败，使用默认编号
      const now = new Date();
      const datePrefix = now.getFullYear().toString() +
                        String(now.getMonth() + 1).padStart(2, '0') +
                        String(now.getDate()).padStart(2, '0');
      return `${datePrefix}-001`;
    }
  };

  // 检查重复数据 - 添加组件挂载检查
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
                  $eq: formData.partnerUnit
                }
              }]
            }
          },
          getCount: true
        }
      });

      // 检查组件是否仍然挂载
      if (!isMountedRef.current) {
        console.log('组件已卸载，取消状态更新');
        return [];
      }
      return result.records || [];
    } catch (error) {
      console.error('检查重复数据失败:', error);

      // 检查组件是否仍然挂载
      if (!isMountedRef.current) {
        console.log('组件已卸载，取消错误状态更新');
        return [];
      }
      return [];
    }
  };
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
        full_address: `${province}-${city}-${county}`
      }
    }));
  };
  const resetForm = () => {
    setFormData({
      projectLocation: {
        province: '',
        city: '',
        county: '',
        full_address: ''
      },
      projectType: '',
      projectCapacity: '',
      partnerUnit: '',
      reporterName: '',
      reporterPhone: '',
      projectDepartment: ''
    });

    // 重置后重新填入用户信息
    try {
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        const currentUser = JSON.parse(userData);
        setFormData(prev => ({
          ...prev,
          reporterName: currentUser.name || '',
          reporterPhone: currentUser.phone || '',
          projectDepartment: currentUser.department || ''
        }));
      }
    } catch (error) {
      console.error('重置表单时获取用户信息失败:', error);
    }
  };

  // 实际提交数据 - 添加组件挂载检查
  const submitData = async () => {
    setSubmitting(true);
    try {
      const currentOpenid = getCurrentUserOpenid();
      console.log('提交时的_openid:', currentOpenid);

      // 生成项目编号
      const generatedProjectId = await generateProjectId();
      setProjectId(generatedProjectId);

      // 获取当前用户信息
      const userData = localStorage.getItem('currentUser');
      const currentUser = userData ? JSON.parse(userData) : null;
      const recordData = {
        project_id: generatedProjectId,
        project_date: formatDateISO(new Date()),
        project_location: {
          province: formData.projectLocation.province,
          city: formData.projectLocation.city,
          county: formData.projectLocation.county,
          full_address: formData.projectLocation.full_address
        },
        project_department: currentUser?.department || formData.projectDepartment,
        project_type: formData.projectType,
        project_capacity: parseFloat(formData.projectCapacity).toFixed(2),
        partner_unit: formData.partnerUnit,
        reporter_name: formData.reporterName,
        reporter_phone: formData.reporterPhone,
        _openid: currentOpenid,
        status: 'submitted',
        remark: ''
      };
      // 新增记录
      const createResult = await $w.cloud.callDataSource({
        dataSourceName: 'project_report',
        methodName: 'wedaCreateV2',
        params: {
          data: recordData
        }
      });

      // 检查组件是否仍然挂载
      if (!isMountedRef.current) {
        console.log('组件已卸载，取消提交成功状态更新');
        return;
      }
      if (createResult.id) {
        toast({
          title: "提交成功",
          description: "项目信息已保存"
        });
      } else {
        throw new Error('创建失败：未返回记录ID');
      }
      resetForm();
    } catch (error) {
      console.error('提交失败:', error);

      // 检查组件是否仍然挂载
      if (!isMountedRef.current) {
        console.log('组件已卸载，取消提交失败状态更新');
        return;
      }
      toast({
        title: "提交失败",
        description: error.message || "请稍后重试",
        variant: "destructive"
      });
    } finally {
      // 检查组件是否仍然挂载
      if (isMountedRef.current) {
        setSubmitting(false);
      }
    }
  };
  const handleSubmit = async () => {
    // 表单验证
    if (!formData.projectDepartment || !formData.projectType || !formData.projectCapacity || !formData.partnerUnit || !formData.reporterName || !formData.reporterPhone) {
      toast({
        title: "表单不完整",
        description: "请填写所有必填项",
        variant: "destructive"
      });
      return;
    }

    // 项目容量验证
    const capacityNum = parseFloat(formData.projectCapacity);
    if (isNaN(capacityNum) || capacityNum <= 0) {
      toast({
        title: "项目容量格式错误",
        description: "请输入有效的项目容量数值",
        variant: "destructive"
      });
      return;
    }

    // 项目所在地验证 - 必须选择到县级
    if (!formData.projectLocation.province || !formData.projectLocation.city || !formData.projectLocation.county) {
      toast({
        title: "项目所在地不完整",
        description: "请选择完整的项目所在地（省-市-县）",
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

    // 检查重复数据
    const duplicates = await checkDuplicateRecords(formData);

    // 检查组件是否仍然挂载
    if (!isMountedRef.current) {
      console.log('组件已卸载，取消重复检查状态更新');
      return;
    }
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
      {/* 顶部导航栏 */}
      <TopNavBar $w={$w} />

      {/* 顶部装饰 */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-green-500 to-blue-600 opacity-10"></div>

      <div className="relative z-10 pb-8 pt-4">
        <div className="max-w-lg mx-auto px-4">
          {/* 页面头部 */}
          <div className="pt-8 pb-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-2xl shadow-lg flex items-center justify-center">
              <div className="text-2xl">🏗️</div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">新能源项目管理</h1>
            <p className="text-gray-600">项目信息填报与管理系统</p>

            {/* 开发工具链接 */}
            <div className="mt-4">
              <a href="#create-users-data" className="text-sm text-blue-600 underline" onClick={e => {
              e.preventDefault();
              window.location.hash = 'create-users-data';
              window.location.reload();
            }}>
                🔧 创建用户数据源（开发工具）
              </a>
            </div>
          </div>

          {/* 填报表单 */}
          <ProjectForm formData={formData} onInputChange={handleInputChange} onLocationSelect={handleLocationSelect} onSubmit={handleSubmit} onReset={resetForm} submitting={submitting} showLocationPicker={showLocationPicker} setShowLocationPicker={setShowLocationPicker} />

          {/* 地址选择器 */}
          {showLocationPicker && <ChinaLocationPicker open={showLocationPicker} onOpenChange={setShowLocationPicker} onSelect={handleLocationSelect} />}

          {/* 重复数据确认弹框 */}
          <DuplicateConfirmDialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog} onConfirm={handleConfirmDuplicate} onCancel={handleCancelDuplicate} duplicateRecords={duplicateRecords} />
        </div>
      </div>
    </div>;
}