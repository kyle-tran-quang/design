import { type ComponentType, type ReactNode } from 'react'
import AutoplayVideo from '@/components/AutoplayVideo'
import LazyWhenNear from '@/components/LazyWhenNear'
import BeforeAfter from '@/components/case-study/BeforeAfter'
import PillButton from '@/components/case-study/PillButton'
import PullQuote from '@/components/case-study/PullQuote'
import Stat from '@/components/case-study/Stat'
import Ticket from '@/components/case-study/Ticket'
import { asset } from '@/lib/asset'
import { framerImage } from '@/lib/framerImages'

/**
 * What each story says, built from the page's own pieces (the same stats, quotes, before/after pairs and tickets as the sections
 * further down), so a story and its section can never drift apart. The panel is about 500 px wide, so everything here is stacked in one
 * column; the page's two-column rows and 2-up grids do not fit it.
 *
 * Content is copied from the page, not moved: the long page keeps all of it.
 */

/** A framer image at 1024 and 2048 px, as the page does it. */
const framerSet = (id: string, ext = 'png') => ({
  image: framerImage(id, ext, 1024),
  srcSet: `${framerImage(id, ext, 1024)} 1024w, ${framerImage(id, ext, 2048)} 2048w`,
})
const video = (name: string) => asset(`assets/videos/mas-pricing-${name}.mp4`)

/**
 * The benefits report, shown finished. Loaded only when the estimator story is scrolled to it: it used to be imported at the top of this file, so
 * its 148 kB chunk came down with the showcase for every reader, though five of the six stories never show it. A stable reference: LazyWhenNear
 * restarts its observer if `load` changes.
 */
const loadExecutivePrint = () =>
  import('@/components/case-study/mas/ExecutivePrintCard').then(({ default: Card }) => ({ default: () => <Card animate={false} /> }))

/* ---- small shared pieces ---- */

const P = ({ children }: { children: ReactNode }) => <p className="type-small text-body">{children}</p>

/** A heading inside a story. The page's `type-subtopic` is 24px; the panel is narrow, so it steps down. */
const H = ({ children }: { children: ReactNode }) => <h4 className="mt-10 type-topic !text-[1.375rem]">{children}</h4>

/** A muted rule between a story's parts. */
const Rule = () => <hr className="mt-10 border-line" />

/*
 * The story's clips are long ones in a scrolling panel, and several sit below its fold. A bare `autoPlay` video downloads and decodes the moment
 * the panel opens, whether or not it is on screen (measured: opening "estimator" fetched 3.4 MB and played two clips nobody could see; "web
 * estimator" fetched 2.5 MB for one below the fold). AutoplayVideo fetches a clip when it nears the panel's visible area and pauses it when it leaves.
 */
function Clip({ name, label, at = 0 }: { name: string; label: string; at?: number }) {
  // some clips open on blank frames: start past them
  return <AutoplayVideo src={video(name)} label={label} start={at} className="aspect-video w-full rounded-lg bg-mist object-cover" />
}

function Square({ name, text }: { name: string; text: string }) {
  return (
    <figure>
      <AutoplayVideo src={video(name)} label={text} className="aspect-square w-full rounded-lg bg-mist object-cover" />
      <figcaption className="mt-4 type-small text-dim">{text}</figcaption>
    </figure>
  )
}

function Shot({ src, alt = '' }: { src: string; alt?: string }) {
  return <img src={src} alt={alt} loading="lazy" className="w-full rounded-lg bg-white object-cover" />
}

function Disclaimer({ children }: { children: ReactNode }) {
  return <p className="mt-4 type-label text-dim italic">({children})</p>
}

/** A stat row: one column in the panel, whatever the page does. */
function Stats({ children }: { children: ReactNode }) {
  return <div className="mt-6 grid gap-6 border-t border-line pt-6">{children}</div>
}

/* ---- the stories ---- */

/** 1. The main estimator: the walkthrough, what it does, the numbers, the two clips, and the executive report at the end. */
function Estimator() {
  return (
    <div className="space-y-5">
      <Clip name="estimator-demo" label="Walkthrough of the unified pricing estimator" at={4} />
      <P>
        I designed and built an internal tool which replaces the full fragmented stack—Excel, CPQ, Slack, email—with a single AI-powered
        workflow covering pricing, costing, and provisioning configuration.
      </P>
      <PillButton href="https://kyle-tran-quang.github.io/mas-pricing-estimator/" icon="external">
        Launch Estimator prototype
      </PillButton>
      <Disclaimer>
        Indicative segment of build with example pricing only, as the current tool is IBM confidential for internal enablement
      </Disclaimer>

      <Stats>
        <Stat value="> 30 mins">Seller + approver time per quote from 2-3 days.</Stat>
        <Stat value="~ 15 mins">SRE (site reliability engineering) configuration review (scales with deal complexity)</Stat>
        <Stat value="60% faster">Deal time improvement</Stat>
      </Stats>

      <div className="space-y-8 border-t border-line pt-8">
        <Square
          name="ai-chat"
          text="A plain-language chat, built on IBM watsonx layer, that builds a Maximo quote from a deal description, and learning about Maximo concepts."
        />
        <Square
          name="apppoints-visualization"
          text="Visualizing the AppPoints stacks, so sellers see which modules drive the total as they build. Also, they can spot the biggest AppPoints cost at a glance."
        />
      </div>

      {/* Last, as the page puts it at the end of the pricing story. Its code is 148 kB and only this story uses it. */}
      <div className="border-t border-line pt-8">
        <LazyWhenNear load={loadExecutivePrint} fallback={<div className="min-h-[420px]" />} rootMargin="400px 0px" />
      </div>
    </div>
  )
}

/**
 * The Excel engine: the problem the research found, why the workbook's logic moved into the estimator, how the flow was refined for
 * beginners, and the idea set aside. Copy follows the IBM style guide (sentence-style headings, serial commas, em dashes without spaces,
 * active voice, curly apostrophes).
 */
function Excel() {
  return (
    <div className="space-y-5">
      <figure>
        <Shot src={asset('assets/images/mas-pricing-challenge-solution-2.webp')} alt="The AppPoints Calculator Excel workbook" />
        <figcaption className="mt-4 type-small text-dim">The AppPoints Calculator, the Excel workbook sellers used to quote Maximo.</figcaption>
      </figure>

      <H>What the research showed</H>
      <P>
        I interviewed 8 sellers and 4 Customer Success Engineers (CSEs) about how they quote Maximo. They described the same flow:
        manual and clunky.
      </P>
      <P>
        The quoting tool was the AppPoints Calculator—a versioned Excel workbook that people emailed between teams. Each quote meant
        copying numbers into configure, price, quote (CPQ) software by hand, routing approvals by hand, and tracking versions by hand
        across Slack, email, IBM Sales Cloud, and Salesforce.
      </P>
      <P>
        The workbook was also too complex to share with clients, so sellers built their own calculators, questionnaires, and scoping
        decks.
      </P>
      <Stats>
        <Stat value="1,000+">hours lost each year to fragmented workflows</Stat>
      </Stats>

      <H>Why I brought the workbook’s logic into the estimator</H>
      <P>
        The logic was the valuable part. The workbook already knew how to price AppPoints, cost them, and configure what gets
        provisioned. The pain came from the handoffs around it.
      </P>
      <P>
        So I kept the logic and made it the engine behind the estimator, in three parts: pricing, costing, and provisioning
        configuration. That removes the copy-paste, the emailed versions, and the manual routing. A seller works in one workflow and
        always works from the current version.
      </P>

      <H>Refining the flow for beginners</H>
      <P>
        Moving the logic wasn’t enough. A seller who is new to AppPoints still has to finish a quote without help. So I took the flow
        through many rounds of feedback with sellers, and each round made it easier for a beginner to follow.
      </P>
      <ul className="list-disc space-y-2 pl-5 type-small text-body">
        <li>Plain language comes first. Sellers describe the deal in their own words, so they don’t need to learn the AppPoints model before they start.</li>
        <li>The logic stays visible. As sellers build a quote, they see which modules drive the AppPoints total, so the numbers explain themselves.</li>
      </ul>

      <H>Constraints that shaped the solution</H>
      <P>The other idea I had was to connect everything: sync Excel, CPQ, Salesforce, and Gainsight into one integrated system. However…</P>
      <PullQuote
        quote="If you're in a startup you can go live tomorrow. But this is IBM…it takes at least 6 months to 2 years…"
        source="Asset Lifecycle Management PM"
      />
    </div>
  )
}

/** 4. Design problems and rationales: the page's whole Research section. */
function Rationale() {
  return (
    <div className="space-y-5">
      <Shot src={framerImage('rIJQFibPf73QvwkFU7MBEQIijo', 'png', 1024)} alt="Interview synthesis board" />
      <P>
        I ran in-depth interviews with 8 sellers (SMEs, ecosystem leaders, global sales) and 4 Customer Success Engineers (CSEs), who see
        the quote from the other side of the handoff. Clients don't care about AppPoints. They want to know what they're paying and what
        they get.
      </P>
      <PullQuote quote="Most of our customers are actually confused at just what an AppPoint is, much less the pricing calculator." source="IBM seller" />
      <Shot src={framerImage('8qKcy1iCX3GaoMGyjEfoOzEqoxk', 'png', 1024)} alt="Collection of sellers' self-made quoting tools" />
      <P>
        Apart from the tooling problem, in fact, every seller built their own tools: custom calculators, questionnaires, scoping decks,…
        because the official one was too complex to share with clients.
      </P>
      <PullQuote
        quote="It is a hot mess. I do not show the pricing calculator to the clients at all... There's no integration between systems right now. The integration is me."
        source="IBM seller"
      />
    </div>
  )
}

/** 5 and 6. Feedback and lessons learned: the validation, then the lessons as the page's tickets. */
function Lessons() {
  return (
    <div className="space-y-5">
      <P>
        I ran unmoderated usability testing with the same previous participants. testing realistic enterprise quoting scenarios (new
        deals, trade-ups, and mixed authorized/concurrent user pools).
      </P>
      {/* The page's validation card, as it is. */}
      <div className="space-y-12 rounded-[20px] bg-snow p-6">
        <PullQuote quote="I don't have to second-guess whether I broke it or using an outdated Excel file." source="Maximo field seller" />
        <PullQuote
          quote="I can actually run through this on a call along with a client and get a clean quote in minutes instead of hours."
          source="Customer success manager"
        />
      </div>

      <H>Lessons learned</H>
      {/* The page's tickets, stacked: its fan across the full frame needs far more width than the panel has. */}
      <div className="flex flex-col items-center gap-8 pt-2 pb-4">
        <div className="w-full max-w-[400px] rotate-[-1.5deg]">
          <Ticket title={`"Just because you can build it, doesn't make it a good idea"`} accent="coral" titleTag="h4" naturalHeight>
            <p>
              Now that I can build pretty much anything quickly with AI, it's important to know how to strip out the junk and focus on
              what's more important.
            </p>
            <p>
              I've developed a mindset to plan things and organize artifacts more efficiently, not just to waste tokens, but also ship
              what's important and scalable to prevent technical debt long-term.
            </p>
          </Ticket>
        </div>
        <div className="w-full max-w-[400px] rotate-[2deg]">
          <Ticket title="The corporate rule" accent="periwinkle" titleTag="h4" naturalHeight>
            IBM also taught me that design decisions have to survive months of alignment meetings and handoffs you can't predict.
            Delivery with speed is important, but longevity rules above all.
          </Ticket>
        </div>
      </div>

      <H>What I'd do differently</H>
      <P>
        It's impossible to boil the ocean now that the whole architecture of Maximo was built around AppPoints. Inside the product
        (Maximo) itself, there could potentially be ways to let users learn about the AppPoints concept better.
      </P>
      <figure>
        <img
          src={framerImage('JftjgYlQvDvGKYlfckwTPE6lS8', 'gif', 900)}
          alt="AppPoints nudge concept: a usage meter with an explanation tooltip"
          loading="lazy"
          className="w-full rounded-lg bg-white object-cover"
        />
        <figcaption className="mt-4 type-small text-dim">
          One proposed concept - "AppPoints nudge" with explanation tooltip. I borrowed inspirations from AI token usage.
        </figcaption>
      </figure>
      <P>
        Project-wise, I would push for validation plans as soon as possible since we were testing out concepts really quickly but the
        time for alignment meetings were taking up a large portion of the roadmaps. Therefore, we could know where problems were and
        what could've been done to improve quicker.
      </P>
    </div>
  )
}

/** The chat scenarios build with the Stageshow kit and play a timed script, so their code loads only when the reader nears them. */
const loadChatScenarios = () => import('./chat/ChatScenarios')

/**
 * The AI chat: Phase 1. It opens with why a chatbot came first and what carried over to the estimator, then the demo, the example
 * conversations, and the insight that shaped the estimator. Copy follows the IBM style guide.
 */
function AiChat() {
  return (
    <div className="space-y-5">
      <h4 className="type-topic !text-[1.375rem]">Why a chatbot came first</h4>
      <P>
        A chatbot was the first small step. It let me test the quoting logic with real sellers before I committed to a full interface. A
        seller describes the deal in their own words, and the logic turns it into a CPQ-ready quote.
      </P>
      <P>
        After a few rounds of testing, I found that the chat wasn’t the best experience. To change one detail, a seller had to go back and
        restart the inquiry from the beginning. The chat was also constrained by what watsonx Orchestrate supports, so I couldn’t
        redesign the interaction beyond a conversation.
      </P>
      <P>
        Both findings carried over to the main estimator. I kept the logic that the chat proved out and moved it into an interface where
        sellers can change any detail without starting over.
      </P>

      <Rule />
      <Clip name="agent-demo" label="Seller chatting with the watsonx Orchestrate quoting assistant" at={0.4} />
      <P>
        Built on watsonx Orchestrate (Feb – May 2026, private preview June 2026). For phase 1 - we focused on giving the seller a guided,
        conversation-style workflow, and the logic maps and generates a CPQ-ready quote automatically.
      </P>

      <H>Example conversations</H>
      <P>
        These conversations are made up, but they follow the deals sellers quote: a new deal, a trade-up, and mixed user pools. The last
        one shows the problem that testing surfaced.
      </P>
      <LazyWhenNear load={loadChatScenarios} fallback={<div className="min-h-[620px] rounded-lg bg-cloud" />} rootMargin="400px 0px" />
      <Stats>
        <Stat value="95%">of quotes approved in ≤ 2 hours by the L0 approval team</Stat>
      </Stats>

      <H>Re-purposing the chatbot</H>
      <P>
        The insight that shaped the unified estimator was that sellers didn't want a chatbot. They wanted something that would let them
        control the quote. And then, this becomes the prerequisite to the AI Assistant in the Estimator itself.
      </P>
      <Shot src={framerImage('CqViqNphA2rLKwftcHnzUmXnMKM', 'png', 1024)} alt="Estimator with the AI assistant panel" />
    </div>
  )
}

/** 3. Public web estimator: the walkthrough and the page's three "Main decisions" before/after pairs. */
function WebEstimator() {
  return (
    <div className="space-y-5">
      {/* The backstory: why the public page needed a rethink, before the page itself is shown. */}
      <P>
        The internal estimator fixed the seller’s side of the quote, but the confusion started earlier. The public Maximo pricing page
        on ibm.com lists AppPoints without explaining what they are, so buyers reach a seller already confused.
      </P>
      <P>
        Sellers then have to introduce AppPoints from scratch, in a B2B sales cycle that already runs 9 months to 2 years. Each
        conversation starts with the concept instead of the deal.
      </P>
      <P>
        I couldn’t simplify AppPoints itself, because the whole architecture of Maximo is built around it. So I asked a narrower question:
        could the page help buyers estimate what they will pay, in their own terms, before they talk to anyone?
      </P>

      {/* The page as it was, then the redesign: the clip is the "after", so it needs its "before" in front of it. */}
      <figure>
        <figcaption className="mb-3 type-caption text-dim">
          <strong className="font-bold">Before:</strong> the current Maximo pricing page on ibm.com
        </figcaption>
        <Shot src={asset('assets/images/mas-pricing-challenge-solution-1.avif')} alt="The old Maximo pricing page on ibm.com" />
      </figure>
      <figure className="pt-3">
        <figcaption className="mb-3 type-caption text-ink">
          <strong className="font-bold">After:</strong> the redesigned, guided estimator
        </figcaption>
        <Clip name="public-page" label="Walkthrough of the redesigned public pricing page" at={3} />
      </figure>
      <P>
        I built an exploratory concept to reimagine the public pricing experience, transforming it from a static list of technical
        add-ons into a guided, self-service estimator.
      </P>
      <PillButton href="https://kyle-tran-quang.github.io/Maximo-Pricing-Page/" icon="external">
        Launch Pricing prototype
      </PillButton>
      <Disclaimer>
        Indicative segment of build with example pricing only, as the current tool is IBM confidential for internal enablement
      </Disclaimer>
      <Stats>
        <Stat value="> 5 mins" wide>
          For the customer to estimate their costs and realizing the benefits of operational cost-saving (Usability testing, Sept. 26).
        </Stat>
      </Stats>

      <h3 className="pt-6 type-topic">Main decisions</h3>
      <div className="space-y-16">
        <BeforeAfter
          animate={false}
          title="Clearer customer-facing language and form progressive disclosure"
          before={{
            ...framerSet('75arC3L3SCsHoOehSk2GDa32Dic'),
            text: 'Unclear explanation and boundaries between tiers, leaving buyers guessing which capabilities belong in Essentials vs. Standard.',
          }}
          after={{
            ...framerSet('dsDx00IyRIEs5vJQjpTxxDnVLok'),
            text: 'Form with progressive disclosure, with clearer mapped business capabilities to package editions with plain-language explanations.',
          }}
        />
        <BeforeAfter
          animate={false}
          title="Explanations where customers need the most"
          before={{
            ...framerSet('uQQKGZS4cJoOMYkIdkqo656zxs'),
            text: 'Confronts users with technical line items like "non-production environments" and unguided user add-ons with verbose explanation.',
          }}
          after={{
            ...framerSet('JyqbsF8B8vEHsG3O86VEkljlPI'),
            text: 'Grounds estimation in operational reality: Users simply specify the number of field technicians, operations managers, and administrators they have',
          }}
        />
        <BeforeAfter
          animate={false}
          size={468}
          title="Calculating customers' benefits"
          before={{
            ...framerSet('ZZ9rqR9HtAug7JSa5ZF6yD978'),
            text: 'Laid out dozens of numbers and variables all at once with the assumption that users could digest them at a glance, resulting in data overload rather than clear ROI.',
          }}
          after={{
            ...framerSet('oq0rQm2GpFEbSXXDTNurReiXX8'),
            text: 'Guides users through progressive disclosure, with digestible steps and focusing output numbers directly on the tangible business value Maximo delivers.',
          }}
        />
        <BeforeAfter
          animate={false}
          title="Right questions, at the right context"
          before={{
            ...framerSet('ea3QpYJ6J7Gig84MA6rYrVqlSr4'),
            text: 'Has a lengthy, monolithic FAQ accordion at the bottom of the page, forcing prospects to hunt through dense walls of text.',
          }}
          after={{
            ...framerSet('tGFWTkIyIFUO7W0wZAvIZh04HM4'),
            text: 'Suggesting FAQs based on what the user selects in the estimator (such as edition, team size, or capabilities) answering the right questions at the moment.',
          }}
        />
      </div>

      <Rule />
      <aside className="type-label text-muted italic">
        <p className="font-bold">Side note:</p>
        <p className="mt-1">
          This redesigned pricing page is an exploratory vision prototype created to demonstrate how IBM could communicate value and
          pricing transparency to prospective clients. It has yet to fully resolve the underlying AppPoints licensing complexity, which
          remains a systemic product and business challenge.
        </p>
      </aside>
    </div>
  )
}

export const STORY_BODIES: Record<string, ComponentType> = {
  estimator: Estimator,
  excel: Excel,
  rationale: Rationale,
  lessons: Lessons,
  'ai-chat': AiChat,
  'web-estimator': WebEstimator,
}
