# FileStyler

[![NPM version](http://img.shields.io/npm/v/filestyler.svg?style=flat)](https://www.npmjs.org/package/filestyler)
![Bower version](http://img.shields.io/bower/v/filestyler.svg?style=flat)

Компонент для стилизации файловых полей с поддержкой ajax-отправки.

[English readme](https://github.com/paulzi/filestyler/)

## Установка

Установка через NPM:

```sh
npm install filestyler
```

Установка через Bower:

```sh
bower install filestyler
```

или установите вручную.

### Подключение

Подключите скрипт на страницу после подключения jQuery:

```html
<script src="/node_modules/jquery/dist/jquery.min.js"></script>
<script src="/node_modules/jquery-iframe-ajax/dist/jquery-iframe-ajax.min.js"></script>
<script src="/node_modules/filestyler/dist/filestyler.min.js"></script>
```

Внимание: используйте [jquery-iframe-ajax](https://github.com/paulzi/jquery-iframe-ajax) если вам необходима поддержка ajax-отправки (см. опцию `mode`) в старых браузерах не поддерживающих [XHR2](http://caniuse.com/#feat=xhr2) (например, IE9).

или используйте свою систему сборки модулей (поддерживается AMD и CommonJS).

*Примечание: вы можете использовать облегчённую сборку без плагинов base64 и ajax - `filestyler-style-only.min.js`*

Подключите стили компонента в тэге `head`:

```html
<link rel="stylesheet" href="/node_modules/filestyler/dist/filestyler.min.css">
<link rel="stylesheet" href="/node_modules/filestyler/dist/filestyler-theme.min.css">
```

*Внимание: `filestyler-theme` содержит готовые стили для спискового и фото отображения компонента. Они не обязательны для использования - вы можете написать и использовать свои стили.*

## Использование

Это пример разметки компонента (вы можете [изменить её по своему усмотрению](#Шаблоны)):

```html
<div class="filestyler filestyler_uninitialized filestyler_image">
    <div class="filestyler__drop">
        <div class="filestyler__list">
            <button type="button" class="filestyler__clear"></button>
            <label class="filestyler__file filestyler__plus">
                <input type="file" name="file[]" multiple class="filestyler__input">
            </label>
        </div>
    </div>
</div>
```

Если вы не изменяли параметр `FileStyler.autoInit`, данный компонент автоматически инициализируется с опциями указанными в атрибуте `data-filestyler` в виде JSON. Иначе инициализируйте компонент:

```javascript
$('.filestyler').filestyler({});
```

## Режимы работы

FileStyler поддерживает несколько режимов работы - от простой стилизации, до ajax загрузки файлов:

### `mode: 'default'`

Режим, при котором полностью сохраняется стандартное браузерное поведение элемента `<input type="file">`, а именно, при повторном выборе файлов - предыдущий выбор будет отменён.

Drag'n'drop будет работать только в браузерах, поддерживающих это нативно на обычном `<input type="file">`. Для расширения drop-зоны, используете опцию [moveInputOnDrag](#moveinputondrag).

Выборочное удаление выбранных файлов не поддерживается в данном режиме.

Пересортировка отправляемых файлов возможна только с использованием [sortHelper](#Встроенные-плагины).

Единственное отличие от стандартного поведения - если браузер не поддерживает атрибут `multiple`, FileStyler выступит в роли полифила, переключив режим в `add`.

### `mode: 'add'`

Режим аналогичен предыдущему (default), с одним отличием. Новый выбор файлов добавляется к ранее выбранным файлам, не затирая их.

### `mode: 'byOne'`

Режим `byOne` отключает `multiple` атрибут у инпута, сохраняя при этом множественную загрузку файлов. Таким образом, для того чтобы пользователю прикрепить несколько файлов, он должен прикреплять их по одному (нет возможности выбрать несколько файлов в диалоговом окне выбора файла).

Drag'n'drop работает также как и в режиме `default`. А вот выборочное удаление файлов и пересортировка полностью поддерживаются.

### `mode: 'base64'`

В этом режиме все прикрепляемые файлы конвертируются в `<input type="hidden">` с содержимым файлов в base64-кодировке. Благодаря этому нет необходимости менять `enctype` у формы, а сами файлы передаются на сервер обычным строками. Однако, потребуется дополнительная обработка получаемых данных на сервере.

В этом режиме полностью поддерживается drag'n'drop, выборочное удаление файлов и пересортировка.

### `mode: 'ajax'`

В режиме `ajax` файлы будут отправляться на сервер посредством AJAX отдельно от основной формы. Благодаря этому появляется возможность отображать прогресс выгрузки файлов на сервер. Однако на серверной части также потребуется разработать дополнительные функции для связи отдельно отправляемых файлов и остальной формы.

Режим полностью поддерживает drag'n'drop, выборочное удаление файлов и пересортировку.

AJAX отправка поддерживается браузерами поддерживающими [XHR2](http://caniuse.com/#feat=xhr2), для устаревших браузеров вы можете использовать [jquery-iframe-ajax](https://github.com/paulzi/jquery-iframe-ajax).

Если вы хотите отправлять всю форму через AJAX, вы можете воспользоваться [paulzi-form](https://github.com/paulzi/paulzi-form).

### Сводная таблица

| Функция              | default | add | byOne | base64 | ajax |
|----------------------|:-------:|:---:|:-----:|:------:|:----:|
| multiple выбор       |    +    |  +  |   -   |   +    |  +   |
| Выборочное удаление  |    -    |  -  |   +   |   +    |  +   |
| Сортировка           |    *1   |  *1 |   +   |   +    |  +   |
| Drag'n'drop          |    *2   |  *2 |   *2  |   +    |  +   |
| Стандартная отправка |    +    |  +  |   +   |   -    |  -   |

- *1 - сортировка возможна с использованием [sortHelper](#Встроенные-плагины)
- *2 - только в браузерах с нативной поддержкой drag'n'drop на `<input type="file">`

*Примечание: под поддержкой сортировки имеется в виду сама возможность менять порядок `.filestyler__item` элементов с соответствующим изменением порядка в отправляемых данных на сервер. Сама функциональность изменения порядка элементов в пользовательском интерфейсе не реализована данной библиотекой. Используйте для этого сторонние библиотеки, например, [RubaXa/Sortable](https://github.com/RubaXa/Sortable).*

### Встроенные плагины

- `image` - выводит миниатюру прикреплённого изображения
- `sortHelper` - добавляет к элементам hidden-поле с постоянно увеличивающимся счётчиком, благодаря этому на серверной части можно организовать пересортировку элементов
- `drop` - реализует поддержку drag'n'drop
- `base64` - добавляет режим `base64`
- `ajax` - добавляет режим `ajax`

## Документация

### Получение и свойства экземпляра объекта

Экземпляр класса FileStyler хранится в jQuery data:

```javascript
var filestyler = $('.example-form .filestyler').data('filestyler');
filestyler.clear();
```

### Опции инициализации

#### Базовые

##### `mode`

*(String) по-умолчанию: 'add'*

[Режим работы](#Режимы-работы)

##### `mimeMap`

*(Object) по-умолчанию: {}*

Список соответствий CSS-классов MIME-типам.
При добавлении файла, FileStyler создаёт элемент `.filestyler__item` с классами на основе MIME, в данном объекте задаются соответствия.
Если соответствие не найдено, класс генерируется автоматически вида `.filestyler__item_mime-type` (например для `.jpg` класс будет `.filestyler__item_image-jpeg`).

##### `plugins`

*(Array) по-умолчанию: все плагины*

Список используемых плагинов. По-умолчанию набор включённых плагинов зависит от самих плагинов.

##### `firstItemInsertBefore`

*(boolean|String) по-умолчанию: true*

Если файлов ещё нет, данная опция задаёт в какое место в списке `.filestyler__list` добавлять первый элемент. Возможны значения:

- `true` - добавлять в начало списка
- `false` - добавлять в конец списка
- `'.selector'` - добавлять перед элементом соответствующему указанному селектору

##### `fileSizeFormatter`

*(Function) по-умолчанию: FileStyler.fileSizeFormatter*

Функция форматирования размера файла. В функцию передаётся:

- `size` *(int)* - размер файла в байтах
- `list` *(Array)* - массив подписей определённых в опции [fileSizeLabels](#filesizelabels)

##### `fileSizeLabels`

*(Array) по-умолчанию: ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB']*

Набор подписей для форматирования размера файла.
 
##### `template`

*(Function) по-умолчанию: FileStyler.defaultTemplate*

Функция-шаблон создания элемента. Данная функция будет вызываться для получения HTML-шаблона элемента `.filestyler__item`.

Подробнее читайте в [шаблонах](#Шаблоны).

#### Опции плагина `image`

##### `supportedImages`

*(Array) по-умолчанию: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml']*

#### Опции плагина `sortHelper`

##### `sortHelper`

*(boolean|String|Function) по-умолчанию: false*

Задаёт атрибут `name` hidden-поля для организации работы плагина. Поддерживаются следующие типы значений:

- `false` - отключает плагин
- `true` - имя будет совпадать с именем `<input type="file">` 
- `'строка'` - задаёт имя
- `function(filestyler){}` - callback-функция получения имени

#### Опции плагина `drop`

##### `allowDropNoInput`

*(Array) по-умолчанию: ['base64', 'ajax']*

Список режимов, в котором возможно реализовать программную поддержку drag'n'drop, и поэтому разрешено делать drop не только непосредственно на `<input type="file">`, но и на `.filestyler__drop`.

##### `moveInputOnDrag`

*(boolean) по-умолчанию: true*

Включает поведение, при котором при начале drag'n'drop `<input type="file">` перемещается непосредственно в `.filestyler__drop` и помечается классом `.filestyler__drop-input`, затем при окончании drag'n'drop - возвращается обратно. Это позволяет реализовать поддержку drag'n'drop в режимах `default`, `add` и `byOne`.

#### Опции плагина `ajax`

##### `ajaxImmediately`

*(boolean) по-умолчанию: true*

Включает моментальную загрузку прикреплённых файлов. При выключенном состоянии отправка начнётся только после отправки всей формы.

##### `ajaxUrl`

*(boolean|String|Function) по-умолчанию: false*

Задаёт URL для отправки файлов. Возможны значения:

- `false` - URL будет такой же, как у формы в которой находится компонент
- `'строка'` - непосредственно задаёт URL
- `function(filestyler){}` - callback-функция получения URL

##### `responseProcessing`

*(String) по-умолчанию: 'value'*

Метод обработки ответа при успешной загрузке файла:

- `'value'` - ответ подставляется в качестве `value` hidden-поля
- `'replace'` - ответ интерпритируется как HTML и заменяет им hidden-поле

##### `simultaneousUploads`

*(Number) по-умолчанию: 1*

Количество одновременных загрузок.

##### `timeout`

*(Number|false) по-умолчанию: false*

Задаёт таймаут ожидания передачи данных.

### Поля экземпляра класса

##### `config`

*(Object)*

##### `plugins`

*(Object)*

Хранилище плагинов компонента.

##### `$element`

*(jQuery)*

DOM-элемент компонента `.filestyler`.

##### `$file`

*(jQuery)*

DOM-элемент первого `.filestyler__file`.

##### `$input`

*(jQuery)*

DOM-элемент текущего поля `<input type="file">` (Он может меняться в некоторых режимах).

##### `$list`

*(jQuery)*

DOM-элемент списка элементов `.filestyler__list`.

### Методы

#### Базовые

##### `removeItem(item)`

- `item` *(HTMLElement)* - элемент `.filestyler__item` для удаления

Удаляет элемент. Пользуйтесь данным методом только в тех режимах, которые поддерживают выборочное удаление.

##### `clear()`

Удаляет все элементы.

##### `destroy()`

Деинициализирует компонент.

### События

FileStyler генерирует кастомные DOM-события. Ниже в списке указывается цель (`e.target`) события, и список параметров события, которые можно получить (например, `e.files`).

#### Базовые

##### `filestylerInit`

*Цель `.filestyler`*

Событие генерируется после инициализации компонента.

##### `filestylerBeforeProcess`

*Цель `.filestyler`*

- `files` *(File[])* - список файлов
- `input` *(HTMLInputElement)* - связанный с файлами `<input type="file">`

Событие вызывается перед обработкой очередной порции файлов. Событие можно прервать (`e.preventDefault()`), тогда компонент остановит обрабатыватку этих файлов.

##### `filestylerProcess`

*Цель `.filestyler`*

- `files` *(File[])* - список файлов
- `input` *(HTMLInputElement)* - связанный с файлами `<input type="file">`

Событие вызывается после обработки очередной порции файлов.

##### `filestylerProcessItem`

*Цель `.filestyler`*

- `item` *(HTMLElement)* - DOM-элемент `.filestyler__item`
- `data` *(Object)* - данные (см. [шаблоны](#Шаблоны))
- `file` *(File)* - файл
- `input` *(HTMLInputElement)* - связанный с файлом `<input type="file">`

Событие генерируется после обработки файла, перед добавлением в DOM.

##### `filestylerItemAdd`

*Цель `.filestyler__item`*

- `item` *(HTMLElement)* - DOM-элемент `.filestyler__item`
- `file` *(File)* - файл
- `input` *(HTMLInputElement)* - связанный с файлом `<input type="file">`

Событие генерируется после добавление нового элемента файла в список.

##### `filestylerBeforeRemoveItem`

*Цель `.filestyler__item`*

- `item` *(HTMLElement)* - DOM-элемент `.filestyler__item`

Событие вызывается перед выборочным удалением файла. Событие можно прервать (`e.preventDefault()`), тогда файл не будет удалён.

##### `filestylerRemoveItem`

*Цель `.filestyler`*

- `item` *(HTMLElement)* - DOM-элемент `.filestyler__item`

Событие вызывается после выборочного удаления файла.

##### `filestylerBeforeClear`

*Цель `.filestyler`*

Событие вызывается перед удалением всех файлов. Событие можно прервать (`e.preventDefault()`), тогда удаление не будет произведено.

##### `filestylerClear`

*Цель `.filestyler`*

Событие вызывается после удаления всех файлов.

#### События плагина `image`

##### `filestylerImageLoad`

*Цель `.filestyler__item`*

- `item` *(HTMLElement)* - DOM-элемент `.filestyler__item`
- `url` *(String)* - Blob или data:URI URL картинки 

Событие генерируется после получения URL изображения (только для изображений).

#### События плагина `base64`

##### `filestylerBase64`

*Цель `.filestyler__item`*

- `item` *(HTMLElement)* - DOM-элемент `.filestyler__item`
- `url` *(String)* - data:URI данных 

Событие генерируется после получения data:URL файла.

#### События плагина `ajax`

##### `filestylerUploadStart`

*Цель `.filestyler__item`*

- `item` - *(HTMLElement)* - DOM-элемент `.filestyler__item`
- `file` - *(File)* - файл
- `input` - *(HTMLInputElement)* - связанный с файловый инпут

Событие генерируется при начале выгрузки файла на сервер.

##### `filestylerUploadProgress`

*Цель `.filestyler__item`*

- `item` - *(HTMLElement)* - DOM-элемент `.filestyler__item`
- `file` - *(File)* - файл
- `input` - *(HTMLInputElement)* - связанный с файловый инпут
- `lengthComputable` *(boolean)* - есть ли информация об объёме данных
- `loaded` *(Number)* - загружено байт
- `total` *(Number)* - всего байт

Событие генерируется в процессе выгрузки файлов на сервер. Событие можно прервать (`e.preventDefault()`), тогда стандартный функционал отображение прогресса не будет выполнен. 

##### `UploadDone`

*Цель `.filestyler__item`*

- `item` - *(HTMLElement)* - DOM-элемент `.filestyler__item`
- `file` - *(File)* - файл
- `input` - *(HTMLInputElement)* - связанный с файловый инпут
- `data` - *(String)* - ответ сервера

Событие генерируется после успешной загрузки файла. Событие можно прервать (`e.preventDefault()`), тогда стандартный функционал обработки ответ не будет выполнен.

##### `UploadFail`

*Цель `.filestyler__item`*

- `item` - *(HTMLElement)* - DOM-элемент `.filestyler__item`
- `file` - *(File)* - файл
- `input` - *(HTMLInputElement)* - связанный с файловый инпут

Событие генерируется после ошибки загрузки файла.

##### `UploadEnd`

*Цель `.filestyler__item`*

- `item` - *(HTMLElement)* - DOM-элемент `.filestyler__item`
- `file` - *(File)* - файл
- `input` - *(HTMLInputElement)* - связанный с файловый инпут

Событие генерируется после любого исхода загрузки файла.

##### `UploadComplete`

*Цель `.filestyler`*

Событие генерируется после окончания загрузки всех файлов. Событие можно прервать (`e.preventDefault()`), тогда если `ajaxImmediately = false` форма не будет отправлена.

### Шаблоны

FileStyler не навязывает какой-то определённой разметки, вся функциональность завязана на [CSS-классах](#css-классы).
Поэтому вы вольны менять как сам шаблон компонента, так и шаблон элемента/файла.
Шаблон компонента меняется непосредственно в HTML, а для того, чтобы изменить шаблон элемента/файла, вам необходимо передать в опцию `template` функцию-шаблон, которая возвратит строку с HTML.

В качестве данных в функцию-шаблон будет переданы следующие данные:

- `filestyler` *(FileStyler)* - экземпляр компонента
- `file` *(File)* - файл
- `fileSizeFormatted` *(string)* - отформатированный размер файла (см. [fileSizeFormatter](#filesizeformatter))
- `plugins` *(object)* - шаблоны плагинов

Плагины могут добавлять дополнительные данные:

- `isImage` *(boolean)* - является ли файл изображением (плагин `image`)
- `image` *(String)* - blob URL изображения, если в браузере есть поддержка Blob URLs (плагин `image`)
- `sortName` *(String)* - атрибут `name` для поля сортировки (плагин `sortHelper`)
- `sortValue` *(String)* - значение поля сортировки (плагин `sortHelper`)

По-умолчанию используется `FileStyler.defaultTemplate`, которая использует такой шаблон элемента:

```html
<div class="filestyler__item">
    {{plugins}}
    <div class="filestyler__info">
        <div class="filestyler__name">{{file.name}}</div>
        <div class="filestyler__size">{{fileSizeFormatted}}</div>
    </div>
    <button type="button" class="filestyler__remove"></button>
</div>
```

Где в `{{plugins}}` - выводятся все шаблоны плагинов:
 
```html
<!-- image plugin -->
<div class="filestyler__figure filestyler__image-bg"><img class="filestyler__image"/></div>

<!-- sortHelper plugin -->
<input type="hidden" class="filestyler__sort-helper" name="{{data.sortName}}" value="{{data.sortValue}}"/>

<!-- base64 plugin -->
<input type="hidden" name="{{data.filestyler.$input.attr('name')}}" class="filestyler__base64">

<!-- ajax plugin -->
<div class="filestyler__ajax-wrap">
    <input type="hidden" name="{{data.filestyler.$input.attr('name')}}" class="filestyler__ajax">
    <div class="filestyler__progress">
        <div class="filestyler__progress-bar">
            <div class="filestyler__progress-perc"></div>
        </div>
    </div>
</div>
```

### CSS-классы

Вся функциональность в компоненте завязана на CSS-классах `filestyler_*`, вы должны сохранить их для сохоранения функциональности.

База:

- `.filestyler` - корневой узел компонента
- `.filestyler_uninitialized` - неинициализированное состояние компонента. Может быть использован для стилизации компонента с [выключенной поддержкой javascript](#Функциональность-при-отключённом-javascript)
- `.filestyler_initialized` - инициализированное состояние компонента
- `.filestyler_empty` - пустое состояние компонента (нет файлов)
- `.filestyler_mode_{{mode}}` - класс с текущим режимом
- `.filestyler__list` - контейнер списка файлов
- `.filestyler__file` - элемент содержащий `<input type="file">`
- `.filestyler__input` - элемент `<input type="file">`
- `.filestyler__item` - элемент/файл
- `.filestyler__item_{{mime}}` - состояние элемента на основе MIME
- `.filestyler__remove` - удалить элемент
- `.filestyler__clear` - удалить все элементы
- `.filestyler__add` - кликабельный элемент для добавления файлов

Классы плагина `image`:

- `.filestyler__image` - картинке с данным классом будет задан src с url картинки
- `.filestyler__image-bg` - элементу с данным классом будет задан `background-image` с url картинки
- `.filestyler__item_is-image` - класс будет добавлен к `.filestyler__item`, если файл - картинка
- `.filestyler__item_is-no-image` - класс будет добавлен к `.filestyler__item`, если файл - не картинка

Классы плагина `sortHelper`:

- `.filestyler__sort-helper` - input-элементы с данным классом будут использованы для начальной инициализации счётчика

Классы плагина `drop`:

- `.filestyler__drop` - контейнер drag'n'drop
- `.filestyler__drop-input` - данный класс будет добавлен к input-элементу при начале drag'n'drop, при включённой опции [moveInputOnDrag](#moveinputondrag)
- `.filestyler__drop_hint` - класс добавится к `.filestyler__drop` при задействовании drag'n'drop на странице
- `.filestyler__drop_in` - класс добавится к `.filestyler__drop` при задействовании drag'n'drop на странице и нахождению курсора над контенером `.filestyler__drop` компонента

Классы плагина `base64`:

- `.filestyler__base64` - input-элементу с данным классом будет присвоено значение с содержимым файла, закодированным в base64

Классы плагина `ajax`:

- `.filestyler__item_pause` - класс будет добавлен к `.filestyler__item`, если файл ожидает отправки на сервер 
- `.filestyler__item_progress` - класс будет добавлен к `.filestyler__item`, если файл находится в процессе отправки 
- `.filestyler__item_done` - класс будет добавлен к `.filestyler__item`, если файл успешно отправлен
- `.filestyler__item_fail` - класс будет добавлен к `.filestyler__item`, если отправка файла не удалась
- `.filestyler__item_always` - класс будет добавлен к `.filestyler__item`, если отправка файла завершена, вне зависимости от результата
- `.filestyler__progress-bar` - элементу с данным классом в процессе загрузки будет задаваться соответствующая ширина в процентах
- `.filestyler__progress-perc` - элементу с данным классом в процессе загрузки будет задано содержимое с текущим процентом отправки файла

Классы при подключении filestyler.theme.css:

- `.filestyler_image` - добавьте класс к `.filestyler` для применения готового стиля загрузки картинок
- `.filestyler_list` - добавьте класс к `.filestyler` для применения готового стиля списка

## Функциональность при отключённом JavaScript

FileStyler поддерживает сохранение функциональности файловых инпутов при выключенном JavaScript. Если вам необходимо обеспечить поддержку множственного прикрепления файлов (атрибут `multiple`) в устаревших браузерах без поддержки этой функции, вы можете джобавить дополнительные элементы `.filestyler__file`:

```html
<div class="filestyler filestyler_uninitialized filestyler_image">
    <div class="filestyler__drop">
        <div class="filestyler__list">
            <button type="button" class="filestyler__clear"></button>
            <label class="filestyler__file filestyler__plus">
                <input type="file" name="file[]" multiple class="filestyler__input">
            </label>
        </div>
        <label class="filestyler__file">
            <input type="file" name="file[]" multiple class="filestyler__input">
        </label>
        <label class="filestyler__file">
            <input type="file" name="file[]" multiple class="filestyler__input">
        </label>
    </div>
</div>
```

## Произвольная сборка

Для произвольной сборки используйте `grunt` и свой `_config` файл сборки.
Для примера, смотрите на `src/js/filestyler-style-only/_config.js`.

Также вы можете модифицировать готовые стили используя SASS. Для этого импортируйте необходимые вам стили и подключите mixin с изменёнными настройками:

```scss
@import "~filestyler/src/sass/_image";
@import "~filestyler/src/sass/_list";

.filestyler_image {
  $config: (
    color-success: #0f0
  );
  @include filestyler__image($config);
}

.filestyler_list {
  $config: (
      list-img: none
    );
    @include filestyler__list($config);
}
```

Доступные опции смотрите в соответсвтующих файлах. Остальные модификации вы можете добиться переопределением стандартных стилей, например, высота картинок легко меняется с помощью `font-size`:

```css
.component .filestyler_image {
  font-size: 240px;
}
```

## Примеры

http://paulzi.ru/github/filestyler/docs/

## Поддержка браузерами

Базовый функционал библиотеки работает в большинстве старых браузерах - ie7+, firefox 3+, chrome.

Для поддержки конекретной функциональности, требуется поддержка технологий:

- для отображения типов/размеров файлов - требуется [File API](http://caniuse.com/#feat=fileapi).
- для отображения превью изображения - [Blob URLs](http://caniuse.com/#feat=bloburls) или [FileReader](http://caniuse.com/#feat=filereader)
- для base64 режима - [FileReader](http://caniuse.com/#feat=filereader)
- для AJAX отправки - [XHR2](http://caniuse.com/#feat=xhr2) (псевдо-поддержку можно осуществить, подключив [jquery-iframe-ajax](https://github.com/paulzi/jquery-iframe-ajax))
