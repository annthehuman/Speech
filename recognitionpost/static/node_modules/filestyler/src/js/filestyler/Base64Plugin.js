var Base64Plugin = {
    /**
     */
    create: function() {
        return Base64Plugin;
    },

    /**
     * @param {Object} data
     */
    processFile: function(data) {
        var filestyler = this;
        if (filestyler.config.mode === 'base64') {
            data.isBase64 = true;
            var name = data.filestyler.$input.attr('name');
            data.plugins.base64 = Base64Plugin.template(name);
        }
    },

    /**
     * @param {HTMLElement} item
     * @param {Object} data
     * @param {File} file
     */
    processItem: function(item, data, file) {
        if (data.isBase64) {
            if (!window.FileReader) {
                throw new Error('FileStyler base64 mode not supported');
            }
            var fileReader;
            fileReader = new FileReader();
            fileReader.onloadend = function() {
                if (!trigger($(item), 'Base64', {
                        item: item,
                        data: fileReader.result
                    })) {
                    $(item).find(baseClass + '__base64').val(fileReader.result);
                }
            };
            fileReader.readAsDataURL(file);
        }
    },

    /**
     */
    afterProcess: function() {
        var filestyler = this;
        if (filestyler.config.mode === 'base64') {
            filestyler.$input.val('');
        }
    },

    /**
     * @param {String} name
     * @returns {String}
     */
    template: function(name) {
        return '<input type="hidden" name="' + name + '" class="' + base + '__base64">';
    }
};

FileStyler.registerPlugin('base64', Base64Plugin, true);