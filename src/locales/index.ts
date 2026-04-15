export type Lang = 'en' | 'zh';

const translations = {
  en: {
    appTitle: 'Factory Sourcing',
    pageTitle: 'Opportunity Pipeline',
    tableBrand: 'Brand',
    tableCategory: 'Product Category',
    tableCOO: 'COO',
    tableUnitPrice: 'Unit Price',
    tableQty: 'Qty',
    tableExFactory: 'ExFactory Date',
    tableAM: 'Account Manager',
    matchedAgo: 'Matched {time} ago',
    matchedJustNow: 'Matched just now',
    refreshMatch: 'Refresh',
    refreshing: 'Matching...',
    matchingCount: '{count} factories matched',
    expandDetails: 'View Details',
    collapseDetails: 'Collapse',
    unitPriceDisplay: '${price}',
    qtyDisplay: '{qty} pcs',
  },
  zh: {
    appTitle: '工厂寻源',
    pageTitle: '商机管线',
    tableBrand: '品牌',
    tableCategory: '品类',
    tableCOO: '产地要求',
    tableUnitPrice: '预计单价',
    tableQty: '预计数量',
    tableExFactory: '预计离厂日',
    tableAM: '负责人',
    matchedAgo: '{time}前完成匹配',
    matchedJustNow: '刚刚完成匹配',
    refreshMatch: '刷新匹配',
    refreshing: '匹配中...',
    matchingCount: '已匹配 {count} 家工厂',
    expandDetails: '查看详情',
    collapseDetails: '收起',
    unitPriceDisplay: '${price}',
    qtyDisplay: '{qty} 件',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function t(lang: Lang, key: TranslationKey, params?: Record<string, string | number>): string {
  let text = translations[lang][key] as string;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v));
    });
  }
  return text;
}
