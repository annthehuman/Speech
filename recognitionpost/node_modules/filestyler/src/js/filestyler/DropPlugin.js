function dragInputMove(filestyler, $target) {
    if (filestyler.config.moveInputOnDrag) {
        $target.data(base + 'Input', [filestyler.$input.parent(), filestyler.$input.next()]);
        filestyler.$input.addClass(base + '__drop-input');
        $target.append(filestyler.$input);
    }
}

/**
 * @param {FileStyler} filestyler
 * @param {jQuery} $target
 */
function dragInputRestore(filestyler, $target) {
    if (filestyler.config.moveInputOnDrag) {
        var to = $target.data(base + 'Input');
        if (to[1].length) {
            to[1].before(filestyler.$input);
        } else {
            to[0].append(filestyler.$input);
        }
        filestyler.$input.removeClass(base + '__drop-input');
    }
}

var DropPlugin = {

    /**
     * @param {FileStyler} filestyler
     * @returns {Object}
     */
    create: function(filestyler) {
        var $drop, supportMode;
        $drop = filestyler.$element.find(baseClass + '__drop');
        supportMode = $.inArray(filestyler.config.mode, filestyler.config.allowDropNoInput) !== -1;

        filestyler.drop = 0;

        var documentDragEnter = function(e) {
            if (e.originalEvent.dataTransfer.files) {
                filestyler.drop = filestyler.drop ? 2 : 1;
                if (filestyler.drop > 0) {
                    $drop.addClass(base + '__drop_hint');
                }
            }
        };

        var documentDragLeave = function(e) {
            if (e.originalEvent.dataTransfer.files) {
                filestyler.drop = filestyler.drop === 2 ? 1 : 0;
                if (filestyler.drop <= 0) {
                    $drop.removeClass(base + '__drop_hint');
                }
            }
        };

        var documentDrop = function() {
            filestyler.drop = 0;
            $drop.removeClass(base + '__drop_hint');
        };

        var dragEnter = function(e) {
            if (e.originalEvent.dataTransfer.files) {
                var $target = $(this);
                if (!$(e.target).hasClass(base + '__input')) { // need for chrome
                    e.preventDefault(); // need for ie
                }

                var state = $target.data(base);
                var prev = $target.data(base + 'Prev');
                if (!state) {
                    $target.addClass(base + '__drop_in');
                    dragInputMove(filestyler, $target);

                }
                $target.data(base, state === 1 && prev !== e.target ? 2 : 1);
                $target.data(base + 'Prev', e.target);
            }
        };

        var dragLeave = function(e) {
            if (e.originalEvent.dataTransfer.files) {
                e.preventDefault(); // need for ie
                var $target = $(this);
                var state = $target.data(base) === 2 ? 1 : 0;
                $target.data(base, state);
                $target.data(base + 'Prev', null);
                if (!state) {
                    $target.removeClass(base + '__drop_in');
                    dragInputRestore(filestyler, $target);
                }
            }
        };

        var dragOver = function(e) {
            e.preventDefault();
        };

        var drop = function(e) {
            if (e.originalEvent.dataTransfer.files) {
                var $target = $(this);
                $target
                    .removeClass(base + '__drop_hint')
                    .removeClass(base + '__drop_in')
                    .data(base, 0);
                filestyler.drop = 0;
                dragInputRestore(filestyler, $target);
                if (supportMode) {
                    e.preventDefault();
                    filestyler.processFiles(e.originalEvent.dataTransfer.files);
                }
                if (!supportMode && e.target !== filestyler.$input[0]) {
                    e.preventDefault();
                    throw new Error('Mode "' + filestyler.config.mode + '" does not support drop files not on input element (hint: use moveInputOnDrag = true)');
                }
            }
        };

        var inputDragOver = function(e) {
            e.preventDefault();
        };

        filestyler.dropHandlers = {
            documentDragEnter: documentDragEnter,
            documentDragLeave: documentDragLeave,
            documentDrop:      documentDrop,
            dragEnter:         dragEnter,
            dragLeave:         dragLeave,
            dragOver:          dragOver,
            drop:              drop,
            inputDragOver:     inputDragOver
        };

        $d.on('dragenter',    documentDragEnter);
        $d.on('dragleave',    documentDragLeave);
        $d.on('drop',         documentDrop);
        $drop.on('dragenter', dragEnter);
        $drop.on('dragleave', dragLeave);
        $drop.on('dragover',  dragOver);
        $drop.on('drop',      drop);
        filestyler.$input.on('dragover', inputDragOver);

        return DropPlugin;
    },

    /**
     */
    destroy: function() {
        var filestyler, dropHandlers, $drop;
        filestyler = this;
        dropHandlers = filestyler.dropHandlers;
        $drop = filestyler.$element.find(baseClass + '__drop');
        $d.off('dragenter',    dropHandlers.documentDragEnter);
        $d.off('dragleave',    dropHandlers.documentDragLeave);
        $d.off('drop',         dropHandlers.documentDrop);
        $drop.off('dragenter', dropHandlers.dragEnter);
        $drop.off('dragleave', dropHandlers.dragLeave);
        $drop.off('dragover',  dropHandlers.dragOver);
        $drop.off('drop',      dropHandlers.drop);
        filestyler.$input.on('dragover', dropHandlers.inputDragOver);
    }
};

FileStyler.registerPlugin('drop', DropPlugin, true);
FileStyler[def].allowDropNoInput = ['base64', 'ajax'];
FileStyler[def].moveInputOnDrag = true;
