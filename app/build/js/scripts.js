$(function() {
    $('body').on('click', '.more', function(e) {
        e.preventDefault();
        $('#' + $(this).attr('data-id')).fadeIn(500);
    });
    $('.close').click(function(e) {
        e.preventDefault();
        $('.lightbox_bg').fadeOut(500)
    });
});

$(function() {
    $("a[href^='#']").click(function() {
        var _href = $(this).attr("href");
        $("html, body").animate({ scrollTop: $(_href).offset().top + "px" });
        return false;
    });
});