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
      opacity: '그림자 불투명도입니다.',
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
      opacity: 'Shadow opacity.',
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
      opacity: '影の不透明度です。',
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
      opacity: '阴影不透明度。',
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
      opacity: '陰影不透明度。',
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
      opacity: 'Непрозрачность тени.',
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
      opacity: 'Opacità dell’ombra.',
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
      drag: 'Allow mouse or pen dragging.',
      touch: 'Allow touch swiping.',
      keyboard: 'Use arrow, Home and End keys while the slider is focused.'
    },
    ja: {
      preset: '切り替え効果。fadeは交差、dissolveは粒子とぼかし、wipeは方向マスク、その他は異なる3D構成です。',
      effectDirection: 'wipeが開く方向です。', effectIntensity: 'ディゾルブ・ワイプ・3D効果の移動、回転、ぼかしの強さです。',
      activeShadow: 'Coverflowのアクティブスライドに輪郭沿いの影を表示します。', activeShadowOpacity: '影の不透明度。色・位置・ぼかしはCSS変数でも調整できます。',
      drag: 'マウスまたはペンのドラッグを許可します。', touch: 'タッチスワイプを許可します。', keyboard: 'フォーカス中に矢印・Home・Endキーを使います。'
    },
    'zh-CN': {
      preset: '切换效果：fade 交叉淡入，dissolve 添加颗粒和模糊，wipe 使用方向遮罩，其他模式使用不同的 3D 场景。',
      effectDirection: 'wipe 展开的方向。', effectIntensity: '溶解、擦除和 3D 效果的移动、旋转与模糊强度。',
      activeShadow: '为 Coverflow 当前滑块添加跟随轮廓的阴影。', activeShadowOpacity: '当前阴影透明度；颜色、偏移和模糊也可用 CSS 变量调整。',
      drag: '允许鼠标或手写笔拖动。', touch: '允许触摸滑动。', keyboard: '聚焦时使用方向键、Home 和 End。'
    },
    'zh-TW': {
      preset: '切換效果：fade 交叉淡入，dissolve 加入顆粒與模糊，wipe 使用方向遮罩，其他模式使用不同的 3D 場景。',
      effectDirection: 'wipe 展開的方向。', effectIntensity: '溶解、擦除與 3D 效果的移動、旋轉及模糊強度。',
      activeShadow: '為 Coverflow 目前投影片加入跟隨輪廓的陰影。', activeShadowOpacity: '目前陰影透明度；顏色、位移與模糊也可用 CSS 變數調整。',
      drag: '允許滑鼠或手寫筆拖曳。', touch: '允許觸控滑動。', keyboard: '聚焦時使用方向鍵、Home 與 End。'
    },
    ru: {
      preset: 'Эффект перехода: fade — кроссфейд, dissolve — зерно и размытие, wipe — направленная маска, остальные режимы используют разные 3D-сцены.',
      effectDirection: 'Направление раскрытия wipe.', effectIntensity: 'Сила движения, вращения и размытия эффектов.',
      activeShadow: 'Добавить тень по силуэту активного слайда Coverflow.', activeShadowOpacity: 'Прозрачность тени; цвет, смещение и размытие также задаются CSS-переменными.',
      drag: 'Разрешить перетаскивание мышью или пером.', touch: 'Разрешить свайпы.', keyboard: 'Использовать стрелки, Home и End в фокусе.'
    },
    it: {
      preset: 'Effetto di transizione: fade incrocia, dissolve aggiunge grana e sfocatura, wipe usa una maschera direzionale; gli altri usano scene 3D distinte.',
      effectDirection: 'Direzione di apertura del wipe.', effectIntensity: 'Intensità di movimento, rotazione e sfocatura degli effetti.',
      activeShadow: 'Aggiunge un’ombra che segue la sagoma della slide Coverflow attiva.', activeShadowOpacity: 'Opacità dell’ombra; colore, offset e sfocatura restano regolabili via CSS.',
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
      watch: '외부 코드가 직계 자식 DOM을 추가·삭제·재배치할 때 자동 재생합니다. shuffle(), sort(), reorder() 같은 인스턴스 메서드는 이 설정과 관계없이 직접 재생됩니다.'
    },
    en: {
      mode: 'Reorder style: none=instant, slide=move, fade=fade out then in, crossfade=dissolve between layouts, fade-slide=move and fade, scale=shrink then grow.',
      duration: 'Duration of one reorder animation in seconds. It is ignored when mode is none.',
      stagger: 'Delay in seconds between the starts of item animations.',
      watch: 'Automatically plays when external code adds, removes, or reorders direct child DOM nodes. Instance methods such as shuffle(), sort(), and reorder() play directly regardless of this setting.'
    },
    ja: {
      mode: '項目を並べ替える動きです。noneはモーションなしで新しい位置へ即座に切り替えます。',
      duration: '1回の並べ替えモーションの時間（秒）。modeがnoneの場合は適用されません。',
      stagger: '各項目のモーション開始間隔（秒）です。',
      watch: '外部コードが直下のDOM子要素を追加・削除・並べ替えた時に自動再生します。shuffle()、sort()、reorder()はこの設定に関係なく直接再生します。'
    },
    'zh-CN': {
      mode: '项目重新排列时的移动方式。none 会无动画地立即切换到新位置。',
      duration: '单次重排动画时长（秒）；mode 为 none 时不生效。',
      stagger: '各项目动画开始之间的间隔（秒）。',
      watch: '外部代码添加、删除或重排直属 DOM 子节点时自动播放。shuffle()、sort()、reorder() 等实例方法不受此设置影响，会直接播放。'
    },
    'zh-TW': {
      mode: '項目重新排列時的移動方式。none 會不使用動畫，立即切換到新位置。',
      duration: '單次重排動畫時間（秒）；mode 為 none 時不套用。',
      stagger: '各項目動畫開始之間的間隔（秒）。',
      watch: '外部程式碼新增、刪除或重排直屬 DOM 子節點時自動播放。shuffle()、sort()、reorder() 等實例方法不受此設定影響，會直接播放。'
    },
    ru: {
      mode: 'Способ перехода элементов на новые места. none применяет новую раскладку сразу, без анимации.',
      duration: 'Длительность одной анимации перестановки в секундах. Не используется при mode none.',
      stagger: 'Задержка между началом анимации элементов в секундах.',
      watch: 'Автозапуск при добавлении, удалении или перестановке прямых дочерних DOM-узлов внешним кодом. Методы shuffle(), sort() и reorder() запускаются напрямую независимо от этой настройки.'
    },
    it: {
      mode: 'Come gli elementi raggiungono la nuova posizione. none applica subito il nuovo layout senza animazione.',
      duration: 'Durata di una transizione di riordino, in secondi. Non si applica con mode none.',
      stagger: 'Intervallo in secondi tra l’avvio delle animazioni degli elementi.',
      watch: 'Avvia automaticamente quando codice esterno aggiunge, rimuove o riordina figli DOM diretti. I metodi shuffle(), sort() e reorder() si avviano direttamente indipendentemente da questa opzione.'
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
