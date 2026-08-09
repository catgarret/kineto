(() => {
  const help = window.MK_HELP_I18N;
  if (!help) return;

  const translations = {
    ja: {
      cursor: {
        preset: 'カーソルの表示方式です。',
        color: 'カーソルの基本色です。',
        dotSize: '中心ドットの大きさ(px)です。',
        followerSize: '追従する外側カーソルの大きさ(px)です。',
        smoothing: 'ポインターを追う滑らかさです。',
        hoverScale: 'インタラクティブ要素上での拡大率です。',
        pressScale: '押している間の縮小率です。',
        hoverEffect: 'ホバー時の形状変化です。',
        src: 'imageプリセットで使う画像URLです。',
        width: '画像カーソルの幅(px)です。',
        height: '画像カーソルの高さ(px)です。',
        template: 'customプリセットで使うHTMLです。',
        snakeText: 'snakeプリセットでカーソル軌跡に並べる文字です。',
        snakeMinScale: 'snakeの末尾に向かう最小倍率です。',
        orbitText: 'orbitプリセットで円周に配置する文字です。',
        orbitRadius: 'orbit文字の半径(px)です。',
        orbitHoverScale: 'orbitをホバーしたときの倍率です。',
        clickSprite: 'クリック時に再生するスプライトシートURLです。',
        clickImage: 'クリック時に表示する画像URLです。',
        clickSpriteWidth: 'スプライト1フレームの幅(px)です。',
        clickSpriteFrames: 'スプライトシートのフレーム数です。',
        hoverSrc: 'ホバー時に切り替える画像URLです。',
        hoverTemplate: 'ホバー時に使うカスタムHTMLです。',
        hoverClass: 'ホバー時にカーソルへ付けるクラスです。'
      },
      tooltip: {
        content: 'ツールチップに表示する内容です。',
        placement: '対象を基準にした表示位置です。画面端では自動反転します。',
        effect: '表示・非表示の切り替え効果です。',
        trigger: 'ツールチップを開く操作です。',
        delay: '表示までの待ち時間(ms)です。',
        hideDelay: '非表示までの待ち時間(ms)です。',
        offset: '対象との間隔(px)です。',
        duration: '表示・非表示の時間(秒)です。',
        html: 'contentをHTMLとして解釈します。',
        interactive: 'ツールチップ上へポインターを移動できるようにします。'
      },
      counter: {
        separatorColor: '区切り文字(カンマ・コロン)の色です。',
        seamColor: 'flipタイル中央の折り目の色です。',
        shadow: 'flipタイルのドロップシャドウを表示します。'
      }
    },
    'zh-CN': {
      cursor: {
        preset: '光标的显示方式。',
        color: '光标基础颜色。',
        dotSize: '中心圆点大小(px)。',
        followerSize: '外层跟随光标大小(px)。',
        smoothing: '跟随指针的平滑程度。',
        hoverScale: '位于可交互元素上时的缩放比例。',
        pressScale: '按下时的缩放比例。',
        hoverEffect: '悬停时的形态变化。',
        src: 'image 预设使用的图片 URL。',
        width: '图片光标宽度(px)。',
        height: '图片光标高度(px)。',
        template: 'custom 预设使用的 HTML。',
        snakeText: 'snake 预设沿轨迹排列的文字。',
        snakeMinScale: 'snake 尾端的最小缩放比例。',
        orbitText: 'orbit 预设沿圆周排列的文字。',
        orbitRadius: 'orbit 文字半径(px)。',
        orbitHoverScale: '悬停 orbit 时的缩放比例。',
        clickSprite: '点击时播放的精灵图 URL。',
        clickImage: '点击时显示的图片 URL。',
        clickSpriteWidth: '精灵图单帧宽度(px)。',
        clickSpriteFrames: '精灵图的帧数。',
        hoverSrc: '悬停时切换的图片 URL。',
        hoverTemplate: '悬停时使用的自定义 HTML。',
        hoverClass: '悬停时添加到光标的类名。'
      },
      tooltip: {
        content: '工具提示中显示的内容。',
        placement: '相对目标的显示位置，靠近视口边缘时会自动翻转。',
        effect: '显示与隐藏的过渡效果。',
        trigger: '打开工具提示的交互方式。',
        delay: '显示前等待时间(ms)。',
        hideDelay: '隐藏前等待时间(ms)。',
        offset: '与目标之间的距离(px)。',
        duration: '显示与隐藏时长(秒)。',
        html: '将 content 解析为 HTML。',
        interactive: '允许指针移入工具提示。'
      },
      counter: {
        separatorColor: '分隔符（逗号、冒号）的颜色。',
        seamColor: 'flip 数字牌中央折线的颜色。',
        shadow: '是否显示 flip 数字牌阴影。'
      }
    },
    'zh-TW': {
      cursor: {
        preset: '游標的顯示方式。',
        color: '游標基礎顏色。',
        dotSize: '中心圓點大小(px)。',
        followerSize: '外層跟隨游標大小(px)。',
        smoothing: '跟隨指標的平滑程度。',
        hoverScale: '位於互動元素上時的縮放比例。',
        pressScale: '按下時的縮放比例。',
        hoverEffect: '懸停時的形態變化。',
        src: 'image 預設使用的圖片 URL。',
        width: '圖片游標寬度(px)。',
        height: '圖片游標高度(px)。',
        template: 'custom 預設使用的 HTML。',
        snakeText: 'snake 預設沿軌跡排列的文字。',
        snakeMinScale: 'snake 尾端的最小縮放比例。',
        orbitText: 'orbit 預設沿圓周排列的文字。',
        orbitRadius: 'orbit 文字半徑(px)。',
        orbitHoverScale: '懸停 orbit 時的縮放比例。',
        clickSprite: '點擊時播放的精靈圖 URL。',
        clickImage: '點擊時顯示的圖片 URL。',
        clickSpriteWidth: '精靈圖單幀寬度(px)。',
        clickSpriteFrames: '精靈圖的幀數。',
        hoverSrc: '懸停時切換的圖片 URL。',
        hoverTemplate: '懸停時使用的自訂 HTML。',
        hoverClass: '懸停時加到游標的類別。'
      },
      tooltip: {
        content: '工具提示中顯示的內容。',
        placement: '相對目標的顯示位置，靠近視窗邊緣時會自動翻轉。',
        effect: '顯示與隱藏的轉場效果。',
        trigger: '開啟工具提示的互動方式。',
        delay: '顯示前等待時間(ms)。',
        hideDelay: '隱藏前等待時間(ms)。',
        offset: '與目標之間的距離(px)。',
        duration: '顯示與隱藏時間(秒)。',
        html: '將 content 解析為 HTML。',
        interactive: '允許游標移入工具提示。'
      },
      counter: {
        separatorColor: '分隔符號（逗號、冒號）的顏色。',
        seamColor: 'flip 數字牌中央摺線的顏色。',
        shadow: '是否顯示 flip 數字牌陰影。'
      }
    },
    ru: {
      cursor: {
        preset: 'Способ отображения курсора.',
        color: 'Основной цвет курсора.',
        dotSize: 'Размер центральной точки в пикселях.',
        followerSize: 'Размер внешнего указателя в пикселях.',
        smoothing: 'Плавность следования за указателем.',
        hoverScale: 'Масштаб над интерактивным элементом.',
        pressScale: 'Масштаб во время нажатия.',
        hoverEffect: 'Изменение формы при наведении.',
        src: 'URL изображения для режима image.',
        width: 'Ширина курсора-изображения в пикселях.',
        height: 'Высота курсора-изображения в пикселях.',
        template: 'HTML для режима custom.',
        snakeText: 'Текст вдоль следа в режиме snake.',
        snakeMinScale: 'Минимальный масштаб в конце snake.',
        orbitText: 'Текст по окружности в режиме orbit.',
        orbitRadius: 'Радиус текста orbit в пикселях.',
        orbitHoverScale: 'Масштаб orbit при наведении.',
        clickSprite: 'URL спрайт-листа для анимации клика.',
        clickImage: 'URL изображения, показываемого при клике.',
        clickSpriteWidth: 'Ширина одного кадра спрайта в пикселях.',
        clickSpriteFrames: 'Количество кадров в спрайт-листе.',
        hoverSrc: 'URL изображения для состояния наведения.',
        hoverTemplate: 'Пользовательский HTML для наведения.',
        hoverClass: 'Класс курсора при наведении.'
      },
      tooltip: {
        content: 'Содержимое подсказки.',
        placement: 'Положение относительно цели; у края экрана автоматически меняется.',
        effect: 'Эффект появления и скрытия.',
        trigger: 'Действие, открывающее подсказку.',
        delay: 'Задержка перед показом в миллисекундах.',
        hideDelay: 'Задержка перед скрытием в миллисекундах.',
        offset: 'Отступ от цели в пикселях.',
        duration: 'Длительность появления и скрытия в секундах.',
        html: 'Интерпретировать content как HTML.',
        interactive: 'Разрешить перевод указателя на подсказку.'
      },
      counter: {
        separatorColor: 'Цвет разделителей — запятой и двоеточия.',
        seamColor: 'Цвет линии сгиба на табло flip.',
        shadow: 'Показывать тень табло flip.'
      }
    },
    it: {
      cursor: {
        preset: 'Modalità di visualizzazione del cursore.',
        color: 'Colore di base del cursore.',
        dotSize: 'Dimensione del punto centrale in pixel.',
        followerSize: 'Dimensione del cursore esterno in pixel.',
        smoothing: 'Fluidità con cui segue il puntatore.',
        hoverScale: 'Scala sopra un elemento interattivo.',
        pressScale: 'Scala durante la pressione.',
        hoverEffect: 'Cambiamento di forma al passaggio del puntatore.',
        src: 'URL dell’immagine per il preset image.',
        width: 'Larghezza del cursore immagine in pixel.',
        height: 'Altezza del cursore immagine in pixel.',
        template: 'HTML usato dal preset custom.',
        snakeText: 'Testo disposto lungo la scia del preset snake.',
        snakeMinScale: 'Scala minima verso la coda di snake.',
        orbitText: 'Testo disposto sulla circonferenza di orbit.',
        orbitRadius: 'Raggio del testo orbit in pixel.',
        orbitHoverScale: 'Scala di orbit al passaggio del puntatore.',
        clickSprite: 'URL dello sprite riprodotto al clic.',
        clickImage: 'URL dell’immagine mostrata al clic.',
        clickSpriteWidth: 'Larghezza di un fotogramma dello sprite in pixel.',
        clickSpriteFrames: 'Numero di fotogrammi dello sprite.',
        hoverSrc: 'URL dell’immagine usata al passaggio del puntatore.',
        hoverTemplate: 'HTML personalizzato usato al passaggio del puntatore.',
        hoverClass: 'Classe aggiunta al cursore al passaggio del puntatore.'
      },
      tooltip: {
        content: 'Contenuto mostrato nel tooltip.',
        placement: 'Posizione rispetto al target; si inverte automaticamente ai bordi.',
        effect: 'Effetto di comparsa e scomparsa.',
        trigger: 'Interazione che apre il tooltip.',
        delay: 'Attesa prima della comparsa in millisecondi.',
        hideDelay: 'Attesa prima della scomparsa in millisecondi.',
        offset: 'Distanza dal target in pixel.',
        duration: 'Durata di comparsa e scomparsa in secondi.',
        html: 'Interpreta content come HTML.',
        interactive: 'Consente di spostare il puntatore sul tooltip.'
      },
      counter: {
        separatorColor: 'Colore dei separatori, come virgola e due punti.',
        seamColor: 'Colore della piega centrale delle tessere flip.',
        shadow: 'Mostra l’ombra delle tessere flip.'
      }
    }
  };

  Object.entries(translations).forEach(([locale, modules]) => {
    Object.entries(modules).forEach(([module, values]) => {
      help[locale][module] = { ...(help[locale][module] || {}), ...values };
    });
  });

  window.KINETO_PLAYGROUND_I18N = {
    ko: {
      summary: '설정 · 코드', groupMotion: '모션 · 타이밍', groupTrigger: '트리거 · 범위',
      groupLook: '외형', groupBehavior: '동작', groupAdvanced: '고급 · API',
      run: '실행', replay: '다시 재생', reset: '초기화', settings: '설정', code: '코드',
      wrap: '자동 줄바꿈', copyCode: '코드 복사', copied: '복사됨', copy: '복사',
      liveHint: '옵션을 바꾸면 위 예제에 바로 반영됩니다.', closeOptions: '옵션 닫기',
      options: '옵션 설정', resize: '설정창 높이 조절 (드래그 또는 ↑/↓)',
      resizeTitle: '드래그: 높이 조절 · 더블클릭: 초기화', chooseColor: '색상 선택',
      colorValue: 'CSS 색상 값: HEX, RGB, RGBA, HSL 또는 HSLA', openSettings: '설정 열기',
      replayDone: '다시 재생했습니다', resetDone: '기본값으로 되돌렸습니다',
      copyDone: '복사되었습니다', shareSettings: '설정 링크 복사', shareDone: '설정 링크를 복사했습니다', shareRestored: '공유 설정을 적용했습니다', demoLink: '데모로 이동'
    },
    en: {
      summary: 'Settings · Code', groupMotion: 'Motion · Timing', groupTrigger: 'Trigger · Range',
      groupLook: 'Appearance', groupBehavior: 'Behavior', groupAdvanced: 'Advanced · API',
      run: 'Run', replay: 'Replay', reset: 'Reset', settings: 'Settings', code: 'Code',
      wrap: 'Wrap lines', copyCode: 'Copy code', copied: 'Copied', copy: 'Copy',
      liveHint: 'Changes are applied to the example above.', closeOptions: 'Close options',
      options: 'Module options', resize: 'Resize settings drawer (drag or ↑/↓)',
      resizeTitle: 'Drag to resize · Double-click to reset', chooseColor: 'Choose color',
      colorValue: 'CSS color: HEX, RGB, RGBA, HSL, or HSLA', openSettings: 'Open settings',
      replayDone: 'Replayed', resetDone: 'Restored defaults', copyDone: 'Copied', shareSettings: 'Copy settings link', shareDone: 'Settings link copied', shareRestored: 'Shared settings applied', demoLink: 'Go to demo'
    },
    ja: {
      summary: '設定 · コード', groupMotion: 'モーション · タイミング', groupTrigger: 'トリガー · 範囲',
      groupLook: '外観', groupBehavior: '動作', groupAdvanced: '詳細 · API',
      run: '実行', replay: '再生', reset: 'リセット', settings: '設定', code: 'コード',
      wrap: '行を折り返す', copyCode: 'コードをコピー', copied: 'コピー済み', copy: 'コピー',
      liveHint: '変更は上の例にすぐ反映されます。', closeOptions: '設定を閉じる',
      options: 'モジュール設定', resize: '設定パネルの高さを調整（ドラッグまたは↑/↓）',
      resizeTitle: 'ドラッグで調整 · ダブルクリックでリセット', chooseColor: '色を選択',
      colorValue: 'CSSカラー: HEX、RGB、RGBA、HSL、HSLA', openSettings: '設定を開く',
      replayDone: '再生しました', resetDone: '初期値に戻しました', copyDone: 'コピーしました', shareSettings: '設定リンクをコピー', shareDone: '設定リンクをコピーしました', shareRestored: '共有設定を適用しました', demoLink: 'デモへ移動'
    },
    'zh-CN': {
      summary: '设置 · 代码', groupMotion: '动效 · 时间', groupTrigger: '触发 · 范围',
      groupLook: '外观', groupBehavior: '行为', groupAdvanced: '高级 · API',
      run: '运行', replay: '重新播放', reset: '重置', settings: '设置', code: '代码',
      wrap: '自动换行', copyCode: '复制代码', copied: '已复制', copy: '复制',
      liveHint: '修改会立即应用到上方示例。', closeOptions: '关闭设置',
      options: '模块设置', resize: '调整设置面板高度（拖动或↑/↓）',
      resizeTitle: '拖动调整 · 双击重置', chooseColor: '选择颜色',
      colorValue: 'CSS 颜色：HEX、RGB、RGBA、HSL 或 HSLA', openSettings: '打开设置',
      replayDone: '已重新播放', resetDone: '已恢复默认值', copyDone: '已复制', shareSettings: '复制设置链接', shareDone: '已复制设置链接', shareRestored: '已应用共享设置', demoLink: '前往示例'
    },
    'zh-TW': {
      summary: '設定 · 程式碼', groupMotion: '動效 · 時間', groupTrigger: '觸發 · 範圍',
      groupLook: '外觀', groupBehavior: '行為', groupAdvanced: '進階 · API',
      run: '執行', replay: '重新播放', reset: '重設', settings: '設定', code: '程式碼',
      wrap: '自動換行', copyCode: '複製程式碼', copied: '已複製', copy: '複製',
      liveHint: '修改會立即套用到上方範例。', closeOptions: '關閉設定',
      options: '模組設定', resize: '調整設定面板高度（拖曳或↑/↓）',
      resizeTitle: '拖曳調整 · 雙擊重設', chooseColor: '選擇顏色',
      colorValue: 'CSS 顏色：HEX、RGB、RGBA、HSL 或 HSLA', openSettings: '開啟設定',
      replayDone: '已重新播放', resetDone: '已還原預設值', copyDone: '已複製', shareSettings: '複製設定連結', shareDone: '已複製設定連結', shareRestored: '已套用共享設定', demoLink: '前往範例'
    },
    ru: {
      summary: 'Настройки · Код', groupMotion: 'Движение · Время', groupTrigger: 'Триггер · Диапазон',
      groupLook: 'Внешний вид', groupBehavior: 'Поведение', groupAdvanced: 'Дополнительно · API',
      run: 'Запустить', replay: 'Повторить', reset: 'Сбросить', settings: 'Настройки', code: 'Код',
      wrap: 'Перенос строк', copyCode: 'Копировать код', copied: 'Скопировано', copy: 'Копировать',
      liveHint: 'Изменения сразу применяются к примеру выше.', closeOptions: 'Закрыть настройки',
      options: 'Настройки модуля', resize: 'Изменить высоту панели (перетаскивание или ↑/↓)',
      resizeTitle: 'Перетащить для изменения · Двойной щелчок для сброса', chooseColor: 'Выбрать цвет',
      colorValue: 'Цвет CSS: HEX, RGB, RGBA, HSL или HSLA', openSettings: 'Открыть настройки',
      replayDone: 'Повтор запущен', resetDone: 'Настройки сброшены', copyDone: 'Скопировано', shareSettings: 'Копировать ссылку настроек', shareDone: 'Ссылка настроек скопирована', shareRestored: 'Общие настройки применены', demoLink: 'Перейти к демо'
    },
    it: {
      summary: 'Impostazioni · Codice', groupMotion: 'Movimento · Tempi', groupTrigger: 'Attivazione · Intervallo',
      groupLook: 'Aspetto', groupBehavior: 'Comportamento', groupAdvanced: 'Avanzate · API',
      run: 'Esegui', replay: 'Riproduci', reset: 'Ripristina', settings: 'Impostazioni', code: 'Codice',
      wrap: 'A capo automatico', copyCode: 'Copia codice', copied: 'Copiato', copy: 'Copia',
      liveHint: 'Le modifiche si applicano subito all’esempio sopra.', closeOptions: 'Chiudi impostazioni',
      options: 'Impostazioni modulo', resize: 'Ridimensiona il pannello (trascina o ↑/↓)',
      resizeTitle: 'Trascina per ridimensionare · Doppio clic per ripristinare', chooseColor: 'Scegli colore',
      colorValue: 'Colore CSS: HEX, RGB, RGBA, HSL o HSLA', openSettings: 'Apri impostazioni',
      replayDone: 'Riprodotto', resetDone: 'Valori predefiniti ripristinati', copyDone: 'Copiato', shareSettings: 'Copia link impostazioni', shareDone: 'Link impostazioni copiato', shareRestored: 'Impostazioni condivise applicate', demoLink: 'Vai alla demo'
    }
  };

  const easingEditor = {
    ko: {
      easeResetTitle: '처음 값으로 되돌립니다', easeCopyTitle: 'cubic-bezier() CSS 값을 복사합니다',
      easeSaveTitle: '현재 곡선을 이름 붙여 저장합니다', easeCopyCss: 'CSS 복사', easeSaveToken: '토큰 저장',
      easeResetDone: '처음 값으로 되돌렸습니다', easeCopied: '복사됨', easeSaved: '저장됨',
      easeSavePrompt: '저장할 이름', easeSavedGroup: '저장한 토큰'
    },
    en: {
      easeResetTitle: 'Restore the initial curve', easeCopyTitle: 'Copy the cubic-bezier() CSS value',
      easeSaveTitle: 'Save the current curve with a name', easeCopyCss: 'Copy CSS', easeSaveToken: 'Save token',
      easeResetDone: 'Restored the initial curve', easeCopied: 'Copied', easeSaved: 'Saved',
      easeSavePrompt: 'Token name', easeSavedGroup: 'Saved tokens'
    },
    ja: {
      easeResetTitle: '初期カーブに戻します', easeCopyTitle: 'cubic-bezier() のCSS値をコピーします',
      easeSaveTitle: '現在のカーブに名前を付けて保存します', easeCopyCss: 'CSSをコピー', easeSaveToken: 'トークンを保存',
      easeResetDone: '初期カーブに戻しました', easeCopied: 'コピー済み', easeSaved: '保存済み',
      easeSavePrompt: '保存名', easeSavedGroup: '保存したトークン'
    },
    'zh-CN': {
      easeResetTitle: '恢复初始曲线', easeCopyTitle: '复制 cubic-bezier() CSS 值',
      easeSaveTitle: '命名并保存当前曲线', easeCopyCss: '复制 CSS', easeSaveToken: '保存令牌',
      easeResetDone: '已恢复初始曲线', easeCopied: '已复制', easeSaved: '已保存',
      easeSavePrompt: '令牌名称', easeSavedGroup: '已保存令牌'
    },
    'zh-TW': {
      easeResetTitle: '還原初始曲線', easeCopyTitle: '複製 cubic-bezier() CSS 值',
      easeSaveTitle: '命名並儲存目前曲線', easeCopyCss: '複製 CSS', easeSaveToken: '儲存權杖',
      easeResetDone: '已還原初始曲線', easeCopied: '已複製', easeSaved: '已儲存',
      easeSavePrompt: '權杖名稱', easeSavedGroup: '已儲存權杖'
    },
    ru: {
      easeResetTitle: 'Вернуть исходную кривую', easeCopyTitle: 'Скопировать CSS-значение cubic-bezier()',
      easeSaveTitle: 'Сохранить текущую кривую с именем', easeCopyCss: 'Копировать CSS', easeSaveToken: 'Сохранить токен',
      easeResetDone: 'Исходная кривая восстановлена', easeCopied: 'Скопировано', easeSaved: 'Сохранено',
      easeSavePrompt: 'Имя токена', easeSavedGroup: 'Сохранённые токены'
    },
    it: {
      easeResetTitle: 'Ripristina la curva iniziale', easeCopyTitle: 'Copia il valore CSS cubic-bezier()',
      easeSaveTitle: 'Salva la curva corrente con un nome', easeCopyCss: 'Copia CSS', easeSaveToken: 'Salva token',
      easeResetDone: 'Curva iniziale ripristinata', easeCopied: 'Copiato', easeSaved: 'Salvato',
      easeSavePrompt: 'Nome del token', easeSavedGroup: 'Token salvati'
    }
  };
  Object.entries(easingEditor).forEach(([locale, values]) => {
    Object.assign(window.KINETO_PLAYGROUND_I18N[locale], values);
  });
})();
