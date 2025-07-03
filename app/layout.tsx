import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '老婆宝 API Key 测试工具',
  description: '测试 Gemini API Key 和自定义 API 的有效性',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              老婆宝 API Key 测试工具
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              测试 Gemini API Key 和自定义 API 的有效性
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              测试也消耗额度，所以建议先试用Flash系列模型测试。
            </p>
          </header>
          {children}
        </div>
      </body>
    </html>
  )
}