var ImagePlugin = {

    /**
     */
    create: function() {
        return ImagePlugin;
    },

    /**
     * @param {Object} data
     * @param {File} file
     */
    processFile: function(data, file) {
        var filestyler = this;
        data.isImage = !!(file.type && $.inArray(file.type, filestyler.config.supportedImages) !== -1);
        if (data.isImage) {
            var urlCreator;
            urlCreator = window.URL || window.webkitURL;
            if (urlCreator) {
                data.image = urlCreator.createObjectURL(file);
            }
            data.plugins.image = ImagePlugin.template();
        }
    },

    /**
     * @param {HTMLElement} item
     * @param {Object} data
     * @param {File} file
     */
    processItem: function(item, data, file) {
        var process = function(url) {
            var $item = $(item);
            if (!trigger($item, 'ImageLoad', {
                item: item,
                url:  url
            })) {
                $item.find(baseClass + '__image-bg').css('background-image', 'url(' + url + ')');
                $item.find(baseClass + '__image').attr('src', url);
            }
        };

        $(item).toggleClass(baseItem + '_is-image', data.isImage).toggleClass(baseItem + '_is-no-image', !data.isImage);

        if (data.image) {
            process(data.image);
        } else if (data.isImage && window.FileReader) {
            var fileReader = new FileReader();
            fileReader.onloadend = function() {
                process(fileReader.result);
            };
            fileReader.readAsDataURL(file);
        }
    },

    /**
     * @returns {String}
     */
    template: function() {
        return '<div class="' + base + '__figure ' + base + '__image-bg"><img class="' + base + '__image"/></div>';
    }
};

FileStyler.registerPlugin('image', ImagePlugin, true);
FileStyler[def].supportedImages = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml'];