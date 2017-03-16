$(function() {
    $('body').on('click', '.more', function(e) {
        e.preventDefault();
        $('#' + $(this).attr('data-id')).fadeIn(500);
    });
    $('.close').click(function(e) {
        e.preventDefault();
        $('.lightbox_bg').fadeOut(500)
    })
});