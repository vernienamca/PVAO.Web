var MyProfile = function () {
    var form = this;

    form._construct = function () {
        var url = window.location.href;

        form._events();

        $('#profile-validation-alert').hide();
        $('#profile-updated-alert').hide();

        form.getUser();
    },
    form._events = function () {
        var url = window.location.href;

        $('#user-change-profile-btn').click(function (e) {
            e.preventDefault();

            $('#user-avatar-upload').trigger('click');
        });

        $('#user-avatar-upload').change(function () {
            var input = this;
            var url = $(this).val();
            var ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();

            if (input.files && input.files[0] && (ext == "gif" || ext == "png" || ext == "jpeg" || ext == "jpg")) {
                var reader = new FileReader();

                reader.onload = function (e) {
                    $('#user-avatar-img').attr('src', e.target.result);

                    $('#file-name-hidden').val($('input[type=file]').val().replace(/C:\\fakepath\\/i, ''));
                }
                reader.readAsDataURL(input.files[0]);
            }
            else
            {
                $('#user-avatar-img').attr('src', '/Content/images/avatar/no-image-available.jpg');

                alert('Uploaded file is not a valid image. Only GIF, PNG, JPEG and JPG files are allowed.');
            }
        });

        $('#save-user-btn').click(function (e) {
            e.preventDefault();

            if (form.validateRequiredFields()) {
                var fileUpload = $("#user-avatar-upload").get(0);
                var files = fileUpload.files;
                var fileData = new FormData();

                // Looping over all files and add it to FormData object  
                for (var i = 0; i < files.length; i++) {
                    fileData.append(files[i].name, files[i]);
                }

                if ($('#file-name-hidden').val() !== null) {
                    fileData.append('fileName', $('#file-name-hidden').val());
                }

                // Adding key to FormData object  
                fileData.append('id', $('#user-id-hidden').val());
                fileData.append('firstName', $('#user-first-name-text').val());
                fileData.append('emailAddress', $('#user-email-text').val());
                fileData.append('username', $('#user-username-text').val());
                fileData.append('userStatus', parseInt($("#user-status-ddl option:selected").val()));
                fileData.append('lastName', $('#user-last-name-text').val());
                fileData.append('phone', $('#user-phone-text').val());
                fileData.append('password', $('#user-password-text').val());
                fileData.append('expirationDate', $('#user-expiration-date-text').val());
                fileData.append('address', $('#user-address-text').val());

                $.ajax({
                    type: 'POST',
                    url: $('#page-wrapper').attr('data-save-user-url'),
                    contentType: false,
                    processData: false,
                    data: fileData
                }).done(function (response) {
                    if (response.status === 1) {
                        $('#profile-updated-alert').show();

                        window.setTimeout(function () {
                            window.location.href = '/Administration/MyProfile/';
                        }, 3000);

                        $(window).scrollTop(0);
                    }
                }).fail(function (error) { });
            } else {
                $('#user-validation-alert').show();

                $(window).scrollTop(0);
            }
        });
    },
    form.getUser = function () {
        $.ajax({
            type: 'GET',
            url: $('#page-wrapper').attr('data-get-myprofile-url'),
            contentType: 'application/json; charset=utf-8',
            success: function (response) {
                var user = response[0];

                var splittedExpirationDate = user.expirationDate.split(' ')[0].split('/');

                $('#user-id-hidden').val(user.id);
                $('#user-first-name-text').val(user.firstName);
                $('#user-email-text').val(user.emailAddress);
                $('#user-username-text').val(user.userName);
                $("#user-status-ddl").val(user.userStatus).change();
                $('#user-last-name-text').val(user.lastName);
                $('#user-phone-text').val(user.phoneNumber);
                $('#user-password-text').val(user.password);
                $('#user-expiration-date-text').val(`${splittedExpirationDate[1]}-${splittedExpirationDate[0]}-${splittedExpirationDate[2]}`);
                $('#user-address-text').val(user.address);
                $('#user-created-by').text(user.createdBy);
                $('#user-date-created').text(user.dateCreated);
                $('#user-updated-by').text(user.updatedBy);
                $('#user-date-updated').text(user.dateUpdated);
                $('#user-max-sign-attempts').text(user.maxSignOnAttempts);
                $('#file-name-hidden').val(user.fileName);
                $('#user-avatar-name').text(`${user.firstName} ${user.lastName}`);
                $('#user-avatar-address').text(user.address);
                $('#user-member-since').text(moment(user.dateCreated).format('LL'));
                $('#user-avatar-img').attr('src', user.avatarUrl);

                if (localStorage.getItem("tempActiveTab") !== null) {
                    $('#user-role-tab').tab('show');

                    localStorage.removeItem("tempActiveTab");
                }
            },
            error: function (err) {
                console.log(err);
            },
            async: true
        });
    },
    form.validateRequiredFields = function () {
        var required = true;

        if ($('#user-first-name-text').val() === '')
            required = false;

        if ($('#user-email-text').val() === '')
            required = false;

        if ($('#user-username-text').val() === '')
            required = false;

        if ($('#user-last-name-text').val() === '')
            required = false;

        if ($('#user-password-text').val() === '')
            required = false;

        if ($('#user-expiration-date-text').val() === '')
            required = false;

        if ($('#user-address-text').val() === '')
            required = false;

        return required;
    }
}

var myClass = new MyProfile();
myClass._construct();