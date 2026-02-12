import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 清空现有产品数据
  await prisma.product.deleteMany({});

  // 创建示例产品数据
  const products = [
    {
      title: 'Apple iPhone 15 Pro Max 256GB',
      currentPrice: 5980,
      targetPrice: 6999,
      publishPrice: 7999,
      progress: 180,
    },
    {
      title: 'iPad Pro 11英寸 M2芯片 256GB',
      currentPrice: 4200,
      targetPrice: 5499,
      publishPrice: 6199,
      progress: 150,
    },
    {
      title: 'AirPods Pro 2代 主动降噪',
      currentPrice: 1500,
      targetPrice: 1799,
      publishPrice: 1899,
      progress: 200,
    },
    {
      title: 'Nintendo Switch OLED 版主机',
      currentPrice: 1800,
      targetPrice: 2299,
      publishPrice: 2599,
      progress: 120,
    },
    {
      title: 'Dyson 戴森吹风机 HD08',
      currentPrice: 2100,
      targetPrice: 2690,
      publishPrice: 2990,
      progress: 220,
    },
    {
      title: '小米手环8 Pro NFC版',
      currentPrice: 320,
      targetPrice: 399,
      publishPrice: 499,
      progress: 240,
    },
    {
      title: 'Sony WH-1000XM5 无线降噪耳机',
      currentPrice: 1850,
      targetPrice: 2299,
      publishPrice: 2499,
      progress: 190,
    },
    {
      title: 'Keychron K2 Pro 机械键盘 RGB',
      currentPrice: 420,
      targetPrice: 528,
      publishPrice: 598,
      progress: 160,
    },
    {
      title: 'Samsung Galaxy S24 Ultra',
      currentPrice: 7500,
      targetPrice: 7999,
      publishPrice: 8999,
      progress: 100,
    },
    {
      title: 'MacBook Air M3 13英寸',
      currentPrice: 8200,
      targetPrice: 8499,
      publishPrice: 9499,
      progress: 80,
    },
    {
      title: 'Apple Watch Series 9',
      currentPrice: 2800,
      targetPrice: 3199,
      publishPrice: 3499,
      progress: 140,
    },
    {
      title: 'Sony PS5 游戏主机',
      currentPrice: 3200,
      targetPrice: 3599,
      publishPrice: 3899,
      progress: 110,
    },
  ];

  // 添加更多产品
  const additionalProducts = [
    { title: 'Dell XPS 13 笔记本', currentPrice: 6800, targetPrice: 7999, publishPrice: 8999, progress: 90 },
    { title: 'Logitech MX Master 3S 鼠标', currentPrice: 550, targetPrice: 699, publishPrice: 799, progress: 130 },
    { title: 'Kindle Paperwhite 电子书', currentPrice: 850, targetPrice: 998, publishPrice: 1099, progress: 115 },
    { title: 'Bose QC45 降噪耳机', currentPrice: 1700, targetPrice: 1999, publishPrice: 2299, progress: 170 },
    { title: 'GoPro Hero 12 运动相机', currentPrice: 2900, targetPrice: 3498, publishPrice: 3998, progress: 95 },
    { title: 'Fujifilm X100V 相机', currentPrice: 9200, targetPrice: 9799, publishPrice: 10999, progress: 70 },
    { title: 'DJI Mini 4 Pro 无人机', currentPrice: 4200, targetPrice: 4788, publishPrice: 5288, progress: 125 },
    { title: 'Microsoft Surface Pro 9', currentPrice: 6800, targetPrice: 7888, publishPrice: 8888, progress: 105 },
    { title: 'Herman Miller Aeron 座椅', currentPrice: 7800, targetPrice: 8999, publishPrice: 9999, progress: 85 },
    { title: 'Tesla 无线充电器', currentPrice: 380, targetPrice: 499, publishPrice: 599, progress: 155 },
    { title: 'Apple TV 4K', currentPrice: 1200, targetPrice: 1499, publishPrice: 1699, progress: 180 },
    { title: 'Sony A7 IV 相机', currentPrice: 14500, targetPrice: 15999, publishPrice: 16999, progress: 60 },
  ];

  const allProducts = [...products, ...additionalProducts];

  for (const product of allProducts) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log(`已创建 ${allProducts.length} 个产品`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
