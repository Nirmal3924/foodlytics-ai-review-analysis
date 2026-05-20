export default function EmptyPanel({ title, subtitle }) {
  return (
    <div className="py-14 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
      <div className="mx-auto max-w-xl px-6">
        <div className="text-gray-900 text-lg font-bold">{title}</div>
        <div className="mt-2 text-sm text-gray-500 leading-relaxed">{subtitle}</div>
      </div>
    </div>
  )
}
