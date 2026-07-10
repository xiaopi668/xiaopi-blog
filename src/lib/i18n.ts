import type { CollectionEntry } from 'astro:content';

export type Lang = 'zh' | 'en';

const translations = {
  zh: () => import('../i18n/zh.json').then((m) => m.default),
  en: () => import('../i18n/en.json').then((m) => m.default),
};

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (lang === 'en') return 'en';
  return 'zh';
}

export function useTranslations(lang: Lang) {
  return function t(key: string): string {
    const translationsMap: Record<string, Record<string, string>> = {
      zh: __zhTranslations,
      en: __enTranslations,
    };
    return translationsMap[lang]?.[key] ?? key;
  };
}

const __zhTranslations: Record<string, string> = {
  'site.title': '小皮博客',
  'site.description': '分享技术、生活与思考',
  'nav.home': '首页',
  'nav.posts': '文章',
  'nav.search': '搜索',
  'nav.tags': '标签',
  'home.recent': '最新文章',
  'home.readMore': '阅读更多',
  'post.publishedOn': '发布于',
  'post.updatedOn': '更新于',
  'post.minRead': '分钟阅读',
  'post.tags': '标签',
  'post.prev': '上一篇',
  'post.next': '下一篇',
  'post.backToPosts': '返回文章列表',
  'search.title': '搜索文章',
  'search.placeholder': '输入关键词搜索...',
  'search.noResults': '未找到相关文章',
  'search.results': '搜索结果',
  'tags.title': '标签',
  'tags.postCount': '篇文章',
  'footer.copyright': '© 2026 小皮博客. All rights reserved.',
  'theme.light': '浅色',
  'theme.dark': '深色',
  'lang.zh': '中文',
  'lang.en': 'English',
  'notFound.title': '页面未找到',
  'notFound.description': '你访问的页面不存在。',
  'notFound.backHome': '返回首页',
};

const __enTranslations: Record<string, string> = {
  'site.title': "Xiaopi's Blog",
  'site.description': 'Sharing tech, life & thoughts',
  'nav.home': 'Home',
  'nav.posts': 'Posts',
  'nav.search': 'Search',
  'nav.tags': 'Tags',
  'home.recent': 'Recent Posts',
  'home.readMore': 'Read More',
  'post.publishedOn': 'Published on',
  'post.updatedOn': 'Updated on',
  'post.minRead': 'min read',
  'post.tags': 'Tags',
  'post.prev': 'Previous',
  'post.next': 'Next',
  'post.backToPosts': 'Back to Posts',
  'search.title': 'Search Posts',
  'search.placeholder': 'Type keywords to search...',
  'search.noResults': 'No posts found',
  'search.results': 'Search Results',
  'tags.title': 'Tags',
  'tags.postCount': 'posts',
  'footer.copyright': "© 2026 Xiaopi's Blog. All rights reserved.",
  'theme.light': 'Light',
  'theme.dark': 'Dark',
  'lang.zh': '中文',
  'lang.en': 'English',
  'notFound.title': 'Page Not Found',
  'notFound.description': "The page you're looking for doesn't exist.",
  'notFound.backHome': 'Back to Home',
};

export function getPostLang(post: CollectionEntry<'posts'>): Lang {
  return post.data.lang as Lang;
}

export function filterPostsByLang(
  posts: CollectionEntry<'posts'>[],
  lang: Lang
): CollectionEntry<'posts'>[] {
  return posts
    .filter((p) => p.data.lang === lang && !p.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function getAllTags(
  posts: CollectionEntry<'posts'>[]
): string[] {
  const tags = new Set<string>();
  posts.forEach((p) => p.data.tags?.forEach((t) => tags.add(t)));
  return [...tags].sort();
}
