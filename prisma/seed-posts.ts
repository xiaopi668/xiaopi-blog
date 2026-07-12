import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

const tag1 = { name: "技术", slug: "tech" };
const tag2 = { name: "生活", slug: "life" };

const techPosts = [
  { title: "理解 JavaScript 闭包", slug: "js-closure", content: "闭包是 JavaScript 中的一个核心概念。简单来说，闭包就是一个函数可以访问其外部作用域中的变量，即使外部函数已经返回。\n\n## 什么是闭包？\n\n```javascript\nfunction createCounter() {\n  let count = 0;\n  return function() {\n    count++;\n    return count;\n  };\n}\n\nconst counter = createCounter();\nconsole.log(counter()); // 1\nconsole.log(counter()); // 2\n```\n\n闭包在许多场景中都非常有用，比如数据私有化、函数工厂、事件处理等。" },
  { title: "React 19 新特性一览", slug: "react-19-features", content: "React 19 带来了许多令人兴奋的新特性。\n\n## 并发渲染\n\n并发渲染允许 React 中断和恢复渲染工作，使得应用在复杂更新时保持响应。\n\n## Actions\n\n新的 Actions API 简化了数据提交和表单处理：\n\n```tsx\nfunction MyForm() {\n  const [state, formAction] = useActionState(updateName);\n  return <form action={formAction}>...</form>;\n}\n```\n\n## 服务器组件\n\n服务器组件在服务端渲染，减少客户端 JavaScript 体积。" },
  { title: "Tailwind CSS v4 实战技巧", slug: "tailwind-v4-tips", content: "Tailwind CSS v4 采用了全新的引擎，带来了更好的性能和更灵活的配置。\n\n## 新特性\n\n- 使用 CSS 原生变量而非配置对象\n- 更智能的 JIT 编译\n- 更小的打包体积\n\n## 示例\n\n```html\n<div class=\"flex gap-4 p-6 rounded-2xl shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600\">\n  <h2 class=\"text-white text-lg font-bold\">Hello World</h2>\n</div>\n```\n\n通过 @theme 指令可以轻松扩展设计系统。" },
  { title: "TypeScript 高级类型体操", slug: "ts-type-challenges", content: "TypeScript 的类型系统非常强大，可以表达复杂的类型约束。\n\n## 条件类型\n\n```typescript\ntype IsString<T> = T extends string ? true : false;\ntype A = IsString<'hello'>; // true\ntype B = IsString<42>; // false\n```\n\n## 模板字面量类型\n\n```typescript\ntype EventName<T extends string> = `on${Capitalize<T>}`;\ntype ClickEvent = EventName<'click'>; // 'onClick'\n```\n\n掌握这些技巧可以写出更安全、更优雅的代码。" },
];

const lifePosts = [
  { title: "周末徒步登山记", slug: "weekend-hiking", content: "上个周末和朋友一起去爬了城郊的青山，记录一下这次愉快的经历。\n\n## 出发\n\n早上六点起床，带上背包、水和干粮就出发了。天气很好，阳光透过树叶洒在山路上。\n\n## 途中\n\n山路大约 8 公里，爬升高度 600 米。沿途风景很美，能看到整个城市的全景。\n\n## 山顶\n\n站在山顶上，呼吸着新鲜的空气，所有的烦恼都烟消云散了。\n\n下山后去了一家小馆子吃了碗面，满足。" },
  { title: "读书笔记：《深度工作》", slug: "deep-work-notes", content: "最近读了 Cal Newport 的《深度工作》，分享一些感悟。\n\n## 什么是深度工作\n\n深度工作是指在没有干扰的状态下进行的专业活动，能将认知能力推向极限。\n\n## 为什么重要\n\n在这个碎片化的时代，能够长时间专注于一件事情变得越来越稀缺。深度工作能产生高质量的输出。\n\n## 实践方法\n\n1. 每天固定 2-3 小时无干扰工作时间\n2. 关闭手机通知\n3. 使用番茄工作法\n4. 定期进行数字 detox" },
  { title: "自制抹茶拿铁配方", slug: "matcha-latte-recipe", content: "在家也能做出咖啡馆级别的抹茶拿铁，分享我的配方。\n\n## 材料\n\n- 抹茶粉 2g（约 1 茶匙）\n- 热水 30ml（80°C）\n- 牛奶 200ml\n- 蜂蜜或糖浆 适量\n\n## 步骤\n\n1. 将抹茶粉过筛到碗中\n2. 加入热水，用茶筅搅拌均匀至无颗粒\n3. 牛奶加热到 60°C 左右，打发出奶泡\n4. 将抹茶液倒入杯中，再倒入牛奶\n5. 根据喜好加入甜味剂\n\n简单又好喝，推荐试试！" },
  { title: "我的桌面布置分享", slug: "desk-setup", content: "分享一下我的工作桌面布置，一个整洁舒适的环境能提高工作效率。\n\n## 设备清单\n\n- 显示器：27 寸 4K\n- 键盘：机械键盘（茶轴）\n- 鼠标：静音无线鼠标\n- 台灯：色温可调 LED 台灯\n- 桌面增高架\n\n## 收纳原则\n\n桌面只放日常必需的物品，其他都收纳到抽屉或架子上。保持整洁的关键是定期整理。" },
];

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "admin" } });
  if (!admin) { console.log("请先运行种子脚本创建管理员"); return; }

  const t1 = await prisma.tag.upsert({ where: { slug: tag1.slug }, update: {}, create: tag1 });
  const t2 = await prisma.tag.upsert({ where: { slug: tag2.slug }, update: {}, create: tag2 });

  for (const p of techPosts) {
    const slug = p.slug;
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (!existing) {
      await prisma.post.create({
        data: {
          title: p.title,
          slug,
          content: p.content,
          excerpt: p.content.slice(0, 100) + "...",
          published: true,
          authorId: admin.id,
          tags: { create: [{ tagId: t1.id }] },
          viewCount: Math.floor(Math.random() * 500),
        },
      });
      console.log(`创建文章: ${p.title}`);
    }
  }

  for (const p of lifePosts) {
    const slug = p.slug;
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (!existing) {
      await prisma.post.create({
        data: {
          title: p.title,
          slug,
          content: p.content,
          excerpt: p.content.slice(0, 100) + "...",
          published: true,
          authorId: admin.id,
          tags: { create: [{ tagId: t2.id }] },
          viewCount: Math.floor(Math.random() * 300),
        },
      });
      console.log(`创建文章: ${p.title}`);
    }
  }

  console.log("示例文章创建完成");
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
