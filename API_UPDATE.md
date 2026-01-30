# API 更新说明

## 版本 2.0 - POST JSON Body

### 更改时间
2026-01-30

### 主要更改

将 TTS API 从 GET 请求改为 POST 请求，使用 JSON body 传递参数。

### 更改原因

1. **RESTful 规范**：POST 更适合创建资源（生成音频）
2. **无长度限制**：JSON body 支持更长的文本内容，不受 URL 长度限制
3. **类型安全**：JSON 格式提供更好的数据类型支持
4. **可读性**：JSON 格式比 URL 参数更清晰易读
5. **扩展性**：更容易添加新的参数和嵌套结构

### API 对比

#### 旧版本（GET）
```bash
GET /api/tts?text=你好世界&voice=Microsoft%20Server%20Speech%20Text%20to%20Speech%20Voice%20(zh-CN,%20XiaoxiaoNeural)&rate=0&pitch=0&volume=100
```

#### 新版本（POST）
```bash
POST /api/tts
Content-Type: application/json

{
  "text": "你好世界",
  "voice": "Microsoft Server Speech Text to Speech Voice (zh-CN, XiaoxiaoNeural)",
  "rate": 0,
  "pitch": 0,
  "volume": 100
}
```

### 使用示例

#### cURL
```bash
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
```

#### JavaScript/Fetch
```javascript
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

#### Python
```python
import requests

response = requests.post(
    'https://next-edge-tts-two.vercel.app/api/tts',
    json={
        'text': '你好世界',
        'voice': 'Microsoft Server Speech Text to Speech Voice (zh-CN, XiaoxiaoNeural)',
        'rate': 0,
        'pitch': 0,
        'volume': 100
    }
)

with open('output.mp3', 'wb') as f:
    f.write(response.content)
```

### 测试结果

✅ 本地测试通过
- 中文语音：43KB MP3 文件
- 英文语音：39KB MP3 文件

✅ 线上测试通过
- 中文语音：43KB MP3 文件
- 英文语音：35KB MP3 文件
- 参数调节正常工作

### 迁移指南

如果你正在使用旧版本的 GET API，请按以下方式迁移：

**旧代码：**
```javascript
const params = new URLSearchParams({
  text: '你好',
  voice: 'zh-CN-XiaoxiaoNeural',
  rate: '0',
  pitch: '0',
  volume: '100'
});
const response = await fetch(`/api/tts?${params}`);
```

**新代码：**
```javascript
const response = await fetch('/api/tts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: '你好',
    voice: 'zh-CN-XiaoxiaoNeural',
    rate: 0,
    pitch: 0,
    volume: 100
  })
});
```

### 参数说明

所有参数保持不变，只是传递方式改变：

| 参数 | 类型 | 必填 | 范围 | 默认值 | 说明 |
|------|------|------|------|--------|------|
| text | string | 是 | - | - | 要转换的文本 |
| voice | string | 是 | - | - | 语音名称 |
| rate | number | 否 | -100 ~ 100 | 0 | 语速 |
| pitch | number | 否 | -100 ~ 100 | 0 | 音调 |
| volume | number | 否 | 0 ~ 100 | 100 | 音量 |

### 更新的文件

- `app/api/tts/route.ts` - API 路由改为 POST
- `app/page.tsx` - 前端使用 POST 请求
- `README.md` - 更新文档
- `API_UPDATE.md` - 新增此文档

### 部署信息

- 部署时间：2026-01-30
- 部署 URL：https://next-edge-tts-two.vercel.app
- 构建状态：✅ 成功
- 测试状态：✅ 通过
