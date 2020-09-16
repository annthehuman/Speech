$.fn.filestyler = function(config) {
    this.each(function () {
        new FileStyler($.extend({element: this}, config || {}, $(this).data(base) || {}));
    });
};

$(function () {
    if (FileStyler.autoInit) {
        $(baseClass).filestyler();
    }
});