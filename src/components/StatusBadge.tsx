import React from 'react';

interface StatusBadgeProps {
  status: string;
  type: 'clearing' | 'application' | 'reminder' | 'progress' | 'instruction' | 'valid' | 'settlement';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type }) => {
  const getStatusColor = (status: string, type: string) => {
    switch (type) {
      case 'clearing':
        return status === '已开启' ? 'bg-green-100 text-green-800' :
               status === '已生成' ? 'bg-blue-100 text-blue-800' :
               'bg-gray-100 text-gray-800';
      
      case 'application':
        return status === '已生成' ? 'bg-green-100 text-green-800' :
               status === '未生成' ? 'bg-yellow-100 text-yellow-800' :
               'bg-gray-100 text-gray-800';
      
      case 'reminder':
        return status === '未办' ? 'bg-red-100 text-red-800' :
               status === '已办' ? 'bg-green-100 text-green-800' :
               'bg-gray-100 text-gray-800';
      
      case 'progress':
        return status === '进行中' ? 'bg-blue-100 text-blue-800' :
               status === '已完成' ? 'bg-green-100 text-green-800' :
               status === '超时' ? 'bg-red-100 text-red-800' :
               'bg-gray-100 text-gray-800';
      
      case 'instruction':
        return status === '已生成' ? 'bg-green-100 text-green-800' :
               status === '未生成' ? 'bg-yellow-100 text-yellow-800' :
               'bg-gray-100 text-gray-800';
      
      case 'valid':
        return status === '正常' ? 'bg-green-100 text-green-800' :
               status === '异常' ? 'bg-red-100 text-red-800' :
               'bg-gray-100 text-gray-800';
      
      case 'settlement':
        return status === '成功' ? 'bg-green-100 text-green-800' :
               status === '失败' ? 'bg-red-100 text-red-800' :
               status === '处理中' ? 'bg-blue-100 text-blue-800' :
               'bg-gray-100 text-gray-800';
      
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status, type)}`}>
      {status}
    </span>
  );
};

export default StatusBadge;