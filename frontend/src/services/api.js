// Matches docs/api-contract.md. No mock responses: every call goes to the real backend.
const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

export function assetUrl(path) {
    if (!path) return ''
    return /^https?:\/\//.test(path) ? path : `${BASE}${path}`
}

export async function submitSighting({ image, landmarkDescription, latitude, longitude, risk }) {
    const fd = new FormData()
    fd.append('image', image)
    fd.append('landmark_description', landmarkDescription || '')
    if (latitude !== '' && latitude != null) fd.append('latitude', String(latitude))
    if (longitude !== '' && longitude != null) fd.append('longitude', String(longitude))
    fd.append('injured_or_distressed', String(!!risk.injured_or_distressed))
    fd.append('attack_reported', String(!!risk.attack_reported))
    fd.append('concerning_behaviour', String(!!risk.concerning_behaviour))
    fd.append('high_pedestrian_activity', String(!!risk.high_pedestrian_activity))

    let res
    try {
        res = await fetch(`${BASE}/api/sightings`, { method: 'POST', body: fd })
    } catch {
        throw new Error('Could not reach the server. Check your connection and that the backend is running.')
    }
    let body = null
    try { body = await res.json() } catch { /* non-JSON error body */ }
    if (!res.ok) {
        let msg = body?.detail
        if (Array.isArray(msg)) msg = msg.map((d) => d.msg).join('; ')
        throw new Error(msg || `Submission failed (HTTP ${res.status}).`)
    }
    return body
}

export async function getSightings() {
    let res
    try {
        res = await fetch(`${BASE}/api/sightings`, { method: 'GET' })
    } catch {
        throw new Error('Could not reach the server to fetch sightings.')
    }
    let body = null
    try { body = await res.json() } catch { /* non-JSON error body */ }
    if (!res.ok) {
        throw new Error(body?.detail || `Failed to fetch sightings (HTTP ${res.status}).`)
    }
    return body
}

export async function getSighting(id) {
    let res
    try {
        res = await fetch(`${BASE}/api/sightings/${id}`, { method: 'GET' })
    } catch {
        throw new Error('Could not reach the server to fetch sighting details.')
    }
    let body = null
    try { body = await res.json() } catch { /* non-JSON error body */ }
    if (!res.ok) {
        throw new Error(body?.detail || `Failed to fetch sighting (HTTP ${res.status}).`)
    }
    return body
}

export async function getSightingMatches(id) {
    let res
    try {
        res = await fetch(`${BASE}/api/sightings/${id}/matches`, { method: 'GET' })
    } catch {
        throw new Error('Could not reach the server to fetch potential matches.')
    }
    let body = null
    try { body = await res.json() } catch { /* non-JSON error body */ }
    if (!res.ok) {
        throw new Error(body?.detail || `Failed to fetch matches (HTTP ${res.status}).`)
    }
    return body
}

export async function submitMatchDecision(sightingId, candidateId, decision) {
    let res
    try {
        res = await fetch(`${BASE}/api/sightings/${sightingId}/matches/${candidateId}/decision`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ decision })
        })
    } catch {
        throw new Error('Could not reach the server to submit match decision.')
    }
    let body = null
    try { body = await res.json() } catch { /* non-JSON error */ }
    if (!res.ok) {
        throw new Error(body?.detail || `Failed to record decision (HTTP ${res.status}).`)
    }
    return body
}

export async function updateSightingStatus(id, status) {
    let res
    try {
        res = await fetch(`${BASE}/api/sightings/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        })
    } catch {
        throw new Error('Could not reach server to update status.')
    }
    let body = null
    try { body = await res.json() } catch { /* non-JSON */ }
    if (!res.ok) {
        throw new Error(body?.detail || `Failed to update status (HTTP ${res.status}).`)
    }
    return body
}

