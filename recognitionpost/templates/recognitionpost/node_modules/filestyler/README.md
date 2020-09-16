# FileStyler

[![NPM version](http://img.shields.io/npm/v/filestyler.svg?style=flat)](https://www.npmjs.org/package/filestyler)
![Bower version](http://img.shields.io/bower/v/filestyler.svg?style=flat)

File input styling plugin with ajax upload support.

[Russian readme](https://github.com/paulzi/filestyler/blob/master/README.ru.md)

## Install

Install via NPM:

```sh
npm install filestyler
```

Install via Bower:

```sh
bower install filestyler
```

Or install manually.

### Include

Include the script to the page after include jQuery:

```html
<script src="/node_modules/jquery/dist/jquery.min.js"></script>
<script src="/node_modules/jquery-iframe-ajax/dist/jquery-iframe-ajax.min.js"></script>
<script src="/node_modules/filestyler/dist/filestyler.min.js"></script>
```

Note: use [jquery-iframe-ajax](https://github.com/paulzi/jquery-iframe-ajax) if you need support for ajax-upload (see option `mode`) in older browsers that do not support [XHR2](http://caniuse.com/#feat=xhr2) (for example, IE9).

or use your own module build system (support AMD and CommonJS).

*Note: you can use a lightweight build without base64 and ajax plugins - `filestyler-style-only.min.js`*

Include the component styles to the tag `head`:

```html
<link rel="stylesheet" href="/node_modules/filestyler/dist/filestyler.min.css">
<link rel="stylesheet" href="/node_modules/filestyler/dist/filestyler-theme.min.css">
```

*Warning: `filestyler-theme` contains ready styles for the list and image view of component. They are not required for use - you can write and use your styles.*

## Usage

This is an example of component markup (you can [change it at your discretion](#templates)):

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

If you did not change option `FileStyler.autoInit`, this component is automatically initialized with the options specified in the attribute `data-filestyler` as JSON. Otherwise, initialize the component:

```javascript
$('.filestyler').filestyler({});
```

## Modes

FileStyler supports several modes - from simple styling, to ajax file uploads:

### `mode: 'default'`

The mode at which the standard browser behavior of the `<input type="file">` element is completely preserved, namely, when you repeat select files - previous selection will be canceled.

Drag'n'drop will work only in browsers that support this natively on the `<input type="file">`. To extend the drop zone, use the [moveInputOnDrag](#moveinputondrag) option.

Selective deletion of the files is not supported in this mode.

The sorting of files is possible only using [sortHelper plugin](#built-in-plugins).

The only difference from standard behavior is that if the browser does not support the `multiple` attribute, FileStyler will act as a polyfill by switching mode to `add`.

### `mode: 'add'`

The mode is similar to the previous (default), with one difference. A new selection of files is added to previously selected files without overwriting them.

### `mode: 'byOne'`

The `byOne` mode disable the `multiple` attribute of the input, while keeping multiple uploading. Thus, in order for attach multiple files, you must attach them one at a time (there is no possibility to select multiple files in the file selection dialog box).

Drag'n'drop works the same way as in `default` mode. But selective deletion of files and re-sorting are fully supported.

### `mode: 'base64'`

In this mode, all attached files are converted to `<input type="hidden">` with the contents of the files in base64 encoding. Because of this, there is no need to change the `enctype` attribute of the form, and the files are transferred to the server by regular strings. However, additional processing of the received data on the server-side is required.

In this mode, drag'n'drop is fully supported, selective deletion of files and re-sorting.

### `mode: 'ajax'`

In `ajax` mode, files will be sent to the server via AJAX separately from the main form. This makes it possible to display the progress of uploading files to the server. However, on the server-side, you will also need to develop additional functions for linking separately sent files and form.

In this mode, drag'n'drop is fully supported, selective deletion of files and re-sorting.

AJAX uploading is supported by browsers that support [XHR2](http://caniuse.com/#feat=xhr2), for old browsers you can use [jquery-iframe-ajax](https://github.com/paulzi/jquery-iframe-ajax).

If you want to send the entire form via AJAX, you can use [paulzi-form](https://github.com/paulzi/paulzi-form).

### Summary table

| Function             | default | add | byOne | base64 | ajax |
|----------------------|:-------:|:---:|:-----:|:------:|:----:|
| multiple select      |    +    |  +  |   -   |   +    |  +   |
| Selective deletion   |    -    |  -  |   +   |   +    |  +   |
| Re-sorting           |    *1   |  *1 |   +   |   +    |  +   |
| Drag'n'drop          |    *2   |  *2 |   *2  |   +    |  +   |
| Standard submission  |    +    |  +  |   +   |   -    |  -   |

- *1 - sorting is possible by [sortHelper plugin](#built-in-plugins)
- *2 - only in browsers with native drag'n'drop support on `<input type="file">`

*Note: under sorting support, we mean the very possibility to change the order of the `.filestyler__item` elements with the corresponding change in order in the data sent to the server. The functionality of changing the order of elements in the user interface is not implemented by this library. Use for this purpose third-party libraries, for example, [RubaXa/Sortable](https://github.com/RubaXa/Sortable).*


### Built-in plugins

- `image` - displays the thumbnail of the attached image
- `sortHelper` - adds to the elements a hidden-field with a increasing counter, due to this on the server-side it is possible to organize re-sorting of elements
- `drop` - drag'n'drop support
- `base64` - mode `base64`
- `ajax` - mode `ajax`

## Documentation

### Get filestyler instance and properties

An instance of the FileStyler class is stored in jQuery data:

```javascript
var filestyler = $('.example-form .filestyler').data('filestyler');
filestyler.clear();
```

### Options

#### Basic

##### `mode`

*(String) default: 'add'*

[Mode](#modes)

##### `mimeMap`

*(Object) default: {}*

Map of CSS class matches for MIME types.
When you add a file, FileStyler creates a `.filestyler__item` element with classes based on MIME, in this object, matches are specified.
If no match is found, the class is automatically generated in the format `.filestyler__item_mime-type` (for example for `.jpg` the css-class will be `.filestyler__item_image-jpeg`).

##### `plugins`

*(Array) default: all*

List of used plugins. By default, the set of included plug-ins depends on the plugins themselves.

##### `firstItemInsertBefore`

*(boolean|String) default: true*

If in component are no files yet, this option define the place in the list `.filestyler__list` to add the first element. The possible values are:

- `true` - add to the begin
- `false` - add to the end
- `'.selector'` - add before specified selector element

##### `fileSizeFormatter`

*(Function) default: FileStyler.fileSizeFormatter*

Function of formatting the file size. The following parameters are passed to the function:

- `size` *(int)* - file size in bytes
- `list` *(Array)* - array of labels defined in the option [fileSizeLabels](#filesizelabels)

##### `fileSizeLabels`

*(Array) default: ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB']*

A set of labels for formatting the file size.
 
##### `template`

*(Function) default: FileStyler.defaultTemplate*

Template function for creating an element. This function will be called to get the HTML of element `.filestyler__item`.

Read more in [templates](#templates).

#### `image` plugin options

##### `supportedImages`

*(Array) default: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml']*

#### `sortHelper` plugin options

##### `sortHelper`

*(boolean|String|Function) default: false*

Specifies the attribute `name` of hidden field for the organization of the plugin. The following types of values are supported:

- `false` - disable sortHelper
- `true` - the name will be the same as `<input type="file">` 
- `'string'` - set name by string
- `function(filestyler){}` - callback-function to get a name

#### `drop` plugin options

##### `allowDropNoInput`

*(Array) default: ['base64', 'ajax']*

List of modes in which it is possible to implement software support for drag'n'drop, and therefore it is allowed to do drop not only directly to `<input type="file">`, but also to `.filestyler__drop`.

##### `moveInputOnDrag`

*(boolean) default: true*

Includes a behavior where when you start drag'n'drop `<input type="file">` it moves directly to `.filestyler__drop` and is marked by the class `.filestyler__drop-input`, then at the end of drag'n'drop - it returns. This allows you to implement drag'n'drop support in `default`,` add` and `byOne` modes.

#### `ajax` plugin options

##### `ajaxImmediately`

*(boolean) default: true*

Enables instant uploading of attached files. When the state is off, sending will start only after the entire form has been submit.

##### `ajaxUrl`

*(boolean|String|Function) default: false*

Specifies the URL for upload. The possible values are:

- `false` - URL will be the same as the form in which the component is located
- `'string'` - directly sets the URL
- `function(filestyler){}` - callback-function to get URL

##### `responseProcessing`

*(String) default: 'value'*

The method of processing the response when the file was successfully uploaded:

- `'value'` - response is set `value` of hidden field
- `'replace'` - response is interpreted as HTML and replaces it hidden-field

##### `simultaneousUploads`

*(Number) default: 1*

The number of simultaneous uploads.

##### `timeout`

*(Number|false) default: false*

Specifies the timeout for data transfer.

### FileStyler fields

##### `config`

*(Object)*

##### `plugins`

*(Object)*

Plugin storage.

##### `$element`

*(jQuery)*

DOM-element of component `.filestyler`.

##### `$file`

*(jQuery)*

DOM-element of first `.filestyler__file`.

##### `$input`

*(jQuery)*

DOM-current field element `<input type="file">` (It can change in some modes).

##### `$list`

*(jQuery)*

DOM-element of list `.filestyler__list`.

### Methods

#### Basic

##### `removeItem(item)`

- `item` *(HTMLElement)* - element `.filestyler__item` for removing

Delete the item. Use this method only in those modes that support selective deletion.

##### `clear()`

Clear all items.

##### `destroy()`

Destroy the component.

### Events

FileStyler generates custom DOM events. In the list specifies the target (`e.target`) of the event, and a list of event parameters (for example,` e.files`).

#### Basic

##### `filestylerInit`

*Target `.filestyler`*

The event is generated after the component is initialized.

##### `filestylerBeforeProcess`

*Target `.filestyler`*

- `files` *(File[])* - list of files
- `input` *(HTMLInputElement)* - related `<input type="file">`

The event trigger before processing the next portion of the files. The event can be aborted (`e.preventDefault()`), then the component will stop processing these files.

##### `filestylerProcess`

*Target `.filestyler`*

- `files` *(File[])* - list of files
- `input` *(HTMLInputElement)* - related `<input type="file">`

The event trigger after processing the next portion of the files.

##### `filestylerProcessItem`

*Target `.filestyler`*

- `item` *(HTMLElement)* - DOM-element of `.filestyler__item`
- `data` *(Object)* - data (see [templating](#templates))
- `file` *(File)* - file
- `input` *(HTMLInputElement)* - related `<input type="file">`

The event is trigger after the file is processed, before being added to the DOM.

##### `filestylerItemAdd`

*Target `.filestyler__item`*

- `item` *(HTMLElement)* - DOM-element of `.filestyler__item`
- `file` *(File)* - file
- `input` *(HTMLInputElement)* - related `<input type="file">`

The event is trigger after adding a new file item to the list.

##### `filestylerBeforeRemoveItem`

*Target `.filestyler__item`*

- `item` *(HTMLElement)* - DOM-element of `.filestyler__item`

The event is trigger before the selective deletion of the file. The event can be aborted (`e.preventDefault()`), then the file will not be deleted.

##### `filestylerRemoveItem`

*Target `.filestyler`*

- `item` *(HTMLElement)* - DOM-element of `.filestyler__item`

The event is called after a selective deletion of the file.

##### `filestylerBeforeClear`

*Target `.filestyler`*

The event is triger before all files are clear. The event can be aborted (`e.preventDefault()`), then the clear will not be performed.

##### `filestylerClear`

*Target `.filestyler`*

The event is trigger after all files have been cleared.

#### `image` plugin events

##### `filestylerImageLoad`

*Target `.filestyler__item`*

- `item` *(HTMLElement)* - DOM-element of `.filestyler__item`
- `url` *(String)* - Blob or data:URI URL of image 

The event is generated after the image URL is received (only for images).

#### `base64` plugin events

##### `filestylerBase64`

*Target `.filestyler__item`*

- `item` *(HTMLElement)* - DOM-element of `.filestyler__item`
- `url` *(String)* - data:URI data 

The event is trigger after the data:URI of the file is received.

#### `ajax` plugin events

##### `filestylerUploadStart`

*Target `.filestyler__item`*

- `item` - *(HTMLElement)* - DOM-element of `.filestyler__item`
- `file` - *(File)* - file
- `input` - *(HTMLInputElement)* - related file input

The event is trigger when the file is uploaded to the server.

##### `filestylerUploadProgress`

*Target `.filestyler__item`*

- `item` - *(HTMLElement)* - DOM-element of `.filestyler__item`
- `file` - *(File)* - file
- `input` - *(HTMLInputElement)* - related file input
- `lengthComputable` *(boolean)* - is there information about data length
- `loaded` *(Number)* - bytes loaded
- `total` *(Number)* - bytes total

The event is trigger when files are uploading progress to the server. The event can be aborted (`e.preventDefault()`), then the standard functionality of the progress display will not be executed.

##### `UploadDone`

*Target `.filestyler__item`*

- `item` - *(HTMLElement)* - DOM-element of `.filestyler__item`
- `file` - *(File)* - file
- `input` - *(HTMLInputElement)* - related file input
- `data` - *(String)* - response content

The event is trigger after a successful file download. The event can be aborted (`e.preventDefault()`), then the standard processing functionality of the response will not be executed.

##### `UploadFail`

*Target `.filestyler__item`*

- `item` - *(HTMLElement)* - DOM-element of `.filestyler__item`
- `file` - *(File)* - file
- `input` - *(HTMLInputElement)* - related file input

The event is trigger after an error uploading the file.

##### `UploadEnd`

*Target `.filestyler__item`*

- `item` - *(HTMLElement)* - DOM-element of `.filestyler__item`
- `file` - *(File)* - file
- `input` - *(HTMLInputElement)* - related file input

The event is generated after any outcome of the file upload.

##### `UploadComplete`

*Target `.filestyler`*

The event is trigger when all files have been uploaded. The event can be aborted (`e.preventDefault()`), then if `ajaxImmediately = false` the form is not submit.

### Templates

FileStyler does not impose any specific markup, all functionality is tied to [CSS-classes](#css-classes).

Therefore, you are free to change both the component template and the item/file template.
The component template changes directly in HTML, and in order to change the item/file template, you need to pass a template function to the `template` option, which will return a string with HTML.

The following data will be transferred to the template function as data:

- `filestyler` *(FileStyler)* - FileStyler instance
- `file` *(File)* - file
- `fileSizeFormatted` *(string)* - formatted file size (see [fileSizeFormatter](#filesizeformatter))
- `plugins` *(object)* - plugin templates

Plugins can add additional data:

- `isImage` *(boolean)* - whether the file is an image (`image` plugin)
- `image` *(String)* - blob URL image, if browser support Blob URLs (`image` plugin)
- `sortName` *(String)* - the `name` attribute for the sort field (`sortHelper` plugin)
- `sortValue` *(String)* - value of sort field (`sortHelper` plugin)

The default is `FileStyler.defaultTemplate`, which uses this element template:

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

Where in `{{plugins}}` - all plugin templates are displayed:
 
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

### CSS-classes

All functionality of component is linked to the CSS classes `filestyler_ *`, you must save them to save the functionality.

Basic:

- `.filestyler` - root of component
- `.filestyler_uninitialized` - uninitialized state of the component. Can be used to stylize a component with [disabled javascript](#functionality-when-javascript-is-disabled)
- `.filestyler_initialized` - initialized state of the component
- `.filestyler_empty` - empty component state (no files)
- `.filestyler_mode_{{mode}}` - class with current mode
- `.filestyler__list` - file list container
- `.filestyler__file` - element containing `<input type="file">`
- `.filestyler__input` - element `<input type="file">`
- `.filestyler__item` - item/file
- `.filestyler__item_{{mime}}` - element state based on MIME
- `.filestyler__remove` - remove item
- `.filestyler__clear` - clear all items
- `.filestyler__add` - clickable item to add files

`image` plugin classes:

- `.filestyler__image` - image with this class will be set src with url of image
- `.filestyler__image-bg` - element with this class will be set `background-image` with url of image
- `.filestyler__item_is-image` - class will be add to `.filestyler__item`, if the file is image
- `.filestyler__item_is-no-image` - class will be add to `.filestyler__item`, if the file is no image

`sortHelper` plugin classes:

- `.filestyler__sort-helper` - input-elements with this class will be used for the initial initialization of the counter

`drop` plugin classes:

- `.filestyler__drop` - drag'n'drop container
- `.filestyler__drop-input` - class will be add to input-element when start drag'n'drop, with enabled option [moveInputOnDrag](#moveinputondrag)
- `.filestyler__drop_hint` - class will be add to `.filestyler__drop` when user start drag'n'drop on the page
- `.filestyler__drop_in` - class will be add to `.filestyler__drop` when user start drag'n'drop and cursor hover on `.filestyler__drop`

`base64` plugin classes:

- `.filestyler__base64` - input-element with this class will be set value with the contents of the file encoded in base64

`ajax` plugin classes:

- `.filestyler__item_pause` - class will be add to `.filestyler__item`, if the file is waiting to upload on server 
- `.filestyler__item_progress` - class will be add to `.filestyler__item`, if the file is in progress to upload 
- `.filestyler__item_done` - class will be add to `.filestyler__item`, if the file was upload successfully
- `.filestyler__item_fail` - class will be add to `.filestyler__item`, if uploading the file failed
- `.filestyler__item_always` - class will be add to `.filestyler__item`, if the upload file is complete, regardless of the result
- `.filestyler__progress-bar` - element with this class in the process of uploading, the corresponding width in percent will be set
- `.filestyler__progress-perc` - element with this class during the upload will be set to the content with the current percentage of uploading the file

filestyler.theme.css classes:

- `.filestyler_image` - add class to `.filestyler` to use the ready image-view style of component
- `.filestyler_list` - add class to `.filestyler` to use the ready list-view style of component

## Functionality when JavaScript is disabled

FileStyler supports functionality of file-inputs when JavaScript is disabled. If you need to provide support for multiple attachments of files (the `multiple` attribute) in legacy browsers without supporting this function, you can add additional `.filestyler__file` elements:

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

## Custom build

For custom build, use `grunt` and your `_config` file.
See example in `src/js/filestyler-style-only/_config.js`.

Also you can modify the ready styles using SASS. To do this, import the styles you need and include mixin with the changed config:

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

See src files for the available options. The rest of the modifications can be applied by overriding the standard styles, for example, the height of the pictures is easily changed with `font-size`:

```css
.component .filestyler_image {
  font-size: 240px;
}
```

## Examples

http://paulzi.ru/github/filestyler/docs/

## Browser support

Basic functionality of library works in most older browsers - ie7+, firefox 3+, chrome.

To support specific functionality, technology support is required:

- to display file types/sizes - required [File API](http://caniuse.com/#feat=fileapi).
- to display the preview image - [Blob URLs](http://caniuse.com/#feat=bloburls) или [FileReader](http://caniuse.com/#feat=filereader)
- for base64 mode - [FileReader](http://caniuse.com/#feat=filereader)
- for AJAX mode - [XHR2](http://caniuse.com/#feat=xhr2) (pseudo-support can be added by including [jquery-iframe-ajax](https://github.com/paulzi/jquery-iframe-ajax))
