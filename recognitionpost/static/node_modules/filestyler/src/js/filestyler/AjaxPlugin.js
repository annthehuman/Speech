/**
 * @param {FileStyler} filestyler
 */
function AjaxPlugin(filestyler) {
    this.iframe     = !window.FormData;
    this.filestyler = filestyler;
    this.queue      = [];
    this.threads    = [];
    if (this.iframe) {
        filestyler.cloneMode = 'after';
        filestyler.$input.removeAttr('multiple').prop('multiple', false);
    }
    this.registerSubmitHandler();
}

/**
 * @param {FileStyler} filestyler
 * @returns {Object}
 */
AjaxPlugin.create = function(filestyler) {
    return new AjaxPlugin(filestyler);
};

/**
 */
AjaxPlugin.prototype.registerSubmitHandler = function() {
    var form = this.filestyler.$input.prop('form');
    var that = this;
    this.onSubmitHandler = function(e) {
        var inProgress = that.queue.length > 0;
        for (var i = 0; i < that.threads.length; i++) {
            if (that.threads[i]) {
                inProgress = true;
            }
        }
        if (inProgress) {
            e.preventDefault();
            that.processQueue();
        }
    };
    $(form).on('submit', this.onSubmitHandler);
};

/**
 * @param {Object} data
 */
AjaxPlugin.prototype.processFile = function(data) {
    if (this.filestyler.config.mode === 'ajax') {
        data.isAjax = true;
        var name = data.filestyler.$input.attr('name');
        data.plugins.ajax = AjaxPlugin.template(name);
    }
};

/**
 * @param {HTMLElement} item
 * @param {Object} data
 * @param {File} file
 * @param {HTMLInputElement} [input]
 */
AjaxPlugin.prototype.processItem = function(item, data, file, input) {
    if (data.isAjax) {
        $(item).addClass(baseItem + '_pause');
        this.queue.push({
            item:  item,
            file:  file,
            input: input
        });
    }
};

/**
 */
AjaxPlugin.prototype.afterProcess = function() {
var filestyler = this.filestyler;
    if (filestyler.config.mode === 'ajax') {
        if (!this.iframe) {
            filestyler.$input.val('');
        }
        if (filestyler.config.ajaxImmediately) {
            this.processQueue();
        }
    }
};

/**
 * @param {HTMLElement} element
 */
AjaxPlugin.prototype.removeItem = function(element) {
    var i, thread;
    this.queue = this.queue.filter(function(item) {
        return item.item !== element;
    });
    for (i = 0; i < this.threads.length; i++) {
        thread = this.threads[i];
        if (thread && thread.item === element) {
            thread.$xhr.abort();
        }
    }
    this.processQueue();
};

/**
 */
AjaxPlugin.prototype.clear = function() {
    var i, thread;
    this.queue = [];
    for (i = 0; i < this.threads.length; i++) {
        thread = this.threads[i];
        if (thread) {
            thread.$xhr.abort();
        }
    }
};

/**
 */
AjaxPlugin.prototype.processQueue = function() {
    var items, i;
    for (i = 0; i < this.filestyler.config.simultaneousUploads; i++) {
        if (!this.threads[i]) {
            items = this.queue.splice(0, 1);
            if (items.length) {
                this.threads[i] = this.upload(items[0], i);
            }
        }
    }
};

/**
 * @returns {String}
 */
AjaxPlugin.prototype.getUrl = function() {
    var filestyler = this.filestyler;
    var urlConfig = filestyler.config.ajaxUrl;
    if (typeof urlConfig === 'string') {
        return urlConfig;
    }
    if (typeof urlConfig === 'function') {
        return urlConfig(filestyler);
    }
    return filestyler.$element.closest('form').attr('action');
};

/**
 * @param {Object} item
 * @param {Number} thread
 */
AjaxPlugin.prototype.upload = function(item, thread) {
    var that, filestyler, options, $item, $bar, $barPerc;
    that = this;
    filestyler = this.filestyler;
    options = {
        url: this.getUrl(),
        method: 'post'
    };
    if (filestyler.config.timeout !== false) {
        options.timeout = filestyler.config.timeout;
    }

    $item = $(item.item);
    $bar = $item.find(baseClass + '__progress-bar');
    $barPerc = $item.find(baseClass + '__progress-perc');

    if (this.iframe) {
        options.data    = {name: filestyler.$input.attr('name')};
        options.files   = [item.input];
        options.iframe  = true;
        item.input.name = 'file[]';
        $(item.input).remove();
    } else {
        var formData = new FormData();
        formData.append('file[]', item.file);
        formData.append('name',   filestyler.$input.attr('name'));
        options.data        = formData;
        options.processData = false;
        options.contentType = false;
        options.xhr = function() {
            var xhr = $.ajaxSettings.xhr();
            if (xhr.upload && xhr.upload.addEventListener) {
                xhr.upload.addEventListener('progress', function(e) {
                    var prevented;
                    prevented = trigger($item, 'UploadProgress', $.extend({}, item, {
                        lengthComputable: e.lengthComputable,
                        loaded: e.loaded,
                        total: e.total
                    }));
                    if (!prevented && e.lengthComputable) {
                        $bar.css('width', (e.loaded / e.total * 100) + '%');
                        $barPerc.html(Math.round(e.loaded / e.total * 100) + '%');
                    }
                });
            }
            return xhr;
        };
    }

    if (trigger($item, 'UploadStart', item)) {
        return item;
    }
    $item.removeClass(baseItem + '_pause').addClass(baseItem + '_progress');
    item.$xhr = $.ajax(options)
        .done(function(data) {
            var $target, prevented;
            $target = $item.find(baseClass + '__ajax');
            prevented = trigger($item, 'UploadDone', $.extend({}, item, { data: data }));
            if (!prevented) {
                if (filestyler.config.responseProcessing === 'replace') {
                    $target.replaceWith(data);
                } else {
                    $target.val(data);
                }
                $item.removeClass(baseItem + '_progress').addClass(baseItem + '_done');
            }
        })
        .fail(function() {
            $item.removeClass(baseItem + '_progress').addClass(baseItem + '_fail');
            trigger($item, 'UploadFail', item);
        })
        .always(function() {
            that.threads[thread] = false;
            $item.addClass(baseItem + '_always');
            trigger($item, 'UploadEnd', item);
            if (that.queue.length) {
                that.processQueue();
            } else {
                if (!trigger(filestyler.$element, 'UploadComplete')) {
                    if (!filestyler.config.ajaxImmediately) {
                        var form = filestyler.$input.prop('form');
                        $(form).trigger('submit');
                    }
                }
            }
        });

    return item;
};

/**
 */
AjaxPlugin.prototype.destroy = function() {
    this.clear();
    var form = this.filestyler.$input.prop('form');
    $(form).off('submit', this.onSubmitHandler);
};

/**
 * @param {String} name
 * @returns {String}
 */
AjaxPlugin.template = function(name) {
    var input, progress;
    input    = '<input type="hidden" name="' + name + '" class="' + base + '__ajax">';
    progress = '<div class="' + base + '__progress"><div class="' + base + '__progress-bar"><div class="' + base + '__progress-perc"></div></div>';
    return '<div class="' + base + '__ajax-wrap">' + input + progress + '</div>';
};


FileStyler.registerPlugin('ajax', AjaxPlugin, true);

$.extend(FileStyler[def], {
    ajaxImmediately: true,
    ajaxUrl: false,
    responseProcessing: 'value',
    simultaneousUploads: 1,
    timeout: false
});