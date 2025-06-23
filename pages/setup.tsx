import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Settings, Eye, EyeOff } from 'lucide-react';

interface COSConfig {
  secretId: string;
  secretKey: string;
  bucket: string;
  region: string;
}

export default function Setup() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cosConfig, setCosConfig] = useState<COSConfig>({
    secretId: '',
    secretKey: '',
    bucket: '',
    region: 'ap-guangzhou'
  });
  const [customDomain, setCustomDomain] = useState('');
  const [useCustomDomain, setUseCustomDomain] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSecretKey, setShowSecretKey] = useState(false);
  const router = useRouter();

  // 检查是否已经初始化
  useEffect(() => {
    const checkInitialization = async () => {
      try {
        const response = await fetch('/api/setup/check');
        const data = await response.json();
        
        if (data.isInitialized) {
          router.push('/login');
        }
      } catch (error) {
        console.error('检查初始化状态失败:', error);
      }
    };
    
    checkInitialization();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 验证密码
    if (password.length < 6) {
      setError('密码长度至少需要6位');
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    // 验证COS配置
    if (!cosConfig.secretId || !cosConfig.secretKey || !cosConfig.bucket) {
      setError('请填写完整的COS配置信息');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/setup/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
          cosConfig,
          customDomain: useCustomDomain ? customDomain : '',
          useCustomDomain
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/login?message=初始化完成，请使用设置的密码登录');
      } else {
        setError(data.message || '初始化失败');
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const regions = [
    { value: 'ap-beijing', label: '北京' },
    { value: 'ap-shanghai', label: '上海' },
    { value: 'ap-guangzhou', label: '广州' },
    { value: 'ap-chengdu', label: '成都' },
    { value: 'ap-nanjing', label: '南京' },
    { value: 'ap-hongkong', label: '香港' },
    { value: 'ap-singapore', label: '新加坡' },
    { value: 'ap-tokyo', label: '东京' },
    { value: 'na-siliconvalley', label: '硅谷' },
    { value: 'na-toronto', label: '多伦多' },
    { value: 'eu-frankfurt', label: '法兰克福' }
  ];

  return (
    <>
      <Head>
        <title>COS 图床管理 - 初始化设置</title>
      </Head>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Settings className="mx-auto h-12 w-12 text-blue-600" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              COS 图床管理系统
            </h2>
            <p className="mt-2 text-gray-600">
              首次使用需要进行初始化设置
            </p>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 密码设置 */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">登录密码设置</h3>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      登录密码
                    </label>
                    <input
                      type="password"
                      id="password"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="请设置登录密码（至少6位）"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      确认密码
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="请再次输入密码"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* COS 配置 */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">腾讯云 COS 配置</h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="secretId" className="block text-sm font-medium text-gray-700">
                      Secret ID
                    </label>
                    <input
                      type="text"
                      id="secretId"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="请输入腾讯云 API Secret ID"
                      value={cosConfig.secretId}
                      onChange={(e) => setCosConfig({...cosConfig, secretId: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="secretKey" className="block text-sm font-medium text-gray-700">
                      Secret Key
                    </label>
                    <div className="mt-1 relative">
                      <input
                        type={showSecretKey ? "text" : "password"}
                        id="secretKey"
                        required
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 pr-10 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="请输入腾讯云 API Secret Key"
                        value={cosConfig.secretKey}
                        onChange={(e) => setCosConfig({...cosConfig, secretKey: e.target.value})}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        onClick={() => setShowSecretKey(!showSecretKey)}
                      >
                        {showSecretKey ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="bucket" className="block text-sm font-medium text-gray-700">
                        存储桶名称
                      </label>
                      <input
                        type="text"
                        id="bucket"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="例如：my-bucket-1234567890"
                        value={cosConfig.bucket}
                        onChange={(e) => setCosConfig({...cosConfig, bucket: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="region" className="block text-sm font-medium text-gray-700">
                        地域
                      </label>
                      <select
                        id="region"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={cosConfig.region}
                        onChange={(e) => setCosConfig({...cosConfig, region: e.target.value})}
                      >
                        {regions.map((region) => (
                          <option key={region.value} value={region.value}>
                            {region.label} ({region.value})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* 自定义域名 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">自定义域名（可选）</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="useCustomDomain"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={useCustomDomain}
                      onChange={(e) => setUseCustomDomain(e.target.checked)}
                    />
                    <label htmlFor="useCustomDomain" className="ml-2 block text-sm text-gray-700">
                      使用自定义域名
                    </label>
                  </div>
                  
                  {useCustomDomain && (
                    <div>
                      <label htmlFor="customDomain" className="block text-sm font-medium text-gray-700">
                        自定义域名
                      </label>
                      <input
                        type="text"
                        id="customDomain"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="例如：cos.example.com"
                        value={customDomain}
                        onChange={(e) => setCustomDomain(e.target.value)}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        请确保域名已经正确配置了 CNAME 到 COS 存储桶域名
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
                  {error}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '初始化中...' : '完成初始化'}
                </button>
              </div>
            </form>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              初始化完成后，您可以在系统设置中修改这些配置
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 