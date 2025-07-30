'use client'

import { useState } from 'react'
import CustomApiTester from './components/CustomApiTester'
import GeminiTester from './components/GeminiTester'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'gemini' | 'custom'>('gemini')

  return (
    <main className="max-w-4xl mx-auto">
      {/* 主标签页切换 */}
      <div className="flex mb-6 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
        <button
          onClick={() => setActiveTab('gemini')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors duration-200 ${
            activeTab === 'gemini' ? 'tab-active' : 'tab-inactive'
          }`}
        >
          Gemini API 测试
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors duration-200 ${
            activeTab === 'custom' ? 'tab-active' : 'tab-inactive'
          }`}
        >
          自定义 API 测试
        </button>
      </div>

      {/* 标签页内容 */}
      <div className="min-h-[600px]">
        {activeTab === 'gemini' && <GeminiTester />}
        {activeTab === 'custom' && <CustomApiTester />}
      </div>
    </main>
  )
}