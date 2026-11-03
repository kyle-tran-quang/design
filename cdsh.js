(async () => {
  await document.fonts.ready
  const root = document.querySelector('.cdsh'); root.scrollIntoView({ block: 'center' }); await new Promise(r => setTimeout(r, 4000))
  const texts = [...root.querySelectorAll('*')].filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()))
  const fams = [...new Set(texts.map(e => getComputedStyle(e).fontFamily.split(',')[0]))]
  const over = texts.filter(e => { const cs = getComputedStyle(e); return e.scrollWidth > e.clientWidth + 1 && cs.overflow !== 'visible' }).map(e => e.textContent.trim().slice(0, 30))
  const tiles = [...root.querySelectorAll('.cdsh-tile')]; const spill = []
  for (const t of tiles) { const tr = t.getBoundingClientRect(); for (const e of t.querySelectorAll('*')) { if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue; const r = e.getBoundingClientRect(); if (r.width && (r.right > tr.right + 1 || r.left < tr.left - 1)) spill.push(e.textContent.trim().slice(0, 30)) } }
  const loaded = [...document.fonts].filter(f => f.family.replace(/['"]/g, '') === 'Be Vietnam Pro' && f.status === 'loaded').map(f => f.weight)
  return { families: fams, beVietnamLoaded: loaded, clipped: over, spillsOutOfTile: spill }
})()
