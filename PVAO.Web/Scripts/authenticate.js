var Authenticate = function () {
    var form = this;
    //var baseUrl = JSON.parse(localStorage.getItem("api")).baseUrl;
    var baseUrl = 'http://172.16.1.113:3020';

    form._construct = function () {
        form._events();

        $('#page-loader').hide();

        $('#login-validation-alert').hide();
    },
    form._events = function () {
        $('#password-text').keydown(function (e) { 
            var keyCode = (event.keyCode ? event.keyCode : event.which);

            if (keyCode == 13) {
                $('#login-btn').trigger('click');
            }
        });

        $('#login-btn').click(function (e) {
            e.preventDefault();

            $('#page-loader').fadeIn();

            if (form.validateRequiredFields()) {
                $.post(`${baseUrl}/auth/login?username=${$('#username-text').val()}&password=${$("#password-text").val()}`)
                    .done(function (data) {
                        if (data.userId !== null && data.token != null) {
                            sessionStorage.setItem("auth", JSON.stringify(data));

                            $('#redirect-home-btn').click();
                        } else {
                            if (data === 32001)
                                $('#login-wrapper .validation').text('Invalid username or password combination. Please try again.');
                            else if (data === 36098)
                                $('#login-wrapper .validation').text('Your account has expired. Please contact your system administrator.');
                            else if (data === 40195)
                                $('#login-wrapper .validation').text('Your account has been locked. Please contact your system administrator.');
                            else if (data === 68868)
                                $('#login-wrapper .validation').text('Your account is inactive. Please contact your system administrator.');
                            else
                                $('#login-wrapper .validation').text('You\'ve reached the maximum login limit. Your account has been locked.');

                            $('#login-validation-alert').show();
                        }

                        $('#page-loader').fadeOut();
                    }).fail(function (error) {
                        console.log('There is a problem fetching on benefit status. Please try again later.');
                    }
                );
            } else {
                $('#login-wrapper .validation').text('Please enter your username and password.');

                $('#login-validation-alert').show();

                $('#page-loader').fadeOut();
            }
        });

        $('#redirect-home-btn').click(function (e) {
            e.preventDefault();

            var auth = JSON.parse(sessionStorage.getItem('auth'));

            $.ajax({
                type: 'POST',
                url: $('#login-wrapper').attr('data-inject-user-session-url'),
                data: JSON.stringify({ authUserId: auth.userId }),
                contentType: 'application/json; charset=utf-8',
                success: function (response) {
                    window.location.href = "/Home/Index";
                },
                error: function (err) {
                    console.log(err);

                    $('#page-loader').fadeOut();
                },
                async: true
            });
        });
    },
    form.validateRequiredFields = function () {
        var required = true;

        if ($('#username-text').val() === '')
            required = false;

        if ($('#password-text').val() === '')
            required = false;

        return required;
    }
}

var myClass = new Authenticate();
myClass._construct();