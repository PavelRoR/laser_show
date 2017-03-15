;
(function(){
function AdapterManager() {
    this.view_port = "editor";
    this.site_width = 960;

    this.own_slider_editor = new FAdapterSliderEditor();
    //this.own_pages_editor = new FPagesEditor();

    this.data_empty = {
        "pc": {},
        "mobile370": {}
    };

    this.data = {};
    this.$sections = [];
    this.$blocks = [];
    this.type = "pc";
    this.prev_type = "pc";

    this.text_hash_list = {};

    this.resize_timer = false;
    this.selectors = {
        $desktop: $(".responsive_menu .responsive_menu_item[version=pc]")
    };

    this.is_ready = false;

    this.ready = function(){
        this.is_ready = true;
        FE.runAndClr('adapterManager/ready');
    };

    this.isReady = function(){
        return this.is_ready;
    };

    this.isEditor = function () {
        return "editor" == adapterManager.view_port;
    };

    this.isView = function () {
        return "view" == adapterManager.view_port;
    };

    this.isPC = function () {
        return "pc" == adapterManager.type;
    };

    this.setVersion = function (type, lock_screen) {
        lock_screen = typeof (lock_screen) == "undefined" || lock_screen;

        if (adapterManager.isEditor() && pages_editor.$bottomEditor.data('curSmartObj') !== null) {
            pages_editor.closeEditor(true);
        }

        adapterManager.prev_type = adapterManager.type;
        adapterManager.type = type;

        $('body').removeClass('mobile370').removeClass('pc').addClass(adapterManager.type);

        if ($.isEmptyObject(adapterManager.data)) {
            adapterManager.data = adapterManager.data_empty;
        }

        if ($.isEmptyObject(adapterManager.data[adapterManager.type])) {
            adapterManager.data[adapterManager.type] = {};
        }

        if ($.isEmptyObject(adapterManager.data[adapterManager.prev_type])) {
            adapterManager.data[adapterManager.prev_type] = {};
        }

        if (lock_screen !== false && adapterManager.isEditor()) {
            var text = "Переход в редактор для ПК";

            if (!adapterManager.isPC()) {
                text = "Переход в мобильный редактор";
            }

            var lock_id = lockScreen(text, {"css_class": "locker-white", "show_animation": true});

            setTimeout(function () {
                adapterManager.processingItems();
                unlockScreen(lock_id);
            }, 200);

        } else {
            adapterManager.processingItems();
        }
    };

    this.initProcessingBlocks = function (adapter_type) {
        var $root = $('#site_wrapper1');

        if (typeof (adapter_type) != "undefined") {
            if (adapter_type == 'pc') {
                adapterManager.$sections = $root.find('.blk_section:visible[adapter_type=' + adapter_type + '], .blk_section:visible:not([adapter_type])');
                adapterManager.$blocks = $root.find('.blk:visible[adapter_type=' + adapter_type + '], .blk:visible:not([adapter_type])');
                adapterManager.$containers = $root.find('.blk_container:visible[adapter_type=' + adapter_type + '], .blk_container:visible:not([adapter_type])');
            } else {
                adapterManager.$sections = $root.find('.blk_section:visible[adapter_type=' + adapter_type + ']');
                adapterManager.$blocks = $root.find('.blk:visible[adapter_type=' + adapter_type + ']');
                adapterManager.$containers = $root.find('.blk_container:visible[adapter_type=' + adapter_type + ']');
            }
        } else {
            adapterManager.$sections = $root.find('.blk_section:visible:not([adapter_type=' + adapterManager.type + '])');
            adapterManager.$blocks = $root.find('.blk:visible:not([adapter_type=' + adapterManager.type + '])');
            adapterManager.$containers = $root.find('.blk_container:visible:not([adapter_type=' + adapterManager.type + '])');
        }
    };

    this.savePC = function () {
        adapterManager.initProcessingBlocks('pc');
        // до ресайза
        // обработка блоков
        adapterManager.processingBlocksBeforeResize();

        // обработка контейнеров
        adapterManager.processingContainersBeforeResize();

        // обработка секций
        adapterManager.processingSectionBeforeResize();
    };

    this.processingItems = function () {
        var $block = $();
        var block_settings = adapterManager.getSettings(adapterManager.type);

        adapterManager.savePC();

        // учтановка видимости секций
        adapterManager.showHideSections();

        adapterManager.savePC();

        adapterManager.initProcessingBlocks();

        // установим ширину секции
        adapterManager.resizeContent(block_settings);

        // обработка всплывающих форма
        adapterManager.resizeFormPopover(block_settings);

        // обработка всплывающих окон
        adapterManager.resizeWindowPopup(block_settings);

        // обработка секций
        adapterManager.processingSectionAfterResize(block_settings);

        // обработка контейнеров
        adapterManager.processingContainersAfterResize(block_settings);

        // обработка блоков
        adapterManager.processingBlocksAfterResize();

        adapterManager.initContainersCells(block_settings);

        adapterManager.fixFakeSections();
    };

    this.fixFakeSections = function () {
        if(!adapterManager.isEditor()) {
            $('#sections_list').children('.blk_section.fixed_fake').each(function () {
                var id = $(this).attr('id').substr(0, 32);
                var $parent = $('#' + id);
                $(this).css({
                    'height': $parent.css('height'),
                    'padding': $parent.css('padding')
                });
            });
        }
    };

    this.showHideSections = function () {
        var $sections = $('#site_wrapper1').find('.blk_section');
        $sections.each(function () {
            var $section = $(this);
            var adapter_type = $section.attr('adapter_type');
            var block_id = $section.hasClass('fixed_fake') ? $section.attr('id').substr(0, 32) : $section.attr('id');
            var data = typeof (adapterManager.data[adapterManager.type][block_id]) == "undefined" ? {} : adapterManager.data[adapterManager.type][block_id];
            var remove_or_add_class = 'remove';

            if ((typeof (adapter_type) == "undefined" || 'pc' == adapter_type) && adapterManager.isEditor()) {
                var data_pc = typeof (adapterManager.data['pc'][block_id]) == "undefined" ? {} : adapterManager.data['pc'][block_id];

                data_pc["is_hidden"] = ($section.hasClass('is_hidden') ? 1 : 0);

                adapterManager.data['pc'][block_id] = data_pc;
            }

            if (adapterManager.isPC()) {
                if (typeof (data['is_hidden']) != "undefined" && 1 == data['is_hidden']) {
                    remove_or_add_class = 'add';
                }
            } else {
                if (typeof (data['is_hidden']) != "undefined") {
                    if (1 == data['is_hidden']) { // смотреть ниже
                        remove_or_add_class = 'add';
                    }
                }
                /*else {
                 var data_pc = typeof (adapterManager.data['pc'][block_id]) == "undefined" ? {} : adapterManager.data['pc'][block_id];
                 if (typeof (data_pc['is_hidden']) != "undefined" && 1 == data_pc['is_hidden']) {
                 remove_or_add_class = 'add';
                 }
                 }
                 */
            }

            if ('add' == remove_or_add_class) {
                $section.addClass('is_hidden');
            } else {
                $section.removeClass('is_hidden');
            }
        });
    };

    this.resizeContent = function (block_settings) {
        if (adapterManager.isView()) {
            $('body,#site_wrapper1').css('min-width', block_settings.min_width);
        }

        var w_popup = block_settings.popup_section_inner === false ? false : block_settings.popup_section_inner;

        var $section = $();
        adapterManager.$sections.each(function () {
            $section = $(this);
            if ($section.hasClass('section_popup') && w_popup !== false) {
                $section.find('.blk_section_inner:first').css({"width": w_popup});
            } else {
                $section.find('.blk_section_inner:first').css({"width": block_settings.width});
            }
        });
    };

    this.resizeFormPopover = function (block_settings) {
        $('#formPopover').css("width", block_settings.form_popover_width);
    };

    this.resizeWindowPopup = function (block_settings) {
        $('#btnPopupWnd').css("width", block_settings.window_popover_width);
        $('#j_lead_confirm').css("width", block_settings.window_popover_width);
    };

    this.processingContainersBeforeResize = function () {
        adapterManager.$containers.each(function () {

            var $container = $(this);
            var adapter_type = $container.attr('adapter_type');
            if (typeof (adapter_type) == "undefined") {
                adapter_type = "pc";
            }
            var version = $container.hasClass('v3') ? 3 : 2;
            var clsCell = version == 3 ? '.td_container_cell' : '.cell.container_cell';

            var $cells = $container.find('.blk_container_cells:first>' + clsCell);
            var cells_width = {};
            var w_container_cells = $container.find('.blk_container_cells:first').outerWidth();
            var count_cell_in_row = adapter_type == 'pc' || typeof($container.attr('count-cell-in-row')) == "undefined" ? $cells.length : $container.attr('count-cell-in-row');

            var fix_width = 0;
            $cells.each(function () {
                fix_width = number_format((100 * $(this).outerWidth() / w_container_cells).toFixed(3), 3, '.');
                adapterManager.data[adapter_type][$(this).attr(version == 3 ? 'cell_id' : 'id')] = {
                    "width": fix_width,
                    "padding": $(this).css('padding'),
                    "margin_left": parseInt($(this).css('margin-left'))
                };
            });

            var $first_cell = $container.find('.blk_container_cells:first '+clsCell+':first');
            var $not_first_cell = $container.find('.blk_container_cells:first '+clsCell+':not(:first):first');
            adapterManager.data[adapter_type][$container.attr('id')] = {
                "cell_margin_horizontal": parseFloat($not_first_cell.css('margin-left')),
                "w_container_cells": w_container_cells,
                "count_cell_in_row": count_cell_in_row
            };

        });
    };

    this.processingContainersAfterResize = function (block_settings) {
        adapterManager.$containers.each(function () {
            var $container = $(this);
            $container.attr('adapter_type', adapterManager.type);
            var container_data = typeof (adapterManager.data[adapterManager.type][$container.attr('id')]) != "undefined" ? adapterManager.data[adapterManager.type][$container.attr('id')] : false;
            var count_cell_in_row = parseInt(false == container_data || typeof (container_data.count_cell_in_row) == "undefined" ? block_settings.default_count_cell_in_row : container_data.count_cell_in_row);
            var v3 = $container.hasClass('v3');
            if (adapterManager.isPC()) {
                if(v3) {
                    $container.find('.blk_container_cells:first').css({'display': 'table'});
                }
                adapterManager.processingCellsInBlockOnPC($container);

                var cellClass = v3 ? '.td_container_cell' : '.cell.container_cell';
                var $cells = $container.find('.blk_container_cells:first>' + cellClass);
                adapterManager.setResizerPosition($cells);
            } else {
                if(v3) {
                    $container.find('.blk_container_cells:first').css({'display': 'flex', 'flex-flow': 'row wrap'});
                }
                adapterManager.setCountColumn($container, count_cell_in_row);
            }
        });

        // Реинициализация только на предпросмотре (когда для менеджера заданы сохраняются настройки слайдера)
        if (adapterManager.hasOwnProperty('slickOpt')) {
            adapterManager.reinitializeSlick();
        }
    };

    // Реинициализация слайдера
    this.reinitializeSlick = function () {
        $(document).find('#popup_list .initSlick').removeClass('initSlick');

        $(document).find('#sections_list .blk_box_slider_self').each(function (index) {
            var $this = $(this),
                blk = $this.closest('.blk_box_slider'),
                slider = $this.children('.slider:first');

            // Уничтожение старого
            slider.slick('unslick');
            // Создание нового со старыми опциями
            slider.slick(adapterManager.slickOpt[blk.attr('id')]);
        });
    };

    this.processingCellsInBlockOnPC = function ($container) {
        var version = $container.hasClass('v3') ? 3 : 2;
        var clsCell = version == 3 ? '.td_container_cell' : '.cell.container_cell';

        var $cells = $container.find('.blk_container_cells:first>' + clsCell);
        $container.find('.row-splitter').remove();

        $cells.each(function () {
            var $cell = $(this);
            var cell_id =  $cell.attr(version == 3 ? 'cell_id' : 'id')
            var cell_data = adapterManager.data['pc'][cell_id];

            $cell.css({
                'width': cell_data.width + '%',
                'padding': cell_data.padding,
                'margin-left': cell_data.margin_left
            });
        });

        processingBlockInCells($cells);
    };

    this.processingSectionBeforeResize = function () {
        adapterManager.$sections.each(function () {
            var $section = $(this);
            var adapter_type = $section.attr('adapter_type');
            if (typeof (adapter_type) == "undefined") {
                adapter_type = "pc";
            }
            var $blk_section_inner = $section.find('.blk_section_inner:first');
            var data = typeof (adapterManager.data[adapter_type][$section.attr('id')]) == "undefined" ? {} : adapterManager.data[adapter_type][$section.attr('id')];

            data["pad_top"] = $section.css('padding-top');
            data["pad_bottom"] = $section.css('padding-bottom');
            data["width"] = $blk_section_inner.css('width');
            data["max-width"] = $blk_section_inner.css('max-width');

            adapterManager.data[adapter_type][$section.attr('id')] = data;
            /*
             {
             "is_hidden": ($section.hasClass('is_hidden') ? 1 : 0),
             };
             */
        });
    };

    this.processingSectionAfterResize = function (block_settings) {
        adapterManager.$sections.each(function () {
            var $section = $(this);
            $section.attr('adapter_type', adapterManager.type);
            var block_id = $section.attr('id');
            var data = typeof (adapterManager.data[adapterManager.type][block_id]) == "undefined" ? {} : adapterManager.data[adapterManager.type][block_id];
            var css_section = {};

            if (typeof (data['pad_top']) != "undefined") {
                css_section['padding-top'] = data['pad_top'];
            }

            if (typeof (data['pad_bottom']) != "undefined") {
                css_section['padding-bottom'] = data['pad_bottom'];
            }

            $section.css(css_section);

            var css_inner = {};

            if (typeof (data['width']) != "undefined") {
                css_inner['width'] = data['width'];
            }

            if (typeof (data['max-width']) != "undefined") {
                css_inner['max-width'] = data['max-width'];
            }

            $section.find('.blk_section_inner:first').css(css_inner);

            if($section.hasClass('bg_type_map') || 'map' == $section.attr('bg_type')) {
                reInitYandexMap($section.attr('id'), $section.attr('data-map-latitude'), $section.attr('data-map-longitude'));
            }

        });
    };

    this.processingBlocksBeforeResize = function () {
        var $block = $();

        adapterManager.$blocks.each(function () {
            $block = $(this);
            var blk_class = $block.attr('blk_class');
            var adapter_type = $block.attr('adapter_type');

            if (typeof (adapter_type) == "undefined") {
                adapter_type = "pc";
            }

            if (!adapterManager.isEditor() && "blk_image_ext" == blk_class) {
                blk_class = "blk_image";
            }

            switch (blk_class) {
                case 'blk_image':
                    adapterManager.data[adapter_type][$block.attr('id')] = {
                        "prod_w": $block.find('.img_container img').css('width'),
                        "prod_h": $block.find('.img_container img').css('height')
                    };
                    break;
                case 'blk_slider':
                    /*
                     adapterManager.data[adapter_type][$block.attr('id')] = {
                     "height": parseInt($block.find('.img_container img').css('height'))
                     };
                     */
                    break;
                case 'blk_form':
                    var $form = $block.find('form.frm_lead:first');
                    var bfw_align = false;
                    var $blk_form_wrap = $block.find('.blk_form_wrap:first');

                    if ($blk_form_wrap.hasClass("l_text")) {
                        bfw_align = "l_text";
                    } else if ($blk_form_wrap.hasClass("c_text")) {
                        bfw_align = "c_text";
                    } else if ($blk_form_wrap.hasClass("r_text")) {
                        bfw_align = "r_text";
                    }

                    adapterManager.data[adapter_type][$block.attr('id')] = {
                        "width": parseInt($form.css('width')),
                        "align": bfw_align
                    };

                    break;
                case 'blk_video':
                    var $iframe = $block.find('iframe:first');
                    adapterManager.data[adapter_type][$block.attr('id')] = {
                        "width": $iframe.css('width'),
                        "height": $iframe.css('height')
                    };
                    break;
                case 'blk_image_ext':
                    var $crop = $block.find('.img-crop:first');
                    var $img = $crop.find('img:first');
                    var img_position = $img.position();
                    var $wrap = $block.find('.blk_image_data_wrap:first');

                    adapterManager.data[adapter_type][$block.attr('id')] = {
                        "crop_w": $crop.width(),
                        "crop_h": $crop.height(),
                        "offset_top": img_position.top,
                        "offset_left": img_position.left,
                        "prod_w": $img.width(),
                        "prod_h": $img.height()
                    };

                    pages_editor.img_ext_list_w[$block.attr('id')] = {
                        'crop_start_w': $crop.width(),
                        'crop_start_h': $crop.height(),
                        'prod_start_w': $img.width(),
                        'wrap_start_w': $wrap.width(),
                        'img_position_start': $img.position(),
                        'real_w': $img.attr('real_w'),
                        'real_h': $img.attr('real_h')
                    };

                    break;
                case 'blk_yandex_map':
                    var $yandex_map_wrap = $block.find('.yandex_map_wrap:first');
                    adapterManager.data[adapter_type][$block.attr('id')] = {
                        "width": $yandex_map_wrap.width(),
                        "height": $yandex_map_wrap.height()
                    };
                    break;
                case 'blk_text':
                    var $blk_data = $block.find('.blk-data:first');
                    adapterManager.data[adapter_type][$block.attr('id')] = {
                        "body": $block.find('.blk-data:first').html(),
                        "padding_top": parseInt($blk_data.css('padding-top')),
                        "padding_bottom": parseInt($blk_data.css('padding-bottom'))
                    };
                    break;
                case 'blk_divider':
                    adapterManager.data[adapter_type][$block.attr('id')] = {
                        "blc_height": $block.find('.blk_divider_self:first').height()
                    };
                    break;
                case 'blk_button':
                case 'blk_button_popup':
                    var temp_align = false;
                    var $blk_button_data_wrap = $block.find('.blk_button_data_wrap:first');

                    if ($blk_button_data_wrap.hasClass("l_text")) {
                        temp_align = "l_text";
                    } else if ($blk_button_data_wrap.hasClass("c_text")) {
                        temp_align = "c_text";
                    } else if ($blk_button_data_wrap.hasClass("r_text")) {
                        temp_align = "r_text";
                    }

                    if (false !== temp_align) {
                        adapterManager.data[adapter_type][$block.attr('id')] = {
                            "align": temp_align
                        };
                    }
                    break;
            }
        });
    };

    this.processingBlocksAfterResize = function () {
        adapterManager.$blocks.each(function () {
            $(this).attr('adapter_type', adapterManager.type);
            adapterManager.processingBlockAfterResize($(this));
        });
    };

    this.processingBlockAfterResize = function ($block) {
        var block_id = $block.attr('id');
        var data = typeof (adapterManager.data[adapterManager.type][block_id]) == "undefined" ? {} : adapterManager.data[adapterManager.type][block_id];

        adapterManager.setBlockData($block, data);
    };

    this.setBlockData = function ($block, data) {
        var block_id = $block.attr('id');
        var blk_class = $block.attr('blk_class');

        if (!adapterManager.isEditor() && "blk_image_ext" == blk_class) {
            blk_class = "blk_image";
        }

        switch (blk_class) {
            case 'blk_image':
                var blk_image_img = $block.find('.img_container img:first');

                if (typeof (data['prod_w']) != "undefined") {
                    blk_image_img.css('width', data['prod_w']).attr('prod_w', data['prod_w']);
                }

                if (!adapterManager.isEditor()) {
                    if (typeof (data['crop_w']) != "undefined") {
                        blk_image_img.css('width', data['crop_w']);
                    }

                    if(typeof (blk_image_img.attr('src')) != "undefined") {
                        var src = blk_image_img.attr('src');
                        var temp___ = src.indexOf("___");
                        var temp_dot = src.lastIndexOf(".");

                        if (adapterManager.isPC() && temp___ != -1) {
                            src = src.substr(0, temp___) + src.substr(temp_dot);
                        } else if (1 == data['has_crop_image']) {
                            src = src.substr(0, temp_dot) + '___' + adapterManager.type + src.substr(temp_dot, temp_dot);
                        }

                        blk_image_img.attr('src', src);
                    }
                }
                break;
            case 'blk_slider':
                /*
                 if (typeof (data['height']) != "undefined") {
                 $block.height(data['height']);
                 }
                 */
                var $temp_fotorama = $block.find('.fotorama:first');
                if ($temp_fotorama.hasClass('fotorama-is-ready') || $block.closest('.blk_section').hasClass('section_popup')) {
                    adapterManager.own_slider_editor.reinitFotorama($temp_fotorama);
                }
                break;
            case 'blk_form':
                if (typeof (data['width']) != "undefined") {
                    $block.find('.blk_form_wrap:not(.is_popover) form').css('width', data['width']);
                }

                if (typeof (data['align']) != "undefined") {
                    var $blk_form_wrap = $block.find('.blk_form_wrap:first');

                    $blk_form_wrap.removeClass('l_text').removeClass('c_text').removeClass('r_text').addClass(data['align']);
                }
                break;
            case 'blk_video':
                var $iframe = $block.find('iframe:first');
                var size_video = {
                    "height": 0,
                    "width": 0
                };

                if (typeof (data['height']) != "undefined") {
                    size_video.height = data['height'];
                } else if (typeof (adapterManager.data[adapterManager.prev_type][block_id]) != "undefined") {
                    size_video.height = Math.round(
                        parseInt(adapterManager.data[adapterManager.prev_type][block_id].height) *
                        parseInt($iframe.css('width')) /
                        parseInt(adapterManager.data[adapterManager.prev_type][block_id].width)
                    );
                } else {
                    size_video.height = $iframe.css('height');
                }

                if (typeof (data['width']) != "undefined") {
                    size_video.width = data['width'];
                } else {
                    size_video.width = $iframe.css('width');
                }

                $iframe.css(size_video);
                $iframe.attr('data-width', size_video.width);
                break;
            case 'blk_image_ext':
                var $crop = $block.find('.img-crop:first');
                var $img = $crop.find('img:first');
                var img_position = $img.position();
                var $wrap = $block.find('.blk_image_data_wrap:first');
                var size_img_ext = {
                    "crop_w": 0,
                    "crop_h": 0,
                    "offset_top": 0,
                    "offset_left": 0,
                    "prod_w": 0,
                    "prod_h": 0
                };

                pages_editor.setZoomImgExt($block.attr('id'), $img);

                if (typeof (data['crop_w']) != "undefined") {
                    size_img_ext.crop_w = data['crop_w'];
                } else {
                    size_img_ext.crop_w = $crop.width();
                }

                if (typeof (data['crop_h']) != "undefined") {
                    size_img_ext.crop_h = data['crop_h'];
                } else {
                    size_img_ext.crop_h = $crop.height();
                }

                if (typeof (data['offset_top']) != "undefined") {
                    size_img_ext.offset_top = data['offset_top'];
                } else {
                    size_img_ext.offset_top = img_position.top;
                }

                if (typeof (data['offset_left']) != "undefined") {
                    size_img_ext.offset_left = data['offset_left'];
                } else {
                    size_img_ext.offset_left = img_position.left;
                }

                if (typeof (data['prod_w']) != "undefined") {
                    size_img_ext.prod_w = data['prod_w'];
                } else {
                    size_img_ext.prod_w = $img.width();
                }

                if (typeof (data['prod_h']) != "undefined") {
                    size_img_ext.prod_h = data['prod_h'];
                } else {
                    size_img_ext.prod_h = $img.height();
                }

                $crop.attr('crop_w', size_img_ext.crop_w).attr('crop_h', size_img_ext.crop_h).css({
                    "width": size_img_ext.crop_w,
                    "height": size_img_ext.crop_h
                });

                $img.attr('prod_w', size_img_ext.prod_w).attr('prod_h', size_img_ext.prod_h);
                $img.attr('offset_top', size_img_ext.offset_top).attr('offset_left', size_img_ext.offset_left);
                $img.css({
                    "width": size_img_ext.prod_w,
                    /*"height": size_img_ext.prod_h,*/
                    "top": size_img_ext.offset_top,
                    "left": size_img_ext.offset_left
                });
                break;
            case 'blk_yandex_map':
                var $yandex_map_wrap = $block.find('.yandex_map_wrap:first');
                var $blk_yandex_map_data_wrap = $block.find('.blk_yandex_map_data_wrap:first');
                var css_yandex_map_wrap = {};

                if (typeof (data['width']) != "undefined") {
                    css_yandex_map_wrap['width'] = data['width'];
                    $blk_yandex_map_data_wrap.attr('data-width', data['width']);
                }

                if (typeof (data['height']) != "undefined") {
                    css_yandex_map_wrap['height'] = data['height'];
                    $blk_yandex_map_data_wrap.attr('data-height', data['height']);
                }

                $yandex_map_wrap.css(css_yandex_map_wrap);

                reInitYandexMap($block.attr('id'), $blk_yandex_map_data_wrap.attr('data-map-latitude'), $blk_yandex_map_data_wrap.attr('data-map-longitude'));
                break;
            case 'blk_text':
                var $blk_data = $block.find('.blk-data:first');
                var blk_data_css = {};
                var font_size = "";

                if (typeof (data['body']) != "undefined") {
                    if (!adapterManager.isEditor() && window.module_geotarget) {
                        data['body'] =  data['body'].replace(/#city#/gi, window.module_geotarget.city);
                    }
                    $blk_data.html(data['body']);
                } else if (!adapterManager.isPC()) {
                    var font_size_sum = 0;
                    var i = 0;

                    font_size = parseInt($blk_data.css('font-size'));
                    $blk_data.find("*[style]").each(function () {
                        $(this).css({
                            'font-size': 'inherit',
                            'text-align': 'inherit',
                            'line-height': 'normal'
                        });
                    });

                    /*
                     if (i > 0) {
                     font_size = Math.ceil(font_size_sum / i);
                     }
                     */

                    //$blk_data.css('font-size', font_size + 'px');

                    /*
                     $blk_data.children('div').each(function () {
                     $(this).css('font-size', font_size + 'px');
                     });

                     $blk_data.children('*:not(div):not(link)').each(function () {
                     $(this).replaceWith('<div style="font-size: ' + font_size + 'px">' + $(this).html() + '</div>')
                     });
                     */

                    //$blk_data.html('<span class="text-style-ns" style="font-size: ' + font_size + 'px">' + $blk_data.html() + '</span>');

                    /*
                     if(typeof (adapterManager.data[adapterManager.type][block_id]) == "undefined") {
                     adapterManager.data[adapterManager.type][block_id] = {};
                     }

                     adapterManager.data[adapterManager.type][block_id]['font_size'] = font_size;
                     adapterManager.data[adapterManager.type][block_id]['text_align'] = "inherit";
                     adapterManager.data[adapterManager.type][block_id]['body'] = $blk_data.html();

                     data['font_size'] = font_size;
                     data['text_align'] = "inherit";

                     */
                }

                if (typeof (data['padding_top']) != "undefined") {
                    blk_data_css['padding-top'] = data['padding_top'];
                }

                if (typeof (data['padding_bottom']) != "undefined") {
                    blk_data_css['padding-bottom'] = data['padding_bottom'];
                }

                blk_data_css['text-align'] = "inherit";
                if (typeof (data['text_align']) != "undefined") {
                    blk_data_css['text-align'] = data['text_align'];
                }

                blk_data_css['font-size'] = font_size;
                if (typeof (data['font_size']) != "undefined") {
                    blk_data_css['font-size'] = data['font_size'];
                }

                $blk_data.css(blk_data_css);

                break;
            case 'blk_divider':
                if (typeof (data['blc_height']) != "undefined") {
                    $block.find('.blk_divider_self:first').css('height', data['blc_height']);
                }
                break;
            case 'blk_button':
            case 'blk_button_popup':
                if (typeof (data['align']) != "undefined") {
                    var $blk_button_data_wrap = $block.find('.blk_button_data_wrap:first');

                    $blk_button_data_wrap.removeClass('l_text').removeClass('c_text').removeClass('r_text').addClass(data['align']);
                }
                break;
        }
    };

    this.initContainersCells = function (block_settings) {
        adapterManager.$containers.each(function () {
            $(this).attr('adapter_type', adapterManager.type);
            adapterManager.initContainerCells($(this), block_settings);
        });
    };

    this.initContainerCells = function ($container, block_settings) {
        $container.find('.cell-resizer').remove();
        var i = 1;
        var $cells = $();
        var max_height = 50;
        var j = 1;
        var version = $container.hasClass('v3') ? 3 : 2;
        var clsCell = version == 3 ? '.td_container_cell' : '.cell.container_cell';
        while (true) {
            $cells = $container.find('.blk_container_cells:first>'+clsCell+'[row=' + i + ']');
            if ($cells.length == 0) {
                break;
            }

            j = 1;
            $cells.each(function () {
                if (j != $cells.length) {
                    adapterManager.appendContainerCellResizer(block_settings, $(this));
                }
                ++j;
            });

            ++i;
        }

        adapterManager.updateCells($container);
    };

    this.appendContainerCellResizer = function (block_settings, $cell) {
        var cell_margin_horizontal = block_settings.cell_margin_horizontal !== false ? block_settings.cell_margin_horizontal : 11;

        var version = $cell.closest('.blk_container').hasClass('v3') ? 3 : 2;
        var clsCell = version == 3 ? '.td_container_cell' : '.cell.container_cell';
        if(version == 3){
            return true;
        }
        var cell_id =  $cell.attr(version == 3 ? 'cell_id' : 'id')

        var id = "cell-resizer-" + cell_id;
        var $resizer = $('#' + id);

        if (0 == $resizer.length) {
            $resizer = $('<div class="cell-resizer"></div>');
            $resizer.attr('id', id).attr('parent', cell_id).attr('margin_horizontal', cell_margin_horizontal);

            $cell.parent().find('.row-splitter[owner-row=' + $cell.attr('row') + ']:first').append($resizer);
        }
    };

    this.updateCells = function ($container, row) {
        var add_filter = "";
        if (typeof (row) != "undefined") {
            add_filter = "[row=" + row + "]";
        }
        var version = $container.hasClass('v3') ? 3 : 2;
        var clsCell = version == 3 ? '.td_container_cell' : '.cell.container_cell';
        if (0 != $container.length) {
            var max_height = 50;
            var $cells = $container.find(".blk_container_cells:first>"+ clsCell + add_filter);
            var attr_row = 0;
            var $cell = $();
            var $resizer = $();
            var prev_row = 0;

            $cells.each(function (index) {
                $cell = $(this);
                attr_row = parseInt($cell.attr('row'));
            });

            $cells.each(function () {
                $cell = $(this);
                var cell_id =  $cell.attr(version == 3 ? 'cell_id' : 'id')
                $resizer = $("#cell-resizer-" + cell_id);
                if (0 != $resizer.length) {
                    var cell_margin_horizontal = $resizer.attr('margin_horizontal');
                    $resizer.css({
                        "height": 40,
                        "left": $cell.position().left + parseInt($cell.css('width')) + Math.floor(cell_margin_horizontal / 2) + parseInt(cell_margin_horizontal)
                    });
                }
            });
        }
    };

    this.getSettings = function (type) {
        var object = {};

        switch (type) {
            case 'pc':
                object = {
                    'min_width': adapterManager.site_width,
                    'width': adapterManager.site_width,
                    'popup_section_inner': false,
                    'form_popover_width': 400,
                    'window_popover_width': 500,
                    'cell_margin_horizontal': false,
                    'default_count_cell_in_row': 1
                };
                break;
            case 'mobile370':
                object = {
                    'min_width': 370,
                    'width': 370,
                    'popup_section_inner': 300,
                    'form_popover_width': 300,
                    'window_popover_width': 340,
                    'cell_margin_horizontal': 11,
                    'default_count_cell_in_row': 2
                };
                break;
            case '':
                break;
        }

        return object;
    };

    this.clearDataById = function (id) {
        for (var type in adapterManager.data) {
            if ("pc" == type) {
                continue;
            }
            saveMan.add('reset_block_data', {"block_id": id, "adaptability_type": type});
        }
    };

    this.resetSizeInContainer = function (id) {
        var $item = $('#' + id);

        if (!$item.hasClass('blk_container')) {
            return;
        }

        var version = $item.hasClass('v3') ? 3 : 2;

        var clsCell = version == 3 ? '.td_container_cell' : '.cell.container_cell';
        $item.find('.blk_container_cells:first>'+clsCell+', .blk').each(function () {

            var cell_id =  $(this).attr(version == 3 && $(this).hasClass('td_container_cell') ? 'cell_id' : 'id');
            if(version == 3){
                var cell = $(this);
            }
            adapterManager.resetBlockData(cell_id);
        });
    };

    this.resetBlockData = function (id) {
        var $item = $('#' + id);
        var type = "";

        if ($item.hasClass('blk_section')) {
            type = 'blk_section';
        }

        if ($item.hasClass('blk_container')) {
            type = 'blk_container';
        }

        if ($item.hasClass('container_cell')) {
            type = 'container_cell';
        }

        if (typeof($item.attr('blk_class')) != "undefined") {
            type = $item.attr('blk_class');
        }

        var excep_type_array = [
            'blk_section', 'blk_container', 'blk_divider', 'blk_text', 'blk_slider', 'blk_button', 'blk_button_popup', 'blk_html'
        ];

        if ($.inArray(type, excep_type_array) >= 0) {
            return;
        }

        adapterManager.clearDataById(id);
    };

    this.saveCells = function ($container) {
        var tbl_w = parseFloat($container.find('.blk_container_cells:first').width());
        var ops = {
            id: $container.attr('id'),
            cells: []
        };
        var version = $container.hasClass('v3') ? 3 : 2;
        var clsCell = version == 3 ? '.td_container_cell' : '.cell.container_cell';
        ops.version = version;
        $container.find('.blk_container_cells:first>' + clsCell).each(function () {
            var $cell = $(this);
            var cell_id =  $cell.attr(version == 3 ? 'cell_id' : 'id')
            ops.cells.push({id: cell_id, width: parseFloat($cell[0].style.width)})
        });

        saveMan.add('mod_container_cells', ops);
    };

    this.setCountColumn = function ($container, count_cell_in_row) {
        $container.attr('count-cell-in-row', count_cell_in_row);
        var containerID = $container.attr('id');
        var container_data_pc = adapterManager.data['pc'][containerID];

        if (typeof (container_data_pc) == "undefined") {
            return;
        }
        var container_data = adapterManager.data[adapterManager.type][containerID];
        var block_settings = adapterManager.getSettings(adapterManager.type);
        var cell_data = false;
        var prev_data = {};
        var isV3 = $container.hasClass('v3');
        var cellClass = isV3 ? '.td_container_cell' : '.cell.container_cell';

        var $cells = $container.find('.blk_container_cells:first>' + cellClass);
        var w_container_cells = $container.find('.blk_container_cells:first').width();
        var w_container_cells_prev = container_data_pc.w_container_cells;

        var cell_margin_horizontal = (typeof (container_data) == "undefined" || typeof (container_data.cell_margin_horizontal) == "undefined")
            ? block_settings.cell_margin_horizontal
            : container_data.cell_margin_horizontal;

        var sum_width = 0;
        var cell_list = [];
        var temp_width_c = 0;
        var $cell = false;
        var row = 1;
        var control_sum = 0;

        var p_1_px = 100 / w_container_cells;
        var p_1_px_prev = (100 / w_container_cells_prev).toFixed(3);
        var splitter_height = 0;

        $container.find('.row-splitter').remove();

        $cells.each(function (index) {

            $(this).css({
                'padding-left': 0,
                'padding-right': 0
            });
            var cell_id = $(this).attr(isV3 ? 'cell_id' : 'id');
            var i = index + 1;
            prev_data = adapterManager.data['pc'][cell_id];
            sum_width += parseFloat(prev_data.width);
            cell_list.push(cell_id);

            if (i % count_cell_in_row == 0 || i == $cells.length) {
                temp_width_c = (w_container_cells - cell_margin_horizontal * (cell_list.length + 1));
                var sum_width_w = Math.floor(sum_width / p_1_px_prev);
                var fixed_prev_w = "";

                if (!adapterManager.isPC()) {

                    var $row_splitter = $('<div class="row-splitter clearfix" style="height: ' + splitter_height + 'px"></div>');
                    $row_splitter.attr('owner-row', row);
                    $cell = isV3 ? $('div[cell_id=' + cell_list[0] + ']') : $('#' + cell_list[0]);
                    if (isV3) {
                        $row_splitter.css('display', 'table-row');
                    }
                    $cell.before($row_splitter);
                }

                for (var j in cell_list) {
                    $cell = isV3 ? $('div[cell_id=' + cell_list[j] + ']') : $('#' + cell_list[j]);
                    var temp_w = 0;
                    cell_data = (typeof (adapterManager.data[adapterManager.type][cell_list[j]]) == "undefined") ? false : adapterManager.data[adapterManager.type][cell_list[j]];
                    var cell_data_w = (cell_data != false && typeof (cell_data.width) != "undefined") ? cell_data.width : false;

                    prev_data = adapterManager.data['pc'][cell_list[j]];
                    var temp_p = 0;

                    if (cell_data_w == false) {
                        var temp_ww = Math.floor((prev_data.width / p_1_px_prev));

                        temp_p = temp_ww * 100 / sum_width_w;
                        temp_w = Math.round(temp_p / (100 / temp_width_c).toFixed(3));
                        fixed_prev_w = number_format((p_1_px * temp_w).toFixed(3), 3, '.');
                    } else {
                        fixed_prev_w = cell_data_w;
                    }

                    $cell.css({
                        "width": fixed_prev_w + "%",
                        "margin-left": cell_margin_horizontal
                    });

                    adapterManager.resetSizeImageExt($cell);
                    processingBlockInCells($cell);
                    $cell.attr('row', row);
                }

                adapterManager.updateCells($container, row);

                cell_list = [];
                sum_width = 0;
                control_sum = 0;
                ++row;
                splitter_height = 11;
            }
        });

        adapterManager.setResizerPosition($cells, cell_margin_horizontal);
    };

    // Корректирует отступ у ресайзера (в зависимости от вида)
    this.setResizerPosition = function($cells, cell_margin_horizontal) {
        cell_margin_horizontal = cell_margin_horizontal || 0;
        var $resizerContainer = $cells.find('.blk-container__resize-inner').removeAttr('style');
        if (!adapterManager.isPC()) {
            var resizerLeft = parseInt($resizerContainer.css('left'), 10);
            $resizerContainer.css('left', resizerLeft - (cell_margin_horizontal / 2).toFixed(0));
        }
    };

    this.resetSizeImageExt = function ($root) {
        var $list = $root.hasClass('blk_image_ext') ? $root : $root.find('.blk.blk_image_ext');

        if (typeof (adapterManager.data['pc']) != "undefined") {
            $list.each(function () {
                var $block = $(this);
                var block_id = $block.attr('id');
                var data = typeof (adapterManager.data['pc'][block_id]) == "undefined" ? {} : adapterManager.data['pc'][block_id];

                adapterManager.setBlockData($block, data);
            });
        }
    };

    this.initResize = function (list) {
        adapterManager.initFotorama();

        if (adapterManager.isEditor()) {
            return;
        }

        var f_resize = function () {
            var w = $(window).width();
            var type = "pc";
            for (var i in list) {
                var item = list[i];
                if (w >= item.min && w <= item.max) {
                    type = item.name;
                }
            }

            adapterManager.setVersion(type);
        };

        $(window).resize(function () {
            clearTimeout(adapterManager.resize_timer);
            adapterManager.resize_timer = setTimeout(f_resize, 100);
        });

        FE.add('show_section_popup', f_resize);

        f_resize();
    };

    this.setSectionState = function (type, params) {
        if (typeof (adapterManager.data[type]) == "undefined") {
            return;
        }

        if (typeof (adapterManager.data[type][params.id]) == "undefined") {
            adapterManager.data[type][params.id] = {};
        }

        adapterManager.data[type][params.id][params.name] = params.value;
    };

    this.processingBlockTextBeforeSave = function (action, params) {
        if (!adapterManager.isPC() || 'save_block' != action || 'text' != params['type']) {
            return;
        }

        if (
            typeof(adapterManager.data['mobile370']) == "undefined"
            || typeof(adapterManager.data['mobile370'][params.id]) == "undefined"
            || typeof(adapterManager.data['mobile370'][params.id]['body']) == "undefined"
        ) {
            return;
        }

        var temp_date = adapterManager.data['mobile370'][params.id];

        var $ob = $('#' + params.id);
        var text_hash = adapterManager.getTextHash($ob);
        if (typeof (adapterManager.text_hash_list[params.id]) == "undefined") {
            var $temp_html = $('<div><div class="blk-data"></div></div>').find('.blk-data:first').html(adapterManager.data['mobile370'][params.id]['body']);
            adapterManager.text_hash_list[params.id] = adapterManager.getTextHash($temp_html);
        }

        if (adapterManager.text_hash_list[params.id] == text_hash) {
            return;
        }

        delete adapterManager.data['mobile370'][params.id].body;
        //replace_all_data
        var temp_params = {
            'type': params['type'],
            'id': params['id'],
            'replace_all_data': 1,
            'adaptability_type': 'mobile370',
            'padding_bottom': temp_date.padding_bottom,
            'padding_top': temp_date.padding_top
        };

        if (typeof (temp_date['text_align']) != "undefined") {
            temp_params['text_align'] = temp_date['text_align'];
        }

        if (typeof (temp_date['font_size']) != "undefined") {
            temp_params['font_size'] = temp_date['font_size'];
        }

        saveMan.add('save_block', temp_params);

        adapterManager.text_hash_list[params.id] = text_hash;
    };

    this.processingDataBeforeSave = function (action, params) {

        adapterManager.processingBlockTextBeforeSave(action, params);

        switch (action) {
            case 'reset_block_data':
                if (typeof (adapterManager.data[params.adaptability_type]) != "undefined" && typeof (adapterManager.data[params.adaptability_type][params.block_id]) != "undefined") {
                    delete adapterManager.data[params.adaptability_type][params.block_id];
                }
                break;
        }

        if (!adapterManager.isPC() && typeof(params['adaptability_type']) == "undefined") {
            switch (action) {
                case 'save_img_size':
                case 'save_img_ext_size':
                case 'save_yandex_map_size':
                case 'save_video_size':
                case 'save_form_size':
                case 'save_popup_style':
                case 'mod_pad_section':
                case 'mod_container_cells':
                case 'set_section_state':
                case 'save_count_cells_in_row':
                    params['adaptability_type'] = adapterManager.type;
                    break;
                case 'save_block':
                    var blc_class = $('#' + params.id).attr('blk_class');
                    if ($.inArray(blc_class, ["blk_divider", "blk_text", "blk_form", "blk_button", "blk_button_popup"]) >= 0) {
                        params['adaptability_type'] = adapterManager.type;
                    }
                    break;
                default :
                    break;
            }

            switch (action) {
                case 'save_img_size':
                    adapterManager.data[adapterManager.type][params.id] = {
                        "prod_w": params.prod_w,
                        "prod_h": params.prod_h
                    };
                    break;
                case 'save_img_ext_size':
                    adapterManager.data[adapterManager.type][params.id] = {
                        "crop_w": params.crop_w,
                        "crop_h": params.crop_h,
                        "offset_top": params.offset_top,
                        "offset_left": params.offset_left,
                        "prod_w": params.prod_w,
                        "prod_h": params.prod_h
                    };
                    break;
                case 'save_yandex_map_size':
                    adapterManager.data[adapterManager.type][params.id] = {
                        "width": params.width,
                        "height": params.height
                    };
                    break;
                case 'save_video_size':
                    adapterManager.data[adapterManager.type][params.id] = {
                        "width": params.width,
                        "height": params.height
                    };
                    break;
                case 'save_form_size':
                    if (typeof (adapterManager.data[adapterManager.type][params.id]) == "undefined") {
                        adapterManager.data[adapterManager.type][params.id] = {};
                    }

                    adapterManager.data[adapterManager.type][params.id]['width'] = params.width;
                    break;
                case 'save_popup_style':
                    adapterManager.data[adapterManager.type][params.id] = {
                        "wnd_width": params.wnd_width
                    };
                    break;
                case 'set_section_state':
                    adapterManager.setSectionState(adapterManager.type, params);
                    break;
                case 'mod_pad_section':
                    if (typeof (adapterManager.data[adapterManager.type][params.id]) == "undefined") {
                        adapterManager.data[adapterManager.type][params.id] = {};
                    }

                    adapterManager.data[adapterManager.type][params.id]["pad_bottom"] = params.pad_bottom;
                    adapterManager.data[adapterManager.type][params.id]["pad_top"] = params.pad_top;
                    break;
                case 'mod_container_cells':
                    for (var i in params.cells) {
                        var cell = params.cells[i];

                        adapterManager.data[adapterManager.type][cell.id] = {
                            "width": cell.width
                        };
                    }
                    break;
                case 'save_block':
                    var blc_class = $('#' + params.id).attr('blk_class');

                    if ('blk_divider' == blc_class) {
                        adapterManager.data[adapterManager.type][params.id] = {
                            "blc_height": params.blcHeight
                        };
                    }

                    if ('blk_text' == blc_class) {
                        if (typeof (adapterManager.data[adapterManager.type][params.id]) == "undefined") {
                            adapterManager.data[adapterManager.type][params.id] = {};
                        }

                        if (typeof (params.html) != "undefined") {
                            adapterManager.data[adapterManager.type][params.id]["body"] = params.html;
                        }

                        var $temp_blk_data = $('#' + params.id).find('.blk-data:first');

                        adapterManager.data[adapterManager.type][params.id]["text_align"] = $temp_blk_data.css('text-align');
                        adapterManager.data[adapterManager.type][params.id]["font_size"] = parseInt($temp_blk_data.css('font-size'));
                        adapterManager.data[adapterManager.type][params.id]["padding_top"] = parseInt($temp_blk_data.css('padding-top'));
                        adapterManager.data[adapterManager.type][params.id]["padding_bottom"] = parseInt($temp_blk_data.css('padding-bottom'));

                        params["text_align"] = $temp_blk_data.css('text-align');
                        params["font_size"] = parseInt($temp_blk_data.css('font-size'));

                        params["padding_top"] = parseInt($temp_blk_data.css('padding-top'));
                        params["padding_bottom"] = parseInt($temp_blk_data.css('padding-bottom'));
                    }

                    if ('blk_button' == blc_class || 'blk_button_popup' == blc_class) {
                        adapterManager.data[adapterManager.type][params.id] = {
                            "align": params.align
                        };
                    }

                    if ('blk_form' == blc_class) {
                        if (typeof (adapterManager.data[adapterManager.type][params.id]) == "undefined") {
                            adapterManager.data[adapterManager.type][params.id] = {};
                        }

                        adapterManager.data[adapterManager.type][params.id]['align'] = params.align
                    }
                    break;
                case 'save_count_cells_in_row':
                    adapterManager.data[adapterManager.type][params.id] = {
                        "count_cell_in_row": params.count_cell_in_row
                    };
                    break;
                default :
                    break;
            }
        }
    };

    this.actionFilter = function (action, params) {
        var result = true;

        if ($.inArray(action, ['del_block', 'del_section', 'del_container_cell', 'mod_container_cells']) != -1) {
            return result;
        }

        if (!adapterManager.isPC()) {
            result = false;
            switch (action) {
                case 'reset_block_data':
                case 'save_img_size':
                case 'save_img_ext_size':
                case 'save_yandex_map_size':
                case 'save_video_size':
                case 'save_form_size':
                case 'save_popup_style':
                case 'mod_pad_section':
                case 'mod_container_cells':
                case 'save_count_cells_in_row':
                case 'save_adaptive_settings':
                    result = true;
                    break;
                case 'save_block':
                    var blc_class = $('#' + params.id).attr('blk_class');
                    if ($.inArray(blc_class, ["blk_divider", "blk_text", "blk_form", "blk_button", "blk_button_popup"]) >= 0) {
                        result = true;
                    }
                    break;
                case 'set_section_state':
                    if ('is_hidden' == params.name) {
                        result = true;
                    }
                    break;
                default :
                    result = false;
                    break;
            }
        }

        return result;
    };

    this.setSectionClass = function ($list) {

        if (typeof ($list) == "undefined") {
            $list = $('#site_wrapper1').find('.blk_section');
        }

        if (typeof (adapterManager.data['pc']) == "undefined") {
            $list.each(function () {
                var $ob = $(this);
                if ($ob.hasClass('is_hidden')) {
                    $ob.addClass("is_hidden_on_pc");
                }
            });
        }

        $list.each(function () {
            var $ob = $(this);
            var s_class = "";
            for (var i in adapterManager.data) {
                s_class = "is_hidden_on_" + i;
                var temp_data = typeof (adapterManager.data[i][$ob.attr('id')]) == "undefined" ? {} : adapterManager.data[i][$ob.attr('id')];
                if (typeof (temp_data['is_hidden']) != "undefined" && 1 == temp_data['is_hidden']) {
                    $ob.addClass(s_class);
                } else {
                    $ob.removeClass(s_class);
                }
            }
        });
    };

    this.cloneAdaptability = function (old_block_id, new_block_id, type) {
        for (var i in adapterManager.data) {
            if ('pc' != i && typeof(adapterManager.data[i][old_block_id]) != "undefined") {
                adapterManager.data[i][new_block_id] = clone(adapterManager.data[i][old_block_id]);
                saveMan.add('clone_adaptability', {
                    type: type,
                    old_block_id: old_block_id,
                    new_block_id: new_block_id
                });

                if ("block" == type && typeof (adapterManager.data[i][new_block_id]['crop_h']) != "undefined") {
                    saveMan.add('save_img_ext_size', {
                        'id': new_block_id,
                        'prod_w': adapterManager.data[i][new_block_id]['prod_w'],
                        'prod_h': adapterManager.data[i][new_block_id]['prod_h'],
                        'crop_w': adapterManager.data[i][new_block_id]['crop_w'],
                        'crop_h': adapterManager.data[i][new_block_id]['crop_h'],
                        'offset_top': adapterManager.data[i][new_block_id]['offset_top'],
                        'offset_left': adapterManager.data[i][new_block_id]['offset_left'],
                        'adaptability_type': i
                    });
                }
            }
        }
    };

    this.addAdaptabilityData = function (adaptability_data) {
        for (var i in adaptability_data) {
            if (typeof (adapterManager.data[i]) == "undefined") {
                adapterManager.data[i] = {};
            }

            for (var j in adaptability_data[i]) {
                adapterManager.data[i][j] = adaptability_data[i][j];
            }
        }
    };

    this.initTextHash = function () {
        $('#site_wrapper1').find('.blk_text').each(function () {
            adapterManager.text_hash_list[$(this).attr('id')] = adapterManager.getTextHash($(this));
        });
    };

    this.initFotorama = function () {
        $('.blk_slider_data_wrap > .fotorama, .blk-data > .fotorama').fotorama().on('fotorama:ready', function () {
            $(this).addClass('fotorama-is-ready')
        });
    };

    this.initInEditor = function () {
        adapterManager.initTextHash();
        adapterManager.initFotorama();
    };

    this.initInPreview = function () {
        adapterManager.initFotorama();
        FE.add('show_section_popup', function () {
            adapterManager.setVersion(adapterManager.type);
        });
    };

    this.getTextHash = function ($ob) {
        var $temp_div = $('<div></div>');
        $temp_div.html($ob.find('.blk-data:first').html());

        $temp_div.find("*[style]").each(function () {
            $(this).css({
                'font-size': 'inherit',
                'text-align': 'inherit',
                'line-height': 'normal'
            });
        });

        return md5($temp_div.html());
    };

}

function FAdapterSliderEditor() {
    this.$btn_slider_settings = null;
    this.$wnd_slider_empty = null;
    this.$wnd_slider = null;
    this.$wnd_slider_images = null;
    this.$block_fotorama = null;
    this.$block_data_encoded = null;
    this.$block_wrap = null;
    this.$block_loading = null;
    this.smart_block = null;
}

sliderEditorExtend(FAdapterSliderEditor);

    FE.runOnReady(function(){
        window.adapterManager = new AdapterManager();
        window.adapterManager.ready();
    });
})();

/* Ресайз container */
(function () {

    var f = {};
    var v = {};

    f.get_real_width = function (width) {

        if (width.toString().indexOf('%') != -1) {
            width = Math.floor(parseFloat(width) / (100 / v.$container.width()).toFixed(3));
        }

        if (width.toString().indexOf('px') != -1) {
            width = parseInt(width);
        }

        return width;
    };

    f.mouse_move = function (e) {

        var delta = (e.pageX - v.pageX_start);

        var width = v.w_parent_start + delta;
        width = width < v.w_min ? v.w_min : width;
        width = width > v.w_max ? v.w_max : width;

        v.$parent.width(width);
        v.$next.width(v.w_parent_start + v.w_next_start - width);
        //v.$resizer.css('left', v.resizer_pos_start.left - v.w_parent_start + width);

        if (delta != 0) {
            processingBlockInCells(v.$parent);
            processingBlockInCells(v.$next);
            adapterManager.updateCells(v.$container);
        }

        return false;
    };

    f.mouse_up = function (e) {
        $(document).unbind('mousemove', f.mouse_move).unbind('mouseup', f.mouse_up);

        if (f.get_real_width(v.$parent[0].style.width) != v.w_parent_start) {
            $(this).data('cell', v.$parent);
            window.pages_editor.stopResizeColumn(false, false, v.$container, $(this), true, true);
            adapterManager.saveCells(v.$container);
        }

        return false;
    };

    f.mouse_down = function (e) {
        v.pageY_start = e.pageY;
        v.pageX_start = e.pageX;
        v.$resizer = $(e.currentTarget);
        v.$container = v.$resizer.closest('.blk_container');
        v.resizer_pos_start = v.$resizer.position();
        v.$parent = $('#' + v.$resizer.attr('parent'));
        v.$next = v.$parent.next();

        //number_format((100 * parseFloat(next[0].style.width) / tbl_w).toFixed(3), 3, '.')

        v.w_parent_start = f.get_real_width(v.$parent[0].style.width);
        v.w_next_start = f.get_real_width(v.$next[0].style.width);

        v.w_min = 21;
        v.w_max = v.w_parent_start + v.w_next_start - v.w_min;
        v.margin_horizontal = v.$resizer.attr('margin_horizontal');

        window.pages_editor.startResizeColumn(v.$parent, v.$next);

        $(document).unbind('mousemove', f.mouse_move).unbind('mouseup', f.mouse_up);
        $(document).on('mousemove', f.mouse_move).on('mouseup', f.mouse_up);

        return false;
    };

    $('#sections_list, #popup_list').on('mousedown', '.cell-resizer', f.mouse_down);
})();

/* Контролы для текстового блока */
(function () {
    var f = {};
    var v = {};

    f.click = function (e) {
        v.$btn = $(e.currentTarget);
        v.$block = v.$btn.closest('.blk.blk_text');
        v.$blk_data = v.$block.find('.blk-data:first');
        v.type = v.$btn.attr('btn-type');

        switch (v.type) {
            case 'increase_font_size':
            case 'decrease_font_size':
                f.setFontSize(v.type, v.$btn);
                break;
            case 'align_left':
            case 'align_center':
            case 'align_right':
                f.setAlign(v.type);
                break;
            case 'save':
                f.saveBlock();
                break;
        }

        return false;
    };

    f.setFontSize = function (type, $btn) {
        var font_size = parseInt(v.$blk_data.css('font-size'));

        v.$blk_data.find("*[style]").each(function () {
            $(this).css({
                'font-size': 'inherit',
                'text-align': 'inherit'
            });
        });

        font_size += type == 'increase_font_size' ? 1 : -1;
        v.$blk_data.css('font-size', font_size + 'px');
        f.saveBlock();

        var timeout_id = $btn.attr('data-timeout_id'),
            destroyTip = function ($btn, orig_title) {
                $btn.tooltip('destroy');
                $btn.attr('title', orig_title);
                $btn.removeAttr('data-timeout_id');
                $btn.removeAttr('data-orig_title');
            },
            createTip = function ($btn, font_size) {
                $btn.attr('data-orig_title', $btn.attr('title'));
                $btn.removeAttr('title');
                $btn.tooltip({
                    animation: false,
                    title: font_size,
                    trigger: 'manual'
                });
                $btn.tooltip('show');
                $btn.attr('data-timeout_id', setTimeout(function () {
                    destroyTip($btn, $btn.attr('data-orig_title'));
                }, 1000));
            };
        if (timeout_id) {
            clearTimeout(timeout_id);
            destroyTip($btn, $btn.attr('data-orig_title'));
            createTip($btn, font_size);
        } else {
            createTip($btn, font_size);
        }

        return false;
    };

    f.setAlign = function (type) {
        var align = type.substr(6);

        v.$blk_data.find("*[style]").each(function () {
            $(this).css({
                'font-size': 'inherit',
                'text-align': 'inherit'
            });
        });

        v.$blk_data.css('text-align', align);
        f.saveBlock();

        return false;
    };

    f.saveBlock = function () {
        var id = v.$block.attr('id');

        saveMan.add('save_block', {
            type: 'text',
            id: id,
            html: v.$blk_data.html(),
            text_align: v.$blk_data.css('text-align'),
            font_size: v.$blk_data.css('font-size')
        });
    };

    $('#sections_list, #popup_list').on('click', '.blk_text .mc-text-control', f.click);
})();

/* Контролы для блока blk_button*/
(function () {
    var f = {};
    var v = {};

    f.click = function (e) {
        v.$btn = $(e.currentTarget);
        v.$block = v.$btn.closest('.blk');
        v.type = v.$btn.attr('btn-type');

        switch (v.type) {
            case 'align_left':
            case 'align_center':
            case 'align_right':
                f.setAlign(v.type);
                break;
            case 'save':
                f.saveBlock();
                break;
        }

        return false;
    };

    f.setAlign = function (type) {
        var align = type.substr(6, 1);
        var s_class = align + "_text";
        v.$block.find('.blk_button_data_wrap:first, .blk_form_wrap:first').removeClass('l_text').removeClass('c_text').removeClass('r_text').addClass(s_class);
        var id = v.$block.attr('id');
        pages_editor.editBlock(id);
        return false;
    };

    f.saveBlock = function () {
        var id = v.$block.attr('id');
        pages_editor.editBlock(id);
        if (pages_editor.$bottomEditor.data('curSmartObj') !== null) {
            pages_editor.closeEditor(true);
        }
    };

    $('#sections_list, #popup_list').on('click', '.blk_button .mc-text-control, .blk_button_popup .mc-text-control, .blk_form .mc-text-control', f.click);
})();

/* Контролы для блока колонки */
(function () {
    var f = {};
    var v = {};

    f.btn_click = function (e) {

        if (pages_editor.$bottomEditor.data('curSmartObj') !== null) {
            pages_editor.closeEditor(true);
        }

        var $item = $(e.currentTarget);
        var $wnd = $item.closest('#mobile_columns_popover');
        var count_cell_in_row = parseInt($item.attr('data'));
        var block_id = $wnd.attr('block-parent-id');
        var $block = $('#' + block_id);
        adapterManager.resetSizeInContainer(block_id);
        adapterManager.setCountColumn($block, count_cell_in_row);
        $block.find('.blk').each(function () {
            adapterManager.processingBlockAfterResize($(this));
        });
        var block_settings = adapterManager.getSettings(adapterManager.type);
        adapterManager.initContainerCells($block, block_settings);

        /*
         setTimeout(function () {
         adapterManager.initContainerCells($block, block_settings);
         }, 2000);
         */

        if (typeof (adapterManager.data[adapterManager.type][block_id]) == "undefined") {
            adapterManager.data[adapterManager.type][block_id] = {};
        }

        adapterManager.data[adapterManager.type][block_id].count_cell_in_row = count_cell_in_row;

        saveMan.add('save_count_cells_in_row', {
            "id": block_id,
            "count_cell_in_row": count_cell_in_row
        });

        adapterManager.saveCells($block);
    };

    $('#mobile_columns_popover').find('button').bind('click', f.btn_click);

    //$('#sections_list, #popup_list').on('click', '.blk_container .cont-st', f.click);
})();

/* Настройка режима */
(function () {
    var f = {};
    var v = {};

    v.$responsive_menu = $('.responsive_menu');
    v.$responsive_menu_title = v.$responsive_menu.find('#responsive_menu_title:first');
    v.$mobile_responsive_settings = v.$responsive_menu.find('#mobile_responsive_settings:first');
    v.$desktop_responsive_settings = v.$responsive_menu.find('#desktop_responsive_settings:first');
    v.$responsive_menu_items = v.$responsive_menu.find('.responsive_menu_item');
    v.$switch_state_text = v.$mobile_responsive_settings.find('.switch_state');

    f.set_view = function () {
        var $ob = $(this);
        v.$responsive_menu_items.removeClass('item_on');
        $ob.addClass('item_on');
        v.$responsive_menu_title.removeClass('fa-desktop').removeClass('fa-mobile');

        if ("mobile370" == $ob.attr('version')) {
            v.$responsive_menu_title.addClass('fa-mobile');
        } else {
            v.$responsive_menu_title.addClass('fa-desktop');
        }

        adapterManager.setVersion($ob.attr('version'));

        v.$desktop_responsive_settings.hide();
        v.$mobile_responsive_settings.hide();

        return false;
    };

    f.toggle_settings = function () {
        v.$mobile_responsive_settings.toggle();
        v.$desktop_responsive_settings.hide();
        return false;
    };

    f.toggle_settings_desktop = function () {
        v.$desktop_responsive_settings.toggle();
        v.$mobile_responsive_settings.hide();

        var f_desktop_responsive_settings = function () {
            v.$desktop_responsive_settings.hide();
            // Отмена не сохраненной ширины экрана для десктоп версии
            if (adapterManager.isPC()) {
                site_width_manager.cancelBtnClick();
            }

            $(document).off('click', 'body', f_desktop_responsive_settings);
        };

        $(document).on('click', 'body', f_desktop_responsive_settings);

        return false;
    };

    f.switch = function () {
        var $ob = $(this);
        var value = 0;

        $ob.removeClass('on');

        if ($ob.hasClass('off')) {
            $ob.removeClass('off').addClass('on');
            value = 1;
            v.$switch_state_text.text('Включена');
        } else {
            $ob.removeClass('on').addClass('off');
            value = 0;
            v.$switch_state_text.text('Отключена');
        }

        saveMan.add('save_adaptive_settings', {
            "type": "mobile370",
            "value": value
        });

        return false;
    };

    $(document).on('click', '.responsive_menu_item', f.set_view);
    $(document).on('click', '#responsive_menu_item-mobile .fa-cog', f.toggle_settings);
    $(document).on('click', '#responsive_menu_item-desktop .fa-cog', f.toggle_settings_desktop);
    $(document).on('click', '#mobile_responsive_settings .mini.switch', f.switch);

    if (v.$mobile_responsive_settings.length > 0) {
        $(document).on('click', '#mobile_responsive_settings', function () {
            return false;
        });
        $(document).on('click', 'body', function () {
            v.$mobile_responsive_settings.hide();
        });
    }
})();

/* контролы для модалок */
(function () {
    var f = {};

    f.ico_click = function () {
        pages_editor.editBlock($(this).closest('.blk').attr('id'));
        paneStore.panes['button_popup'].$btnWnd.click();
    };

    $(document).on('click', ' .mobile_control .open-section-popup', f.ico_click);
})();