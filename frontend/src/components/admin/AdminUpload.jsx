import { useRef, useState } from 'react'
import { adminService } from '../../services/api'
import {
  FiArchive,
  FiCheckCircle,
  FiFileText,
  FiInfo,
  FiShield,
  FiUpload,
} from 'react-icons/fi'

export default function AdminUpload() {
  const lightMode = localStorage.getItem('zl_theme') !== 'dark'

  const [restFile, setRestFile] = useState(null)
  const [reviewFile, setReviewFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const restInputRef = useRef(null)
  const reviewInputRef = useRef(null)

  const handleUpload = async () => {
    if (!restFile && !reviewFile) {
      setError('Please select at least one CSV file to upload.')
      return
    }
    setError('')
    setResult(null)
    setUploading(true)
    setProgress(10)

    try {
      const results = {}
      if (restFile) {
        setProgress(30)
        results.restaurants = await adminService.uploadRestaurants(restFile)
        setProgress(60)
      }
      if (reviewFile) {
        setProgress(75)
        results.reviews = await adminService.uploadReviews(reviewFile)
        setProgress(95)
      }
      setProgress(100)
      setResult(results)
    } catch (e) {
      setError(e.message || 'Upload failed. Check that the server is running.')
    } finally {
      setUploading(false)
    }
  }

  const DropZone = ({ label, hint, file, onFile, inputRef, tone }) => {
    const selected = Boolean(file)

    const border = selected
      ? 'border-green-500 bg-green-50/60'
      : lightMode
        ? 'border-[#dfe6f1] bg-white hover:border-[#E8401C] hover:bg-[#fff5f3]'
        : 'border-[#223650] bg-[#0d1b2e] hover:border-[#E8401C] hover:bg-[#fff5f3]/10'
    const iconBg =
      tone === 'orange'
        ? lightMode ? 'border-[#ffe1d8] bg-[#fff0e7] text-[#ff5a1f]' : 'border-[#3a1b13] bg-[#2a110b]/60 text-[#ff6a21]'
        : lightMode ? 'border-[#eadbff] bg-[#efdfff] text-[#a855f7]' : 'border-[#3a1d5b] bg-[#2a1444]/60 text-[#c084fc]'

    return (
      <div
        className={`relative cursor-pointer overflow-hidden rounded-[18px] border-2 border-dashed p-8 text-center transition-all ${border}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const f = e.dataTransfer.files?.[0]
          if (f) onFile(f)
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />

        <div
          className={`mx-auto mb-4 grid h-14 w-14 place-items-center rounded-[14px] border ${iconBg}`}
          aria-hidden="true"
        >
          {tone === 'orange' ? <FiArchive size={22} /> : <FiFileText size={22} />}
        </div>

        <div className={`text-[13px] font-semibold ${lightMode ? 'text-[#0d1d36]' : 'text-white'}`}>{label}</div>
        <div className={`mt-1 text-sm font-semibold ${selected ? (lightMode ? 'text-gray-800' : 'text-white') : (lightMode ? 'text-gray-500' : 'text-[#9cadc5]')}`}>
          {selected ? file.name : hint}
        </div>

        {selected ? (
          <div
            className={`mt-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-bold ${
              lightMode
                ? 'border-green-200 bg-green-50 text-[#16a34a]'
                : 'border-[#0f3d24] bg-[#072014]/60 text-[#4ade80]'
            }`}
          >
            <FiCheckCircle size={14} />
            Ready to upload
          </div>
        ) : (
          <div className={`mt-3 text-xs font-semibold ${lightMode ? 'text-[#8a97b2]' : 'text-[#9cadc5]'}`}>
            Drag & drop CSV here or click to select
          </div>
        )}

        {selected && (
          <div className={`mt-3 text-[11px] font-medium ${lightMode ? 'text-[#7a869c]' : 'text-[#9cadc5]'}`}>
            {(file.size / 1024).toFixed(1)} KB · Click to change
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1120px] pb-5">
      <header className="mb-5 flex flex-col gap-2.5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className={`text-[24px] font-black tracking-[-0.02em] ${lightMode ? 'text-[#0d1d36]' : 'text-white'}`}>
            Upload Data
          </h1>
          <p className={`mt-2 text-[14px] font-medium ${lightMode ? 'text-[#5b677f]' : 'text-[#9cadc5]'}`}>
            Upload CSV files to populate the PostgreSQL database
          </p>
        </div>
      </header>

      {/* Upload Grid */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-4">
        <DropZone
          label="Restaurant Metadata CSV"
          hint="Zomato_Restaurant_names_and_Metadata.csv"
          file={restFile}
          onFile={setRestFile}
          inputRef={restInputRef}
          tone="orange"
        />
        <DropZone
          label="Restaurant Reviews CSV"
          hint="Zomato_Restaurant_reviews.csv"
          file={reviewFile}
          onFile={setReviewFile}
          inputRef={reviewInputRef}
          tone="purple"
        />
      </section>

      {/* Status Messages */}
      {error && (
        <div
          className={`mb-4 rounded-[12px] border px-4 py-3 text-[13px] font-semibold ${
            lightMode
              ? 'border-[#ffc5bc] bg-[#fff0ee] text-[#c0392b]'
              : 'border-[#ffc5bc]/30 bg-[#3a0f0f]/20 text-[#ff7a6a]'
          }`}
        >
          {error}
        </div>
      )}

      {uploading && (
        <div
          className={`mb-4 rounded-[12px] border p-4 shadow-[0_12px_28px_rgba(21,34,66,0.03)] ${
            lightMode ? 'border-[#ffd3c4] bg-white' : 'border-[#223650] bg-[#0d1b2e]'
          }`}
        >
          <div className="mb-2 flex items-center justify-between text-[12px] font-bold text-[#ff4a13]">
            <span>Uploading CSV files</span>
            <span>{progress ?? 0}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#ffe5db]">
            <div 
              className="h-full rounded-full bg-[#ff4a13] transition-all duration-500" 
              style={{ width: `${progress ?? 0}%` }} 
            />
          </div>
        </div>
      )}

      {result && (
        <div
          className={`mb-4 rounded-[12px] border px-4 py-3 ${
            lightMode ? 'border-green-200 bg-green-50' : 'border-[#0f3d24] bg-[#072014]/60'
          }`}
        >
          <div className={`flex items-center gap-2 text-[13px] font-bold ${lightMode ? 'text-[#16a34a]' : 'text-[#4ade80]'}`}>
            <FiCheckCircle size={16} />
            Upload successful
          </div>
          {result.restaurants && (
            <div className={`mt-1.5 text-[13px] font-semibold ${lightMode ? 'text-[#1f2937]' : 'text-white/90'}`}>
              Restaurants — inserted: {result.restaurants.inserted}, skipped: {result.restaurants.skipped}
            </div>
          )}
          {result.reviews && (
            <div className={`text-[13px] font-semibold ${lightMode ? 'text-[#1f2937]' : 'text-white/90'}`}>
              Reviews — inserted: {result.reviews.inserted}, skipped: {result.reviews.skipped}
            </div>
          )}
        </div>
      )}

      {/* Action Bar */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={handleUpload}
          disabled={uploading || (!restFile && !reviewFile)}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-[#ff4a13] px-6 text-[14px] font-bold text-white shadow-[0_14px_26px_rgba(255,74,19,0.24)] transition hover:enabled:bg-[#e43e0d] disabled:cursor-not-allowed disabled:opacity-65"
        >
          {uploading ? (
            <>
              <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <FiUpload size={16} />
              Upload to Database
            </>
          )}
        </button>

        <div className={`flex items-center gap-2 text-[12px] font-semibold ${lightMode ? 'text-[#52607a]' : 'text-[#9cadc5]'}`}>
          <FiShield size={16} className="text-[#16a34a]" />
          <span>Your data is secure and only accessible to administrators.</span>
        </div>
      </div>

      {/* Format guide */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div
          className={`rounded-[14px] border p-4 shadow-[0_12px_28px_rgba(21,34,66,0.04)] ${
            lightMode ? 'border-[#dfe6f1] bg-white' : 'border-[#223650] bg-[#0d1b2e]'
          }`}
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-[14px] border border-[#ffd8c7] bg-[#ffe2d6] text-[#ff4a13]">
                  <FiArchive size={18} />
                </div>
                <h3 className={`text-[14px] font-bold ${lightMode ? 'text-[#0d1d36]' : 'text-white'}`}>Restaurant CSV columns</h3>
              </div>
              <code
                className={`mt-4 block p-3 rounded-lg font-mono text-xs leading-relaxed ${
                  lightMode ? 'bg-[#fafaf8] text-gray-800' : 'bg-[#07111f] text-[#dce5f4]'
                }`}
              >
                Name, Links, Cost, Collections, Cuisines, Timings
              </code>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5 pt-1.5 sm:grid-cols-1">
            <div className={`flex items-center justify-between text-[12px] font-semibold ${lightMode ? 'text-[#52607a]' : 'text-[#9cadc5]'}`}>
              <span className="inline-flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full border border-[#d4f5de] bg-[#e7fbf0] text-[#16a34a]">
                  <FiCheckCircle size={12} />
                </span>
                Total Columns
              </span>
              <span className={lightMode ? 'text-[#0d1d36]' : 'text-white/90'}>{6}</span>
            </div>

            <div className={`flex items-center justify-between text-[12px] font-semibold ${lightMode ? 'text-[#52607a]' : 'text-[#9cadc5]'}`}>
              <span className="inline-flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full border border-[#d7e6ff] bg-[#e2ebff] text-[#3b82f6]">
                  <FiFileText size={12} />
                </span>
                File Format
              </span>
              <span className={lightMode ? 'text-[#0d1d36]' : 'text-white/90'}>CSV</span>
            </div>

            <div className={`flex items-center justify-between text-[12px] font-semibold ${lightMode ? 'text-[#52607a]' : 'text-[#9cadc5]'}`}>
              <span className="inline-flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full border border-[#ead7ff] bg-[#efdfff] text-[#a855f7]">
                  <FiInfo size={12} />
                </span>
                Encoding
              </span>
              <span className={lightMode ? 'text-[#0d1d36]' : 'text-white/90'}>UTF-8</span>
            </div>
          </div>
        </div>

        <div
          className={`rounded-[14px] border p-4 shadow-[0_12px_28px_rgba(21,34,66,0.04)] ${
            lightMode ? 'border-[#dfe6f1] bg-white' : 'border-[#223650] bg-[#0d1b2e]'
          }`}
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-[14px] border border-[#eadbff] bg-[#efdfff] text-[#a855f7]">
                  <FiFileText size={18} />
                </div>
                <h3 className={`text-[14px] font-bold ${lightMode ? 'text-[#0d1d36]' : 'text-white'}`}>Reviews CSV columns</h3>
              </div>
              <code
                className={`mt-4 block p-3 rounded-lg font-mono text-xs leading-relaxed ${
                  lightMode ? 'bg-[#fafaf8] text-gray-800' : 'bg-[#07111f] text-[#dce5f4]'
                }`}
              >
                Restaurant, Reviewer, Review, Rating, Metadata, Time, Pictures
              </code>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5 pt-1.5 sm:grid-cols-1">
            <div className={`flex items-center justify-between text-[12px] font-semibold ${lightMode ? 'text-[#52607a]' : 'text-[#9cadc5]'}`}>
              <span className="inline-flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full border border-[#d4f5de] bg-[#e7fbf0] text-[#16a34a]">
                  <FiCheckCircle size={12} />
                </span>
                Total Columns
              </span>
              <span className={lightMode ? 'text-[#0d1d36]' : 'text-white/90'}>{7}</span>
            </div>

            <div className={`flex items-center justify-between text-[12px] font-semibold ${lightMode ? 'text-[#52607a]' : 'text-[#9cadc5]'}`}>
              <span className="inline-flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full border border-[#d7e6ff] bg-[#e2ebff] text-[#3b82f6]">
                  <FiFileText size={12} />
                </span>
                File Format
              </span>
              <span className={lightMode ? 'text-[#0d1d36]' : 'text-white/90'}>CSV</span>
            </div>

            <div className={`flex items-center justify-between text-[12px] font-semibold ${lightMode ? 'text-[#52607a]' : 'text-[#9cadc5]'}`}>
              <span className="inline-flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full border border-[#ead7ff] bg-[#efdfff] text-[#a855f7]">
                  <FiInfo size={12} />
                </span>
                Encoding
              </span>
              <span className={lightMode ? 'text-[#0d1d36]' : 'text-white/90'}>UTF-8</span>
            </div>
          </div>
        </div>
      </section>

      {/* Note */}
      <div
        className={`mt-5 rounded-[16px] border px-5 py-4 shadow-[0_12px_28px_rgba(21,34,66,0.03)] ${
          lightMode ? 'border-[#dfe6f1] bg-white' : 'border-[#223650] bg-[#0d1b2e]'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full border border-[#d7e6ff] bg-[#e2ebff] text-[#3b82f6]">
            <FiInfo size={18} />
          </div>
          <div>
            <div className={`text-[13px] font-bold ${lightMode ? 'text-[#0d1d36]' : 'text-white'}`}>Note</div>
            <div className={`mt-1 text-[12px] font-semibold leading-relaxed ${lightMode ? 'text-[#5b677f]' : 'text-[#9cadc5]'}`}>
              Make sure your CSV files follow the correct format. Incorrect columns may lead to errors during analysis.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}