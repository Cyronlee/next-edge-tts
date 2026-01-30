import { EdgeTTSService } from "@/lib/tts/edge-tts-service"
import { TTSOptions } from "@/lib/tts/types"

Error.stackTraceLimit = Infinity;

interface TTSRequest {
    text: string
    voice: string
    rate?: number
    pitch?: number
    volume?: number
    personality?: string
}

export async function POST(request: Request) {
    try {
        const body: TTSRequest = await request.json()

        const { text, voice, rate = 0, pitch = 0, volume = 100, personality } = body

        if (!text) {
            return new Response(JSON.stringify({ error: 'Text is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        if (!voice) {
            return new Response(JSON.stringify({ error: 'Voice is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        // 验证参数范围
        if (rate < -100 || rate > 100) {
            return new Response(JSON.stringify({ error: 'Rate must be between -100 and 100' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        if (pitch < -100 || pitch > 100) {
            return new Response(JSON.stringify({ error: 'Pitch must be between -100 and 100' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        if (volume < 0 || volume > 100) {
            return new Response(JSON.stringify({ error: 'Volume must be between 0 and 100' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        const service = new EdgeTTSService()
        const options: TTSOptions = {
            voice,
            volume,
            rate,
            pitch,
            personality,
        }

        const speech = await service.convert(text, options)
        const audioBlob = new Blob([speech.audio], { type: 'audio/mpeg' });

        return new Response(audioBlob, {
            status: 200,
            headers: { 'Content-Type': 'audio/mpeg' }
        })
    } catch (error) {
        console.log('textToSpeech error', error)
        console.log("Full stack", (error as Error).stack)
        return new Response(JSON.stringify({ error: (error as Error).message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}
