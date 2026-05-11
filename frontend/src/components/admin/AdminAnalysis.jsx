import { useEffect, useRef, useState } from 'react'
import {
  FiBarChart2,
  FiCpu,
  FiPieChart,
  FiPlay,
  FiRefreshCcw,
} from 'react-icons/fi'
import { analysisService } from '../../services/api'

const STAR = '\u2605'
const INR = '\u20b9'

const CLUSTER_LABELS = ['Premium Dining', 'Budget Gems', 'Popular Mid-Range', 'Disappointing']
const CLUSTER_COLORS = ['#7c3aed', '#16a34a', '#0891b2', '#dc2626']
const SENTIMENT_ROWS = [
  { key: 'very_positive', label: `Very Positive (${STAR.repeat(5)})`, color: '#22c55e' },
  { key: 'positive', label: `Positive (${STAR.repeat(4)})`, color: '#84cc16' },
  { key: 'neutral', label: `Neutral (${STAR.repeat(3)})`, color: '#f59e0b' },
  { key: 'negative', label: `Negative (${STAR.repeat(2)})`, color: '#f97316' },
  { key: 'very_negative', label: `Very Negative (${STAR})`, color: '#ef4444' },
]

function FlaskIllustration() {
  return (
    <div className="relative mx-auto h-[150px] w-[190px]">
      <div className="absolute left-1/2 top-3 h-[118px] w-[118px] -translate-x-1/2 rounded-full bg-[#ffb36b]/25" />
      <div className="absolute left-1/2 top-10 h-7 w-8 -translate-x-1/2 rounded-b-md border-x-[6px] border-b-[6px] border-white bg-[#ff6a21]" />
      <div className="absolute left-1/2 top-[62px] h-[66px] w-[82px] -translate-x-1/2 rounded-b-[18px] border-[6px] border-white bg-[#ff6a21] shadow-[0_12px_24px_rgba(255,94,28,0.2)] [clip-path:polygon(32%_0,68%_0,100%_100%,0_100%)]" />
      <div className="absolute left-[74px] top-[77px] h-2 w-2 rounded-full bg-white/90" />
      <div className="absolute left-[110px] top-[95px] h-2.5 w-2.5 rounded-full bg-white/90" />
      <div className="absolute left-[91px] top-[104px] h-1.5 w-1.5 rounded-full bg-white/80" />
      <div className="absolute left-1/2 top-[34px] h-2 w-12 -translate-x-1/2 rounded-full bg-white" />
      <div className="absolute left-[34px] top-[68px] h-2 w-2 rotate-45 border border-[#ff6a21]" />
      <div className="absolute right-[34px] top-[74px] h-2 w-2 rotate-45 border border-[#ff6a21]" />
      <div className="absolute right-[46px] top-[44px] h-2 w-2 rotate-45 border border-[#8aa7ff]" />
      <div className="absolute left-[42px] top-[110px] h-2 w-2 rotate-45 border border-[#16a34a]" />
    </div>
  )
}

function Dots({ side = 'left' }) {
  return (
    <div className={`absolute top-10 grid grid-cols-6 gap-3 opacity-50 ${side === 'left' ? 'left-12' : 'right-12 top-[150px]'}`}>
      {Array.from({ length: 42 }).map((_, index) => (
        <span key={index} className="h-1 w-1 rounded-full bg-[#cbd5e1]" />
      ))}
    </div>
  )
}

function FeatureItem({ icon, title, text, divider, lightMode }) {
  return (
    <div
      className={`flex flex-1 items-start gap-4 px-5 py-4 ${
        divider
          ? lightMode ? 'border-l border-[#e5eaf2]' : 'border-l border-[#223650]'
          : ''
      }`}
    >
      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-[10px] ${lightMode ? 'bg-[#fff0e7] text-[#ff5a1f]' : 'bg-[#2a110b]/70 text-[#ff6a21]'}`}>
        {icon}
      </div>
      <div>
        <h4 className={`text-[13px] font-bold ${lightMode ? 'text-[#0d1d36]' : 'text-white'}`}>{title}</h4>
        <p className={`mt-1 text-[12px] leading-relaxed ${lightMode ? 'text-[#5b677f]' : 'text-[#9cadc5]'}`}>{text}</p>
      </div>
    </div>
  )
}

export default function AdminAnalysis() {
  const lightMode = localStorage.getItem('zl_theme') !== 'dark'
  const [status, setStatus] = useState(null)
  const [results, setResults] = useState(null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')
  const scatterRef = useRef(null)
  const chartInst = useRef(null)

  const fetchResults = async () => {
    try {
      setResults(await analysisService.getResults())
    } catch {}
  }

  useEffect(() => {
    if (!running) return undefined

    const id = setInterval(async () => {
      try {
        const nextStatus = await analysisService.getStatus()
        setStatus(nextStatus)
        if (!nextStatus.running) {
          setRunning(false)
          if (nextStatus?.error) setError(nextStatus.error)
          if (nextStatus.completed) fetchResults()
        }
      } catch {}
    }, 1000)

    return () => clearInterval(id)
  }, [running])

  const runAnalysis = async () => {
    setError('')
    setRunning(true)
    setStatus({ running: true, progress: 0 })

    try {
      await analysisService.run()
    } catch (err) {
      setError(err.message)
      setRunning(false)
    }
  }

  useEffect(() => {
    if (!results?.clusters?.length || !window.Chart || !scatterRef.current) return undefined

    chartInst.current?.destroy()
    chartInst.current = new window.Chart(scatterRef.current, {
      type: 'scatter',
      data: {
        datasets: results.clusters.map((cluster, index) => ({
          label: cluster.label || CLUSTER_LABELS[index] || `Cluster ${index}`,
          data: [{ x: cluster.avg_cost, y: cluster.avg_rating }],
          backgroundColor: `${CLUSTER_COLORS[index]}99`,
          borderColor: CLUSTER_COLORS[index],
          pointRadius: Math.max(Math.sqrt(cluster.count || 1) * 4, 8),
          pointHoverRadius: Math.max(Math.sqrt(cluster.count || 1) * 5, 10),
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: { display: true, text: `Avg Cost (${INR})`, color: '#5b677f', font: { size: 11 } },
            min: 0,
            max: 3000,
            ticks: { color: '#5b677f', font: { size: 11 } },
            grid: { color: 'rgba(91, 103, 127, 0.12)' },
          },
          y: {
            title: { display: true, text: 'Avg Rating', color: '#5b677f', font: { size: 11 } },
            min: 2,
            max: 5.5,
            ticks: { color: '#5b677f', font: { size: 11 } },
            grid: { color: 'rgba(91, 103, 127, 0.12)' },
          },
        },
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } },
        },
      },
    })

    return () => chartInst.current?.destroy()
  }, [results])

  const totalSentiment = results
    ? Object.values(results.sentiment_breakdown || {}).reduce((sum, value) => sum + value, 0) || 1
    : 1

  const cardBase = lightMode ? 'border-[#dfe6f1] bg-white' : 'border-[#223650] bg-[#0d1b2e]'
  const titleText = lightMode ? 'text-[#0d1d36]' : 'text-white'
  const mutedText = lightMode ? 'text-[#5b677f]' : 'text-[#9cadc5]'
  const mutedText2 = lightMode ? 'text-[#7a869c]' : 'text-[#9cadc5]'

  return (
    <div className="mx-auto max-w-[1120px] pb-5">
      <header className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className={`text-[24px] font-black tracking-[-0.02em] ${titleText}`}>
            Analysis <span className="text-[#ff5a1f]">+</span>
          </h1>
          <p className={`mt-2 text-[14px] font-medium ${mutedText}`}>
            Lexicon-based sentiment analysis + K-Means clustering on all restaurant reviews
          </p>
        </div>
      </header>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="inline-flex h-12 items-center gap-3 rounded-[10px] bg-[#ff4a13] px-6 text-[14px] font-bold text-white shadow-[0_14px_26px_rgba(255,74,19,0.24)] transition hover:enabled:bg-[#e43e0d] disabled:cursor-not-allowed disabled:opacity-65"
          onClick={runAnalysis}
          disabled={running}
        >
          {running ? (
            <>
              <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              Running...
            </>
          ) : (
            <>
              <FiPlay fill="currentColor" size={17} />
              Run Analysis
            </>
          )}
        </button>

        {results && (
          <button
            type="button"
            className={`inline-flex h-12 items-center gap-2 rounded-[10px] border px-5 text-[13px] font-bold transition ${
              lightMode
                ? 'border-[#dce3ee] bg-white text-[#4b5870] hover:bg-[#f7f9fc]'
                : 'border-[#223650] bg-[#0d1b2e] text-[#dce5f4] hover:bg-[#12233a]'
            }`}
            onClick={() => {
              setResults(null)
              setStatus(null)
            }}
          >
            <FiRefreshCcw size={15} />
            Reset
          </button>
        )}
      </div>

      {running && status && (
        <div
          className={`mb-4 rounded-[12px] border p-4 ${
            lightMode ? 'border-[#ffd3c4] bg-white' : 'border-[#223650] bg-[#0d1b2e]'
          }`}
        >
          <div className="mb-2 flex items-center justify-between text-[12px] font-bold text-[#ff4a13]">
            <span>Processing restaurant reviews</span>
            <span>{status.progress ?? 0}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#ffe5db]">
            <div className="h-full rounded-full bg-[#ff4a13] transition-all duration-500" style={{ width: `${status.progress ?? 0}%` }} />
          </div>
        </div>
      )}

      {error && (
        <div
          className={`mb-4 rounded-[10px] border px-4 py-3 text-[13px] font-semibold ${
            lightMode ? 'border-[#ffc5bc] bg-[#fff0ee] text-[#c0392b]' : 'border-[#ffc5bc]/30 bg-[#3a0f0f]/20 text-[#ff7a6a]'
          }`}
        >
          {error}
        </div>
      )}

      {!results && !running && (
        <section className={`relative overflow-hidden rounded-[18px] border px-7 py-9 text-center shadow-[0_16px_42px_rgba(21,34,66,0.06)] ${cardBase}`}>
          <Dots side="left" />
          <Dots side="right" />

          <FlaskIllustration />

          <h2 className={`mt-2 text-[22px] font-black tracking-[-0.02em] ${titleText}`}>Ready to Analyze</h2>
          <p className={`mx-auto mt-3 max-w-[430px] text-[14px] leading-relaxed ${mutedText}`}>
            Click "Run Analysis" to perform sentiment scoring and restaurant clustering.
          </p>
          <div className="mx-auto mt-4 h-10 w-10 rounded-full border-r border-t border-dashed border-[#ff7a2b]" />

          <div className={`mx-auto mt-6 flex max-w-[920px] flex-col overflow-hidden rounded-[14px] border ${cardBase} text-left shadow-[0_12px_28px_rgba(21,34,66,0.04)] md:flex-row`}>
            <FeatureItem
              icon={<FiBarChart2 size={24} />}
              title="Lexicon-Based Sentiment"
              text="Analyze review sentiments using advanced lexicons."
              lightMode={lightMode}
            />
            <FeatureItem
              divider
              icon={<FiCpu size={24} />}
              title="K-Means Clustering"
              text="Group similar restaurants based on review patterns."
              lightMode={lightMode}
            />
            <FeatureItem
              divider
              icon={<FiPieChart size={24} />}
              title="Actionable Insights"
              text="Get data-driven insights to improve customer experience."
              lightMode={lightMode}
            />
          </div>
        </section>
      )}

      {results && (
        <div className="space-y-3.5">
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
            <div className={`rounded-[14px] border p-4 shadow-[0_12px_28px_rgba(21,34,66,0.04)] ${cardBase}`}>
              <h3 className={`mb-4 text-[14px] font-bold ${titleText}`}>Sentiment Distribution</h3>
              <div className="space-y-2.5">
                {SENTIMENT_ROWS.map((row) => {
                  const count = results.sentiment_breakdown?.[row.key] ?? 0
                  const pct = Math.round((count / totalSentiment) * 100)

                  return (
                    <div key={row.key} className="flex items-center gap-2.5">
                      <span className={`min-w-[145px] text-[11px] font-medium ${mutedText}`}>{row.label}</span>
                      <div className={`h-2 flex-1 overflow-hidden rounded-full ${lightMode ? 'bg-[#eef2f7]' : 'bg-[#12233a]'}`}>
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: row.color }} />
                      </div>
                      <span className="min-w-[34px] text-right text-[11px] font-black" style={{ color: row.color }}>{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className={`rounded-[14px] border p-4 shadow-[0_12px_28px_rgba(21,34,66,0.04)] ${cardBase}`}>
              <h3 className={`mb-3 text-[14px] font-bold ${titleText}`}>Restaurant Clusters</h3>
              <div className={`divide-y ${lightMode ? 'divide-[#edf1f6]' : 'divide-[#223650]'}`}>
                {(results.clusters || []).map((cluster, index) => (
                  <div key={index} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
                    <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: CLUSTER_COLORS[index] }} />
                    <div className="min-w-0 flex-1">
                      <div className={`text-[12px] font-bold ${titleText}`}>{cluster.label || CLUSTER_LABELS[index]}</div>
                      <div className={`mt-0.5 text-[11px] font-medium ${mutedText2}`}>
                        {cluster.count} restaurants · {STAR} {cluster.avg_rating?.toFixed(1)} avg · {INR}{cluster.avg_cost?.toLocaleString()} avg cost
                      </div>
                    </div>
                    <div className="text-[18px] font-black" style={{ color: CLUSTER_COLORS[index] }}>{cluster.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={`rounded-[14px] border p-4 shadow-[0_12px_28px_rgba(21,34,66,0.04)] ${cardBase}`}>
            <h3 className={`mb-3 text-[14px] font-bold ${titleText}`}>Cost vs. Rating Cluster Map</h3>
            <div className="relative h-[220px]">
              <canvas ref={scatterRef} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
            <div className={`rounded-[14px] border p-4 shadow-[0_12px_28px_rgba(21,34,66,0.04)] ${cardBase}`}>
              <h3 className={`mb-3 text-[14px] font-bold ${titleText}`}>Top Keywords in Positive Reviews</h3>
              <div className="space-y-2">
                {(results.top_keywords || []).slice(0, 10).map((keyword, index) => (
                  <div key={keyword.word} className="flex items-center gap-2">
                    <span className="min-w-[16px] text-[11px] text-[#9aa5b8]">{index + 1}</span>
                    <div className={`relative h-5 flex-1 overflow-hidden rounded ${lightMode ? 'bg-[#f2f5f9]' : 'bg-[#12233a]'}`}>
                      <div
                        className="h-full rounded bg-[#ff4a13]/12 transition-all duration-500"
                        style={{ width: `${Math.round((keyword.count / (results.top_keywords[0]?.count || 1)) * 100)}%` }}
                      />
                      <span className={`absolute inset-y-0 left-2 flex items-center text-[11px] font-bold ${lightMode ? 'text-[#0d1d36]' : 'text-white'}`}>{keyword.word}</span>
                    </div>
                    <span className="min-w-[34px] text-right text-[11px] font-semibold text-[#7a869c]">{keyword.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`rounded-[14px] border p-4 shadow-[0_12px_28px_rgba(21,34,66,0.04)] ${cardBase}`}>
              <h3 className={`mb-3 text-[14px] font-bold ${titleText}`}>Cuisine Performance</h3>
              <div className={`divide-y ${lightMode ? 'divide-[#edf1f6]' : 'divide-[#223650]'}`}>
                {(results.cuisine_performance || []).slice(0, 10).map((cuisine) => (
                  <div key={cuisine.cuisine} className="flex items-center justify-between py-2 text-[12px] first:pt-0 last:pb-0">
                    <span className={`font-bold ${titleText}`}>{cuisine.cuisine}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-[11px] font-medium text-[#7a869c]">{cuisine.count} units</span>
                      <span
                        className="w-[42px] text-right font-black"
                        style={{ color: cuisine.avg_rating >= 4 ? '#22c55e' : cuisine.avg_rating >= 3.5 ? '#f59e0b' : '#ef4444' }}
                      >
                        {STAR} {cuisine.avg_rating?.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
