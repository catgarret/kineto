(() => {
  const sets = window.MK_HELP_I18N;
  if (!sets) return;

  const copy = {
    ko: {
      mode: '가장자리 표현 방식입니다. shadow는 그림자, mask는 콘텐츠 자체를 투명하게 흐립니다.',
      shape: '그림자의 번짐 형태입니다.',
      axis: '스크롤 방향입니다.',
      size: '가장자리 효과가 차지하는 길이(px)입니다.',
      transitionMode: 'smooth는 마스크 가장자리를 보간하고, instant는 즉시 바꿉니다.',
      transitionDuration: '마스크 가장자리가 바뀌는 시간(초)입니다.',
      ease: '마스크 전환의 가속과 감속 곡선입니다.',
      opacity: '그림자를 얼마나 진하게 그릴지입니다. 0이면 가장자리 효과가 보이지 않습니다.',
      shadow: '그림자 색상입니다. CSS 변수 --kt-scroll-shadow로도 바꿀 수 있습니다.',
      color: '그림자를 가리는 컨테이너 배경색입니다.'
    },
    en: {
      mode: 'Edge treatment: shadow adds depth; mask fades the content itself.',
      shape: 'Shadow falloff shape.',
      axis: 'Scroll direction.',
      size: 'Length of the edge treatment in pixels.',
      transitionMode: 'Smooth interpolates mask edges; instant changes them immediately.',
      transitionDuration: 'Mask edge transition duration in seconds.',
      ease: 'Acceleration curve of the mask transition.',
      opacity: 'How strongly the edge is drawn. At 0 the effect is there but invisible.',
      shadow: 'Shadow color. You can also set --kt-scroll-shadow in CSS.',
      color: 'Container background color used to cover the shadow.'
    },
    ja: {
      mode: '端の表現方式。shadowは影、maskはコンテンツ自体を透明にします。',
      shape: '影の広がり方です。',
      axis: 'スクロール方向です。',
      size: '端の効果が占める長さ(px)です。',
      transitionMode: 'smoothはマスク端を補間し、instantは即座に切り替えます。',
      transitionDuration: 'マスク端の切り替え時間(秒)です。',
      ease: 'マスク切り替えのイージングです。',
      opacity: '縁をどれだけ濃く描くかです。0 では効果はあっても見えません。',
      shadow: '影の色。CSS変数--kt-scroll-shadowでも変更できます。',
      color: '影を覆うコンテナの背景色です。'
    },
    'zh-CN': {
      mode: '边缘表现方式：shadow 添加阴影，mask 让内容本身渐隐。',
      shape: '阴影的扩散形状。',
      axis: '滚动方向。',
      size: '边缘效果占用的长度(px)。',
      transitionMode: 'smooth 对遮罩边缘进行插值，instant 立即切换。',
      transitionDuration: '遮罩边缘切换时长（秒）。',
      ease: '遮罩切换的缓动曲线。',
      opacity: '边缘绘制的浓度。为 0 时效果存在但看不见。',
      shadow: '阴影颜色，也可通过 CSS 变量 --kt-scroll-shadow 设置。',
      color: '用于覆盖阴影的容器背景色。'
    },
    'zh-TW': {
      mode: '邊緣表現方式：shadow 加入陰影，mask 讓內容本身漸隱。',
      shape: '陰影的擴散形狀。',
      axis: '捲動方向。',
      size: '邊緣效果所占的長度(px)。',
      transitionMode: 'smooth 會補間遮罩邊緣，instant 會立即切換。',
      transitionDuration: '遮罩邊緣切換時間（秒）。',
      ease: '遮罩切換的緩動曲線。',
      opacity: '邊緣繪製的濃度。為 0 時效果存在但看不見。',
      shadow: '陰影顏色，也可透過 CSS 變數 --kt-scroll-shadow 設定。',
      color: '用來覆蓋陰影的容器背景色。'
    },
    ru: {
      mode: 'Оформление края: shadow добавляет тень, mask плавно скрывает сам контент.',
      shape: 'Форма затухания тени.',
      axis: 'Направление прокрутки.',
      size: 'Длина эффекта у края в пикселях.',
      transitionMode: 'Smooth интерполирует край маски, instant меняет его сразу.',
      transitionDuration: 'Длительность перехода края маски в секундах.',
      ease: 'Кривая ускорения перехода маски.',
      opacity: 'Насколько плотно рисуется край. При 0 эффект есть, но не виден.',
      shadow: 'Цвет тени. Также доступна CSS-переменная --kt-scroll-shadow.',
      color: 'Фон контейнера, перекрывающий тень.'
    },
    it: {
      mode: 'Trattamento del bordo: shadow aggiunge l’ombra, mask sfuma il contenuto.',
      shape: 'Forma della diffusione dell’ombra.',
      axis: 'Direzione di scorrimento.',
      size: 'Lunghezza dell’effetto sul bordo in pixel.',
      transitionMode: 'Smooth interpola il bordo della maschera; instant lo cambia subito.',
      transitionDuration: 'Durata della transizione del bordo, in secondi.',
      ease: 'Curva di accelerazione della transizione.',
      opacity: 'Quanto è marcato il bordo. A 0 l’effetto c’è ma non si vede.',
      shadow: 'Colore dell’ombra. Puoi usare anche la variabile CSS --kt-scroll-shadow.',
      color: 'Sfondo del contenitore usato per coprire l’ombra.'
    }
  };

  const hoverShadow = {
    ko: '호버 대상 위에서 커서 라벨 뒤에 적용할 그림자입니다.',
    en: 'Shadow applied behind the cursor label over a hover target.',
    ja: 'ホバー対象上でカーソルラベルの背後に適用する影です。',
    'zh-CN': '悬停目标上光标标签背后的阴影。',
    'zh-TW': '游標位於懸停目標上時，標籤背後套用的陰影。',
    ru: 'Тень под подписью курсора над интерактивной целью.',
    it: 'Ombra dietro l’etichetta del cursore sopra un elemento interattivo.'
  };

  const coverRevealColors = {
    ko: {
      colorMode: 'single은 한 색, pair는 두 색 조합, palette는 지정 목록 안에서 무작위 선택, auto는 이미지나 주변 배경과 어울리는 색을 만듭니다.',
      colors: 'palette 모드에서 사용할 CSS 색상 목록입니다. 쉼표 또는 |로 구분합니다.'
    },
    en: {
      colorMode: 'single uses one color, pair combines two, palette samples your list, and auto derives a harmonious set from the image or surrounding surface.',
      colors: 'CSS color list used by palette mode. Separate values with commas or |.'
    },
    ja: {
      colorMode: 'singleは1色、pairは2色、paletteは指定リストから選択、autoは画像や周辺背景に合う色を生成します。',
      colors: 'paletteモードで使うCSSカラー一覧。カンマまたは|で区切ります。'
    },
    'zh-CN': {
      colorMode: 'single 使用单色，pair 组合两色，palette 从指定列表选择，auto 根据图片或周围背景生成协调配色。',
      colors: 'palette 模式使用的 CSS 颜色列表，以逗号或 | 分隔。'
    },
    'zh-TW': {
      colorMode: 'single 使用單色，pair 組合兩色，palette 從指定清單選擇，auto 依圖片或周圍背景產生協調配色。',
      colors: 'palette 模式使用的 CSS 顏色清單，以逗號或 | 分隔。'
    },
    ru: {
      colorMode: 'single использует один цвет, pair — два, palette выбирает из списка, auto строит гармоничную палитру по изображению или фону.',
      colors: 'Список CSS-цветов для режима palette, разделённый запятыми или |.'
    },
    it: {
      colorMode: 'single usa un colore, pair ne combina due, palette sceglie dalla lista e auto ricava colori armonici dall’immagine o dallo sfondo.',
      colors: 'Elenco di colori CSS per la modalità palette, separati da virgole o |.'
    }
  };

  const glitchControls = {
    ko: {
      intensity: '이동량·노이즈·블록의 세기입니다.',
      speed: '한 번의 글리치가 재생되는 속도입니다.',
      frequency: '반복 글리치가 발생하는 빈도입니다.',
      randomness: '패턴과 발생 간격의 무작위성입니다. 0이면 일정하고 1이면 변화가 가장 큽니다.'
    },
    en: {
      intensity: 'Strength of displacement, noise, and block breakup.',
      speed: 'Playback speed of each glitch burst.',
      frequency: 'How often repeating glitches occur.',
      randomness: 'Variation in patterns and timing. 0 is steady; 1 is fully varied.'
    },
    ja: {
      intensity: 'ずれ・ノイズ・ブロック崩れの強さです。',
      speed: '1回のグリッチが再生される速度です。',
      frequency: '繰り返しグリッチが発生する頻度です。',
      randomness: 'パターンと発生間隔のランダム度。0は一定、1は変化が最大です。'
    },
    'zh-CN': {
      intensity: '位移、噪点和像素块破碎的强度。',
      speed: '单次故障脉冲的播放速度。',
      frequency: '重复故障发生的频率。',
      randomness: '图案与间隔的随机程度。0 为稳定，1 为变化最大。'
    },
    'zh-TW': {
      intensity: '位移、雜訊與像素塊破碎的強度。',
      speed: '單次故障脈衝的播放速度。',
      frequency: '重複故障發生的頻率。',
      randomness: '圖案與間隔的隨機程度。0 為穩定，1 為變化最大。'
    },
    ru: {
      intensity: 'Сила смещения, шума и распада на блоки.',
      speed: 'Скорость воспроизведения одного импульса сбоя.',
      frequency: 'Частота повторяющихся сбоев.',
      randomness: 'Разброс рисунка и интервалов: 0 — стабильно, 1 — максимум вариации.'
    },
    it: {
      intensity: 'Intensità di spostamento, rumore e frammentazione a blocchi.',
      speed: 'Velocità di riproduzione di ogni impulso glitch.',
      frequency: 'Frequenza degli impulsi glitch ripetuti.',
      randomness: 'Variazione di pattern e intervalli: 0 è stabile, 1 è la variazione massima.'
    }
  };

  const interactiveShadow = {
    ko: {
      enabled: '그림자를 켭니다. 기존 box-shadow와 다른 모듈의 그림자를 덮지 않고 합성합니다.',
      color: '그림자 색입니다. CSS의 모듈별 shadow color 변수로도 바꿀 수 있습니다.',
      opacity: '그림자 불투명도입니다.',
      blur: '그림자 번짐 반경(px)입니다.',
      spread: '그림자 크기 보정(px)입니다. 음수면 안쪽으로 조여집니다.',
      x: '기본 가로 이동 거리(px)입니다.',
      y: '기본 세로 이동 거리(px)입니다.',
      follow: '포인터 또는 기울기 방향을 따라 움직이는 정도입니다.',
      hoverOnly: '포인터가 올라왔을 때만 그림자를 표시합니다.',
      inset: '바깥 그림자 대신 카드 안쪽 그림자로 표시합니다.',
      css: '완성된 CSS box-shadow 값을 직접 지정합니다. 비워두면 위 옵션을 조합합니다.'
    },
    en: {
      enabled: 'Enable a shadow channel that composes with existing and other module shadows.',
      color: 'Shadow color. It can also be overridden with the module CSS variable.',
      opacity: 'Shadow opacity.',
      blur: 'Shadow blur radius in pixels.',
      spread: 'Shadow spread in pixels. Negative values tighten the shadow.',
      x: 'Base horizontal offset in pixels.',
      y: 'Base vertical offset in pixels.',
      follow: 'How strongly the shadow follows the pointer or tilt direction.',
      hoverOnly: 'Show the shadow only while the element is hovered.',
      inset: 'Render an inner shadow instead of an outer shadow.',
      css: 'A complete CSS box-shadow value. Leave blank to compose the controls above.'
    },
    ja: {
      enabled: '既存の影や他モジュールの影と合成されるシャドウを有効にします。',
      color: '影の色。モジュール別CSS変数でも変更できます。',
      opacity: '影の不透明度です。',
      blur: '影のぼかし半径(px)です。',
      spread: '影の広がり(px)。負の値で内側に締まります。',
      x: '基本の横オフセット(px)です。',
      y: '基本の縦オフセット(px)です。',
      follow: 'ポインターまたは傾きに影が追従する強さです。',
      hoverOnly: 'ホバー中だけ影を表示します。',
      inset: '外側ではなく内側の影にします。',
      css: '完成したCSS box-shadow値。空欄なら上の設定を合成します。'
    },
    'zh-CN': {
      enabled: '启用可与现有阴影及其他模块阴影叠加的阴影通道。',
      color: '阴影颜色，也可通过模块 CSS 变量覆盖。',
      opacity: '阴影不透明度。',
      blur: '阴影模糊半径(px)。',
      spread: '阴影扩展(px)，负值会收紧阴影。',
      x: '基础水平偏移(px)。',
      y: '基础垂直偏移(px)。',
      follow: '阴影跟随指针或倾斜方向的程度。',
      hoverOnly: '仅在悬停时显示阴影。',
      inset: '使用内阴影代替外阴影。',
      css: '完整的 CSS box-shadow 值。留空则组合以上选项。'
    },
    'zh-TW': {
      enabled: '啟用可與既有陰影及其他模組陰影疊加的陰影通道。',
      color: '陰影顏色，也可透過模組 CSS 變數覆寫。',
      opacity: '陰影不透明度。',
      blur: '陰影模糊半徑(px)。',
      spread: '陰影擴張(px)，負值會收緊陰影。',
      x: '基礎水平位移(px)。',
      y: '基礎垂直位移(px)。',
      follow: '陰影跟隨游標或傾斜方向的程度。',
      hoverOnly: '僅在懸停時顯示陰影。',
      inset: '使用內陰影取代外陰影。',
      css: '完整的 CSS box-shadow 值。留空則組合以上選項。'
    },
    ru: {
      enabled: 'Включает тень, которая сочетается с исходной тенью и тенями других модулей.',
      color: 'Цвет тени; его также можно переопределить CSS-переменной модуля.',
      opacity: 'Непрозрачность тени.',
      blur: 'Радиус размытия тени в пикселях.',
      spread: 'Расширение тени в пикселях; отрицательное значение сжимает её.',
      x: 'Базовое смещение по горизонтали в пикселях.',
      y: 'Базовое смещение по вертикали в пикселях.',
      follow: 'Насколько тень следует за указателем или наклоном.',
      hoverOnly: 'Показывать тень только при наведении.',
      inset: 'Использовать внутреннюю тень вместо внешней.',
      css: 'Полное значение CSS box-shadow. Оставьте пустым для сборки из настроек выше.'
    },
    it: {
      enabled: 'Attiva un’ombra che si combina con quella esistente e con le ombre degli altri moduli.',
      color: 'Colore dell’ombra, modificabile anche con la variabile CSS del modulo.',
      opacity: 'Opacità dell’ombra.',
      blur: 'Raggio di sfocatura dell’ombra in pixel.',
      spread: 'Espansione dell’ombra in pixel; un valore negativo la restringe.',
      x: 'Spostamento orizzontale di base in pixel.',
      y: 'Spostamento verticale di base in pixel.',
      follow: 'Quanto l’ombra segue il puntatore o l’inclinazione.',
      hoverOnly: 'Mostra l’ombra solo durante il passaggio del puntatore.',
      inset: 'Usa un’ombra interna invece di una esterna.',
      css: 'Valore CSS box-shadow completo. Lascia vuoto per combinare i controlli sopra.'
    }
  };

  const loaderControls = {
    ko: {
      direction: '반복 모션의 진행 방향입니다.', transformOrigin: '회전·이동·크기 변화의 CSS transform-origin 값입니다. 예: center, left center, 50% 100%.', motionDuration: '반복 한 주기의 시간(초)입니다.', linecap: '원형 진행선 끝 모양입니다.', indeterminate: '완료 시점을 모를 때 진행률 숫자 없이 반복합니다.', radius: '바 또는 터미널 표면의 모서리 반경(px)입니다.', glow: '로더 주변 후광을 표시합니다.', glowColor: '후광 색입니다. HEX·RGB·RGBA·HSL을 지원합니다.', glowSize: '후광이 퍼지는 크기(px)입니다.', spinnerStyle: '스피너의 회전 구조입니다.', dotStyle: '점이 반응하는 방식입니다.', dotCount: '표시할 점 또는 스포크 수입니다.', dotSize: '점 하나의 크기(px)입니다.', dotGap: '점 사이 간격(px)입니다.', text: '시머 또는 터미널에 표시할 문구입니다.', textSize: '시머 문구 크기(px)입니다.', baseColor: '빛이 지나가기 전 기본 글자색입니다.', highlightColor: '지나가는 빛 또는 보조 링 색입니다.', spread: '시머 하이라이트 폭(%)입니다.', fontFamily: '사용할 CSS font-family 값입니다.', terminalStyle: 'CLI 로딩 표시 방식입니다.', frameInterval: 'ASCII·유니코드 프레임이 다음 문자로 바뀌는 간격(ms)입니다.', terminalPrompt: '명령 앞에 붙는 프롬프트입니다.', terminalLines: 'steps에서 순서대로 표시할 문구를 |로 구분합니다.', cursorChar: 'cursor에서 점멸할 문자입니다.', terminalBackground: '터미널 표면 배경색입니다.', terminalBorderColor: '터미널 표면 테두리색입니다.'
    },
    en: {
      direction: 'Direction of the repeating motion.', transformOrigin: 'CSS transform-origin used by rotation, translation and scale motion, for example center or 50% 100%.', motionDuration: 'Duration of one motion cycle in seconds.', linecap: 'Shape of the circular progress line ends.', indeterminate: 'Loop without a numeric value when completion time is unknown.', radius: 'Corner radius of the bar or terminal surface.', glow: 'Show a glow around the loader.', glowColor: 'Glow color; HEX, RGB, RGBA and HSL are accepted.', glowSize: 'Glow spread in pixels.', spinnerStyle: 'Rotational structure of the spinner.', dotStyle: 'How the dots animate.', dotCount: 'Number of dots or spokes.', dotSize: 'Size of each dot in pixels.', dotGap: 'Gap between dots in pixels.', text: 'Text shown by shimmer or terminal loaders.', textSize: 'Shimmer text size in pixels.', baseColor: 'Base text color before the highlight passes.', highlightColor: 'Moving highlight or secondary ring color.', spread: 'Width of the shimmer highlight.', fontFamily: 'CSS font-family value.', terminalStyle: 'CLI loading presentation.', frameInterval: 'Interval in milliseconds between ASCII or Unicode frames.', terminalPrompt: 'Prompt shown before a command.', terminalLines: 'Separate step messages with |.', cursorChar: 'Blinking character in cursor mode.', terminalBackground: 'Terminal surface background.', terminalBorderColor: 'Terminal surface border color.'
    },
    ja: {
      direction: '繰り返しモーションの方向です。', transformOrigin: '回転・移動・拡大縮小に使うCSS transform-origin値です。例: center、50% 100%。', motionDuration: '1周期の時間(秒)です。', linecap: '円形進行線の端の形です。', indeterminate: '完了時刻が不明な場合、数値なしで繰り返します。', radius: 'バーまたはターミナルの角丸(px)です。', glow: 'ローダー周囲の光を表示します。', glowColor: '光の色です。HEX・RGB・RGBA・HSLに対応します。', glowSize: '光の広がり(px)です。', spinnerStyle: 'スピナーの回転構造です。', dotStyle: '点の動き方です。', dotCount: '点またはスポークの数です。', dotSize: '点の大きさ(px)です。', dotGap: '点の間隔(px)です。', text: 'シマーまたはターミナルの文言です。', textSize: 'シマー文字サイズ(px)です。', baseColor: '光が通る前の基本文字色です。', highlightColor: '移動する光または補助リングの色です。', spread: 'シマー光の幅です。', fontFamily: 'CSS font-family値です。', terminalStyle: 'CLIローディングの表示方式です。', frameInterval: 'ASCII・Unicodeフレームが切り替わる間隔(ms)です。', terminalPrompt: 'コマンド前のプロンプトです。', terminalLines: 'stepsの文言を|で区切ります。', cursorChar: 'cursorで点滅する文字です。', terminalBackground: 'ターミナル表面の背景色です。', terminalBorderColor: 'ターミナル表面の枠線色です。'
    },
    'zh-CN': {
      direction: '循环动画的方向。', transformOrigin: '旋转、位移和缩放动画使用的 CSS transform-origin 值，例如 center 或 50% 100%。', motionDuration: '一次动画循环的时长（秒）。', linecap: '圆形进度线的端点形状。', indeterminate: '完成时间未知时，不显示数值并循环。', radius: '进度条或终端表面的圆角(px)。', glow: '显示加载器周围的光晕。', glowColor: '光晕颜色，支持 HEX、RGB、RGBA 和 HSL。', glowSize: '光晕扩散大小(px)。', spinnerStyle: '旋转加载器的结构。', dotStyle: '圆点的动画方式。', dotCount: '圆点或辐条数量。', dotSize: '单个圆点大小(px)。', dotGap: '圆点间距(px)。', text: '微光或终端加载器显示的文字。', textSize: '微光文字大小(px)。', baseColor: '高光经过前的基础文字颜色。', highlightColor: '移动高光或辅助圆环颜色。', spread: '微光高亮宽度。', fontFamily: 'CSS font-family 值。', terminalStyle: 'CLI 加载显示方式。', frameInterval: 'ASCII 或 Unicode 帧切换的间隔（毫秒）。', terminalPrompt: '命令前显示的提示符。', terminalLines: '用 | 分隔 steps 文本。', cursorChar: 'cursor 模式中闪烁的字符。', terminalBackground: '终端表面背景色。', terminalBorderColor: '终端表面边框色。'
    },
    'zh-TW': {
      direction: '循環動畫的方向。', transformOrigin: '旋轉、位移與縮放動畫使用的 CSS transform-origin 值，例如 center 或 50% 100%。', motionDuration: '一次動畫循環的時長（秒）。', linecap: '圓形進度線的端點形狀。', indeterminate: '完成時間未知時，不顯示數值並循環。', radius: '進度列或終端表面的圓角(px)。', glow: '顯示載入器周圍的光暈。', glowColor: '光暈顏色，支援 HEX、RGB、RGBA 和 HSL。', glowSize: '光暈擴散大小(px)。', spinnerStyle: '旋轉載入器的結構。', dotStyle: '圓點的動畫方式。', dotCount: '圓點或輻條數量。', dotSize: '單個圓點大小(px)。', dotGap: '圓點間距(px)。', text: '微光或終端載入器顯示的文字。', textSize: '微光文字大小(px)。', baseColor: '高光經過前的基礎文字顏色。', highlightColor: '移動高光或輔助圓環顏色。', spread: '微光高亮寬度。', fontFamily: 'CSS font-family 值。', terminalStyle: 'CLI 載入顯示方式。', frameInterval: 'ASCII 或 Unicode 畫格切換的間隔（毫秒）。', terminalPrompt: '命令前顯示的提示字元。', terminalLines: '用 | 分隔 steps 文字。', cursorChar: 'cursor 模式中閃爍的字元。', terminalBackground: '終端表面背景色。', terminalBorderColor: '終端表面邊框色。'
    },
    ru: {
      direction: 'Направление повторяющегося движения.', transformOrigin: 'Значение CSS transform-origin для вращения, перемещения и масштаба, например center или 50% 100%.', motionDuration: 'Длительность одного цикла в секундах.', linecap: 'Форма концов круговой линии.', indeterminate: 'Цикл без числа, когда время завершения неизвестно.', radius: 'Радиус углов полосы или терминала.', glow: 'Показывать свечение вокруг индикатора.', glowColor: 'Цвет свечения: HEX, RGB, RGBA или HSL.', glowSize: 'Размер свечения в пикселях.', spinnerStyle: 'Структура вращающегося индикатора.', dotStyle: 'Способ анимации точек.', dotCount: 'Количество точек или лучей.', dotSize: 'Размер точки в пикселях.', dotGap: 'Интервал между точками.', text: 'Текст шиммера или терминала.', textSize: 'Размер текста шиммера.', baseColor: 'Основной цвет текста до блика.', highlightColor: 'Цвет движущегося блика или второго кольца.', spread: 'Ширина блика шиммера.', fontFamily: 'Значение CSS font-family.', terminalStyle: 'Вид CLI-индикатора.', frameInterval: 'Интервал между ASCII- или Unicode-кадрами в миллисекундах.', terminalPrompt: 'Приглашение перед командой.', terminalLines: 'Разделяйте строки steps символом |.', cursorChar: 'Мигающий символ режима cursor.', terminalBackground: 'Фон поверхности терминала.', terminalBorderColor: 'Цвет рамки терминала.'
    },
    it: {
      direction: 'Direzione del movimento ripetuto.', transformOrigin: 'Valore CSS transform-origin usato da rotazione, spostamento e scala, ad esempio center o 50% 100%.', motionDuration: 'Durata di un ciclo in secondi.', linecap: 'Forma delle estremità del progresso circolare.', indeterminate: 'Ripete senza valore quando la fine è ignota.', radius: 'Raggio degli angoli della barra o del terminale.', glow: 'Mostra il bagliore intorno al loader.', glowColor: 'Colore del bagliore: HEX, RGB, RGBA o HSL.', glowSize: 'Estensione del bagliore in pixel.', spinnerStyle: 'Struttura rotante dello spinner.', dotStyle: 'Modalità di animazione dei punti.', dotCount: 'Numero di punti o raggi.', dotSize: 'Dimensione di ogni punto in pixel.', dotGap: 'Spazio tra i punti.', text: 'Testo dello shimmer o del terminale.', textSize: 'Dimensione del testo shimmer.', baseColor: 'Colore base prima del passaggio della luce.', highlightColor: 'Colore della luce o dell’anello secondario.', spread: 'Larghezza della luce shimmer.', fontFamily: 'Valore CSS font-family.', terminalStyle: 'Presentazione del loader CLI.', frameInterval: 'Intervallo in millisecondi tra i fotogrammi ASCII o Unicode.', terminalPrompt: 'Prompt prima del comando.', terminalLines: 'Separa le righe steps con |.', cursorChar: 'Carattere lampeggiante in cursor.', terminalBackground: 'Sfondo del terminale.', terminalBorderColor: 'Colore del bordo del terminale.'
    }
  };

  const sliderControls = {
    ko: {
      preset: '전환 효과입니다. fade는 단순 교차, dissolve는 입자·블러, wipe는 방향 마스크이며 coverflow·flip·cube·cards·creative는 서로 다른 3D 구성을 사용합니다.',
      effectDirection: 'wipe가 열리는 방향입니다.',
      effectIntensity: '디졸브·와이프·3D 효과의 이동, 회전, 블러 강도입니다.',
      activeShadow: 'Coverflow의 활성 슬라이드에 실루엣을 따르는 그림자를 표시합니다.',
      activeShadowOpacity: '활성 그림자의 불투명도입니다. CSS 변수로 색·위치·블러도 바꿀 수 있습니다.',
      scrollSnap: '단순한 수평 slide에서 브라우저 native scrolling과 CSS Scroll Snap을 사용합니다. 조건 밖 구성은 기존 엔진으로 fallback합니다.',
      drag: '마우스나 펜으로 끌어 슬라이드를 이동합니다.',
      touch: '터치 스와이프를 허용합니다.',
      keyboard: '포커스된 슬라이더에서 방향키·Home·End를 사용합니다.'
    },
    en: {
      preset: 'Transition effect. Fade crossfades; dissolve adds grain and blur; wipe uses a directional mask; coverflow, flip, cube, cards and creative use distinct 3D scenes.',
      effectDirection: 'Direction in which the wipe opens.',
      effectIntensity: 'Movement, rotation and blur strength for dissolve, wipe and 3D effects.',
      activeShadow: 'Add a silhouette-following shadow to the active Coverflow slide.',
      activeShadowOpacity: 'Active-shadow opacity. CSS variables also control its colour, offset and blur.',
      scrollSnap: 'Use native scrolling and CSS Scroll Snap for a simple horizontal slide; other configurations fall back to the transform engine.',
      drag: 'Allow mouse or pen dragging.',
      touch: 'Allow touch swiping.',
      keyboard: 'Use arrow, Home and End keys while the slider is focused.'
    },
    ja: {
      preset: '切り替え効果。fadeは交差、dissolveは粒子とぼかし、wipeは方向マスク、その他は異なる3D構成です。',
      effectDirection: 'wipeが開く方向です。', effectIntensity: 'ディゾルブ・ワイプ・3D効果の移動、回転、ぼかしの強さです。',
      activeShadow: 'Coverflowのアクティブスライドに輪郭沿いの影を表示します。', activeShadowOpacity: '影の不透明度。色・位置・ぼかしはCSS変数でも調整できます。', scrollSnap: 'シンプルな横スライダーではネイティブスクロールと CSS Scroll Snap を使い、条件外は既存エンジンに戻ります。',
      drag: 'マウスまたはペンのドラッグを許可します。', touch: 'タッチスワイプを許可します。', keyboard: 'フォーカス中に矢印・Home・Endキーを使います。'
    },
    'zh-CN': {
      preset: '切换效果：fade 交叉淡入，dissolve 添加颗粒和模糊，wipe 使用方向遮罩，其他模式使用不同的 3D 场景。',
      effectDirection: 'wipe 展开的方向。', effectIntensity: '溶解、擦除和 3D 效果的移动、旋转与模糊强度。',
      activeShadow: '为 Coverflow 当前滑块添加跟随轮廓的阴影。', activeShadowOpacity: '当前阴影透明度；颜色、偏移和模糊也可用 CSS 变量调整。', scrollSnap: '简单水平滑块使用原生滚动和 CSS Scroll Snap，其他配置会回退到变换引擎。',
      drag: '允许鼠标或手写笔拖动。', touch: '允许触摸滑动。', keyboard: '聚焦时使用方向键、Home 和 End。'
    },
    'zh-TW': {
      preset: '切換效果：fade 交叉淡入，dissolve 加入顆粒與模糊，wipe 使用方向遮罩，其他模式使用不同的 3D 場景。',
      effectDirection: 'wipe 展開的方向。', effectIntensity: '溶解、擦除與 3D 效果的移動、旋轉及模糊強度。',
      activeShadow: '為 Coverflow 目前投影片加入跟隨輪廓的陰影。', activeShadowOpacity: '目前陰影透明度；顏色、位移與模糊也可用 CSS 變數調整。', scrollSnap: '簡單的水平滑桿使用原生捲動與 CSS Scroll Snap，其他設定會回退到變換引擎。',
      drag: '允許滑鼠或手寫筆拖曳。', touch: '允許觸控滑動。', keyboard: '聚焦時使用方向鍵、Home 與 End。'
    },
    ru: {
      preset: 'Эффект перехода: fade — кроссфейд, dissolve — зерно и размытие, wipe — направленная маска, остальные режимы используют разные 3D-сцены.',
      effectDirection: 'Направление раскрытия wipe.', effectIntensity: 'Сила движения, вращения и размытия эффектов.',
      activeShadow: 'Добавить тень по силуэту активного слайда Coverflow.', activeShadowOpacity: 'Прозрачность тени; цвет, смещение и размытие также задаются CSS-переменными.', scrollSnap: 'Простой горизонтальный слайдер использует нативную прокрутку и CSS Scroll Snap; другие конфигурации переходят на transform-движок.',
      drag: 'Разрешить перетаскивание мышью или пером.', touch: 'Разрешить свайпы.', keyboard: 'Использовать стрелки, Home и End в фокусе.'
    },
    it: {
      preset: 'Effetto di transizione: fade incrocia, dissolve aggiunge grana e sfocatura, wipe usa una maschera direzionale; gli altri usano scene 3D distinte.',
      effectDirection: 'Direzione di apertura del wipe.', effectIntensity: 'Intensità di movimento, rotazione e sfocatura degli effetti.',
      activeShadow: 'Aggiunge un’ombra che segue la sagoma della slide Coverflow attiva.', activeShadowOpacity: 'Opacità dell’ombra; colore, offset e sfocatura restano regolabili via CSS.', scrollSnap: 'Uno slider orizzontale semplice usa lo scorrimento nativo e CSS Scroll Snap; le altre configurazioni fanno fallback al motore transform.',
      drag: 'Consenti il trascinamento con mouse o penna.', touch: 'Consenti lo scorrimento touch.', keyboard: 'Usa frecce, Home e Fine quando lo slider è attivo.'
    }
  };

  const bottomSheetControls = {
    ko: {
      resizeArea: 'handle은 상단 막대에서 조절합니다. header를 선택하면 상단 막대와 지정한 헤더 영역을 모두 끌 수 있고 본문 텍스트는 선택할 수 있습니다.',
      minHeight: '드래그로 줄일 수 있는 최소 높이(px)입니다.',
      maxHeight: '드래그로 늘릴 수 있는 최대 높이(px)입니다.'
    },
    en: {
      resizeArea: 'Handle uses the top grip. Header enables both the top grip and the authored header while body text remains selectable.',
      minHeight: 'Minimum drag-resized height in pixels.', maxHeight: 'Maximum drag-resized height in pixels.'
    },
    ja: {
      resizeArea: 'handleは上部グリップで調整します。headerでは上部グリップと指定ヘッダーの両方をドラッグでき、本文は選択できます。',
      minHeight: 'ドラッグ時の最小高さ(px)です。', maxHeight: 'ドラッグ時の最大高さ(px)です。'
    },
    'zh-CN': {
      resizeArea: 'handle 使用顶部把手；header 可同时拖动顶部把手和指定标题区，正文仍可选择。',
      minHeight: '拖动调整的最小高度(px)。', maxHeight: '拖动调整的最大高度(px)。'
    },
    'zh-TW': {
      resizeArea: 'handle 使用頂部把手；header 可同時拖曳頂部把手與指定標題區，內文仍可選取。',
      minHeight: '拖曳調整的最小高度(px)。', maxHeight: '拖曳調整的最大高度(px)。'
    },
    ru: {
      resizeArea: 'Handle использует верхнюю ручку. Header позволяет тянуть и ручку, и заданный заголовок; текст остаётся выделяемым.',
      minHeight: 'Минимальная высота после перетаскивания.', maxHeight: 'Максимальная высота после перетаскивания.'
    },
    it: {
      resizeArea: 'Handle usa la maniglia. Header permette di trascinare sia la maniglia sia l’intestazione, lasciando selezionabile il testo.',
      minHeight: 'Altezza minima durante il trascinamento.', maxHeight: 'Altezza massima durante il trascinamento.'
    }
  };

  const horizontalScrollControls = {
    ko: {
      height: '고정되는 데모 뷰포트 높이입니다. 70svh, 520px처럼 입력합니다.',
      top: '고정 중 화면 위쪽에서 띄울 거리입니다. 비우면 스테이지를 수직 중앙에 맞춥니다.',
      smooth: '세로 스크롤 값을 가로 이동에 부드럽게 보간합니다. 끄면 스크롤 위치와 즉시 맞춥니다.'
    },
    en: {
      height: 'Height of the pinned demo viewport, such as 70svh or 520px.',
      top: 'Distance from the viewport top while pinned. Leave blank to center the stage vertically.',
      smooth: 'Interpolates horizontal movement behind page scroll. Off follows the scroll position exactly.'
    },
    ja: {
      height: '固定されるデモ領域の高さ。70svh、520pxのように指定します。',
      top: '固定中の上端距離。空欄ならステージを縦中央に配置します。',
      smooth: '縦スクロールから横移動を補間します。オフでは位置を即時同期します。'
    },
    'zh-CN': {
      height: '固定演示视口的高度，例如 70svh 或 520px。',
      top: '固定时距视口顶部的距离。留空则垂直居中。',
      smooth: '平滑插值横向移动；关闭后与滚动位置立即同步。'
    },
    'zh-TW': {
      height: '固定展示視口的高度，例如 70svh 或 520px。',
      top: '固定時距視口頂部的距離。留空則垂直置中。',
      smooth: '平滑補間橫向移動；關閉後與捲動位置立即同步。'
    },
    ru: {
      height: 'Высота закреплённой области, например 70svh или 520px.',
      top: 'Отступ от верха экрана. Пустое значение центрирует сцену по вертикали.',
      smooth: 'Сглаживает горизонтальное движение; выключение точно синхронизирует его с прокруткой.'
    },
    it: {
      height: 'Altezza dell’area fissata, ad esempio 70svh o 520px.',
      top: 'Distanza dall’alto durante il pin. Vuoto centra la scena verticalmente.',
      smooth: 'Interpola il movimento orizzontale; disattivato segue subito lo scorrimento.'
    }
  };

  Object.entries(copy).forEach(([locale, values]) => {
    if (!sets[locale]) return;
    sets[locale].scrollShadows = { ...(sets[locale].scrollShadows || {}), ...values };
    sets[locale].coverReveal = { ...(sets[locale].coverReveal || {}), ...coverRevealColors[locale] };
    sets[locale].cursor = { ...(sets[locale].cursor || {}), hoverShadow: hoverShadow[locale] };
    sets[locale].glitch = { ...(sets[locale].glitch || {}), ...glitchControls[locale] };
    sets[locale].loader = { ...(sets[locale].loader || {}), linecap: loaderControls[locale].linecap, radius: loaderControls[locale].radius };
    sets[locale].loadingIndicator = { ...(sets[locale].loadingIndicator || {}), ...loaderControls[locale] };
    sets[locale].slider = { ...(sets[locale].slider || {}), ...sliderControls[locale] };
    sets[locale].bottomSheet = { ...(sets[locale].bottomSheet || {}), ...bottomSheetControls[locale] };
    sets[locale].horizontalScroll = { ...(sets[locale].horizontalScroll || {}), ...horizontalScrollControls[locale] };
    const shadow = interactiveShadow[locale];
    sets[locale].cardGlow = {
      ...(sets[locale].cardGlow || {}),
      shadow: shadow.enabled,
      shadowColor: shadow.color,
      shadowOpacity: shadow.opacity,
      shadowBlur: shadow.blur,
      shadowSpread: shadow.spread,
      shadowX: shadow.x,
      shadowY: shadow.y,
      shadowFollow: shadow.follow,
      shadowHoverOnly: shadow.hoverOnly,
      shadowInset: shadow.inset,
      shadowCss: shadow.css
    };
    sets[locale].tilt = {
      ...(sets[locale].tilt || {}),
      tiltShadow: shadow.enabled,
      tiltShadowColor: shadow.color,
      tiltShadowOpacity: shadow.opacity,
      tiltShadowBlur: shadow.blur,
      tiltShadowSpread: shadow.spread,
      tiltShadowX: shadow.x,
      tiltShadowY: shadow.y,
      tiltShadowFollow: shadow.follow,
      tiltShadowHoverOnly: shadow.hoverOnly,
      tiltShadowInset: shadow.inset,
      tiltShadowCss: shadow.css
    };
  });
})();

// Cursor click-media controls are shared by pointer and touch-only runtimes.
// Keep the format/CORS boundary explicit in every supported demo language.
(() => {
  const sets = window.MK_HELP_I18N;
  if (!sets) return;
  const tips = {
    ko: {
      clickImage: '클릭마다 처음부터 한 번 재생할 GIF·APNG·animated WebP URL입니다. CORS로 읽을 수 없으면 표시 시간 제한 방식으로 대체합니다.',
      clickImageDuration: '이미지 로드 후 표시 시간(ms)입니다. 0 또는 생략 시 한 사이클 길이를 자동 계산합니다. 양수를 지정할 때는 한 사이클 이상으로 설정하세요.',
      clickImageSize: '클릭 이미지 너비(px)입니다. 높이는 원본 비율을 유지합니다.',
      clickSprite: '클릭마다 한 번 재생할 가로 스프라이트 시트 URL입니다. clickImage와 함께 쓰면 이 옵션을 우선합니다.',
      clickSpriteDuration: '스프라이트 전체 프레임을 한 번 재생하는 시간(ms)입니다.',
      clickSpriteWidth: '스프라이트 한 프레임 너비(px)입니다. 비우면 정사각 프레임으로 자동 추론합니다.',
      clickSpriteHeight: '스프라이트 한 프레임 높이(px)입니다. 비우면 자동 추론한 너비를 사용합니다.',
      clickSpriteFrames: '가로 스프라이트 시트의 프레임 수입니다. 비우면 이미지 크기로 자동 추론합니다.'
    },
    en: {
      clickImage: 'GIF, APNG, or animated WebP restarted for one play per click. Unreadable cross-origin files fall back to a timed image.',
      clickImageDuration: 'Display time after the image loads (ms). Zero or omitted derives one encoded cycle; a positive value should cover the full cycle.',
      clickImageSize: 'Click-image width in pixels; height keeps the source aspect ratio.',
      clickSprite: 'Horizontal sprite sheet played once per click. This takes priority when clickImage is also set.',
      clickSpriteDuration: 'Time in milliseconds for one complete sprite-sheet pass.',
      clickSpriteWidth: 'Width of one sprite frame in pixels. Empty auto-detects square frames.',
      clickSpriteHeight: 'Height of one sprite frame in pixels. Empty uses the detected frame width.',
      clickSpriteFrames: 'Frame count in the horizontal sheet. Empty derives it from image dimensions.'
    },
    ja: {
      clickImage: 'クリックごとに先頭から1回再生するGIF・APNG・animated WebPのURL。CORSで読めない場合は時間制限表示に切り替えます。',
      clickImageDuration: '読込完了後の表示時間(ms)。0または省略時は1サイクルを自動計算します。正数を指定する場合は1サイクル以上にしてください。',
      clickImageSize: 'クリック画像の幅(px)。高さは元の比率を保ちます。',
      clickSprite: 'クリックごとに1回再生する横並びスプライト。clickImageと同時指定時はこちらを優先します。',
      clickSpriteDuration: 'スプライト全フレームを1回再生する時間(ms)。',
      clickSpriteWidth: '1フレームの幅(px)。空なら正方形フレームとして自動判定します。',
      clickSpriteHeight: '1フレームの高さ(px)。空なら検出した幅を使います。',
      clickSpriteFrames: '横並びシートのフレーム数。空なら画像寸法から判定します。'
    },
    'zh-CN': {
      clickImage: '每次点击从头播放一次的 GIF、APNG 或动态 WebP URL；跨域不可读时改用定时移除。',
      clickImageDuration: '图片加载后的显示时间(ms)。0或省略时自动计算一个周期；指定正数时应覆盖完整周期。',
      clickImageSize: '点击图片宽度(px)，高度保持原始比例。',
      clickSprite: '每次点击播放一次的横向精灵图；与 clickImage 同时设置时优先。',
      clickSpriteDuration: '完整播放一次精灵图的时间(ms)。',
      clickSpriteWidth: '单帧宽度(px)，留空时按正方形帧自动推断。',
      clickSpriteHeight: '单帧高度(px)，留空时使用推断出的帧宽。',
      clickSpriteFrames: '横向精灵图的帧数，留空时根据图片尺寸推断。'
    },
    'zh-TW': {
      clickImage: '每次點擊從頭播放一次的 GIF、APNG 或動態 WebP URL；跨來源不可讀時改用定時移除。',
      clickImageDuration: '圖片載入後的顯示時間(ms)。0或省略時自動計算一個週期；指定正數時應涵蓋完整週期。',
      clickImageSize: '點擊圖片寬度(px)，高度維持原始比例。',
      clickSprite: '每次點擊播放一次的橫向精靈圖；與 clickImage 同時設定時優先。',
      clickSpriteDuration: '完整播放一次精靈圖的時間(ms)。',
      clickSpriteWidth: '單幀寬度(px)，留空時按正方形幀自動推算。',
      clickSpriteHeight: '單幀高度(px)，留空時使用推算出的幀寬。',
      clickSpriteFrames: '橫向精靈圖的幀數，留空時依圖片尺寸推算。'
    },
    ru: {
      clickImage: 'URL GIF, APNG или animated WebP, запускаемого с начала один раз на клик. Без CORS используется удаление по таймеру.',
      clickImageDuration: 'Время показа после загрузки (мс). Ноль или пропуск автоматически вычисляет один цикл; положительное время должно покрывать весь цикл.',
      clickImageSize: 'Ширина изображения клика в пикселях; высота сохраняет пропорции.',
      clickSprite: 'Горизонтальный спрайт-лист, проигрываемый один раз на клик. Имеет приоритет над clickImage.',
      clickSpriteDuration: 'Время одного полного прохода спрайт-листа в миллисекундах.',
      clickSpriteWidth: 'Ширина кадра в пикселях; пустое значение включает автоопределение квадратных кадров.',
      clickSpriteHeight: 'Высота кадра в пикселях; пустое значение использует найденную ширину.',
      clickSpriteFrames: 'Число кадров в горизонтальном листе; пустое значение вычисляется по размерам.'
    },
    it: {
      clickImage: 'URL GIF, APNG o WebP animata riavviata una volta per clic. Senza CORS usa la rimozione temporizzata.',
      clickImageDuration: 'Tempo di visualizzazione dopo il caricamento (ms). Zero o valore omesso calcola un ciclo; un valore positivo deve coprire il ciclo completo.',
      clickImageSize: 'Larghezza dell’immagine al clic in pixel; l’altezza mantiene le proporzioni.',
      clickSprite: 'Sprite sheet orizzontale riprodotto una volta per clic; ha priorità su clickImage.',
      clickSpriteDuration: 'Durata in millisecondi di un passaggio completo dello sprite.',
      clickSpriteWidth: 'Larghezza di un fotogramma in pixel; vuoto rileva fotogrammi quadrati.',
      clickSpriteHeight: 'Altezza di un fotogramma in pixel; vuoto usa la larghezza rilevata.',
      clickSpriteFrames: 'Numero di fotogrammi nel foglio orizzontale; vuoto lo ricava dalle dimensioni.'
    }
  };
  for (const [lang, values] of Object.entries(tips)) {
    sets[lang] = sets[lang] || {};
    sets[lang].cursor = Object.assign({}, sets[lang].cursor, values);
  }
})();

// Native Scroll-driven Animations controls for cssScroll. The first demo tab
// starts on the legacy progress-property fallback; entering a keyframe name
// reveals these native timeline controls without adding a new public option.
(() => {
  const sets = window.MK_HELP_I18N;
  if (!sets) return;
  const tips = {
    ko: {
      cssAnimation: '네이티브 timeline에서 실행할 @keyframes 이름입니다. 비우면 ScrollTrigger가 CSS 진행률 변수를 갱신합니다.',
      timeline: 'view는 요소의 scrollport 통과율을, scroll은 가장 가까운 scrollport의 전체 진행률을 사용합니다.',
      axis: 'timeline이 측정할 축입니다. block/inline은 글쓰기 방향을 따르고 x/y는 물리 축을 고정합니다.',
      rangeStart: '네이티브 animation range 시작점입니다. 비우면 view는 entry 0%, scroll은 0%를 사용합니다.',
      rangeEnd: '네이티브 animation range 끝점입니다. 비우면 view는 exit 100%, scroll은 100%를 사용합니다.'
    },
    en: {
      cssAnimation: 'Name of the @keyframes animation for the native timeline. Leave blank to publish CSS progress through ScrollTrigger.',
      timeline: 'view tracks the element through its scrollport; scroll tracks the nearest scrollport\'s overall progress.',
      axis: 'Axis sampled by the timeline. block/inline follow writing mode; x/y select a physical axis.',
      rangeStart: 'Start of the native animation range. Blank uses entry 0% for view or 0% for scroll.',
      rangeEnd: 'End of the native animation range. Blank uses exit 100% for view or 100% for scroll.'
    },
    ja: {
      cssAnimation: 'ネイティブタイムラインで実行する @keyframes 名。空欄なら ScrollTrigger が CSS 進行率を更新します。',
      timeline: 'view は要素がスクロール領域を通過する割合、scroll は最寄りのスクロール領域全体の進行率を使います。',
      axis: 'タイムラインが測定する軸。block/inline は書字方向に従い、x/y は物理軸を固定します。',
      rangeStart: 'ネイティブ animation range の開始点。空欄時は view が entry 0%、scroll が 0% です。',
      rangeEnd: 'ネイティブ animation range の終了点。空欄時は view が exit 100%、scroll が 100% です。'
    },
    'zh-CN': {
      cssAnimation: '原生时间线运行的 @keyframes 名称。留空时由 ScrollTrigger 更新 CSS 进度变量。',
      timeline: 'view 跟踪元素穿过滚动区域的进度；scroll 跟踪最近滚动区域的整体进度。',
      axis: '时间线采样轴。block/inline 遵循书写方向，x/y 固定为物理轴。',
      rangeStart: '原生 animation range 的起点。留空时 view 使用 entry 0%，scroll 使用 0%。',
      rangeEnd: '原生 animation range 的终点。留空时 view 使用 exit 100%，scroll 使用 100%。'
    },
    'zh-TW': {
      cssAnimation: '原生時間軸執行的 @keyframes 名稱。留空時由 ScrollTrigger 更新 CSS 進度變數。',
      timeline: 'view 追蹤元素穿過捲動區域的進度；scroll 追蹤最近捲動區域的整體進度。',
      axis: '時間軸取樣軸。block/inline 遵循書寫方向，x/y 固定為物理軸。',
      rangeStart: '原生 animation range 的起點。留空時 view 使用 entry 0%，scroll 使用 0%。',
      rangeEnd: '原生 animation range 的終點。留空時 view 使用 exit 100%，scroll 使用 100%。'
    },
    ru: {
      cssAnimation: 'Имя @keyframes для нативной шкалы. Пустое поле оставляет обновление CSS-прогресса за ScrollTrigger.',
      timeline: 'view отслеживает прохождение элемента через область прокрутки; scroll — общий прогресс ближайшей области.',
      axis: 'Ось шкалы. block/inline следуют направлению письма, а x/y задают физическую ось.',
      rangeStart: 'Начало нативного animation range. Пусто: entry 0% для view или 0% для scroll.',
      rangeEnd: 'Конец нативного animation range. Пусто: exit 100% для view или 100% для scroll.'
    },
    it: {
      cssAnimation: 'Nome dei @keyframes eseguiti sulla timeline nativa. Vuoto affida il progresso CSS a ScrollTrigger.',
      timeline: 'view segue il passaggio dell’elemento nello scrollport; scroll segue il progresso totale dello scrollport più vicino.',
      axis: 'Asse campionato dalla timeline. block/inline seguono la scrittura; x/y fissano un asse fisico.',
      rangeStart: 'Inizio dell’animation range nativo. Vuoto usa entry 0% per view o 0% per scroll.',
      rangeEnd: 'Fine dell’animation range nativo. Vuoto usa exit 100% per view o 100% per scroll.'
    }
  };
  for (const [lang, values] of Object.entries(tips)) {
    sets[lang] = sets[lang] || {};
    sets[lang].cssScroll = Object.assign({}, sets[lang].cssScroll, values);
  }
})();

// Slider physics controls are intentionally separate from the older
// velocityInfluence/spring knobs: each switch describes one user-visible
// behaviour and can be measured independently in the regression fixture.
(function () {
  const sets = window.MK_HELP_I18N;
  if (!sets) return;
  const tips = {
    ko: {
      momentum: '드래그를 놓은 뒤 속도를 다음 슬라이드 이동에 반영합니다. 끄면 놓는 즉시 정착합니다.',
      bounce: '양 끝에서 넘친 거리를 놓을 때 가장자리로 부드럽게 되돌립니다.',
      stickySnap: '드래그를 놓을 때 가장 가까운 정수 슬라이드에 붙입니다.'
    },
    en: {
      momentum: 'Carries release velocity into the next slide. Turn it off for an immediate settle.',
      bounce: 'Returns edge overscroll to the nearest boundary with a bounded animation.',
      stickySnap: 'Snaps a drag release to the nearest whole slide.'
    },
    ja: {
      momentum: '指を離した速度を次のスライド移動に反映します。オフならすぐに停止します。',
      bounce: '端からはみ出した距離を、離したときに端へ滑らかに戻します。',
      stickySnap: 'ドラッグを離したとき最も近い整数スライドに固定します。'
    },
    'zh-CN': {
      momentum: '将释放时的速度带入下一张幻灯片。关闭后会立即停稳。',
      bounce: '释放时把边缘的过度拖动以有界动画返回最近边界。',
      stickySnap: '释放拖拽时吸附到最近的整张幻灯片。'
    },
    'zh-TW': {
      momentum: '將釋放時的速度帶入下一張投影片。關閉後會立即停穩。',
      bounce: '釋放時把邊緣的過度拖曳以有界動畫返回最近邊界。',
      stickySnap: '釋放拖曳時吸附到最近的整張投影片。'
    },
    ru: {
      momentum: 'Переносит скорость отпускания на следующий слайд. Выкл. — остановка сразу.',
      bounce: 'Возвращает перелёт за край к ближайшей границе ограниченной анимацией.',
      stickySnap: 'После перетаскивания прилипает к ближайшему целому слайду.'
    },
    it: {
      momentum: 'Trasporta la velocità del rilascio verso la slide successiva. Disattiva per fermarti subito.',
      bounce: 'Riporta l’overscroll del bordo al limite più vicino con un’animazione limitata.',
      stickySnap: 'Aggancia il rilascio del drag alla slide intera più vicina.'
    }
  };
  for (const [lang, values] of Object.entries(tips)) {
    sets[lang] = sets[lang] || {};
    sets[lang].slider = Object.assign({}, sets[lang].slider, values);
  }
})();

(function () {
  const sets = window.MK_HELP_I18N;
  if (!sets) return;

  const DATE_TIME_HELP = {
    ko: {
      date: '서버가 내려준 원본 시각입니다. ISO 8601, Unix 초·밀리초, 한글 날짜와 점·슬래시 날짜 형식을 해석합니다.',
      mode: '상대 시간, 현지화된 절대 시간, 또는 두 표기를 함께 표시할지 선택합니다.',
      locale: 'Intl 표기에 사용할 BCP 47 로케일입니다. 예: ko-KR, en-US.',
      numeric: 'auto는 어제 같은 자연어를 허용하고, always는 항상 숫자로 표시합니다.',
      dateStyle: '절대 표기에서 달력 날짜의 상세 수준을 정합니다.',
      timeStyle: '절대 표기에서 시각의 상세 수준을 정합니다. 비우면 시각을 숨깁니다.',
      timeZone: '절대 표기에 쓸 IANA 시간대입니다. 예: Asia/Seoul.',
      live: '상대 시간이 자동으로 갱신됩니다. 서버 렌더 결과를 고정하려면 끕니다.',
      updateInterval: '상대 시간을 다시 계산하는 주기입니다. 최소값은 1초입니다.',
      fallback: '날짜를 해석할 수 없을 때 그대로 표시할 문구입니다.'
    },
    en: {
      date: 'Source timestamp from the server. ISO 8601, Unix seconds or milliseconds, Korean dates, and common dot or slash dates are accepted.',
      mode: 'Choose relative time, localized absolute time, or both together.',
      locale: 'BCP 47 locale used by Intl formatting, for example ko-KR or en-US.',
      numeric: 'auto allows words such as yesterday; always uses a numeric amount.',
      dateStyle: 'Level of detail for the localized calendar date.',
      timeStyle: 'Optional detail for the localized clock time. Leave blank to hide it.',
      timeZone: 'IANA time zone used for absolute output, for example Asia/Seoul.',
      live: 'Refreshes relative time automatically. Turn off for a fixed server-rendered snapshot.',
      updateInterval: 'Milliseconds between relative-time refreshes; the minimum is one second.',
      fallback: 'Shown unchanged when the supplied timestamp cannot be interpreted.'
    },
    ja: {
      date: 'サーバーから渡される元の日時です。ISO 8601、Unix秒・ミリ秒、韓国語表記、ドット・スラッシュ区切りの日付を解釈します。',
      mode: '相対時刻、ローカライズされた絶対時刻、または両方を表示します。',
      locale: 'Intlの表示に使うBCP 47ロケールです。例: ko-KR、en-US。',
      numeric: 'autoは「昨日」のような表現を許可し、alwaysは常に数値で表示します。',
      dateStyle: '絶対表示のカレンダー日付の詳しさを決めます。',
      timeStyle: '絶対表示の時刻の詳しさです。空欄なら時刻を隠します。',
      timeZone: '絶対表示に使うIANAタイムゾーンです。例: Asia/Seoul。',
      live: '相対時刻を自動更新します。サーバー出力を固定する場合はオフにします。',
      updateInterval: '相対時刻を再計算する間隔です。最小値は1秒です。',
      fallback: '日時を解釈できないときにそのまま表示する文言です。'
    },
    'zh-CN': {
      date: '服务器提供的原始时间。支持 ISO 8601、Unix 秒或毫秒、韩文日期及常见的点号或斜杠日期。',
      mode: '选择相对时间、本地化绝对时间，或同时显示两者。',
      locale: 'Intl 格式化使用的 BCP 47 区域设置，例如 ko-KR 或 en-US。',
      numeric: 'auto 可使用“昨天”等自然语言；always 始终显示数值。',
      dateStyle: '设置绝对时间中日历日期的详细程度。',
      timeStyle: '设置绝对时间中时刻的详细程度。留空则隐藏时刻。',
      timeZone: '绝对时间使用的 IANA 时区，例如 Asia/Seoul。',
      live: '自动刷新相对时间。若要固定服务器渲染结果，请关闭。',
      updateInterval: '重新计算相对时间的间隔，最小为一秒。',
      fallback: '无法解析时间时原样显示的文字。'
    },
    'zh-TW': {
      date: '伺服器提供的原始時間。支援 ISO 8601、Unix 秒或毫秒、韓文日期及常見的點號或斜線日期。',
      mode: '選擇相對時間、在地化絕對時間，或同時顯示兩者。',
      locale: 'Intl 格式化使用的 BCP 47 地區設定，例如 ko-KR 或 en-US。',
      numeric: 'auto 可使用「昨天」等自然語言；always 一律顯示數值。',
      dateStyle: '設定絕對時間中日曆日期的詳細程度。',
      timeStyle: '設定絕對時間中時刻的詳細程度。留空則隱藏時刻。',
      timeZone: '絕對時間使用的 IANA 時區，例如 Asia/Seoul。',
      live: '自動更新相對時間。若要固定伺服器渲染結果，請關閉。',
      updateInterval: '重新計算相對時間的間隔，最小為一秒。',
      fallback: '無法解析時間時原樣顯示的文字。'
    },
    ru: {
      date: 'Исходная дата от сервера. Поддерживаются ISO 8601, Unix в секундах и миллисекундах, корейские даты и обычные даты с точками или слешами.',
      mode: 'Выберите относительное время, локализованное абсолютное время или оба варианта.',
      locale: 'Локаль BCP 47 для форматирования Intl, например ko-KR или en-US.',
      numeric: 'auto допускает слова вроде «вчера», always всегда использует число.',
      dateStyle: 'Степень детализации календарной даты в абсолютном формате.',
      timeStyle: 'Детализация времени в абсолютном формате. Оставьте пустым, чтобы скрыть его.',
      timeZone: 'Часовой пояс IANA для абсолютного формата, например Asia/Seoul.',
      live: 'Автоматически обновляет относительное время. Отключите для фиксированного серверного снимка.',
      updateInterval: 'Интервал пересчёта относительного времени в миллисекундах; минимум одна секунда.',
      fallback: 'Текст, который показывается без изменений, если дату нельзя распознать.'
    },
    it: {
      date: 'Timestamp sorgente dal server. Sono accettati ISO 8601, Unix in secondi o millisecondi, date coreane e comuni date con punti o barre.',
      mode: 'Scegli tempo relativo, tempo assoluto localizzato oppure entrambi.',
      locale: 'Locale BCP 47 usato da Intl, per esempio ko-KR o en-US.',
      numeric: 'auto consente parole come ieri; always usa sempre un valore numerico.',
      dateStyle: 'Livello di dettaglio della data di calendario nel formato assoluto.',
      timeStyle: 'Dettaglio dell’orario nel formato assoluto. Lascia vuoto per nasconderlo.',
      timeZone: 'Fuso orario IANA per il formato assoluto, per esempio Asia/Seoul.',
      live: 'Aggiorna automaticamente il tempo relativo. Disattivalo per una vista server fissa.',
      updateInterval: 'Millisecondi tra gli aggiornamenti del tempo relativo; il minimo è un secondo.',
      fallback: 'Testo mostrato invariato quando il timestamp non può essere interpretato.'
    }
  };

  for (const [lang, tips] of Object.entries(DATE_TIME_HELP)) {
    sets[lang] = sets[lang] || {};
    sets[lang].dateTime = Object.assign({}, sets[lang].dateTime, tips);
  }
})();

(function () {
  const sets = window.MK_HELP_I18N;
  if (!sets) return;
  const copy = {
    ko: { mask: '마지막 색상 패널을 색 없는 콘텐츠 마스크로 대체합니다. layers가 2이면 color2는 사용하지 않습니다.', color2: '두 번째 패널 색입니다. Mask를 켜 마지막 패널이 마스크로 대체되면 사용되지 않습니다.' },
    en: { mask: 'Replaces the final colored panel with a colorless content mask. With two layers, color2 is not used.', color2: 'Color of the second panel. It is unused when Mask replaces that final panel.' },
    ja: { mask: '最後の色付きパネルを色のないコンテンツマスクに置き換えます。2レイヤーではcolor2を使いません。', color2: '2枚目のパネル色。Maskが最後のパネルを置き換える場合は使われません。' },
    'zh-CN': { mask: '用无颜色的内容遮罩替代最后一个彩色面板。两层时不使用 color2。', color2: '第二个面板的颜色。Mask 替代最后面板时不会使用。' },
    'zh-TW': { mask: '以無顏色的內容遮罩取代最後一個彩色面板。兩層時不使用 color2。', color2: '第二個面板的顏色。Mask 取代最後面板時不會使用。' },
    ru: { mask: 'Заменяет последнюю цветную панель бесцветной маской контента. При двух слоях color2 не используется.', color2: 'Цвет второй панели. Не используется, когда Mask заменяет последнюю панель.' },
    it: { mask: 'Sostituisce l’ultimo pannello colorato con una maschera del contenuto senza colore. Con due livelli color2 non viene usato.', color2: 'Colore del secondo pannello. Non viene usato quando Mask sostituisce il pannello finale.' }
  };
  Object.entries(copy).forEach(([lang, tips]) => {
    sets[lang].coverReveal = { ...(sets[lang].coverReveal || {}), ...tips };
  });
})();

// Responsive top-level Mega Menu flow.
(() => {
  const sets = window.MK_HELP_I18N;
  if (!sets) return;
  const text = {
    ko: '좁은 화면의 상위 메뉴 배치입니다. wrap은 가운데에서 줄바꿈하고, scroll은 한 줄을 좌우로 밀어 봅니다. custom은 라이브러리 배치를 적용하지 않습니다.',
    en: 'Top-level items on narrow screens: wrap centres multiple rows, scroll keeps one swipeable row, and custom leaves layout to your CSS.',
    ja: '狭い画面での上位メニュー配置です。wrapは中央で折り返し、scrollは1行を横にスワイプ、customはCSSに任せます。',
    'zh-CN': '窄屏顶层菜单布局：wrap 居中换行，scroll 保持单行并可横向滑动，custom 交给自定义 CSS。',
    'zh-TW': '窄螢幕頂層選單配置：wrap 置中換行，scroll 維持單行並可橫向滑動，custom 交由自訂 CSS。',
    ru: 'Верхнее меню на узком экране: wrap переносит пункты по центру, scroll оставляет одну прокручиваемую строку, custom передаёт раскладку CSS.',
    it: 'Voci principali su schermi stretti: wrap le manda a capo al centro, scroll mantiene una riga scorrevole, custom lascia il layout al CSS.'
  };
  Object.entries(text).forEach(([locale, responsive]) => {
    sets[locale] = sets[locale] || {};
    sets[locale].megaMenu = Object.assign({}, sets[locale].megaMenu, { responsive });
  });
})();

// Tooltips for settings that shipped without one — every field in the drawer
// should say what it changes, in every language the demo offers.
(function () {
  const sets = window.MK_HELP_I18N;
  if (!sets) return;
  const ADD = {
  "ko": {
    "counter": {
      "from": "카운트를 시작할 숫자입니다. 비워두면 0부터 셉니다."
    },
    "overflowText": {
      "crossfade": "이전 문구와 다음 문구가 겹치며 흐려지고 나타납니다.",
      "restoreOnLeave": "마우스를 떼면 원래 문구로 되돌아옵니다. 끄면 바뀐 상태로 남습니다.",
      "restoreDirection": "되돌아오는 방향입니다. reverse=올라간 길을 되짚어 내려오고, continue=같은 방향으로 한 바퀴 더 돌아 원래 문구에 도착합니다.",
      "loopOnHover": "마우스를 올린 동안 원래 라벨 너비 안에서 가로 마퀴처럼 계속 흐릅니다."
    },
    "textTransition": {
      "charDirection": "글자가 교체되는 순서입니다. ltr=왼쪽부터, rtl=오른쪽부터, random=무작위."
    },
    "glitch": {
      "duration": "글리치 한 번이 지속되는 시간(초)입니다."
    },
    "cursor": {
      "hoverDotSize": "링크·버튼 위에 올렸을 때 커서 점이 커지는 크기(px)입니다.",
      "trailCount": "커서를 뒤따르는 잔상 개수입니다. 많을수록 꼬리가 길어집니다.",
      "rotateText": "커서를 따라다니는 글자를 원형으로 회전시킵니다.",
      "mixBlendMode": "커서와 배경의 혼합 방식입니다. difference를 쓰면 어떤 배경에서도 반전되어 보입니다."
    },
    "reveal": {
      "stagger": "요소가 하나씩 등장하는 시간 간격(초)입니다. 0이면 동시에 나타납니다.",
      "order": "등장 순서입니다. start=앞에서부터, end=뒤에서부터, center=가운데부터, random=무작위, edges=바깥에서 안쪽으로."
    },
    "slider": {
      "loop": "마지막 슬라이드 다음에 첫 슬라이드로 이어집니다.",
      "wheel": "마우스 휠로 슬라이드를 넘길 수 있습니다.",
      "dots": "현재 위치를 보여주는 점 인디케이터를 표시합니다.",
      "progress": "남은 자동재생 시간을 보여주는 진행 표시를 켭니다.",
      "progressType": "진행 표시 모양입니다. bar=가로 막대, ring=원형 링.",
      "pauseButton": "자동재생을 멈추고 다시 재생하는 버튼을 표시합니다.",
      "pauseWhenOffscreen": "화면 밖에서는 자동재생과 전환 프레임을 멈춥니다.",
      "pauseOnHover": "마우스를 올린 동안 자동재생을 멈춥니다."
    },
    "lightbox": {
      "share": "현재 이미지 링크를 복사·공유하는 버튼을 표시합니다.",
      "exif": "사진에 기록된 촬영 정보(EXIF)를 함께 보여줍니다."
    },
    "fullpage": {
      "autoAdvance": "설정한 시간이 지나면 다음 화면으로 자동으로 넘어갑니다(초). 0이면 끕니다."
    },
    "marquee": {
      "fade": "좌우 끝을 서서히 흐리게 처리하는 폭(px)입니다. 잘린 느낌을 줄여줍니다."
    },
    "brushReveal": {
      "hold": "마우스 버튼을 누르고 있는 동안에만 긁힙니다. 끄면 지나가기만 해도 지워집니다."
    },
    "bottomSheet": {
      "autoHeight": "시트 높이를 내용에 맞춰 자동으로 맞춥니다. 최대 높이를 넘으면 안에서 스크롤됩니다.",
      "maxHeight": "자동 높이의 상한입니다. 50vh처럼 화면 비율이나 px 숫자로 지정합니다. 기본값 50vh."
    },
    "loadingIndicator": {
      "spinnerMode": "원호가 움직이는 방식입니다. spin=일정한 길이로 회전, grow=늘었다 줄며 회전, fill=진행률만큼 차오름(퍼센트 표시용).",
      "track": "원호 뒤에 옅은 배경 레일을 깝니다. 진행률을 보여줄 때 전체 길이를 가늠하기 좋습니다.",
      "rotateSpokes": "막대 하나하나가 밝아지는 대신, 스포크 뭉치 전체가 회전합니다.",
      "barMode": "막대가 움직이는 방식입니다. slide=한 방향 횡단, grow=늘었다 줄며 횡단, pingpong=일정한 폭으로 좌우 왕복합니다.",
      "spread": "동시에 켜지는 칸 수입니다. 트랙 길이(dotCount)와 따로 지정합니다.",
      "emptyChar": "아직 채워지지 않은 칸에 쓸 문자입니다. 기본값 ░.",
      "fillChar": "채워진 칸에 쓸 문자입니다. 기본값 █.",
      "progress": "표시할 진행률(0–100)입니다. fill 모드 원호, 막대, 미터가 이 값을 따릅니다."
    }
  },
  "en": {
    "counter": {
      "from": "Number the count starts from. Defaults to 0."
    },
    "overflowText": {
      "crossfade": "The outgoing and incoming text fade through each other.",
      "restoreOnLeave": "Return to the original text when the pointer leaves.",
      "restoreDirection": "How it returns: reverse retraces the way it came, continue rolls onward to land back on the original.",
      "loopOnHover": "While hovered, the text runs as a horizontal marquee inside the original label width."
    },
    "textTransition": {
      "charDirection": "Order characters swap in: ltr, rtl or random."
    },
    "glitch": {
      "duration": "How long one glitch burst lasts, in seconds."
    },
    "cursor": {
      "hoverDotSize": "Cursor dot size over links and buttons, in px.",
      "trailCount": "How many trailing copies follow the cursor.",
      "rotateText": "Spin the text that orbits the cursor.",
      "mixBlendMode": "Blend mode against the page; difference keeps the cursor visible on any background."
    },
    "reveal": {
      "stagger": "Delay between each element, in seconds. 0 reveals them together.",
      "order": "Reveal order: start, end, center, random or edges."
    },
    "slider": {
      "loop": "Wrap from the last slide back to the first.",
      "wheel": "Advance slides with the mouse wheel.",
      "dots": "Show dot indicators for the current position.",
      "progress": "Show how much autoplay time is left.",
      "progressType": "Progress shape: bar or ring.",
      "pauseButton": "Show a pause/resume control for autoplay.",
      "pauseWhenOffscreen": "Pause autoplay and transition frames while the slider is offscreen.",
      "pauseOnHover": "Pause autoplay while the pointer is over the slider."
    },
    "lightbox": {
      "share": "Show a button to copy or share the current image link.",
      "exif": "Show the capture data (EXIF) stored in the photo."
    },
    "fullpage": {
      "autoAdvance": "Advance to the next section after this many seconds. 0 disables it."
    },
    "marquee": {
      "fade": "Width of the soft fade on both edges, in px."
    },
    "brushReveal": {
      "hold": "Only scratch while the pointer button is held. Off means hovering alone erases."
    },
    "bottomSheet": {
      "autoHeight": "Size the sheet to its content, scrolling inside once it hits the ceiling.",
      "maxHeight": "Ceiling for auto height — a viewport ratio like 50vh or a px number. Defaults to 50vh."
    },
    "loadingIndicator": {
      "spinnerMode": "How the arc moves: spin (fixed length), grow (stretches and shrinks) or fill (length follows progress).",
      "track": "Draw a faint rail behind the arc, useful when showing real progress.",
      "rotateSpokes": "Rotate the whole spoke cluster instead of lighting each spoke in turn.",
      "barMode": "How the bar travels: slide crosses once, grow stretches while crossing, and pingpong bounces left and right.",
      "spread": "How many cells light up at once, set independently of the track length.",
      "emptyChar": "Character for unfilled cells. Defaults to ░.",
      "fillChar": "Character for filled cells. Defaults to █.",
      "progress": "Progress value (0–100) driving the fill arc, bar and meter."
    }
  },
  "ja": {
    "counter": {
      "from": "カウントを開始する数値です。既定は 0 です。"
    },
    "overflowText": {
      "crossfade": "前後のテキストが重なりながら入れ替わります。",
      "restoreOnLeave": "ポインターが離れると元のテキストに戻ります。",
      "restoreDirection": "戻り方です。reverse は来た道を戻り、continue は同じ方向に回って元に戻ります。",
      "loopOnHover": "ホバー中は元の幅の中で横方向に流れ続けます。"
    },
    "textTransition": {
      "charDirection": "文字が入れ替わる順序です（ltr / rtl / random）。"
    },
    "glitch": {
      "duration": "グリッチ 1 回の長さ（秒）です。"
    },
    "cursor": {
      "hoverDotSize": "リンクやボタン上でのカーソル点のサイズ（px）です。",
      "trailCount": "カーソルを追う残像の数です。",
      "rotateText": "カーソルを回る文字を回転させます。",
      "mixBlendMode": "背景との合成方法です。difference ならどの背景でも見えます。"
    },
    "reveal": {
      "stagger": "要素ごとの遅延（秒）です。0 で同時に表示します。",
      "order": "表示順序です（start / end / center / random / edges）。"
    },
    "slider": {
      "loop": "最後のスライドから最初へ戻ります。",
      "wheel": "マウスホイールでスライドを送ります。",
      "dots": "現在位置を示すドットを表示します。",
      "progress": "自動再生の残り時間を表示します。",
      "progressType": "進行表示の形（bar / ring）です。",
      "pauseButton": "自動再生の一時停止ボタンを表示します。",
      "pauseWhenOffscreen": "画面外では自動再生と切り替えフレームを停止します。",
      "pauseOnHover": "ポインターが乗っている間は自動再生を止めます。"
    },
    "lightbox": {
      "share": "現在の画像リンクを共有するボタンを表示します。",
      "exif": "写真の撮影情報（EXIF）を表示します。"
    },
    "fullpage": {
      "autoAdvance": "指定秒数で次のセクションへ自動的に進みます。0 で無効。"
    },
    "marquee": {
      "fade": "左右端をぼかす幅（px）です。"
    },
    "brushReveal": {
      "hold": "ボタンを押している間だけ削れます。オフならホバーだけで消えます。"
    },
    "bottomSheet": {
      "autoHeight": "内容に合わせて高さを自動調整し、上限を超えると内部でスクロールします。",
      "maxHeight": "自動高さの上限です。50vh のような比率か px で指定します（既定 50vh）。"
    },
    "loadingIndicator": {
      "spinnerMode": "弧の動き方です。spin=一定長で回転、grow=伸縮しながら回転、fill=進捗に応じて満ちる。",
      "track": "弧の後ろに薄いレールを敷きます。進捗表示に便利です。",
      "rotateSpokes": "各スポークを順に光らせる代わりに、全体を回転させます。",
      "barMode": "バーの動き方です。slide は一方向に横断、grow は伸縮しながら横断、pingpong は左右に往復します。",
      "spread": "同時に点灯するセル数です。トラック長とは別に指定します。",
      "emptyChar": "未充填セルの文字です（既定 ░）。",
      "fillChar": "充填済みセルの文字です（既定 █）。",
      "progress": "進捗値（0–100）です。fill の弧・バー・メーターがこれに従います。"
    }
  },
  "zh-CN": {
    "counter": {
      "from": "计数的起始数字，默认为 0。"
    },
    "overflowText": {
      "crossfade": "前后文字交叠淡入淡出。",
      "restoreOnLeave": "指针移开后回到原文字。",
      "restoreDirection": "返回方式：reverse 原路返回，continue 继续同向滚动回到原文。",
      "loopOnHover": "悬停时在原标签宽度内横向滚动。"
    },
    "textTransition": {
      "charDirection": "字符替换顺序：ltr、rtl 或随机。"
    },
    "glitch": {
      "duration": "一次故障效果的持续时间（秒）。"
    },
    "cursor": {
      "hoverDotSize": "悬停在链接或按钮上时光标点的大小（px）。",
      "trailCount": "跟随光标的拖尾数量。",
      "rotateText": "让环绕光标的文字旋转。",
      "mixBlendMode": "与背景的混合模式；difference 可在任何背景上可见。"
    },
    "reveal": {
      "stagger": "每个元素之间的间隔（秒），0 表示同时出现。",
      "order": "出现顺序：start、end、center、random 或 edges。"
    },
    "slider": {
      "loop": "从最后一张回到第一张。",
      "wheel": "用鼠标滚轮切换幻灯片。",
      "dots": "显示表示当前位置的圆点。",
      "progress": "显示自动播放剩余时间。",
      "progressType": "进度形状：bar 或 ring。",
      "pauseButton": "显示自动播放的暂停/继续按钮。",
      "pauseWhenOffscreen": "滑块离开屏幕后暂停自动播放和过渡帧。",
      "pauseOnHover": "指针悬停时暂停自动播放。"
    },
    "lightbox": {
      "share": "显示复制或分享当前图片链接的按钮。",
      "exif": "显示照片中的拍摄信息（EXIF）。"
    },
    "fullpage": {
      "autoAdvance": "经过设定秒数后自动进入下一屏，0 表示关闭。"
    },
    "marquee": {
      "fade": "两端柔化渐隐的宽度（px）。"
    },
    "brushReveal": {
      "hold": "仅在按住指针按钮时刮除；关闭时悬停即可擦除。"
    },
    "bottomSheet": {
      "autoHeight": "根据内容自动调整高度，超过上限后在内部滚动。",
      "maxHeight": "自动高度的上限，可用 50vh 之类的比例或 px，默认 50vh。"
    },
    "loadingIndicator": {
      "spinnerMode": "圆弧的运动方式：spin 定长旋转、grow 伸缩旋转、fill 按进度填充。",
      "track": "在圆弧后绘制淡色轨道，便于显示真实进度。",
      "rotateSpokes": "整组辐条一起旋转，而不是逐条点亮。",
      "barMode": "进度条的移动方式：slide 单向横穿，grow 伸缩横穿，pingpong 等宽左右往返。",
      "spread": "同时点亮的格数，可与轨道长度分开设置。",
      "emptyChar": "未填充格子的字符，默认 ░。",
      "fillChar": "已填充格子的字符，默认 █。",
      "progress": "进度值（0–100），fill 圆弧、进度条与计量条据此显示。"
    }
  },
  "zh-TW": {
    "counter": {
      "from": "計數的起始數字，預設為 0。"
    },
    "overflowText": {
      "crossfade": "前後文字交疊淡入淡出。",
      "restoreOnLeave": "指標移開後回到原文字。",
      "restoreDirection": "返回方式：reverse 原路返回，continue 繼續同向捲動回到原文。",
      "loopOnHover": "停留時在原標籤寬度內橫向捲動。"
    },
    "textTransition": {
      "charDirection": "字元替換順序：ltr、rtl 或隨機。"
    },
    "glitch": {
      "duration": "一次故障效果的持續時間（秒）。"
    },
    "cursor": {
      "hoverDotSize": "停留在連結或按鈕上時游標點的大小（px）。",
      "trailCount": "跟隨游標的拖尾數量。",
      "rotateText": "讓環繞游標的文字旋轉。",
      "mixBlendMode": "與背景的混合模式；difference 可在任何背景上可見。"
    },
    "reveal": {
      "stagger": "每個元素之間的間隔（秒），0 表示同時出現。",
      "order": "出現順序：start、end、center、random 或 edges。"
    },
    "slider": {
      "loop": "從最後一張回到第一張。",
      "wheel": "用滑鼠滾輪切換投影片。",
      "dots": "顯示表示目前位置的圓點。",
      "progress": "顯示自動播放剩餘時間。",
      "progressType": "進度形狀：bar 或 ring。",
      "pauseButton": "顯示自動播放的暫停/繼續按鈕。",
      "pauseWhenOffscreen": "滑塊離開畫面後暫停自動播放與轉場影格。",
      "pauseOnHover": "指標停留時暫停自動播放。"
    },
    "lightbox": {
      "share": "顯示複製或分享目前圖片連結的按鈕。",
      "exif": "顯示照片中的拍攝資訊（EXIF）。"
    },
    "fullpage": {
      "autoAdvance": "經過設定秒數後自動進入下一頁，0 表示關閉。"
    },
    "marquee": {
      "fade": "兩端柔化漸隱的寬度（px）。"
    },
    "brushReveal": {
      "hold": "僅在按住指標按鈕時刮除；關閉時停留即可擦除。"
    },
    "bottomSheet": {
      "autoHeight": "依內容自動調整高度，超過上限後在內部捲動。",
      "maxHeight": "自動高度的上限，可用 50vh 之類的比例或 px，預設 50vh。"
    },
    "loadingIndicator": {
      "spinnerMode": "圓弧的運動方式：spin 定長旋轉、grow 伸縮旋轉、fill 依進度填滿。",
      "track": "在圓弧後繪製淡色軌道，便於顯示真實進度。",
      "rotateSpokes": "整組輻條一起旋轉，而不是逐條點亮。",
      "barMode": "進度條的移動方式：slide 單向橫越，grow 伸縮橫越，pingpong 等寬左右往返。",
      "spread": "同時點亮的格數，可與軌道長度分開設定。",
      "emptyChar": "未填滿格子的字元，預設 ░。",
      "fillChar": "已填滿格子的字元，預設 █。",
      "progress": "進度值（0–100），fill 圓弧、進度條與計量條依此顯示。"
    }
  },
  "ru": {
    "counter": {
      "from": "Число, с которого начинается счёт. По умолчанию 0."
    },
    "overflowText": {
      "crossfade": "Старый и новый текст переходят друг в друга.",
      "restoreOnLeave": "Возврат к исходному тексту после ухода курсора.",
      "restoreDirection": "Способ возврата: reverse — обратно тем же путём, continue — дальше по кругу.",
      "loopOnHover": "При наведении текст бежит по горизонтали в пределах исходной ширины."
    },
    "textTransition": {
      "charDirection": "Порядок замены символов: ltr, rtl или случайный."
    },
    "glitch": {
      "duration": "Длительность одного глитча в секундах."
    },
    "cursor": {
      "hoverDotSize": "Размер точки курсора над ссылками и кнопками, px.",
      "trailCount": "Количество следов за курсором.",
      "rotateText": "Вращать текст вокруг курсора.",
      "mixBlendMode": "Режим наложения; difference делает курсор видимым на любом фоне."
    },
    "reveal": {
      "stagger": "Задержка между элементами в секундах. 0 — одновременно.",
      "order": "Порядок появления: start, end, center, random, edges."
    },
    "slider": {
      "loop": "После последнего слайда — снова первый.",
      "wheel": "Прокрутка колесом мыши.",
      "dots": "Показывать точки-индикаторы позиции.",
      "progress": "Показывать остаток времени автопрокрутки.",
      "progressType": "Форма индикатора: полоса или кольцо.",
      "pauseButton": "Показывать кнопку паузы автопрокрутки.",
      "pauseWhenOffscreen": "Останавливать автопрокрутку и кадры перехода вне экрана.",
      "pauseOnHover": "Пауза автопрокрутки при наведении."
    },
    "lightbox": {
      "share": "Кнопка копирования или отправки ссылки на изображение.",
      "exif": "Показывать данные съёмки (EXIF)."
    },
    "fullpage": {
      "autoAdvance": "Переход к следующей секции через N секунд. 0 — выключено."
    },
    "marquee": {
      "fade": "Ширина мягкого затухания по краям, px."
    },
    "brushReveal": {
      "hold": "Стирать только при зажатой кнопке. Выкл — достаточно навести."
    },
    "bottomSheet": {
      "autoHeight": "Высота по содержимому; при достижении предела — прокрутка внутри.",
      "maxHeight": "Предел авто-высоты: доля экрана (50vh) или px. По умолчанию 50vh."
    },
    "loadingIndicator": {
      "spinnerMode": "Движение дуги: spin — фиксированная длина, grow — растёт и сжимается, fill — по прогрессу.",
      "track": "Бледная дорожка позади дуги — полезна при показе прогресса.",
      "rotateSpokes": "Вращать весь пучок спиц вместо поочерёдной подсветки.",
      "barMode": "Движение полосы: slide идёт в одну сторону, grow растёт и сжимается, pingpong движется туда и обратно.",
      "spread": "Сколько ячеек горит одновременно, независимо от длины дорожки.",
      "emptyChar": "Символ для пустых ячеек. По умолчанию ░.",
      "fillChar": "Символ для заполненных ячеек. По умолчанию █.",
      "progress": "Значение прогресса (0–100) для дуги fill, полосы и метра."
    }
  },
  "it": {
    "counter": {
      "from": "Numero da cui parte il conteggio. Predefinito 0."
    },
    "overflowText": {
      "crossfade": "Il testo uscente ed entrante si dissolvono a vicenda.",
      "restoreOnLeave": "Torna al testo originale quando il puntatore esce.",
      "restoreDirection": "Modo di ritorno: reverse ripercorre il percorso, continue prosegue fino all’originale.",
      "loopOnHover": "Al passaggio scorre in orizzontale entro la larghezza originale."
    },
    "textTransition": {
      "charDirection": "Ordine di sostituzione dei caratteri: ltr, rtl o casuale."
    },
    "glitch": {
      "duration": "Durata di un singolo glitch, in secondi."
    },
    "cursor": {
      "hoverDotSize": "Dimensione del punto sopra link e pulsanti, in px.",
      "trailCount": "Quante copie seguono il cursore.",
      "rotateText": "Ruota il testo che orbita attorno al cursore.",
      "mixBlendMode": "Modalità di fusione; difference rende il cursore visibile ovunque."
    },
    "reveal": {
      "stagger": "Ritardo tra gli elementi, in secondi. 0 li mostra insieme.",
      "order": "Ordine di comparsa: start, end, center, random o edges."
    },
    "slider": {
      "loop": "Dall’ultima slide torna alla prima.",
      "wheel": "Cambia slide con la rotellina.",
      "dots": "Mostra i puntini della posizione corrente.",
      "progress": "Mostra il tempo rimanente dell’autoplay.",
      "progressType": "Forma del progresso: barra o anello.",
      "pauseButton": "Mostra un controllo di pausa per l’autoplay.",
      "pauseWhenOffscreen": "Metti in pausa autoplay e fotogrammi di transizione quando la slide è fuori schermo.",
      "pauseOnHover": "Metti in pausa l’autoplay al passaggio del puntatore."
    },
    "lightbox": {
      "share": "Mostra un pulsante per copiare o condividere il link.",
      "exif": "Mostra i dati di scatto (EXIF) della foto."
    },
    "fullpage": {
      "autoAdvance": "Passa alla sezione successiva dopo N secondi. 0 disattiva."
    },
    "marquee": {
      "fade": "Larghezza della dissolvenza ai bordi, in px."
    },
    "brushReveal": {
      "hold": "Gratta solo tenendo premuto. Se disattivo basta passare sopra."
    },
    "bottomSheet": {
      "autoHeight": "Adatta l’altezza al contenuto; oltre il limite scorre all’interno.",
      "maxHeight": "Limite dell’altezza automatica: quota schermo (50vh) o px. Predefinito 50vh."
    },
    "loadingIndicator": {
      "spinnerMode": "Movimento dell’arco: spin, grow (si allunga e accorcia) o fill (segue il progresso).",
      "track": "Disegna una guida tenue dietro l’arco, utile per il progresso reale.",
      "rotateSpokes": "Ruota l’intero gruppo di raggi invece di accenderli a turno.",
      "barMode": "Movimento della barra: slide attraversa in una direzione, grow si allunga, pingpong oscilla a sinistra e destra.",
      "spread": "Quante celle si accendono insieme, indipendentemente dalla traccia.",
      "emptyChar": "Carattere per le celle vuote. Predefinito ░.",
      "fillChar": "Carattere per le celle piene. Predefinito █.",
      "progress": "Valore di progresso (0–100) per arco fill, barra e meter."
    }
  }
};
  for (const [lang, modules] of Object.entries(ADD)) {
    sets[lang] = sets[lang] || {};
    for (const [moduleName, tips] of Object.entries(modules)) {
      sets[lang][moduleName] = Object.assign({}, tips, sets[lang][moduleName]);
    }
  }
})();

// Options added after the first tooltip sweep (Slider radial + sync/breakpoints
// group, Glitch rgb-slice-burst burst plan, Lazy data-mosaic tiling). Every field
// the drawer renders must carry a (?) in every language the demo offers — the
// tooltip-coverage test in tests/help-coverage.mjs fails the build otherwise.
(function () {
  const sets = window.MK_HELP_I18N;
  if (!sets) return;
  const ADD = {
    "ko": {
      "slider": {
        "position": "원호를 어느 변에 붙일지 정합니다. bottom이면 아래쪽에서 부채꼴로 펼쳐집니다.",
        "radius": "원호의 반지름(px)입니다. 크게 하면 곡률이 완만해지고 슬라이드가 넓게 퍼집니다.",
        "step": "슬라이드 사이의 각도 간격(도)입니다. 값이 작으면 촘촘하게 겹칩니다.",
        "activeAngle": "활성 슬라이드가 놓이는 각도입니다. 0이면 정면, 음수/양수로 기준 위치를 돌립니다.",
        "duration": "슬라이드가 다음 위치로 이동하는 시간(초)입니다. 0이면 즉시 전환합니다.",
        "controls": "이전/다음 버튼을 표시합니다. 끄면 드래그·휠·키보드만으로 조작합니다.",
        "activeClass": "활성 슬라이드에 붙일 CSS 클래스 이름입니다. 직접 만든 스타일을 연결할 때 씁니다.",
        "perGroup": "한 번에 넘길 슬라이드 개수입니다. perView와 같게 두면 페이지 단위로 넘어갑니다.",
        "autoHeight": "활성 슬라이드의 높이에 맞춰 트랙 높이가 따라갑니다. 길이가 다른 카드를 담을 때 씁니다.",
        "sync": "다른 슬라이더의 선택자를 넣으면 두 슬라이더가 서로 연동됩니다. 썸네일 갤러리에 씁니다.",
        "breakpoints": "화면 폭별 설정을 JSON으로 덮어씁니다. 예: {\"640\":{\"perView\":2},\"1024\":{\"perView\":3}}",
        "grabCursor": "마우스를 올리면 잡는 손 모양 커서로 바꿔 드래그 가능함을 알립니다.",
        "slideToClickedSlide": "옆에 있는 슬라이드를 클릭하면 그 슬라이드가 활성 위치로 옵니다."
        ,"velocityInfluence": "드래그를 놓을 때 남는 관성의 배율입니다. 0이면 플링을 끄고, 1보다 크게 하면 더 멀리 이동합니다. Radial에는 적용되지 않습니다."
        ,"spring": "트랙 정착에 스프링 물리를 사용합니다. 기본 보간을 유지하려면 끕니다."
        ,"stiffness": "스프링이 목표 위치로 끌어당기는 강도입니다."
        ,"damping": "스프링 속도를 감쇠해 튀는 정도를 조절합니다."
        ,"mass": "스프링 질량입니다. 값이 클수록 정착이 느려집니다."
      },
      "glitch": {
        "seed": "난수 시드입니다. 같은 값이면 같은 버스트 순서가 재현되므로 마음에 든 연출을 고정할 수 있습니다.",
        "channelOffset": "R·G·B 채널이 어긋나는 최대 거리(px)입니다. 색 번짐의 세기를 정합니다.",
        "maxSliceOffset": "가로로 잘린 띠가 최대 얼마나 밀려나는지(px)입니다. 크게 하면 화면이 크게 찢어집니다.",
        "sliceCountMin": "한 번의 버스트에서 만들 띠 개수의 최소값입니다.",
        "sliceCountMax": "한 번의 버스트에서 만들 띠 개수의 최대값입니다. 최소값과 벌리면 편차가 커집니다.",
        "burstDurationMin": "버스트가 유지되는 시간의 최소값(ms)입니다. 짧으면 순간적으로 튑니다.",
        "burstDurationMax": "버스트가 유지되는 시간의 최대값(ms)입니다.",
        "intervalMin": "버스트 사이 조용한 구간의 최소 길이(ms)입니다.",
        "intervalMax": "버스트 사이 조용한 구간의 최대 길이(ms)입니다. 넓히면 언제 튈지 예측하기 어려워집니다.",
        "artifactCount": "버스트마다 흩뿌리는 사각 잡티 블록의 개수입니다. 0이면 띠만 남습니다.",
        "artifactMinSize": "잡티 블록 한 변의 최소 크기(px)입니다.",
        "artifactMaxSize": "잡티 블록 한 변의 최대 크기(px)입니다. 최소값과 벌리면 크고 작은 블록이 섞입니다."
      },
      "lazy": {
        "seed": "난수 시드입니다. 같은 값이면 타일 배치와 글리치 순서가 그대로 재현됩니다.",
        "tileMin": "타일 한 변의 최소 크기(px)입니다. 작게 하면 잘게 쪼개져 조립되는 느낌이 강해집니다.",
        "tileMax": "타일 한 변의 최대 크기(px)입니다. 최소값과 벌리면 큰 판과 작은 조각이 섞입니다.",
        "colors": "글리치에 쓸 색을 쉼표로 나열합니다. 비우면 기본 RGB 3색(#ff2e2e, #00e07a, #2b6bff)을 씁니다."
      }
    },
    "en": {
      "slider": {
        "position": "Which edge the arc docks to. bottom fans the slides out along the lower edge.",
        "radius": "Arc radius in px. Larger values flatten the curve and spread the slides wider.",
        "step": "Angle in degrees between neighbouring slides. Small values pack them tightly.",
        "activeAngle": "Angle the active slide sits at. 0 is dead centre; sign rotates the resting position.",
        "duration": "Seconds for a slide to travel to its next position. 0 snaps instantly.",
        "controls": "Show the prev/next buttons. Off leaves drag, wheel and keyboard as the only controls.",
        "activeClass": "CSS class added to the active slide, so your own styles can hook onto it.",
        "perGroup": "How many slides advance per step. Match it to perView to page a full screen at a time.",
        "autoHeight": "Track height follows the active slide, for galleries whose cards differ in length.",
        "sync": "Selector of another slider to link both ways — the thumbnail-gallery pattern.",
        "breakpoints": "Per-width overrides as JSON, e.g. {\"640\":{\"perView\":2},\"1024\":{\"perView\":3}}",
        "grabCursor": "Swap in a grab cursor on hover so it reads as draggable.",
        "slideToClickedSlide": "Clicking a neighbouring slide brings it to the active position."
        ,"velocityInfluence": "Multiplier for release momentum. Use 0 to disable the fling or a value above 1 to travel farther; it does not affect Radial."
        ,"spring": "Uses spring physics for track settling. Leave it off to keep the default interpolation."
        ,"stiffness": "Controls how strongly the spring pulls toward its target."
        ,"damping": "Damps spring velocity and controls how much it bounces."
        ,"mass": "Sets spring mass; larger values settle more slowly."
      },
      "glitch": {
        "seed": "Random seed. The same value replays the same burst sequence, so you can lock a take you like.",
        "channelOffset": "How far the R/G/B channels separate, in px — the strength of the colour fringing.",
        "maxSliceOffset": "Maximum sideways shift of a torn band, in px. Higher values rip the frame further apart.",
        "sliceCountMin": "Fewest bands a single burst may tear.",
        "sliceCountMax": "Most bands a single burst may tear. Widen the gap from the minimum for more variety.",
        "burstDurationMin": "Shortest a burst may last, in ms. Small values read as a flick.",
        "burstDurationMax": "Longest a burst may last, in ms.",
        "intervalMin": "Shortest quiet gap between two bursts, in ms.",
        "intervalMax": "Longest quiet gap between bursts, in ms. Widen it to make the timing unpredictable.",
        "artifactCount": "How many square artifact blocks each burst scatters. 0 leaves only the torn bands.",
        "artifactMinSize": "Smallest side length of an artifact block, in px.",
        "artifactMaxSize": "Largest side length of an artifact block, in px. Widen the range to mix big and small."
      },
      "lazy": {
        "seed": "Random seed. The same value reproduces the identical tile layout and glitch order.",
        "tileMin": "Smallest tile side in px. Lower values shatter the image into finer pieces.",
        "tileMax": "Largest tile side in px. Widen the range from the minimum to mix slabs with shards.",
        "colors": "Comma-separated glitch palette. Empty falls back to the default RGB trio (#ff2e2e, #00e07a, #2b6bff)."
      }
    },
    "ja": {
      "slider": {
        "position": "円弧をどの辺に寄せるか。bottom は下辺に沿って扇状に広がります。",
        "radius": "円弧の半径(px)。大きくすると曲率が緩やかになり、スライドが広がります。",
        "step": "隣り合うスライドの角度間隔(度)。小さいほど密に重なります。",
        "activeAngle": "アクティブなスライドが位置する角度。0 が正面で、符号で基準位置を回します。",
        "duration": "スライドが次の位置へ移動する時間(秒)。0 なら即座に切り替わります。",
        "controls": "前後ボタンを表示します。オフならドラッグ・ホイール・キーボードのみで操作します。",
        "activeClass": "アクティブなスライドに付ける CSS クラス名。独自スタイルを当てるときに使います。",
        "perGroup": "1 回の操作で送るスライド数。perView と同じにするとページ単位で送られます。",
        "autoHeight": "アクティブなスライドの高さにトラックが追従します。丈の違うカードを並べるときに。",
        "sync": "別のスライダーのセレクターを入れると双方向に連動します。サムネイルギャラリー向け。",
        "breakpoints": "画面幅ごとの設定を JSON で上書きします。例: {\"640\":{\"perView\":2},\"1024\":{\"perView\":3}}",
        "grabCursor": "ホバー時につかむ形のカーソルに変え、ドラッグできることを示します。",
        "slideToClickedSlide": "隣のスライドをクリックすると、そのスライドがアクティブ位置に来ます。"
        ,"velocityInfluence": "解放時の慣性倍率。0 でフリングを無効にし、1 より大きくすると遠くまで移動します。Radial には適用されません。"
        ,"spring": "トラックの定着にばね物理を使います。標準補間を使う場合はオフにします。"
        ,"stiffness": "目標へ引くばねの強さを設定します。"
        ,"damping": "ばねの速度を減衰させ、跳ね返りを調整します。"
        ,"mass": "ばねの質量です。大きいほどゆっくり定着します。"
      },
      "glitch": {
        "seed": "乱数シード。同じ値なら同じバースト順が再現されるので、気に入った演出を固定できます。",
        "channelOffset": "R・G・B チャンネルがずれる最大距離(px)。色ズレの強さを決めます。",
        "maxSliceOffset": "横に切れた帯が最大どれだけずれるか(px)。大きくすると画面が大きく裂けます。",
        "sliceCountMin": "1 回のバーストで作る帯の最小本数です。",
        "sliceCountMax": "1 回のバーストで作る帯の最大本数。最小値と離すとばらつきが大きくなります。",
        "burstDurationMin": "バーストが続く時間の最小値(ms)。短いと一瞬だけ弾けます。",
        "burstDurationMax": "バーストが続く時間の最大値(ms)です。",
        "intervalMin": "バースト間の静かな区間の最小長(ms)です。",
        "intervalMax": "バースト間の静かな区間の最大長(ms)。広げるとタイミングが読めなくなります。",
        "artifactCount": "バーストごとに散らす四角いノイズブロックの数。0 なら帯だけになります。",
        "artifactMinSize": "ノイズブロック 1 辺の最小サイズ(px)です。",
        "artifactMaxSize": "ノイズブロック 1 辺の最大サイズ(px)。最小値と離すと大小が混ざります。"
      },
      "lazy": {
        "seed": "乱数シード。同じ値ならタイル配置とグリッチ順が同じに再現されます。",
        "tileMin": "タイル 1 辺の最小サイズ(px)。小さくすると細かく分割され組み立て感が強まります。",
        "tileMax": "タイル 1 辺の最大サイズ(px)。最小値と離すと大きな面と小片が混ざります。",
        "colors": "グリッチに使う色をカンマ区切りで指定。空なら既定の RGB 3 色(#ff2e2e, #00e07a, #2b6bff)。"
      }
    },
    "zh-CN": {
      "slider": {
        "position": "圆弧靠向哪一边。bottom 会沿下边缘呈扇形展开。",
        "radius": "圆弧半径（px）。数值越大弧度越平缓，滑块铺得越开。",
        "step": "相邻滑块之间的角度间隔（度）。数值越小排列越密。",
        "activeAngle": "当前滑块所在的角度。0 为正前方，正负号可旋转基准位置。",
        "duration": "滑块移动到下一位置所需的秒数。0 表示瞬间切换。",
        "controls": "显示上一张/下一张按钮。关闭后只能用拖拽、滚轮和键盘操作。",
        "activeClass": "添加到当前滑块的 CSS 类名，便于挂接自定义样式。",
        "perGroup": "每次切换前进的滑块数量。设为与 perView 相同即整页翻动。",
        "autoHeight": "轨道高度跟随当前滑块，适合内容长度不一的卡片。",
        "sync": "填入另一个滑块的选择器即可双向联动，用于缩略图画廊。",
        "breakpoints": "以 JSON 按屏幕宽度覆盖设置，例如 {\"640\":{\"perView\":2},\"1024\":{\"perView\":3}}",
        "grabCursor": "悬停时切换为抓取光标，提示可以拖动。",
        "slideToClickedSlide": "点击旁边的滑块即可将其移到当前位置。"
        ,"velocityInfluence": "释放时的惯性倍率。设为 0 可关闭甩动，设为大于 1 可移动更远；不适用于 Radial。"
        ,"spring": "使用弹簧物理进行轨道定位。关闭后保持默认插值。"
        ,"stiffness": "设置弹簧拉向目标的力度。"
        ,"damping": "衰减弹簧速度并调整回弹程度。"
        ,"mass": "设置弹簧质量；数值越大，定位越慢。"
      },
      "glitch": {
        "seed": "随机种子。相同数值会重现相同的爆发序列，可固定满意的效果。",
        "channelOffset": "R/G/B 通道分离的最大距离（px），决定色边强度。",
        "maxSliceOffset": "横向撕裂条带的最大位移（px）。数值越大画面撕得越开。",
        "sliceCountMin": "单次爆发最少撕出的条带数。",
        "sliceCountMax": "单次爆发最多撕出的条带数。与最小值差距越大，变化越丰富。",
        "burstDurationMin": "爆发持续的最短时长（ms）。数值小则一闪而过。",
        "burstDurationMax": "爆发持续的最长时长（ms）。",
        "intervalMin": "两次爆发之间静止间隔的最短时长（ms）。",
        "intervalMax": "两次爆发之间静止间隔的最长时长（ms）。加大后时机更难预测。",
        "artifactCount": "每次爆发撒出的方块噪点数量。为 0 时只保留条带。",
        "artifactMinSize": "噪点方块边长的最小值（px）。",
        "artifactMaxSize": "噪点方块边长的最大值（px）。与最小值差距越大，大小越混杂。"
      },
      "lazy": {
        "seed": "随机种子。相同数值会重现完全相同的瓦片布局与故障顺序。",
        "tileMin": "瓦片边长的最小值（px）。数值越小碎片越细，拼装感越强。",
        "tileMax": "瓦片边长的最大值（px）。与最小值差距越大，大块与碎片越混杂。",
        "colors": "以逗号分隔的故障配色。留空则使用默认 RGB 三色（#ff2e2e、#00e07a、#2b6bff）。"
      }
    },
    "zh-TW": {
      "slider": {
        "position": "圓弧靠向哪一邊。bottom 會沿下緣呈扇形展開。",
        "radius": "圓弧半徑（px）。數值越大弧度越平緩，滑塊鋪得越開。",
        "step": "相鄰滑塊之間的角度間隔（度）。數值越小排列越密。",
        "activeAngle": "目前滑塊所在的角度。0 為正前方，正負號可旋轉基準位置。",
        "duration": "滑塊移動到下一位置所需的秒數。0 表示瞬間切換。",
        "controls": "顯示上一張／下一張按鈕。關閉後只能用拖曳、滾輪和鍵盤操作。",
        "activeClass": "加到目前滑塊的 CSS 類別名稱，便於掛接自訂樣式。",
        "perGroup": "每次切換前進的滑塊數量。設為與 perView 相同即整頁翻動。",
        "autoHeight": "軌道高度跟隨目前滑塊，適合內容長度不一的卡片。",
        "sync": "填入另一個滑塊的選擇器即可雙向連動，用於縮圖畫廊。",
        "breakpoints": "以 JSON 按螢幕寬度覆寫設定，例如 {\"640\":{\"perView\":2},\"1024\":{\"perView\":3}}",
        "grabCursor": "停留時切換為抓取游標，提示可以拖曳。",
        "slideToClickedSlide": "點擊旁邊的滑塊即可將其移到目前位置。"
        ,"velocityInfluence": "釋放時的慣性倍率。設為 0 可關閉甩動，設為大於 1 可移動更遠；不適用於 Radial。"
        ,"spring": "使用彈簧物理進行軌道定位。關閉後維持預設插值。"
        ,"stiffness": "設定彈簧拉向目標的力度。"
        ,"damping": "衰減彈簧速度並調整回彈程度。"
        ,"mass": "設定彈簧質量；數值越大，定位越慢。"
      },
      "glitch": {
        "seed": "隨機種子。相同數值會重現相同的爆發序列，可固定滿意的效果。",
        "channelOffset": "R/G/B 通道分離的最大距離（px），決定色邊強度。",
        "maxSliceOffset": "橫向撕裂條帶的最大位移（px）。數值越大畫面撕得越開。",
        "sliceCountMin": "單次爆發最少撕出的條帶數。",
        "sliceCountMax": "單次爆發最多撕出的條帶數。與最小值差距越大，變化越豐富。",
        "burstDurationMin": "爆發持續的最短時長（ms）。數值小則一閃而過。",
        "burstDurationMax": "爆發持續的最長時長（ms）。",
        "intervalMin": "兩次爆發之間靜止間隔的最短時長（ms）。",
        "intervalMax": "兩次爆發之間靜止間隔的最長時長（ms）。加大後時機更難預測。",
        "artifactCount": "每次爆發撒出的方塊雜點數量。為 0 時只保留條帶。",
        "artifactMinSize": "雜點方塊邊長的最小值（px）。",
        "artifactMaxSize": "雜點方塊邊長的最大值（px）。與最小值差距越大，大小越混雜。"
      },
      "lazy": {
        "seed": "隨機種子。相同數值會重現完全相同的方塊佈局與故障順序。",
        "tileMin": "方塊邊長的最小值（px）。數值越小碎片越細，拼裝感越強。",
        "tileMax": "方塊邊長的最大值（px）。與最小值差距越大，大塊與碎片越混雜。",
        "colors": "以逗號分隔的故障配色。留空則使用預設 RGB 三色（#ff2e2e、#00e07a、#2b6bff）。"
      }
    },
    "ru": {
      "slider": {
        "position": "К какому краю прижата дуга. bottom раскрывает слайды веером у нижнего края.",
        "radius": "Радиус дуги в px. Чем больше, тем площе кривая и шире расходятся слайды.",
        "step": "Угол в градусах между соседними слайдами. Малые значения ставят их плотнее.",
        "activeAngle": "Угол, на котором стоит активный слайд. 0 — прямо по центру, знак поворачивает базу.",
        "duration": "Секунды на переход слайда в следующее положение. 0 — мгновенно.",
        "controls": "Показывать кнопки «назад/вперёд». Выкл. — остаются только перетаскивание, колесо и клавиатура.",
        "activeClass": "CSS-класс, добавляемый активному слайду, чтобы зацепить свои стили.",
        "perGroup": "Сколько слайдов прокручивается за шаг. Равное perView даёт постраничную прокрутку.",
        "autoHeight": "Высота дорожки подстраивается под активный слайд — для карточек разной длины.",
        "sync": "Селектор другого слайдера для двусторонней связи — паттерн галереи с миниатюрами.",
        "breakpoints": "Переопределения по ширине в JSON, напр. {\"640\":{\"perView\":2},\"1024\":{\"perView\":3}}",
        "grabCursor": "Курсор-«рука» при наведении, чтобы было видно: можно тащить.",
        "slideToClickedSlide": "Клик по соседнему слайду выводит его в активную позицию."
        ,"velocityInfluence": "Множитель инерции при отпускании. 0 отключает рывок, значение выше 1 ведёт дальше; на Radial не действует."
        ,"spring": "Использует пружинную физику для стабилизации трека. Выключите, чтобы сохранить интерполяцию по умолчанию."
        ,"stiffness": "Задаёт силу притяжения пружины к цели."
        ,"damping": "Ослабляет скорость пружины и регулирует отскок."
        ,"mass": "Задаёт массу пружины; большие значения замедляют стабилизацию."
      },
      "glitch": {
        "seed": "Сид случайности. При том же значении повторяется та же серия вспышек — можно закрепить удачный вариант.",
        "channelOffset": "Насколько далеко расходятся каналы R/G/B, в px — сила цветной каймы.",
        "maxSliceOffset": "Максимальный сдвиг разорванной полосы по горизонтали, в px. Больше — сильнее рвёт кадр.",
        "sliceCountMin": "Минимальное число полос за одну вспышку.",
        "sliceCountMax": "Максимальное число полос за вспышку. Больший разрыв с минимумом даёт больше разнообразия.",
        "burstDurationMin": "Минимальная длительность вспышки, мс. Малые значения читаются как рывок.",
        "burstDurationMax": "Максимальная длительность вспышки, мс.",
        "intervalMin": "Минимальная тихая пауза между вспышками, мс.",
        "intervalMax": "Максимальная тихая пауза между вспышками, мс. Расширьте её — момент станет непредсказуем.",
        "artifactCount": "Сколько квадратных блоков-артефактов разбрасывает вспышка. 0 — только полосы.",
        "artifactMinSize": "Минимальная сторона блока-артефакта, px.",
        "artifactMaxSize": "Максимальная сторона блока-артефакта, px. Шире диапазон — смесь крупных и мелких."
      },
      "lazy": {
        "seed": "Сид случайности. То же значение воспроизводит ту же раскладку плиток и порядок глитча.",
        "tileMin": "Минимальная сторона плитки, px. Меньше — изображение дробится мельче.",
        "tileMax": "Максимальная сторона плитки, px. Шире диапазон — крупные плиты вперемешку с осколками.",
        "colors": "Палитра глитча через запятую. Пусто — стандартная тройка RGB (#ff2e2e, #00e07a, #2b6bff)."
      }
    },
    "it": {
      "slider": {
        "position": "Su quale lato si aggancia l’arco. Con bottom le slide si aprono a ventaglio in basso.",
        "radius": "Raggio dell’arco in px. Valori alti appiattiscono la curva e allargano le slide.",
        "step": "Angolo in gradi fra due slide vicine. Valori piccoli le addensano.",
        "activeAngle": "Angolo su cui si posa la slide attiva. 0 è al centro; il segno ruota la posizione base.",
        "duration": "Secondi che una slide impiega a raggiungere la posizione successiva. 0 è istantaneo.",
        "controls": "Mostra i pulsanti precedente/successivo. Se spento restano trascinamento, rotella e tastiera.",
        "activeClass": "Classe CSS aggiunta alla slide attiva, per agganciare stili propri.",
        "perGroup": "Quante slide avanzano a ogni passo. Uguale a perView per sfogliare una pagina intera.",
        "autoHeight": "L’altezza della traccia segue la slide attiva, utile con schede di lunghezza diversa.",
        "sync": "Selettore di un altro slider per collegarli nei due sensi: il pattern galleria con miniature.",
        "breakpoints": "Override per larghezza in JSON, es. {\"640\":{\"perView\":2},\"1024\":{\"perView\":3}}",
        "grabCursor": "Cursore a mano al passaggio del mouse, per far capire che si può trascinare.",
        "slideToClickedSlide": "Cliccando una slide vicina, questa passa in posizione attiva."
        ,"velocityInfluence": "Moltiplicatore dell’inerzia al rilascio. 0 disattiva lo slancio, oltre 1 porta più lontano; non vale per Radial."
        ,"spring": "Usa la fisica della molla per stabilizzare il track. Disattivalo per mantenere l’interpolazione predefinita."
        ,"stiffness": "Controlla la forza con cui la molla raggiunge il target."
        ,"damping": "Smorza la velocità della molla e regola il rimbalzo."
        ,"mass": "Imposta la massa della molla; valori maggiori rallentano la stabilizzazione."
      },
      "glitch": {
        "seed": "Seme casuale. Lo stesso valore ripete la stessa sequenza di burst, così puoi fissare quella che preferisci.",
        "channelOffset": "Di quanto si separano i canali R/G/B, in px: l’intensità della frangia di colore.",
        "maxSliceOffset": "Spostamento laterale massimo di una banda lacerata, in px. Più alto, più squarcia il fotogramma.",
        "sliceCountMin": "Numero minimo di bande per un singolo burst.",
        "sliceCountMax": "Numero massimo di bande per burst. Aumenta la distanza dal minimo per più varietà.",
        "burstDurationMin": "Durata minima di un burst, in ms. Valori bassi sembrano uno scatto.",
        "burstDurationMax": "Durata massima di un burst, in ms.",
        "intervalMin": "Pausa minima di quiete fra due burst, in ms.",
        "intervalMax": "Pausa massima di quiete fra i burst, in ms. Allargala per un tempismo imprevedibile.",
        "artifactCount": "Quanti blocchi-artefatto quadrati sparge ogni burst. 0 lascia solo le bande.",
        "artifactMinSize": "Lato minimo di un blocco-artefatto, in px.",
        "artifactMaxSize": "Lato massimo di un blocco-artefatto, in px. Allarga il range per mischiare grandi e piccoli."
      },
      "lazy": {
        "seed": "Seme casuale. Lo stesso valore riproduce identici disposizione dei tasselli e ordine del glitch.",
        "tileMin": "Lato minimo del tassello, in px. Valori bassi frantumano l’immagine in pezzi più fini.",
        "tileMax": "Lato massimo del tassello, in px. Allarga il range per mischiare lastre e schegge.",
        "colors": "Palette del glitch separata da virgole. Vuota usa il trio RGB predefinito (#ff2e2e, #00e07a, #2b6bff)."
      }
    }
  };
  for (const [lang, modules] of Object.entries(ADD)) {
    sets[lang] = sets[lang] || {};
    for (const [moduleName, tips] of Object.entries(modules)) {
      sets[lang][moduleName] = Object.assign({}, sets[lang][moduleName], tips);
    }
  }
})();

// Cursor tooltips existed only in ko/en; the five remaining demo languages fell
// back to English. Translated so every drawer field reads natively.
(function () {
  const sets = window.MK_HELP_I18N;
  if (!sets) return;
  const ADD = {
    "ja": {
      "cursor": {
        "preset": "カーソルの種類。dot・ring・blob・crosshair・text・trail・orbit・snake・sparkle・image・custom。タッチ端末では自動でオフになります。",
        "src": "image カーソルに使う画像 URL。例: /cursor.png",
        "hoverSrc": "リンクやボタンの上で差し替える画像 URL(image タイプ)。",
        "width": "image カーソルの幅(px)。",
        "height": "image カーソルの高さ(px)。",
        "template": "custom カーソルとして描画する HTML 文字列。バッジでもアイコンでも SVG でも。",
        "hoverTemplate": "ホバー時に差し替わるカスタム HTML(custom タイプ)。",
        "hoverClass": "ホバー時にカーソル要素に付けるクラス(独自 CSS 用)。",
        "snakeText": "snake カーソルに流れる文字。",
        "snakeMinScale": "snake が止まったときの文字の最小倍率(大きいほど読みやすく保たれます)。",
        "orbitHoverScale": "orbit がリンク上で円に膨らむ倍率。",
        "color": "カーソルの色。",
        "dotSize": "中心の点の大きさ(px)。",
        "followerSize": "追従するリングの大きさ(px)。",
        "smoothing": "追従のなめらかさ(小さいほど遅れます)。",
        "hoverScale": "リンク上で大きくなる倍率。",
        "pressScale": "クリック時に縮む倍率。",
        "hoverEffect": "ホバー時にリング(ring)を大きくするか、内側の点(dot)だけを大きくするか。",
        "orbitRadius": "orbit の半径(px)。",
        "orbitText": "orbit カーソルで回る文字。"
      }
    },
    "zh-CN": {
      "cursor": {
        "preset": "光标类型：dot·ring·blob·crosshair·text·trail·orbit·snake·sparkle·image·custom。触屏设备自动关闭。",
        "src": "用作 image 光标的图片 URL，例如 /cursor.png",
        "hoverSrc": "悬停在链接/按钮上时替换的图片 URL（image 类型）。",
        "width": "image 光标宽度（px）。",
        "height": "image 光标高度（px）。",
        "template": "作为 custom 光标渲染的 HTML 字符串——徽标、图标、SVG 皆可。",
        "hoverTemplate": "悬停时替换的自定义 HTML（custom 类型）。",
        "hoverClass": "悬停时添加到光标元素的类名，供自定义 CSS 使用。",
        "snakeText": "在 snake 光标中拖尾的文字。",
        "snakeMinScale": "snake 停止时文字的最小缩放（越大越保持可读）。",
        "orbitHoverScale": "orbit 在链接上扩展为圆形的倍数。",
        "color": "光标颜色。",
        "dotSize": "中心圆点大小（px）。",
        "followerSize": "跟随圆环的大小（px）。",
        "smoothing": "跟随平滑度（越小延迟越大）。",
        "hoverScale": "在链接上放大的倍数。",
        "pressScale": "点击时缩放的倍数。",
        "hoverEffect": "悬停时是放大圆环（ring）还是只放大内部圆点（dot）。",
        "orbitRadius": "orbit 半径（px）。",
        "orbitText": "在 orbit 光标中环绕的文字。"
      }
    },
    "zh-TW": {
      "cursor": {
        "preset": "游標類型：dot·ring·blob·crosshair·text·trail·orbit·snake·sparkle·image·custom。觸控裝置自動關閉。",
        "src": "用作 image 游標的圖片 URL，例如 /cursor.png",
        "hoverSrc": "停留在連結／按鈕上時替換的圖片 URL（image 類型）。",
        "width": "image 游標寬度（px）。",
        "height": "image 游標高度（px）。",
        "template": "作為 custom 游標渲染的 HTML 字串——徽章、圖示、SVG 皆可。",
        "hoverTemplate": "停留時替換的自訂 HTML（custom 類型）。",
        "hoverClass": "停留時加到游標元素的類別名稱，供自訂 CSS 使用。",
        "snakeText": "在 snake 游標中拖尾的文字。",
        "snakeMinScale": "snake 停止時文字的最小縮放（越大越保持可讀）。",
        "orbitHoverScale": "orbit 在連結上擴展為圓形的倍數。",
        "color": "游標顏色。",
        "dotSize": "中心圓點大小（px）。",
        "followerSize": "跟隨圓環的大小（px）。",
        "smoothing": "跟隨平滑度（越小延遲越大）。",
        "hoverScale": "在連結上放大的倍數。",
        "pressScale": "點擊時縮放的倍數。",
        "hoverEffect": "停留時是放大圓環（ring）還是只放大內部圓點（dot）。",
        "orbitRadius": "orbit 半徑（px）。",
        "orbitText": "在 orbit 游標中環繞的文字。"
      }
    },
    "ru": {
      "cursor": {
        "preset": "Тип курсора: dot·ring·blob·crosshair·text·trail·orbit·snake·sparkle·image·custom. На тач-устройствах отключается автоматически.",
        "src": "URL изображения для курсора image, напр. /cursor.png",
        "hoverSrc": "URL изображения, подставляемого над ссылками и кнопками (тип image).",
        "width": "Ширина курсора image, px.",
        "height": "Высота курсора image, px.",
        "template": "HTML-строка, отрисованная как курсор custom — бейдж, иконка, SVG, что угодно.",
        "hoverTemplate": "Пользовательский HTML для наведения (тип custom).",
        "hoverClass": "Класс, добавляемый курсору при наведении, для своих CSS-эффектов.",
        "snakeText": "Текст, тянущийся за курсором snake.",
        "snakeMinScale": "Минимальный масштаб глифа, когда snake останавливается (больше — остаётся крупнее и читаемее).",
        "orbitHoverScale": "Насколько orbit раскрывается в круг над ссылками.",
        "color": "Цвет курсора.",
        "dotSize": "Размер центральной точки, px.",
        "followerSize": "Размер догоняющего кольца, px.",
        "smoothing": "Плавность следования (меньше — больше отставание).",
        "hoverScale": "Коэффициент увеличения над ссылками.",
        "pressScale": "Масштаб при нажатии.",
        "hoverEffect": "При наведении увеличивать кольцо (ring) или только внутреннюю точку (dot).",
        "orbitRadius": "Радиус orbit, px.",
        "orbitText": "Текст, вращающийся в курсоре orbit."
      }
    },
    "it": {
      "cursor": {
        "preset": "Tipo di cursore: dot·ring·blob·crosshair·text·trail·orbit·snake·sparkle·image·custom. Disattivato automaticamente sui dispositivi touch.",
        "src": "URL dell’immagine per il cursore image, es. /cursor.png",
        "hoverSrc": "URL dell’immagine da sostituire sopra link e pulsanti (tipo image).",
        "width": "Larghezza del cursore image (px).",
        "height": "Altezza del cursore image (px).",
        "template": "Stringa HTML resa come cursore custom: badge, icona, SVG, qualsiasi cosa.",
        "hoverTemplate": "HTML personalizzato che sostituisce al passaggio del mouse (tipo custom).",
        "hoverClass": "Classe aggiunta al cursore al passaggio del mouse, per effetti CSS propri.",
        "snakeText": "Testo che si trascina nel cursore snake.",
        "snakeMinScale": "Scala minima dei glifi quando snake si ferma (più alta = resta più grande e leggibile).",
        "orbitHoverScale": "Quanto orbit si espande in un cerchio sopra i link.",
        "color": "Colore del cursore.",
        "dotSize": "Dimensione del punto centrale (px).",
        "followerSize": "Dimensione dell’anello che segue (px).",
        "smoothing": "Morbidezza dell’inseguimento (più basso = più ritardo).",
        "hoverScale": "Fattore di ingrandimento sopra i link.",
        "pressScale": "Scala al clic.",
        "hoverEffect": "Al passaggio del mouse ingrandire l’anello (ring) o solo il punto interno (dot).",
        "orbitRadius": "Raggio di orbit (px).",
        "orbitText": "Testo che ruota nel cursore orbit."
      }
    }
  };
  for (const [lang, modules] of Object.entries(ADD)) {
    sets[lang] = sets[lang] || {};
    for (const [moduleName, tips] of Object.entries(modules)) {
      sets[lang][moduleName] = Object.assign({}, sets[lang][moduleName], tips);
    }
  }
})();

// Tooltips that merely restated their own label ('Glare opacity' -> 'Glare
// opacity.') taught nothing. Rewritten to say what the option does and when to
// reach for it. These OVERRIDE the earlier sets, so the assign order is
// reversed compared with the gap-filling blocks above.
(function () {
  const sets = window.MK_HELP_I18N;
  if (!sets) return;
  const OVERRIDE = {
    "ko": {
      "counter": {
        "seconds": "시계 모드에서 초 자리를 함께 보여줍니다. 끄면 시:분만 남아 차분해지고 매초 리렌더도 사라집니다."
      },
      "overflowText": {
        "pauseOnHover": "마우스를 올린 동안 흐름을 멈춰 긴 문구를 읽을 시간을 줍니다. 떼면 이어서 흐릅니다."
      },
      "cardGlow": {
        "shadowOpacity": "카드 아래 그림자의 진하기(0~1)입니다. 낮추면 떠 있는 느낌만 남고, 높이면 무게감이 생깁니다."
      },
      "tilt": {
        "glareOpacity": "기울일 때 표면을 지나가는 광택의 진하기(0~1)입니다. 유광 카드처럼 보이게 하려면 올립니다.",
        "glareRadius": "광택 덩어리의 크기(px)입니다. 작으면 좁고 뚜렷한 하이라이트, 크면 넓고 부드러운 반사가 됩니다.",
        "tiltShadowOpacity": "기울기에 따라 움직이는 그림자의 진하기(0~1)입니다. 0이면 그림자를 완전히 끕니다."
      },
      "mouseParallax": {
        "sensitivity": "마우스가 조금 움직였을 때 레이어가 얼마나 크게 반응할지입니다. 높이면 예민하고, 낮추면 묵직해집니다."
      },
      "cursor": {
        "orbitRadius": "글자가 커서를 도는 궤도의 반지름(px)입니다. 크게 하면 원이 넓어져 글자 사이가 벌어집니다."
      },
      "reveal": {
        "delay": "요소가 화면에 들어온 뒤 등장이 시작되기까지 기다리는 시간(초)입니다. 카드를 순차로 띄울 때 씁니다."
      },
      "scrollVelocity": {
        "maxRotate": "스크롤이 가장 빠를 때 요소가 돌아가는 최대 각도(도)입니다. 작게 두면 흔들림 정도로만 느껴집니다."
      },
      "progress": {
        "thickness": "진행 바의 굵기(px)입니다. 얇으면 페이지 상단의 얇은 선, 굵으면 뚜렷한 진행 표시가 됩니다."
      },
      "marquee": {
        "pauseOnHover": "마우스를 올린 동안 흐름을 멈춥니다. 링크가 들어 있는 마퀴라면 켜 두는 편이 클릭하기 쉽습니다."
      },
      "brushReveal": {
        "radius": "한 번 문질렀을 때 지워지는 원의 반지름(px)입니다. 크게 하면 몇 번만 쓸어도 그림이 드러납니다."
      },
      "textFill": {
        "start": "채우기가 시작되는 스크롤 지점입니다. 'top 80%'는 요소 위쪽이 화면 80% 높이에 닿는 순간을 뜻합니다.",
        "end": "채우기가 완료되는 스크롤 지점입니다. start와 벌리면 천천히, 좁히면 순식간에 채워집니다."
      },
      "cssScroll": {
        "end": "CSS 애니메이션 진행률이 100%에 닿는 스크롤 지점입니다. start와의 거리가 연출의 총 길이가 됩니다."
      }
    },
    "en": {
      "counter": {
        "seconds": "Include the seconds digits in clock mode. Off leaves hh:mm — calmer, and no re-render every second."
      },
      "overflowText": {
        "pauseOnHover": "Freeze the scroll while the pointer is over it, so a long line can actually be read. Resumes on leave."
      },
      "cardGlow": {
        "shadowOpacity": "How solid the drop shadow under the card is (0–1). Low just hints at lift; high gives it weight."
      },
      "tilt": {
        "glareOpacity": "Strength of the sheen that sweeps the surface as it tilts (0–1). Raise it for a glossy, laminated card.",
        "glareRadius": "Size of the glare blob in px. Small reads as a tight highlight, large as a broad soft reflection.",
        "tiltShadowOpacity": "How solid the shadow that moves with the tilt is (0–1). 0 turns the shadow off entirely."
      },
      "mouseParallax": {
        "sensitivity": "How much the layers answer a small pointer move. Higher feels twitchy, lower feels heavy and damped."
      },
      "cursor": {
        "orbitRadius": "Radius in px of the ring the letters travel around the cursor. Larger spreads the glyphs further apart."
      },
      "reveal": {
        "delay": "Seconds to wait after the element enters view before the entrance starts — handy for staging cards in order."
      },
      "scrollVelocity": {
        "maxRotate": "Degrees the element rotates at peak scroll speed. Keep it small and it reads as a nudge, not a spin."
      },
      "progress": {
        "thickness": "Height of the progress bar in px. Thin reads as a hairline at the top of the page, thick as a real gauge."
      },
      "marquee": {
        "pauseOnHover": "Stop the flow while the pointer is over it. Leave it on if the marquee contains links people must click."
      },
      "brushReveal": {
        "radius": "Radius in px of the circle each stroke erases. Larger means a couple of sweeps uncover the whole image."
      },
      "textFill": {
        "start": "Scroll position where filling begins. 'top 80%' means the element's top reaching 80% down the viewport.",
        "end": "Scroll position where filling completes. Far from start fills slowly; close to it fills almost at once."
      },
      "cssScroll": {
        "end": "Scroll position where the CSS animation reaches 100%. Its distance from start is the whole run length."
      }
    },
    "ja": {
      "counter": {
        "seconds": "時計モードで秒の桁も表示します。オフなら時:分だけになり、毎秒の再描画もなくなります。"
      },
      "overflowText": {
        "pauseOnHover": "ポインターを乗せている間だけ流れを止め、長い文を読む時間を与えます。離すと再開します。"
      },
      "cardGlow": {
        "shadowOpacity": "カード下の影の濃さ(0〜1)。低いと浮いている気配だけ、高いと重みが出ます。"
      },
      "tilt": {
        "glareOpacity": "傾けたときに表面を走る光沢の濃さ(0〜1)。光沢紙のように見せたいときは上げます。",
        "glareRadius": "光沢の塊の大きさ(px)。小さいと狭く鋭いハイライト、大きいと広く柔らかい反射になります。",
        "tiltShadowOpacity": "傾きに合わせて動く影の濃さ(0〜1)。0 で影を完全に消します。"
      },
      "mouseParallax": {
        "sensitivity": "マウスがわずかに動いたときレイヤーがどれだけ反応するか。高いと敏感、低いと重く落ち着きます。"
      },
      "cursor": {
        "orbitRadius": "文字がカーソルを回る軌道の半径(px)。大きくすると円が広がり文字の間隔も開きます。"
      },
      "reveal": {
        "delay": "要素が画面に入ってから登場が始まるまでの待ち時間(秒)。カードを順番に出すときに使います。"
      },
      "scrollVelocity": {
        "maxRotate": "スクロールが最速のとき要素が回る最大角度(度)。小さめなら回転ではなく揺れとして感じられます。"
      },
      "progress": {
        "thickness": "進行バーの太さ(px)。細いとページ上端の細線、太いとはっきりしたゲージになります。"
      },
      "marquee": {
        "pauseOnHover": "ポインターを乗せている間は流れを止めます。リンクを含むマーキーならオンのほうが押しやすいです。"
      },
      "brushReveal": {
        "radius": "1 回のストロークで消える円の半径(px)。大きくすると数回なぞるだけで絵が現れます。"
      },
      "textFill": {
        "start": "塗りが始まるスクロール位置。'top 80%' は要素の上端が画面の 80% の高さに達した瞬間を指します。",
        "end": "塗りが完了するスクロール位置。start と離すとゆっくり、近づけると一気に埋まります。"
      },
      "cssScroll": {
        "end": "CSS アニメーションの進行率が 100% に達するスクロール位置。start との距離が演出全体の長さになります。"
      }
    },
    "zh-CN": {
      "counter": {
        "seconds": "在时钟模式下同时显示秒位。关闭后只剩时:分，更安静，也不再每秒重绘。"
      },
      "overflowText": {
        "pauseOnHover": "指针悬停时暂停滚动，让长文有时间读完；移开后继续。"
      },
      "cardGlow": {
        "shadowOpacity": "卡片下投影的浓度（0–1）。低值只暗示悬浮感，高值则显得厚重。"
      },
      "tilt": {
        "glareOpacity": "倾斜时扫过表面的高光浓度（0–1）。想做出覆膜光面卡片就调高。",
        "glareRadius": "高光光斑的大小（px）。小则是紧凑的亮点，大则是宽而柔和的反射。",
        "tiltShadowOpacity": "随倾斜移动的阴影浓度（0–1）。为 0 时完全关闭阴影。"
      },
      "mouseParallax": {
        "sensitivity": "鼠标轻微移动时各图层的反应幅度。数值高显得灵敏，低则沉稳。"
      },
      "cursor": {
        "orbitRadius": "文字环绕光标的轨道半径（px）。数值越大圆越宽，字距也越松。"
      },
      "reveal": {
        "delay": "元素进入视口后、开始入场前的等待秒数，便于让卡片依次出现。"
      },
      "scrollVelocity": {
        "maxRotate": "滚动最快时元素旋转的最大角度（度）。数值小则只像轻微晃动而非旋转。"
      },
      "progress": {
        "thickness": "进度条的粗细（px）。细则如页面顶端的细线，粗则是明确的进度指示。"
      },
      "marquee": {
        "pauseOnHover": "指针悬停时停止滚动。若跑马灯里含链接，建议开启以便点击。"
      },
      "brushReveal": {
        "radius": "每次涂抹擦除的圆形半径（px）。数值越大，几笔就能揭开整幅图。"
      },
      "textFill": {
        "start": "填充开始的滚动位置。'top 80%' 指元素顶部到达视口 80% 高度的时刻。",
        "end": "填充完成的滚动位置。与 start 相距越远填充越慢，越近则几乎瞬间填满。"
      },
      "cssScroll": {
        "end": "CSS 动画进度达到 100% 的滚动位置。它与 start 的距离即整段动效的长度。"
      }
    },
    "zh-TW": {
      "counter": {
        "seconds": "在時鐘模式下同時顯示秒位。關閉後只剩時:分，更安靜，也不再每秒重繪。"
      },
      "overflowText": {
        "pauseOnHover": "指標停留時暫停滾動，讓長文有時間讀完；移開後繼續。"
      },
      "cardGlow": {
        "shadowOpacity": "卡片下陰影的濃度（0–1）。低值只暗示懸浮感，高值則顯得厚重。"
      },
      "tilt": {
        "glareOpacity": "傾斜時掃過表面的高光濃度（0–1）。想做出覆膜光面卡片就調高。",
        "glareRadius": "高光光斑的大小（px）。小則是緊湊的亮點，大則是寬而柔和的反射。",
        "tiltShadowOpacity": "隨傾斜移動的陰影濃度（0–1）。為 0 時完全關閉陰影。"
      },
      "mouseParallax": {
        "sensitivity": "滑鼠輕微移動時各圖層的反應幅度。數值高顯得靈敏，低則沉穩。"
      },
      "cursor": {
        "orbitRadius": "文字環繞游標的軌道半徑（px）。數值越大圓越寬，字距也越鬆。"
      },
      "reveal": {
        "delay": "元素進入視窗後、開始入場前的等待秒數，便於讓卡片依次出現。"
      },
      "scrollVelocity": {
        "maxRotate": "滾動最快時元素旋轉的最大角度（度）。數值小則只像輕微晃動而非旋轉。"
      },
      "progress": {
        "thickness": "進度條的粗細（px）。細則如頁面頂端的細線，粗則是明確的進度指示。"
      },
      "marquee": {
        "pauseOnHover": "指標停留時停止滾動。若跑馬燈裡含連結，建議開啟以便點擊。"
      },
      "brushReveal": {
        "radius": "每次塗抹擦除的圓形半徑（px）。數值越大，幾筆就能揭開整幅圖。"
      },
      "textFill": {
        "start": "填充開始的滾動位置。'top 80%' 指元素頂端到達視窗 80% 高度的時刻。",
        "end": "填充完成的滾動位置。與 start 相距越遠填充越慢，越近則幾乎瞬間填滿。"
      },
      "cssScroll": {
        "end": "CSS 動畫進度達到 100% 的滾動位置。它與 start 的距離即整段動效的長度。"
      }
    },
    "ru": {
      "counter": {
        "seconds": "Показывать разряд секунд в режиме часов. Выкл. — остаётся чч:мм: спокойнее и без перерисовки каждую секунду."
      },
      "overflowText": {
        "pauseOnHover": "Останавливает бегущую строку под курсором, чтобы длинную фразу можно было прочитать. Продолжает при уходе."
      },
      "cardGlow": {
        "shadowOpacity": "Насколько плотная тень под карточкой (0–1). Малое — лишь намёк на подъём, большое даёт вес."
      },
      "tilt": {
        "glareOpacity": "Сила блика, скользящего по поверхности при наклоне (0–1). Выше — глянцевая, ламинированная карточка.",
        "glareRadius": "Размер пятна блика в px. Малый — узкий акцент, большой — широкое мягкое отражение.",
        "tiltShadowOpacity": "Плотность тени, движущейся вместе с наклоном (0–1). 0 полностью отключает тень."
      },
      "mouseParallax": {
        "sensitivity": "Насколько слои отвечают на малое движение курсора. Выше — нервно, ниже — тяжело и сдержанно."
      },
      "cursor": {
        "orbitRadius": "Радиус в px кольца, по которому буквы вращаются вокруг курсора. Больше — шире круг и разрежённее глифы."
      },
      "reveal": {
        "delay": "Сколько секунд ждать после появления элемента в области видимости — удобно, чтобы карточки выходили по очереди."
      },
      "scrollVelocity": {
        "maxRotate": "Градусы поворота элемента на пике скорости прокрутки. Маленькое значение читается как толчок, а не вращение."
      },
      "progress": {
        "thickness": "Толщина полосы прогресса в px. Тонкая — волосяная линия сверху страницы, толстая — настоящий индикатор."
      },
      "marquee": {
        "pauseOnHover": "Останавливать бег под курсором. Если в строке есть ссылки, лучше включить — их станет проще нажать."
      },
      "brushReveal": {
        "radius": "Радиус в px круга, стираемого одним движением. Больше — пары взмахов хватит, чтобы открыть картинку."
      },
      "textFill": {
        "start": "Позиция прокрутки, где начинается заливка. 'top 80%' — верх элемента дошёл до 80% высоты экрана.",
        "end": "Позиция прокрутки, где заливка завершается. Далеко от start — медленно, близко — почти мгновенно."
      },
      "cssScroll": {
        "end": "Позиция прокрутки, где CSS-анимация достигает 100%. Расстояние от start и есть вся длина сцены."
      }
    },
    "it": {
      "counter": {
        "seconds": "Mostra anche le cifre dei secondi in modalità orologio. Se spento resta hh:mm: più sobrio e senza ridisegno ogni secondo."
      },
      "overflowText": {
        "pauseOnHover": "Ferma lo scorrimento mentre il puntatore è sopra, così una riga lunga si può leggere. Riprende all’uscita."
      },
      "cardGlow": {
        "shadowOpacity": "Quanto è densa l’ombra sotto la scheda (0–1). Bassa suggerisce solo il sollevamento, alta dà peso."
      },
      "tilt": {
        "glareOpacity": "Intensità del riflesso che scorre sulla superficie inclinandosi (0–1). Alzalo per una scheda lucida, plastificata.",
        "glareRadius": "Dimensione della macchia di riflesso in px. Piccola è un punto luce netto, grande un riflesso ampio e morbido.",
        "tiltShadowOpacity": "Densità dell’ombra che si muove con l’inclinazione (0–1). 0 la disattiva del tutto."
      },
      "mouseParallax": {
        "sensitivity": "Quanto i livelli rispondono a un piccolo movimento del puntatore. Alto è nervoso, basso pesante e smorzato."
      },
      "cursor": {
        "orbitRadius": "Raggio in px dell’anello su cui le lettere girano attorno al cursore. Più grande allarga il cerchio e distanzia i glifi."
      },
      "reveal": {
        "delay": "Secondi di attesa dopo che l’elemento entra in vista prima dell’ingresso: utile per far comparire le schede in ordine."
      },
      "scrollVelocity": {
        "maxRotate": "Gradi di rotazione dell’elemento alla massima velocità di scorrimento. Se piccolo sembra una spinta, non una rotazione."
      },
      "progress": {
        "thickness": "Spessore della barra di avanzamento in px. Sottile è un filo in cima alla pagina, spessa un vero indicatore."
      },
      "marquee": {
        "pauseOnHover": "Ferma lo scorrimento mentre il puntatore è sopra. Tienilo attivo se il marquee contiene link da cliccare."
      },
      "brushReveal": {
        "radius": "Raggio in px del cerchio cancellato da ogni passata. Più grande, e bastano due gesti per svelare l’immagine."
      },
      "textFill": {
        "start": "Posizione di scroll in cui inizia il riempimento. 'top 80%' è il bordo alto dell’elemento all’80% del viewport.",
        "end": "Posizione di scroll in cui il riempimento si completa. Lontano da start è lento, vicino quasi istantaneo."
      },
      "cssScroll": {
        "end": "Posizione di scroll in cui l’animazione CSS raggiunge il 100%. La distanza da start è l’intera durata."
      }
    }
  };
  const LAZY_WAVE = {
    ko: {
      grain: '이미지가 나타나는 동안 겹치는 필름 입자의 최대 불투명도입니다.',
      waveAmplitude: '처음 적용되는 물결의 최대 가로 이동량(px)입니다.',
      waveFrequency: '세로 방향 물결의 촘촘함입니다.',
      waveSpeed: '물결 위상이 흐르는 속도입니다.',
      waveSliceHeight: '물결을 그리는 가로 조각의 높이(px)입니다.'
    },
    en: {
      grain: 'Peak opacity of the film grain while the image resolves.',
      waveAmplitude: 'Maximum horizontal displacement of the initial wave, in pixels.',
      waveFrequency: 'Vertical density of the wave pattern.',
      waveSpeed: 'Speed at which the wave phase travels.',
      waveSliceHeight: 'Height of each horizontal wave slice, in pixels.'
    },
    ja: {
      grain: '画像が現れる間に重なるフィルム粒子の最大不透明度です。',
      waveAmplitude: '最初の波が横にずれる最大量(px)です。',
      waveFrequency: '縦方向の波の密度です。',
      waveSpeed: '波の位相が移動する速度です。',
      waveSliceHeight: '波を描く横スライスの高さ(px)です。'
    },
    'zh-CN': {
      grain: '图像显现时叠加的胶片颗粒最大不透明度。',
      waveAmplitude: '初始波纹的最大水平位移（px）。',
      waveFrequency: '垂直方向波纹的密度。',
      waveSpeed: '波纹相位移动的速度。',
      waveSliceHeight: '每个水平波纹切片的高度（px）。'
    },
    'zh-TW': {
      grain: '影像顯現時疊加的底片顆粒最大不透明度。',
      waveAmplitude: '初始波紋的最大水平位移（px）。',
      waveFrequency: '垂直方向波紋的密度。',
      waveSpeed: '波紋相位移動的速度。',
      waveSliceHeight: '每個水平波紋切片的高度（px）。'
    },
    ru: {
      grain: 'Максимальная непрозрачность плёночного зерна во время проявления.',
      waveAmplitude: 'Максимальное горизонтальное смещение начальной волны в px.',
      waveFrequency: 'Плотность волн по вертикали.',
      waveSpeed: 'Скорость движения фазы волны.',
      waveSliceHeight: 'Высота горизонтальной полосы волны в px.'
    },
    it: {
      grain: 'Opacità massima della grana durante la comparsa dell’immagine.',
      waveAmplitude: 'Spostamento orizzontale massimo dell’onda iniziale, in px.',
      waveFrequency: 'Densità verticale del motivo ondulato.',
      waveSpeed: 'Velocità di scorrimento della fase dell’onda.',
      waveSliceHeight: 'Altezza di ogni fascia orizzontale dell’onda, in px.'
    }
  };
  const FLIP_HELP = {
    ko: {
      mode: '재배치 방식입니다. none=즉시 변경, slide=이동, fade=사라진 뒤 새 위치에서 등장, crossfade=두 상태가 교차 전환, fade-slide=이동+페이드, scale=축소 후 확대.',
      duration: '재배치 모션 한 번의 시간(초)입니다. mode가 none이면 적용되지 않습니다.',
      stagger: '여러 항목의 모션이 시작되는 시간 간격(초)입니다.',
      watch: '외부 코드가 직계 자식 DOM을 추가·삭제·재배치할 때 자동 재생합니다. shuffle(), sort(), reorder() 같은 인스턴스 메서드는 이 설정과 관계없이 직접 재생됩니다.',
      viewTransition: '같은 문서의 data-kt-layout-id 항목 재배치에 브라우저 View Transitions를 사용합니다. 지원하지 않거나 식별자가 없으면 기존 FLIP으로 돌아갑니다.'
    },
    en: {
      mode: 'Reorder style: none=instant, slide=move, fade=fade out then in, crossfade=dissolve between layouts, fade-slide=move and fade, scale=shrink then grow.',
      duration: 'Duration of one reorder animation in seconds. It is ignored when mode is none.',
      stagger: 'Delay in seconds between the starts of item animations.',
      watch: 'Automatically plays when external code adds, removes, or reorders direct child DOM nodes. Instance methods such as shuffle(), sort(), and reorder() play directly regardless of this setting.',
      viewTransition: 'Uses same-document View Transitions for items with data-kt-layout-id. Unsupported browsers or missing IDs fall back to the existing FLIP path.'
    },
    ja: {
      mode: '項目を並べ替える動きです。noneはモーションなしで新しい位置へ即座に切り替えます。',
      duration: '1回の並べ替えモーションの時間（秒）。modeがnoneの場合は適用されません。',
      stagger: '各項目のモーション開始間隔（秒）です。',
      watch: '外部コードが直下のDOM子要素を追加・削除・並べ替えた時に自動再生します。shuffle()、sort()、reorder()はこの設定に関係なく直接再生します。',
      viewTransition: 'data-kt-layout-id付きの同一文書の再配置でView Transitionsを使います。非対応環境やID未設定時はFLIPに戻ります。'
    },
    'zh-CN': {
      mode: '项目重新排列时的移动方式。none 会无动画地立即切换到新位置。',
      duration: '单次重排动画时长（秒）；mode 为 none 时不生效。',
      stagger: '各项目动画开始之间的间隔（秒）。',
      watch: '外部代码添加、删除或重排直属 DOM 子节点时自动播放。shuffle()、sort()、reorder() 等实例方法不受此设置影响，会直接播放。',
      viewTransition: '对带有 data-kt-layout-id 的同文档重排使用 View Transitions。不支持或缺少 ID 时回退到现有 FLIP。'
    },
    'zh-TW': {
      mode: '項目重新排列時的移動方式。none 會不使用動畫，立即切換到新位置。',
      duration: '單次重排動畫時間（秒）；mode 為 none 時不套用。',
      stagger: '各項目動畫開始之間的間隔（秒）。',
      watch: '外部程式碼新增、刪除或重排直屬 DOM 子節點時自動播放。shuffle()、sort()、reorder() 等實例方法不受此設定影響，會直接播放。',
      viewTransition: '對帶有 data-kt-layout-id 的同文件重排使用 View Transitions。不支援或缺少 ID 時回退到現有 FLIP。'
    },
    ru: {
      mode: 'Способ перехода элементов на новые места. none применяет новую раскладку сразу, без анимации.',
      duration: 'Длительность одной анимации перестановки в секундах. Не используется при mode none.',
      stagger: 'Задержка между началом анимации элементов в секундах.',
      watch: 'Автозапуск при добавлении, удалении или перестановке прямых дочерних DOM-узлов внешним кодом. Методы shuffle(), sort() и reorder() запускаются напрямую независимо от этой настройки.',
      viewTransition: 'Использует View Transitions для перестановки элементов с data-kt-layout-id в одном документе. При отсутствии поддержки или ID используется текущий FLIP.'
    },
    it: {
      mode: 'Come gli elementi raggiungono la nuova posizione. none applica subito il nuovo layout senza animazione.',
      duration: 'Durata di una transizione di riordino, in secondi. Non si applica con mode none.',
      stagger: 'Intervallo in secondi tra l’avvio delle animazioni degli elementi.',
      watch: 'Avvia automaticamente quando codice esterno aggiunge, rimuove o riordina figli DOM diretti. I metodi shuffle(), sort() e reorder() si avviano direttamente indipendentemente da questa opzione.',
      viewTransition: 'Usa View Transitions nello stesso documento per elementi con data-kt-layout-id. Se non supportato o senza ID, torna al percorso FLIP esistente.'
    }
  };
  for (const [lang, tips] of Object.entries(FLIP_HELP)) {
    OVERRIDE[lang] = OVERRIDE[lang] || {};
    OVERRIDE[lang].flip = Object.assign({}, OVERRIDE[lang].flip, tips);
  }
  for (const [lang, tips] of Object.entries(LAZY_WAVE)) {
    OVERRIDE[lang] = OVERRIDE[lang] || {};
    OVERRIDE[lang].lazy = Object.assign({}, OVERRIDE[lang].lazy, tips);
  }
  for (const [lang, modules] of Object.entries(OVERRIDE)) {
    sets[lang] = sets[lang] || {};
    for (const [moduleName, tips] of Object.entries(modules)) {
      sets[lang][moduleName] = Object.assign({}, sets[lang][moduleName], tips);
    }
  }
})();

(function () {
  const sets = window.MK_HELP_I18N;
  if (!sets) return;
  const tips = {
    ko: '시계 대신 경과 초 또는 남은 초를 000S 형식으로 표시합니다. since는 경과 시간, until은 카운트다운입니다.',
    en: 'Shows elapsed or remaining seconds as 000S. Use since for elapsed time and until for a countdown.',
    ja: '時計の代わりに経過秒または残り秒を000S形式で表示します。sinceは経過時間、untilはカウントダウンです。',
    'zh-CN': '以 000S 显示经过秒数或剩余秒数。since 用于经过时间，until 用于倒计时。',
    'zh-TW': '以 000S 顯示經過秒數或剩餘秒數。since 用於經過時間，until 用於倒數計時。',
    ru: 'Показывает прошедшие или оставшиеся секунды как 000S. since — прошедшее время, until — обратный отсчёт.',
    it: 'Mostra secondi trascorsi o rimanenti come 000S. Usa since per il trascorso e until per il conto alla rovescia.'
  };
  for (const [lang, text] of Object.entries(tips)) {
    sets[lang] = sets[lang] || {};
    sets[lang].counter = Object.assign({}, sets[lang].counter, { secondsOnly: text });
  }
})();

(function () {
  const sets = window.MK_HELP_I18N;
  if (!sets) return;
  const tips = {
    ko: {
      relativeStyle: '상대 시간의 길이를 정합니다. long은 “5분 전”, short와 narrow는 더 짧은 표기를 사용합니다.',
      relativeUnit: 'auto는 시간 차이에 맞는 단위를 고릅니다. 특정 단위를 고르면 모든 값을 그 단위로 계산합니다.',
      relativeRounding: '단위를 나눈 소수 값을 반올림, 내림, 올림 또는 버림할지 정합니다.',
      relativeCutoff: '이 기간을 넘기면 relative 모드가 현지화된 원래 날짜로 전환됩니다. 0은 전환하지 않습니다.',
      relativeCutoffUnit: '절대 날짜 전환 기준에 사용할 시간 단위입니다.'
    },
    en: {
      relativeStyle: 'Controls relative-time length. long uses words; short and narrow use compact output.',
      relativeUnit: 'auto chooses from the time difference. A chosen unit calculates every value in that unit.',
      relativeRounding: 'How fractional unit values are rounded: nearest, down, up, or toward zero.',
      relativeCutoff: 'After this age, relative mode switches to the localized original date. Zero disables the handoff.',
      relativeCutoffUnit: 'Time unit used for the absolute-date handoff threshold.'
    },
    ja: {
      relativeStyle: '相対時刻の長さです。longは語句、shortとnarrowは短い表記を使います。',
      relativeUnit: 'autoは時間差に合う単位を選びます。固定するとすべてその単位で計算します。',
      relativeRounding: '単位で割った小数を四捨五入、切り捨て、切り上げ、またはゼロ方向へ丸めます。',
      relativeCutoff: 'この期間を超えるとrelative表示は現地化された元の日付へ切り替わります。0は無効です。',
      relativeCutoffUnit: '絶対日付へ切り替える基準に使う時間単位です。'
    },
    'zh-CN': {
      relativeStyle: '控制相对时间的长度。long 使用完整文字；short 和 narrow 使用紧凑格式。',
      relativeUnit: 'auto 根据时间差选择单位。指定单位后所有值都按该单位计算。',
      relativeRounding: '设置单位换算后的小数如何取整：四舍五入、向下、向上或向零。',
      relativeCutoff: '超过此时长后，relative 模式切换为本地化的原始日期。0 表示不切换。',
      relativeCutoffUnit: '绝对日期切换阈值使用的时间单位。'
    },
    'zh-TW': {
      relativeStyle: '控制相對時間的長度。long 使用完整文字；short 和 narrow 使用精簡格式。',
      relativeUnit: 'auto 依時間差選擇單位。指定單位後所有值都按該單位計算。',
      relativeRounding: '設定單位換算後的小數如何取整：四捨五入、向下、向上或向零。',
      relativeCutoff: '超過此時長後，relative 模式切換為在地化的原始日期。0 表示不切換。',
      relativeCutoffUnit: '絕對日期切換門檻使用的時間單位。'
    },
    ru: {
      relativeStyle: 'Длина относительной записи. long использует слова, short и narrow — компактный вид.',
      relativeUnit: 'auto выбирает единицу по разнице времени. Выбранная единица применяется ко всем значениям.',
      relativeRounding: 'Как округлять дробное значение единицы: до ближайшего, вниз, вверх или к нулю.',
      relativeCutoff: 'После этого возраста relative переключается на локализованную исходную дату. Ноль отключает переключение.',
      relativeCutoffUnit: 'Единица времени для порога перехода к абсолютной дате.'
    },
    it: {
      relativeStyle: 'Lunghezza del tempo relativo. long usa parole, short e narrow una forma compatta.',
      relativeUnit: 'auto sceglie dall’intervallo. Un’unità scelta calcola ogni valore con quella unità.',
      relativeRounding: 'Come arrotondare valori frazionari: al più vicino, per difetto, per eccesso o verso zero.',
      relativeCutoff: 'Dopo questa età relative passa alla data originale localizzata. Zero disabilita il passaggio.',
      relativeCutoffUnit: 'Unità di tempo usata per la soglia di passaggio alla data assoluta.'
    }
  };
  for (const [lang, values] of Object.entries(tips)) {
    sets[lang] = sets[lang] || {};
    sets[lang].dateTime = Object.assign({}, sets[lang].dateTime, values);
  }
  const wave = {
    ko: ['CSS 색상 JSON 배열입니다. Wave 한 주기 안에서 순서대로 색조를 적용하며 빈 배열은 색조를 끕니다.', '재생 중 배경과 합성할 CSS mix-blend-mode입니다. 빈 값은 원래 스타일을 유지합니다.'],
    en: ['A JSON array of CSS colors. Wave cycles through the tints within one period; an empty array disables tinting.', 'CSS mix-blend-mode against the backdrop during playback. An empty value preserves author styling.'],
    ja: ['CSS色のJSON配列です。Waveの1周期内で順番に色を重ねます。空の配列で着色を無効にします。', '再生中の背景とのCSS mix-blend-modeです。空欄は元のスタイルを維持します。'],
    'zh-CN': ['CSS颜色的JSON数组。Wave在一个周期内依次着色；空数组禁用着色。', '播放时与背景合成的CSS mix-blend-mode。空值保留原始样式。'],
    'zh-TW': ['CSS色彩的JSON陣列。Wave在一個週期內依序著色；空陣列停用著色。', '播放時與背景合成的CSS mix-blend-mode。空值保留原始樣式。'],
    ru: ['JSON-массив цветов CSS. Wave меняет оттенки за один цикл; пустой массив отключает окраску.', 'CSS mix-blend-mode с фоном при воспроизведении. Пустое значение сохраняет исходный стиль.'],
    it: ['Array JSON di colori CSS. Wave alterna le tinte in un ciclo; un array vuoto disattiva la tinta.', 'CSS mix-blend-mode con lo sfondo durante la riproduzione. Un valore vuoto conserva lo stile originale.']
  };
  for (const [lang, values] of Object.entries(wave)) {
    sets[lang] = sets[lang] || {};
    sets[lang].glitch = Object.assign({}, sets[lang].glitch, { colors: values[0], blendMode: values[1] });
  }
  // Lazy dither / ascii / halftone — the shared stylized-media rasterizer.
  const stylized = {
    ko: {
      persist: '켜면 원본으로 돌아가지 않고 디더·ASCII·하프톤 모습을 그대로 유지합니다. GIF·영상은 프레임마다 다시 그립니다.',
      cellSize: '격자 한 칸의 크기(px)입니다. 리비얼은 이 크기에서 시작해 점점 촘촘해진 뒤 원본으로 전환합니다.',
      ditherType: "디더 방식입니다. 2x2~16x16은 정렬(Bayer) 격자로 클수록 곱고, cluster는 점이 덩어리로 자라는 인쇄 스크린, noise는 반복 타일이 없어 질감처럼 보입니다. random은 무작위 임계값, 나머지는 오차 확산.",
      halftoneShape: "하프톤 한 칸에 그리는 도형입니다. 어두울수록 크게 그립니다. dot·square·diamond·triangle은 채워지고, ring은 밝은 쪽이 가는 링, cross는 십자, line은 가로줄입니다.",
      halftoneAngle: "하프톤 스크린을 기울이는 각도(도)입니다. 0은 화면과 나란한 격자이고, 15~45도로 기울이면 격자 무늬가 눈에 덜 띄어 인쇄물에 가까워집니다.",
      asciiChars: '어두운 칸부터 밝은 칸 순서로 쓰는 글자열입니다. 마지막 글자가 공백이면 밝은 부분을 비웁니다.',
      asciiFont: 'ASCII 글리프에 쓰는 CSS font-family입니다. 고정폭 글꼴을 권장합니다.',
      paperColor: '배경(종이) 색입니다. 원본 색 유지가 꺼져 있을 때 밝은 부분에 칠합니다.',
      inkColor: '전경(잉크) 색입니다. 원본 색 유지가 꺼져 있을 때 어두운 부분에 칠합니다.',
      accentColor: '종이와 잉크 사이 중간 톤에 쓰는 세 번째 색입니다. 비우면 두 색만 사용합니다.',
      originalColors: '켜면 종이·잉크 색 대신 이미지의 원래 색을 색 단계 수만큼 포스터라이즈해 사용합니다.',
      colorSteps: '톤(또는 원본 색의 채널별) 단계 수입니다. 2는 순수 2톤, 클수록 부드러워집니다.',
      inverted: '밝기를 반전해 어두운 부분을 종이색, 밝은 부분을 잉크색으로 그립니다.'
    },
    en: {
      persist: 'Keep the dither, ASCII, or halftone look instead of resolving to the original. Animated images and video re-render every frame.',
      cellSize: 'Size of one grid cell in px. The reveal starts here, gets finer, then crossfades into the original.',
      ditherType: "How each cell is decided. 2x2-16x16 are Bayer grids; bigger is finer. cluster grows one blob per cell, like print. noise has no repeating tile. random is a per-cell threshold; the last two diffuse the error.",
      halftoneShape: "The shape drawn in each halftone cell; darker cells draw it larger. dot, square, diamond and triangle fill; ring is a thin outline that closes up as it darkens; cross is a plus; line is a horizontal bar.",
      halftoneAngle: "Angle of the halftone screen in degrees. 0 keeps the grid square to the frame; 15-45 tilts it so the lattice stops reading as a table, the way a print screen is rotated.",
      asciiChars: 'Glyph ramp from the darkest to the brightest cell. A trailing space leaves bright areas empty.',
      asciiFont: 'CSS font-family for the ASCII glyphs. A monospace font is recommended.',
      paperColor: 'Background (paper) color painted on bright areas when original colors are off.',
      inkColor: 'Foreground (ink) color painted on dark areas when original colors are off.',
      accentColor: 'Third color for mid tones between paper and ink. Leave empty for a two-color palette.',
      originalColors: 'Use the image’s own colors, posterized to the color steps, instead of the paper/ink palette.',
      colorSteps: 'Number of tone levels (per channel with original colors). 2 is pure two-tone; higher is smoother.',
      inverted: 'Invert brightness so dark areas take the paper color and bright areas the ink color.'
    },
    ja: {
      persist: 'オンにすると元画像に戻らず、ディザ・ASCII・ハーフトーンの見た目を保ちます。GIFや動画は毎フレーム描き直します。',
      cellSize: 'グリッド1マスの大きさ(px)です。リビールはこの大きさから細かくなり、最後に元画像へ切り替わります。',
      ditherType: "ディザの方式です。2x2〜16x16 は整列（Bayer）格子で大きいほど滑らか、cluster は点が塊に育つ印刷スクリーン、noise は繰り返しタイルがなく質感に見えます。random は無作為しきい値、残り二つは誤差拡散。",
      halftoneShape: "ハーフトーンの 1 マスに描く図形です。暗いほど大きく描きます。dot・square・diamond・triangle は塗り、ring は明るいほど細いリング、cross は十字、line は横線です。",
      halftoneAngle: "ハーフトーンのスクリーンを傾ける角度（度）です。0 は画面と平行な格子で、15〜45 度に傾けると格子が目立たなくなり印刷物に近づきます。",
      asciiChars: '暗いマスから明るいマスの順に使う文字列。末尾が空白なら明部を空けます。',
      asciiFont: 'ASCII文字に使うCSS font-family。等幅フォントを推奨します。',
      paperColor: '背景(紙)色。元の色を使わない場合、明部に塗ります。',
      inkColor: '前景(インク)色。元の色を使わない場合、暗部に塗ります。',
      accentColor: '紙とインクの中間トーンに使う3色目。空なら2色のみです。',
      originalColors: 'オンにすると紙・インク色の代わりに、画像本来の色を段階数でポスタライズして使います。',
      colorSteps: 'トーン(元の色ではチャンネルごと)の段階数。2は純粋な2トーン、大きいほど滑らかです。',
      inverted: '明るさを反転し、暗部を紙色、明部をインク色で描きます。'
    },
    'zh-CN': {
      persist: '开启后不再还原为原图，保留抖动、ASCII 或半调外观。GIF 和视频逐帧重绘。',
      cellSize: '网格单元大小(px)。显现从此大小开始逐渐变细，最后过渡到原图。',
      ditherType: "抖动方式。2x2~16x16 为有序（Bayer）网格，越大越细腻；cluster 让每格聚成墨点，像印刷网屏；noise 无重复图块，更像质感。random 为随机阈值，其余两种为误差扩散。",
      halftoneShape: "每个半调网格中绘制的形状，越暗越大。dot、square、diamond、triangle 为实心；ring 在亮部为细环并随变暗而闭合；cross 为十字；line 为横条。",
      halftoneAngle: "半调网屏的倾斜角度（度）。0 为与画面平行的网格；倾斜 15~45 度可让网格不那么明显，更接近印刷效果。",
      asciiChars: '从最暗到最亮单元使用的字符序列。末尾为空格时亮部留空。',
      asciiFont: 'ASCII 字形使用的 CSS font-family，推荐等宽字体。',
      paperColor: '背景(纸)色。关闭原始颜色时涂在亮部。',
      inkColor: '前景(墨)色。关闭原始颜色时涂在暗部。',
      accentColor: '纸与墨之间中间色调使用的第三种颜色。留空则只用两色。',
      originalColors: '开启后使用图像原本的颜色，并按颜色级数色调分离，而非纸/墨调色板。',
      colorSteps: '色调(原始颜色时为每通道)级数。2 为纯双色，越大越平滑。',
      inverted: '反转亮度，暗部用纸色、亮部用墨色绘制。'
    },
    'zh-TW': {
      persist: '開啟後不再還原為原圖，保留抖動、ASCII 或半色調外觀。GIF 與影片逐幀重繪。',
      cellSize: '網格單元大小(px)。顯現從此大小開始逐漸變細，最後過渡到原圖。',
      ditherType: "抖動方式。2x2~16x16 為有序（Bayer）網格，越大越細緻；cluster 讓每格聚成墨點，像印刷網屏；noise 無重複圖塊，更像質感。random 為隨機閾值，其餘兩種為誤差擴散。",
      halftoneShape: "每個半色調網格中繪製的形狀，越暗越大。dot、square、diamond、triangle 為實心；ring 在亮部為細環並隨變暗而閉合；cross 為十字；line 為橫條。",
      halftoneAngle: "半色調網屏的傾斜角度（度）。0 為與畫面平行的網格；傾斜 15~45 度可讓網格不那麼明顯，更接近印刷效果。",
      asciiChars: '從最暗到最亮單元使用的字元序列。末尾為空格時亮部留空。',
      asciiFont: 'ASCII 字形使用的 CSS font-family，建議等寬字型。',
      paperColor: '背景(紙)色。關閉原始顏色時塗在亮部。',
      inkColor: '前景(墨)色。關閉原始顏色時塗在暗部。',
      accentColor: '紙與墨之間中間色調使用的第三種顏色。留空則只用兩色。',
      originalColors: '開啟後使用圖像原本的顏色，並依顏色級數色調分離，而非紙/墨調色盤。',
      colorSteps: '色調(原始顏色時為每通道)級數。2 為純雙色，越大越平滑。',
      inverted: '反轉亮度，暗部用紙色、亮部用墨色繪製。'
    },
    ru: {
      persist: 'Сохранять дизеринг, ASCII или полутон вместо возврата к оригиналу. Анимированные изображения и видео перерисовываются каждый кадр.',
      cellSize: 'Размер одной ячейки сетки в px. Проявление начинается с него, становится мельче и переходит в оригинал.',
      ditherType: "Как решается ячейка. 2x2-16x16 - сетки Байера: крупнее значит тоньше. cluster растит один сгусток, как в печати. noise без повторов. random - случайный порог; остальные два диффузия.",
      halftoneShape: "Фигура в каждой ячейке полутона; чем темнее, тем крупнее. dot, square, diamond и triangle залиты; ring - тонкое кольцо, смыкающееся к тени; cross - крестик; line - горизонтальная полоса.",
      halftoneAngle: "Угол наклона полутонового растра в градусах. 0 — сетка параллельна кадру; 15-45 наклоняют её, и решётка перестаёт читаться как таблица, как в печатном растре.",
      asciiChars: 'Набор глифов от самой тёмной ячейки к самой светлой. Пробел в конце оставляет светлые области пустыми.',
      asciiFont: 'CSS font-family для глифов ASCII. Рекомендуется моноширинный шрифт.',
      paperColor: 'Цвет фона (бумаги) для светлых областей, когда исходные цвета выключены.',
      inkColor: 'Цвет переднего плана (чернил) для тёмных областей, когда исходные цвета выключены.',
      accentColor: 'Третий цвет для средних тонов между бумагой и чернилами. Пусто — только два цвета.',
      originalColors: 'Использовать собственные цвета изображения, постеризованные по числу ступеней, вместо палитры бумага/чернила.',
      colorSteps: 'Число ступеней тона (по каналам при исходных цветах). 2 — чистые два тона, больше — плавнее.',
      inverted: 'Инвертировать яркость: тёмные области получают цвет бумаги, светлые — цвет чернил.'
    },
    it: {
      persist: 'Mantiene l’aspetto dither, ASCII o mezzatinta invece di tornare all’originale. Immagini animate e video si ridisegnano a ogni frame.',
      cellSize: 'Dimensione di una cella della griglia in px. Il reveal parte da qui, si affina e poi sfuma nell’originale.',
      ditherType: "Come si decide ogni cella. 2x2-16x16 sono griglie Bayer: più grandi, più fini. cluster fa un punto per cella come in stampa. noise non si ripete. random usa una soglia casuale; gli altri due diffondono.",
      halftoneShape: "La forma disegnata in ogni cella a mezzatinta; più è scura, più è grande. dot, square, diamond e triangle sono piene; ring è un anello sottile che si chiude scurendosi; cross è una croce; line è una barra orizzontale.",
      halftoneAngle: "Angolo dello screen a mezzatinta in gradi. 0 mantiene la griglia parallela al fotogramma; 15-45 la inclina così il reticolo non sembra più una tabella, come negli screen di stampa.",
      asciiChars: 'Rampa di glifi dalla cella più scura alla più chiara. Uno spazio finale lascia vuote le aree chiare.',
      asciiFont: 'CSS font-family per i glifi ASCII. Consigliato un font monospazio.',
      paperColor: 'Colore di sfondo (carta) per le aree chiare quando i colori originali sono disattivati.',
      inkColor: 'Colore di primo piano (inchiostro) per le aree scure quando i colori originali sono disattivati.',
      accentColor: 'Terzo colore per i mezzitoni tra carta e inchiostro. Vuoto per una palette a due colori.',
      originalColors: 'Usa i colori propri dell’immagine, posterizzati sui passi di colore, invece della palette carta/inchiostro.',
      colorSteps: 'Numero di livelli di tono (per canale con i colori originali). 2 è un puro bitono; più alto è più morbido.',
      inverted: 'Inverte la luminosità: le aree scure prendono il colore carta, quelle chiare il colore inchiostro.'
    }
  };
  for (const [lang, values] of Object.entries(stylized)) {
    sets[lang] = sets[lang] || {};
    sets[lang].lazy = Object.assign({}, sets[lang].lazy, values);
  }
  // Stylize owns the same looks as a standalone module, so it reuses the
  // shared texture copy above (minus `persist`, which became `mode`) and adds
  // the controls only it has: what to apply, whether it stays, and when a
  // reveal runs.
  const stylizeOnly = {
      "ko": {
          "preset": "입힐 질감입니다. dither는 점 패턴, ascii는 글자 밀도, halftone은 인쇄 망점으로 그립니다.",
          "mode": "persist는 효과를 계속 유지하고, reveal은 한 번 재생한 뒤 원본 사진으로 넘어갑니다.",
          "trigger": "이미지·영상 reveal의 시작 조건입니다. load는 미디어가 준비되면, view는 화면에 들어오면, manual은 replay() 호출 후 시작합니다. 영상 자체의 재생은 별도로 제어합니다.",
          "duration": "reveal이 원본으로 넘어가기까지 걸리는 시간(초)입니다. persist에서는 쓰이지 않습니다.",
          "delay": "reveal을 시작하기 전에 기다리는 시간(ms)입니다.",
          "holdDuration": "원본이 드러난 뒤 레이어 제거와 완료 콜백까지 기다리는 시간(ms)입니다. 이미지·영상 모두 일시정지·숨김 탭 시간을 제외합니다.",
          "renderFps": "초당 다시 그리는 횟수의 상한입니다. 낮출수록 가볍고, 움직이는 소스는 부드러움이 줄어듭니다.",
          "maxDpr": "그릴 때 쓰는 픽셀 밀도의 상한입니다. 낮추면 고해상도 화면에서 비용이 크게 줄어듭니다.",
          "seed": "무작위 패턴의 시드입니다. 같은 값이면 같은 모양이 다시 나옵니다.",
          "transition": "리빌이 원본으로 넘어가는 방식입니다. dissolve는 셀 단위로 무작위로 걷히고, wipe는 대각선으로 훑으며, shrink는 셀을 점점 줄입니다(가장 부드럽지만 중간이 흐릿합니다).",
          "contrast": "디더링 전에 명암을 키웁니다. 사진은 대개 중간 톤이라 그대로 디더하면 뭉개지는데, 이 값을 올리면 형태가 또렷해집니다.",
          "brightness": "디더링 전에 밝기를 더하거나 뺍니다. 잉크가 너무 많거나 적을 때 조정합니다.",
          "motion": "효과가 계속 움직이는 방식입니다. drift는 격자가 기어가고, shuffle은 셀이 계속 바뀌며, scan은 밴드가 훑고, flow는 격자가 흐르고, pulse는 노출이 숨 쉽니다.",
          "motionSpeed": "움직임의 속도 배수입니다. 1이 기본이고 낮추면 느려집니다.",
          "motionAmount": "움직임의 세기입니다. 0에 가까우면 거의 정지, 1이면 가장 강합니다.",
          "pointer": "포인터에 반응하는 방식입니다. lens는 커서 주변을 다른 격자로 다시 그리고, spotlight는 잉크를 더하며, ripple은 물결이 퍼집니다.",
          "pointerRadius": "포인터 효과가 미치는 반지름(px)입니다.",
          "pointerStrength": "spotlight·ripple이 잉크를 바꾸는 세기입니다.",
          "pointerCellSize": "lens 안쪽에 쓰는 격자 크기(px)입니다. 0이면 바깥 격자의 절반을 씁니다."
      },
      "en": {
          "preset": "Which look to apply: dither draws a dot pattern, ascii a glyph-density grid, halftone a print screen.",
          "mode": "persist keeps the look for good; reveal plays it once and then hands off to the original picture.",
          "trigger": "Image/video reveal starts when media is ready (load), enters view (view), or replay() is called (manual). Video playback is controlled separately.",
          "duration": "How long a reveal takes to reach the original (s). Unused when the look persists.",
          "delay": "Wait before a reveal starts (ms).",
          "holdDuration": "Wait after revealing the original before layer removal and the completion callback (ms). Images and videos exclude paused and hidden-tab time.",
          "renderFps": "Upper limit on repaints per second. Lower is cheaper; moving sources look less smooth.",
          "maxDpr": "Upper limit on the pixel density used to draw. Lowering it saves a lot on high-density screens.",
          "seed": "Seed for the random patterns. The same value reproduces the same result.",
          "transition": "How a reveal hands the picture back: dissolve clears cells in a random order, wipe sweeps a diagonal edge, shrink walks the cell size down (softest, and blurry in between).",
          "contrast": "Push the contrast before dithering. Photographs sit in the middle of the range and dither to mush; raising this is what makes shapes read.",
          "brightness": "Add or remove brightness before dithering — use it when a picture comes out too inky or too empty.",
          "motion": "How the look keeps moving: drift crawls the grid, shuffle keeps swapping cells, scan sweeps a band, flow slides the grid, pulse breathes the exposure.",
          "motionSpeed": "Speed multiplier for the motion. 1 is the default; lower is slower.",
          "motionAmount": "How strong the motion is. Near 0 is almost still, 1 is the strongest.",
          "pointer": "How the look reacts to the pointer: lens redraws the area under it at another cell size, spotlight adds ink, ripple sends out waves.",
          "pointerRadius": "Radius in px the pointer effect reaches.",
          "pointerStrength": "How much spotlight and ripple change the ink.",
          "pointerCellSize": "Cell size in px inside the lens. 0 uses half the outer cell."
      },
      "ja": {
          "preset": "適用する質感です。ditherは点のパターン、asciiは文字の密度、halftoneは印刷の網点で描きます。",
          "mode": "persistは効果を保ち続け、revealは一度再生してから元の写真に引き継ぎます。",
          "trigger": "画像・動画revealの開始条件。loadはメディアの準備後、viewは画面に入ったとき、manualはreplay()呼び出し後です。動画自体の再生は別に制御します。",
          "duration": "revealが元画像に到達するまでの時間(秒)。persistでは使いません。",
          "delay": "revealを始める前に待つ時間(ms)です。",
          "holdDuration": "原本が現れた後、レイヤー削除と完了コールバックまで待つ時間(ms)。画像・動画とも一時停止・非表示タブの時間を除きます。",
          "renderFps": "1秒あたりの再描画回数の上限です。下げるほど軽くなり、動く素材は滑らかさが減ります。",
          "maxDpr": "描画に使うピクセル密度の上限です。下げると高精細画面での負荷が大きく減ります。",
          "seed": "ランダムパターンのシードです。同じ値なら同じ見た目が再現されます。",
          "transition": "リビールが元画像へ渡す方法です。dissolveはセル単位でランダムに消え、wipeは斜めに掃き、shrinkはセルを徐々に小さくします(最も滑らかですが途中がぼやけます)。",
          "contrast": "ディザリング前にコントラストを上げます。写真は中間調に寄るためそのままでは潰れますが、上げると形がはっきりします。",
          "brightness": "ディザリング前に明るさを足し引きします。インクが多すぎる/少なすぎるときに調整します。",
          "motion": "効果が動き続ける方法です。driftは格子が這い、shuffleはセルが入れ替わり、scanは帯が走り、flowは格子が流れ、pulseは露出が呼吸します。",
          "motionSpeed": "動きの速度倍率です。1が既定で、下げると遅くなります。",
          "motionAmount": "動きの強さです。0に近いとほぼ静止、1が最も強くなります。",
          "pointer": "ポインターへの反応方法です。lensはカーソル周辺を別の格子で描き直し、spotlightはインクを足し、rippleは波が広がります。",
          "pointerRadius": "ポインター効果が届く半径(px)です。",
          "pointerStrength": "spotlightとrippleがインクを変える強さです。",
          "pointerCellSize": "lens内側で使う格子サイズ(px)。0なら外側の半分を使います。"
      },
      "zh-CN": {
          "preset": "要应用的质感：dither 画点阵图案，ascii 用字符密度，halftone 画印刷网点。",
          "mode": "persist 会一直保持效果；reveal 播放一次后切换到原图。",
          "trigger": "图片或视频 reveal 的开始条件：load 为媒体就绪后，view 为进入视口时，manual 为调用 replay() 后。视频本身的播放需单独控制。",
          "duration": "reveal 过渡到原图所需的时间（秒）。persist 模式不使用。",
          "delay": "开始 reveal 之前的等待时间（毫秒）。",
          "holdDuration": "显示原始画面后，到移除图层并调用完成回调的等待时间（毫秒）。图片和视频均不计入暂停和标签页隐藏的时间。",
          "renderFps": "每秒重绘次数上限。数值越低越省性能，动态素材会不那么流畅。",
          "maxDpr": "绘制时使用的像素密度上限。降低后可显著减少高分屏上的开销。",
          "seed": "随机图案的种子。相同数值会得到相同结果。",
          "transition": "reveal 交还原图的方式：dissolve 按单元随机消散，wipe 沿对角线扫过，shrink 逐渐缩小单元（最柔和，但中间会发虚）。",
          "contrast": "抖动前提升对比度。照片多集中在中间调，直接抖动会糊成一片，提高该值能让形体清晰。",
          "brightness": "抖动前增减亮度。画面墨色过重或过淡时调整。",
          "motion": "效果持续运动的方式：drift 让网格缓慢爬行，shuffle 不断替换单元，scan 扫过一条带，flow 让网格流动，pulse 让曝光呼吸。",
          "motionSpeed": "运动速度倍数。默认 1，调低则更慢。",
          "motionAmount": "运动强度。接近 0 几乎静止，1 最强。",
          "pointer": "对指针的反应方式：lens 用另一种网格重绘光标周围，spotlight 增加墨量，ripple 扩散波纹。",
          "pointerRadius": "指针效果的作用半径（像素）。",
          "pointerStrength": "spotlight 与 ripple 改变墨量的强度。",
          "pointerCellSize": "lens 内部使用的网格大小（像素）。为 0 时使用外部网格的一半。"
      },
      "zh-TW": {
          "preset": "要套用的質感：dither 畫點陣圖案，ascii 用字元密度，halftone 畫印刷網點。",
          "mode": "persist 會一直保持效果；reveal 播放一次後切換到原圖。",
          "trigger": "圖片或影片 reveal 的開始條件：load 為媒體就緒後，view 為進入視窗時，manual 為呼叫 replay() 後。影片本身的播放需另外控制。",
          "duration": "reveal 過渡到原圖所需的時間（秒）。persist 模式不使用。",
          "delay": "開始 reveal 之前的等待時間（毫秒）。",
          "holdDuration": "顯示原始畫面後，到移除圖層並呼叫完成回呼的等待時間（毫秒）。圖片與影片都不計入暫停及分頁隱藏的時間。",
          "renderFps": "每秒重繪次數上限。數值越低越省效能，動態素材會不那麼流暢。",
          "maxDpr": "繪製時使用的像素密度上限。降低後可顯著減少高解析度螢幕上的負擔。",
          "seed": "隨機圖案的種子。相同數值會得到相同結果。",
          "transition": "reveal 交還原圖的方式：dissolve 依單元隨機消散，wipe 沿對角線掃過，shrink 逐漸縮小單元（最柔和，但中間會發虛）。",
          "contrast": "抖動前提升對比。照片多集中在中間調，直接抖動會糊成一片，提高此值能讓形體清晰。",
          "brightness": "抖動前增減亮度。畫面墨色過重或過淡時調整。",
          "motion": "效果持續運動的方式：drift 讓網格緩慢爬行，shuffle 不斷替換單元，scan 掃過一條帶，flow 讓網格流動，pulse 讓曝光呼吸。",
          "motionSpeed": "運動速度倍數。預設 1，調低則更慢。",
          "motionAmount": "運動強度。接近 0 幾乎靜止，1 最強。",
          "pointer": "對指標的反應方式：lens 用另一種網格重繪游標周圍，spotlight 增加墨量，ripple 擴散波紋。",
          "pointerRadius": "指標效果的作用半徑（像素）。",
          "pointerStrength": "spotlight 與 ripple 改變墨量的強度。",
          "pointerCellSize": "lens 內部使用的網格大小（像素）。為 0 時使用外部網格的一半。"
      },
      "ru": {
          "preset": "Какой вид применить: dither рисует точечный узор, ascii — сетку плотности символов, halftone — печатный растр.",
          "mode": "persist сохраняет эффект насовсем; reveal проигрывает его один раз и передаёт картинку оригиналу.",
          "trigger": "Условие начала reveal для изображения и видео: load — после загрузки медиа, view — при появлении в поле зрения, manual — по вызову replay(). Воспроизведение самого видео управляется отдельно.",
          "duration": "Сколько длится reveal до перехода к оригиналу (с). При постоянном эффекте не используется.",
          "delay": "Пауза перед началом reveal (мс).",
          "holdDuration": "Ожидание после показа оригинала до удаления слоя и вызова обработчика завершения (мс). Для изображений и видео время паузы и скрытой вкладки не учитывается.",
          "renderFps": "Верхний предел перерисовок в секунду. Меньше — дешевле, но движущийся источник будет менее плавным.",
          "maxDpr": "Верхний предел плотности пикселей при отрисовке. Снижение заметно экономит на плотных экранах.",
          "seed": "Зерно случайных узоров. Одно и то же значение даёт один и тот же результат.",
          "transition": "Как reveal возвращает картинку: dissolve убирает ячейки в случайном порядке, wipe проходит диагональной кромкой, shrink уменьшает ячейку (мягче всего, но промежуточные кадры размыты).",
          "contrast": "Поднять контраст до дизеринга. Фотографии лежат в средних тонах и без этого превращаются в кашу; именно контраст делает формы читаемыми.",
          "brightness": "Добавить или убрать яркость до дизеринга — когда краски слишком много или слишком мало.",
          "motion": "Как эффект продолжает двигаться: drift ползёт сеткой, shuffle постоянно меняет ячейки, scan проводит полосу, flow сдвигает сетку, pulse «дышит» экспозицией.",
          "motionSpeed": "Множитель скорости движения. По умолчанию 1, меньше — медленнее.",
          "motionAmount": "Сила движения. Около 0 почти неподвижно, 1 — максимально.",
          "pointer": "Как эффект реагирует на указатель: lens перерисовывает область под ним другой сеткой, spotlight добавляет краски, ripple расходится волнами.",
          "pointerRadius": "Радиус действия указателя в пикселях.",
          "pointerStrength": "Насколько сильно spotlight и ripple меняют краску.",
          "pointerCellSize": "Размер ячейки внутри линзы в пикселях. 0 — половина внешней ячейки."
      },
      "it": {
          "preset": "Quale resa applicare: dither disegna un motivo a punti, ascii una griglia di densità di glifi, halftone un retino di stampa.",
          "mode": "persist mantiene la resa per sempre; reveal la riproduce una volta e poi lascia spazio alla foto originale.",
          "trigger": "Avvio del reveal di immagini e video: load quando il media è pronto, view quando entra in vista, manual dopo replay(). La riproduzione del video si controlla separatamente.",
          "duration": "Quanto dura il reveal prima di arrivare all'originale (s). Non usato quando la resa è permanente.",
          "delay": "Attesa prima che il reveal inizi (ms).",
          "holdDuration": "Attesa dopo la comparsa dell'originale, prima di rimuovere il livello e chiamare il callback finale (ms). Per immagini e video esclude pause e schede nascoste.",
          "renderFps": "Limite di ridisegni al secondo. Più basso costa meno; le sorgenti in movimento risultano meno fluide.",
          "maxDpr": "Limite della densità di pixel usata per disegnare. Abbassarlo fa risparmiare molto sugli schermi ad alta densità.",
          "seed": "Seme dei motivi casuali. Lo stesso valore riproduce lo stesso risultato.",
          "transition": "Come il reveal restituisce l'immagine: dissolve libera le celle in ordine casuale, wipe passa con un bordo diagonale, shrink rimpicciolisce la cella (il più morbido, ma sfocato a metà strada).",
          "contrast": "Alza il contrasto prima del dithering. Le fotografie stanno nei mezzi toni e senza questo diventano poltiglia: è il contrasto a far leggere le forme.",
          "brightness": "Aggiunge o toglie luminosità prima del dithering — quando l'immagine risulta troppo carica o troppo vuota.",
          "motion": "Come la resa continua a muoversi: drift fa strisciare la griglia, shuffle scambia le celle, scan fa passare una banda, flow fa scorrere la griglia, pulse fa respirare l'esposizione.",
          "motionSpeed": "Moltiplicatore di velocità del movimento. 1 è il valore predefinito, più basso è più lento.",
          "motionAmount": "Quanto è forte il movimento. Vicino a 0 è quasi fermo, 1 è il massimo.",
          "pointer": "Come la resa reagisce al puntatore: lens ridisegna l'area sotto di esso con un'altra cella, spotlight aggiunge inchiostro, ripple propaga onde.",
          "pointerRadius": "Raggio in px raggiunto dal puntatore.",
          "pointerStrength": "Quanto spotlight e ripple cambiano l’inchiostro.",
          "pointerCellSize": "Dimensione della cella dentro la lente, in px. 0 usa metà della cella esterna."
      }
  };
  for (const [lang, values] of Object.entries(stylized)) {
    const { persist, ...shared } = values;
    void persist;
    sets[lang] = sets[lang] || {};
    sets[lang].stylize = Object.assign({}, sets[lang].stylize, shared, stylizeOnly[lang] || stylizeOnly.en);
  }
  const squircle = {
    "ko": {
      "preset": "모서리 곡선의 종류입니다. squircle은 애플이 쓰는 초타원, bevel은 직선으로 깎기, scoop은 안쪽으로 파기, notch는 사각으로 도려내기입니다.",
      "cornerRadius": "모서리가 차지하는 길이(px)입니다. 비워 두면 요소에 이미 걸려 있는 border-radius를 그대로 씁니다.",
      "superellipse": "CSS superellipse(K)의 K값입니다. 1이면 원, 2면 스퀘어클, 0이면 직선, 음수면 안쪽으로 휩니다. 프리셋보다 우선합니다.",
      "borderFollow": "요소에 테두리가 있을 때 그 테두리도 같은 곡선으로 다시 그릴지입니다. corner-shape를 지원하는 브라우저에서는 필요 없습니다.",
      "nativeShape": "off로 두면 지원하는 브라우저에서도 직접 그린 곡선을 씁니다. 두 방식을 비교할 때만 쓰세요.",
      "cornerSamples": "곡선을 몇 개의 점으로 그릴지입니다. 기본값은 반지름에 맞춰 자동으로 정해집니다."
    },
    "en": {
      "preset": "Which corner curve to draw: squircle is the superellipse Apple uses, bevel cuts a straight diagonal, scoop curves inward, notch bites a square out.",
      "cornerRadius": "How far the corner reaches, in px. Leave it unset to keep whatever border-radius the element already has.",
      "superellipse": "The K of CSS superellipse(K): 1 is a circle, 2 a squircle, 0 a straight line, negative values curve inward. Overrides the preset.",
      "borderFollow": "Redraw the element border along the same curve. Browsers with native corner-shape do this themselves and ignore it.",
      "nativeShape": "Set to off to draw the curve here even where the browser could do it. Only useful for comparing the two.",
      "cornerSamples": "How many points the curve is drawn from. Left alone it scales with the radius."
    },
    "ja": {
      "preset": "角の曲線の種類です。squircle はアップルが使う超楕円、bevel は直線で削り、scoop は内側にえぐり、notch は四角く切り取ります。",
      "cornerRadius": "角が占める長さ（px）です。未指定なら要素にすでにある border-radius をそのまま使います。",
      "superellipse": "CSS superellipse(K) の K です。1 で円、2 でスクワークル、0 で直線、マイナスで内側に反ります。プリセットより優先します。",
      "borderFollow": "要素に枠線があるとき、その枠線も同じ曲線で描き直すかどうかです。corner-shape 対応ブラウザでは不要です。",
      "nativeShape": "off にすると対応ブラウザでも自前の曲線を使います。二つを比べるときだけ使ってください。",
      "cornerSamples": "曲線を何点で描くかです。既定では半径に応じて自動で決まります。"
    },
    "zh-CN": {
      "preset": "角的曲线类型：squircle 是苹果所用的超椭圆，bevel 直线切角，scoop 向内凹，notch 方形缺口。",
      "cornerRadius": "角占据的长度（px）。留空则沿用元素本来的 border-radius。",
      "superellipse": "CSS superellipse(K) 的 K 值：1 为圆，2 为超椭圆方圆，0 为直线，负值向内凹。优先于预设。",
      "borderFollow": "元素有边框时，是否用同一条曲线重画边框。原生支持 corner-shape 的浏览器会自行处理。",
      "nativeShape": "设为 off 时，即使浏览器支持也用自绘曲线。仅用于对比两种画法。",
      "cornerSamples": "曲线由多少个点绘制。默认随半径自动决定。"
    },
    "zh-TW": {
      "preset": "角的曲線類型：squircle 是蘋果所用的超橢圓，bevel 直線切角，scoop 向內凹，notch 方形缺口。",
      "cornerRadius": "角佔據的長度（px）。留空則沿用元素原本的 border-radius。",
      "superellipse": "CSS superellipse(K) 的 K 值：1 為圓，2 為超橢圓方圓，0 為直線，負值向內凹。優先於預設。",
      "borderFollow": "元素有邊框時，是否用同一條曲線重畫邊框。原生支援 corner-shape 的瀏覽器會自行處理。",
      "nativeShape": "設為 off 時，即使瀏覽器支援也用自繪曲線。僅用於比較兩種畫法。",
      "cornerSamples": "曲線由多少個點繪製。預設隨半徑自動決定。"
    },
    "ru": {
      "preset": "Какую кривую рисовать в углу: squircle — суперэллипс Apple, bevel срезает по прямой, scoop выгибается внутрь, notch вырезает квадрат.",
      "cornerRadius": "Насколько далеко заходит угол, в px. Оставьте пустым, чтобы сохранить border-radius, который уже есть у элемента.",
      "superellipse": "Параметр K из CSS superellipse(K): 1 — круг, 2 — squircle, 0 — прямая, отрицательные значения гнут внутрь. Важнее пресета.",
      "borderFollow": "Перерисовывать ли рамку элемента по той же кривой. Браузеры с родным corner-shape делают это сами.",
      "nativeShape": "off рисует кривую здесь даже там, где браузер умеет сам. Нужно только для сравнения двух способов.",
      "cornerSamples": "Из скольких точек строится кривая. По умолчанию зависит от радиуса."
    },
    "it": {
      "preset": "Quale curva disegnare nell’angolo: squircle è la superellisse di Apple, bevel taglia in diagonale, scoop rientra, notch morde un quadrato.",
      "cornerRadius": "Quanto si estende l’angolo, in px. Lascialo vuoto per mantenere il border-radius che l’elemento ha già.",
      "superellipse": "La K di CSS superellipse(K): 1 è un cerchio, 2 una squircle, 0 una retta, i negativi curvano verso l’interno. Ha la precedenza sul preset.",
      "borderFollow": "Ridisegna il bordo dell’elemento lungo la stessa curva. I browser con corner-shape nativo se ne occupano da soli.",
      "nativeShape": "Con off la curva viene disegnata qui anche dove il browser saprebbe farlo. Serve solo per confrontare i due modi.",
      "cornerSamples": "Da quanti punti viene disegnata la curva. Lasciato stare, scala con il raggio."
    }
  };
  for (const [lang, values] of Object.entries(squircle)) {
    sets[lang] = sets[lang] || {};
    sets[lang].squircle = Object.assign({}, sets[lang].squircle, values);
  }
  // Canvas Effect: the shared option vocabulary and the host's own settings.
  const canvasEffect = {
    "ko": {
      "color": "효과의 주 색상입니다. 효과마다 쓰는 자리가 다르지만 이름은 같습니다.",
      "color2": "보조 색상입니다. 포인터 주변이나 두 번째 색 띠처럼 강조되는 곳에 쓰입니다.",
      "background": "캔버스를 지우는 색입니다. transparent면 요소 자신의 배경이 비칩니다.",
      "speed": "움직임의 빠르기입니다. 1이 효과 본래의 속도입니다.",
      "density": "얼마나 촘촘한지입니다. 셀·입자·띠의 개수나 크기 비율처럼 효과마다 의미가 조금 다릅니다.",
      "size": "하나하나의 크기(CSS px)입니다.",
      "strength": "포인터에 얼마나 강하게 반응할지입니다. 0이면 반응하지 않습니다.",
      "distortion": "얼마나 휘거나 일그러질지입니다. 0이면 왜곡이 없습니다.",
      "quality": "기기에 맞춘 품질 단계입니다. auto는 저사양·절약 모드에서 low, 모바일에서 medium을 고릅니다.",
      "maxDpr": "캔버스 픽셀 비율의 상한입니다. 3배 화면을 3배로 그리면 1배의 9배 픽셀을 칠해야 합니다.",
      "fps": "초당 프레임 상한입니다. 0이면 화면 주사율을 그대로 따릅니다.",
      "pointer": "포인터를 어디서 받을지입니다. host는 이 요소 위, window는 페이지 전체, none은 받지 않습니다."
    },
    "en": {
      "color": "The effect's main colour. Each effect uses it in its own place, under the same name.",
      "color2": "The secondary colour, for what is highlighted — around the pointer, a second band of colour.",
      "background": "What the canvas is cleared to. transparent lets the element's own background show through.",
      "speed": "How fast it moves. 1 is the effect's natural pace.",
      "density": "How dense it is — cells, particles or bands, or their share of the space, depending on the effect.",
      "size": "How big each thing is, in CSS px.",
      "strength": "How strongly it reacts to the pointer. 0 turns the reaction off.",
      "distortion": "How far it bends or warps. 0 means none.",
      "quality": "A quality tier for the device. auto picks low on weak devices or data saver and medium on mobile.",
      "maxDpr": "The highest pixel ratio the canvas draws at. A 3× screen drawn at 3× paints nine times the pixels of 1×.",
      "fps": "The frame-rate cap. 0 follows the display's own rate.",
      "pointer": "Where the pointer is read from: host is this element, window the whole page, none turns it off."
    },
    "ja": {
      "color": "効果のメインカラーです。使う場所は効果ごとに違いますが、名前は共通です。",
      "color2": "サブカラーです。ポインターの周りや二本目の色帯など、強調する部分に使います。",
      "background": "キャンバスを消去する色です。transparent なら要素自身の背景が見えます。",
      "speed": "動きの速さです。1 が効果本来の速度です。",
      "density": "どれだけ密か、です。セル・粒子・帯の数や占める割合など、効果によって意味が少し違います。",
      "size": "一つひとつの大きさ（CSS px）です。",
      "strength": "ポインターにどれだけ強く反応するかです。0 で反応しません。",
      "distortion": "どれだけ曲がったり歪んだりするかです。0 で歪みなし。",
      "quality": "端末に合わせた品質段階です。auto は低性能・データセーバーで low、モバイルで medium を選びます。",
      "maxDpr": "キャンバスのピクセル比の上限です。3 倍の画面を 3 倍で描くと、1 倍の 9 倍のピクセルを塗ります。",
      "fps": "フレームレートの上限です。0 なら画面のリフレッシュレートに従います。",
      "pointer": "ポインターをどこから読むかです。host はこの要素、window はページ全体、none は読みません。"
    },
    "zh-CN": {
      "color": "效果的主色。各效果用在不同的位置，但名称统一。",
      "color2": "辅助色，用于被强调的部分，例如指针周围或第二条色带。",
      "background": "清空画布时使用的颜色。transparent 会透出元素自身的背景。",
      "speed": "运动的快慢。1 为效果本来的速度。",
      "density": "密集程度——格子、粒子、色带的数量或所占比例，含义随效果略有不同。",
      "size": "每个单元的大小（CSS px）。",
      "strength": "对指针反应的强度。0 表示不反应。",
      "distortion": "弯曲或扭曲的程度。0 表示没有扭曲。",
      "quality": "按设备选择的画质档位。auto 在低性能或省流量模式下选 low，在移动端选 medium。",
      "maxDpr": "画布像素比的上限。3 倍屏按 3 倍绘制，要填充的像素是 1 倍的 9 倍。",
      "fps": "帧率上限。0 表示跟随屏幕刷新率。",
      "pointer": "从哪里读取指针：host 为此元素，window 为整个页面，none 为不读取。"
    },
    "zh-TW": {
      "color": "效果的主色。各效果用在不同的位置，但名稱統一。",
      "color2": "輔助色，用於被強調的部分，例如指標周圍或第二條色帶。",
      "background": "清空畫布時使用的顏色。transparent 會透出元素本身的背景。",
      "speed": "運動的快慢。1 為效果本來的速度。",
      "density": "密集程度——格子、粒子、色帶的數量或所佔比例，含義隨效果略有不同。",
      "size": "每個單元的大小（CSS px）。",
      "strength": "對指標反應的強度。0 表示不反應。",
      "distortion": "彎曲或扭曲的程度。0 表示沒有扭曲。",
      "quality": "依裝置選擇的畫質等級。auto 在低效能或省流量模式下選 low，在行動裝置選 medium。",
      "maxDpr": "畫布像素比的上限。3 倍螢幕以 3 倍繪製，要填滿的像素是 1 倍的 9 倍。",
      "fps": "影格率上限。0 表示跟隨螢幕更新率。",
      "pointer": "從哪裡讀取指標：host 為此元素，window 為整個頁面，none 為不讀取。"
    },
    "ru": {
      "color": "Основной цвет эффекта. Каждый эффект применяет его по-своему, но имя одно и то же.",
      "color2": "Дополнительный цвет — для выделенного: вокруг указателя, второй цветовой полосы.",
      "background": "Цвет, которым очищается холст. transparent пропускает собственный фон элемента.",
      "speed": "Скорость движения. 1 — естественный темп эффекта.",
      "density": "Насколько плотно: число ячеек, частиц или полос либо их доля — зависит от эффекта.",
      "size": "Размер каждого элемента, в CSS px.",
      "strength": "Насколько сильно эффект откликается на указатель. 0 отключает отклик.",
      "distortion": "Насколько сильно изгибается или искажается. 0 — без искажений.",
      "quality": "Уровень качества под устройство. auto выбирает low на слабых устройствах и в режиме экономии, medium на мобильных.",
      "maxDpr": "Верхняя граница плотности пикселей холста. Экран 3× при отрисовке в 3× закрашивает в девять раз больше пикселей, чем 1×.",
      "fps": "Ограничение частоты кадров. 0 — частота самого экрана.",
      "pointer": "Откуда брать указатель: host — этот элемент, window — вся страница, none — не брать."
    },
    "it": {
      "color": "Il colore principale dell’effetto. Ogni effetto lo usa a modo suo, con lo stesso nome.",
      "color2": "Il colore secondario, per ciò che è in evidenza: intorno al puntatore, una seconda fascia di colore.",
      "background": "Il colore con cui si pulisce il canvas. transparent lascia vedere lo sfondo dell’elemento.",
      "speed": "Quanto si muove in fretta. 1 è il ritmo naturale dell’effetto.",
      "density": "Quanto è fitto: celle, particelle o fasce, o la loro parte di spazio, secondo l’effetto.",
      "size": "Quanto è grande ogni elemento, in px CSS.",
      "strength": "Quanto reagisce al puntatore. 0 spegne la reazione.",
      "distortion": "Quanto si piega o si deforma. 0 significa nessuna deformazione.",
      "quality": "Un livello di qualità per il dispositivo. auto sceglie low sui dispositivi deboli o con risparmio dati e medium sul mobile.",
      "maxDpr": "La densità di pixel massima del canvas. Uno schermo 3× disegnato a 3× colora nove volte i pixel di 1×.",
      "fps": "Il limite di frame al secondo. 0 segue la frequenza dello schermo.",
      "pointer": "Da dove leggere il puntatore: host è questo elemento, window tutta la pagina, none lo spegne."
    }
  };
  for (const [lang, values] of Object.entries(canvasEffect)) {
    sets[lang] = sets[lang] || {};
    sets[lang].canvasEffect = Object.assign({}, sets[lang].canvasEffect, values);
  }
  const cardGlass = {
    "ko": {
      "glassBlur": "뒤에 있는 것을 얼마나 흐리게 볼지입니다(px). 0이면 유리가 투명해져 색만 얹힙니다.",
      "glassSaturate": "뒤에 비치는 색의 채도입니다. 1보다 크면 색이 진해져 유리를 통과한 느낌이 납니다.",
      "glassDepth": "테두리에서 안쪽으로 몇 px까지 빛이 휘는지 — 유리의 두께입니다. 깊을수록 가장자리가 많이 굴절됩니다.",
      "glassRefraction": "가장자리에서 배경이 실제로 휘게 할지입니다. SVG 필터를 backdrop-filter로 쓸 수 있는 브라우저(현재 크로미엄)에서만 동작하고, 나머지는 자동으로 빠집니다.",
      "glassTint": "유리 자체의 색입니다. 반투명한 값이어야 뒤가 비칩니다.",
      "glassRim": "빛을 받는 테두리 선의 굵기(px)입니다.",
      "glassRimOpacity": "테두리 선이 얼마나 밝은지입니다. 0이면 테두리 없이 흐림만 남습니다.",
      "glassSheen": "유리 안쪽 윗면에 도는 은은한 반사의 세기입니다."
    },
    "en": {
      "glassBlur": "How far the backdrop is blurred, in px. At 0 the pane is clear and only the tint remains.",
      "glassSaturate": "How much the colour behind is pushed. Above 1 it deepens, which is what reads as looking through glass.",
      "glassDepth": "How far in from the rim the light bends — the thickness of the glass. Deeper bends more of the edge.",
      "glassRefraction": "Whether the backdrop actually bends at the rim. Needs an SVG filter used as a backdrop-filter (Chromium today); elsewhere it is dropped automatically.",
      "glassTint": "The colour of the glass itself. Keep it translucent or nothing shows through.",
      "glassRim": "Width of the lit edge line, in px.",
      "glassRimOpacity": "How bright the lit edge is. At 0 the pane keeps the blur and loses its rim.",
      "glassSheen": "Strength of the soft reflection inside the top of the pane."
    },
    "ja": {
      "glassBlur": "背景をどれだけぼかすか（px）。0 なら透明になり色味だけが残ります。",
      "glassSaturate": "透けて見える色の彩度です。1 より大きいと色が濃くなり、ガラス越しらしくなります。",
      "glassDepth": "縁から内側へ何 px まで光が曲がるか — ガラスの厚みです。深いほど縁が大きく屈折します。",
      "glassRefraction": "縁で背景を実際に曲げるかどうか。SVG フィルターを backdrop-filter に使えるブラウザ（現状は Chromium）だけで動き、他では自動的に外れます。",
      "glassTint": "ガラス自体の色です。半透明にしないと背景が見えません。",
      "glassRim": "光を受ける縁の線の太さ（px）です。",
      "glassRimOpacity": "縁の線の明るさです。0 ならぼかしだけが残ります。",
      "glassSheen": "ガラス内側の上面に乗る、やわらかな反射の強さです。"
    },
    "zh-CN": {
      "glassBlur": "背后内容的模糊程度（px）。为 0 时玻璃变透明，只留下色调。",
      "glassSaturate": "透出的颜色的饱和度。大于 1 时颜色更浓，像是隔着玻璃看。",
      "glassDepth": "光线从边缘向内弯折的距离 —— 玻璃的厚度。越深，边缘折射越明显。",
      "glassRefraction": "是否让背景在边缘真正弯折。需要浏览器支持把 SVG 滤镜用作 backdrop-filter（目前只有 Chromium），其他浏览器会自动省略。",
      "glassTint": "玻璃本身的颜色。要保持半透明，否则背后看不见。",
      "glassRim": "受光边缘线的宽度（px）。",
      "glassRimOpacity": "受光边缘的亮度。为 0 时只剩模糊，没有边缘线。",
      "glassSheen": "玻璃内侧上方那层柔和反射的强度。"
    },
    "zh-TW": {
      "glassBlur": "背後內容的模糊程度（px）。為 0 時玻璃變透明，只留下色調。",
      "glassSaturate": "透出的顏色的飽和度。大於 1 時顏色更濃，像是隔著玻璃看。",
      "glassDepth": "光線從邊緣向內彎折的距離 —— 玻璃的厚度。越深，邊緣折射越明顯。",
      "glassRefraction": "是否讓背景在邊緣真正彎折。需要瀏覽器支援把 SVG 濾鏡用作 backdrop-filter（目前只有 Chromium），其他瀏覽器會自動省略。",
      "glassTint": "玻璃本身的顏色。要保持半透明，否則背後看不見。",
      "glassRim": "受光邊緣線的寬度（px）。",
      "glassRimOpacity": "受光邊緣的亮度。為 0 時只剩模糊，沒有邊緣線。",
      "glassSheen": "玻璃內側上方那層柔和反射的強度。"
    },
    "ru": {
      "glassBlur": "Насколько размыт фон, в px. При 0 панель прозрачная и остаётся только оттенок.",
      "glassSaturate": "Насколько усилен цвет за панелью. Больше 1 — цвет глубже, и это читается как взгляд сквозь стекло.",
      "glassDepth": "Как далеко от кромки внутрь гнётся свет — толщина стекла. Глубже — сильнее преломление по краю.",
      "glassRefraction": "Гнуть ли фон у кромки по-настоящему. Нужен SVG-фильтр в backdrop-filter (сегодня только Chromium); в остальных он отбрасывается сам.",
      "glassTint": "Цвет самого стекла. Держите его полупрозрачным, иначе фон не просвечивает.",
      "glassRim": "Толщина освещённой кромки, в px.",
      "glassRimOpacity": "Насколько ярка освещённая кромка. При 0 остаётся размытие без кромки.",
      "glassSheen": "Сила мягкого отражения внутри верхней части панели."
    },
    "it": {
      "glassBlur": "Quanto è sfocato ciò che sta dietro, in px. A 0 il pannello è limpido e resta solo la tinta.",
      "glassSaturate": "Quanto viene spinto il colore dietro. Sopra 1 si intensifica, ed è ciò che fa sembrare di guardare attraverso il vetro.",
      "glassDepth": "Quanto la luce si piega dal bordo verso l’interno — lo spessore del vetro. Più è profondo, più il bordo rifrange.",
      "glassRefraction": "Se il fondo debba davvero piegarsi sul bordo. Richiede un filtro SVG usato come backdrop-filter (oggi solo Chromium); altrove viene tolto da solo.",
      "glassTint": "Il colore del vetro stesso. Tienilo traslucido o non traspare nulla.",
      "glassRim": "Spessore della linea di bordo illuminata, in px.",
      "glassRimOpacity": "Quanto è luminoso il bordo. A 0 resta la sfocatura senza bordo.",
      "glassSheen": "Intensità del riflesso morbido nella parte alta del pannello."
    }
  };
  for (const [lang, values] of Object.entries(cardGlass)) {
    sets[lang] = sets[lang] || {};
    sets[lang].cardGlow = Object.assign({}, sets[lang].cardGlow, values);
  }
  const flipFold = {
    "ko": {
      "foldBlur": "바뀌는 도중 얼마나 흐려질지(px)입니다. 흐림이 없으면 두 배치가 그냥 교차되는 것으로 보이고, 흐림이 있으면 하나의 화면이 다시 짜이는 것처럼 보입니다."
    },
    "en": {
      "foldBlur": "How soft the middle of the change gets, in px. Without it the two layouts read as two pictures swapping; with it they read as one surface being re-formed."
    },
    "ja": {
      "foldBlur": "切り替わる途中でどれだけぼかすか（px）。ぼかしがないと二つの配置が入れ替わって見え、あると一つの画面が組み直されて見えます。"
    },
    "zh-CN": {
      "foldBlur": "变化过程中的模糊程度（px）。没有模糊时像两张图在互换；有模糊时像同一块界面在重新排布。"
    },
    "zh-TW": {
      "foldBlur": "變化過程中的模糊程度（px）。沒有模糊時像兩張圖在互換；有模糊時像同一塊介面在重新排布。"
    },
    "ru": {
      "foldBlur": "Насколько размягчается середина перехода, в px. Без этого две раскладки читаются как подмена картинок; с этим — как одна поверхность, собирающаяся заново."
    },
    "it": {
      "foldBlur": "Quanto si ammorbidisce il centro del cambio, in px. Senza, i due layout sembrano due immagini che si scambiano; con, sembrano una sola superficie che si ricompone."
    }
  };
  for (const [lang, values] of Object.entries(flipFold)) {
    sets[lang] = sets[lang] || {};
    sets[lang].flip = Object.assign({}, sets[lang].flip, values);
  }
  const magneticDock = {
    "ko": {
      "preset": "pointer 는 요소 하나가 커서 쪽으로 끌려옵니다. dock 은 이 요소의 자식들을 아이템으로 보고, 커서에 가까운 것이 커지면서 나머지가 밀려납니다.",
      "ease": "현재 값에서 목표 값으로 얼마나 빨리 따라갈지입니다. 작을수록 늘어지고, 1이면 즉시 붙습니다.",
      "axis": "독이 가로로 놓였는지 세로로 놓였는지입니다. 커서의 어느 좌표를 볼지가 이걸로 정해집니다.",
      "maxScale": "커서 바로 아래 아이템이 몇 배까지 커질지입니다.",
      "range": "커서에서 몇 px 떨어진 아이템까지 반응할지입니다. 넓을수록 부드럽게 여러 개가 함께 커집니다.",
      "lift": "커진 아이템이 얼마나 떠오를지(px)입니다. 0이면 크기만 변합니다."
    },
    "en": {
      "preset": "`pointer` pulls one element towards the cursor. `dock` treats this element's children as items: the one nearest the cursor grows and the rest slide aside.",
      "ease": "How fast each value chases its target. Lower is more languid; 1 snaps straight to it.",
      "axis": "Whether the dock is laid out across or down — it decides which pointer coordinate is measured.",
      "maxScale": "How large the item directly under the cursor gets.",
      "range": "How far from the cursor an item still reacts, in px. Wider makes more of them swell together, which reads softer.",
      "lift": "How far a grown item rises, in px. At 0 only its size changes."
    },
    "ja": {
      "preset": "pointer は要素ひとつがカーソルに引き寄せられます。dock はこの要素の子をアイテムとして扱い、カーソルに近いものが大きくなり残りが押しのけられます。",
      "ease": "現在値が目標値をどれだけ速く追うかです。小さいほどゆったりし、1 で即座に着きます。",
      "axis": "ドックが横並びか縦並びかです。カーソルのどの座標を見るかが決まります。",
      "maxScale": "カーソル直下のアイテムが何倍まで大きくなるかです。",
      "range": "カーソルから何 px 離れたアイテムまで反応するかです。広いほど複数が一緒に膨らみ、やわらかく見えます。",
      "lift": "大きくなったアイテムがどれだけ浮き上がるか（px）です。0 なら大きさだけ変わります。"
    },
    "zh-CN": {
      "preset": "pointer 让单个元素被光标吸引。dock 把该元素的子元素当作图标：离光标最近的放大，其余让位。",
      "ease": "当前值追赶目标值的快慢。越小越舒缓，为 1 时立即到位。",
      "axis": "停靠栏是横向还是纵向，决定读取光标的哪个坐标。",
      "maxScale": "光标正下方的图标最多放大到几倍。",
      "range": "距光标多少 px 之内的图标仍会响应。范围越大，一起变大的越多，看起来越柔和。",
      "lift": "放大的图标抬起多少 px。为 0 时只改变大小。"
    },
    "zh-TW": {
      "preset": "pointer 讓單個元素被游標吸引。dock 把該元素的子元素當作圖示：離游標最近的放大，其餘讓位。",
      "ease": "目前值追趕目標值的快慢。越小越舒緩，為 1 時立即到位。",
      "axis": "停靠列是橫向還是縱向，決定讀取游標的哪個座標。",
      "maxScale": "游標正下方的圖示最多放大到幾倍。",
      "range": "距游標多少 px 之內的圖示仍會反應。範圍越大，一起變大的越多，看起來越柔和。",
      "lift": "放大的圖示抬起多少 px。為 0 時只改變大小。"
    },
    "ru": {
      "preset": "pointer тянет один элемент к курсору. dock считает детей этого элемента иконками: ближайшая к курсору растёт, остальные расступаются.",
      "ease": "Насколько быстро значение догоняет цель. Меньше — тягучее; 1 — мгновенно.",
      "axis": "Док расположен поперёк или вниз — от этого зависит, какая координата курсора измеряется.",
      "maxScale": "До какого размера вырастает иконка прямо под курсором.",
      "range": "На каком расстоянии от курсора иконка ещё реагирует, в px. Шире — вместе растут несколько, и это мягче.",
      "lift": "На сколько px поднимается выросшая иконка. При 0 меняется только размер."
    },
    "it": {
      "preset": "`pointer` attira un elemento verso il cursore. `dock` tratta i figli di questo elemento come icone: quella più vicina cresce e le altre si spostano.",
      "ease": "Quanto in fretta un valore raggiunge il suo obiettivo. Più basso è più morbido; 1 ci arriva subito.",
      "axis": "Se il dock è disposto in orizzontale o in verticale — decide quale coordinata del puntatore viene letta.",
      "maxScale": "Quanto diventa grande l'icona proprio sotto il cursore.",
      "range": "A che distanza dal cursore un'icona reagisce ancora, in px. Più ampio fa gonfiare più icone insieme, e si legge più morbido.",
      "lift": "Di quanti px si alza un'icona cresciuta. A 0 cambia solo la dimensione."
    }
  };
  for (const [lang, values] of Object.entries(magneticDock)) {
    sets[lang] = sets[lang] || {};
    sets[lang].magnetic = Object.assign({}, sets[lang].magnetic, values);
  }
  const holdTap = {
    "ko": {
      "mode": "확인을 어떻게 받을지입니다. hold 는 길게 누르는 동안 게이지가 차고, mash 는 연타로 채우며, tap 은 게이지 없이 버튼이 제자리에서 한 번 더 묻습니다."
    },
    "en": {
      "mode": "How the confirmation is asked for. `hold` fills a gauge while pressed, `mash` fills it by repeated taps, and `tap` drops the gauge entirely: the button asks again in its own place."
    },
    "ja": {
      "mode": "確認の取り方です。hold は長押し中にゲージが溜まり、mash は連打で溜め、tap はゲージなしでボタンがその場で聞き直します。"
    },
    "zh-CN": {
      "mode": "如何取得确认。hold 在长按时填充进度条，mash 靠连击填满，tap 则不用进度条——按钮就地再问一次。"
    },
    "zh-TW": {
      "mode": "如何取得確認。hold 在長按時填充進度條，mash 靠連擊填滿，tap 則不用進度條——按鈕就地再問一次。"
    },
    "ru": {
      "mode": "Как запрашивается подтверждение. hold заполняет шкалу удержанием, mash — частыми нажатиями, tap обходится без шкалы: кнопка переспрашивает на своём месте."
    },
    "it": {
      "mode": "Come viene chiesta la conferma. `hold` riempie una barra mentre premi, `mash` la riempie a colpi ripetuti, `tap` fa a meno della barra: il pulsante richiede conferma lì dov'è."
    }
  };
  for (const [lang, values] of Object.entries(holdTap)) {
    sets[lang] = sets[lang] || {};
    sets[lang].hold = Object.assign({}, sets[lang].hold, values);
  }
  const gesturePull = {
    "ko": {
      "preset": "spring 은 hover·press 에 반응해 요소가 살짝 커지고 눌립니다. pull 은 스크롤 영역을 맨 위에서 아래로 당겨 새로고침을 요청하는 제스처입니다.",
      "threshold": "여기까지 당기면 새로고침이 걸립니다(px). 짧으면 실수로, 길면 손이 아픕니다.",
      "max": "아무리 당겨도 여기까지만 늘어납니다(px). 손끝에 \"끝\"이 느껴지게 하는 값입니다.",
      "resistance": "손가락을 따라오는 비율입니다. 낮을수록 뻑뻑하고, 1이면 손가락을 그대로 따라옵니다."
    },
    "en": {
      "preset": "`spring` grows and presses the element on hover and tap. `pull` is the pull-to-refresh gesture: drag a scroll container down from its top to ask the page to refresh.",
      "threshold": "How far you have to pull before letting go refreshes, in px. Short is easy to trigger by accident; long is tiring.",
      "max": "How far the content can stretch however hard you pull, in px. This is what gives the gesture an end you can feel.",
      "resistance": "How closely the content follows your finger. Lower is stiffer; 1 follows exactly."
    },
    "ja": {
      "preset": "spring はホバーとタップで要素が少し大きくなり沈みます。pull はスクロール領域を上端から下に引いて更新を求めるジェスチャーです。",
      "threshold": "ここまで引いて離すと更新されます（px）。短いと誤作動し、長いと手が疲れます。",
      "max": "どれだけ引いてもここまでしか伸びません（px）。指先に「終わり」を感じさせる値です。",
      "resistance": "指にどれだけ忠実についてくるかです。低いほど重く、1 ならそのまま追従します。"
    },
    "zh-CN": {
      "preset": "spring 在悬停和按下时让元素略微放大、下沉。pull 是下拉刷新手势：从滚动区域顶部往下拉来请求刷新。",
      "threshold": "要下拉多远松手才会刷新（px）。太短容易误触，太长则费力。",
      "max": "无论怎么拉最多只能拉到这里（px）。这是让手指感觉到“到头了”的值。",
      "resistance": "内容跟手的程度。越低越沉，为 1 时完全跟手。"
    },
    "zh-TW": {
      "preset": "spring 在懸停和按下時讓元素略微放大、下沉。pull 是下拉重新整理手勢：從捲動區域頂端往下拉來請求更新。",
      "threshold": "要下拉多遠鬆手才會更新（px）。太短容易誤觸，太長則費力。",
      "max": "無論怎麼拉最多只能拉到這裡（px）。這是讓手指感覺到「到頭了」的值。",
      "resistance": "內容跟手的程度。越低越沉，為 1 時完全跟手。"
    },
    "ru": {
      "preset": "spring увеличивает и вдавливает элемент при наведении и нажатии. pull — жест «потяни, чтобы обновить»: тянете область прокрутки вниз от самого верха.",
      "threshold": "Насколько далеко нужно потянуть, чтобы отпускание обновило, в px. Мало — легко задеть; много — утомительно.",
      "max": "Насколько далеко содержимое растянется, как ни тяни, в px. Именно это даёт жесту ощутимый конец.",
      "resistance": "Насколько точно содержимое следует за пальцем. Ниже — туже; 1 — след в след."
    },
    "it": {
      "preset": "`spring` ingrandisce e schiaccia l'elemento su hover e tap. `pull` è il gesto pull-to-refresh: trascini un contenitore scorrevole verso il basso dalla cima per chiedere un aggiornamento.",
      "threshold": "Quanto devi tirare perché il rilascio aggiorni, in px. Poco si attiva per sbaglio; molto stanca.",
      "max": "Fin dove il contenuto si allunga per quanto tiri, in px. È ciò che dà al gesto una fine che si sente.",
      "resistance": "Quanto il contenuto segue il dito. Più basso è più duro; 1 lo segue esattamente."
    }
  };
  for (const [lang, values] of Object.entries(gesturePull)) {
    sets[lang] = sets[lang] || {};
    sets[lang].gesture = Object.assign({}, sets[lang].gesture, values);
  }
  const megaMenuLayouts = {
    "ko": {
      "layout": "메뉴가 어떤 모양으로 열리는지입니다. dropdown 은 항목 바로 아래 패널, mega 는 바 전체 폭을 쓰는 패널, radial 은 트리거 둘레로 펼쳐지는 부채꼴입니다.",
      "trigger": "패널을 무엇으로 여는지입니다. hover 는 마우스를 올리면 열리고, click 은 눌러야 열립니다. 터치 기기는 어느 쪽이든 탭으로 엽니다.",
      "openDelay": "마우스를 올린 뒤 열릴 때까지 기다리는 시간(ms)입니다. 지나가는 커서에 메뉴가 튀어나오지 않게 해 줍니다.",
      "closeDelay": "커서가 벗어난 뒤 닫힐 때까지 기다리는 시간(ms)입니다. 트리거에서 패널로 비스듬히 이동할 틈을 줍니다.",
      "duration": "패널이 열리고 닫히는 데 걸리는 시간(초)입니다. radial 에서는 항목 하나가 제자리까지 날아가는 시간입니다.",
      "indicator": "트리거 옆에 붙는 여닫기 표시입니다. chevron 은 화살표가 돌아가고, plus 는 + 가 × 로 바뀌며, none 은 아무것도 붙이지 않습니다.",
      "radius": "트리거 중심에서 항목까지의 거리(px)입니다. 부채꼴의 크기를 정합니다.",
      "startAngle": "첫 항목이 놓이는 각도입니다. 0 이 12시 방향이고 시계 방향으로 커집니다 — -90 이면 9시에서 시작합니다.",
      "sweep": "항목이 퍼지는 전체 각도입니다. 180 이면 반원, 360 이면 완전한 원이 되고, 음수면 반시계 방향으로 돕니다.",
      "stagger": "항목 사이의 출발 시차(ms)입니다. 0 이면 전부 동시에 움직이고, 키울수록 하나씩 차례로 펼쳐집니다."
    },
    "en": {
      "layout": "What shape the menu opens into. `dropdown` is a panel right under the item, `mega` is a panel the full width of the bar, and `radial` fans the items out around the trigger.",
      "trigger": "What opens a panel. `hover` opens on the pointer arriving, `click` waits for a press. A touch device taps either way.",
      "openDelay": "How long to wait after the pointer arrives before opening, in ms. It keeps a menu from leaping out at a cursor that was only passing through.",
      "closeDelay": "How long to wait after the pointer leaves before closing, in ms. It leaves room to cut diagonally from the trigger to its panel.",
      "duration": "How long the panel takes to open and close, in seconds. On `radial` it is how long one item takes to fly to its place.",
      "indicator": "The open/close mark beside the trigger. `chevron` rotates an arrow, `plus` turns a + into a ×, and `none` adds nothing at all.",
      "radius": "How far each item sits from the centre of the trigger, in px. This is the size of the ring.",
      "startAngle": "Where the first item goes. 0 is straight up and the angle grows clockwise, so -90 starts at nine o'clock.",
      "sweep": "The whole arc the items spread over. 180 is a half circle, 360 is a full one, and a negative value fans them anticlockwise.",
      "stagger": "The head start between one item and the next, in ms. 0 moves them all together; raise it and they open one after another."
    },
    "ja": {
      "layout": "メニューがどんな形で開くかです。dropdown は項目のすぐ下のパネル、mega はバー全幅のパネル、radial はトリガーの周りに扇状に広がります。",
      "trigger": "パネルを何で開くかです。hover はマウスを乗せると開き、click は押して開きます。タッチ端末はどちらでもタップで開きます。",
      "openDelay": "マウスが乗ってから開くまで待つ時間（ms）です。通り過ぎるだけのカーソルにメニューが飛び出さないようにします。",
      "closeDelay": "カーソルが離れてから閉じるまで待つ時間（ms）です。トリガーからパネルへ斜めに移動する余裕を与えます。",
      "duration": "パネルが開閉するのにかかる時間（秒）です。radial では項目ひとつが定位置まで飛ぶ時間になります。",
      "indicator": "トリガーの横に付く開閉マークです。chevron は矢印が回り、plus は + が × に変わり、none は何も付けません。",
      "radius": "トリガーの中心から項目までの距離（px）です。扇の大きさを決めます。",
      "startAngle": "最初の項目を置く角度です。0 が真上で、時計回りに大きくなります（-90 なら9時の方向から）。",
      "sweep": "項目が広がる全体の角度です。180 なら半円、360 なら完全な円、マイナスなら反時計回りに広がります。",
      "stagger": "項目どうしの出発のずれ（ms）です。0 なら全部同時に動き、大きくするほど順に開きます。"
    },
    "zh-CN": {
      "layout": "菜单以什么形态展开。dropdown 是项目正下方的面板，mega 是占满整条栏宽的面板，radial 则让项目绕着触发按钮呈扇形散开。",
      "trigger": "用什么打开面板。hover 是指针移上去就开，click 要按一下。触摸设备两种都靠点按。",
      "openDelay": "指针移入后等多久才打开，单位毫秒。避免只是路过的光标把菜单勾出来。",
      "closeDelay": "指针离开后等多久才关闭，单位毫秒。留出从触发器斜着移到面板的余地。",
      "duration": "面板开合所需的时间，单位秒。在 radial 下是单个项目飞到位所需的时间。",
      "indicator": "触发器旁边的开合标记。chevron 让箭头旋转，plus 把 + 变成 ×，none 什么都不加。",
      "radius": "每个项目离触发器中心的距离，单位像素，也就是这个圆环的大小。",
      "startAngle": "第一个项目所在的角度。0 是正上方，顺时针递增，-90 就是从九点方向开始。",
      "sweep": "项目铺开的整段弧度。180 是半圆，360 是整圆，负值则逆时针展开。",
      "stagger": "相邻项目之间的出发时差，单位毫秒。0 表示一起动，调大就会一个接一个地展开。"
    },
    "zh-TW": {
      "layout": "選單以什麼形態展開。dropdown 是項目正下方的面板，mega 是佔滿整條列寬的面板，radial 則讓項目繞著觸發按鈕呈扇形散開。",
      "trigger": "用什麼打開面板。hover 是指標移上去就開，click 要按一下。觸控裝置兩種都靠點按。",
      "openDelay": "指標移入後等多久才打開，單位毫秒。避免只是路過的游標把選單勾出來。",
      "closeDelay": "指標離開後等多久才關閉，單位毫秒。留出從觸發器斜著移到面板的餘地。",
      "duration": "面板開合所需的時間，單位秒。在 radial 下是單個項目飛到定位所需的時間。",
      "indicator": "觸發器旁邊的開合標記。chevron 讓箭頭旋轉，plus 把 + 變成 ×，none 什麼都不加。",
      "radius": "每個項目離觸發器中心的距離，單位像素，也就是這個圓環的大小。",
      "startAngle": "第一個項目所在的角度。0 是正上方，順時針遞增，-90 就是從九點方向開始。",
      "sweep": "項目鋪開的整段弧度。180 是半圓，360 是整圓，負值則逆時針展開。",
      "stagger": "相鄰項目之間的出發時差，單位毫秒。0 表示一起動，調大就會一個接一個地展開。"
    },
    "ru": {
      "layout": "В какой форме открывается меню. dropdown — панель прямо под пунктом, mega — панель во всю ширину полосы, radial — веер пунктов вокруг триггера.",
      "trigger": "Чем открывается панель. hover — по наведению, click — по нажатию. На сенсорном экране в обоих случаях это касание.",
      "openDelay": "Сколько ждать после наведения перед открытием, в мс. Не даёт меню выскакивать под курсор, который просто проходил мимо.",
      "closeDelay": "Сколько ждать после ухода курсора перед закрытием, в мс. Оставляет запас, чтобы пройти от триггера к панели по диагонали.",
      "duration": "Сколько панель открывается и закрывается, в секундах. В radial это время полёта одного пункта на своё место.",
      "indicator": "Значок открытия рядом с триггером. chevron поворачивает стрелку, plus превращает + в ×, none не добавляет ничего.",
      "radius": "На каком расстоянии от центра триггера стоят пункты, в px. Это размер кольца.",
      "startAngle": "Где встанет первый пункт. 0 — строго вверх, угол растёт по часовой стрелке: -90 начинает с девяти часов.",
      "sweep": "Вся дуга, по которой расходятся пункты. 180 — полукруг, 360 — полный круг, отрицательное значение разворачивает их против часовой.",
      "stagger": "Задержка между соседними пунктами, в мс. 0 — все трогаются разом; больше — раскрываются по очереди."
    },
    "it": {
      "layout": "In che forma si apre il menu. `dropdown` è un pannello subito sotto la voce, `mega` un pannello largo quanto la barra, `radial` apre le voci a ventaglio attorno al pulsante.",
      "trigger": "Cosa apre un pannello. `hover` apre al passaggio del puntatore, `click` aspetta una pressione. Su touch si tocca in entrambi i casi.",
      "openDelay": "Quanto attendere dopo il passaggio del puntatore prima di aprire, in ms. Evita che il menu salti fuori per un cursore che passava e basta.",
      "closeDelay": "Quanto attendere dopo l'uscita del puntatore prima di chiudere, in ms. Lascia spazio per tagliare in diagonale dal pulsante al pannello.",
      "duration": "Quanto impiega il pannello ad aprirsi e chiudersi, in secondi. In `radial` è il tempo di volo di una singola voce.",
      "indicator": "Il segno di apertura accanto al pulsante. `chevron` ruota una freccia, `plus` trasforma un + in ×, `none` non aggiunge nulla.",
      "radius": "Quanto distano le voci dal centro del pulsante, in px. È la dimensione dell'anello.",
      "startAngle": "Dove va la prima voce. 0 è dritto in alto e l'angolo cresce in senso orario: -90 parte dalle nove.",
      "sweep": "L'arco complessivo su cui si distribuiscono le voci. 180 è mezzo cerchio, 360 uno intero, un valore negativo le apre in senso antiorario.",
      "stagger": "Lo scarto di partenza fra una voce e la successiva, in ms. 0 le muove insieme; alzandolo si aprono una dopo l'altra."
    }
  };
  for (const [lang, values] of Object.entries(megaMenuLayouts)) {
    sets[lang] = sets[lang] || {};
    sets[lang].megaMenu = Object.assign({}, sets[lang].megaMenu, values);
  }
  const revealOnce = {
    ko: '켜면 등장 모션을 한 번만 실행합니다. 끄면 이탈 시 역재생하고 재진입 시 다시 재생합니다. Native와 GSAP 모두 지원합니다.',
    en: 'Play the entrance once. Turn off to reverse on exit and play again on re-entry, with either native animation or GSAP.',
    ja: 'オンなら登場モーションを一度だけ再生します。オフなら退出時に逆再生し、再進入時に再生します。NativeとGSAPの両方に対応します。',
    'zh-CN': '开启时只播放一次入场动画；关闭后离开时倒放，重新进入时再次播放。支持原生动画和 GSAP。',
    'zh-TW': '開啟時只播放一次入場動畫；關閉後離開時倒放，重新進入時再次播放。支援原生動畫和 GSAP。',
    ru: 'Воспроизвести появление один раз. Выключите для обратного воспроизведения при выходе и повтора при возвращении. Работает с native и GSAP.',
    it: 'Riproduce l’entrata una sola volta. Disattiva per invertire all’uscita e ripetere al rientro, con animazioni native o GSAP.'
  };
  for (const [lang, once] of Object.entries(revealOnce)) {
    sets[lang].reveal = Object.assign({}, sets[lang].reveal, { once });
  }
})();
