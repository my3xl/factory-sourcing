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
    // Matching results
    internalSuppliers: 'Our Suppliers',
    internalWithCapacity: 'Available Capacity',
    internalNoCapacity: 'No Available Capacity',
    internalNoCapacityHint: 'Matched but capacity full before ExFactory date',
    externalSuppliers: 'External Sourcing',
    externalBadge: 'External',
    externalPendingNote: 'Capacity & cooperation willingness pending confirmation',
    rating: 'Rating',
    location: 'Location',
    categories: 'Categories',
    capacityAvailable: 'Available',
    capacityTight: 'Tight',
    capacityFull: 'Full',
    servedBrands: 'Served Brands',
    orderVolume: 'Order Volume',
    matchScore: 'Match',
    matchReasons: 'Match Reasons',
    buSelect: 'BU Selection',
    noCapacityCount: '{count} supplier(s) with no capacity',
    lastActivity: 'Last Activity',
    hscodes: 'HS Codes',
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
    // 匹配结果
    internalSuppliers: '自有供应商',
    internalWithCapacity: '有可用产能',
    internalNoCapacity: '无可用产能',
    internalNoCapacityHint: '已匹配但预计离厂日前产能已满',
    externalSuppliers: '外部寻源',
    externalBadge: '外部',
    externalPendingNote: '产能及合作意愿待确认',
    rating: '评级',
    location: '所在地',
    categories: '品类',
    capacityAvailable: '充足',
    capacityTight: '紧张',
    capacityFull: '满产',
    servedBrands: '服务品牌',
    orderVolume: '订单量',
    matchScore: '匹配度',
    matchReasons: '匹配原因',
    buSelect: 'BU选择',
    noCapacityCount: '{count} 家供应商无可用产能',
    lastActivity: '最近活动',
    hscodes: 'HS编码',
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
