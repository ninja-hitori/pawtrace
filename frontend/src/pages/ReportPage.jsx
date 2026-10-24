import { useEffect, useRef, useState } from 'react'
import { assetUrl, submitSighting } from '../services/api.js'

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_MB = 10
const RISK_QUESTIONS = [
  ['injured_or_distressed', 'The dog looked injured or unwell'],
  ['attack_reported', 'It was reported to have injured or attacked someone recently'],
  ['concerning_behaviour', 'I saw threatening or concerning behaviour'],
  ['high_pedestrian_activity', 'The area has high pedestrian activity'],
]
const emptyRisk = () => Object.fromEntries(RISK_QUESTIONS.map(([k]) => [k, false]))

const field = 'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600'

export default function ReportPage() {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [landmark, setLandmark] = useState('')
  const [lat, setLat] = useState('')
  const [lon, setLon] = useState('')
  const [risk, setRisk] = useState(emptyRisk())
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [resultPreview, setResultPreview] = useState('')
  const fileInput = useRef(null)

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

  function onFile(e) {
    const f = e.target.files?.[0]
    setSubmitError('')
    if (!f) return
    if (!ACCEPTED.includes(f.type)) {
      setErrors((x) => ({ ...x, image: 'Unsupported file type. Please choose a JPEG, PNG or WebP photo.' }))
      e.target.value = ''
      return
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setErrors((x) => ({ ...x, image: `Image is too large (max ${MAX_MB} MB).` }))
      e.target.value = ''
      return
    }
    setErrors((x) => ({ ...x, image: undefined }))
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
  }

  function validate() {
    const e = {}
    if (!file) e.image = 'Please upload a photograph of the dog.'
    const hasLat = lat.trim() !== '', hasLon = lon.trim() !== ''
    if (hasLat !== hasLon) e.location = 'Enter both latitude and longitude, or leave both empty.'
    else if (hasLat) {
      const a = Number(lat), b = Number(lon)
      if (Number.isNaN(a) || a < -90 || a > 90) e.location = 'Latitude must be a number between -90 and 90.'
      else if (Number.isNaN(b) || b < -180 || b > 180) e.location = 'Longitude must be a number between -180 and 180.'
    }
    if (landmark.length > 500) e.landmark = 'Landmark description must be 500 characters or fewer.'
    return e
  }

  async function onSubmit(ev) {
    ev.preventDefault()
    if (loading) return
    const e = validate()
    setErrors(e)
    setSubmitError('')
    if (Object.keys(e).length) return
    setLoading(true)
    try {
      const data = await submitSighting({ image: file, landmarkDescription: landmark.trim(), latitude: lat.trim(), longitude: lon.trim(), risk })
      setResult(data)
      setResultPreview(previewUrl)
      // Reset the form so a second submission never reuses stale data (the preview URL is handed to the confirmation).
      setFile(null); setPreviewUrl(''); setLandmark(''); setLat(''); setLon(''); setRisk(emptyRisk()); setErrors({})
      if (fileInput.current) fileInput.current.value = ''
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return <Confirmation result={result} preview={resultPreview} onAnother={() => { if (resultPreview) URL.revokeObjectURL(resultPreview); setResult(null); setResultPreview('') }} />
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Report a stray dog</h1>
        <p className="mt-1 text-sm text-stone-600">Upload a photo and tell us where you saw the dog. Photo location data is read automatically when present.</p>
      </div>

      <section className="space-y-2">
        <label htmlFor="photo" className="block text-sm font-medium">Photograph *</label>
        <input id="photo" ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile}
          className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-amber-600 file:px-4 file:py-2 file:text-white hover:file:bg-amber-700" />
        {errors.image && <p role="alert" className="text-sm text-red-600">{errors.image}</p>}
        {previewUrl && <img src={previewUrl} alt="Selected dog preview" className="max-h-64 w-full rounded-lg border border-stone-200 object-contain bg-white" />}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium">Where was the dog seen?</h2>
        <div>
          <label htmlFor="landmark" className="block text-sm text-stone-700">Nearby landmarks</label>
          <textarea id="landmark" rows={2} value={landmark} onChange={(e) => setLandmark(e.target.value)} className={field}
            placeholder="e.g. Opposite the bus stop on MG Road, near the park gate" />
          {errors.landmark && <p role="alert" className="text-sm text-red-600">{errors.landmark}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="lat" className="block text-sm text-stone-700">Latitude (optional)</label>
            <input id="lat" inputMode="decimal" value={lat} onChange={(e) => setLat(e.target.value)} className={field} placeholder="12.9716" />
          </div>
          <div>
            <label htmlFor="lon" className="block text-sm text-stone-700">Longitude (optional)</label>
            <input id="lon" inputMode="decimal" value={lon} onChange={(e) => setLon(e.target.value)} className={field} placeholder="77.5946" />
          </div>
        </div>
        {errors.location && <p role="alert" className="text-sm text-red-600">{errors.location}</p>}
        <p className="text-xs text-stone-500">If the photo has no GPS data, enter coordinates or a landmark description. If you enter coordinates, they are used instead of the photo's GPS location (both are saved).</p>
      </section>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">About the sighting (your observations)</legend>
        {RISK_QUESTIONS.map(([key, label]) => (
          <label key={key} className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={risk[key]} onChange={(e) => setRisk((r) => ({ ...r, [key]: e.target.checked }))} className="mt-0.5 h-4 w-4 accent-amber-600" />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>

      {submitError && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</div>}

      <button type="submit" disabled={loading}
        className="w-full rounded-lg bg-amber-600 px-4 py-3 font-medium text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60">
        {loading ? 'Submitting…' : 'Submit report'}
      </button>
    </form>
  )
}

function Row({ label, children }) {
  return (
    <div className="flex justify-between gap-4 border-b border-stone-100 py-2 text-sm last:border-0">
      <dt className="text-stone-500">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  )
}

const fmtCoord = (a, b) => (a == null || b == null ? 'Not available' : `${Number(a).toFixed(5)}, ${Number(b).toFixed(5)}`)
const SOURCE_LABEL = { exif: "Photo GPS data", manual: 'Entered by you', none: 'No coordinates (landmark only)' }

function Confirmation({ result, preview, onAnother }) {
  const when = (s) => (s ? new Date(s).toLocaleString() : 'Not available')
  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <h1 className="text-xl font-semibold text-green-800">Report submitted</h1>
        <p className="mt-1 text-sm text-green-800">Thank you. Your sighting ID is <span className="font-mono font-semibold">{result.id}</span></p>
      </div>
      <img src={preview || assetUrl(result.image_url)} alt="Submitted dog" className="max-h-64 w-full rounded-lg border border-stone-200 object-contain bg-white" />
      <dl className="rounded-lg border border-stone-200 bg-white px-4">
        <Row label="Status">{result.status}</Row>
        <Row label="Submitted">{when(result.reported_at)}</Row>
        <Row label="Location used">{fmtCoord(result.latitude, result.longitude)}</Row>
        <Row label="Location source">{SOURCE_LABEL[result.location_source] || result.location_source}</Row>
        <Row label="Landmarks">{result.landmark_description || 'Not provided'}</Row>
        <Row label="Photo GPS (EXIF)">{fmtCoord(result.exif_latitude, result.exif_longitude)}</Row>
        <Row label="Photo capture time (EXIF)">{result.exif_captured_at ? when(result.exif_captured_at) : 'Not available in photo'}</Row>
        <Row label="Coordinates you entered">{fmtCoord(result.manual_latitude, result.manual_longitude)}</Row>
        <Row label="Preliminary risk score">{result.risk_score ?? 'Not calculated'} / 100</Row>
      </dl>
      <button onClick={onAnother} className="w-full rounded-lg border border-amber-600 px-4 py-3 font-medium text-amber-700 hover:bg-amber-50">Report another dog</button>
    </div>
  )
}
