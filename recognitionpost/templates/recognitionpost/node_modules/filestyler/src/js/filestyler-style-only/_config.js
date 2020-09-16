module.exports = function (grunt, dest, name) {
    return {
        concat: [
            '../filestyler/$before.js',
            '../filestyler/FileStyler.js',
            '../filestyler/SortHelperPlugin.js',
            '../filestyler/ImagePlugin.js',
            '../filestyler/DropPlugin.js',
            '*.js',
            '../filestyler/$after.js'
        ],
        umd: {
            amdModuleId: 'filestyler',
            deps: {
                'default': [{'jquery': '$'}],
                global: ['jQuery']
            }
        }
    };
};
