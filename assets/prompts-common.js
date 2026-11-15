/* Mathematics for Software Engineers — prompts-common.js
   Runs on index.html only. Builds the full lesson prompt when a card's copy button is pressed.
   Data sources: the stage cards in index.html (titles, topics, prerequisites, derived paths)
   and assets/plan-data.js (terms x/u, lead-in b, notes n).
   Console check: MATH_PROMPTS.build('math-26'). Data lint: index.html?lint */
;(() => {
  'use strict'

  const PROGRESS_KEY = 'math-plan-done-v2' // v2: stage numbering changed with the 40-stage plan
  const EXPECTED_STAGES = 40
  const EXPECTED_SECTIONS = 5
  const STAGE_TOPICS = 3
  const MAX_TERMS = 5
  const MAX_NOTE_CHARS = 700
  const MAX_PROMPT_CHARS = 14000
  const TEMPLATE = 'templet-math.html'

  const DRAW_STAGES = [6, 12, 13, 14, 15, 25, 26, 37, 39]
  const LINALG_STAGES = [37, 38]

  /* ------------------------------------------------------------------
     1) Prompt texts
  ------------------------------------------------------------------ */
  const READER_DEFAULT =
    'القارئ: مهندس برمجيات يعمل على الـ backend (APIs وقواعد بيانات وخدمات)، ومستواه في الرياضيات ابتدائي: قد لا يتذكر الكسور والنسب، ولا يعرف الرموز الرياضية. يعرف البرمجة جيدًا (متغيرات وحلقات ودوال وSQL). لا يريد حفظ قواعد بل أن يفهم الفكرة ببساطة ثم يرى أين تظهر في عمله. لا تفترض أنه يعرف أي مفهوم رياضي إلا إذا ورد تحت «ما يعرفه القارئ الآن» أو «المصطلحات المعرَّفة سابقًا» أو شُرح في هذه الصفحة.'

  const MASTER = `هذه الصفحة جزء من مرجع عربي بعنوان «Mathematics for Software Engineers»: خطة لتعلّم الرياضيات من الصفر لمهندس backend، تبدأ من الأعداد والعمليات وتصل إلى الاحتمالات وتحليل الأداء، بفهم الفكرة قبل حفظ القاعدة. تتألف الخطة من @@TOTAL@@ مرحلة في @@NSEC@@ أقسام: @@CHAIN@@. في كل مرحلة ثلاثة موضوعات تُدرس وتُحَل كوحدة واحدة، ولا تعتمد مرحلة إلا على ما سبقها. كل مرحلة صفحة HTML واحدة تُكتب في محادثة مستقلة، وهذه المحادثة هي كتابة صفحة واحدة. تُقرأ الصفحات في المتصفح فقط، ولا يُنفَّذ أي كود داخلها.
@@READER@@

عقيدة الشرح (Simple-first) — ملاحظة مهمة جدًا: البساطة أولًا ثم الدقة. اتبع في كل موضوع هذا المسار بهذا الترتيب:
  1) المشكلة: موقف قصير من الحياة اليومية أو من عمل الـ backend يُظهر لماذا نحتاج الفكرة.
  2) الفكرة: جملة واحدة بلا رموز.
  3) أصغر مثال: أرقام صغيرة يحسبها القارئ في رأسه أو بالقلم، بخطوات قصيرة، وتحقق واحد.
  4) القاعدة: بعد المثال لا قبله، في callout--definition بصياغة قصيرة، ثم جملة «لماذا تعمل؟» بالحدس لا بالبرهان.
  5) فخ واحد في callout--warning: الخطأ ونتيجته الخاطئة أولًا ثم التصحيح.
  6) «أين أراها في الـ backend؟»: جملة أو جملتان.
* المثال البسيط يُشرح ببساطة: إن كان حله خطوتين فاكتب خطوتين، ولا تُدخل رموزًا ولا حالات عامة ولا برهانًا في مثال يكفيه الحساب.
* لا ترمز لشيء قبل أن يُشرح معناه بالكلام، ولا تستعمل عبارات مثل «من البديهي» و«يمكن إثبات أن». البرهان لا يُكتب إلا إذا نصّت عليه «ملاحظات خاصة»، وبحد أقصى 4 خطوات.
* الإيقاع: فقرة من جملتين إلى ثلاث، وفي كل جملة فكرة واحدة. العمق بسؤال «لماذا؟» لا بالإطالة.
* قبل مثال نتيجته غير بديهية اسأل «ماذا تتوقع؟» دون كشف الجواب، ثم قارن بعد الحل.
* في كل موضوع مثال محلول واحد جيد، ورسم عند الحاجة فقط.

@@CONTEXT@@

@@STAGE@@

قواعد المحتوى:
* اللغة: العربية الفصحى المبسّطة، والمصطلحات الرياضية والتقنية بالإنجليزية دون ترجمة. الأرقام كلها 0–9 اللاتينية في كل مكان (لا الهندية المشرقية). وأي عنوان لصفحة أو قسم بالإنجليزية أولًا ثم العربية مفصولين بـ « - ».
* المصطلحات: كل مصطلح في «مصطلحات هذه الصفحة» داخل strong عند أول ذكر مع تعريف بجملة بسيطة، ثم يُستعمل بالإنجليزية. لا تضف مصطلحات رسمية غيرها.
* لا تستخدم مفهومًا لم يُشرح تحت «ما تتطلبه هذه المرحلة» أو «ما يعرفه القارئ الآن» أو «المصطلحات المعرَّفة سابقًا» أو في هذه الصفحة؛ وإن لزم فعرّفه بجملة واحدة. وذكّر بكل «مفهوم يُستعمل هنا من صفحات سابقة» بجملة «تذكير: …» عند أول استعمال.
* النطاق: كل بند في قائمة الموضوعات = topic-block مستقل بنفس الترتيب. وما تنص «ملاحظات خاصة» على تأجيله إلى مرحلة أخرى فلا تشرحه ولا تستعمله (جملة تشير إلى موضعه تكفي). قسم المقارنة اختياري: أضفه فقط عند مفاضلة حقيقية.
* اتبع هيكل @@TEMPLATE@@ المرفق بالكامل، وأبقِ <body data-toc> ووسمي link وscript كما هما؛ لا تنسخ CSS ولا JS، ولا تضف style ولا classes ولا وسومًا ولا footer غير الموجودة في القالب. العنوان وeyebrow ورابط الرجوع ومسارات page-nav كما هي تحت «موقع هذه الصفحة». احذف تعليقات القالب وعناصره النائبة وكل مكوّن اختياري لم تستعمله. إن لم تجد القالب مرفقًا فاكتب سطرًا واحدًا تطلبه فيه ولا تبدأ الكتابة.

@@EXERCISES@@

@@TRACK@@

@@DELIVERY@@`

  const EXERCISES = `قسما «اختبر نفسك» و«تمرين شامل» والخلاصة — ملاحظة مهمة جدًا (بعد المقارنة إن وُجدت وقبل نهاية الصفحة، بهيكل القالب نفسه):
* «اختبر نفسك» (eyebrow: «اختبر نفسك»، وh2: «أسئلة نظرية»): ثلاثة أسئلة بالضبط، سؤال لكل موضوع بالترتيب، تتدرّج: فهم ← تطبيق بأرقام صغيرة ← قرار (متى تصح الطريقة ومتى لا؟). كل سؤال مفهوم وحده، وللمعادلات صيغة KaTeX. قبل الأسئلة السطر الثابت: «حاول أن تجيب بنفسك قبل أن تفتح الإجابة تحت كل سؤال.» هيكل السؤال: topic-block فيه h3 «سؤال n» ثم p ثم details.reveal بعنوان «الإجابة» فيها جملتان إلى ثلاث (مع طريقة التحقق في أسئلة الحساب) تنتهي بسطر «راجع: اسم الموضوع» دون أقواس.
* «تمرين شامل» (eyebrow: «تمرين شامل»، وh2: عنوان التمرين): مسألة واحدة من موقف backend قصير (أو يومي)، في 3 خطوات مرقّمة (ol): احسب ← تحقق بطريقة ثانية ← قرّر أو فسّر (عقلية المهندس: لماذا اخترنا هذا الحل؟ وماذا يتغير لو تغيّر المعطى؟)، وتُحَل على الورق في 10 دقائق. هيكله: p للسيناريو، ثم المعطيات (جدول صغير table-wrap--fit أو math-block) إن لزم، ثم الخطوات، ثم تلميح واحد اختياري في details.reveal.reveal--hint. لا تعرض النتائج قبل الحل: مكانها details.reveal بعنوان «الحل»، فيه حل كل خطوة بالترتيب مع التحقق، ثم فقرة «عقلية المهندس» مختصرة.
* الخلاصة: من 3 إلى 5 نقاط، وآخرها «عقلية المهندس: …» بجملة واحدة، ولا تكرّر فيها ما قيل حرفيًا.`

  // User's condition, verbatim. It is placed right before DELIVERY so "the end of this text" means DELIVERY.
  const FREE_PLAN =
    'أستخدم النسخة المجانية من claude.ai، وقد تنقطع المحادثة بحدود الاستخدام؛ فاعمل بالطريقة المذكورة في آخر هذا النص حتى أكتب «Continue» فتكمل دون فقد شيء'

  const DELIVERY = `طريقة التسليم والاستئناف — ملاحظة مهمة جدًا:
* الناتج ملف HTML واحد بمسار الحفظ المذكور أعلاه (يربط ملفَّي assets ولا يضمّنهما)، دون أي مقدمة أو شرح أو ملخص في المحادثة؛ ردّك النهائي سطر واحد فقط بعد اكتمال الملف.
* الصفحة قصيرة بطبيعتها: لا تحذف أي موضوع ولا «اختبر نفسك» ولا «تمرين شامل» ولا الخلاصة؛ وإن ضاق المجال فاختصر الأمثلة الثانوية فقط.
* ابنِ الملف على مراحل بأدوات الملفات (أنشئ الملف ثم عدّله) حتى لا يضيع عملك إن انقطعت المحادثة:
  1) أنشئ الملف أولًا بهيكله الكامل: head وtopbar وhero (بمقدمته) وكل الأقسام، وكل topic-block بعنوانها فقط، وفي كل كتلة ناقصة تعليق علامة بهذا الشكل بالضبط: <!--TODO:t1-->، <!--TODO:t2-->، <!--TODO:t3--> ثم <!--TODO:comparison--> (إن لزم)، <!--TODO:quiz-->، <!--TODO:exercise-->، <!--TODO:summary-->. وضع page-nav بروابطه النهائية.
  2) املأ العلامات بالترتيب، واحدة في كل خطوة: اكتب المحتوى كاملًا ثم استبدل علامته به، دون إعادة كتابة الملف كله.
  3) في الختام ابحث بأمر grep عن «TODO» للتأكد من أنه لا توجد علامة متبقية، وأن الملف ينتهي بـ </html>، وأن كل وسم مفتوح مغلق؛ ثم أرسل الملف.
* إن انقطعت المحادثة وكتب القارئ «Continue»: ابحث بـ grep عن علامات TODO المتبقية فقط (لا تقرأ الملف كله)، وأكمل من أول علامة متبقية دون إعادة ما اكتمل ودون تلخيص أو اعتذار. وإن وجدت كتلة مكتوبة بنصفها (وسم غير مغلق) فأعد كتابتها كاملة. ثم نفّذ الخطوة 3.
* إن لم تتح لك أدوات الملفات: سلّم الملف في دفعات، كل دفعة تنتهي عند نهاية topic-block كاملة وتختم بتعليق <!-- ✓ 2/5 -->، وتُختم الدفعة الأخيرة بـ </html>. وعند «Continue» أكمل من الدفعة التالية فقط بلا head ولا تكرار لما سبق، وإن انقطعت دفعة في منتصفها فأعدها من أولها.`

  const MATH_TRACK = `مسار «رياضيات ونظرية» — قواعد العرض (الصفحة تُحَل على الورق: لا كود ولا code-block ولا ASCII، إلا إذا نصّت «ملاحظات خاصة» على غير ذلك):
* KaTeX كما في القالب: \\( … \\) داخل السطر، و<div class="math-block">\\[ … \\]</div> لسطر مستقل. لا $ ولا $$، ولا حروف عربية داخل المعادلة، واكتب \\lt و\\gt بدل < و>، و&amp; بدل & داخل aligned.
* اتجاه النص (العربية مع الأرقام) — قاعدة صارمة: كل عملية حسابية وكل رقم معه وحدة أو نسبة أو فاصل آلاف يُكتب بـ KaTeX لا نصًا عاديًا: \\(14 = 4 \\times 3 + 2\\)، \\(80\\,\\text{ms}\\)، \\(25\\%\\)، \\(1{,}000\\). لا تكتبها في نص عربي عادي ولا داخل strong أو عنوان.
* لا تضع نصًا لاتينيًا أو رقمًا بين قوسين داخل جملة عربية (تنقلب الأقواس): استعمل فاصلة أو « » أو أعد الصياغة. ابدأ كل جملة وعنوان وبند بكلمة عربية، ولا تجمع عربيًا ولاتينيًا في خلية جدول واحدة.
* الجداول الصغيرة بـ table-wrap table-wrap--fit. الرسم عند الحاجة فقط: figure وsvg بـ viewBox وبـ classes الـ fg-* فقط، بلا style ولا ألوان ولا نص عربي داخل الـ svg، والتعليق في figcaption، وwidth مساوٍ لعرض الـ viewBox حتى 560، وحد أقصى 40 سطرًا.
* أعد كل حساب بطريقة مختلفة قبل كتابته ولا تعرض نتيجة لم تتحقق منها. لا web search.`

  const DRAW_RULE =
    'قاعدة الرسم لهذه الصفحة: لكل مفهوم مكاني أو بياني فيها (خط الأعداد أو منحنى أو شجرة أو رسم بياني أو متجه…) ارسم figure واحدًا بعد المثال الذي يوضحه مباشرة مع figcaption عربي، وأرقام الرسم مطابقة لأرقام ذلك المثال.'
  const LINALG_RULE =
    'قاعدة الأمثلة لهذه الصفحة: كل مثال بأعداد صغيرة قابلة للحساب بالقلم (متجهات في بعدين أو ثلاثة ومصفوفات 2×2 على الأكثر)، وتُعرض كل عملية خطوة خطوة ثم يُتحقق من الناتج بطريقة ثانية.'

  /* ------------------------------------------------------------------
     2) Plan model: built from index.html cards + plan-data.js
  ------------------------------------------------------------------ */
  const $ = (sel, root = document) => root.querySelector(sel)
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel))
  const make = (tag, cls, text) => {
    const n = document.createElement(tag)
    if (cls) n.className = cls
    if (text != null) n.textContent = text
    return n
  }
  const norm = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '')

  const PLAN_SECTIONS = (window.MATH_PLAN || {}).sections || {}

  const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩'
  const toWestern = (s) =>
    String(s).replace(/[٠-٩]/g, (d) => AR_DIGITS.indexOf(d))
  const pad2 = (n) => String(n).padStart(2, '0')
  const slug = (s) =>
    String(s)
      .toLowerCase()
      .replace(/&/g, ' ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  const cleanEnd = (s) => s.replace(/[.،\s]+$/, '')

  function stagePage(sec, card) {
    const n = +card.dataset.stage
    const cfg = (sec.cfg.stages || {})[n] || {}
    const en = norm($('.stage-title-en', card))
    const ar = norm($('.stage-title-ar', card))
    const title = ar ? en + ' - ' + ar : en
    return {
      id: card.id,
      card,
      sec,
      n,
      ar,
      en,
      title,
      d: norm($('.stage-description', card)),
      pre: norm($('.stage-prereq__text', card)),
      href: ($('.stage-title', card) || card).getAttribute('href') || '',
      k: $$('.topic', card).map(
        (li) => norm($('.topic-en', li)) + ' - ' + norm($('.topic-ar', li)),
      ),
      kEn: $$('.topic .topic-en', card).map(norm),
      x: cfg.x || [],
      u: cfg.u || [],
      b: cfg.b || '',
      nt: cfg.n || '',
      slugEn: slug(en),
    }
  }

  const sections = $$('section.plan-section').map((el, idx) => {
    const cfg = PLAN_SECTIONS[el.id] || {}
    const name = norm($('.section-heading h2', el))
    const sec = {
      id: el.id,
      ID: el.id.toUpperCase(),
      idx,
      cfg,
      name,
      nameEn: name.split(' - ')[0],
      desc: norm($('.section-description', el)),
      dir: cfg.dir || pad2(idx + 1) + '-' + slug(name),
      pages: [],
    }
    $$('article.stage-card', el).forEach((card) => {
      const pg = stagePage(sec, card)
      pg.i = sec.pages.length
      pg.f = ((sec.cfg.stages || {})[pg.n] || {}).f || pad2(pg.i + 1) + '-' + pg.slugEn + '.html'
      sec.pages.push(pg)
    })
    return sec
  })

  const all = sections.flatMap((s) => s.pages)
  const byId = Object.fromEntries(all.map((p) => [p.id, p]))

  const priorSections = (sec) => sections.filter((s) => s.idx < sec.idx)
  const rangeOf = (sec) => {
    const ns = sec.pages.map((p) => p.n)
    return ns.length < 2 ? String(ns[0]) : ns[0] + '–' + ns[ns.length - 1]
  }
  const chain = () =>
    sections
      .map((s) => s.ID + ' ' + s.name + ' (' + rangeOf(s) + ')')
      .join(' ← ')

  // Every term defined before this page; used by lint
  function termsBefore(pg) {
    const out = []
    priorSections(pg.sec).forEach((s) => s.pages.forEach((p) => out.push(...p.x)))
    pg.sec.pages.slice(0, pg.i).forEach((p) => out.push(...p.x))
    return [...new Set(out)]
  }

  // Prompt line keeps only the last prior section + the current one, so it does not grow with every section
  const RECENT_SECTIONS = 1
  function termsForPrompt(pg) {
    const every = termsBefore(pg)
    const out = []
    priorSections(pg.sec)
      .slice(-RECENT_SECTIONS)
      .forEach((s) => s.pages.forEach((p) => out.push(...p.x)))
    pg.sec.pages.slice(0, pg.i).forEach((p) => out.push(...p.x))
    out.push(...pg.u.filter((t) => every.includes(t)))
    const terms = [...new Set(out)]
    return { terms, older: terms.length < every.length }
  }

  function knownBefore(pg) {
    const lines = []
    priorSections(pg.sec).forEach((s) => {
      lines.push('* ' + s.ID + ' ' + s.nameEn + ': ' + s.pages.map((p) => p.en).join(' | '))
    })
    const before = pg.sec.pages.slice(0, pg.i)
    if (before.length) {
      lines.push('* ' + pg.sec.ID + ' — صفحات هذا القسم السابقة (مع موضوعات آخر صفحتين):')
      before.forEach((p, i) =>
        lines.push('  - ' + p.en + (i >= before.length - 2 ? ': ' + p.kEn.join('، ') : '')),
      )
    }
    return lines
  }

  // First page's "previous" and last page's "next" point back to the section card in the plan
  function prevNext(pg) {
    const sec = pg.sec
    const home = {
      href: '../index.html#' + sec.id,
      title: 'خطة القسم ' + sec.ID + ' — ' + sec.nameEn,
    }
    const at = (p) => ({ href: p.f, title: p.title })
    return {
      prev: sec.pages[pg.i - 1] ? at(sec.pages[pg.i - 1]) : home,
      next: sec.pages[pg.i + 1] ? at(sec.pages[pg.i + 1]) : home,
    }
  }

  /* ------------------------------------------------------------------
     3) Prompt for one page
  ------------------------------------------------------------------ */
  function build(pg) {
    const sec = pg.sec
    const nav = prevNext(pg)
    const eyebrow = sec.ID + ' · ' + sec.nameEn + ' · ' + pg.n

    const nextPage = sec.pages[pg.i + 1]
    const nextSec = sections.find((s) => s.idx > sec.idx)
    // "لها" refers to the next page, "له" to the next section (the text of b itself is never rewritten)
    const lead = (pron) =>
      pg.b ? '، لكن مهّد ' + pron + ' بقدر: ' + cleanEnd(pg.b) : ''
    const nextLine = nextPage
      ? 'الصفحة التالية: «' + nextPage.title + '» — لا تدخل في موضوعاتها' + lead('لها') + '.'
      : nextSec
        ? 'هذه آخر صفحة في القسم ' + sec.ID + '. القسم التالي: ' + nextSec.ID + ' «' + nextSec.name + '» — لا تدخل في موضوعاته' + lead('له') + '.'
        : 'هذه آخر صفحة في الخطة.'

    const known = knownBefore(pg)
    const { terms, older } = termsForPrompt(pg)
    const context =
      'موقع هذه الصفحة: المرحلة ' + pg.n + ' من القسم ' + sec.ID + ' «' + sec.name + '»، وهي الصفحة ' + (pg.i + 1) + ' من ' + sec.pages.length + ' في القسم.\n' +
      'عنوان الصفحة (في title وفي h1): ' + pg.title + '\n' +
      'eyebrow في الـ hero: ' + eyebrow + '\n' +
      'مسار الحفظ: ' + sec.dir + '/' + pg.f + '\n' +
      'رابط الرجوع topbar__back: href="../index.html#' + pg.id + '" ونصه «الخطة».\n' +
      'page-nav: «السابق» ← ' + nav.prev.href + ' بعنوان «' + nav.prev.title + '»؛ «التالي» ← ' + nav.next.href + ' بعنوان «' + nav.next.title + '».\n' +
      'ما تتطلبه هذه المرحلة (حقل Prerequisite knowledge في الخطة): ' + pg.pre + '\n' +
      'لا تستعمل مفهومًا خارج هذا الحقل وما شُرح في المراحل السابقة المذكورة أدناه.\n' +
      'ما يعرفه القارئ الآن (شُرح سابقًا؛ يجوز لك استخدامه دون إعادة شرحه، ولا تستخدم ما سواه):\n' +
      (known.length ? known.join('\n') : '* لا شيء — هذه بداية المرجع، فلا تفترض أي معرفة رياضية سابقة.') + '\n' +
      (older
        ? 'المصطلحات المعرَّفة سابقًا في الصفحات الأقرب (تُستعمل دون إعادة تعريف؛ وما عُرِّف في أقسام أقدم فلا يُعاد تعريفه أيضًا ويُذكَّر به عند الحاجة بجملة): '
        : 'المصطلحات المعرَّفة سابقًا (تُستعمل دون إعادة تعريف): ') +
      (terms.length ? terms.join('، ') : 'لا شيء بعد.') + '\n' +
      nextLine

    let stage =
      'الصفحة الحالية (المطلوبة): ' + pg.title +
      '\nالموضوعات (topic-block لكل بند، بالترتيب):\n' +
      pg.k.map((k) => '* ' + k).join('\n')
    if (pg.d)
      stage += '\nوصف هذه الصفحة في الخطة (يحدّد نطاقها: غطِّ كل ما ورد فيه ضمن موضوعاتها، ولا تضف ما ليس فيه): ' + pg.d
    if (pg.x.length)
      stage += '\nمصطلحات هذه الصفحة (تُعرَّف رسميًا في هذه الصفحة، كلٌّ منها داخل strong عند أول ذكر): ' + pg.x.join('، ')
    if (pg.u.length)
      stage += '\nمفاهيم تُستعمل هنا من صفحات سابقة (ذكّر بكل منها بجملة واحدة عند أول استعمال دون إعادة شرحها): ' + pg.u.join('، ')
    if (pg.nt) stage += '\nملاحظات خاصة بهذه الصفحة: ' + pg.nt

    const track = [MATH_TRACK]
    if (DRAW_STAGES.includes(pg.n)) track.push(DRAW_RULE)
    if (LINALG_STAGES.includes(pg.n)) track.push(LINALG_RULE)
    if (sec.desc) track.push('ملاحظات خاصة بالقسم كله: ' + sec.desc)

    return toWestern(
      MASTER.replace('@@TOTAL@@', () => String(all.length))
        .replace('@@NSEC@@', () => String(sections.length))
        .replace('@@CHAIN@@', () => chain())
        .replace('@@READER@@', () => sec.cfg.reader || READER_DEFAULT)
        .replace('@@TEMPLATE@@', () => TEMPLATE)
        .replace('@@CONTEXT@@', () => context)
        .replace('@@STAGE@@', () => stage)
        .replace('@@EXERCISES@@', () => EXERCISES)
        .replace('@@TRACK@@', () => track.join('\n\n'))
        .replace('@@DELIVERY@@', () => FREE_PLAN + '\n\n' + DELIVERY),
    )
  }

  /* ------------------------------------------------------------------
     4) Data lint: errors must be fixed, todo = data not written yet
  ------------------------------------------------------------------ */
  // Split in two so the banned words do not appear literally in this file
  const BANNED = ['Book' + 'ing', 'Fast' + 'API', 'Postgre' + 'SQL']

  function lint() {
    const errors = []
    const todoMap = new Map()
    const err = (m) => errors.push(m)
    const td = (sec, msg, who) => {
      const key = sec.ID + ': ' + msg
      if (!todoMap.has(key)) todoMap.set(key, [])
      if (who) todoMap.get(key).push(who)
    }

    const nums = all.map((p) => p.n)
    if (nums.length !== EXPECTED_STAGES || nums.some((n, i) => n !== i + 1))
      err('ترقيم المراحل في index.html غير متصل أو عدده ليس ' + EXPECTED_STAGES)
    if (sections.length !== EXPECTED_SECTIONS)
      err('عدد الأقسام في index.html ' + sections.length + ' وليس ' + EXPECTED_SECTIONS)
    Object.keys(PLAN_SECTIONS).forEach(
      (id) =>
        !sections.some((s) => s.id === id) &&
        err('plan-data.js: قسم غير موجود في index.html «' + id + '»'),
    )

    sections.forEach((sec) => {
      const seenFiles = new Set()
      const stageNums = sec.pages.map((p) => String(p.n))
      Object.keys(sec.cfg.stages || {}).forEach(
        (n) =>
          !stageNums.includes(n) &&
          err(sec.ID + ': plan-data.js فيه مرحلة ' + n + ' ليست في هذا القسم'),
      )

      sec.pages.forEach((pg) => {
        const name = sec.ID + ' ' + pg.title
        if (seenFiles.has(pg.f)) err(name + ': اسم الملف مكرر')
        seenFiles.add(pg.f)
        if (pg.href !== './' + sec.dir + '/' + pg.f)
          err(name + ': رابط البطاقة «' + pg.href + '» لا يطابق مسار الحفظ المشتق «./' + sec.dir + '/' + pg.f + '»')
        if (!pg.d) err(name + ': لا وصف في index.html')
        if (!pg.pre) err(name + ': لا حقل «المعرفة السابقة» في index.html')
        if (!pg.ar) err(name + ': لا عنوان عربي في index.html')
        if (pg.k.length !== STAGE_TOPICS)
          err(name + ': ' + pg.k.length + ' موضوعات (الخطة: ' + STAGE_TOPICS + ' لكل مرحلة)')
        if (pg.x.length > MAX_TERMS)
          err(name + ': ' + pg.x.length + ' مصطلحات (الحد ' + MAX_TERMS + ')')
        if (pg.nt.length > MAX_NOTE_CHARS)
          err(name + ': الملاحظات ' + pg.nt.length + ' حرفًا (الحد ' + MAX_NOTE_CHARS + ')')
        const known = termsBefore(pg)
        pg.u.forEach(
          (t) => !known.includes(t) && err(name + ' ← ' + t + ' (مستعمل قبل تعريفه)'),
        )
        if (!pg.x.length) td(sec, 'المصطلحات (x) غير مكتوبة', String(pg.n))
        if (!pg.b && pg.n < all.length) td(sec, 'التمهيد (b) غير مكتوب', String(pg.n))
      })
    })

    // Each term is formally defined on exactly one page; other pages reuse it through u
    const defined = new Map()
    all.forEach((pg) =>
      pg.x.forEach((t) => {
        const first = defined.get(t)
        if (first && first !== pg)
          err('المصطلح «' + t + '» معرَّف في صفحتين: ' + first.sec.ID + ' ' + first.title + ' و' + pg.sec.ID + ' ' + pg.title)
        else defined.set(t, pg)
      }),
    )

    all.forEach((pg) => {
      const text = build(pg)
      const name = pg.sec.ID + ' ' + pg.title
      if (!text.includes(TEMPLATE)) err(name + ': الـ prompt لا يذكر القالب ' + TEMPLATE)
      if (!text.includes('ما تتطلبه هذه المرحلة'))
        err(name + ': الـ prompt بلا سطر «ما تتطلبه هذه المرحلة»')
      if (!text.includes(pg.sec.dir + '/' + pg.f))
        err(name + ': الـ prompt بلا مسار الحفظ')
      if (/[٠-٩]/.test(text)) err(name + ': الـ prompt فيه أرقام هندية')
      BANNED.forEach((w) => text.includes(w) && err(name + ': الـ prompt يذكر «' + w + '»'))
      if (text.length > MAX_PROMPT_CHARS)
        err(name + ': حجم الـ prompt ' + text.length + ' حرفًا (الحد ' + MAX_PROMPT_CHARS + ')')
    })

    const todo = [...todoMap].map(
      ([key, who]) => key + (who.length ? ' — المراحل: ' + who.join('، ') : ''),
    )
    return { errors, todo }
  }

  /* ------------------------------------------------------------------
     5) UI: copy, toast, progress tracking, ?lint
  ------------------------------------------------------------------ */
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (_) {
      // falls through to the legacy path (page opened from file:// or without HTTPS)
    }
    try {
      const area = make('textarea')
      area.readOnly = true
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

  function flash(btn, ms = 1600) {
    btn.classList.add('is-copied')
    clearTimeout(btn._flashTimer)
    btn._flashTimer = setTimeout(() => btn.classList.remove('is-copied'), ms)
  }

  const ltr = (text, cls) => {
    const b = make('bdi', cls, text)
    b.dir = 'ltr'
    return b
  }

  // Wraps every Latin/number run in <bdi dir="ltr"> so digits and operators keep their order inside RTL text.
  // Trailing space/period/comma/colon stay outside so the punctuation follows the Arabic direction.
  const LTR_RUN = /[A-Za-z0-9][A-Za-z0-9 .,+\-\u2212\u00d7\u00f7=/%^:_'\u2019&\u00b2\u00b3]*/g
  function ltrNodes(str) {
    const out = []
    let last = 0
    for (const m of str.matchAll(LTR_RUN)) {
      const core = m[0].replace(/[ .,:]+$/, '')
      if (m.index > last) out.push(str.slice(last, m.index))
      out.push(ltr(core))
      const tail = m[0].slice(core.length)
      if (tail) out.push(tail)
      last = m.index + m[0].length
    }
    if (last < str.length) out.push(str.slice(last))
    return out
  }

  let toast = null
  let toastTimer = 0
  function showToast(pg, ok) {
    if (!toast) {
      toast = make('div', 'plan-toast')
      toast.setAttribute('role', 'status')
      toast.setAttribute('aria-live', 'polite')
      document.body.append(toast)
    }
    toast.textContent = ''
    if (ok) {
      const l1 = make('span', 'plan-toast__line')
      l1.append('أرفق معه القالب: ', ltr(TEMPLATE, 'plan-toast__code'))
      const l2 = make('span', 'plan-toast__line')
      l2.append('واحفظ الناتج في: ', ltr(pg.sec.dir + '/' + pg.f, 'plan-toast__code'))
      toast.append(make('strong', '', 'تم نسخ الـ prompt'), l1, l2)
    } else {
      toast.append(
        make('strong', '', 'تعذّر النسخ تلقائيًا'),
        make('span', 'plan-toast__line', 'اسمح للمتصفح بالوصول إلى الحافظة ثم أعد الضغط.'),
      )
    }
    toast.classList.add('is-visible')
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 7000)
  }

  $$('button.stage-copy').forEach((btn) => {
    const pg = byId[btn.dataset.prompt]
    if (!pg) return
    btn.addEventListener('click', async () => {
      const ok = await copyText(build(pg))
      if (ok) flash(btn)
      showToast(pg, ok)
    })
  })

  // Clicking a stage number toggles "done"; state lives in this browser only
  let done = new Set()
  try {
    done = new Set(JSON.parse(localStorage.getItem(PROGRESS_KEY) || '[]'))
  } catch (_) {
    done = new Set()
  }
  const save = () => {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify([...done]))
    } catch (_) {}
  }

  const stats = $('.plan-stats')
  const progText = make('span', 'plan-progress__text')
  const progFill = make('span', 'plan-progress__fill')
  const progBar = make('span', 'plan-progress__bar')
  progBar.append(progFill)
  const progress = make('div', 'plan-progress')
  progress.setAttribute('aria-live', 'polite')
  progress.append(progText, progBar)
  if (stats) stats.after(progress)

  const updateProgress = () => {
    const d = all.filter((p) => done.has(p.id)).length
    progText.replaceChildren(...ltrNodes('المنجز: ' + d + ' من ' + all.length + ' صفحة'))
    progFill.style.width = (all.length ? (d / all.length) * 100 : 0) + '%'
  }

  all.forEach((pg) => {
    const badge = $('.stage-number', pg.card)
    if (!badge) return
    badge.removeAttribute('aria-hidden')
    badge.setAttribute('role', 'checkbox')
    badge.setAttribute('tabindex', '0')
    badge.setAttribute('aria-label', 'تعليم «' + pg.title + '» منجزة')
    badge.title = 'اضغط لتعليم هذه الصفحة منجزة'
    const sync = () => {
      const on = done.has(pg.id)
      pg.card.classList.toggle('is-done', on)
      badge.setAttribute('aria-checked', String(on))
    }
    const toggle = () => {
      done.has(pg.id) ? done.delete(pg.id) : done.add(pg.id)
      sync()
      save()
      updateProgress()
    }
    badge.addEventListener('click', toggle)
    badge.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        toggle()
      }
    })
    sync()
  })
  updateProgress()

  function renderLint() {
    const { errors, todo } = lint()
    const box = make('aside', 'callout plan-lint' + (errors.length ? ' callout--warning' : ''))
    box.append(make('span', 'callout__label', 'فحص البيانات'))
    const withTerms = all.filter((p) => p.x.length).length
    const sum = make('p')
    sum.append(
      ...ltrNodes(
        sections.length + ' أقسام · ' + all.length + ' مرحلة · أخطاء: ' + errors.length +
          ' · بيانات ناقصة: ' + todo.length + ' · مصطلحات (x) مكتوبة لـ ' + withTerms + ' من ' + all.length + ' مرحلة',
      ),
    )
    box.append(sum)
    const list = (title, items) => {
      if (!items.length) return
      box.append(make('p', 'plan-lint__title', title))
      const ul = make('ul')
      items.forEach((t) => {
        const li = make('li')
        li.append(...ltrNodes(t))
        ul.append(li)
      })
      box.append(ul)
    }
    list('أخطاء', errors)
    list('بيانات ناقصة', todo)
    const nav = $('.plan-nav')
    nav ? nav.after(box) : $('main').prepend(box)
  }
  if (/[?&]lint\b/.test(location.search)) renderLint()

  window.MATH_PROMPTS = {
    build: (idOrPage) => build(typeof idOrPage === 'string' ? byId[idOrPage] : idOrPage),
    pages: all,
    sections,
    lint,
  }
})()
