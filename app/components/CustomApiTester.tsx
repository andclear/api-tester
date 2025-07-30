'use client'

import { AlertCircle, CheckCircle, ExternalLink, Eye, EyeOff, Loader2, XCircle } from 'lucide-react'
import { useState } from 'react'

interface TestResult {
  success: boolean
  message: string
  rawError?: string
  aiResponse?: string
}

type PollingType = 'hajimi' | 'gemini-balance'

export default function CustomApiTester() {
  const [activeSubTab, setActiveSubTab] = useState<PollingType>('hajimi')
  const [baseUrl, setBaseUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [models, setModels] = useState<string[]>([])
  const [selectedModel, setSelectedModel] = useState('')
  const [customModel, setCustomModel] = useState('')
  const [useCustomModel, setUseCustomModel] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [modelsFetchResult, setModelsFetchResult] = useState<TestResult | null>(null)
  const [showApiKey, setShowApiKey] = useState(false)

  const getPollingPanelUrl = (url: string): string => {
    return url.replace(/\/v1\/?$/, '')
  }

  const getErrorMessage = (pollingType: PollingType, baseUrl: string): JSX.Element => {
    const panelUrl = getPollingPanelUrl(baseUrl)
    
    if (pollingType === 'hajimi') {
      return (
        <div className="space-y-2 text-sm">
          <p>0. 请注意模型名称是否有误，免费key不支持preview系列模型！ </p>
          <p>1. 请检查你的调用地址，请点击链接测试是否能够打开轮询面板：
            <a href={panelUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 ml-1">
              {panelUrl}
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
          <p>2. 如果你的调用地址可以访问，请检查你的密钥是否错误，密钥是你在搭建轮询时设置的PASSWORD参数，或者你可以在轮询面板中点击"检测API密钥"，输入管理密码，如果能够检测，那么这个密码才是你的实际调用密钥；</p>
          <p>3. 如果确认调用地址和密钥都正确的话，请进入轮询面板检测你的key是否有效；</p>
          <p>4. 如果前三步都没有问题的话，请重启你的酒馆，安卓用户需要把Termux挂小窗，然后再次测试；</p>
          <p>5. 对了，在酒馆中的调用地址是必须加/v1的，v必须是小写。</p>
        </div>
      )
    } else {
      return (
        <div className="space-y-2 text-sm">
          <p>0. 请注意模型名称是否有误，免费key不支持preview系列模型！ </p>
          <p>1. 请检查你的调用地址，请点击链接测试是否能够打开轮询面板：
            <a href={panelUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 ml-1">
              {panelUrl}
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
          <p>2. 如果你的调用地址可以访问，请检查你的密钥是否错误，检测方法为登录进轮询面板，查看允许的令牌处的内容，密钥是这里的内容；</p>
          <p>3. 如果确认调用地址和密钥都正确的话，请进入轮询面板查看你的API key是否写错，在API密钥列表中查看，这里只能写官方的gemini key，AIza开头的才是哦；</p>
          <p>4. 如果前三步都没有问题的话，请在轮询面板的监控面板中检测你key的可用性；</p>
          <p>5. 如果key也可用的话，请重启你的酒馆再次测试，安卓用户需要把Termux挂小窗，然后再次测试；</p>
          <p>6. 对了，在酒馆中的调用地址是必须加/v1的，v必须是小写。</p>
        </div>
      )
    }
  }

  const fetchModels = async () => {
    if (!baseUrl.trim()) {
      setModelsFetchResult({
        success: false,
        message: '请先输入调用地址'
      })
      return
    }

    setConnecting(true)
    setModels([])
    setSelectedModel('')
    setModelsLoaded(false)
    setModelsFetchResult(null)

    try {
      console.log('正在通过代理请求模型列表')
      console.log('目标地址:', baseUrl)
      console.log('使用密钥:', apiKey.substring(0, 8) + '...')
      
      const response = await fetch('/api/custom-api-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          baseUrl,
          apiKey,
          endpoint: '/v1/models',
          method: 'GET'
        })
      })

      console.log('代理响应状态:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('代理返回的数据:', data)
        console.log('数据类型:', typeof data)
        console.log('数据键:', Object.keys(data || {}))
        
        // 兼容不同的API响应格式
        let modelList = []
        if (data && data.data && Array.isArray(data.data)) {
          modelList = data.data
          console.log('使用 data.data 格式')
        } else if (Array.isArray(data)) {
          modelList = data
          console.log('使用直接数组格式')
        } else if (data && data.models && Array.isArray(data.models)) {
          modelList = data.models
          console.log('使用 data.models 格式')
        } else if (data && data.object === 'list' && data.data) {
          modelList = data.data
          console.log('使用 OpenAI 标准格式')
        } else {
          console.log('未识别的数据格式，尝试查找所有可能的数组字段')
          // 尝试查找任何包含数组的字段
          for (const key in data) {
            if (Array.isArray(data[key])) {
              console.log(`找到数组字段: ${key}`, data[key])
              modelList = data[key]
              break
            }
          }
        }
        
        console.log('最终解析的模型列表:', modelList)
        console.log('模型列表长度:', modelList.length)
        
        if (modelList.length === 0) {
          setModelsFetchResult({
            success: false,
            message: '未找到可用的模型',
            rawError: `原始响应: ${JSON.stringify(data, null, 2)}`
          })
          return
        }
        
        const processedModels = modelList.map((model: any, index: number) => {
          console.log(`处理模型 ${index}:`, model)
          if (typeof model === 'string') {
            return model
          } else if (model.id) {
            return model.id
          } else if (model.name) {
            return model.name
          } else {
            return `model-${index}`
          }
        })
        
        console.log('处理后的模型:', processedModels)
        setModels(processedModels)
        setModelsLoaded(true)
        setModelsFetchResult({
          success: true,
          message: `成功获取到 ${processedModels.length} 个模型`
        })
      } else {
        const errorData = await response.json()
        console.error('代理API响应错误:', errorData)
        throw new Error(`HTTP ${response.status}: ${errorData.error || errorData.details || '未知错误'}`)
      }
    } catch (error: any) {
      console.error('获取模型列表失败:', error)
      setModelsFetchResult({
             success: false,
             message: '获取模型列表失败',
             rawError: error.message
           })
    } finally {
      setConnecting(false)
    }
  }

  const testApi = async () => {
    const modelToUse = useCustomModel ? customModel : selectedModel
    if (!modelToUse) {
      alert('请先选择或输入一个模型')
      return
    }

    if (!baseUrl.trim()) {
      setTestResult({
        success: false,
        message: '请先输入调用地址',
        rawError: '调用地址不能为空'
      })
      return
    }

    if (!apiKey.trim()) {
      setTestResult({
        success: false,
        message: '请先输入API密钥',
        rawError: 'API密钥不能为空'
      })
      return
    }

    setTesting(true)
    setTestResult(null)

    try {
      console.log('=== 开始API测试 ===')
      console.log('目标地址:', baseUrl)
      console.log('使用模型:', modelToUse)
      console.log('使用密钥:', apiKey.substring(0, 8) + '...')
      console.log('轮询类型:', activeSubTab)
      
      // 检查是否为thinking模型（o1系列）
      const isThinkingModel = modelToUse.toLowerCase().includes('o1') || 
                             modelToUse.toLowerCase().includes('reasoning') ||
                             modelToUse.toLowerCase().includes('thinking')
      
      // 构建请求体，thinking模型不支持max_tokens等参数
      const chatBody: any = {
        model: modelToUse,
        messages: [
          {
            role: 'user',
            content: 'Hello'
          }
        ]
      }
      
      // 移除max_tokens限制，让模型自然完成回复
      // 这样可以获得更准确的测试结果和完整的模型响应
      
      console.log('模型类型检测:')
      console.log('- 模型名称:', modelToUse)
      console.log('- 是否为thinking模型:', isThinkingModel)
      console.log('- 请求体参数:', Object.keys(chatBody))
      
      // 确保baseUrl保持原样，不移除/v1后缀
      const requestBody = {
        baseUrl,
        apiKey,
        endpoint: '/v1/chat/completions',
        method: 'POST',
        body: chatBody
      }
      
      console.log('完整请求体:', JSON.stringify(requestBody, null, 2))
      // 预期的URL构建逻辑（与后端保持一致）
      const cleanBaseUrl = requestBody.baseUrl.endsWith('/v1') ? requestBody.baseUrl.slice(0, -3) : requestBody.baseUrl
      const cleanEndpoint = requestBody.endpoint.startsWith('/v1') ? requestBody.endpoint : `/v1${requestBody.endpoint}`
      const expectedUrl = `${cleanBaseUrl}${cleanEndpoint}`
      console.log('预期请求URL:', expectedUrl)
      
      const response = await fetch('/api/custom-api-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })
      
      console.log('API响应状态:', response.status)
      console.log('API响应头:', Object.fromEntries(response.headers.entries()))

      const responseData = await response.json()
      console.log('=== API响应分析 ===')
      console.log('响应状态:', response.status)
      console.log('响应数据:', JSON.stringify(responseData, null, 2))
      
      // 检查响应是否包含实际的AI回复
      let hasValidResponse = false
      let aiContent = '无'
      
      if (responseData.choices && responseData.choices.length > 0 && responseData.choices[0].message && responseData.choices[0].message.content) {
        // 标准OpenAI格式响应
        hasValidResponse = true
        aiContent = responseData.choices[0].message.content
      } else if (responseData.type === 'stream' && responseData.content) {
        // 流式响应格式
        hasValidResponse = true
        aiContent = '流式响应 (已接收)'
        console.log('检测到流式响应，内容长度:', responseData.content.length)
      } else if (responseData.content && typeof responseData.content === 'string') {
        // 其他文本内容格式
        hasValidResponse = true
        aiContent = responseData.content.substring(0, 100) + (responseData.content.length > 100 ? '...' : '')
      }
      
      console.log('是否包含有效AI回复:', hasValidResponse)
      console.log('AI回复内容:', aiContent)
      
      // 更宽松的成功判断：只要有有效回复内容，就认为成功
      if (hasValidResponse) {
        console.log('模型:', modelToUse, '- 测试成功 (有效回复)')
        const successMessage = responseData.type === 'stream' 
          ? `🎉 API 调用成功！模型 ${modelToUse} 响应正常，已收到流式回复内容。`
          : `🎉 API 调用成功！模型 ${modelToUse} 响应正常，已收到AI回复。`
        
        setTestResult({
          success: true,
          message: successMessage,
          aiResponse: aiContent
        })
      } else if (response.ok) {
        // HTTP状态正常但没有有效回复
        console.log('模型:', modelToUse, '- 可能假成功 (HTTP正常但无有效回复)')
        setTestResult({
          success: true,
          message: `⚠️ API 调用返回成功状态，但模型 ${modelToUse} 未返回有效内容。可能是假成功。`
        })
      } else {
        // HTTP状态异常，检查是否仍有有效内容
        console.log('模型:', modelToUse, '- HTTP状态异常，状态码:', response.status)
        
        // 分析具体的错误类型
        let errorAnalysis = ''
        const isThinkingModel = modelToUse.toLowerCase().includes('o1') || 
                               modelToUse.toLowerCase().includes('reasoning') ||
                               modelToUse.toLowerCase().includes('thinking')
        
        if (responseData.error) {
          if (typeof responseData.error === 'object') {
            if (responseData.error.code === 'model_not_found' || responseData.error.message?.includes('model')) {
              errorAnalysis = ' (可能是模型不支持或模型名称错误)'
            } else if (responseData.error.code === 'invalid_api_key' || responseData.error.message?.includes('key')) {
              errorAnalysis = ' (API密钥无效)'
            } else if (responseData.error.code === 'insufficient_quota' || responseData.error.message?.includes('quota')) {
              errorAnalysis = ' (配额不足)'
            } else if (responseData.error.message?.includes('max_tokens') || responseData.error.message?.includes('parameter')) {
              if (isThinkingModel) {
                errorAnalysis = ' (thinking模型不支持某些参数，如max_tokens)'
              } else {
                errorAnalysis = ' (参数错误)'
              }
            }
          }
        }
        
        // 为thinking模型添加特殊提示
        if (isThinkingModel && !errorAnalysis) {
          errorAnalysis = ' (注意：thinking模型需要特殊的API参数配置)'
        }
        
        setTestResult({
          success: false,
          message: `调用失败: HTTP ${response.status}${errorAnalysis}`,
          rawError: responseData.error || responseData.details || JSON.stringify(responseData)
        })
      }
    } catch (error: any) {
      console.error('API调用异常:', error)
      setTestResult({
        success: false,
        message: `网络错误: ${error.message}`,
        rawError: error.toString()
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="card p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        自定义 API 测试
      </h2>
      <h4>写轮询只是为了方便提示报错内容，实际上兼容所有OpenAI API接口的测试</h4>

      <br />
      
      {/* 子标签页切换 */}
      <div className="flex mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => setActiveSubTab('hajimi')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200 ${
            activeSubTab === 'hajimi' ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Hajimi 轮询
        </button>
        <button
          onClick={() => setActiveSubTab('gemini-balance')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200 ${
            activeSubTab === 'gemini-balance' ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Gemini-Balance 轮询
        </button>
      </div>

      {/* API 配置 */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            调用地址 (BASE URL)
          </label>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => {
              setBaseUrl(e.target.value)
              setModelsLoaded(false)
              setModels([])
              setSelectedModel('')
            }}
            placeholder="这里写不写 /v1 都可以"
            className="input-field"
            disabled={connecting || testing}
          />
          <div className="mt-1 text-xs text-gray-500">
            提示：无论您输入的地址是否包含 /v1 后缀，老婆宝都能给你智能处理，确保正确构建API请求URL
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            密钥
          </label>
          <div className="relative">
            <input
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value)
                setModelsLoaded(false)
                setModels([])
                setSelectedModel('')
              }}
              placeholder="请输入您的 API 密钥"
              className="input-field pr-10"
              disabled={connecting || testing}
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200"
              disabled={connecting || testing}
            >
              {showApiKey ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
            </button>
          </div>
        </div>
      </div>

      {/* 连接按钮 */}
      <button
        onClick={fetchModels}
        disabled={connecting || testing || !baseUrl.trim()}
        className="btn-secondary w-full mb-4 flex items-center justify-center gap-2"
      >
        {connecting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            连接中...
          </>
        ) : (
          '连接并获取模型列表'
        )}
      </button>
      
      {/* 模型获取结果提示 */}
      {modelsFetchResult && (
        <div className={`mt-3 p-3 rounded-md ${modelsFetchResult.success 
          ? 'bg-green-50 border border-green-200 text-green-800' 
          : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="font-medium">
            {modelsFetchResult.success ? '✓ ' : '✗ '}
            {modelsFetchResult.success ? modelsFetchResult.message : (
              <span>
                请检查您的<span className="text-red-600 font-bold">调用地址</span>和<span className="text-red-600 font-bold">密钥</span>是否填写错误，请在地址最后加/v1，v是小写
              </span>
            )}
          </div>
          {modelsFetchResult.rawError && (
            <div className="mt-2 text-sm opacity-75">
              详细信息: {typeof modelsFetchResult.rawError === 'string' ? modelsFetchResult.rawError : JSON.stringify(modelsFetchResult.rawError, null, 2)}
            </div>
          )}
        </div>
      )}

      {/* 模型选择方式切换 */}
      <div className="mb-4">
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="modelSelection"
              checked={!useCustomModel}
              onChange={() => setUseCustomModel(false)}
              className="mr-2"
              disabled={testing}
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              从列表选择模型
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="modelSelection"
              checked={useCustomModel}
              onChange={() => setUseCustomModel(true)}
              className="mr-2"
              disabled={testing}
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              自定义模型名称
            </span>
          </label>
        </div>
      </div>

      {/* 从列表选择模型 */}
      {!useCustomModel && modelsLoaded && models.length > 0 && (
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
            <option value="">请选择一个模型</option>
            {models.map((model, index) => (
              <option key={index} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 自定义模型名称 */}
      {useCustomModel && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            自定义模型名称
          </label>
          <input
            type="text"
            value={customModel}
            onChange={(e) => setCustomModel(e.target.value)}
            placeholder="请输入模型名称，如：gemini-2.0-flash"
            className="input-field mb-3"
            disabled={testing}
          />
          
          {/* 快捷标签 */}
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                常用Gemini模型：
              </p>
              <div className="flex flex-wrap gap-2">
                {['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.5-pro'].map((model) => (
                  <button
                    key={model}
                    onClick={() => setCustomModel(model)}
                    className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full transition-colors duration-200 border border-blue-200 dark:border-blue-700"
                    disabled={testing}
                  >
                    {model}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Thinking模型（推理模型）：
              </p>
              <div className="flex flex-wrap gap-2">
                {['gemini-2.5-flash-preview-04-17-thinking'].map((model) => (
                  <button
                    key={model}
                    onClick={() => setCustomModel(model)}
                    className="px-3 py-1 text-xs bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:hover:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-full transition-colors duration-200 border border-purple-200 dark:border-purple-700"
                    disabled={testing}
                  >
                    {model}
                  </button>
                ))}
              </div>
              <div className="mt-2 p-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded text-xs">
                <div className="flex items-start gap-1">
                  <span className="text-purple-600 dark:text-purple-400">💡</span>
                  <div className="text-purple-700 dark:text-purple-300">
                    <strong>Thinking模型特殊说明：</strong>
                    <ul className="list-disc list-inside mt-1 space-y-0.5">
                      <li>测试及响应时间可能较长（需要推理过程）</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 测试按钮 */}
      {(modelsLoaded || useCustomModel) && (
        <button
          onClick={testApi}
          disabled={testing || (!useCustomModel && !selectedModel) || (useCustomModel && !customModel)}
          className="btn-primary w-full mb-6 flex items-center justify-center gap-2"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              测试中...
            </>
          ) : (
            '测试 API'
          )}
        </button>
      )}

      {/* 测试结果 */}
      {testResult && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 p-3 rounded-lg border-l-4 border-blue-500">
            🔍 测试结果
          </h3>
          
          <div className={`border rounded-lg p-4 ${
            testResult.success 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-start gap-2">
              {testResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${
                  testResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                }`}>
                  {testResult.message}
                </p>
                
                {/* 显示AI回复内容 */}
                {testResult.success && testResult.aiResponse && testResult.aiResponse !== '无' && (
                  <div className="mt-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      📝 AI回复内容预览：
                    </h5>
                    <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-2 rounded border max-h-32 overflow-y-auto">
                      {testResult.aiResponse}
                    </div>
                    
                    {/* 测试成功后的提示信息 */}
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                      <div className="flex items-start gap-2">
                        <div className="text-blue-600 dark:text-blue-400 text-sm">💡</div>
                        <div className="text-blue-700 dark:text-blue-300 text-sm">
                          如果这里测试成功，但是酒馆中无法获取模型列表的话，可能是你的api信息没有保存在酒馆中。请重启你的酒馆，安卓用户需要把Termux挂小窗，然后再次测试。
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {testResult.rawError && (
                  <div className="mt-3">
                    <details className="cursor-pointer">
                      <summary className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        查看原始错误信息
                      </summary>
                      <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded border overflow-x-auto text-gray-800 dark:text-gray-200">
                        {typeof testResult.rawError === 'string' ? testResult.rawError : JSON.stringify(testResult.rawError, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
                
                {/* 成功但可能有问题的警告 */}
                {testResult.success && testResult.message.includes('未收到AI回复内容') && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                          ⚠️ 可能的假成功
                        </h4>
                        <div className="text-gray-700 dark:text-gray-300 text-sm space-y-1">
                          <p>API返回了成功状态，但没有实际的AI回复内容。这可能表明：</p>
                          <ul className="list-disc list-inside ml-2 space-y-1">
                            <li>该模型在此API服务中不可用或配置错误</li>
                            <li>API密钥权限不足，无法访问该模型</li>
                            <li>服务器配置问题，模型请求被静默忽略</li>
                          </ul>
                          <p className="font-medium text-yellow-700 dark:text-yellow-300 mt-2">
                            建议：尝试其他模型进行对比测试，或检查API服务商的模型支持列表。
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {!testResult.success && (
                  <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded border">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                          故障排除建议
                        </h4>
                        <div className="text-gray-700 dark:text-gray-300">
                          {getErrorMessage(activeSubTab, baseUrl)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
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
      
      {/* 版权信息 */}
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