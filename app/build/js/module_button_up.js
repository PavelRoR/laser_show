/**
 * Created by admin on 13.04.2016.
 */

function ModuleButtonUp(settings) {
    this.settings_arr = [];
    this.$btn_wrap = $("#button_up_wrap");
    this.settings_arr = $.map(settings, function (val, i) {
        return [val];
    });
    this.drawButton();
    this.bindEvent();

}

ModuleButtonUp.prototype.drawButton = function () {
    this.$btn_wrap.addClass(this.settings_arr.join(' '))
};

ModuleButtonUp.prototype.bindEvent = function () {
    var that = this;
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            that.$btn_wrap.fadeIn();
        } else {
            that.$btn_wrap.fadeOut();
        }
    });

    this.$btn_wrap.click(function () {
        $("html, body").animate({scrollTop: 0}, 600);
        return false;
    });
};