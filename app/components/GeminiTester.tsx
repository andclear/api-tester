'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react'

interface TestResult {
  success: boolean
  message: string
  errorCode?: string
  errorDescription?: string
}

interface TestResults {
  clientTest?: TestResult
  serverTest?: TestResult
}

export default function GeminiTester() {
  const [apiKey, setApiKey] = useState('')
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash')
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<TestResults>({})
  const [showApiKey, setShowApiKey] = useState(false)

  const availableModels = [
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' }
  ]

  const getErrorDescription = (errorCode: string): string => {
    const errorDescriptions: { [key: string]: string } = {
      '400': 'API Key 格式错误或请求参数无效',
      '401': 'API Key 无效或已过期',
      '403': 'API Key 权限不足或被禁用',
      '429': 'API 调用频率超限或配额用尽',
      '500': 'Gemini 服务器内部错误',
      '503': 'Gemini 服务暂时不可用',
      'NETWORK_ERROR': '网络连接错误，请检查网络设置',
      'TIMEOUT': '请求超时，请稍后重试',
      'CORS_ERROR': '跨域请求被阻止'
    }
    return errorDescriptions[errorCode] || '未知错误'
  }

  const testGeminiApi = async (useServerProxy: boolean = false): Promise<TestResult> => {
    try {
      const endpoint = useServerProxy ? '/api/gemini-test' : `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent`
      
      const requestBody = {
        contents: [{
          parts: [{ text: 'Hello' }]
        }]
      }

      const response = await fetch(
        useServerProxy ? endpoint : `${endpoint}?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(useServerProxy ? { 'X-API-Key': apiKey, 'X-Model': selectedModel } : {})
          },
          body: JSON.stringify(requestBody)
        }
      )

      if (response.ok) {
        return {
          success: true,
          message: 'API Key 有效，调用成功！'
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          message: `调用失败: ${response.status} ${response.statusText}`,
          errorCode: response.status.toString(),
          errorDescription: getErrorDescription(response.status.toString())
        }
      }
    } catch (error: any) {
      let errorCode = 'NETWORK_ERROR'
      if (error.name === 'TypeError' && error.message.includes('CORS')) {
        errorCode = 'CORS_ERROR'
      } else if (error.name === 'AbortError' || error.message.includes('timeout')) {
        errorCode = 'TIMEOUT'
      }
      
      return {
        success: false,
        message: `网络错误: ${error.message}`,
        errorCode,
        errorDescription: getErrorDescription(errorCode)
      }
    }
  }

  const handleTest = async () => {
    if (!apiKey.trim()) {
      alert('请输入 API Key')
      return
    }

    if (!selectedModel) {
      alert('请选择一个模型')
      return
    }

    setTesting(true)
    setResults({})

    try {
      // 同时进行客户端和服务端测试
      const [clientResult, serverResult] = await Promise.all([
        testGeminiApi(false), // 客户端直接调用
        testGeminiApi(true)   // 通过服务端代理调用
      ])

      setResults({
        clientTest: clientResult,
        serverTest: serverResult
      })
    } catch (error) {
      console.error('测试过程中发生错误:', error)
    } finally {
      setTesting(false)
    }
  }

  const getTestConclusion = () => {
    if (!results.clientTest || !results.serverTest) return null

    const { clientTest, serverTest } = results

    if (clientTest.success && serverTest.success) {
      return {
        type: 'success',
        message: '🎉 恭喜！您的 API Key 在所有环境下都可以正常使用！'
      }
    } else if (!clientTest.success && serverTest.success) {
      return {
        type: 'warning',
        message: '⚠️ 您的网络环境可能受限，建议开启代理并选择美国、香港或新加坡节点后重试。'
      }
    } else if (clientTest.success && !serverTest.success) {
      return {
        type: 'info',
        message: '✅ 您的 API Key 有效，但服务器环境测试失败，这通常是正常的。'
      }
    } else {
      return {
        type: 'error',
        message: '❌ API Key 可能无效、已过期或今日配额已用完，请检查您的 API Key 状态。'
      }
    }
  }

  const conclusion = getTestConclusion()

  return (
    <div className="card p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Gemini API 测试
      </h2>
      
      {/* API Key 输入 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Gemini API Key
        </label>
        <div className="relative">
          <input
            type={showApiKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="请输入您的 Gemini API Key (AIza开头...)"
            className="input-field pr-10"
            disabled={testing}
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200"
            disabled={testing}
          >
            {showApiKey ? (
               <Eye className="w-4 h-4" />
             ) : (
               <EyeOff className="w-4 h-4" />
             )}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          您的 API Key 不会被存储在服务器上
        </p>
      </div>

      {/* 模型选择 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          选择模型
        </label>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="input-field"
          disabled={testing}
        >
          {availableModels.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
      </div>

      {/* 测试按钮 */}
      <button
        onClick={handleTest}
        disabled={testing || !apiKey.trim() || !selectedModel}
        className="btn-primary w-full mb-6 flex items-center justify-center gap-2"
      >
        {testing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            测试中...
          </>
        ) : (
          '开始测试'
        )}
      </button>

      {/* 测试结果 */}
      {(results.clientTest || results.serverTest) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            测试结果
          </h3>
          
          {/* 客户端测试结果 */}
          {results.clientTest && (
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center gap-2 mb-2">
                {results.clientTest.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <h4 className="font-medium text-gray-900 dark:text-white">
                  客户端测试 (您的网络环境)
                </h4>
              </div>
              <p className={`text-sm ${
                results.clientTest.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {results.clientTest.message}
              </p>
              {results.clientTest.errorCode && (
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  <p><strong>错误码:</strong> {results.clientTest.errorCode}</p>
                  <p><strong>说明:</strong> {results.clientTest.errorDescription}</p>
                </div>
              )}
            </div>
          )}

          {/* 服务端测试结果 */}
          {results.serverTest && (
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center gap-2 mb-2">
                {results.serverTest.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <h4 className="font-medium text-gray-900 dark:text-white">
                  服务端测试 (网站服务器环境)
                </h4>
              </div>
              <p className={`text-sm ${
                results.serverTest.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {results.serverTest.message}
              </p>
              {results.serverTest.errorCode && (
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  <p><strong>错误码:</strong> {results.serverTest.errorCode}</p>
                  <p><strong>说明:</strong> {results.serverTest.errorDescription}</p>
                </div>
              )}
            </div>
          )}

          {/* 测试结论 */}
          {conclusion && (
            <div className={`border rounded-lg p-4 ${
              conclusion.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
              conclusion.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
              conclusion.type === 'info' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
              'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-start gap-2">
                <AlertCircle className={`w-5 h-5 mt-0.5 ${
                  conclusion.type === 'success' ? 'text-green-500' :
                  conclusion.type === 'warning' ? 'text-yellow-500' :
                  conclusion.type === 'info' ? 'text-blue-500' :
                  'text-red-500'
                }`} />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    测试结论
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {conclusion.message}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* 安全提示 */}
      <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <p className="text-green-800 dark:text-green-200 font-medium">
            🔒 请放心使用，任何API key都不会在服务器中保存。
          </p>
        </div>
      </div>
      
      {/* 开发者信息 */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="text-center">
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            该网站由"老婆宝"搭建
          </p>
          <p className="text-blue-600 dark:text-blue-300 text-xs mt-1">
            小红书账号：老婆宝 | 小红书号：laopobao
          </p>
        </div>
      </div>
    </div>
  )
}