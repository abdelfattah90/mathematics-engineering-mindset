/* ==========================================================================
   Software Engineering Mindset — stage.js
   سكربت مشترك لكل الصفحات: الفهرس، صفحات المواضيع، صفحات الـ prompts.
   لا يعتمد على أي مكتبة مضمَّنة. ما يلزم يُحمَّل تلقائيًا من cdnjs في صفحات الأجزاء فقط
   (فلا تُكتب وسوم script ولا link لها في HTML):
     - highlight.js لتلوين الكود (وللغات الإضافية مثل dockerfile وnginx عند الحاجة).
     - KaTeX للمعادلات، عند وجود \( \) أو \[ \] في الصفحة.
   ما يبنيه السكربت تلقائيًا (فلا يُكتب في HTML):
     - عنوان الشريط العلوي ووسم title من h1.
     - زر النسخ وشارة اللغة في كل code-block.
     - قائمة «المحتويات» وشريط تقدّم القراءة، في الصفحات التي فيها <body data-toc> فقط
       (صفحات الأجزاء). الفهرس وصفحة المرحلة وصفحات الـ prompts لا تحتويها.
   ويعرض للصفحات الأخرى: window.SEMB = { copyText, flash }.
   ========================================================================== */
;(() => {
  'use strict'

  const $ = (sel, root = document) => root.querySelector(sel)
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel))

  function make(tag, className, attrs) {
    const node = document.createElement(tag)
    if (className) node.className = className
    if (attrs) Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v))
    return node
  }

  /* ------------------------------------------------------------------
     1) Clipboard — يعمل أيضًا خارج HTTPS عبر بديل execCommand
  ------------------------------------------------------------------ */
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (_) {
      /* نكمل إلى البديل */
    }
    try {
      const area = make('textarea', '', { readonly: '' })
      area.value = text
      area.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0'
      document.body.appendChild(area)
      area.select()
      const ok = document.execCommand('copy')
      area.remove()
      return ok
    } catch (_) {
      return false
    }
  }

  // يبدّل حالة الزر مؤقتًا (.is-copied)؛ الشكل كله في CSS
  function flash(btn, ms = 1600) {
    btn.classList.add('is-copied')
    clearTimeout(btn._flashTimer)
    btn._flashTimer = setTimeout(() => btn.classList.remove('is-copied'), ms)
  }

  window.SEMB = { copyText, flash }

  /* ------------------------------------------------------------------
     2) عنوان الصفحة: h1 ← الشريط العلوي ووسم title
  ------------------------------------------------------------------ */
  const heroTitle = $('.hero__title')
  const barTitle = $('[data-sync-title]')
  if (heroTitle) {
    const text = heroTitle.textContent.trim()
    if (text) {
      if (barTitle) {
        barTitle.textContent = text
        barTitle.setAttribute('dir', 'auto')
        barTitle.title = text
      }
      document.title = text
    }
  }

  /* ------------------------------------------------------------------
     2b) عزل الجزء الإنجليزي في العناوين (RTL): «عربي (English)» و«عربي - English»
         حتى لا تنقلب الأقواس ولا تتبعثر الكلمات عند التفاف السطر.
  ------------------------------------------------------------------ */
  function isolateLatin(node) {
    if (node.children.length || !node.textContent.trim()) return
    const text = node.textContent
    let before = ''
    let latin = ''
    let glue = ' '
    const paren = text.match(/^(.*?)\s*(\([A-Za-z][^()]*\))\s*$/)
    const dash = text.match(/^(.*?)\s-\s([A-Za-z].*)$/)
    if (paren) {
      before = paren[1]
      latin = paren[2]
    } else if (dash) {
      before = dash[1]
      latin = dash[2]
      glue = ' - '
    } else {
      return
    }
    const span = make('span', '', { dir: 'ltr' })
    span.textContent = latin
    node.textContent = before + glue
    node.appendChild(span)
  }
  $$('.hero__title, .content-section__title, .topic-block__title, .page-nav__title').forEach(isolateLatin)

  /* ------------------------------------------------------------------
     3) Code blocks: شارة اللغة + زر النسخ، ثم التلوين
  ------------------------------------------------------------------ */
  const LANG_LABELS = {
    py: 'Python', python: 'Python', sql: 'SQL', bash: 'Bash', shell: 'Shell', sh: 'Shell',
    js: 'JavaScript', javascript: 'JavaScript', ts: 'TypeScript', typescript: 'TypeScript',
    json: 'JSON', yaml: 'YAML', yml: 'YAML', dockerfile: 'Dockerfile', ini: 'INI',
    html: 'HTML', xml: 'XML', css: 'CSS', diff: 'Diff', plaintext: 'Text', text: 'Text',
    http: 'HTTP', nginx: 'Nginx', makefile: 'Makefile', kotlin: 'Kotlin', dart: 'Dart',
    c: 'C', cpp: 'C++', go: 'Go', rust: 'Rust', java: 'Java', toml: 'TOML', graphql: 'GraphQL',
    markdown: 'Markdown', md: 'Markdown', protobuf: 'Protobuf', x86asm: 'Assembly', 'python-repl': 'Python REPL'
  }

  function selectContents(node) {
    const range = document.createRange()
    range.selectNodeContents(node)
    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)
  }

  $$('.code-block').forEach((block) => {
    const code = $('code', block)
    const header = $('.code-block__header', block)
    if (!code || !header) return

    const match = code.className.match(/language-([\w+-]+)/)
    if (match && !$('.code-block__lang', header)) {
      const lang = make('span', 'code-block__lang')
      lang.textContent = LANG_LABELS[match[1].toLowerCase()] || match[1]
      header.appendChild(lang)
    }

    if (!$('.code-block__copy', header)) {
      const btn = make('button', 'code-block__copy', { type: 'button', 'aria-label': 'نسخ الكود' })
      btn.innerHTML = '<span class="btn__idle">نسخ</span><span class="btn__done">تم النسخ</span>'
      btn.addEventListener('click', async () => {
        const ok = await copyText(code.textContent.replace(/\n$/, ''))
        if (ok) flash(btn)
        else selectContents(code) // تعذّر النسخ: نحدّد الكود ليضغط القارئ Ctrl+C
      })
      header.appendChild(btn)
    }
  })

  /* ------------------------------------------------------------------
     3b) مكتبات تُحمَّل عند الحاجة فقط: highlight.js وKaTeX (صفحات الأجزاء)
         بلا اتصال تبقى الصفحة مقروءة: الكود نص عادي والمعادلات بصيغتها الخام.
  ------------------------------------------------------------------ */
  const CDN = 'https://cdnjs.cloudflare.com/ajax/libs/'
  const HLJS_BASE = CDN + 'highlight.js/11.9.0/'
  const KATEX_BASE = CDN + 'KaTeX/0.16.9/'
  // currentScript is null inside async callbacks, so the script's own URL is captured here
  const SELF_SRC = document.currentScript && document.currentScript.src
  const KATEX_LOCAL = SELF_SRC ? new URL('vendor/katex/', SELF_SRC).href : ''
  const HLJS_EXTRA = ['dockerfile', 'nginx', 'http', 'dart', 'protobuf', 'x86asm'] // خارج الحزمة الأساسية

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = make('script', '', { src })
      s.onload = resolve
      s.onerror = () => reject(new Error('load failed: ' + src))
      document.head.appendChild(s)
    })
  }

  async function highlightCode() {
    const codes = $$('.code-block code[class*="language-"]')
    if (!codes.length) return
    try {
      if (!window.hljs) await loadScript(HLJS_BASE + 'highlight.min.js')
      const wanted = new Set(codes.map((c) => (c.className.match(/language-([\w+-]+)/) || [])[1]))
      const missing = HLJS_EXTRA.filter((l) => wanted.has(l) && !window.hljs.getLanguage(l))
      await Promise.all(missing.map((l) => loadScript(HLJS_BASE + 'languages/' + l + '.min.js')))
      window.hljs.highlightAll()
    } catch (_) {
      /* بلا اتصال: يبقى الكود نصًا عاديًا */
    }
  }

  // Local copy first (works offline), CDN as the fallback
  async function loadKatex() {
    for (const base of [KATEX_LOCAL, KATEX_BASE].filter(Boolean)) {
      try {
        if (!window.katex) await loadScript(base + 'katex.min.js')
        if (!window.renderMathInElement) await loadScript(base + 'contrib/auto-render.min.js')
        document.head.appendChild(make('link', '', { rel: 'stylesheet', href: base + 'katex.min.css' }))
        return
      } catch (_) {
        /* try the next source */
      }
    }
    throw new Error('KaTeX unavailable')
  }

  async function renderMath() {
    if (!document.body.hasAttribute('data-toc')) return
    if (!/\\[([]/.test(document.body.textContent)) return // لا \( ولا \[ في الصفحة
    try {
      await loadKatex()
      window.renderMathInElement(document.body, {
        delimiters: [
          { left: '\\[', right: '\\]', display: true },
          { left: '\\(', right: '\\)', display: false }
        ],
        ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
        throwOnError: false
      })
    } catch (_) {
      /* بلا اتصال: تبقى المعادلات بصيغتها الخام */
    }
  }

  // Safety net for the RTL/digits problem: any Latin or number run the author left as plain text is wrapped in
  // <bdi dir="ltr"> so its internal order survives inside Arabic text. It must run after KaTeX (which owns \( \)).
  // Brackets stay inside a run only when attached to it (f(x), O(n log n)); a run never ends with punctuation
  // or a dash, so "English - Arabic" keeps its separator between the two parts.
  const LTR_RUN =
    /(?:[-\u2212+](?=\d))?[A-Za-z0-9\u0370-\u03ff](?:[A-Za-z0-9\u0370-\u03ff .,+\-\u2212\u2013\u2014\u00b7\u2022\u00d7\u00f7\u00b1=/%^:;_'\u2019&*<>|!\u00b2\u00b3\u2190-\u21ff\u2200-\u22ff\u2308-\u230b]|\([^()\u0600-\u06ff]*\)|\[[^[\]\u0600-\u06ff]*\]|\{[^{}\u0600-\u06ff]*\})*/g
  const LTR_TAIL = /[\s.,:;+\-\u2212\u2013\u2014\u00b7\u2022=\u00d7\u00f7/^&|<>*]+$/
  const LTR_SKIP = 'script,style,textarea,pre,code,svg,bdi,.katex,.katex-display,[dir="ltr"]'

  function isolateLtrRuns(root) {
    const nodes = []
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const v = n.nodeValue
      if (!/[A-Za-z0-9\u0370-\u03ff]/.test(v) || /\\[([]/.test(v)) continue // raw TeX means KaTeX did not run
      if (n.parentElement && n.parentElement.closest(LTR_SKIP)) continue
      nodes.push(n)
    }
    nodes.forEach((n) => {
      const text = n.nodeValue
      const frag = document.createDocumentFragment()
      let last = 0
      for (const m of text.matchAll(LTR_RUN)) {
        const core = m[0].replace(LTR_TAIL, '')
        if (!core) continue
        if (m.index > last) frag.append(text.slice(last, m.index))
        const bdi = make('bdi', '', { dir: 'ltr' })
        bdi.textContent = core
        frag.append(bdi)
        last = m.index + core.length
      }
      if (last === 0) return
      if (last < text.length) frag.append(text.slice(last))
      n.replaceWith(frag)
    })
  }

  highlightCode()
  renderMath().finally(() => {
    if (!document.body.hasAttribute('data-toc')) return
    ;[$('main'), $('.toc')].filter(Boolean).forEach(isolateLtrRuns)
  })

  /* ------------------------------------------------------------------
     4) المحتويات + شريط التقدّم + تمييز القسم الحالي
  ------------------------------------------------------------------ */
  const topbar = $('.topbar')
  const topbarInner = $('.topbar__inner')
  let uid = 0
  const ensureId = (node, prefix) => {
    if (!node.id) node.id = prefix + '-' + ++uid
    return node.id
  }

  const tocTargets = [] // { node, link } بترتيب ظهورها في الصفحة
  let panel = null
  let toggle = null

  const readerMode = document.body.hasAttribute('data-toc')

  function buildToc() {
    if (!readerMode || !topbar || !topbarInner) return
    const sections = $$('.content-section').filter((s) => $('.content-section__title', s))
    if (sections.length < 2) return

    panel = make('nav', 'toc', { id: 'toc-panel', 'aria-label': 'محتويات الصفحة' })
    panel.hidden = true
    const list = make('ol')

    sections.forEach((section) => {
      const titleEl = $('.content-section__title', section)
      const item = make('li')
      const link = make('a', 'toc__link toc__link--section', { href: '#' + ensureId(section, 'sec') })
      link.textContent = titleEl.textContent.trim()
      item.appendChild(link)
      list.appendChild(item)
      tocTargets.push({ node: section, link })

      if (section.dataset.toc !== 'deep') return
      const subs = $$('.topic-block__title', section)
      if (!subs.length) return
      const subList = make('ol', 'toc__sub')
      subs.forEach((titleNode) => {
        const holder = titleNode.closest('.topic-block') || titleNode
        const subLink = make('a', 'toc__link', { href: '#' + ensureId(holder, 'topic') })
        subLink.textContent = titleNode.textContent.trim()
        const subItem = make('li')
        subItem.appendChild(subLink)
        subList.appendChild(subItem)
        tocTargets.push({ node: holder, link: subLink })
      })
      item.appendChild(subList)
    })

    panel.appendChild(list)
    toggle = make('button', 'topbar__btn', {
      type: 'button',
      'aria-expanded': 'false',
      'aria-controls': 'toc-panel'
    })
    toggle.innerHTML = '<span>المحتويات</span>'
    topbarInner.append(toggle, panel)

    const setOpen = (open) => {
      panel.hidden = !open
      toggle.setAttribute('aria-expanded', String(open))
      if (open) {
        // نحرّك قائمة المحتويات وحدها (scrollIntoView كانت تحرّك الصفحة كلها أيضًا)
        const active = $('.is-active', panel)
        if (active) panel.scrollTop = active.offsetTop - panel.clientHeight / 2
      }
    }
    toggle.addEventListener('click', () => setOpen(panel.hidden))
    panel.addEventListener('click', (e) => {
      if (e.target.closest('a')) setOpen(false)
    })
    document.addEventListener('click', (e) => {
      if (!panel.hidden && !panel.contains(e.target) && !toggle.contains(e.target)) setOpen(false)
    })
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !panel.hidden) {
        setOpen(false)
        toggle.focus()
      }
    })
  }

  buildToc()

  const progressBar = readerMode && topbar ? make('div', 'topbar__progress', { 'aria-hidden': 'true' }) : null
  if (progressBar) topbar.appendChild(progressBar)

  let ticking = false
  function onScroll() {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      ticking = false
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      if (progressBar) progressBar.style.setProperty('--p', max > 0 ? Math.min(100, (window.scrollY / max) * 100).toFixed(1) : 0)

      if (!tocTargets.length) return
      const line = (topbar ? topbar.offsetHeight : 0) + 40
      let current = null
      for (const t of tocTargets) {
        if (t.node.getBoundingClientRect().top <= line) current = t
        else break
      }
      // نهاية الصفحة: القسم الأخير قد لا يبلغ خط التمييز أبدًا، فنعدّه الحالي
      if (max > 0 && window.scrollY >= max - 4) current = tocTargets[tocTargets.length - 1]
      tocTargets.forEach((t) => t.link.classList.toggle('is-active', t === current))
    })
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
  onScroll()
})()
