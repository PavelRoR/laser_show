$(document).ready(function () {
    var blks = $(".tpl_cell .blk"),

        wnd = $(window);
    blks.each(function (i) {
        a = $(this).offset().top;
        b = wnd.scrollTop() + window.innerHeight + 300;
        if (a > 1000 && a > b && $(document).height() - a >= 100) {
            $(this).fadeTo(0, 0);
        }
    });
    function blocksfade() {
        if (blks.length) {
            for (var i = blks.length - 1, blk, a, b; i >= 0; i--) {
                blk = $(blks[i]);
                a = blk.offset().top;
                b = wnd.scrollTop() + window.innerHeight - 100;
                if (a < b) {
                    blk.fadeTo(500, 1, function () {
                    });
                    blks.splice(i, 1);
                }
            }
        } else {
            wnd.unbind('scroll', blocksfade);
        }
    }

    wnd.scroll(blocksfade);
    blocksfade();

});
