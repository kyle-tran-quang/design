/**
 * Made-up chat scenarios for the AI chat story. Customers, numbers, and times are invented for illustration; the shapes come from
 * the case study (new deals, trade-ups, mixed authorized/concurrent user pools) and from what testing showed: to change one detail,
 * the seller had to start the quote over.
 *
 * Copy follows the IBM style guide: sentence case, serial commas, curly apostrophes, active voice, `watsonx` in lowercase.
 */

export type Card = {
  title: string
  rows: [label: string, value: string][]
  total: [label: string, value: string]
}

export type Msg = {
  from: 'you' | 'bot'
  time: string
  text: string
  /** A structured draft quote under the reply. */
  card?: Card
  /** A button under the reply. The cursor presses it in the last scenario. */
  action?: string
  /** The opening message: no feedback icons under it. */
  greeting?: boolean
}

export type Scenario = {
  id: string
  /** The tab. */
  label: string
  /** The caption under the chat, and the screen-reader summary. */
  summary: string
  msgs: Msg[]
  /** How many messages are already in the thread when the scenario opens. */
  start: number
  /** How many are showing in the still (reduced motion, or before the scenario plays). */
  still: number
  /** The message that appears after the thread is cleared, if the scenario clears it. */
  resetAt?: number
}

const GREETING = 'Hi. I can help you build a quote. Describe the deal in your own words: the industry, what they need, and how many users.'

const greeting = (time: string): Msg => ({ from: 'bot', time, text: GREETING, greeting: true })

const WATER_QUOTE: Card = {
  title: 'Draft quote',
  rows: [
    ['Applications', 'Manage, Health, Predict'],
    ['Users', '1,200'],
    ['Environments', '1 production, 1 test'],
    ['Term', '3 years'],
  ],
  total: ['AppPoints per year', '9,840'],
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'new-deal',
    label: 'New deal',
    summary:
      'New deal: the seller describes the deal in their own words, and watsonx asks one follow-up question before it drafts the quote.',
    start: 1,
    still: 5,
    msgs: [
      greeting('10:12'),
      { from: 'you', time: '10:12', text: 'Water utility, 1,200 technicians, predictive maintenance on pumps' },
      {
        from: 'bot',
        time: '10:12',
        text: 'Got it. I’ll start with Manage, Health, and Predict on a 3-year term. Do they need a separate test environment?',
      },
      { from: 'you', time: '10:13', text: 'Yes, one test environment.' },
      { from: 'bot', time: '10:13', text: 'Thanks. Here’s your draft quote, ready to send to CPQ.', card: WATER_QUOTE },
    ],
  },
  {
    id: 'trade-up',
    label: 'Trade-up',
    summary: 'Trade-up: watsonx credits an existing customer’s licenses, then drafts the quote.',
    start: 1,
    still: 5,
    msgs: [
      greeting('2:40'),
      { from: 'you', time: '2:40', text: 'Customer wants to trade up their old Maximo licenses. 250 users.' },
      { from: 'bot', time: '2:40', text: 'I can credit their existing licenses. Which version do they run today?' },
      { from: 'you', time: '2:41', text: 'Maximo 7.6.1' },
      {
        from: 'bot',
        time: '2:41',
        text: 'Thanks. I credited their existing licenses in this draft.',
        card: {
          title: 'Draft quote',
          rows: [
            ['Current version', 'Maximo 7.6.1'],
            ['Applications', 'Manage'],
            ['Users', '250'],
            ['Existing licenses', 'Credited'],
          ],
          total: ['AppPoints per year', '2,150'],
        },
      },
    ],
  },
  {
    id: 'user-pools',
    label: 'Mixed user pools',
    summary: 'Mixed user pools: named users and shared users are quoted in one conversation.',
    start: 1,
    still: 5,
    msgs: [
      greeting('4:05'),
      { from: 'you', time: '4:05', text: '60 planners have named logins. 200 technicians share access.' },
      { from: 'bot', time: '4:05', text: 'How many technicians are on at the same time?' },
      { from: 'you', time: '4:06', text: 'About 40.' },
      {
        from: 'bot',
        time: '4:06',
        text: 'Thanks. I quoted 60 authorized users and 40 concurrent users.',
        card: {
          title: 'Draft quote',
          rows: [
            ['Applications', 'Manage'],
            ['Authorized users', '60'],
            ['Concurrent users', '40 of 200'],
            ['Term', '3 years'],
          ],
          total: ['AppPoints per year', '3,480'],
        },
      },
    ],
  },
  {
    id: 'change',
    label: 'Changing a detail',
    summary:
      'Changing a detail: to edit one number, the seller had to start the quote over. Testing showed this was the chat’s weakest point.',
    start: 3,
    still: 5,
    resetAt: 5,
    msgs: [
      greeting('10:12'),
      { from: 'you', time: '10:12', text: 'Water utility, 1,200 technicians, predictive maintenance on pumps' },
      { from: 'bot', time: '10:13', text: 'Here’s your draft quote, ready to send to CPQ.', card: WATER_QUOTE },
      { from: 'you', time: '10:14', text: 'Can you change it to 1,500 technicians?' },
      {
        from: 'bot',
        time: '10:14',
        text: 'I can’t edit a quote I’ve already built. I can start a new one with your change.',
        action: 'Start a new quote',
      },
      greeting('10:14'),
    ],
  },
]
