# Next Edge TTS

基于 Microsoft Edge TTS 的文本转语音服务，针对 Next.js 和 Vercel 部署进行了优化。

## 在线演示

- **Playground**: https://next-edge-tts-two.vercel.app
- **API 文档**: https://next-edge-tts-two.vercel.app (点击 "API 文档" 标签)

## 功能特性

- 🎙️ 支持多语言、多音色的文本转语音
- 🎛️ 可调节语速、音调、音量
- 🎮 提供交互式 Playground
- 📚 自动生成 API 文档
- 🚀 针对 Vercel 无服务器部署优化
- 🔓 无需 Token 认证

## 快速开始

### 本地开发

```bash
# 安装依赖
bun install

# 启动开发服务器
bun run dev
```

访问 [http://localhost:3000](http://localhost:3000) 使用 Playground

### 部署到 Vercel

```bash
# 登录 Vercel
vercel login

# 部署项目
vercel --prod
```

## API 使用

### 获取可用语音列表

```bash
GET /api/voices
```

返回所有可用的语音列表

### 文本转语音

```bash
POST /api/tts
Content-Type: application/json
```

#### 请求体

```json
{
  "text": "要转换的文本",
  "voice": "语音名称",
  "rate": 0,      // 可选，范围 -100 到 100，默认 0
  "pitch": 0,     // 可选，范围 -100 到 100，默认 0
  "volume": 100   // 可选，范围 0 到 100，默认 100
}
```

#### 参数说明

- `text` (必填): 要转换的文本
- `voice` (必填): 语音名称，可通过 `/api/voices` 获取
- `rate` (可选): 语速，范围 -100 到 100，默认 0
- `pitch` (可选): 音调，范围 -100 到 100，默认 0
- `volume` (可选): 音量，范围 0 到 100，默认 100

#### 示例

```bash
# 中文语音示例
curl -X POST "https://next-edge-tts-two.vercel.app/api/tts" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "你好世界",
    "voice": "Microsoft Server Speech Text to Speech Voice (zh-CN, XiaoxiaoNeural)",
    "rate": 0,
    "pitch": 0,
    "volume": 100
  }' \
  -o output.mp3

# 英文语音示例
curl -X POST "https://next-edge-tts-two.vercel.app/api/tts" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello World",
    "voice": "Microsoft Server Speech Text to Speech Voice (en-US, JennyNeural)",
    "rate": 0,
    "pitch": 0,
    "volume": 100
  }' \
  -o output.mp3

# JavaScript/Fetch 示例
const response = await fetch('https://next-edge-tts-two.vercel.app/api/tts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: 'Hello World',
    voice: 'Microsoft Server Speech Text to Speech Voice (en-US, JennyNeural)',
    rate: 0,
    pitch: 0,
    volume: 100
  })
});

const blob = await response.blob();
const audioUrl = URL.createObjectURL(blob);
```

## 技术栈

- **框架**: Next.js 16
- **运行时**: Bun
- **部署**: Vercel
- **TTS 引擎**: Microsoft Edge TTS
- **样式**: Tailwind CSS
- **组件**: shadcn/ui

## 项目结构

```
.
├── app/
│   ├── api/
│   │   ├── tts/          # TTS API 路由
│   │   └── voices/       # 语音列表 API 路由
│   ├── page.tsx          # Playground 页面
│   └── layout.tsx
├── lib/
│   ├── tts/
│   │   ├── edge-tts-client.ts    # Edge TTS WebSocket 客户端
│   │   ├── edge-tts-service.ts   # TTS 服务封装
│   │   ├── ssml.ts               # SSML 构建器
│   │   └── types.ts              # 类型定义
│   └── utils/
│       └── array-buffer.ts       # ArrayBuffer 工具函数
└── components/ui/        # UI 组件
```

## 常见问题

### 为什么需要完整的语音名称？

Microsoft Edge TTS API 要求使用完整的语音名称格式：
`Microsoft Server Speech Text to Speech Voice (locale, voiceName)`

例如：`Microsoft Server Speech Text to Speech Voice (zh-CN, XiaoxiaoNeural)`

### 如何获取所有可用的语音？

访问 `/api/voices` 端点可获取完整的语音列表，包含所有支持的语言和音色。

### 音频格式是什么？

生成的音频为 MP3 格式（MPEG ADTS, layer III, 96 kbps, 24 kHz, Monaural）

## License

MIT

## 致谢

本项目参考了 [ms-ra-forwarder](https://github.com/xbzstudio/ms-ra-forwarder) 项目。
