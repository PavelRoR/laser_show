(function(){
    function YmisManager() {
        this.module_class = 'yandex_money_ind';
        this.form_root = $();
        this.module_price_id = false;

        this.submitFormSettings = function () {
            var data = {};
            var no_errors = true;

            ymis_manager.form_root = $('#yandex-money-ind-settings');

            ymis_manager.form_root.find('input').each(function () {
                if ($(this).attr('type') == 'checkbox') {
                    data[$(this).attr('name')] = $(this).prop('checked') ? 1 : 0;
                } else {
                    data[$(this).attr('name')] = $(this).val().trim();
                }
            });

            var errors = ymis_manager.validateFormSettings(data);

            for (var index in errors) {
                ymis_manager.form_root.find('div[parent-name=' + index + ']:first').html(errors[index].join('<br/>'));

                if (errors[index].length > 0) {
                    no_errors = false;

                    if (index == 'successURL') {
                        ymis_manager.form_root.find('#form_conf_buy_more').addClass('in').css({'height': 'auto'});
                    }
                }
            }

            if (no_errors) {
                var params = {
                    settings: data
                };
                params['form_id'] = pages_editor.$bottomEditor.data('curSmartObj').id;
                params['module_class'] = ymis_manager.module_class;

                saveMan.add('save_ymis_settings', params);
            }
        };

        this.onSaveSettings = function (params) {
            if (!paneStore.editor.data('curSmartObj').data.wallets[ymis_manager.module_class]) {
                paneStore.editor.data('curSmartObj').data.wallets[ymis_manager.module_class] = {};
            }
            paneStore.editor.data('curSmartObj').data.wallets[ymis_manager.module_class].settings = params.settings;
            var temp = {};
            temp[ymis_manager.module_class] = {
                settings: params.settings
            };
            paneStore.editor.data('curSmartObj').$inputWallets.val(LpmBase64.encode(JSON.stringify(temp)));

            $('#tabEditFrom').find('#frm' + paneStore.editor.data('curSmartObj').data.id + ':first').find('input[name=wallets]').val(paneStore.editor.data('curSmartObj').$inputWallets.val());
        };

        this.clearFormSettings = function ($form) {
            if ($.inArray(ymis_manager.module_class, sitesMan.modules_list) < 0) {
                $('#yandex-money-ind-settings').find('.lock-ind-settings:first').show();
            } else {
                $('#yandex-money-ind-settings').find('.lock-ind-settings:first').hide();
            }

            $form.find('input').each(function () {
                ymis_manager.form_root.find('div[parent-name=' + $(this).attr('name') + ']:first').html('');

                if ($(this).attr('type') == 'checkbox') {
                    $(this).prop('checked', false);
                } else {
                    $(this).val('');
                }
            });
        };

        this.validateFormSettings = function (data) {
            var errors = {};

            for (var index in data) {

                errors[index] = new Array();

                if ($.inArray(index, ['wallet_number', 'targets', 'amount']) >= 0 && data[index].length == 0) {
                    errors[index].push('Поле обязательно для заполнения');
                }

                switch (index) {
                    case 'wallet_number':
                        if (/[^[0-9]/.test(data[index])) {
                            errors[index].push('Неверный формат. Допустимы только цифры');
                        }
                        break;
                    case 'amount':
                        data[index] = data[index].split(',').join('.');
                        if (/^\.|\d+\..*\.|[^\d\.{1}]/.test(data[index])) {
                            errors[index].push('Неверный формат. Допустимы только цифры');
                        }
                        break;
                    case 'successURL':
                        if (data[index].length > 0 && data[index].indexOf('http://') == -1 && data[index].indexOf('https://') == -1) {
                            errors[index].push('неверный формат URL');
                        }
                        break;
                    case 'targets':
                        if (data[index].length > 150) {
                            errors[index].push('максимальное значение поля 150 символов');
                        }
                        break;
                    case 'formcomment':
                        if (data[index].length > 50) {
                            errors[index].push('максимальное значение поля 50 символов');
                        }
                        break;
                }
            }

            return errors;
        };

        this.loadFormSettings = function (data) {
            var $input = $();
            var $form = $('#yandex-money-ind-settings');

            if ($form.length == 0) {
                return;
            }

            ymis_manager.clearFormSettings($form);

            if (typeof (data[ymis_manager.module_class]) == "undefined") {
                return;
            }

            for (var index in data[ymis_manager.module_class].settings) {
                $input = $form.find('input[name=' + index + ']');
                if ($input.attr('type') == 'checkbox') {
                    $input.prop('checked', data[ymis_manager.module_class].settings[index] == 1);
                } else {
                    $input.val(data[ymis_manager.module_class].settings[index]);
                }
            }
        };

        this.submitLeadForm = function (form_id, lead_id, key, type) {
            var label = LpmBase64.encode(JSON.stringify({
                "lead_id": lead_id,
                "key": key
            }));

            var $form = $('#ymis_' + form_id);

            $form.find('input[name=paymentType]').val(type);
            $form.find('input[name=label]').val(label);

            $form.submit();
        };

        this.enabledModule = function () {
            var lock_id = lockScreen('Подключаем модуль!', {show_animation: true});

            saveMan.add('enabled_ymis_module', {"module_class": ymis_manager.module_class, "lock_id": lock_id});
        };

        this.afterEnabledModule = function (lock_id) {
            $('#yandex-money-ind-settings').find('#ymis-enabled-text:first').hide();
            $('#yandex-money-ind-settings').find('#ymis-msg:first').show();

            setTimeout(function () {
                $('#yandex-money-ind-settings').find('.lock-ind-settings:first').hide();
            }, 2000);

            if ($.inArray(ymis_manager.module_class, sitesMan.modules_list) < 0) {
                sitesMan.modules_list.push(ymis_manager.module_class);
            }

            unlockScreen(lock_id);
        }
    }

    FE.runOnReady(function(){
        window.ymis_manager = new YmisManager();
    });
})();