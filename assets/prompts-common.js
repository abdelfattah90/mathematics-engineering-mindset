/* ==========================================================================
   Mathematics for Software Engineers — prompts-common.js
   يعمل في index.html وحده: يربط زر «نسخ Prompt» في كل بطاقة (54 مرحلة) بـ prompt كامل يُبنى
   لحظة الضغط، فيُلصقه القارئ في محادثة جديدة مع templet-math.html ليُنتج صفحة تعليمية واحدة.
   ما يحمله هذا الملف:
     - الـ master prompt وعقيدة التدريس ومسار الرياضيات (KaTeX وfigure وقواعد التحقق)
     - قاعدة الاستئناف «Continue» وطريقة التسليم على مراحل (FREE_PLAN وDELIVERY)
     - بناء سياق كل صفحة: ما تتطلبه المرحلة، وما يعرفه القارئ الآن، والمصطلحات المعرَّفة، والصفحة التالية
     - إشعار النسخ، وتعليم المراحل المنجزة (localStorage)، وفحص البيانات (index.html?lint)
   مصدر البيانات:
     1) بطاقات index.html نفسها (DOM هو المصدر الوحيد لنصوص الخطة): رقم المرحلة، عنوانها بالإنجليزية
        والعربية، وصفها، موضوعاتها، المعرفة السابقة (.stage-prereq__text)، واسم القسم ووصفه. ومنها يُشتق
        اسم المجلد (NN-اسم-القسم) واسم الملف (NN-اسم-المرحلة.html).
     2) assets/plan-data.js (window.MATH_PLAN): ما لا يوجد في البطاقات — المصطلحات (x, u)، التمهيد (b)،
        الملاحظات (n)، وعند الحاجة dir/reader للقسم وf/t للمرحلة.
   يمكن اختبار الناتج من وحدة التحكم: MATH_PROMPTS.build('math-26')
   ========================================================================== */
;(() => {
  'use strict'

  const PLAN_NAME = 'Mathematics for Software Engineers'
  const PROGRESS_KEY = 'math-plan-done-v1'
  const EXPECTED_STAGES = 54
  const EXPECTED_SECTIONS = 6
  const STAGE_TOPICS = 3 // كل مرحلة = 3 موضوعات تُدرس وتُحَل كوحدة واحدة
  const MAX_PROMPT_CHARS = 27000
  const TEMPLATE = 'templet-math.html' // القالب الوحيد الذي يرفقه القارئ مع كل prompt

  // مراحل تشترط رسمًا لكل مفهوم مكاني أو بياني (الهندسة والمثلثات والتفاضل)، ومراحل الجبر الخطي
  const DRAW_RANGES = [[18, 25], [49, 53]]
  const LINALG_RANGES = [[46, 48]]
  const inRanges = (n, ranges) => ranges.some(([a, b]) => n >= a && n <= b)

  /* ------------------------------------------------------------------
     1) النصوص: الـ master prompt
  ------------------------------------------------------------------ */
  const READER_DEFAULT =
    'القارئ: مهندس برمجيات يعرف البرمجة عمومًا ويبني أساسًا رياضيًا عميقًا من الأعداد والعمليات إلى الجبر الخطي والتفاضل والتكامل: لا يريد حفظ القواعد بل فهم لماذا تصح، ومتى تفشل، وكيف يتحقق من جوابه، حتى يفسّر كل مفهوم ويشرحه لغيره بدقة. لا تعامله كمبتدئ في البرمجة ولا تُطِل في البديهيات البرمجية. لا تفترض معرفة رياضية إلا ما يرد تحت «ما تتطلبه هذه المرحلة» و«ما يعرفه القارئ الآن» و«المصطلحات المعرَّفة سابقًا» وما تنص عليه «ملاحظات خاصة» بالصفحة كمتطلب سابق.'

  const MASTER = `هذه الصفحة جزء من مرجع عربي بعنوان «Mathematics for Software Engineers»: خطة تعلّم رياضيات تبني لدى مهندس البرمجيات أساسًا رياضيًا عميقًا يبدأ من الأعداد والعمليات ويصل إلى الجبر الخطي والتفاضل والتكامل، بفهم يمكّنه من تفسير كل مفهوم وشرحه لغيره بدقة، لا بحفظ القواعد. تتألف الخطة من @@TOTAL@@ مرحلة في @@NSEC@@ أقسام: @@CHAIN@@. في كل مرحلة ثلاثة موضوعات تُدرس وتُحَل كوحدة واحدة، ولا تعتمد مرحلة إلا على ما سبقها. كل مرحلة صفحة HTML واحدة تُكتب في محادثة مستقلة، وهذه المحادثة هي كتابة صفحة واحدة. تُقرأ الصفحات في المتصفح فقط (لا طباعة ولا PDF)، ولا يُنفَّذ أي كود داخل الصفحة.
@@READER@@
عقيدة التدريس: المرجع يبني فهمًا لا حفظ قواعد. في كل مفهوم اتبع هذا التدرج: تعريف دقيق، ثم الحدس (لماذا يبدو الأمر هكذا؟)، ثم الصياغة الصحيحة للقاعدة أو النظرية بشروطها، ثم أمثلة محلولة بخطوات مبرَّرة وطريقة تحقق، ثم الفخاخ الشائعة، ثم أسئلة «اشرحها لغيرك» وتمارين متدرجة، مع ربط قصير بمشكلة برمجية حقيقية (رسوميات أو بيانات أو أداء أو تعلم آلي…). وعلّم القارئ أن يسأل دائمًا: لماذا تصح هذه القاعدة؟ ومتى تفشل؟ وما مثالها المضاد؟ وكيف أتحقق من جوابي بطريقة مختلفة؟

@@CONTEXT@@

@@STAGE@@

منهجية الشرح — ملاحظة مهمة جدًا:
* الإيقاع متدرّج وواضح: فكرة واحدة في كل فقرة وفقرات قصيرة، ولا قفز في الاستنتاج ولا حشو ولا تكرار. العمق مطلوب (لماذا؟ ولماذا يصح؟) لا الإطالة.
* الشرح بالعربية الفصحى المبسّطة، والمصطلحات الرياضية والتقنية بالإنجليزية، مع مراعاة RTL. الأرقام كلها بالصيغة اللاتينية 0–9 (مثل 1 و2 و3) في النص والعناوين والجداول والمعادلات، ولا تستعمل الأرقام الهندية المشرقية. وأي عنوان لصفحة أو قسم يُكتب بالإنجليزية أولًا ثم العربية مفصولين بـ « - » (مثل «Number Theory - نظرية الأعداد»).
* المصطلحات: كل مصطلح في «مصطلحات هذه الصفحة» يُعرَّف رسميًا في هذه الصفحة: ضعه داخل strong عند أول ذكر وعرّفه بجملة دقيقة ثم استخدمه بالإنجليزية. للمفاهيم الأساسية يجوز تشبيه واحد من الحياة اليومية إن أفاد، مع جملة «أين ينكسر التشبيه».
* لا تستخدم مفهومًا لم يُشرح تحت «ما تتطلبه هذه المرحلة» أو «ما يعرفه القارئ الآن» أو «المصطلحات المعرَّفة سابقًا» أو في هذه الصفحة؛ وإن لزم فعرّفه بجملة واحدة وقل إنه سيُشرح لاحقًا، ولا تتوسّع في موضوعات خارج القائمة. وإن وردت «مفاهيم تُستعمل هنا من صفحات سابقة» فذكّر بكل منها بجملة واحدة («تذكير: …») عند أول استعمال دون إعادة شرحها. ولا تفترض مرحلة غير مذكورة تحت «ما يعرفه القارئ الآن».
* نطاق الصفحة هو وصفها وموضوعاتها: وما تنص «ملاحظات خاصة» على تأجيله إلى مرحلة أخرى فلا تشرحه ولا تستعمله، واكتفِ بالإشارة إلى موضعه عند الحاجة.
* كل بند في قائمة الموضوعات = topic-block مستقل، بنفس الترتيب. مسار الموضوع: المشكلة (لماذا نحتاجه؟) ← التعريف الدقيق ← الحدس ← الصياغة الصحيحة (قاعدة أو نظرية أو صيغة بشروطها) ← أصغر مثال محلول بخطوات مبرَّرة وطريقة تحقق ← لماذا يعمل (برهان حيث يلزم) ← «لماذا يهمّ مهندس البرمجيات؟» ← الفخ الشائع في callout--warning. وموضوع مفهومي بلا مثال: شرح فقط.
* «توقّع ثم تحقّق»: قبل كل مثال نتيجته غير بديهية اكتب جملة تسأل القارئ «ماذا تتوقع؟» دون كشف الجواب، وبعد النتيجة قارنها بالتوقع وفسّر أي فرق.
* حيث يوجد فخ معروف اعرض أولًا الخطأ ونتيجته الخاطئة (أو المثال المضاد) ثم التصحيح ولماذا يعمل.
* قسم المقارنة اختياري ويُضاف فقط حين تكون فيه مفاضلة حقيقية (مثل التباديل والتوافيق)، بجدول المقارنة الموجود (≤ 4 أعمدة): «الميزة | الخيار أ | الخيار ب».
* الأمثلة: أرقام صغيرة يحسبها القارئ بالقلم، ومواقف برمجية قصيرة حين تفيد؛ بلا كود داخل الصفحة.
* الربط بين المراحل: إن وردت في «وصف هذه الصفحة في الخطة» أو في «ملاحظات خاصة بهذه الصفحة» إحالة إلى مرحلة أخرى تُدرس فيها مسألة مؤجَّلة، فاذكرها في جملة واحدة عند الموضوع الأنسب تمهيدًا لما سيأتي، دون شرح ما في تلك المرحلة.
* اتبع هيكل @@TEMPLATE@@ المرفق بالكامل، بما فيه <body data-toc> ووسم الـ link الذي يربط ../assets/style.css ووسم الـ script الذي يربط ../assets/stage.js: أبقِهما كما هما، ولا تنسخ أي CSS ولا JS إلى الملف، ولا تضف وسم style ولا classes ولا وسوم script أو link غير الموجودة في القالب، ولا footer. عنوان الصفحة (في title وفي h1 داخل الـ hero) وeyebrow ووجهة رابط الرجوع topbar__back ومسارات page-nav هي المحدَّدة تحت «موقع هذه الصفحة». احذف من الملف النهائي كل تعليقات القالب وعناصره النائبة وكل مكوّن اختياري لم تستعمله. إن لم تجد ملف القالب مرفقًا فاكتب سطرًا واحدًا تطلبه فيه ولا تبدأ الكتابة.

@@EXERCISES@@

@@TRACK@@

@@DELIVERY@@`

  const EXERCISES = `قسما «اختبر نفسك» و«تمرين شامل» — ملاحظة مهمة جدًا:
* بعد قسم المقارنة (إن وُجد) وقبل قسم الخلاصة قسمان متتاليان بهيكل القالب نفسه (quiz ثم exercise): topic-block لكل سؤال، والإجابات والحل داخل details.reveal كما في القالب.

القسم الأول «اختبر نفسك» (eyebrow: «اختبر نفسك»، وh2: «أسئلة نظرية»):
  - سؤال واحد على الأقل لكل موضوع أساسي، وبحد أقصى 5 أسئلة. نوّعها على مستويات متدرجة: فهم (عرّف وفسّر) ← تطبيق (احسب وتحقق) ← تحليل (قارن، أو اكتشف الخطأ أو المثال المضاد) ← قرار (متى تصح الطريقة ومتى لا؟). ويكون أحدها على الأقل «اشرحها لغيرك»: يطلب من القارئ أن يشرح بكلماته لزميل مهندس لماذا تصح قاعدة أو لماذا يفشل خطأ شائع، وإجابته نموذج شرح من جملتين إلى ثلاث.
  - كل سؤال مفهوم وحده: لا إحالات على ما لم يُعرض في الصفحة، وللمعادلات صيغة KaTeX كما في القالب.
  - قبل أول سؤال سطر ثابت: «حاول أن تجيب بنفسك قبل أن تفتح الإجابة تحت كل سؤال.»
  - هيكل كل سؤال: topic-block فيه h3 (topic-block__title) «سؤال n»، ثم نص السؤال في p، ثم details.reveal بعنوان «الإجابة» فيها جملتان إلى ثلاث (وطريقة التحقق في أسئلة الحساب) تنتهي بإحالة قصيرة «(راجع: اسم الموضوع)».

القسم الثاني «تمرين شامل» (eyebrow: «تمرين شامل»، وh2: عنوان التمرين نفسه):
  - تمرين واحد فقط: مسألة واحدة من موقف برمجي قصير (أو مسألة رياضية تطبيقية)، من 3 أو 4 خطوات مرقّمة (ol) تتدرّج: احسب ← تحقق بطريقة ثانية أو أصلح الخطأ ← فسّر أو قرّر ← اشرحها لغيرك. يجمع أهم موضوعات المرحلة (وما لا يغطيه تغطّيه أسئلة «اختبر نفسك») ويُنجَز على الورق في 10 إلى 20 دقيقة. الخطوة الأخيرة «اشرحها لغيرك» (عقلية المهندس): لماذا اخترنا هذا الحل؟ وماذا يتغير لو تغيّر المعطى؟
  - هيكله: p للسيناريو، ثم المعطيات (جدول صغير table-wrap--fit أو math-block) إن لزم، ثم الخطوات المرقّمة، ثم تلميح واحد اختياري داخل details.reveal.reveal--hint. لا تعرض النتائج هنا: مكانها في الحل.
  - الحل داخل details.reveal بعنوان «الحل»: حل كل خطوة بالترتيب (math-block أو جدول ثم شرح قصير) مع طريقة التحقق، ثم فقرة «عقلية المهندس» تجيب عن الخطوة الأخيرة. سقف الحل: شرح مختصر.
* آخر نقطة في الخلاصة: «عقلية المهندس: …» بجملة واحدة.`

  // شرط المستخدم حرفيًا: يُلصق في كل prompt قبل طريقة التسليم مباشرة، فيكون «آخر هذا النص» هو DELIVERY. لا تعدّل صياغته.
  const FREE_PLAN = 'أستخدم النسخة المجانية من claude.ai، وقد تنقطع المحادثة بحدود الاستخدام؛ فاعمل بالطريقة المذكورة في آخر هذا النص حتى أكتب «Continue» فتكمل دون فقد شيء'

  const DELIVERY = `طريقة التسليم والاستئناف — ملاحظة مهمة جدًا:
* الناتج ملف HTML واحد بمسار الحفظ المذكور أعلاه (يربط ملفَّي assets ولا يضمّنهما)، دون أي مقدمة أو شرح أو ملخص في المحادثة؛ ردّك النهائي سطر واحد فقط بعد اكتمال الملف.
* الحجم: كثّف ولا تُطِل: مثال واحد جيد لكل موضوع بدل ثلاثة، ولا تكرّر في الخلاصة ما قيل. لا تحذف أي موضوع ولا قسمي «اختبر نفسك» و«تمرين شامل» ولا الخلاصة؛ وإن ضاق المجال فاختصر الأمثلة الثانوية فقط.
* ابنِ الملف على مراحل بأدوات الملفات (أنشئ الملف ثم عدّله) حتى لا يضيع عملك إن انقطعت المحادثة بسبب حدود الاستخدام:
  1) أنشئ الملف أولًا بهيكله الكامل: head وtopbar وhero (بمقدمته) وكل الأقسام، وكل topic-block بعنوانها فقط، وفي كل كتلة ناقصة تعليق علامة بهذا الشكل بالضبط: <!--TODO:t1-->، <!--TODO:t2-->… بعدد الموضوعات، ثم <!--TODO:comparison--> (إن لزم)، <!--TODO:quiz-->، <!--TODO:exercise-->، <!--TODO:summary-->. وضع page-nav بروابطه النهائية.
  2) املأ العلامات بالترتيب، واحدة في كل خطوة: اكتب محتوى الموضوع كاملًا (شرحه ومثاله المحلول وتحقّقه وفخّه) ثم استبدل علامته به، دون إعادة كتابة الملف كله.
  3) في الختام ابحث بأمر grep عن «TODO» للتأكد من أنه لا توجد علامة متبقية، وأن الملف ينتهي بـ </html>، وأن كل وسم مفتوح مغلق؛ ثم أرسل الملف.
* إن انقطعت المحادثة وكتب القارئ «Continue»: افتح الملف الحالي وابحث بـ grep عن علامات TODO المتبقية فقط (لا تقرأ الملف كله)، وأكمل من أول علامة متبقية بالترتيب نفسه دون إعادة ما اكتمل ودون إعادة الهيكل ودون تلخيص أو اعتذار أو شرح لما حدث. إن وجدت كتلة مكتوبة بنصفها (وسم غير مغلق) فأعد كتابتها كاملة. ثم نفّذ الخطوة 3.
* إن لم تتح لك أدوات الملفات: سلّم الملف في دفعات، كل دفعة تنتهي عند نهاية topic-block كاملة وتختم بتعليق <!-- ✓ 2/5 -->، وتُختم الدفعة الأخيرة بـ </html>. وعند «Continue» أكمل من الدفعة التالية فقط بلا head ولا تكرار لما سبق، وإن انقطعت دفعة في منتصفها فأعدها من أولها بعلامة «إعادة».`

  /* ------------------------------------------------------------------
     2) مسار الرياضيات (المسار الوحيد) وقواعده الإضافية
  ------------------------------------------------------------------ */
  const MATH_TRACK = `مسار «رياضيات ونظرية»:
بيئة القراءة: الصفحة تُقرأ وتُحَل على الورق؛ لا كود ولا تجربة ولا code-block ولا output-block ولا مخططات ASCII، إلا إذا نصّت «ملاحظات خاصة» على غير ذلك.
* المعادلات والرموز بصيغة KaTeX كما في القالب: داخل السطر \\( … \\) (قصيرة)، وعلى سطر مستقل داخل <div class="math-block">\\[ … \\]</div>، وكل معادلة طويلة في math-block مستقل. لا تستعمل $ ولا $$، ولا حروفًا عربية داخل المعادلة (استعمل x وn وf(x))، والشرح بالعربية خارجها. اكتب \\lt و\\gt بدل < و>، و&amp; بدل & داخل aligned.
* كل مفهوم جديد: التعريف الدقيق في callout--definition (التسمية: تعريف | قاعدة | صيغة | نظرية)، ثم الحدس في فقرة قصيرة، ثم الصياغة الصحيحة للقاعدة أو النظرية بشروطها، ثم مثال محلول في div.example بأرقام صغيرة تُحسب بالقلم وخطوات مرقّمة مبرَّرة وجواب فيه طريقة التحقق (تعويض أو مثال مضاد أو حالة حدّية أو حساب بطريقة ثانية).
* البرهان حيث تلزم نظرية أو قاعدة غير بديهية: في callout--note بتسمية «برهان»، الفكرة أولًا ثم الخطوات في ol ثم «لماذا يكفي؟»، بلغة بسيطة وبلا قفزات. وحيث لا يدخل البرهان في نطاق الصفحة فاشرح سبب صحة القاعدة بالحدس والمثال دون ادّعاء برهان.
* بعد كل مفهوم فقرة قصيرة بعنوان strong «لماذا يهمّ مهندس البرمجيات؟» تربطه بمشكلة برمجية حقيقية (رسوميات أو بيانات أو أداء أو تعلم آلي أو أنظمة…) بمثال مختصر مفهوم بلا كود، معتمدةً على ما ورد في «وصف هذه الصفحة» و«ملاحظات خاصة» ودون شرح ما يقع خارج نطاقها. لا تذكر مراحل أي خطة أخرى.
* الفخ الشائع الخاص بكل موضوع في callout--warning: الخطأ ونتيجته الخاطئة أو مثاله المضاد أولًا ثم التصحيح.
* الجداول الصغيرة (جدول صواب أو جدول قيم) بـ table-wrap table-wrap--fit.
* الرسم (figure وsvg بـ viewBox وبـ classes الـ fg-* فقط، بلا style ولا ألوان ولا نص عربي داخل الـ svg، والتعليق العربي في figcaption، وwidth مساوٍ لعرض الـ viewBox حتى 560، وحد أقصى 40 سطرًا للرسم) عند الحاجة لمنحنى دالة أو رسم بياني أو شجرة أو شكل، لا للزينة. وللخطوات المنهجية (مثل حل المسائل) flow-diagram حين يفيد.
* أعد كل حساب بطريقة مختلفة قبل كتابته، ولا تعرض نتيجة لم تتحقق منها؛ والأرقام صغيرة ومفهومة. لا web search.`

  const DRAW_RULE =
    'قاعدة الرسم لهذه الصفحة (هندسية أو بيانية): لكل مفهوم مكاني أو بياني فيها (شكل أو زاوية أو منحنى أو ميل أو مماس أو مساحة تحت منحنى…) ارسم figure بعد تعريفه مباشرة مع figcaption عربي، ولا تكتفِ بوصفه كلامًا؛ واجعل أرقام الرسم مطابقة لأرقام المثال المحلول الذي يليه.'
  const LINALG_RULE =
    'قاعدة الأمثلة لهذه الصفحة (الجبر الخطي): كل مثال بأعداد صغيرة قابلة للحساب بالقلم (متجهات في بعدين أو ثلاثة ومصفوفات 2×2 أو 3×3 على الأكثر)، وتُعرض كل عملية حسابية خطوة خطوة ثم يُتحقق من الناتج بطريقة ثانية (مثل ضرب المصفوفة في معكوسها أو التعويض في المعادلات الأصلية).'

  /* ------------------------------------------------------------------
     3) نموذج الخطة: يُبنى من بطاقات index.html + assets/plan-data.js
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

  const PLAN = window.MATH_PLAN || {}
  const PLAN_SECTIONS = PLAN.sections || {}

  // كل الأرقام بالصيغة 1، 2، 3 (لا الهندية ١، ٢، ٣): تُحوَّل كلها عند بناء الـ prompt
  const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩'
  const toWestern = (s) => String(s).replace(/[٠-٩]/g, (d) => AR_DIGITS.indexOf(d))
  const stageRef = (n) => 'المرحلة ' + n
  const pad2 = (n) => String(n).padStart(2, '0')
  const slug = (s) => String(s).toLowerCase().replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  const topicLine = (k) => '* ' + k
  const cleanEnd = (s) => s.replace(/[.،\s]+$/, '')

  function stagePage(sec, card) {
    const n = +card.dataset.stage
    const cfg = (sec.cfg.stages || {})[n] || {}
    const en = norm($('.stage-title-en', card))
    const ar = norm($('.stage-title-ar', card)) || cfg.t || ''
    const title = ar ? en + ' - ' + ar : en
    return {
      id: card.id, card, sec, n, cfg, ar, en, title, short: title,
      d: norm($('.stage-description', card)),
      pre: norm($('.stage-prereq__text', card)),
      k: $$('.topic', card).map((li) => norm($('.topic-en', li)) + ' - ' + norm($('.topic-ar', li))),
      x: cfg.x || [], u: cfg.u || [], b: cfg.b || '', nt: cfg.n || '',
      slugEn: slug(en)
    }
  }

  const sections = $$('section.plan-section').map((el, idx) => {
    const name = norm($('.section-heading h2', el))
    const cfg = PLAN_SECTIONS[el.id] || {}
    const sec = {
      id: el.id, ID: el.id.toUpperCase(), el, idx, cfg, name,
      nameEn: name.split(' - ')[0],
      desc: norm($('.section-description', el)),
      dir: cfg.dir || pad2(idx + 1) + '-' + slug(name),
      pages: []
    }
    $$('article.stage-card', el).forEach((card) => {
      const pg = stagePage(sec, card)
      pg.i = sec.pages.length
      pg.f = pg.cfg.f || pad2(pg.i + 1) + '-' + pg.slugEn + '.html'
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
  const chain = () => sections.map((s) => s.ID + ' ' + s.name + ' (' + rangeOf(s) + ')').join(' ← ')

  // المصطلحات المعرَّفة قبل هذه الصفحة: أقسام الخطة السابقة، ثم صفحات هذا القسم السابقة
  function termsBefore(pg) {
    const out = []
    priorSections(pg.sec).forEach((s) => s.pages.forEach((p) => out.push(...p.x)))
    pg.sec.pages.slice(0, pg.i).forEach((p) => out.push(...p.x))
    return [...new Set(out)]
  }

  // سطر المصطلحات في الـ prompt: يقتصر على مصطلحات آخر قسمين سابقين وصفحات القسم نفسه
  // ومفاهيم «u» لهذه الصفحة؛ أما الأقدم فيكفي فيه «ما يعرفه القارئ الآن» (عناوين صفحاته)
  // حتى لا يكبر السطر مع كل قسم. والفحص (lint) يبقى على termsBefore الكاملة.
  const RECENT_SECTIONS = 2
  function termsForPrompt(pg) {
    const every = termsBefore(pg)
    const out = []
    priorSections(pg.sec).slice(-RECENT_SECTIONS).forEach((s) => s.pages.forEach((p) => out.push(...p.x)))
    pg.sec.pages.slice(0, pg.i).forEach((p) => out.push(...p.x))
    out.push(...pg.u.filter((t) => every.includes(t)))
    const terms = [...new Set(out)]
    return { terms, older: terms.length < every.length }
  }

  function knownBefore(pg) {
    const sec = pg.sec
    const lines = []
    priorSections(sec).forEach((s) => {
      if (!s.pages.length) return
      const noTerms = !s.pages.some((p) => p.x.length)
      lines.push('* ' + s.ID + ' ' + s.name + ': ' + s.pages.map((p) => p.short).join(' | ') + (noTerms ? ' (لم تُسجَّل مصطلحاتها بعد: اعتمد على عناوينها فقط)' : ''))
    })
    const before = sec.pages.slice(0, pg.i)
    if (before.length) {
      lines.push('* ' + sec.ID + ' — صفحات هذا القسم السابقة (مع موضوعات كل منها):')
      before.forEach((p) => lines.push('  - ' + p.short + ': ' + p.k.join('؛ ')))
    }
    return lines
  }

  // أول صفحة تجعل «السابق» وآخر صفحة تجعل «التالي» رابطًا إلى بطاقة القسم في الخطة
  function prevNext(pg) {
    const sec = pg.sec
    const home = { href: '../index.html#' + sec.id, title: 'خطة القسم ' + sec.ID + ' — ' + sec.nameEn }
    const at = (p) => ({ href: p.f, title: p.short })
    return {
      prev: sec.pages[pg.i - 1] ? at(sec.pages[pg.i - 1]) : home,
      next: sec.pages[pg.i + 1] ? at(sec.pages[pg.i + 1]) : home
    }
  }

  /* ------------------------------------------------------------------
     4) بناء الـ prompt لصفحة واحدة
  ------------------------------------------------------------------ */
  function build(pg) {
    const sec = pg.sec
    const nav = prevNext(pg)
    const total = sec.pages.length
    const eyebrow = sec.ID + ' · ' + sec.nameEn + ' · ' + pg.n

    const nextPage = sec.pages[pg.i + 1]
    const nextSec = sections.find((s) => s.idx > sec.idx)
    // سطر التمهيد: الضمير «لها» للصفحة التالية و«له» للقسم التالي (لا استبدال داخل نص b نفسه)
    const lead = (pron) => (pg.b ? '، لكن مهّد ' + pron + ' بقدر: ' + cleanEnd(pg.b) : '')
    const nextLine = nextPage
      ? 'الصفحة التالية: «' + nextPage.short + '» — لا تدخل في موضوعاتها' + lead('لها') + '.'
      : nextSec
        ? 'هذه آخر صفحة في القسم ' + sec.ID + '. القسم التالي: ' + nextSec.ID + ' «' + nextSec.name + '» — لا تدخل في موضوعاته' + lead('له') + '.'
        : 'هذه آخر صفحة في الخطة.'

    const known = knownBefore(pg)
    const { terms, older } = termsForPrompt(pg)
    const context =
      'موقع هذه الصفحة: ' + stageRef(pg.n) + ' من القسم ' + sec.ID + ' «' + sec.name + '»' +
      '، وهي الصفحة ' + (pg.i + 1) + ' من ' + total + ' في القسم.\n' +
      'عنوان الصفحة (في title وفي h1): ' + pg.title + '\n' +
      'eyebrow في الـ hero: ' + eyebrow + '\n' +
      'مسار الحفظ: ' + sec.dir + '/' + pg.f + '\n' +
      'رابط الرجوع topbar__back: href="../index.html#' + pg.id + '" ونصه «الخطة».\n' +
      'page-nav: «السابق» ← ' + nav.prev.href + ' بعنوان «' + nav.prev.title + '»؛ «التالي» ← ' + nav.next.href + ' بعنوان «' + nav.next.title + '».\n' +
      'ما تتطلبه هذه المرحلة (حقل Prerequisite knowledge في الخطة): ' + pg.pre + '\n' +
      'لا تستعمل مفهومًا خارج هذا الحقل وما شُرح في المراحل السابقة المذكورة أدناه.\n' +
      'ما يعرفه القارئ الآن (شُرح سابقًا؛ يجوز لك استخدامه دون إعادة شرحه، ولا تستخدم ما سواه):\n' +
      (known.length ? known.join('\n') : '* لا شيء — هذه بداية المرجع.') + '\n' +
      (older
        ? 'المصطلحات المعرَّفة سابقًا في الصفحات الأقرب (تُستعمل دون إعادة تعريف؛ وما عُرِّف في أقسام أقدم فلا يُعاد تعريفه أيضًا ويُذكَّر به عند الحاجة بجملة): '
        : 'المصطلحات المعرَّفة سابقًا (تُستعمل دون إعادة تعريف): ') + (terms.length ? terms.join('، ') : 'لا شيء بعد.') + '\n' +
      nextLine

    let stage = 'الصفحة الحالية (المطلوبة): ' + pg.title + '\nالموضوعات (topic-block لكل بند، بالترتيب):\n' + pg.k.map(topicLine).join('\n')
    if (pg.d) stage += '\nوصف هذه الصفحة في الخطة (يحدّد نطاقها: غطِّ كل ما ورد فيه ضمن موضوعاتها، ولا تضف ما ليس فيه): ' + pg.d
    if (pg.x.length) stage += '\nمصطلحات هذه الصفحة (تُعرَّف رسميًا في هذه الصفحة، كلٌّ منها داخل strong عند أول ذكر): ' + pg.x.join('، ')
    if (pg.u.length) stage += '\nمفاهيم تُستعمل هنا من صفحات سابقة (ذكّر بكل منها بجملة واحدة عند أول استعمال دون إعادة شرحها): ' + pg.u.join('، ')
    if (pg.nt) stage += '\nملاحظات خاصة بهذه الصفحة: ' + pg.nt

    const parts = [MATH_TRACK]
    if (inRanges(pg.n, DRAW_RANGES)) parts.push(DRAW_RULE)
    if (inRanges(pg.n, LINALG_RANGES)) parts.push(LINALG_RULE)
    if (sec.desc) parts.push('ملاحظات خاصة بالقسم كله: ' + sec.desc)

    return toWestern(MASTER.replace('@@TOTAL@@', () => String(all.length))
      .replace('@@NSEC@@', () => String(sections.length))
      .replace('@@CHAIN@@', () => chain())
      .replace('@@READER@@', () => sec.cfg.reader || READER_DEFAULT)
      .replace('@@TEMPLATE@@', () => TEMPLATE)
      .replace('@@CONTEXT@@', () => context)
      .replace('@@STAGE@@', () => stage)
      .replace('@@EXERCISES@@', () => EXERCISES)
      .replace('@@TRACK@@', () => parts.join('\n\n'))
      .replace('@@DELIVERY@@', () => FREE_PLAN + '\n\n' + DELIVERY))
  }

  /* ------------------------------------------------------------------
     5) فحص البيانات: errors = خلل لا بدّ من إصلاحه، todo = بيانات لم تُكتب بعد في plan-data.js
  ------------------------------------------------------------------ */
  // مراجع ممنوعة في أي prompt (خطة أخرى ومشروعها): تُكتب مجزّأة كي لا تظهر حرفيًا في هذا الملف نفسه
  const BANNED = ['Back' + 'end', 'Book' + 'ing', 'Fast' + 'API', 'Postgre' + 'SQL']

  function lint() {
    const errors = []
    const todoMap = new Map() // «قسم: نوع النقص» ← أرقام المراحل، فيُعرض سطر واحد لكل قسم ونوع
    const err = (m) => errors.push(m)
    const td = (sec, msg, who) => {
      const key = sec.ID + ': ' + msg
      if (!todoMap.has(key)) todoMap.set(key, [])
      if (who) todoMap.get(key).push(who)
    }

    // سلامة index.html: ترقيم متصل 1..54 في 6 أقسام، و3 موضوعات لكل مرحلة، ووصف ومعرفة سابقة لكل مرحلة
    const nums = all.map((p) => p.n)
    if (nums.length !== EXPECTED_STAGES || nums.some((n, i) => n !== i + 1)) err('ترقيم المراحل في index.html غير متصل أو عدده ليس ' + EXPECTED_STAGES)
    if (sections.length !== EXPECTED_SECTIONS) err('عدد الأقسام في index.html ' + sections.length + ' وليس ' + EXPECTED_SECTIONS)
    Object.keys(PLAN_SECTIONS).forEach((id) => !sections.some((s) => s.id === id) && err('plan-data.js: قسم غير موجود في index.html «' + id + '»'))

    sections.forEach((sec) => {
      const seenFiles = new Set()
      const stageNums = sec.pages.map((p) => String(p.n))
      Object.keys(sec.cfg.stages || {}).forEach((n) => !stageNums.includes(n) && err(sec.ID + ': plan-data.js فيه مرحلة ' + n + ' ليست في هذا القسم'))

      sec.pages.forEach((pg) => {
        const name = sec.ID + ' ' + pg.short
        if (seenFiles.has(pg.f)) err(name + ': اسم الملف مكرر')
        seenFiles.add(pg.f)
        if (!pg.d) err(name + ': لا وصف في index.html')
        if (!pg.pre) err(name + ': لا حقل «المعرفة السابقة» في index.html')
        if (!pg.ar) err(name + ': لا عنوان عربي في index.html')
        if (pg.k.length !== STAGE_TOPICS) err(name + ': ' + pg.k.length + ' موضوعات (الخطة: ' + STAGE_TOPICS + ' لكل مرحلة)')
        const known = termsBefore(pg)
        pg.u.forEach((t) => !known.includes(t) && err(name + ' ← ' + t + ' (مستعمل قبل تعريفه)'))
        if (!pg.x.length) td(sec, 'المصطلحات (x) غير مكتوبة', String(pg.n))
      })
    })

    // كل مصطلح يُعرَّف رسميًا في صفحة واحدة فقط (وغيرها تستعمله عبر u)
    const defined = new Map()
    all.forEach((pg) => pg.x.forEach((t) => {
      const first = defined.get(t)
      if (first && first !== pg) err('المصطلح «' + t + '» معرَّف في صفحتين: ' + first.sec.ID + ' ' + first.short + ' و' + pg.sec.ID + ' ' + pg.short)
      else defined.set(t, pg)
    }))

    // سلامة الـ prompts نفسها: القالب الوحيد، وسطر المعرفة السابقة، وخلوّها من مراجع خارجية، وحجمها
    all.forEach((pg) => {
      const text = build(pg)
      const name = pg.sec.ID + ' ' + pg.short
      if (!text.includes(TEMPLATE)) err(name + ': الـ prompt لا يذكر القالب ' + TEMPLATE)
      if (!text.includes('ما تتطلبه هذه المرحلة')) err(name + ': الـ prompt بلا سطر «ما تتطلبه هذه المرحلة»')
      BANNED.forEach((w) => text.includes(w) && err(name + ': الـ prompt يذكر «' + w + '»'))
      if (text.length > MAX_PROMPT_CHARS) err(name + ': حجم الـ prompt ' + text.length + ' حرفًا (الحد ' + MAX_PROMPT_CHARS + ')')
    })

    const todo = [...todoMap].map(([key, who]) => key + (who.length ? ' — المراحل: ' + who.join('، ') : ''))
    return { errors, todo }
  }

  /* ------------------------------------------------------------------
     6) الواجهة: نسخ الـ prompt، إشعار النسخ، المراحل المنجزة، فحص البيانات
  ------------------------------------------------------------------ */
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (_) {
      /* نكمل إلى البديل (صفحة مفتوحة من ملف أو بلا HTTPS) */
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

  // يبدّل حالة الزر مؤقتًا (.is-copied)؛ الشكل كله في CSS
  function flash(btn, ms = 1600) {
    btn.classList.add('is-copied')
    clearTimeout(btn._flashTimer)
    btn._flashTimer = setTimeout(() => btn.classList.remove('is-copied'), ms)
  }

  let toast = null
  let toastTimer = 0
  const ltr = (text) => {
    const b = make('bdi', 'plan-toast__code', text)
    b.dir = 'ltr'
    return b
  }
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
      l1.append('أرفق معه القالب: ', ltr(TEMPLATE))
      const l2 = make('span', 'plan-toast__line')
      l2.append('واحفظ الناتج في: ', ltr(pg.sec.dir + '/' + pg.f))
      toast.append(make('strong', '', 'تم نسخ الـ prompt'), l1, l2)
    } else {
      toast.append(make('strong', '', 'تعذّر النسخ تلقائيًا'), make('span', 'plan-toast__line', 'اسمح للمتصفح بالوصول إلى الحافظة ثم أعد الضغط.'))
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

  // المراحل المنجزة: الضغط على رقم المرحلة يبدّل حالتها (تُحفظ في هذا المتصفح فقط)
  let done = new Set()
  try {
    done = new Set(JSON.parse(localStorage.getItem(PROGRESS_KEY) || '[]'))
  } catch (_) {
    done = new Set()
  }
  const save = () => {
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify([...done])) } catch (_) {}
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
    progText.textContent = 'المنجز: ' + d + ' من ' + all.length + ' صفحة'
    progFill.style.width = (all.length ? (d / all.length) * 100 : 0) + '%'
  }

  all.forEach((pg) => {
    const badge = $('.stage-number', pg.card)
    if (!badge) return
    badge.removeAttribute('aria-hidden')
    badge.setAttribute('role', 'checkbox')
    badge.setAttribute('tabindex', '0')
    badge.setAttribute('aria-label', 'تعليم «' + pg.short + '» منجزة')
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

  // index.html?lint يعرض فحص البيانات تحت شريط الأقسام
  function renderLint() {
    const { errors, todo } = lint()
    const box = make('aside', 'callout plan-lint' + (errors.length ? ' callout--warning' : ''))
    box.append(make('span', 'callout__label', 'فحص البيانات'))
    const withTerms = all.filter((p) => p.x.length).length
    box.append(make('p', '', sections.length + ' أقسام · ' + all.length + ' مرحلة · أخطاء: ' + errors.length + ' · بيانات ناقصة: ' + todo.length + ' · مصطلحات (x) مكتوبة لـ ' + withTerms + ' من ' + all.length + ' مرحلة'))
    const list = (title, items) => {
      if (!items.length) return
      box.append(make('p', 'plan-lint__title', title))
      const ul = make('ul')
      items.forEach((t) => ul.append(make('li', '', t)))
      box.append(ul)
    }
    list('أخطاء', errors)
    list('بيانات ناقصة', todo)
    const nav = $('.plan-nav')
    nav ? nav.after(box) : $('main').prepend(box)
  }
  if (/[?&]lint\b/.test(location.search)) renderLint()

  // للاختبار من وحدة التحكم: MATH_PROMPTS.build('math-26')
  window.MATH_PROMPTS = {
    build: (idOrPage) => build(typeof idOrPage === 'string' ? byId[idOrPage] : idOrPage),
    pages: all,
    sections,
    lint
  }
})()
