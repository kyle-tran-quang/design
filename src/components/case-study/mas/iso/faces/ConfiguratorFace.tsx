import type { CSSProperties } from 'react'
import { configuratorAssets } from './configuratorAssets'

/**
 * The IBM Sales Configurator screen (Figma "v2", node 497:14414) as plain markup, extracted from the Maximo
 * cinematic (MASCaseStudyCinematicStandalone.tsx) without its generation runtime. Fixed 1200 x 916 design px.
 *
 * Built for CSS 3D. Each piece that sits at its own height is a "leaf" carrying data-a (role), data-z (height in
 * px) and data-i (order); the showcase engine animates leaves and lifts them. Rules this markup keeps:
 *  - every ancestor of a lifted leaf is `preserve-3d`, and none of them has overflow, opacity or a filter;
 *  - opacity is only ever applied to leaves, which have no 3D children of their own.
 */

export const FACE_W = 1200
/** Measured: the 48px header, the body and the 80px footer. */
export const FACE_H = 928

const img = (name: string) => configuratorAssets[name] ?? ''
const P3D: CSSProperties = { transformStyle: 'preserve-3d' }
const lift = (z: number): CSSProperties => ({ transformStyle: 'preserve-3d', transform: `translateZ(${z}px)` })
const leaf = (role: string, z: number, i = 0) => ({ 'data-a': role, 'data-z': z, 'data-i': i })

/** Hard-offset shadow, one light from the upper left: it falls down and to the right, with a short soft edge. */
const cast = (x: number, y: number, blur = 5, alpha = 0.17) => `${x}px ${y}px ${blur}px rgba(66,80,112,${alpha})`

const INDUSTRIES = [
  ['Aviation', 'f1207.svg'],
  ['Nuclear', '23efe.svg'],
  ['Energy & Utilities', '1b0fc.svg'],
  ['Oil & Gas', 'e5d08.svg'],
  ['Transportation', '3790c.svg'],
  ['Civil Infrastructure', '05a38.svg'],
  ['Manufacturing', 'd94d9.svg'],
  ['Life Sciences', '81a3f.svg'],
  ['Government / Defense', 'ac2f9.svg'],
  ['Other', 'e337a.svg'],
] as const

const ENVIRONMENTS = [
  ['IBM Maximo Application Suite SaaS', 'IBM hosts and manages the infrastructure in the cloud.'],
  ['On-Premises', 'Customer hosts and manages in their own data center.'],
] as const

const NODES = [
  { t: 'Installation + Db', d: '10 AppPoints', c: '#0f62fe', bg: '#ffffff', cls: 'min-h-12 py-[6px]' },
  { t: 'Optimizer', d: '20 AppPoints | ', p: '$960', c: '#8d8d8d', bg: '#f4f4f4', cls: 'min-h-12 py-3' },
  { t: 'Scheduler', d: '50 AppPoints | ', p: '$1,480', c: '#009d9a', bg: '#d9fbfb', cls: 'min-h-12 py-3' },
  { t: 'Mobile', c: '#198038', bg: '#defbe6', cls: 'h-12 py-[15px]' },
  { t: 'Spatial', d: '100 AppPoints | ', p: '$3,480', c: '#ee5396', bg: '#fff0f7', cls: 'h-20 py-3' },
  { t: 'Manage', d: '200 AppPoints | ', p: '$6,480', c: '#a56eff', bg: '#f6f2ff', cls: 'h-40 py-3' },
] as const

const STEPS = ['Industry', 'Environment', 'Plan', 'Users mix', 'Contract']

function Tile({ role, i, label, sub, icon }: { role: string; i: number; label: string; sub?: string; icon?: string }) {
  return (
    <div
      {...leaf(role, 10, i)}
      className="flex min-h-16 min-w-0 items-center gap-4 bg-white py-2 pr-2 pl-4"
      style={{ boxShadow: `inset 0 -1px 0 #e0e0e0, ${cast(9, 5)}` }}
    >
      <img alt="" src={img('3c465.svg')} className="block size-4 shrink-0" />
      {icon && <img alt="" src={img(icon)} className="block size-4 shrink-0" />}
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <p className="text-[14px] leading-[18px] tracking-[0.16px]">{label}</p>
        {sub && <p className="text-[12px] leading-4 tracking-[0.32px] text-[#525252]">{sub}</p>}
      </div>
    </div>
  )
}

function MoreOptions({ i }: { i: number }) {
  return (
    <div
      {...leaf('more', 6, i)}
      className="flex w-full items-center gap-4 px-4 py-3"
      style={{ boxShadow: 'inset 0 1px 0 #e0e0e0' }}
    >
      <p className="min-w-0 flex-1 text-[14px] leading-5 tracking-[0.16px] whitespace-nowrap">More Options</p>
      <img alt="" src={img('4073e.svg')} className="block size-4 shrink-0" />
    </div>
  )
}

function StepHeading({ i, step, title }: { i: number; step: string; title: string }) {
  return (
    <div {...leaf('heading', 6, i)} className="flex w-full flex-col gap-2">
      <p className="text-[14px] leading-[18px] font-semibold tracking-[0.16px] whitespace-nowrap text-[#525252]">{step}</p>
      <h2 className="text-[20px] leading-7 font-normal whitespace-nowrap">{title}</h2>
    </div>
  )
}

export default function ConfiguratorFace() {
  return (
    <div className="flex w-[1200px] flex-col font-plex tracking-normal text-[#161616] antialiased" style={P3D}>
      {/* UI shell header */}
      <header
        {...leaf('header', 6)}
        className="flex h-12 shrink-0 items-center border-b border-[#c6c6c6] bg-[#f4f4f4]"
        style={{ boxShadow: cast(8, 5, 5, 0.14) }}
      >
        <span className="flex shrink-0 p-[14px]">
          <img alt="" src={img('7701b.svg')} className="block size-5" />
        </span>
        <p className="flex gap-[3px] pr-8 pl-2 text-[14px] leading-[18px] tracking-[0.16px] whitespace-nowrap">
          <span>IBM</span>
          <span className="font-semibold">Sales Configurator</span>
        </p>
        <div className="min-w-0 flex-1" />
        {['8557c.svg', 'b3f09.svg', 'a7fc8.svg'].map((n) => (
          <span key={n} className="flex shrink-0 p-[14px]">
            <img alt="" src={img(n)} className="block size-5" />
          </span>
        ))}
        <span className="flex shrink-0 items-center gap-2 px-4 py-[15px]">
          <span className="text-[14px] leading-[18px] tracking-[0.16px]">Maximo</span>
          <img alt="" src={img('259c6.svg')} className="block size-4" />
        </span>
      </header>

      <div className="flex" style={P3D}>
        {/* Configuration summary */}
        <section aria-label="Configuration summary" className="flex w-[400px] shrink-0 flex-col items-center gap-12 px-8 pt-8 pb-16" style={P3D}>
          <div className="flex w-full flex-col gap-6" style={P3D}>
            <div {...leaf('title', 6)} className="flex w-full flex-col">
              <p className="text-[16px] leading-[22px] whitespace-nowrap text-[#525252]">Configuration summary</p>
              <div className="flex items-center gap-2">
                <h1 className="font-plex-serif text-[28px] leading-9 font-normal whitespace-nowrap">Transport for London</h1>
                <span className="flex shrink-0 p-2">
                  <img alt="" src={img('e9c41.svg')} className="block size-4" />
                </span>
              </div>
            </div>
            <div {...leaf('stats', 6)} className="grid grid-cols-[repeat(2,minmax(0,170.67px))] gap-x-8">
              <div className="flex flex-col">
                <p className="flex items-end gap-[2px] whitespace-nowrap">
                  <span className="text-[20px] leading-7">$189,550</span>
                  <span className="text-[14px] leading-5 tracking-[0.16px]">/year</span>
                </p>
                <p className="font-plex-condensed text-[12px] leading-4 tracking-[0.32px] text-[#525252]">Estimated annual cost</p>
              </div>
              <div className="flex flex-col">
                <p className="text-[20px] leading-7">380</p>
                <p className="font-plex-condensed text-[12px] leading-4 tracking-[0.32px] text-[#525252]">AppPoints</p>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col items-start gap-4" style={P3D}>
            {/* The AppPoints tray sits above the base; its six nodes sit above the tray. */}
            <div className="relative flex w-[320px] items-center gap-2 p-2" style={lift(14)}>
              <div {...leaf('trayBg', 0)} className="absolute inset-0 bg-[#e8e8e8]" style={{ boxShadow: cast(12, 7, 6, 0.2) }} />
              <div {...leaf('trayBg', 0)} className="relative flex h-[22px] w-4 shrink-0 items-center justify-center">
                <span className="block -rotate-90 font-plex-condensed text-[12px] leading-4 font-bold tracking-[0.32px] whitespace-nowrap text-[#525252] opacity-50">
                  IBM
                </span>
              </div>
              <div className="relative flex min-w-0 flex-1 flex-col" style={P3D}>
                {NODES.map((n, i) => (
                  <div
                    key={n.t}
                    {...leaf('node', 9, i)}
                    className={`flex w-full shrink-0 flex-col border border-solid px-4 ${n.cls}`}
                    style={{ borderColor: n.c, background: n.bg, boxShadow: `inset 4px 0 0 ${n.c}, ${cast(8, 5, 4, 0.16)}` }}
                  >
                    <p className="text-[14px] leading-[18px] font-semibold tracking-[0.16px] text-black">{n.t}</p>
                    {'d' in n && (
                      <p className="text-[12px] leading-4 tracking-[0.32px] text-[#525252]">
                        {n.d}
                        {'p' in n && <span className="font-bold">{n.p}</span>}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div
              {...leaf('review', 18)}
              className="bg-[#393939] py-[7px] pr-16 pl-4 text-[14px] leading-[18px] tracking-[0.16px] whitespace-nowrap text-white"
              style={{ boxShadow: cast(9, 5, 4, 0.2) }}
            >
              Review estimate
            </div>
          </div>
        </section>

        {/* Steps */}
        <section
          aria-label="Configuration questions"
          className="flex min-w-0 flex-1 flex-col gap-12 pt-8 pr-8 pb-16 pl-4"
          style={{ ...P3D, boxShadow: 'inset 1px 0 0 #e0e0e0' }}
        >
          <div className="flex w-full flex-col gap-6" style={P3D}>
            <StepHeading i={0} step="Step 1" title="What industry is the customer in?" />
            <div className="grid w-full grid-cols-3 gap-2" style={P3D}>
              {INDUSTRIES.map(([label, icon], i) => (
                <Tile key={label} role="tile" i={i} label={label} icon={icon} />
              ))}
            </div>
            <MoreOptions i={0} />
          </div>
          <div className="flex w-full flex-col gap-6" style={P3D}>
            <StepHeading i={1} step="Step 2" title="Configure your customer’s SaaS environment" />
            <div className="grid w-full grid-cols-2 gap-2" style={P3D}>
              {ENVIRONMENTS.map(([label, sub], i) => (
                <Tile key={label} role="env" i={i} label={label} sub={sub} />
              ))}
            </div>
            <MoreOptions i={1} />
          </div>
        </section>

        {/* Step navigation */}
        <nav aria-label="Configuration steps" className="flex w-[200px] shrink-0 flex-col py-4 pr-8 pl-4" style={P3D}>
          <div className="flex w-[164px] flex-col" style={P3D}>
            {STEPS.map((label, i) => (
              <div
                key={label}
                {...leaf('tab', 7, i)}
                className={`relative flex h-16 w-[164px] shrink-0 items-center bg-[#f4f4f4] px-4 text-[14px] leading-[18px] tracking-[0.16px] ${
                  i === 0 ? 'font-semibold text-[#161616]' : 'text-[#525252]'
                }`}
                style={{ boxShadow: cast(7, 4, 4, 0.12) }}
              >
                <span aria-hidden className={`absolute top-0 left-0 h-16 w-[3px] ${i === 0 ? 'bg-[#0f62fe]' : 'bg-[#e0e0e0]'}`} />
                {i + 1}. {label}
              </div>
            ))}
          </div>
        </nav>
      </div>

      {/* Tearsheet footer */}
      <footer
        {...leaf('footer', 6)}
        className="flex h-20 shrink-0 gap-px border-t border-[#e0e0e0] bg-[#f4f4f4]"
        style={{ boxShadow: cast(8, 5, 5, 0.14) }}
      >
        <div className="min-w-0 flex-1" />
        <div className="w-[232px] bg-[#393939] p-4 text-[14px] leading-[18px] tracking-[0.16px] text-white">Back</div>
        <div className="w-[232px] bg-[#0f62fe] p-4 text-[14px] leading-[18px] tracking-[0.16px] whitespace-nowrap text-white">
          Save and start new estimate
        </div>
      </footer>
    </div>
  )
}
