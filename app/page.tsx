'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Voice } from '@/lib/tts/types'
import { Copy, Check } from 'lucide-react'

// 代码块复制组件
function CodeBlock({ code, language = '' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group">
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
        <code className="text-sm whitespace-pre">
          {code}
        </code>
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  )
}

export default function Home() {
  const [text, setText] = useState('你好，欢迎使用 Edge TTS 文本转语音服务。')
  const [voices, setVoices] = useState<Voice[]>([])
  const [selectedVoice, setSelectedVoice] = useState('')
  const [selectedLocale, setSelectedLocale] = useState('zh-CN')
  const [rate, setRate] = useState(0)
  const [pitch, setPitch] = useState(0)
  const [volume, setVolume] = useState(100)
  const [loading, setLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string>('')
  const [locales, setLocales] = useState<string[]>([])

  useEffect(() => {
    fetchVoices()
  }, [])

  useEffect(() => {
    if (voices.length > 0) {
      const uniqueLocales = Array.from(new Set(voices.map(v => v.locale))).sort()
      setLocales(uniqueLocales)

      // 默认选择中文普通话
      if (!selectedLocale && uniqueLocales.includes('zh-CN')) {
        setSelectedLocale('zh-CN')
      }
    }
  }, [voices])

  useEffect(() => {
    if (selectedLocale && voices.length > 0) {
      const filteredVoices = voices.filter(v => v.locale === selectedLocale)
      if (filteredVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(filteredVoices[0].value)
      }
    }
  }, [selectedLocale, voices])

  const fetchVoices = async () => {
    try {
      const response = await fetch('/api/voices')
      const data = await response.json()
      setVoices(data)
    } catch (error) {
      console.error('Failed to fetch voices:', error)
    }
  }

  const handleGenerate = async () => {
    if (!text || !selectedVoice) return

    setLoading(true)
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice: selectedVoice,
          rate,
          pitch,
          volume,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate audio')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }

      setAudioUrl(url)
    } catch (error) {
      console.error('Failed to generate audio:', error)
      alert('生成音频失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const filteredVoices = voices.filter(v => v.locale === selectedLocale)

  const getLocaleName = (locale: string) => {
    const localeMap: Record<string, string> = {
      'zh-CN': '中文（普通话）',
      'zh-HK': '中文（香港）',
      'zh-TW': '中文（台湾）',
      'en-US': '英语（美国）',
      'en-GB': '英语（英国）',
      'ja-JP': '日语（日本）',
      'ko-KR': '韩语（韩国）',
    }
    return localeMap[locale] || locale
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Edge TTS Playground
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            基于 Microsoft Edge TTS 的文本转语音服务
          </p>
        </div>

        <Tabs defaultValue="playground" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="playground">Playground</TabsTrigger>
            <TabsTrigger value="api">API 文档</TabsTrigger>
          </TabsList>

          <TabsContent value="playground" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 左侧 - 统一的配置和输入卡片 */}
              <Card>
                <CardHeader>
                  <CardTitle>语音配置</CardTitle>
                  <CardDescription>设置语音参数和输入文本</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 语音参数部分 */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">语音参数</h3>
                    
                    <div className="space-y-2">
                      <Label>地区</Label>
                      <Select value={selectedLocale} onValueChange={(value) => setSelectedLocale(value || '')}>
                        <SelectTrigger>
                          <SelectValue placeholder="选择地区" />
                        </SelectTrigger>
                        <SelectContent>
                          {locales.map((locale) => (
                            <SelectItem key={locale} value={locale}>
                              {getLocaleName(locale)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>语音</Label>
                      <Select value={selectedVoice} onValueChange={(value) => setSelectedVoice(value || '')}>
                        <SelectTrigger>
                          <SelectValue placeholder="选择语音" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredVoices.map((voice) => (
                            <SelectItem key={voice.value} value={voice.value}>
                              {voice.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label>语速: {rate}%</Label>
                        <Slider
                          value={[rate]}
                          onValueChange={(value) => setRate(Array.isArray(value) ? value[0] : value)}
                          min={-100}
                          max={100}
                          step={1}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>音调: {pitch}%</Label>
                        <Slider
                          value={[pitch]}
                          onValueChange={(value) => setPitch(Array.isArray(value) ? value[0] : value)}
                          min={-100}
                          max={100}
                          step={1}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>音量: {volume}%</Label>
                        <Slider
                          value={[volume]}
                          onValueChange={(value) => setVolume(Array.isArray(value) ? value[0] : value)}
                          min={0}
                          max={100}
                          step={1}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 分隔线 */}
                  <div className="border-t border-gray-200 dark:border-gray-700"></div>

                  {/* 文本输入部分 */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">文本输入</h3>
                    
                    <Textarea
                      placeholder="请输入要转换的文本..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="min-h-[150px] resize-none"
                    />

                    <Button
                      onClick={handleGenerate}
                      disabled={loading || !text || !selectedVoice}
                      className="w-full"
                      size="lg"
                    >
                      {loading ? '生成中...' : '生成语音'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* 右侧 - 音频播放 */}
              <Card>
                <CardHeader>
                  <CardTitle>音频预览</CardTitle>
                  <CardDescription>生成的音频将在这里播放</CardDescription>
                </CardHeader>
                <CardContent>
                  {audioUrl ? (
                    <div className="space-y-4">
                      <audio
                        src={audioUrl}
                        controls
                        className="w-full"
                      />
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        音频已生成，可以播放或下载
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center min-h-[200px] text-gray-400 dark:text-gray-600">
                      <div className="text-center">
                        <svg className="mx-auto h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                        <p>点击"生成语音"按钮后，音频将显示在这里</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API 使用文档</CardTitle>
                <CardDescription>如何通过 API 调用文本转语音服务</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* 获取语音列表 */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">1. 获取可用语音列表</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      返回所有可用的语音列表，包括语音名称、语言、性别等信息。
                    </p>
                    <CodeBlock code="GET /api/voices" />
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-gray-700 dark:text-gray-300">响应示例：</h4>
                    <CodeBlock 
                      language="json"
                      code={`[
  {
    "value": "Microsoft Server Speech Text to Speech Voice (zh-CN, XiaoxiaoNeural)",
    "label": "晓晓 (Xiaoxiao) - 女声",
    "locale": "zh-CN",
    "gender": "Female"
  },
  {
    "value": "Microsoft Server Speech Text to Speech Voice (en-US, JennyNeural)",
    "label": "Jenny - 女声",
    "locale": "en-US",
    "gender": "Female"
  }
]`}
                    />
                  </div>
                </div>

                {/* 分隔线 */}
                <div className="border-t border-gray-200 dark:border-gray-700"></div>

                {/* 文本转语音 */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">2. 文本转语音</h3>
                    <CodeBlock code="POST /api/tts" />
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-base">请求参数</h4>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Content-Type: application/json
                      </p>
                    </div>
                    
                    <CodeBlock 
                      language="json"
                      code={`{
  "text": "要转换的文本",
  "voice": "语音名称",
  "rate": 0,      // 可选，范围 -100 到 100，默认 0
  "pitch": 0,     // 可选，范围 -100 到 100，默认 0
  "volume": 100   // 可选，范围 0 到 100，默认 100
}`}
                    />
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-base">参数说明</h4>
                    <div className="grid gap-3">
                      <div className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <code className="text-sm font-semibold text-blue-600 dark:text-blue-400 min-w-[80px]">text</code>
                        <div className="text-sm">
                          <span className="text-red-500 mr-2">*必填</span>
                          <span className="text-gray-600 dark:text-gray-400">要转换的文本内容</span>
                        </div>
                      </div>
                      <div className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <code className="text-sm font-semibold text-blue-600 dark:text-blue-400 min-w-[80px]">voice</code>
                        <div className="text-sm">
                          <span className="text-red-500 mr-2">*必填</span>
                          <span className="text-gray-600 dark:text-gray-400">语音名称，可通过 /api/voices 获取</span>
                        </div>
                      </div>
                      <div className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <code className="text-sm font-semibold text-blue-600 dark:text-blue-400 min-w-[80px]">rate</code>
                        <div className="text-sm">
                          <span className="text-gray-500 mr-2">可选</span>
                          <span className="text-gray-600 dark:text-gray-400">语速调节，范围 -100 到 100，默认 0</span>
                        </div>
                      </div>
                      <div className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <code className="text-sm font-semibold text-blue-600 dark:text-blue-400 min-w-[80px]">pitch</code>
                        <div className="text-sm">
                          <span className="text-gray-500 mr-2">可选</span>
                          <span className="text-gray-600 dark:text-gray-400">音调调节，范围 -100 到 100，默认 0</span>
                        </div>
                      </div>
                      <div className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <code className="text-sm font-semibold text-blue-600 dark:text-blue-400 min-w-[80px]">volume</code>
                        <div className="text-sm">
                          <span className="text-gray-500 mr-2">可选</span>
                          <span className="text-gray-600 dark:text-gray-400">音量调节，范围 0 到 100，默认 100</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-base">返回值</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <span className="text-green-600 dark:text-green-400 font-semibold">成功：</span>
                        <span className="text-gray-600 dark:text-gray-400">返回 audio/mpeg 格式的音频文件（MP3）</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <span className="text-red-600 dark:text-red-400 font-semibold">失败：</span>
                        <span className="text-gray-600 dark:text-gray-400">返回 JSON 格式的错误信息</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 分隔线 */}
                <div className="border-t border-gray-200 dark:border-gray-700"></div>

                {/* 使用示例 */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold">3. 使用示例</h3>

                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded text-xs font-mono">cURL</span>
                      当前配置示例
                    </h4>
                    <CodeBlock 
                      code={`curl -X POST "${typeof window !== 'undefined' ? window.location.origin : ''}/api/tts" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "${text || 'Hello World'}",
    "voice": "${selectedVoice || 'Microsoft Server Speech Text to Speech Voice (en-US, JennyNeural)'}",
    "rate": ${rate},
    "pitch": ${pitch},
    "volume": ${volume}
  }' \\
  -o output.mp3`}
                    />
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded text-xs font-mono">JavaScript</span>
                      Fetch API 示例
                    </h4>
                    <CodeBlock 
                      language="javascript"
                      code={`const response = await fetch('/api/tts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: '${text || 'Hello World'}',
    voice: '${selectedVoice || 'Microsoft Server Speech Text to Speech Voice (en-US, JennyNeural)'}',
    rate: ${rate},
    pitch: ${pitch},
    volume: ${volume}
  })
});

if (response.ok) {
  const blob = await response.blob();
  const audioUrl = URL.createObjectURL(blob);
  // 使用 audioUrl 播放或下载音频
} else {
  const error = await response.json();
  console.error('生成失败:', error);
}`}
                    />
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-xs font-mono">Python</span>
                      Requests 示例
                    </h4>
                    <CodeBlock 
                      language="python"
                      code={`import requests

response = requests.post(
    '${typeof window !== 'undefined' ? window.location.origin : ''}/api/tts',
    json={
        'text': '${text || 'Hello World'}',
        'voice': '${selectedVoice || 'Microsoft Server Speech Text to Speech Voice (en-US, JennyNeural)'}',
        'rate': ${rate},
        'pitch': ${pitch},
        'volume': ${volume}
    }
)

if response.status_code == 200:
    with open('output.mp3', 'wb') as f:
        f.write(response.content)
    print('音频已保存到 output.mp3')
else:
    print('生成失败:', response.json())`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
