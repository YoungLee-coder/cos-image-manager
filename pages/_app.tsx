import { useEffect } from 'react';
import { useRouter } from 'next/router';
import type { AppProps } from 'next/app';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // 检查是否需要初始化（排除setup页面本身）
    if (router.pathname !== '/setup' && router.pathname !== '/login') {
      const checkInitialization = async () => {
        try {
          const response = await fetch('/api/setup/check');
          const data = await response.json();
          
          if (!data.isInitialized) {
            router.push('/setup');
          }
        } catch (error) {
          console.error('检查初始化状态失败:', error);
        }
      };
      
      checkInitialization();
    }
  }, [router.pathname, router]);

  return <Component {...pageProps} />;
}
