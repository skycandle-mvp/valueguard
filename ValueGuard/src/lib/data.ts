import type { Incident, Company } from './types';

export const companies: Company[] = [
  {
    id: '1',
    name: '创新科技',
    logoUrl: 'https://picsum.photos/seed/10/200/200',
    incidentCount: 2,
  },
  {
    id: '2',
    name: '环球集团',
    logoUrl: 'https://picsum.photos/seed/11/200/200',
    incidentCount: 1,
  },
  {
    id: '3',
    name: '未来系统',
    logoUrl: 'https://picsum.photos/seed/12/200/200',
    incidentCount: 1,
  },
];

export const incidents: Incident[] = [
  {
    id: '1',
    companyId: '1',
    companyName: '创新科技',
    title: '误导性的环境影响报告',
    description:
      '创新科技发布的年度环境报告大幅低报了碳排放。内部文件显示实际排放量几乎是报告值的两倍，明显试图误导公众和投资者。',
    date: '2023-10-15',
    categories: ['Environmental', 'Governance'],
    user: {
      uid: 'static-user-1',
      displayName: '关心此事的公民',
      photoURL: `https://i.pravatar.cc/150?u=static-user-1`,
    }
  },
  {
    id: '2',
    companyId: '2',
    companyName: '环球集团',
    title: '海外工厂的不公平劳动实践',
    description:
      '调查发现，环球集团多家海外供应商让工人在不安全的环境中以极低工资工作，违反国际劳动标准。公司此前声称所有供应商均符合公平劳动法律。',
    date: '2023-09-20',
    categories: ['Social', 'Governance'],
    user: {
      uid: 'static-user-2',
      displayName: '工厂吹哨人',
      photoURL: `https://i.pravatar.cc/150?u=static-user-2`,
    }
  },
  {
    id: '3',
    companyId: '1',
    companyName: '创新科技',
    title: '压制负面用户反馈',
    description:
      '多方消息证实，创新科技一直在其主产品平台删除负面评价和反馈。此类操纵用户舆情的行为误导了产品质量与客户满意度。',
    date: '2023-11-01',
    categories: ['Social', 'Governance'],
    user: {
      uid: 'static-user-3',
      displayName: '失望用户',
      photoURL: `https://i.pravatar.cc/150?u=static-user-3`,
    }
  },
  {
    id: '4',
    companyId: '3',
    companyName: '未来系统',
    title: '数据隐私泄露与不透明披露',
    description:
      '未来系统发生重大数据泄露，影响数百万用户。公司在超过六个月后才披露，并在披露时淡化严重性。这种缺乏透明度使用户个人信息面临更高风险。',
    date: '2023-05-12',
    categories: ['Governance', 'Social'],
    user: {
      uid: 'static-user-4',
      displayName: '安全分析师',
      photoURL: `https://i.pravatar.cc/150?u=static-user-4`,
    }
  },
];
