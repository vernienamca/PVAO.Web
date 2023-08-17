var Settings = function () {
    var form = this;

    form._construct = function () {
        var url = window.location.href;

        form._events();

        $('#general-updated-alert').hide();
        $('#general-validation-alert').hide();
        $('#settings-validation-alert').hide();
        $('#password-validation-alert').hide();

        form.getSettings(1);
    },
        form._events = function () {
            $('#save-settings-btn').click(function (e) {
                e.preventDefault();

                if (form.validateCompanyRequiredFields()) {
                    if (form.validateSMTPRequiredFields()) {
                        if (form.validatePasswordRequiredFields()) {
                            $.ajax({
                                type: 'POST',
                                url: $('#page-wrapper').attr('data-save-settings-url'),
                                data: JSON.stringify({
                                    id: 1,
                                    companyName: $("#company-name-text").val(),
                                    address: $("#company-address-text").val(),
                                    emailAddress: $("#company-email-text").val(),
                                    phoneNumber: $("#phone-number-text").val(),
                                    mobileNumber: $("#company-mobile-text").val(),
                                    aboutUs: $("#about-us-text").val(),
                                    facebook: $("#facebook-account-text").val(),
                                    fromEmail: $("#settings-from-email-text").val(),
                                    fromName: $("#settings-from-name-text").val(),
                                    serverName: $("#settings-server-name-text").val(),
                                    smtpPort: parseInt($("#smtp-port-text").val()),
                                    username: $("#settings-username-text").val(),
                                    password: $("#settings-password-text").val(),
                                    enableSSL: $('#enable-ssl-check').prop('checked'),
                                    maxSignOnAttempts: parseInt($("#max-signon-attempts-text").val()),
                                    expiresIn: parseInt($("#settings-expires-in-text").val()),
                                    minPasswordLength: parseInt($("#min-password-length-text").val()),
                                    minSpecialCharacters: parseInt($("#min-special-char-text").val()),
                                    enforcePasswordHistory: parseInt($("#enforce-password-history-ddl option:selected").val())
                                }),
                                dataType: 'json',
                                contentType: 'application/json; charset=utf-8'
                            }).done(function (response) {
                                if (response !== null) {
                                    $('#settings-validation-alert').hide();

                                    $('#general-updated-alert').show();

                                    //form.saveAuditLog(`Updated configuration settings`, "Settings");

                                    $(window).scrollTop(0);

                                    window.setTimeout(function () {
                                        window.location.href = '/Settings/Index';
                                    }, 3000);
                                }
                            }).fail(function (err) {
                                console.log(err)
                            });
                        } else {
                            $('#password-validation-alert').show();

                            $('#password-tab').tab('show');

                            $(window).scrollTop(0);
                        }
                    } else {
                        $('#settings-validation-alert').show();

                        $('#smtp-tab').tab('show');

                        $(window).scrollTop(0);
                    }
                } else {
                    $('#general-validation-alert').show();

                    $('#general-tab').tab('show');

                    $(window).scrollTop(0);
                }
            });
        },
        form.getSettings = function (id) {
            $.ajax({
                type: 'GET',
                url: $('#page-wrapper').attr('data-get-settings-url'),
                data: { 'id': id },
                contentType: 'application/json; charset=utf-8',
                success: function (response) {
                    var settings = response[0];

                    $('#company-name-text').val(settings.companyName);
                    $('#phone-number-text').val(settings.phoneNumber);
                    $('#company-email-text').val(settings.emailAddress);
                    $('#company-mobile-text').val(settings.mobileNumber);
                    $('#company-address-text').val(settings.address);
                    $('#about-us-text').val(settings.aboutUs);
                    $('#facebook-account-text').val(settings.facebook);
                    $('#settings-from-email-text').val(settings.fromEmail);
                    $('#settings-from-name-text').val(settings.fromName);
                    $('#settings-server-name-text').val(settings.serverName);
                    $('#smtp-port-text').val(settings.smtpPort);
                    $('#settings-username-text').val(settings.username);
                    $('#settings-password-text').val(settings.password);
                    $('#enable-ssl-check').prop('checked', settings.enableSSL);
                    $('#max-signon-attempts-text').val(settings.maxSignOnAttempts);
                    $('#settings-expires-in-text').val(settings.expiresIn);
                    $('#min-password-length-text').val(settings.minPasswordLength);
                    $('#min-special-char-text').val(settings.minSpecialCharacters);
                    $("#enforce-password-history-ddl").val(settings.enforcePasswordHistory).change();
                    $('#settings-created-by').text(settings.createdBy);
                    $('#settings-date-created').text(settings.dateCreated);
                    $('#settings-updated-by').text(settings.updatedBy);
                    $('#settings-date-updated').text(settings.dateUpdated);
                },
                error: function (err) {
                    console.log(err);
                },
                async: true
            });
        },
        form.validateCompanyRequiredFields = function () {
            var required = true;

            if ($('#company-name-text').val() === '')
                required = false;

            if ($('#phone-number-text').val() === '')
                required = false;

            if ($('#company-email-text').val() === '')
                required = false;

            if ($('#company-mobile-text').val() === '')
                required = false;

            if ($('#company-address-text').val() === '')
                required = false;

            return required;
        },
        form.validateSMTPRequiredFields = function () {
            var required = true;

            if ($('#settings-from-email-text').val() === '')
                required = false;

            if ($('#settings-from-name-text').val() === '')
                required = false;

            if ($('#settings-server-name-text').val() === '')
                required = false;

            if ($('#smtp-port-text').val() === '')
                required = false;

            if ($('#settings-username-text').val() === '')
                required = false;

            if ($('#settings-password-text').val() === '')
                required = false;

            return required;
        },
        form.validatePasswordRequiredFields = function () {
            var required = true;

            if ($('#max-signon-attempts-text').val() === '')
                required = false;

            if ($('#settings-expires-in-text').val() === '')
                required = false;

            if ($('#min-password-length-text').val() === '')
                required = false;

            if ($('#min-special-char-text').val() === '')
                required = false;

            return required;
        }
}

var myClass = new Settings();
myClass._construct();