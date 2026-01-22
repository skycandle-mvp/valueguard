import {
  Leaf,
  Users,
  Landmark,
  AlertTriangle,
  type LucideIcon,
  Shield,
  Scale,
  HardHat,
  Megaphone,
} from 'lucide-react';

export const CategoryIcons: Record<string, LucideIcon> = {
  Environmental: Leaf,
  Social: Users,
  Governance: Landmark,
  'Data Privacy': Shield,
  'Consumer Rights': Scale,
  'Labor Practices': HardHat,
  'Misleading Advertising': Megaphone,
  Other: AlertTriangle,
};

export const CategoryLabels: Record<string, string> = {
  Environmental: '环境',
  Social: '社会',
  Governance: '治理',
  'Data Privacy': '数据隐私',
  'Consumer Rights': '消费者权益',
  'Labor Practices': '劳动权益',
  'Misleading Advertising': '虚假宣传',
  Other: '其他',
};
