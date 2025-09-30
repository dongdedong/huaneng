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
// @ts-ignore;
import AuthGuard from '@/components/AuthGuard';

// 日期格式化工具函数
const formatDateISO = date => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
    partnerUnit: '',
    reporterName: '',
    reporterPhone: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateRecords, setDuplicateRecords] = useState([]);

  // 使用ref来跟踪组件是否已挂载
  const isMountedRef = useRef(true);
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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
      if (!isMountedRef.current) return [];
      return result.records || [];
    } catch (error) {
      console.error('检查重复数据失败:', error);
      if (!isMountedRef.current) return [];
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
        full_address: `${province}${city}${county}`
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
      partnerUnit: '',
      reporterName: '',
      reporterPhone: ''
    });
  };

  // 提交数据
  const submitData = async () => {
    setSubmitting(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const recordData = {
        project_date: formatDateISO(new Date()),
        project_location: {
          province: formData.projectLocation.province,
          city: formData.projectLocation.city,
          county: formData.projectLocation.county,
          full_address: formData.projectLocation.full_address
        },
        project_department: currentUser?.department || '',
        project_type: formData.projectType,
        partner_unit: formData.partnerUnit || '',
        reporter_name: formData.reporterName,
        reporter_phone: formData.reporterPhone,
        _openid: $w?.auth?.currentUser?.openid || 'anonymous',
        status: 'submitted',
        remark: ''
      };
      const createResult = await $w.cloud.callDataSource({
        dataSourceName: 'project_report',
        methodName: 'wedaCreateV2',
        params: {
          data: recordData
        }
      });
      if (!isMountedRef.current) return;
      if (createResult.id) {
        toast({
          title: "提交成功",
          description: "项目信息已保存"
        });
        resetForm();
      } else {
        throw new Error('创建失败：未返回记录ID');
      }
    } catch (error) {
      console.error('提交失败:', error);
      if (!isMountedRef.current) return;
      toast({
        title: "提交失败",
        description: error.message || "请稍后重试",
        variant: "destructive"
      });
    } finally {
      if (isMountedRef.current) {
        setSubmitting(false);
      }
    }
  };
  const handleSubmit = async () => {
    // 表单验证
    if (!formData.projectType || !formData.reporterName || !formData.reporterPhone) {
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

    // 检查重复数据
    const duplicates = await checkDuplicateRecords(formData);
    if (!isMountedRef.current) return;
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
  return <AuthGuard $w={$w}>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50">
        {/* 顶部导航栏 */}
        <TopNavBar />

        <div className="max-w-lg mx-auto px-4 py-8">
          {/* 页面头部 */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-2xl shadow-lg flex items-center justify-center">
              <div className="text-2xl">🏗️</div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">新能源项目管理</h1>
            <p className="text-gray-600">项目信息填报与管理系统</p>
          </div>

          {/* 填报表单 */}
          <ProjectForm formData={formData} onInputChange={handleInputChange} onLocationSelect={handleLocationSelect} onSubmit={handleSubmit} onReset={resetForm} submitting={submitting} showLocationPicker={showLocationPicker} setShowLocationPicker={setShowLocationPicker} />

          {/* 地址选择器 */}
          {showLocationPicker && <ChinaLocationPicker open={showLocationPicker} onOpenChange={setShowLocationPicker} onSelect={handleLocationSelect} />}

          {/* 重复数据确认弹框 */}
          <DuplicateConfirmDialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog} onConfirm={handleConfirmDuplicate} onCancel={handleCancelDuplicate} duplicateRecords={duplicateRecords} />
        </div>
      </div>
    </AuthGuard>;
}