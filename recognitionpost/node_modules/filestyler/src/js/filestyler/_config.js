module.exports = function (grunt, dest, name) {
    return {
        concat: ['FileStyler.js', 'SortHelperPlugin.js', 'ImagePlugin.js', 'Base64Plugin.js', 'AjaxPlugin.js', 'DropPlugin.js', '*.js'],
        umd: {
            amdModuleId: 'filestyler',
            deps: {
                'default': [{'jquery': '$'}],
                global: ['jQuery']
            }
        }
    };
};
