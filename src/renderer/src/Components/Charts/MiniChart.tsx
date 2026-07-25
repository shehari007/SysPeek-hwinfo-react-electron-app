import { useEffect, useMemo, useRef, useState } from 'react'
import UplotReact from 'uplot-react'
import uPlot from 'uplot'
import 'uplot/dist/uPlot.min.css'

interface MiniChartProps {
  data: number[]
  color?: string
  height?: number
  max?: number
  fill?: boolean
}

// A dependency-light streaming sparkline. uPlot needs explicit pixel dimensions,
// so we track the container width with a ResizeObserver and feed it a ring
// buffer of samples maintained by the parent.
export default function MiniChart({
  data,
  color = '#7cc4ff',
  height = 60,
  max,
  fill = true
}: MiniChartProps): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0
      setWidth(Math.max(0, Math.floor(w)))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Memoize the options so uplot-react only pushes new data (setData) instead of
  // tearing down and rebuilding the chart on every telemetry tick.
  const options = useMemo<uPlot.Options>(
    () => ({
      width: width || 200,
      height,
      cursor: { show: false },
      legend: { show: false },
      scales: { x: { time: false }, y: max ? { range: [0, max] } : { auto: true } },
      axes: [{ show: false }, { show: false }],
      series: [
        {},
        {
          stroke: color,
          width: 2,
          fill: fill ? `${color}22` : undefined,
          points: { show: false }
        }
      ],
      padding: [6, 0, 2, 0]
    }),
    [width, height, max, color, fill]
  )

  const chartData = useMemo<uPlot.AlignedData>(
    () => [data.map((_, i) => i), data],
    [data]
  )

  return (
    <div ref={ref} className="mini-chart">
      {width > 0 && data.length > 1 && <UplotReact options={options} data={chartData} />}
    </div>
  )
}
