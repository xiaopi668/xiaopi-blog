import { useEffect, useRef } from 'react';

interface GiscusProps {
  lang: 'zh' | 'en';
}

const GISCUS_CONFIG = {
  src: 'https://giscus.app/client.js',
  repo: 'your-username/your-repo',
  repoId: 'your-repo-id',
  category: 'Announcements',
  categoryId: 'your-category-id',
  mapping: 'pathname',
  strict: '0',
  reactionsEnabled: '1',
  emitMetadata: '0',
  inputPosition: 'top',
  theme: 'preferred_color_scheme',
  loading: 'lazy',
};

export default function Giscus({ lang }: GiscusProps) {
  const ref = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const script = document.createElement('script');
    script.src = GISCUS_CONFIG.src;
    script.setAttribute('data-repo', GISCUS_CONFIG.repo);
    script.setAttribute('data-repo-id', GISCUS_CONFIG.repoId);
    script.setAttribute('data-category', GISCUS_CONFIG.category);
    script.setAttribute('data-category-id', GISCUS_CONFIG.categoryId);
    script.setAttribute('data-mapping', GISCUS_CONFIG.mapping);
    script.setAttribute('data-strict', GISCUS_CONFIG.strict);
    script.setAttribute('data-reactions-enabled', GISCUS_CONFIG.reactionsEnabled);
    script.setAttribute('data-emit-metadata', GISCUS_CONFIG.emitMetadata);
    script.setAttribute('data-input-position', GISCUS_CONFIG.inputPosition);
    script.setAttribute('data-theme', GISCUS_CONFIG.theme);
    script.setAttribute('data-lang', lang === 'zh' ? 'zh-CN' : 'en');
    script.setAttribute('data-loading', GISCUS_CONFIG.loading);
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    ref.current?.appendChild(script);
  }, [lang]);

  return <div ref={ref} />;
}
