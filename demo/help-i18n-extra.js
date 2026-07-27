(() => {
  const sets = window.MK_HELP_I18N;
  if (!sets) return;

  const copy = {
    ko: {
      mode: '가장자리 표현 방식입니다. shadow는 그림자, mask는 콘텐츠 자체를 투명하게 흐립니다.',
      shape: '그림자의 번짐 형태입니다.',
      axis: '스크롤 방향입니다.',
      size: '가장자리 효과가 차지하는 길이(px)입니다.',
      transition: 'mask가 나타나고 사라지는 전환 시간(ms)입니다.',
      opacity: '그림자 불투명도입니다.',
      shadow: '그림자 색상입니다. CSS 변수 --kt-scroll-shadow로도 바꿀 수 있습니다.',
      color: '그림자를 가리는 컨테이너 배경색입니다.'
    },
    en: {
      mode: 'Edge treatment: shadow adds depth; mask fades the content itself.',
      shape: 'Shadow falloff shape.',
      axis: 'Scroll direction.',
      size: 'Length of the edge treatment in pixels.',
      transition: 'Time for a mask edge to appear or retract, in milliseconds.',
      opacity: 'Shadow opacity.',
      shadow: 'Shadow color. You can also set --kt-scroll-shadow in CSS.',
      color: 'Container background color used to cover the shadow.'
    },
    ja: {
      mode: '端の表現方式。shadowは影、maskはコンテンツ自体を透明にします。',
      shape: '影の広がり方です。',
      axis: 'スクロール方向です。',
      size: '端の効果が占める長さ(px)です。',
      transition: 'maskが現れたり引っ込んだりする時間(ms)です。',
      opacity: '影の不透明度です。',
      shadow: '影の色。CSS変数--kt-scroll-shadowでも変更できます。',
      color: '影を覆うコンテナの背景色です。'
    },
    'zh-CN': {
      mode: '边缘表现方式：shadow 添加阴影，mask 让内容本身渐隐。',
      shape: '阴影的扩散形状。',
      axis: '滚动方向。',
      size: '边缘效果占用的长度(px)。',
      transition: 'mask 出现或收回的时间(ms)。',
      opacity: '阴影不透明度。',
      shadow: '阴影颜色，也可通过 CSS 变量 --kt-scroll-shadow 设置。',
      color: '用于覆盖阴影的容器背景色。'
    },
    'zh-TW': {
      mode: '邊緣表現方式：shadow 加入陰影，mask 讓內容本身漸隱。',
      shape: '陰影的擴散形狀。',
      axis: '捲動方向。',
      size: '邊緣效果所占的長度(px)。',
      transition: 'mask 出現或收回的時間(ms)。',
      opacity: '陰影不透明度。',
      shadow: '陰影顏色，也可透過 CSS 變數 --kt-scroll-shadow 設定。',
      color: '用來覆蓋陰影的容器背景色。'
    },
    ru: {
      mode: 'Оформление края: shadow добавляет тень, mask плавно скрывает сам контент.',
      shape: 'Форма затухания тени.',
      axis: 'Направление прокрутки.',
      size: 'Длина эффекта у края в пикселях.',
      transition: 'Время появления и скрытия маски в миллисекундах.',
      opacity: 'Непрозрачность тени.',
      shadow: 'Цвет тени. Также доступна CSS-переменная --kt-scroll-shadow.',
      color: 'Фон контейнера, перекрывающий тень.'
    },
    it: {
      mode: 'Trattamento del bordo: shadow aggiunge l’ombra, mask sfuma il contenuto.',
      shape: 'Forma della diffusione dell’ombra.',
      axis: 'Direzione di scorrimento.',
      size: 'Lunghezza dell’effetto sul bordo in pixel.',
      transition: 'Tempo di comparsa o rientro della maschera in millisecondi.',
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
      direction: '반복 모션의 진행 방향입니다.', motionDuration: '반복 한 주기의 시간(초)입니다.', linecap: '원형 진행선 끝 모양입니다.', indeterminate: '완료 시점을 모를 때 진행률 숫자 없이 반복합니다.', radius: '바 또는 터미널 표면의 모서리 반경(px)입니다.', glow: '로더 주변 후광을 표시합니다.', glowColor: '후광 색입니다. HEX·RGB·RGBA·HSL을 지원합니다.', glowSize: '후광이 퍼지는 크기(px)입니다.', spinnerStyle: '스피너의 회전 구조입니다.', dotStyle: '점이 반응하는 방식입니다.', dotCount: '표시할 점 또는 스포크 수입니다.', dotSize: '점 하나의 크기(px)입니다.', dotGap: '점 사이 간격(px)입니다.', text: '시머 또는 터미널에 표시할 문구입니다.', textSize: '시머 문구 크기(px)입니다.', baseColor: '빛이 지나가기 전 기본 글자색입니다.', highlightColor: '지나가는 빛 또는 보조 링 색입니다.', spread: '시머 하이라이트 폭(%)입니다.', fontFamily: '사용할 CSS font-family 값입니다.', terminalStyle: 'CLI 로딩 표시 방식입니다.', terminalPrompt: '명령 앞에 붙는 프롬프트입니다.', terminalLines: 'steps에서 순서대로 표시할 문구를 |로 구분합니다.', cursorChar: 'cursor에서 점멸할 문자입니다.', terminalBackground: '터미널 표면 배경색입니다.', terminalBorderColor: '터미널 표면 테두리색입니다.'
    },
    en: {
      direction: 'Direction of the repeating motion.', motionDuration: 'Duration of one motion cycle in seconds.', linecap: 'Shape of the circular progress line ends.', indeterminate: 'Loop without a numeric value when completion time is unknown.', radius: 'Corner radius of the bar or terminal surface.', glow: 'Show a glow around the loader.', glowColor: 'Glow color; HEX, RGB, RGBA and HSL are accepted.', glowSize: 'Glow spread in pixels.', spinnerStyle: 'Rotational structure of the spinner.', dotStyle: 'How the dots animate.', dotCount: 'Number of dots or spokes.', dotSize: 'Size of each dot in pixels.', dotGap: 'Gap between dots in pixels.', text: 'Text shown by shimmer or terminal loaders.', textSize: 'Shimmer text size in pixels.', baseColor: 'Base text color before the highlight passes.', highlightColor: 'Moving highlight or secondary ring color.', spread: 'Width of the shimmer highlight.', fontFamily: 'CSS font-family value.', terminalStyle: 'CLI loading presentation.', terminalPrompt: 'Prompt shown before a command.', terminalLines: 'Separate step messages with |.', cursorChar: 'Blinking character in cursor mode.', terminalBackground: 'Terminal surface background.', terminalBorderColor: 'Terminal surface border color.'
    },
    ja: {
      direction: '繰り返しモーションの方向です。', motionDuration: '1周期の時間(秒)です。', linecap: '円形進行線の端の形です。', indeterminate: '完了時刻が不明な場合、数値なしで繰り返します。', radius: 'バーまたはターミナルの角丸(px)です。', glow: 'ローダー周囲の光を表示します。', glowColor: '光の色です。HEX・RGB・RGBA・HSLに対応します。', glowSize: '光の広がり(px)です。', spinnerStyle: 'スピナーの回転構造です。', dotStyle: '点の動き方です。', dotCount: '点またはスポークの数です。', dotSize: '点の大きさ(px)です。', dotGap: '点の間隔(px)です。', text: 'シマーまたはターミナルの文言です。', textSize: 'シマー文字サイズ(px)です。', baseColor: '光が通る前の基本文字色です。', highlightColor: '移動する光または補助リングの色です。', spread: 'シマー光の幅です。', fontFamily: 'CSS font-family値です。', terminalStyle: 'CLIローディングの表示方式です。', terminalPrompt: 'コマンド前のプロンプトです。', terminalLines: 'stepsの文言を|で区切ります。', cursorChar: 'cursorで点滅する文字です。', terminalBackground: 'ターミナル表面の背景色です。', terminalBorderColor: 'ターミナル表面の枠線色です。'
    },
    'zh-CN': {
      direction: '循环动画的方向。', motionDuration: '一次动画循环的时长（秒）。', linecap: '圆形进度线的端点形状。', indeterminate: '完成时间未知时，不显示数值并循环。', radius: '进度条或终端表面的圆角(px)。', glow: '显示加载器周围的光晕。', glowColor: '光晕颜色，支持 HEX、RGB、RGBA 和 HSL。', glowSize: '光晕扩散大小(px)。', spinnerStyle: '旋转加载器的结构。', dotStyle: '圆点的动画方式。', dotCount: '圆点或辐条数量。', dotSize: '单个圆点大小(px)。', dotGap: '圆点间距(px)。', text: '微光或终端加载器显示的文字。', textSize: '微光文字大小(px)。', baseColor: '高光经过前的基础文字颜色。', highlightColor: '移动高光或辅助圆环颜色。', spread: '微光高亮宽度。', fontFamily: 'CSS font-family 值。', terminalStyle: 'CLI 加载显示方式。', terminalPrompt: '命令前显示的提示符。', terminalLines: '用 | 分隔 steps 文本。', cursorChar: 'cursor 模式中闪烁的字符。', terminalBackground: '终端表面背景色。', terminalBorderColor: '终端表面边框色。'
    },
    'zh-TW': {
      direction: '循環動畫的方向。', motionDuration: '一次動畫循環的時長（秒）。', linecap: '圓形進度線的端點形狀。', indeterminate: '完成時間未知時，不顯示數值並循環。', radius: '進度列或終端表面的圓角(px)。', glow: '顯示載入器周圍的光暈。', glowColor: '光暈顏色，支援 HEX、RGB、RGBA 和 HSL。', glowSize: '光暈擴散大小(px)。', spinnerStyle: '旋轉載入器的結構。', dotStyle: '圓點的動畫方式。', dotCount: '圓點或輻條數量。', dotSize: '單個圓點大小(px)。', dotGap: '圓點間距(px)。', text: '微光或終端載入器顯示的文字。', textSize: '微光文字大小(px)。', baseColor: '高光經過前的基礎文字顏色。', highlightColor: '移動高光或輔助圓環顏色。', spread: '微光高亮寬度。', fontFamily: 'CSS font-family 值。', terminalStyle: 'CLI 載入顯示方式。', terminalPrompt: '命令前顯示的提示字元。', terminalLines: '用 | 分隔 steps 文字。', cursorChar: 'cursor 模式中閃爍的字元。', terminalBackground: '終端表面背景色。', terminalBorderColor: '終端表面邊框色。'
    },
    ru: {
      direction: 'Направление повторяющегося движения.', motionDuration: 'Длительность одного цикла в секундах.', linecap: 'Форма концов круговой линии.', indeterminate: 'Цикл без числа, когда время завершения неизвестно.', radius: 'Радиус углов полосы или терминала.', glow: 'Показывать свечение вокруг индикатора.', glowColor: 'Цвет свечения: HEX, RGB, RGBA или HSL.', glowSize: 'Размер свечения в пикселях.', spinnerStyle: 'Структура вращающегося индикатора.', dotStyle: 'Способ анимации точек.', dotCount: 'Количество точек или лучей.', dotSize: 'Размер точки в пикселях.', dotGap: 'Интервал между точками.', text: 'Текст шиммера или терминала.', textSize: 'Размер текста шиммера.', baseColor: 'Основной цвет текста до блика.', highlightColor: 'Цвет движущегося блика или второго кольца.', spread: 'Ширина блика шиммера.', fontFamily: 'Значение CSS font-family.', terminalStyle: 'Вид CLI-индикатора.', terminalPrompt: 'Приглашение перед командой.', terminalLines: 'Разделяйте строки steps символом |.', cursorChar: 'Мигающий символ режима cursor.', terminalBackground: 'Фон поверхности терминала.', terminalBorderColor: 'Цвет рамки терминала.'
    },
    it: {
      direction: 'Direzione del movimento ripetuto.', motionDuration: 'Durata di un ciclo in secondi.', linecap: 'Forma delle estremità del progresso circolare.', indeterminate: 'Ripete senza valore quando la fine è ignota.', radius: 'Raggio degli angoli della barra o del terminale.', glow: 'Mostra il bagliore intorno al loader.', glowColor: 'Colore del bagliore: HEX, RGB, RGBA o HSL.', glowSize: 'Estensione del bagliore in pixel.', spinnerStyle: 'Struttura rotante dello spinner.', dotStyle: 'Modalità di animazione dei punti.', dotCount: 'Numero di punti o raggi.', dotSize: 'Dimensione di ogni punto in pixel.', dotGap: 'Spazio tra i punti.', text: 'Testo dello shimmer o del terminale.', textSize: 'Dimensione del testo shimmer.', baseColor: 'Colore base prima del passaggio della luce.', highlightColor: 'Colore della luce o dell’anello secondario.', spread: 'Larghezza della luce shimmer.', fontFamily: 'Valore CSS font-family.', terminalStyle: 'Presentazione del loader CLI.', terminalPrompt: 'Prompt prima del comando.', terminalLines: 'Separa le righe steps con |.', cursorChar: 'Carattere lampeggiante in cursor.', terminalBackground: 'Sfondo del terminale.', terminalBorderColor: 'Colore del bordo del terminale.'
    }
  };

  Object.entries(copy).forEach(([locale, values]) => {
    if (!sets[locale]) return;
    sets[locale].scrollShadows = { ...(sets[locale].scrollShadows || {}), ...values };
    sets[locale].coverReveal = { ...(sets[locale].coverReveal || {}), ...coverRevealColors[locale] };
    sets[locale].cursor = { ...(sets[locale].cursor || {}), hoverShadow: hoverShadow[locale] };
    sets[locale].glitch = { ...(sets[locale].glitch || {}), ...glitchControls[locale] };
    sets[locale].loader = { ...(sets[locale].loader || {}), ...loaderControls[locale] };
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
