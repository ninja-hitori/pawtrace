import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { assetUrl, getSighting, getSightingMatches, submitMatchDecision, updateSightingStatus } from '../services/api.js'

export default function SightingDetailPage() {
    const { id } = useParams()
    const [sighting, setSighting] = useState(null)
    const [matchesData, setMatchesData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [actionError, setActionError] = useState('')
    const [updatingStatus, setUpdatingStatus] = useState(false)

    useEffect(() => {
        loadData()
    }, [id])

    async function loadData() {
        setLoading(true)
        setError('')
        try {
            const [sightingRes, matchesRes] = await Promise.all([
                getSighting(id),
                getSightingMatches(id).catch(() => ({ matches: [] })) // graceful fallback if matches fail
            ])
            setSighting(sightingRes)
            setMatchesData(matchesRes)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleDecision(candidateId, decision) {
        setActionError('')
        try {
            await submitMatchDecision(id, candidateId, decision)
            // Refresh matches
            const updatedMatches = await getSightingMatches(id)
            setMatchesData(updatedMatches)
        } catch (err) {
            setActionError(err.message)
        }
    }

    async function handleStatusChange(newStatus) {
        setUpdatingStatus(true)
        setActionError('')
        try {
            const updated = await updateSightingStatus(id, newStatus)
            setSighting(updated)
        } catch (err) {
            setActionError(err.message)
        } finally {
            setUpdatingStatus(false)
        }
    }

    if (loading) {
        return <div className="py-12 text-center text-stone-500">Loading sighting details and potential matches...</div>
    }

    if (error || !sighting) {
        return (
            <div className="space-y-4">
                <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error || 'Sighting not found.'}
                </div>
                <Link to="/map" className="text-sm font-medium text-amber-600 hover:underline">&larr; Back to Map</Link>
            </div>
        )
    }

    const matches = matchesData?.matches || []

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Link to="/map" className="text-sm font-medium text-amber-600 hover:underline">&larr; Back to Map</Link>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500 font-medium">Status:</span>
                    <select
                        value={sighting.status || 'open'}
                        disabled={updatingStatus}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-xs font-semibold uppercase tracking-wider text-stone-800 focus:border-amber-600 focus:outline-none"
                    >
                        <option value="open">Open</option>
                        <option value="under_review">Under Review</option>
                        <option value="verified">Verified</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
            </div>

            {actionError && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{actionError}</div>}

            {/* Sighting Details Card */}
            <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4">
                    {sighting.image_url && (
                        <img src={assetUrl(sighting.image_url)} alt="Sighting" className="h-48 w-full sm:w-48 rounded-lg object-cover bg-stone-100 border border-stone-200" />
                    )}
                    <div className="flex-1 space-y-2 text-sm">
                        <div>
                            <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                                {sighting.status}
                            </span>
                            <h1 className="mt-1 text-lg font-semibold text-stone-900">Sighting #{sighting.id.slice(0, 8)}</h1>
                        </div>
                        <p className="text-stone-600"><strong className="text-stone-800">Landmark:</strong> {sighting.landmark_description || 'None provided'}</p>
                        <p className="text-stone-600"><strong className="text-stone-800">Reported:</strong> {new Date(sighting.reported_at).toLocaleString()}</p>
                        <p className="text-stone-600"><strong className="text-stone-800">Risk Score:</strong> {sighting.risk_score ?? 'N/A'} / 100</p>
                        <p className="text-stone-600"><strong className="text-stone-800">Coordinates:</strong> {sighting.latitude && sighting.longitude ? `${Number(sighting.latitude).toFixed(4)}, ${Number(sighting.longitude).toFixed(4)}` : 'Not provided'}</p>
                    </div>
                </div>
            </div>

            {/* Potential Matches Panel */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-stone-900">Potential Matches ({matches.length})</h2>
                {matches.length === 0 ? (
                    <div className="rounded-xl border border-stone-200 bg-white p-6 text-center text-sm text-stone-500">
                        No potential matches found for this sighting yet.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {matches.map((m) => (
                            <div key={m.candidate_sighting_id} className="rounded-xl border border-stone-200 bg-white p-4 space-y-3 shadow-sm">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        {m.candidate_image_url && (
                                            <img src={assetUrl(m.candidate_image_url)} alt="Candidate" className="h-16 w-16 rounded-lg object-cover bg-stone-100 border" />
                                        )}
                                        <div className="text-xs space-y-1">
                                            <p className="font-semibold text-stone-900">Candidate #{m.candidate_sighting_id.slice(0, 8)}</p>
                                            <p className="text-stone-600">Similarity Score: <span className="font-semibold text-amber-700">{(m.similarity_score * 100).toFixed(1)}%</span></p>
                                            {m.distance_km != null && <p className="text-stone-600">Distance: {m.distance_km} km apart</p>}
                                            {m.hours_apart != null && <p className="text-stone-600">Time gap: {m.hours_apart} hours</p>}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-end sm:self-center">
                                        <span className={`text-xs font-semibold px-2 py-1 rounded ${m.decision === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                m.decision === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-stone-100 text-stone-700'
                                            }`}>
                                            Decision: {m.decision || 'pending'}
                                        </span>
                                        <button
                                            onClick={() => handleDecision(m.candidate_sighting_id, 'confirmed')}
                                            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                                        >
                                            Confirm
                                        </button>
                                        <button
                                            onClick={() => handleDecision(m.candidate_sighting_id, 'rejected')}
                                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>

                                {/* Match Reasons */}
                                {m.reasons && m.reasons.length > 0 && (
                                    <div className="rounded-lg bg-stone-50 p-2 text-xs text-stone-600 space-y-1 border border-stone-100">
                                        <p className="font-semibold text-stone-700">Match Evidence:</p>
                                        <ul className="list-disc list-inside space-y-0.5">
                                            {m.reasons.map((r, i) => <li key={i}>{r}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

