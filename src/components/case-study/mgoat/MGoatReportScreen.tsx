import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import type { CinematicScreenProps } from '../cardoctor/Cinematic'

// The M-GOAT cinematic's screen: the "Your Maximo growth roadmap" report window, the finished state of the story's
// report beat (Figma 1r4UreOVeEqdcXvnD5cetk node 208:8303, 680×576, dark theme). The scroll engine draws the same
// window as live HTML in engine/report-piece.js, but that only exists once the ~400KB engine has loaded, and the
// curtain has to play on first paint, so this is a static React build of it. Geometry, copy and colours are the
// Figma node's (auto-layout offsets and the dark-theme tokens, as report-piece.js reads them).
//
// The window clips its content at 576px, as in Figma: the tab panel's copy runs past the bottom edge, so only its
// visible lines are rendered (the runtime traces every line the browser reports, clipped or not).
// The strip's half-disc is a static gradient here, as in the engine; the Figma shader is not recreated.

type HiddenEl = HTMLDivElement & { __tGenOpacity?: string }

/** The runtime keeps only the largest parts when a component has more than this (its default is 60). Chosen by eye: the
 * window is busier than a card, and the blueprint reads as complete at 70. The parts were not counted. */
const MAX_PARTS = 70
/** Never wait longer than this for fonts and images before the drawing starts. */
const READY_WAIT = 2500
const FONTS = [
  '300 24px "IBM Plex Serif"',
  '400 8px "IBM Plex Sans"',
  '600 8px "IBM Plex Sans"',
  '700 8px "IBM Plex Sans"',
]

const SHADOW =
  'shadow-[16.8px_24px_32px_0px_rgba(0,0,0,0.02),12.549px_17.928px_23.903px_0px_rgba(0,0,0,0.02),8.781px_12.545px_16.726px_0px_rgba(0,0,0,0.03),5.542px_7.917px_10.556px_0px_rgba(0,0,0,0.05),2.897px_4.138px_5.518px_0px_rgba(0,0,0,0.07),0.956px_1.365px_1.82px_0px_rgba(0,0,0,0.09)]'

// ─── the illustration strip (Figma 208:8304), 680 × 109.36. Paths are the Figma export's, in strip coordinates. ───
const STRIP_W = 680
const STRIP_H = 109.36
const GREY = '#6F6F6F'
const ARC =
  'M45.0916 20.7598C26.1345 20.7598 10.366 36.0162 10.366 54.7886C10.366 73.5609 26.1345 89.1744 45.0916 89.1744'

// Pills: [path, fill, centre x, centre y]. The third sits on the strip's bottom edge, so it is drawn but not traced.
const PILLS: [string, string, number, number][] = [
  ['M67.9048 72.0968C64.7559 72.0968 62.2021 69.5431 62.2021 66.3941C62.2021 63.2451 64.7559 60.6914 67.9048 60.6914H79.3102C82.4592 60.6914 85.0129 63.2451 85.0129 66.3941C85.0129 69.5431 82.4592 72.0968 79.3102 72.0968H67.9048Z', '#FF7EB6', 73.6, 66.4],
  ['M90.7159 26.4777C87.5669 26.4777 85.0132 23.9239 85.0132 20.775C85.0132 17.626 87.5669 15.0723 90.7159 15.0723H102.121C105.27 15.0723 107.824 17.626 107.824 20.775C107.824 23.9239 105.27 26.4777 102.121 26.4777H90.7159Z', '#E8DAFF', 96.4, 20.8],
  ['M90.7158 117.72C87.5668 117.72 85.0131 115.166 85.0131 112.017C85.0131 108.868 87.5668 106.314 90.7158 106.314H102.121C105.27 106.314 107.824 108.868 107.824 112.017C107.824 115.166 105.27 117.72 102.121 117.72H90.7158Z', '#4589FF', 96.4, 112],
  ['M119.229 49.2882C116.08 49.2882 113.527 46.7345 113.527 43.5855C113.527 40.4366 116.08 37.8828 119.229 37.8828H130.635C133.784 37.8828 136.338 40.4366 136.338 43.5855C136.338 46.7345 133.784 49.2882 130.635 49.2882H119.229Z', '#A6C8FF', 125, 43.6],
  ['M130.635 26.4777C127.486 26.4777 124.932 23.9239 124.932 20.775C124.932 17.626 127.486 15.0723 130.635 15.0723H142.04C145.189 15.0723 147.743 17.626 147.743 20.775C147.743 23.9239 145.189 26.4777 142.04 26.4777H130.635Z', '#4589FF', 136.3, 20.8],
  ['M147.743 72.0968C144.594 72.0968 142.04 69.5431 142.04 66.3941C142.04 63.2451 144.594 60.6914 147.743 60.6914H159.148C162.297 60.6914 164.851 63.2451 164.851 66.3941C164.851 69.5431 162.297 72.0968 159.148 72.0968H147.743Z', '#BE95FF', 153.4, 66.4],
]
const PILL_OFF_EDGE = 2

const RINGS: [string, string][] = [
  ['M615.214 1.03516C645.126 1.03516 669.375 25.2846 669.375 55.1967C669.375 85.1089 645.126 109.358 615.214 109.358', '#0F62FE'],
  ['M615.214 16.5098C636.58 16.5098 653.9 33.8306 653.9 55.1966C653.9 76.5626 636.58 93.8835 615.214 93.8835', '#4589FF'],
  ['M615.214 31.9844C628.033 31.9844 638.426 42.3766 638.426 55.1965C638.426 68.0163 628.033 78.4086 615.214 78.4086', '#A6C8FF'],
]

/** Thin connectors drawn left to right. Wider than the runtime's icon limit, so it reveals with the strip. */
const LINES = [
  'M45.094 20.7754H164.851',
  'M44.3812 43.5859H164.851',
  'M44.3812 66.3965H164.851',
  'M44.5731 89.1426H176.219',
  'M164.85 20.7734H178.394C222.959 20.7734 222.934 54.9896 267.499 54.9896',
  'M164.85 43.584H178.394C222.959 43.584 222.934 54.9894 267.499 54.9894',
  'M164.85 66.3956H178.394C222.959 66.3956 222.934 54.9902 267.499 54.9902',
  'M164.138 112.017H178.395C222.959 112.017 222.934 54.9902 267.499 54.9902',
  'M267.439 54.9355H615.214',
  'M45.0945 60.6934V112.018C45.0945 118.248 50.2697 123.423 56.4999 123.423L295.983 123.354',
  'M45.0914 49.2738V-2.03953C45.0914 -8.2684 56.3389 -13.4425 69.8793 -13.4425H590.425C598.688 -13.783 615.213 -11.9792 615.213 -2.03953C615.213 6.75592 615.213 71.5231 615.213 109.895C615.213 117.337 609.18 123.349 601.738 123.349H590.278',
]

type Box = [x: number, y: number, w: number, h: number]

/** A small piece of the strip as its own svg, in strip coordinates (viewBox = its box), so the runtime can trace it. */
function Piece({ box, skip, children }: { box: Box; skip?: boolean; children: ReactNode }) {
  const [x, y, w, h] = box
  return (
    <svg
      className="absolute block"
      style={{ left: x, top: y }}
      width={w}
      height={h}
      viewBox={`${x} ${y} ${w} ${h}`}
      overflow="visible"
      fill="none"
      aria-hidden="true"
      data-t-generate-skip={skip ? '' : undefined}
    >
      {children}
    </svg>
  )
}

function Strip({ asset }: { asset: (name: string) => string }) {
  return (
    <div className="relative h-[109.36px] w-[680px] shrink-0 overflow-clip bg-[#333]">
      <Piece box={[9.9, 20.3, 36, 69.4]}>
        <defs>
          <linearGradient id="mgr-arc" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#BB99FF" />
            <stop offset="1" stopColor="#9EBBFF" />
          </linearGradient>
        </defs>
        <path d={ARC} fill="url(#mgr-arc)" />
        <path d={ARC} stroke={GREY} strokeWidth={0.425848} />
      </Piece>

      <svg
        className="absolute left-0 top-0 block"
        width={STRIP_W}
        height={STRIP_H}
        viewBox={`0 0 ${STRIP_W} ${STRIP_H}`}
        fill="none"
        aria-hidden="true"
      >
        <image href={asset('burst-a.png')} x={164.85} y={54.8125} width={102.649} height={34.5726} preserveAspectRatio="none" />
        <image href={asset('burst-b.png')} x={159.148} y={-2.21484} width={108.351} height={57.3834} preserveAspectRatio="none" />
        {LINES.map((d) => (
          <path key={d} d={d} stroke={GREY} strokeWidth={0.356419} strokeMiterlimit={10} />
        ))}
        <circle cx={45.0942} cy={43.5859} r={0.62} fill={GREY} />
        <circle cx={45.0942} cy={66.3965} r={0.62} fill={GREY} />
      </svg>

      <Piece box={[33.4, 43.4, 17.6, 23.4]}>
        <path
          d="M45.0944 43.584C38.8535 43.584 33.689 48.7485 33.689 54.9894C33.689 61.2303 38.8535 66.3948 45.0944 66.3948"
          fill="#fff"
          stroke={GREY}
          strokeWidth={0.356419}
          strokeMiterlimit={10}
        />
        <path
          d="M45.0945 60.6945C48.2441 60.6945 50.7972 58.1413 50.7972 54.9918C50.7972 51.8422 48.2441 49.2891 45.0945 49.2891C41.945 49.2891 39.3918 51.8422 39.3918 54.9918C39.3918 58.1413 41.945 60.6945 45.0945 60.6945Z"
          fill="#E0E0E0"
        />
      </Piece>
      <Piece box={[267.2, 43.9, 21.7, 22.2]}>
        <path
          d="M278.064 65.8464C283.932 65.8464 288.689 60.9734 288.689 54.9623C288.689 48.9511 283.932 44.0781 278.064 44.0781C272.196 44.0781 267.439 48.9511 267.439 54.9623C267.439 60.9734 272.196 65.8464 278.064 65.8464Z"
          fill="#BE95FF"
        />
        <path
          d="M278.064 60.6634C281.069 60.6634 283.506 58.2269 283.506 55.2214C283.506 52.2158 281.069 49.7793 278.064 49.7793C275.058 49.7793 272.622 52.2158 272.622 55.2214C272.622 58.2269 275.058 60.6634 278.064 60.6634Z"
          fill="#E8DAFF"
        />
      </Piece>
      {PILLS.map(([d, fill, cx, cy], i) => (
        <Piece key={i} box={[cx - 11.6, cy - 6.1, 23.2, 12.2]} skip={i === PILL_OFF_EDGE}>
          <path d={d} fill={fill} />
        </Piece>
      ))}
      <Piece box={[614.9, 0.8, 54.8, 108.8]}>
        {RINGS.map(([d, fill]) => (
          <path key={d} d={d} fill={fill} stroke="#fff" strokeWidth={0.241793} strokeMiterlimit={10} />
        ))}
      </Piece>
    </div>
  )
}

// ─── the IBM Maximo Application Suite mark (Figma 208:8352), 33.17px ───
function Logo() {
  const outline =
    'M32.0036 16.0836L28.0335 8.93843C29.1561 9.27739 30.4954 9.67647 30.4954 9.67647L31.0976 7.69245L25.1455 5.88672L23.3398 11.8388L25.3238 12.441L26.1303 9.78117L29.9045 16.575L23.2455 27.9898H10.3649V30.063H23.8405C24.0217 30.0631 24.1997 30.0156 24.3569 29.9254C24.514 29.8352 24.6448 29.7054 24.7361 29.5489L31.9922 17.1098C32.0829 16.9546 32.1316 16.7784 32.1335 16.5986C32.1353 16.4188 32.0902 16.2417 32.0026 16.0846L32.0036 16.0836ZM9.32928 3.11145C9.14809 3.11139 8.97004 3.15884 8.81289 3.24905C8.65575 3.33926 8.525 3.46909 8.43367 3.62559L1.17758 16.0646C1.08682 16.2198 1.03813 16.396 1.03631 16.5758C1.03449 16.7556 1.07961 16.9328 1.16721 17.0898L5.13733 24.235C4.01471 23.896 2.67544 23.4969 2.67544 23.4969L2.07319 25.481L8.02526 27.2867L9.83099 21.3346L7.84697 20.7324L7.0405 23.3912L3.2663 16.5974L9.92532 5.18255H22.8059V3.10938H9.33032L9.32928 3.11145Z'
  const ring =
    'M16.5854 21.7682C13.7275 21.7682 11.4025 19.4431 11.4025 16.5853C11.4025 13.7274 13.7275 11.4023 16.5854 11.4023C19.4433 11.4023 21.7683 13.7274 21.7683 16.5853C21.7683 19.4431 19.4433 21.7682 16.5854 21.7682ZM16.5854 13.4755C14.8709 13.4755 13.4756 14.8708 13.4756 16.5853C13.4756 18.2998 14.8709 19.695 16.5854 19.695C18.2999 19.695 19.6951 18.2998 19.6951 16.5853C19.6951 14.8708 18.2999 13.4755 16.5854 13.4755Z'
  return (
    <div className="relative size-[33.171px] shrink-0">
      {/* The gradient mark, masked. Its masked rect would trace as a square, so only the overlay below is traced. */}
      <svg className="absolute inset-0 block" viewBox="0 0 34 34" fill="none" aria-hidden="true" data-t-generate-skip="">
        <defs>
          <mask id="mgr-logo-mask" maskUnits="userSpaceOnUse" x="1" y="2" width="32" height="30" style={{ maskType: 'luminance' }}>
            <path d={outline} fill="#fff" />
            <path d="M9.32922 31.2988V26.1159H18.6585V31.2988H9.32922Z" fill="url(#mgr-logo-a)" />
            <path d="M23.8414 2.41016V7.59308L14.5122 7.59308V2.41016L23.8414 2.41016Z" fill="url(#mgr-logo-b)" />
          </mask>
          <linearGradient id="mgr-logo-a" x1="18.6585" y1="28.7074" x2="9.32922" y2="28.7074" gradientUnits="userSpaceOnUse">
            <stop stopOpacity="0" />
            <stop offset="0.9" />
          </linearGradient>
          <linearGradient id="mgr-logo-b" x1="14.5122" y1="5.00162" x2="23.8414" y2="5.00162" gradientUnits="userSpaceOnUse">
            <stop stopOpacity="0" />
            <stop offset="0.9" />
          </linearGradient>
          <linearGradient id="mgr-logo-c" x1="0" y1="33.1707" x2="33.1707" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0.1" stopColor="#A56EFF" />
            <stop offset="0.9" stopColor="#0043CE" />
          </linearGradient>
        </defs>
        <g mask="url(#mgr-logo-mask)">
          <rect width="33.1707" height="33.1707" fill="url(#mgr-logo-c)" />
        </g>
        <path d={ring} fill="#001D6C" />
      </svg>
      {/* Invisible copy of the mark's outline: the shapes the drawing follows. */}
      <svg className="absolute inset-0 block" viewBox="0 0 34 34" fill="none" aria-hidden="true">
        <path d={outline} />
        <path d={ring} />
      </svg>
    </div>
  )
}

// ─── the left column ───
const NAV: string[][] = [
  ['Where you are', 'today'],
  ['Opportunities to', 'increase ROI'],
  ['Your action plan'],
  ['Additional', 'resources'],
  ['Help us improve'],
]

function Nav() {
  return (
    <div className="flex w-[85px] shrink-0 flex-col">
      {NAV.map((lines, i) => {
        const selected = i === 0
        return (
          <div key={lines.join(' ')} className="relative flex h-[33.171px] w-full items-center pl-[8.3px]">
            <span className={`absolute left-0 top-0 h-full w-[1.55px] ${selected ? 'bg-[#4589ff]' : 'bg-[#525252]'}`} />
            <p
              className={`w-[68.4px] text-[7.256px] leading-[9.329px] tracking-[0.0829px] ${selected ? 'font-semibold text-[#f4f4f4]' : 'text-[#c6c6c6]'}`}
            >
              {lines.map((line, j) => (
                <span key={line}>
                  {j > 0 && <br />}
                  {line}
                </span>
              ))}
            </p>
          </div>
        )
      })}
    </div>
  )
}

function Buttons() {
  return (
    <div className="flex shrink-0 items-start gap-[8.293px]">
      <button
        type="button"
        tabIndex={-1}
        className="flex h-[25.549px] w-[90.463px] items-center bg-[#0f62fe] pl-[8.3px] text-left text-[7.256px] leading-[9.329px] tracking-[0.0829px] text-white"
      >
        Talk to a seller
      </button>
      <button
        type="button"
        tabIndex={-1}
        className="relative box-border flex h-[25.549px] w-[75.463px] items-center border-[0.52px] border-solid border-white pl-[7.8px] text-left text-[7.256px] leading-[9.329px] tracking-[0.0829px] text-white"
      >
        Download
        <svg className="absolute left-[58.2px] top-[7.98px]" width="8.3" height="8.3" viewBox="0 0 16 16" fill="#fff" aria-hidden="true">
          <path d="M8 11L3 6l.7-.7L8 9.6l4.3-4.3.7.7z" />
        </svg>
      </button>
    </div>
  )
}

// ─── the right column ───
/** [title lines, status, bar width (of 190.5), bar colour] in reading order, two columns. */
const METERS: [string[], string, number, string][] = [
  [['Asset data'], 'Established', 138.4, '#24a148'],
  [['Work management'], 'Established', 138.4, '#24a148'],
  [['Inspections and', 'condition capture'], 'Emerging', 25.9, '#f1c21b'],
  [['Supply chain and', 'inventory'], 'Growing', 103.7, '#33b1ff'],
  [['Scheduling'], 'Growing', 116.6, '#33b1ff'],
  [['Reliability practices'], 'Emerging', 4.7, '#f1c21b'],
  [['Condition monitoring', 'and prediction'], 'Emerging', 30.6, '#f1c21b'],
  [['Assignment', 'and dispatch'], 'Growing', 82.9, '#33b1ff'],
]

function Meter({ title, status, width, color }: { title: string[]; status: string; width: number; color: string }) {
  return (
    <div className="flex w-[190.732px] flex-col gap-[8.293px] pb-[4.146px]">
      <div className={`flex items-end justify-between text-[8.293px] leading-[11.402px] ${title.length > 1 ? 'min-h-[23px]' : 'min-h-[12px]'}`}>
        <p className="font-semibold text-[#f4f4f4]">
          {title.map((line, i) => (
            <span key={line}>
              {i > 0 && <br />}
              {line}
            </span>
          ))}
        </p>
        <p className="text-[#c6c6c6]">{status}</p>
      </div>
      <div className="relative h-[4.146px] w-[190.5px] bg-[#262626]">
        <div className="absolute inset-y-0 left-0" style={{ width, backgroundColor: color }} />
      </div>
    </div>
  )
}

const TABS: [label: string, left: number, width: number][] = [
  ['Asset data', 0, 53.6],
  ['Work management', 53.6, 79.6],
  ['Scheduling', 133.2, 53.6],
]

/** The panel copy, one span per line. The window cuts it off after the third; the fourth is drawn (a sliver shows) but not traced. */
const PANEL_COPY = [
  'Your asset register is a trusted, governed single source of',
  'truth—work order linkage, job plan reuse, and any analytics',
  'built on asset data are reliable because the foundation',
  'underneath them is clean and consistent.',
]

function Report({ asset }: { asset: (name: string) => string }) {
  return (
    <>
      <Strip asset={asset} />
      <div className="relative flex w-full flex-1 items-start justify-between bg-[#161616] px-[16.585px] pt-[24.878px] drop-shadow-[0px_-2.073px_4.146px_rgba(0,0,0,0.1)]">
        {/* left column */}
        <div className="flex w-[210.945px] shrink-0 flex-col items-start gap-[17.104px] pt-[8.293px]">
          <Logo />
          <h2 className="w-full font-['IBM_Plex_Serif'] text-[24.878px] font-light leading-[1.1] text-[#f4f4f4]">
            Your Maximo
            <br />
            growth roadmap
          </h2>
          <div className="flex w-full flex-col gap-[4.146px] text-[7.256px] text-[#f4f4f4]">
            <p className="h-[11.921px] leading-[9.329px] tracking-[0.0829px] opacity-50">beta v3</p>
            <p className="leading-[11.61px] tracking-[0.0363px]">
              <span>Contact name: </span>
              <span className="font-bold">Michael Scott</span>
              <br />
              <span>Industry/Organization: </span>
              <span className="font-bold">Utilities &amp; Energy</span>
            </p>
            <p className="h-[11.921px] leading-[9.329px] tracking-[0.0829px] opacity-50">Based on assessment results on 9/12/26</p>
          </div>
          <Nav />
          <Buttons />
        </div>

        {/* right column */}
        <div className="flex w-[398.049px] shrink-0 flex-col gap-[33.171px] pt-[12.439px]">
          <div className="flex flex-col gap-[24.878px]">
            <h3 className="text-[14.512px] font-normal leading-[19px] text-[#f4f4f4]">Where you are today</h3>
            <div className="flex flex-col gap-[16.585px]">
              <p className="w-[190.213px] text-[8.293px] leading-[11.402px] text-[#f4f4f4]">
                Your strongest capabilities are creating value
                <br />
                today, while several areas offer opportunities
                <br />
                for growth.
              </p>
              <div className="grid grid-cols-2 items-start gap-x-[16.585px] gap-y-[8.293px]">
                {METERS.map(([title, status, width, color]) => (
                  <Meter key={title.join(' ')} title={title} status={status} width={width} color={color} />
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[16.585px]">
            <div className="flex flex-col gap-[8.293px] text-[#f4f4f4]">
              <h3 className="text-[14.512px] font-normal leading-[19px]">Established capabilities</h3>
              <p className="w-[190.213px] text-[8.293px] leading-[11.402px]">
                These capabilities provide a strong foundation for
                <br />
                future growth.
              </p>
            </div>
            {/* Only the part the window shows (it ends at the window's bottom edge, where Figma clips the panel), so the
                runtime's drawing follows the window and not the unclipped box below it. */}
            <div className="box-border h-[72.6px] w-full overflow-clip border-[0.518px] border-b-0 border-solid border-[#525252]">
              <div className="flex h-[25.549px] w-full border-b-[0.518px] border-solid border-[#525252]">
                {TABS.map(([label, , width], i) => (
                  <div
                    key={label}
                    role="tab"
                    aria-selected={i === 0}
                    className={`box-border shrink-0 pl-[8.3px] pt-[7.2px] text-[7.256px] leading-[9.329px] tracking-[0.0829px] ${
                      i === 0
                        ? 'border-t-[1.04px] border-solid border-t-[#4589ff] bg-[#262626] pt-[6.2px] font-semibold text-[#f4f4f4]'
                        : 'bg-[#393939] text-[#c6c6c6]'
                    }`}
                    style={{ width }}
                  >
                    {label}
                  </div>
                ))}
              </div>
              <div className="px-[8.293px] py-[10.366px] text-[8.293px] leading-[11.402px] text-[#f4f4f4]">
                <p className="w-[223.384px]">
                  {PANEL_COPY.map((line, i) => (
                    <span key={line} className="block whitespace-nowrap" data-t-generate-skip={i === 3 ? '' : undefined}>
                      {line}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function MGoatReportScreen({
  generate,
  asset,
  enabled = true,
  delay = 0,
  duration,
  onFinished,
}: CinematicScreenProps) {
  const cardRef = useRef<HiddenEl>(null)
  const onFinishedRef = useRef(onFinished)
  onFinishedRef.current = onFinished
  // Hidden until the runtime takes over, so the finished window never flashes first. The flag sits on the root, not as
  // an inline style on the card: the runtime restores the card's own inline opacity afterwards, and React must never
  // rewrite that style or the window would vanish once the drawing ends.
  const [pending, setPending] = useState(enabled)

  useLayoutEffect(() => {
    const el = cardRef.current
    if (!el || !enabled) {
      setPending(false)
      return
    }
    // The runtime shows the element again (at __tGenOpacity) at its reveal.
    el.__tGenOpacity = el.style.opacity
    el.style.opacity = '0'
    setPending(false)

    let disposed = false
    let run: ReturnType<CinematicScreenProps['generate']> | null = null
    // The runtime traces the fonts the page renders and reads the images it lays out, so both must be final first.
    const images = Array.from(el.querySelectorAll('img'))
    const bursts = ['burst-a.png', 'burst-b.png'].map((name) => {
      const image = new Image()
      image.src = asset(name)
      return image
    })
    const ready = Promise.all([
      ...FONTS.map((face) => document.fonts.load(face).catch(() => undefined)),
      ...[...images, ...bursts].map((image) => image.decode().catch(() => undefined)),
    ]).then(() => document.fonts.ready)
    Promise.race([ready, new Promise((resolve) => setTimeout(resolve, READY_WAIT))]).then(() => {
      if (disposed) return
      run = generate(el, {
        mode: 'skeleton',
        delay,
        maxParts: MAX_PARTS,
        ...(duration ? { duration } : {}),
      })
      run.finished.then(() => {
        if (!disposed) onFinishedRef.current?.()
      })
    })

    return () => {
      disposed = true
      run?.cancel()
      el.style.opacity = el.__tGenOpacity ?? ''
      delete el.__tGenOpacity
    }
  }, [enabled, generate, asset, delay, duration])

  return (
    // Transparent: the cinematic frame owns the background (dark throughout, to suit the dark-theme window).
    <div
      className="relative h-[576px] w-[680px] shrink-0 font-['IBM_Plex_Sans']"
      data-pending={pending ? '' : undefined}
      data-node-id="208:8303"
      data-name="M-GOAT report window"
    >
      <div
        ref={cardRef}
        className={`relative flex size-full flex-col overflow-clip bg-[#161616] ${SHADOW} [[data-pending]_&]:opacity-0`}
      >
        <Report asset={asset} />
      </div>
    </div>
  )
}
