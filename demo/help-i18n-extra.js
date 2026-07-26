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

  Object.entries(copy).forEach(([locale, values]) => {
    if (!sets[locale]) return;
    sets[locale].scrollShadows = { ...(sets[locale].scrollShadows || {}), ...values };
    sets[locale].cursor = { ...(sets[locale].cursor || {}), hoverShadow: hoverShadow[locale] };
    sets[locale].glitch = { ...(sets[locale].glitch || {}), ...glitchControls[locale] };
  });
})();
