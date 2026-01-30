import { EdgeTTSService } from "@/lib/tts/edge-tts-service"

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: corsHeaders,
    })
}

export async function GET() {
    try {
        const service = new EdgeTTSService()
        const voices = await service.fetchVoices()

        return new Response(JSON.stringify(voices), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        })
    } catch (error) {
        console.error('fetchVoices error', error)
        return new Response(JSON.stringify({ error: (error as Error).message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        })
    }
}
