<template>
  <span :class="getStatusClass(status, type)">
    {{ status }}
  </span>
</template>

<script setup lang="ts">
interface Props {
  status: string;
  type: 'clearing' | 'application' | 'reminder' | 'progress' | 'instruction' | 'valid' | 'settlement';
}

const props = defineProps<Props>();

const getStatusClass = (status: string, type: string) => {
  const baseClass = 'status-badge';
  
  switch (type) {
    case 'clearing':
      return `${baseClass} ${status === '已开启' ? 'status-success' :
             status === '已生成' ? 'status-info' :
             'status-default'}`;
    
    case 'application':
      return `${baseClass} ${status === '已生成' ? 'status-success' :
             status === '未生成' ? 'status-warning' :
             'status-default'}`;
    
    case 'reminder':
      return `${baseClass} ${status === '未办' ? 'status-error' :
             status === '已办' ? 'status-success' :
             'status-default'}`;
    
    case 'progress':
      return `${baseClass} ${status === '进行中' ? 'status-info' :
             status === '已完成' ? 'status-success' :
             status === '超时' ? 'status-error' :
             'status-default'}`;
    
    case 'instruction':
      return `${baseClass} ${status === '已生成' ? 'status-success' :
             status === '未生成' ? 'status-warning' :
             'status-default'}`;
    
    case 'valid':
      return `${baseClass} ${status === '正常' ? 'status-success' :
             status === '异常' ? 'status-error' :
             'status-default'}`;
    
    case 'settlement':
      return `${baseClass} ${status === '成功' ? 'status-success' :
             status === '失败' ? 'status-error' :
             status === '处理中' ? 'status-info' :
             'status-default'}`;
    
    default:
      return `${baseClass} status-default`;
  }
};
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
}

.status-success {
  background-color: #f0f9ff;
  color: #166534;
}

.status-info {
  background-color: #eff6ff;
  color: #1e40af;
}

.status-warning {
  background-color: #fefce8;
  color: #a16207;
}

.status-error {
  background-color: #fef2f2;
  color: #dc2626;
}

.status-default {
  background-color: #f9fafb;
  color: #374151;
}
</style>