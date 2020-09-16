var _supportMultiple = null;

/**
 * @returns {boolean}
 */
function supportMultiple() {
    if (_supportMultiple === null) {
        _supportMultiple = 'multiple' in document.createElement('input');
    }
    return _supportMultiple;
}

/**
 *
 * @param {jQuery} $element
 * @param {String} name
 * @param {Object} [data]
 * @returns {boolean}
 */
function trigger($element, name, data) {
    var event;
    event = $.Event(base + name);
    data && $.extend(event, data);
    $element.trigger(event);
    return event.isDefaultPrevented();
}

/**
 * @param {Event} e
 */
function onChangeHandler(e) {
    var filestyler = $(this).closest(baseClass).data(base);
    if (filestyler) {
        var files, input;
        input = e.target;
        files = input.files;
        if (typeof files === 'undefined') {
            files = [{ name: e.target.value.split('\\').pop() }];
        }
        filestyler.processFiles(files, input);
    }
}

/**
 * @param {Event} e
 */
function onRemoveHandler(e) {
    e.preventDefault();
    var filestyler = $(this).closest(baseClass).data(base);
    var $item = $(this).closest(itemClass);
    filestyler.removeItem($item[0]);
}

/**
 * @param {Event} e
 */
function onClearHandler(e) {
    e.preventDefault();
    var filestyler = $(this).closest(baseClass).data(base);
    filestyler.clear();
}

/**
 * @param {Event} e
 */
function onAddHandler(e) {
    e.preventDefault();
    var filestyler = $(this).closest(baseClass).data(base);
    filestyler.$input.trigger('click');
}

/**
 * @param {Object} config
 */
var FileStyler = function(config) {
    var $element, $file, $input, filestyler, i, mode, plugin, pluginName;
    filestyler = this;
    filestyler.config   = $.extend({}, FileStyler[def], config);
    filestyler.$element = $element = $(config.element);
    filestyler.$file    = $file    = $element.find(baseClass + '__file').slice(1).remove().addBack().first();
    filestyler.$input   = $input   = $file.find(baseClass + '__input');
    filestyler.$list    = $element.find(baseClass + '__list');

    mode = filestyler.config.mode;
    if (mode === 'byOne') {
        $input.removeAttr('multiple').prop('multiple', false);
        filestyler.cloneMode = 'item';
    }
    if (mode === 'add' || (mode === 'default' && !supportMultiple())) {
        filestyler.cloneMode = 'after';
    }

    // init plugins
    filestyler.plugins  = {};
    for (i = 0; i < filestyler.config.plugins.length; i++) {
        pluginName = filestyler.config.plugins[i];
        plugin     = FileStyler.plugins[pluginName];
        if (!plugin) {
            throw new Error('Plugin ' + pluginName + ' of FileStyler not found');
        }
        plugin = plugin.create(filestyler);
        if (plugin) {
            filestyler.plugins[pluginName] = plugin;
        }
    }

    $input.on('change', onChangeHandler);
    $element.on('click', baseClass + '__remove', onRemoveHandler);
    $element.on('click', baseClass + '__clear',  onClearHandler);
    $element.on('click', baseClass + '__add',    onAddHandler);
    $element
        .data(base, filestyler)
        .removeClass(base + '_uninitialized')
        .addClass(base + '_initialized')
        .addClass(base + '_mode_' + filestyler.config.mode);
    trigger($element, 'Init');
};

/**
 * @param {String} method
 * @param {Array} [args]
 */
FileStyler.prototype.callPlugins = function(method, args) {
    var filestyler = this;
    $.each(this.plugins, function(name, plugin) {
        if (plugin[method]) {
            var scope = $.isPlainObject(plugin) ? filestyler : plugin;
            plugin[method].apply(scope, args);
        }
    });
};

/**
 * @param {File[]} files
 * @param {HTMLInputElement} [input]
 */
FileStyler.prototype.processFiles = function(files, input) {
    var i, $item, $last, filestyler, beforeSelector;
    filestyler = this;

    if (trigger(filestyler.$element, 'BeforeProcess', {
            files: files,
            input: input
        })) {
        return;
    }
    beforeSelector = filestyler.config.firstItemInsertBefore;
    if (filestyler.config.mode === 'default' && supportMultiple()) {
        filestyler.$element.find(itemClass).remove();
    }
    filestyler.callPlugins('beforeProcess', [files, input]);

    for (i = 0; i < files.length; i++) {
        $item = filestyler.createItem(files[i], input);
        $last = filestyler.$element.find(itemClass).last();
        if ($last.length) {
            $last.after($item);
        } else {
            if (beforeSelector === true) {
                filestyler.$list.prepend($item);
            }
            if (beforeSelector === false) {
                filestyler.$list.append($item);
            }
            filestyler.$list.find(beforeSelector).before($item);
        }
        trigger($item, 'ItemAdd', {
            item:  $item[0],
            file:  files[i],
            input: input
        });
    }

    if (filestyler.cloneMode) {
        var $clone = filestyler.$input.clone(false).val('');
        filestyler.$input.addClass(base + '__hidden').after($clone);
        if (filestyler.cloneMode === 'item') {
            $item.append(filestyler.$input);
        } else {
            filestyler.$file.before(filestyler.$input);
        }
        filestyler.$input = $clone;
        $clone.on('change', onChangeHandler);
    }

    filestyler.$element.removeClass(base + '_empty');

    filestyler.callPlugins('afterProcess', [files, input]);
    trigger(filestyler.$element, 'Process', {
        files: files,
        input: input
    });
};

/**
 * @param {File} file
 * @param {HTMLInputElement} [input]
 * @returns {jQuery|HTMLElement}
 */
FileStyler.prototype.createItem = function(file, input) {
    var filestyler = this;

    // make data
    var data = {
        filestyler: filestyler,
        file: file,
        fileSizeFormatted: filestyler.config.fileSizeFormatter(file.size, filestyler.config.fileSizeLabels),
        plugins: {}
    };

    // processFile
    filestyler.callPlugins('processFile', [data, file, input]);

    // create item
    var $item = $(filestyler.config.template(data));
    $item.addClass(baseItem);
    if (file.type) {
        var mimeClass = filestyler.config.mimeMap[file.type];
        if (typeof mimeClass === 'undefined') {
            mimeClass = baseItem + '_' + file.type.replace(/[^\w\d_-]/g, '-');
        }
        $item.addClass(mimeClass);
    }

    // processItem
    filestyler.callPlugins('processItem', [$item[0], data, file, input]);
    trigger(filestyler.$element, 'ProcessItem', {
        item:  $item[0],
        data:  data,
        file:  file,
        input: input
    });

    return $item;
};

/**
 * @param {HTMLElement} item
 */
FileStyler.prototype.removeItem = function(item) {
    if (['default', 'add'].indexOf(this.config.mode) !== -1) {
        throw new Error('Mode "' + this.config.mode + '" does not support remove item');
    }
    if (trigger($(item), 'BeforeRemoveItem', {item: item})) {
        return;
    }
    this.callPlugins('removeItem', [item]);
    $(item).remove();
    this.$element.toggleClass(base + '_empty', this.$list.find(itemClass).length === 0);
    trigger(this.$element, 'RemoveItem', {item: item});
};

/**
 */
FileStyler.prototype.clear = function() {
    if (trigger(this.$element, 'BeforeClear')) {
        return;
    }
    this.callPlugins('clear', []);
    this.$element.find(itemClass).remove();
    this.$element.find(baseClass + '__input').filter(baseClass + '__hidden').remove();
    this.$input.val('');
    this.$element.addClass(base + '_empty');
    trigger(this.$element, 'Clear');
};

/**
 */
FileStyler.prototype.destroy = function() {
    var filestyler, $element;
    filestyler = this;
    $element = filestyler.$element;
    filestyler.callPlugins('destroy', []);
    filestyler.$input.off('change', onChangeHandler);
    $element.off('click', baseClass + '__remove', onRemoveHandler);
    $element.off('click', baseClass + '__clear',  onClearHandler);
    $element.off('click', baseClass + '__add',    onAddHandler);
    $element
        .removeData(base)
        .addClass(base + '_uninitialized')
        .removeClass(base + '_initialized')
        .removeClass(base + '_mode_' + filestyler.config.mode);
};

/**
 * @param {Number} size
 * @param {Array} list
 * @returns {String}
 */
FileStyler.fileSizeFormatter = function(size, list) {
    for (var i = 0; i < list.length; i++) {
        if (size < 1024 || i === list.length - 1) {
            return Math.round(size) + ' ' + list[i];
        }
        size = size / 1024;
    }
    return '';
};

/**
 * @param {File|Object} data
 * @returns {Element}
 */
FileStyler.defaultTemplate = function(data) {
    var $result, $info;
    $result = $('<div>');
    $.each(data.plugins, function(i, element) {
        $result.append(element);
    });
    $info = $('<div>').addClass(base + '__info').appendTo($result);
    $('<div>').addClass(base + '__name').append(data.file.name).appendTo($info);
    if (typeof data.file.size !== 'undefined') {
        $('<div>').addClass(base + '__size').append(data.fileSizeFormatted).appendTo($info);
    }
    if (typeof data.file.type !== 'undefined') {
        $('<div>').addClass(base + '__type').append(data.file.type).appendTo($info);
    }
    $('<button type="button">').addClass(base + '__remove').appendTo($result);
    return $result[0];
};

/**
 * @param {String} name
 * @param {Object} plugin
 * @param {boolean} [isDefault]
 */
FileStyler.registerPlugin = function(name, plugin, isDefault) {
    FileStyler.plugins[name] = plugin;
    if (isDefault) {
        FileStyler[def].plugins.push(name);
    }
};

/**
 * @type {Object}
 */
FileStyler.plugins = {};

/**
 * @type {boolean}
 */
FileStyler.autoInit = true;

/**
 * @type {Object}
 */
FileStyler[def] = {
    mode: 'add',
    mimeMap: {},
    plugins: [],
    firstItemInsertBefore: true,
    template: FileStyler.defaultTemplate,
    fileSizeFormatter: FileStyler.fileSizeFormatter,
    fileSizeLabels: ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB']
};

window.FileStyler = FileStyler;