import { EdgeTTSService } from "@/lib/tts/edge-tts-service"

export async function GET() {
    try {
        const service = new EdgeTTSService()
        const voices = await service.fetchVoices()
        
        return Response.json(voices)
    } catch (error) {
        console.error('fetchVoices error', error)
        return new Response(JSON.stringify({ error: (error as Error).message }), { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' } 
        })
    }
}
