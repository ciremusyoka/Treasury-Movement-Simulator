export function jsonResponse(data, status,) {
    return new Response(JSON.stringify({ data }), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}