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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 左侧 - 文本输入 */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>文本输入</CardTitle>
                  <CardDescription>输入要转换为语音的文本内容</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="请输入要转换的文本..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="min-h-[200px] resize-none"
                  />

                  <div className="flex gap-2">
                    <Button
                      onClick={handleGenerate}
                      disabled={loading || !text || !selectedVoice}
                      className="flex-1"
                    >
                      {loading ? '生成中...' : '生成语音'}
                    </Button>
                  </div>

                  {audioUrl && (
                    <div className="space-y-2">
                      <Label>生成的音频</Label>
                      <audio
                        src={audioUrl}
                        controls
                        className="w-full"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 右侧 - 参数配置 */}
              <Card>
                <CardHeader>
                  <CardTitle>语音参数</CardTitle>
                  <CardDescription>调整语音生成参数</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">1. 获取可用语音列表</h3>
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                      <code className="text-sm">
                        GET /api/voices
                      </code>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      返回所有可用的语音列表，包括语音名称、语言、性别等信息。
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">2. 文本转语音</h3>
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                      <code className="text-sm whitespace-pre">
                        POST /api/tts
                      </code>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">请求体（JSON）：</h4>
                      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                        <code className="text-sm whitespace-pre">
{`{
  "text": "要转换的文本",
  "voice": "语音名称",
  "rate": 0,      // 可选，范围 -100 到 100，默认 0
  "pitch": 0,     // 可选，范围 -100 到 100，默认 0
  "volume": 100   // 可选，范围 0 到 100，默认 100
}`}
                        </code>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">参数说明：</h4>
                      <ul className="space-y-2 text-sm">
                        <li><code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">text</code> - 要转换的文本（必填）</li>
                        <li><code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">voice</code> - 语音名称（必填）</li>
                        <li><code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">rate</code> - 语速，范围 -100 到 100，默认 0</li>
                        <li><code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">pitch</code> - 音调，范围 -100 到 100，默认 0</li>
                        <li><code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">volume</code> - 音量，范围 0 到 100，默认 100</li>
                      </ul>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">当前配置的请求示例：</h4>
                      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                        <code className="text-sm whitespace-pre">
{`{
  "text": "${text || '{text}'}",
  "voice": "${selectedVoice || '{voice}'}",
  "rate": ${rate},
  "pitch": ${pitch},
  "volume": ${volume}
}`}
                        </code>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">cURL 示例：</h4>
                      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                        <code className="text-sm whitespace-pre">
{`curl -X POST "${typeof window !== 'undefined' ? window.location.origin : ''}/api/tts" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "${text || 'Hello World'}",
    "voice": "${selectedVoice || 'Microsoft Server Speech Text to Speech Voice (en-US, JennyNeural)'}",
    "rate": ${rate},
    "pitch": ${pitch},
    "volume": ${volume}
  }' \\
  -o output.mp3`}
                        </code>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">JavaScript/Fetch 示例：</h4>
                      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                        <code className="text-sm whitespace-pre">
{`const response = await fetch('/api/tts', {
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

const blob = await response.blob();
const audioUrl = URL.createObjectURL(blob);`}
                        </code>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">返回值：</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        成功时返回 audio/mpeg 格式的音频文件（MP3）
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        失败时返回 JSON 格式的错误信息
                      </p>
                    </div>
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
