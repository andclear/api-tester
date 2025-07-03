import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json()
    console.log('API路由接收到的请求体:', JSON.stringify(requestBody, null, 2))
    
    const { baseUrl, apiKey, endpoint, method = 'GET', body } = requestBody
    
    console.log('解析的参数:')
    console.log('- baseUrl:', baseUrl)
    console.log('- apiKey:', apiKey ? apiKey.substring(0, 8) + '...' : 'undefined')
    console.log('- endpoint:', endpoint)
    console.log('- method:', method)
    console.log('- body:', body)
    
    if (!baseUrl || !apiKey) {
      console.error('缺少必需参数:', { baseUrl: !!baseUrl, apiKey: !!apiKey })
      return NextResponse.json(
        { error: 'Base URL and API Key are required' },
        { status: 400 }
      )
    }

    // 智能处理baseUrl和endpoint的拼接，避免重复的/v1路径
    let url
    const cleanBaseUrl = baseUrl.endsWith('/v1') ? baseUrl.slice(0, -3) : baseUrl
    const cleanEndpoint = endpoint.startsWith('/v1') ? endpoint : `/v1${endpoint}`
    url = `${cleanBaseUrl}${cleanEndpoint}`
    console.log('构建的请求URL:', url)
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }
    console.log('请求头:', headers)

    const fetchOptions: RequestInit = {
      method,
      headers,
    }

    if (method !== 'GET' && body) {
      fetchOptions.body = JSON.stringify(body)
      console.log('请求体:', JSON.stringify(body, null, 2))
    }

    console.log('发起外部API请求...')
    const response = await fetch(url, fetchOptions)
    console.log('外部API响应状态:', response.status)
    console.log('外部API响应头:', Object.fromEntries(response.headers.entries()))
    
    const contentType = response.headers.get('content-type') || ''
    console.log('响应内容类型:', contentType)
    
    let data
    if (contentType.includes('text/event-stream') || contentType.includes('text/plain')) {
      // 处理流式响应或纯文本响应
      const textData = await response.text()
      console.log('流式/文本响应数据:', textData.substring(0, 500) + (textData.length > 500 ? '...' : ''))
      
      // 从流式数据中提取并组合所有内容
      const lines = textData.split('\n').filter(line => line.trim())
      let combinedContent = ''
      let lastValidJson = null
      let hasContent = false
      
      for (const line of lines) {
        if (line.startsWith('data: ') && !line.includes('[DONE]')) {
          try {
            const jsonStr = line.substring(6) // 移除 'data: ' 前缀
            const parsed = JSON.parse(jsonStr)
            
            // 收集所有包含内容的delta
            if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) {
              combinedContent += parsed.choices[0].delta.content
              hasContent = true
            }
            
            // 保存最后一个有效的JSON结构（用于获取模型信息等）
            if (parsed.choices && parsed.choices.length > 0) {
              lastValidJson = parsed
            }
          } catch (e) {
            // 忽略解析错误，继续尝试下一行
          }
        }
      }
      
      if (hasContent && lastValidJson) {
        // 构建完整的响应，将组合的内容放入标准OpenAI格式
        data = {
          ...lastValidJson,
          choices: [{
            ...lastValidJson.choices[0],
            message: {
              role: 'assistant',
              content: combinedContent
            },
            delta: undefined // 移除delta字段
          }]
        }
        console.log('从流式响应中组合的完整内容长度:', combinedContent.length)
        console.log('组合内容预览:', combinedContent.substring(0, 200) + (combinedContent.length > 200 ? '...' : ''))
      } else if (lastValidJson) {
        // 如果没有内容但有有效JSON，返回原始结构
        data = lastValidJson
        console.log('从流式响应中提取的JSON数据（无内容）:', JSON.stringify(data, null, 2))
      } else {
        // 如果无法提取有效JSON，返回原始文本
        data = { content: textData, type: 'stream' }
        console.log('无法从流式响应中提取JSON，返回原始文本')
      }
    } else {
      // 处理标准JSON响应
      try {
        data = await response.json()
        console.log('JSON响应数据:', JSON.stringify(data, null, 2))
      } catch (jsonError) {
        console.error('JSON解析失败，尝试获取文本内容:', jsonError)
        const textData = await response.text()
        data = { error: 'JSON解析失败', content: textData }
      }
    }
    
    if (response.ok) {
      console.log('外部API调用成功，返回数据')
      return NextResponse.json(data)
    } else {
      console.log('外部API调用失败，返回错误')
      return NextResponse.json(data, { status: response.status })
    }
  } catch (error: any) {
    console.error('API路由发生异常:')
    console.error('错误类型:', error.constructor.name)
    console.error('错误消息:', error.message)
    console.error('错误堆栈:', error.stack)
    
    return NextResponse.json(
      { error: 'Internal server error', details: error.message, stack: error.stack },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const baseUrl = searchParams.get('baseUrl')
    const apiKey = searchParams.get('apiKey')
    const endpoint = searchParams.get('endpoint') || '/v1/models'
    
    if (!baseUrl || !apiKey) {
      return NextResponse.json(
        { error: 'Base URL and API Key are required' },
        { status: 400 }
      )
    }

    // 智能处理baseUrl和endpoint的拼接，避免重复的/v1路径
    let url
    const cleanBaseUrl = baseUrl.endsWith('/v1') ? baseUrl.slice(0, -3) : baseUrl
    const cleanEndpoint = endpoint.startsWith('/v1') ? endpoint : `/v1${endpoint}`
    url = `${cleanBaseUrl}${cleanEndpoint}`
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }

    const response = await fetch(url, { headers })
    const data = await response.json()
    
    if (response.ok) {
      return NextResponse.json(data)
    } else {
      return NextResponse.json(data, { status: response.status })
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}