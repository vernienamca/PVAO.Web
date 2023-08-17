var User = function () {
    var form = this;

    form._construct = function () {
        var url = window.location.href;

        form._events();

        if (url.split('/')[4] !== "Users") {
            var userId = url.substring(url.lastIndexOf('/') + 1);

            $('#user-validation-alert').hide();
            $('#user-updated-alert').hide();
            $('#user-role-added-alert').hide();

            if (!isNaN(userId)) {
                $('#page-wrapper .header-text').html('Edit User');
                $('#page-wrapper .subheader-text').html('Edit User');

                localStorage.removeItem('tempUserRoles');

                form.getUser(userId);

                form.getUserRoles(userId, $('#user-role-search-text').val());
            } else {
                $('#user-role-tab').hide();

                $('#user-locked-note').hide();
                $('#user-avatar-name-container').hide();
                $('#user-avatar-address-container').hide();
                $('#member-since-container').hide();
            }
        } else {
            form.getUsers(1, $('#user-wrapper .user-search').val());
        }
    },
    form._events = function () {
        var url = window.location.href;
        var userId = parseInt(url.substring(url.lastIndexOf('/') + 1));

        $(document).on("click", "#page-wrapper .add-user-btn", function (e) {
            e.preventDefault();

            window.location.href = "/Administration/AddUser";
        });

        $(document).keypress(function (e) {
            if (e.which == 13) {
                e.preventDefault();

                console.log(e.target.id);

                if (e.target.id === 'user-search-text') {
                    form.getUsers(1, $('#' + e.target.id).val());
                } else if (e.target.id === 'user-role-modal-search-text') {
                    var arrAddedRoles = [];

                    $('#user-roles-table tr').each(function () {
                        if ($(this).find(".role-id").html() !== undefined) {
                            arrAddedRoles.push($(this).find(".role-id").html());
                        }
                    });

                    form.getRoles(1, arrAddedRoles, $('#user-role-modal-search-text').val());
                } else if (e.target.id === 'user-role-search-text') {
                    localStorage.removeItem('tempUserRoles');

                    form.getUserRoles(userId, $('#user-role-search-text').val());
                }
            }
        });

        $(document).on("click", "#page-wrapper .search-user-btn", function (e) {
            e.preventDefault();

            form.getUsers(1, $('#user-search-text').val());
        });

        $(document).on('click', '#user-wrapper .user-pagination ul > li', function (e) {
            e.preventDefault();

            var currentActivePage = $("#user-wrapper .user-pagination ul .active").text();
            var currentPage = parseInt(currentActivePage) + 1;

            if (e.target.innerText === '<' || e.target.innerText === '>')
                currentPage = (e.target.innerText !== '<') ? parseInt(currentActivePage) + 1 : parseInt(currentActivePage) - 1;
            else
                currentPage = parseInt(e.target.innerText);

            form.getUsers(currentPage, $('#user-wrapper .user-search').val());
        });

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
            var userId = url.substring(url.lastIndexOf('/') + 1);

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
                fileData.append('id', userId);
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
                        $('#user-updated-alert').show();

                        window.setTimeout(function () {
                            window.location.href = '/Administration/AddUser/' + userId;
                        }, 3000);

                        $(window).scrollTop(0);
                    }
                }).fail(function (error) { });
            } else {
                $('#user-validation-alert').show();

                $(window).scrollTop(0);
            }
        });

        $('#page-wrapper .user-add-role-btn').click(function (e) {
            e.preventDefault();

            var arrAddedRoles = [];

            $('#user-roles-table tr').each(function () {
                if ($(this).find(".role-id").html() !== undefined) {
                    arrAddedRoles.push(parseInt($(this).find(".role-id").html()));
                }
            });

            form.getRoles(1, arrAddedRoles, $('#user-role-modal-search-text').val());

            $('#user-role-modal').modal('toggle');
        });

        $(document).on("click", "#user-role-table-modal tbody tr td .add-btn", function (e) {
            e.preventDefault();

            var userId = url.substring(url.lastIndexOf('/') + 1);

            var arrUserRoles = JSON.parse(localStorage.getItem('tempUserRoles'));

            if (arrUserRoles.find(x => x.roleId === parseInt($(this).attr('data-id'))) === undefined) {
                arrUserRoles.push({
                    id: 0,
                    roleId: parseInt($(this).attr('data-id')),
                    roleName: $(this).attr('data-name')
                });
            }

            localStorage.setItem('tempUserRoles', JSON.stringify(arrUserRoles));

            form.getUserRoles(userId, $('#user-role-search-text').val(), 1);

            $('#user-role-added-alert').show();
            $('#user-role-alert-text').text('Role was successfully added.');
            setTimeout(function () { $('#user-role-added-alert').hide(); }, 2000);
        });

        $(document).on("click", "#user-roles-table tbody tr td .remove-btn", function (e) {
            e.preventDefault();

            var userId = url.substring(url.lastIndexOf('/') + 1);

            var userRoles = JSON.parse(localStorage.getItem('tempUserRoles'));

            var roleId = parseInt($(this).attr('data-id'));

            userRoles.splice(userRoles.findIndex(function (i) {
                return i.roleId === roleId;
            }), 1);

            localStorage.setItem('tempUserRoles', JSON.stringify(userRoles));

            form.getUserRoles(userId, $('#user-role-search-text').val(), 0);
        });

        $('#user-role-tab').click(function (e) {
            e.preventDefault();
        });

        $('#save-user-role-changes-btn').click(function (e) {
            e.preventDefault();

            var arrRoleIds = [];

            $('#user-roles-table tr').each(function () {
                if ($(this).find(".role-id").html() !== undefined) {
                    arrRoleIds.push(parseInt($(this).find(".role-id").html()));
                }
            });

            if (arrRoleIds !== 0) {
                $.ajax({
                    type: 'POST',
                    url: $('#page-wrapper').attr('data-remove-user-roles-url'),
                    data: JSON.stringify({
                        userId: userId,
                        ids: arrRoleIds
                    }),
                    contentType: 'application/json; charset=utf-8',
                    success: function (response) {
                    },
                    error: function (err) {
                        console.log(err);
                    },
                    async: true
                });
            }

            $('#user-roles-table tr').each(function () {
                if ($(this).find(".role-id").html() !== undefined) {

                    console.log($(this).find(".user-role-id").html());
                    console.log($(this).find(".role-id").html());
                    console.log(userId);

                    $.ajax({
                        type: 'POST',
                        url: $('#page-wrapper').attr('data-save-user-roles-url'),
                        data: JSON.stringify({
                            userRoleId: parseInt($(this).find(".user-role-id").html()),
                            roleId: parseInt($(this).find(".role-id").html()),
                            userId: parseInt(userId)
                        }),
                        contentType: 'application/json; charset=utf-8',
                        success: function (response) {
                            if (response !== null) {
                                $('#user-role-added-alert').show();
                                $('#user-role-alert-text').text('Changes were successfully saved. The page will refresh within 3 seconds...');

                                localStorage.removeItem('tempUserRoles');

                                localStorage.setItem('tempActiveTab', 'userRoles');

                                window.setTimeout(function () {
                                    window.location.href = '/Administration/AddUser/' + response.UserId;
                                }, 3000);
                            }
                        },
                        error: function (err) {
                            console.log("error: " + err);
                        },
                        async: true
                    });
                }
            });
        });
    },
    form.getUsers = function (currentPage, searchText) {
        $.ajax({
            type: 'POST',
            url: $('#page-wrapper').attr('data-get-users-url'),
            data: JSON.stringify({
                currentPage: currentPage,
                searchText: searchText
            }),
            contentType: 'application/json; charset=utf-8',
            success: function (response) {
                var users = response.users;
                var pager = response.pager;

                var htmlContent = '<div class="db-booking-wrap table-content table-responsive">';
                    htmlContent += '<table class="table table-striped">';
                        htmlContent += '<thead>';
                            htmlContent += '<tr>';
                                htmlContent += '<th class="text-left" scope="col">Name</th>';
                                htmlContent += '<th class="text-left" scope="col">Email Address</th>';
                                htmlContent += '<th scope="col">User Status</th>';
                                htmlContent += '<th class="text-left" scope="col">Date Created</th>';
                                htmlContent += '<th class="text-left" scope="col">Created By</th>';
                                htmlContent += '<th scope="col">Actions</th>';
                            htmlContent += '</tr>';
                        htmlContent += '</thead>';
                        htmlContent += '<tbody>';
                        for (var x = 0; x < users.length; x++) {
                                htmlContent += '<tr>';
                                    htmlContent += '<td class="text-left">' + users[x].name + '</td>';
                                    htmlContent += '<td class="text-left" style="text-transform: none;">' + users[x].emailAddress + '</td>';
                                    htmlContent += '<td>' + users[x].userStatus + '</td>';
                                    htmlContent += '<td class="text-left">' + users[x].dateCreated + '</td>';
                                    htmlContent += '<td class="text-left">' + users[x].createdBy + '</td>';
                                    htmlContent += '<td>';
                                        htmlContent += '<a href="/Administration/AddUser/' + users[x].id + '" class="btn v3"><i class="ion-android-locate"></i> View</a> ';
                                    htmlContent += '</td>';
                                htmlContent += '</tr>';
                            }
                        htmlContent += '</tbody>';
                    htmlContent += '</table > ';
                htmlContent += '</div>';

                $('#page-wrapper .user-count').text(pager.TotalItems);

                $('#page-wrapper .user').html(htmlContent);

                if (pager.Pages.length > 1) {
                    var pagination = '<div class="row">';
                        pagination += '<div class="col-xl-6 col-lg-4 col-md-6 col-sm-12">';
                            pagination += '<div class="user-num text-center">';
                                pagination += '<ul>';
                                    if (currentPage !== 1) {
                                        pagination += '<li>';
                                            pagination += '<a href=\"#\"><</a>';
                                        pagination += '</li>';
                                    }
                                   
                                    for (var i = 0; i < userr.Pages.length; i++) {
                                        var activeStyle = (currentPage !== undefined && currentPage !== 0) ? (currentPage) == pager.Pages[i] ? 'active' : '' : (i == 0) ? 'active' : '';

                                        pagination += '<li class="' + activeStyle + '"><a href=\"#\">' + pager.Pages[i] + '</a></li>';
                                    }

                                    if ((userr.EndIndex + 1) !== pager.TotalItems) {
                                        pagination += '<li>';
                                            pagination += '<a href=\"#\">></a>';
                                        pagination += '</li>';
                                    }
                                pagination += '</ul>';
                            pagination += '</div>';
                        pagination += '</div>';
                        pagination += '<div class="col-xl-6 col-lg-4 col-md-6 col-sm-12">';
                            pagination += '<div class="item-element res-box  text-right sm-left">';
                                pagination += '<p>Showing ' + (pager.StartIndex + 1) + ' to ' + (pager.EndIndex + 1) + '  of ' + pager.TotalItems.toLocaleString("en") + ' entries.</p>';
                            pagination += '</div>';
                        pagination += '</div>';
                    pagination += '</div>';

                    $('#user-wrapper .user-pagination').html(pagination);
                }
            },
            error: function (err) {
                console.log("error: " + err);
            },
            async: true
        });
    },
    form.getUser = function (id) {
        $.ajax({
            type: 'GET',
            url: $('#page-wrapper').attr('data-get-user-url'),
            data: { 'id': id },
            contentType: 'application/json; charset=utf-8',
            success: function (response) {
                var user = response[0];

                var splittedExpirationDate = user.expirationDate.split(' ')[0].split('/');

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
    form.getUserRoles = function (userId, searchText, roleModal) {
        $.ajax({
            type: 'POST',
            url: $('#page-wrapper').attr('data-get-user-roles-url'),
            data: JSON.stringify({
                userId: userId,
                searchText: searchText
            }),
            contentType: 'application/json; charset=utf-8',
            success: function (response) {
                var userRoles = response.userRoles;

                if (localStorage.getItem("tempUserRoles") === null) {
                    var arrUserRoles = [];

                    for (var x = 0; x < userRoles.length; x++) {
                        arrUserRoles.push({
                            id: userRoles[x].id,
                            roleId: userRoles[x].roleId,
                            roleName: userRoles[x].roleName
                        });
                    }

                    localStorage.setItem('tempUserRoles', JSON.stringify(arrUserRoles));
                }

                var arrUserRoles = JSON.parse(localStorage.getItem('tempUserRoles'));

                var htmlContent = '<div class="db-booking-wrap table-content table-responsive">';
                    htmlContent += '<table id="user-roles-table" class="table table-striped">';
                        htmlContent += '<thead>';
                            htmlContent += '<tr>';
                                htmlContent += '<th class="text-left" scope="col">Role Name</th>';
                                htmlContent += '<th scope="col">Action</th>';
                            htmlContent += '</tr>';
                        htmlContent += '</thead>';
                        htmlContent += '<tbody>';
                            for (var x = 0; x < arrUserRoles.length; x++) {
                                htmlContent += '<tr>';
                                    htmlContent += '<td class="user-role-id" style="display: none;">' + arrUserRoles[x].id + '</td>';
                                    htmlContent += '<td class="role-id" style="display: none;">' + arrUserRoles[x].roleId + '</td>';
                                    htmlContent += '<td class="text-left">' + arrUserRoles[x].roleName + '</td>';
                                    htmlContent += '<td>';
                                        htmlContent += '<button data-id=\"' + arrUserRoles[x].roleId + '\" type="button" class="remove-btn btn btn-danger btn-sm"><i class="fa fa-times-circle"></i> Remove</button>';
                                    htmlContent += '</td>';
                                htmlContent += '</tr>';
                            }

                            if (arrUserRoles.length != 0)
                                $('#user-role-no-available').hide();
                            else
                                $('#user-role-no-available').show();

                        htmlContent += '</tbody>';
                    htmlContent += '</table > ';
                htmlContent += '</div>';

                $('#page-wrapper .user-role').html(htmlContent);

                if (roleModal !== undefined) {
                    var arrAddedRoles = [];

                    $('#user-roles-table tr').each(function () {
                        if ($(this).find(".role-id").html() !== undefined) {
                            arrAddedRoles.push($(this).find(".role-id").html());
                        }
                    });

                    form.getRoles(1, arrAddedRoles, $('#user-role-modal-search-text').val());
                }
            },
            error: function (err) {
                console.log("error: " + err);
            },
            async: true
        });
    },
    form.getRoles = function (currentPage, addedRoles, searchText) {
        $.ajax({
            type: 'POST',
            url: $('#page-wrapper').attr('data-get-page-roles-url'),
            data: JSON.stringify({
                currentPage: currentPage,
                addedRoles: addedRoles,
                searchText: searchText
            }),
            contentType: 'application/json; charset=utf-8',
            success: function (response) {
                var roles = response.roles;
                var pager = response.pager;

                var htmlContent = '<div class="db-booking-wrap table-content table-responsive">';
                    htmlContent += '<table id="user-role-table-modal" class="table table-striped">';
                        htmlContent += '<thead>';
                            htmlContent += '<tr>';
                                htmlContent += '<th class="text-left" scope="col">Role Name</th>';
                                htmlContent += '<th scope="col">Action</th>';
                            htmlContent += '</tr>';
                        htmlContent += '</thead>';
                        htmlContent += '<tbody>';
                        for (var x = 0; x < roles.length; x++) {
                                htmlContent += '<tr>';
                                    htmlContent += '<td class="text-left">' + roles[x].roleName + '</td>';
                                    htmlContent += '<td>';
                                        if (roles[x].status === 0)
                                            htmlContent += '<button data-id=\"' + roles[x].id + '\" data-name=\"' + roles[x].roleName + '\" type="button" class="add-btn btn btn-primary btn-sm"><i class="fa fa-plus-circle"></i> Add</button>';
                                        else 
                                            htmlContent += '<span class="badge badge-secondary"><i>Added</i></span>';
                                    htmlContent += '</td>';
                                htmlContent += '</tr>';
                            }
                        htmlContent += '</tbody>';
                    htmlContent += '</table > ';
                htmlContent += '</div>';

                $('#page-wrapper .user-role-modal-count').text(pager.TotalItems);

                $('#page-wrapper .user-role-modal-grid').html(htmlContent);

                if (pager.Pages.length > 1) {
                    var pagination = '<div class="row">';
                        pagination += '<div class="col-xl-6 col-lg-4 col-md-6 col-sm-12">';
                            pagination += '<div class="page-num text-center">';
                                pagination += '<ul>';
                                    if (currentPage !== 1) {
                                        pagination += '<li>';
                                            pagination += '<a href=\"#\"><</a>';
                                        pagination += '</li>';
                                    }
                                   
                                    for (var i = 0; i < pager.Pages.length; i++) {
                                        var activeStyle = (currentPage !== undefined && currentPage !== 0) ? (currentPage) == pager.Pages[i] ? 'active' : '' : (i == 0) ? 'active' : '';

                                        pagination += '<li class="' + activeStyle + '"><a href=\"#\">' + pager.Pages[i] + '</a></li>';
                                    }

                                    if ((pager.EndIndex + 1) !== pager.TotalItems) {
                                        pagination += '<li>';
                                            pagination += '<a href=\"#\">></a>';
                                        pagination += '</li>';
                                    }
                                pagination += '</ul>';
                            pagination += '</div>';
                        pagination += '</div>';
                        pagination += '<div class="col-xl-6 col-lg-4 col-md-6 col-sm-12">';
                            pagination += '<div class="item-element res-box  text-right sm-left">';
                                pagination += '<p>Showing ' + (pager.StartIndex + 1) + ' to ' + (pager.EndIndex + 1) + '  of ' + pager.TotalItems.toLocaleString("en") + ' entries.</p>';
                            pagination += '</div>';
                        pagination += '</div>';
                    pagination += '</div>';

                    $('#page-wrapper .user-role-modal-pagination').html(pagination);
                }
            },
            error: function (err) {
                console.log("error: " + err);
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

var myClass = new User();
myClass._construct();