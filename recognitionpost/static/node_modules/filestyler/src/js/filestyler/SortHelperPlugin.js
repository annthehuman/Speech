var SortHelperPlugin = {
    /**
     */
    create: function() {
        return SortHelperPlugin;
    },

    /**
     * @param {FileStyler} filestyler
     * @returns {String}
     */
    getName: function (filestyler) {
        var helper = filestyler.config.sortHelper;
        if (helper === true) {
            return filestyler.$input.attr('name');
        }
        if (typeof helper === 'string') {
            return helper;
        }
        if (typeof helper === 'function') {
            return helper(filestyler);
        }
        return null;
    },

    /**
     * @param {Object} data
     */
    processFile: function(data) {
        var filestyler = this;
        if (filestyler.config.sortHelper) {
            var index = filestyler.sortIndex;
            if (typeof index === 'undefined') {
                var max = -1;
                filestyler.$list.find(baseClass + '__sort-helper').each(function() {
                    var v = parseInt(this.value, 10) || 0;
                    max = v > max ? v : max;
                });
                index = max;
            }
            filestyler.sortIndex = index + 1;
            data.sortName  = SortHelperPlugin.getName(filestyler);
            data.sortValue = index + 1;
            data.plugins.sortHelper = SortHelperPlugin.template(data);
        }
    },

    /**
     * @param {Object} data
     * @returns {String}
     */
    template: function(data) {
        return '<input type="hidden" class="' + base + '__sort-helper" name="' + data.sortName + '" value="' + data.sortValue + '"/>';
    }
};

FileStyler.registerPlugin('sortHelper', SortHelperPlugin, true);
FileStyler[def].sortHelper = false;