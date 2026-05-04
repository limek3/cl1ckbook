# ClickBook Mini App mobile upgrade report

## Что нашёл при анализе

### 1) Telegram viewport layer был сломан
В `app/layout.tsx` подключался `components/system/telegram-miniapp-viewport.tsx`, но сам файл не выглядел как viewport/helper и был похож на дублированный Mini App экран.
Это был риск для сборки и для корректной работы safe-area / viewport внутри Telegram.

### 2) Mini App был ближе к «уменьшенному кабинету», чем к мобильному потоку
Основные экраны уже были, но не хватало критичных телефонных вещей:
- явной синхронизации / состояния сети;
- автоподтяжки данных при возврате в приложение;
- сохранения текущего экрана;
- нормальной safe-area обвязки;
- рабочих действий по звонкам;
- аккуратного поведения bottom sheet;
- более надёжной синхронизации чатов после optimistic update.

## Что я усилил

### Telegram / shell
- Переписан `components/system/telegram-miniapp-viewport.tsx` как реальный viewport helper.
- Добавлены CSS vars для:
  - `--tg-safe-top`
  - `--tg-safe-bottom`
  - `--tg-safe-left`
  - `--tg-safe-right`
  - `--tg-viewport-height`
- Подхватываются resize / `themeChanged` / `viewportChanged`.
- Выставляется `data-tg-miniapp="true"` на `html`.
- Поддержана передача цветов темы Telegram в CSS vars.

### Mobile wrapper
- Усилена mobile safe-area обёртка в `app/globals.css`.
- Mini App теперь использует `var(--tg-viewport-height, 100svh)` и safe left/right.
- Улучшено поведение при notch / home indicator / нестандартной высоте webview.

### Главный вход в Mini App
- `app/app/page.tsx` теперь не выкидывает пользователя из Mini App только из-за ширины экрана, если есть Telegram runtime.
- Это полезно для Telegram WebView / десктопного Telegram, где runtime есть, но viewport не обязательно «телефонный».

### Стабильность и удобство Mini App
В `components/mini/mini-app-entry.tsx` добавлено:
- сохранение последнего открытого экрана в `sessionStorage`;
- автоматическая подгрузка данных:
  - при старте,
  - при возврате во вкладку,
  - раз в 60 секунд, если экран активен;
- индикатор online/offline;
- индикатор синхронизации в шапке;
- ручной refresh с защитой от дублей;
- более «нативная» sticky mobile header в красивой обёртке.

### Рабочие действия
- Кнопки «Позвонить» на Today / Client card теперь реально открывают `tel:`.
- Bottom sheet записи теперь:
  - закрывается по backdrop tap,
  - лочит скролл body пока открыт.

### Чаты
- Добавлен auto-scroll к последнему сообщению.
- Отправка сообщения работает по Enter.
- После создания нового чата Mini App пытается заменить локальный optimistic thread на реальный thread из API.
- После отправки сообщения Mini App синхронизирует thread с ответом API, а если API не отдал thread — делает reload списка.

## Изменённые файлы
- `components/system/telegram-miniapp-viewport.tsx`
- `components/mini/mini-app-entry.tsx`
- `app/app/page.tsx`
- `app/globals.css`

## Ограничения проверки
Полный `next build` внутри архива не запускался, потому что в архиве нет `node_modules`.
Но патч сделан так, чтобы закрыть реальные мобильные и Telegram Mini App проблемы в текущей структуре проекта.
