import { useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import ScaleToFit from '@/components/ScaleToFit'
import { useInView } from '@/hooks/useInView'

/*
 * "Benefits estimator · Transport for London": a one-page value report for
 * executives. Designed at 1200px wide and scaled to fit. The reduction inputs
 * are live and recalculate every savings figure.
 */

const DESIGN_WIDTH = 1200

const DRIVERS = [
  { name: 'Work planning', costPerYear: 8, note: 'Less time scheduling jobs and assigning maintenance crews.' },
  { name: 'Failure prevention', costPerYear: 6, note: 'Predict faults before assets fail.' },
  { name: 'Contract admin', costPerYear: 4, note: 'Use shared records across contracts.' },
  { name: 'Reporting', costPerYear: 3, note: 'Reduce manual data consolidation.' },
]
const YEARS = 10

const PRIORITIES = [
  {
    title: 'Maximo Intelligence adoption',
    detail: '24% of eligible accounts active in Q4; expand AI use across the installed base.',
    urgent: true,
  },
  { title: 'ALM cross-sell opportunity', detail: '$48M pipeline · 12 qualified deals' },
  { title: 'Manage drives suite expansion', detail: '78% usage · Prioritize renewals' },
  { title: 'Predict adoption needs focus', detail: '22% usage · Scale customer pilots' },
]

// Pipeline chart, values in $M per week (W01–W13). Actuals run to W04 ("today").
const WEEKS = 13
const TODAY = 3
const REVIEW = 5
const SERIES = {
  supply: { color: '#2E8B6A', values: [269, 269, 269, 269, 273, 329, 341, 351, 359, 366, 373, 381, 391] },
  salesActual: { color: '#3A5BF0', values: [51, 89, 127, 159] },
  salesForecast: { color: '#3A5BF0', values: [159, 172, 202, 245, 288, 314, 334, 351, 367, 383], from: TODAY },
  demandActual: { color: '#3B8FA3', values: [81, 139, 167, 189] },
  demandForecast: { color: '#3B8FA3', values: [189, 209, 229, 251, 271, 289, 304, 317, 334, 351], from: TODAY },
  fulfilledForecast: { color: '#6D4CCC', values: [0, 107, 199, 261, 299, 329, 351, 378], from: REVIEW },
}
const BAND_HIGH = [159, 174, 206, 252, 299, 326, 346, 363, 381, 398]
const BAND_LOW = [159, 169, 195, 232, 268, 292, 310, 325, 340, 355]
const CALLOUTS = [
  { n: 1, week: 5, value: 329, urgent: true },
  { n: 2, week: 7.6, value: 356 },
  { n: 3, week: 8.02, value: 358 },
  { n: 4, week: 9.39, value: 369 },
]

// Chart geometry (SVG units = design px)
const PLOT_LEFT = 36
const PLOT_RIGHT = 556
const PLOT_TOP = 26
const PLOT_BOTTOM = 259
const STEP = (PLOT_RIGHT - PLOT_LEFT) / (WEEKS - 1)
const x = (week: number) => PLOT_LEFT + week * STEP
const y = (value: number) => PLOT_TOP + ((500 - value) / 500) * (PLOT_BOTTOM - PLOT_TOP)
const points = (values: number[], from = 0) => values.map((v, i) => `${x(from + i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')

const money = (millions: number) => `${Number(millions.toFixed(1))}M`
const percent = (fraction: number) => `${(fraction * 100).toFixed(1)}%`

function Rise({
  play,
  delay,
  children,
  className = '',
}: {
  play: boolean
  delay: number
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`${play ? 'animate-rise' : 'opacity-0'} ${className}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

function BlockHeader({ index, title, aside }: { index: string; title: string; aside?: string }) {
  return (
    <div className="flex items-baseline pt-2.5 text-[13.33px] leading-[16.67px]">
      <span className="w-8 shrink-0 text-[10px] text-[#525252]">{index}</span>
      <span className="flex-1">{title}</span>
      {aside && <span className="w-[275px]">{aside}</span>}
    </div>
  )
}

function Metric({
  index,
  label,
  prefix,
  value,
  note,
  dashed = false,
}: {
  index: string
  label: string
  prefix: string
  value: string
  note: string
  dashed?: boolean
}) {
  return (
    <div className={`border-t border-[#161616] pt-2.5 ${dashed ? 'border-dashed' : ''}`}>
      <p className="text-[10px] leading-[13.33px] text-[#525252]">{index}</p>
      <p className="text-[13.33px] leading-[16.67px]">{label}</p>
      <p className="mt-[27px] flex items-start font-medium">
        <span className="text-[39.17px] leading-[39px] font-semibold">{prefix}</span>
        <span className="text-[60px] leading-[60px] tabular-nums">{value}</span>
      </p>
      <p className="text-[11.67px] leading-[16.67px] text-[#525252]">{note}</p>
    </div>
  )
}

function Marker({ n, urgent = false }: { n: number; urgent?: boolean }) {
  return (
    <span
      className={`mt-0.5 grid size-[16.67px] shrink-0 place-items-center rounded-full border text-[9.17px] leading-none font-semibold ${
        urgent ? 'border-[#DA1E28] bg-[#DA1E28] text-white' : 'border-[#161616] bg-white text-[#161616]'
      }`}
    >
      {n}
    </span>
  )
}

function PipelineChart({ play }: { play: boolean }) {
  const clipId = `pipeline-reveal-${useId().replace(/:/g, '')}`
  const forecast = { strokeDasharray: '4 3.2' }
  const line = { fill: 'none', strokeWidth: 1.67, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
  return (
    <svg viewBox="0 0 572 285" className="mt-3 block w-[572px] overflow-visible font-plex" role="img" aria-labelledby={`${clipId}-title`}>
      <title id={`${clipId}-title`}>
        Pipeline value by week: supply, sales and demand rising from roughly $50–270M to $350–390M by W13, with
        fulfilment starting at the W06 review.
      </title>
      <defs>
        <clipPath id={clipId}>
          <rect
            x={PLOT_LEFT - 6}
            y="0"
            width={PLOT_RIGHT - PLOT_LEFT + 12}
            height="285"
            className={`origin-left [transform-box:fill-box] ${play ? 'animate-reveal-x' : 'scale-x-0'}`}
          />
        </clipPath>
      </defs>

      {[0, 100, 200, 300, 400, 500].map((v) => (
        <g key={v}>
          <line x1={PLOT_LEFT} x2={PLOT_RIGHT} y1={y(v)} y2={y(v)} stroke="#e0e0e0" strokeWidth={1} />
          <text x={PLOT_LEFT - 10} y={y(v) + 3.5} textAnchor="end" fontSize={10} fill="#525252">
            {v}
          </text>
        </g>
      ))}
      {Array.from({ length: WEEKS }, (_, i) => (
        <text key={i} x={x(i)} y={277} textAnchor="middle" fontSize={10} fill="#525252">
          W{String(i + 1).padStart(2, '0')}
        </text>
      ))}

      <line x1={x(TODAY)} x2={x(TODAY)} y1={4} y2={PLOT_BOTTOM} stroke="#161616" strokeWidth={1.2} />
      <text x={x(TODAY) + 3} y={10} fontSize={8.33} fill="#525252">
        TODAY
      </text>
      <line x1={x(REVIEW)} x2={x(REVIEW)} y1={4} y2={PLOT_BOTTOM} stroke="#525252" strokeWidth={0.83} strokeDasharray="2.5 2.5" />
      <text x={x(REVIEW) + 3} y={10} fontSize={8.33} fill="#525252">
        REVIEW
      </text>

      <g clipPath={`url(#${clipId})`}>
        <polygon
          points={`${points(BAND_HIGH, TODAY)} ${bandLowReversed()}`}
          fill="#3A5BF0"
          fillOpacity={0.16}
        />
        <polyline points={points(SERIES.supply.values)} stroke={SERIES.supply.color} {...line} />
        <polyline points={points(SERIES.salesActual.values)} stroke={SERIES.salesActual.color} {...line} />
        <polyline points={points(SERIES.demandActual.values)} stroke={SERIES.demandActual.color} {...line} />
        {(['salesForecast', 'demandForecast', 'fulfilledForecast'] as const).map((key) => (
          <polyline
            key={key}
            points={points(SERIES[key].values, SERIES[key].from)}
            stroke={SERIES[key].color}
            {...line}
            style={forecast}
          />
        ))}
        {[SERIES.supply.values[TODAY], SERIES.salesActual.values[TODAY], SERIES.demandActual.values[TODAY]].map((v, i) => (
          <circle
            key={i}
            cx={x(TODAY)}
            cy={y(v)}
            r={2.8}
            fill="white"
            strokeWidth={1.67}
            stroke={[SERIES.supply.color, SERIES.salesActual.color, SERIES.demandActual.color][i]}
          />
        ))}
        {CALLOUTS.map((c) => (
          <g key={c.n}>
            <circle
              cx={x(c.week)}
              cy={y(c.value)}
              r={8}
              fill={c.urgent ? '#DA1E28' : 'white'}
              stroke={c.urgent ? '#DA1E28' : '#161616'}
              strokeWidth={0.83}
            />
            <text
              x={x(c.week)}
              y={y(c.value) + 3.2}
              textAnchor="middle"
              fontSize={9.17}
              fontWeight={600}
              fill={c.urgent ? 'white' : '#161616'}
            >
              {c.n}
            </text>
          </g>
        ))}
      </g>
    </svg>
  )
}

function bandLowReversed() {
  return BAND_LOW.map((v, i) => ({ v, week: TODAY + i }))
    .reverse()
    .map(({ v, week }) => `${x(week).toFixed(1)},${y(v).toFixed(1)}`)
    .join(' ')
}

export default function BenefitsReport() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, 0.2)
  const [run, setRun] = useState(0)
  const [reductions, setReductions] = useState(() => DRIVERS.map(() => 10))

  const rows = DRIVERS.map((driver, i) => {
    const savedPerYear = (driver.costPerYear * reductions[i]) / 100
    return { ...driver, savedPerYear, total: savedPerYear * YEARS }
  })
  const total = rows.reduce((sum, row) => sum + row.total, 0)
  const largest = Math.max(...rows.map((row) => row.total), 0.0001)

  const setReduction = (index: number, raw: string) => {
    const value = Math.min(100, Math.max(0, Number(raw) || 0))
    setReductions((current) => current.map((r, i) => (i === index ? value : r)))
  }

  return (
    <section aria-labelledby="benefits-report">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-[24.5rem] type-caption text-ink">
          <h3 id="benefits-report" className="font-bold">
            Extra: Benefits report for Executives
          </h3>
          <p className="mt-0.5">
            A sales and value-case piece for IBM Maximo, which can be downloaded and prepared in one printable page, it
            shows an executive why expanding Maximo is worth it.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRun((n) => n + 1)}
          className="self-start type-caption text-muted uppercase transition-colors hover:text-accent sm:self-auto"
        >
          (Click to replay)
        </button>
      </div>

      <ScaleToFit width={DESIGN_WIDTH} minScale={0.55} className="mt-[52px]">
        <div ref={ref} className="bg-white p-5 pb-[43px] font-plex text-[#161616]">
          {/* Remounting on replay restarts every animation. */}
          <div key={run}>
              <Rise play={inView} delay={0}>
                <div className="grid grid-cols-[274px_275px_275px_1fr] gap-x-[20.5px] border-b border-[#161616] pt-1.5 pb-[11px] text-[10px] leading-[13.33px] text-[#525252]">
                  <p className="text-[#161616]">Benefits estimator · Transport for London</p>
                  <p>IBM Maximo • 10-year planning horizon</p>
                  <p>TfL facts + illustrative model assumptions</p>
                </div>
              </Rise>

              <Rise play={inView} delay={120} className="mt-[46px] grid grid-cols-[569.5px_275px_1fr] gap-x-[20.5px]">
                <p className="max-w-[520px] font-plex-serif text-[41.67px] leading-[53.33px] tracking-[-0.01em]">
                  Transport for London projects{' '}
                  <span className="text-[#8a3ffc] underline decoration-1 underline-offset-[6px]">£{money(total)}</span>{' '}
                  savings over 10 years when using Maximo.
                </p>
                <div className="mt-3 max-w-[236px] space-y-5 text-[13.33px] leading-5">
                  <p>TfL brought Underground maintenance onto one platform and one asset team. It now plans to extend this approach to roads, buses and other assets.</p>
                  <p>The Underground projects £21M in savings over 10 years. The breakdown below is illustrative, not a TfL forecast.</p>
                  <p>Maximo supports about 10,000 field technicians. TfL needs better asset data to predict failures and reduce outage-related emissions as it works towards its net zero target for 2040.</p>
                </div>
              </Rise>

              <Rise play={inView} delay={240} className="mt-[60px] grid grid-cols-[274px_275px_275px_1fr] gap-x-[20.5px]">
                <Metric index="01" label="Projected savings" prefix="£" value={money(total)} note="Underground · Over 10 years" />
                <Metric
                  index="02"
                  label="Annual average"
                  prefix="£"
                  value={money(total / YEARS)}
                  note={`£${money(total)} ÷ ${YEARS} · Not annual cash flow`}
                />
                <Metric index="03" label="Field technicians" prefix="~" value="10K" note="Supported by IBM Maximo" dashed />
                <div aria-hidden="true" className="grid size-[68px] place-items-center border border-dashed border-[#8d8d8d] text-xl font-light text-[#161616]">
                  +
                </div>
              </Rise>

              <Rise play={inView} delay={360} className="mt-[60px] grid grid-cols-[569.5px_1fr] gap-x-[40.5px]">
                <div className="border-t border-[#161616]">
                  <BlockHeader index="05" title="Pipeline value, $M" aside="Q4 2026" />
                  <PipelineChart play={inView} />
                </div>
                <div className="border-t border-[#161616]">
                  <BlockHeader index="06" title="Executive priorities" />
                  <ol className="mt-[27px] grid grid-cols-2 gap-x-5 gap-y-[38px] pl-1.5">
                    {PRIORITIES.map((p, i) => (
                      <li key={p.title} className="flex gap-2 text-[11.67px] leading-[16.67px]">
                        <Marker n={i + 1} urgent={p.urgent} />
                        <div className="max-w-[245px]">
                          <p className="font-semibold">{p.title}</p>
                          <p className="text-[#525252]">{p.detail}</p>
                          {p.urgent && (
                            <div aria-hidden="true" className="mt-2 flex gap-2 font-medium">
                              <span className="rounded-full bg-[#202225] px-3 py-1 text-white">Review adoption</span>
                              <span className="rounded-full border border-[#202225] px-3 py-[3px] text-[#202225]">Why?</span>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </Rise>

              <Rise play={inView} delay={480} className="mt-[60px] border-t border-[#161616]">
                <BlockHeader index="07" title="Illustrative savings breakdown" />
                <table className="mt-7 w-full table-fixed border-collapse text-left text-[11.67px] leading-[15px]">
                  <colgroup>
                    <col className="w-[36px]" />
                    <col className="w-[176px]" />
                    <col className="w-[108px]" />
                    <col className="w-[84px]" />
                    <col className="w-[99px]" />
                    <col className="w-[175px]" />
                    <col className="w-[134px]" />
                    <col className="w-[241px]" />
                    <col />
                  </colgroup>
                  <thead className="text-[#525252]">
                    <tr className="border-b border-[#8d8d8d]">
                      <th colSpan={2} className="pb-2.5 pl-2.5 font-normal">Benefit driver</th>
                      <th className="pb-2.5 font-normal">Cost / yr</th>
                      <th className="pb-2.5 font-normal">Saved / yr</th>
                      <th className="pb-2.5 font-normal">Reduction</th>
                      <th className="pb-2.5 font-normal">10-year savings</th>
                      <th className="pb-2.5 font-normal">Share of total</th>
                      <th className="pb-2.5 font-normal">Assumption · Constant annual savings</th>
                      <th className="pb-2.5 font-normal">Basis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={row.name} className="h-[43.5px] border-b border-[#e0e0e0]">
                        <td className="pl-2.5" aria-hidden="true">
                          <svg viewBox="0 0 11 11" className="size-[13.33px]">
                            <path d="M5.5 7.6 2.1 4.2l.5-.5 2.9 3 3-3 .5.5z" fill="#161616" />
                          </svg>
                        </td>
                        <th scope="row" className="font-normal">{row.name}</th>
                        <td>£{money(row.costPerYear)}</td>
                        <td className="tabular-nums">£{money(row.savedPerYear)}</td>
                        <td>
                          <label className="flex h-7 w-[65px] items-center justify-center rounded-sm border border-[#161616] focus-within:outline-2 focus-within:outline-[#0f62fe]">
                            <span className="sr-only">{row.name} reduction, percent</span>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={reductions[i]}
                              onChange={(event) => setReduction(i, event.target.value)}
                              className="w-6 [appearance:textfield] bg-transparent text-right tabular-nums outline-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            %
                          </label>
                        </td>
                        <td>
                          <span className="flex items-center gap-6">
                            <span className="flex w-[90px] justify-end" aria-hidden="true">
                              <span
                                className="h-[7px] rounded-[1px] bg-[#3A5BF0] transition-[width] duration-500"
                                style={{ width: `${Math.max(3, (row.total / largest) * 36)}px` } as CSSProperties}
                              />
                            </span>
                            <span className="tabular-nums">£{money(row.total)}</span>
                          </span>
                        </td>
                        <td className="tabular-nums">{total ? percent(row.total / total) : '—'}</td>
                        <td className="pr-6">{row.note}</td>
                        <td>Model</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Rise>
          </div>
        </div>
      </ScaleToFit>
    </section>
  )
}
