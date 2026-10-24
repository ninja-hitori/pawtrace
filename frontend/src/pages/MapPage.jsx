import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { assetUrl, getSightings } from '../services/api.js'
import 'leaflet/dist/leaflet.css'

// Leaflet default icon fix for Vite/React bundling issues
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

export default function MapPage() {
    const [sightings, setSightings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [statusFilter, setStatusFilter] = useState('')

    useEffect(() => {
        loadSightings()
    }, [])

    async function loadSightings() {
        setLoading(true)
        setError('')
        try {
            const data = await getSightings()
            const list = Array.isArray(data) ? data : (data?.sightings || data?.data || [])
            setSightings(list)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const safeSightings = Array.isArray(sightings) ? sightings : []
    const filteredSightings = statusFilter
        ? safeSightings.filter((s) => s.status === statusFilter)
        : safeSightings

    const validMapSightings = filteredSightings.filter(
        (s) => s.latitude != null && s.longitude != null && !Number.isNaN(Number(s.latitude)) && !Number.isNaN(Number(s.longitude))
    )
    const unmappedSightings = filteredSightings.filter(
        (s) => s.latitude == null || s.longitude == null || Number.isNaN(Number(s.latitude)) || Number.isNaN(Number(s.longitude))
    )

    const defaultCenter = [12.9716, 77.5946]
    const mapCenter = validMapSightings.length > 0
        ? [Number(validMapSightings[0].latitude), Number(validMapSightings[0].longitude)]
        : defaultCenter

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                    <h1 className="text-2xl font-semibold">Sighting Map</h1>
                    <p className="text-sm text-stone-600">Explore reported stray dog sightings and recent activity hotspots.</p>
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor="status-filter" className="text-sm font-medium text-stone-700">Filter:</label>
                    <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm focus:border-amber-600 focus:outline-none"
                    >
                        <option value="">All statuses</option>
                        <option value="open">Open</option>
                        <option value="under_review">Under Review</option>
                        <option value="verified">Verified</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
            </div>

            {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

            {loading ? (
                <div className="flex h-96 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500">
                    Loading sightings map...
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Interactive Map View */}
                    <div className="h-[450px] w-full overflow-hidden rounded-xl border border-stone-200 shadow-sm">
                        <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {validMapSightings.map((s) => (
                                <Marker key={s.id} position={[Number(s.latitude), Number(s.longitude)]}>
                                    <Popup>
                                        <div className="w-48 space-y-2 text-xs">
                                            {s.image_url && (
                                                <img
                                                    src={assetUrl(s.image_url)}
                                                    alt="Sighting thumbnail"
                                                    className="h-28 w-full rounded-md object-cover bg-stone-100"
                                                />
                                            )}
                                            <div>
                                                <span className="font-semibold text-stone-900 uppercase tracking-wider text-[10px] bg-stone-100 px-1.5 py-0.5 rounded">
                                                    {s.status}
                                                </span>
                                                <p className="mt-1 font-medium text-stone-800 line-clamp-2">
                                                    {s.landmark_description || 'No landmark specified'}
                                                </p>
                                            </div>
                                            <div className="text-stone-500">
                                                Reported: {new Date(s.reported_at).toLocaleDateString()}
                                            </div>
                                            <Link
                                                to={`/sightings/${s.id}`}
                                                className="mt-2 block text-center rounded bg-amber-600 py-1 font-medium text-white hover:bg-amber-700"
                                            >
                                                View & Review Matches
                                            </Link>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>

                    {/* Unmapped Reports List */}
                    {unmappedSightings.length > 0 && (
                        <div className="rounded-xl border border-stone-200 bg-white p-4 space-y-3">
                            <h2 className="text-sm font-medium text-stone-800">Reports without map coordinates ({unmappedSightings.length})</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {unmappedSightings.map((s) => (
                                    <Link
                                        key={s.id}
                                        to={`/sightings/${s.id}`}
                                        className="flex gap-3 items-center rounded-lg border border-stone-100 bg-stone-50 p-3 hover:border-amber-300 transition-colors"
                                    >
                                        {s.image_url && (
                                            <img src={assetUrl(s.image_url)} alt="Thumbnail" className="h-16 w-16 rounded-md object-cover bg-white" />
                                        )}
                                        <div className="flex-1 min-w-0 text-xs space-y-1">
                                            <span className="font-semibold text-[10px] bg-stone-200 px-1.5 py-0.5 rounded text-stone-700">{s.status}</span>
                                            <p className="font-medium text-stone-800 truncate">{s.landmark_description || 'Landmark description missing'}</p>
                                            <p className="text-stone-500">{new Date(s.reported_at).toLocaleString()}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

