var Role = function () {
    var form = this;

    form._construct = function () {
        var url = window.location.href;

        form._events();

        if (url.split('/')[4] !== "Roles") {
            var roleId = url.substring(url.lastIndexOf('/') + 1);

            $('#role-validation-alert').hide();
            $('#role-updated-alert').hide();

            if (!isNaN(roleId)) {
                $('#page-wrapper .header-text').html('Edit Role');
                $('#page-wrapper .subheader-text').html('Edit Role');

                form.getRole(roleId);
            }
        } else {
            form.getRoles(1, $('#role-search-text').val());
        }
    },
    form._events = function () {
        $(document).on("click", "#page-wrapper .add-role-btn", function (e) {
            e.preventDefault();

            window.location.href = "/Administration/AddRole";
        });

        $(document).on('click', '#page-wrapper .role-pagination ul > li', function (e) {
            e.preventDefault();

            var currentActivePage = $("#page-wrapper .role-pagination ul .active").text();
            var currentPage = parseInt(currentActivePage) + 1;

            if (e.target.innerText === '<' || e.target.innerText === '>')
                currentPage = (e.target.innerText !== '<') ? parseInt(currentActivePage) + 1 : parseInt(currentActivePage) - 1;
            else
                currentPage = parseInt(e.target.innerText);

            form.getRoles(currentPage, $('#role-search-text').val());
        });

        $(document).keypress(function (e) {
            if (e.which == 13) {
                e.preventDefault();

                if (e.target.id === 'role-search-text') {
                    form.getRoles(1, $('#' + e.target.id).val());
                }
            }
        });

        $(document).on("click", "#page-wrapper .search-role-btn", function (e) {
            e.preventDefault();

            form.getRoles(1, $('#role-search-text').val());
        });

        $('#save-role-btn').click(function (e) {
            e.preventDefault();

            var url = window.location.href;
            var roleId = !isNaN(url.substring(url.lastIndexOf('/') + 1)) ? url.substring(url.lastIndexOf('/') + 1) : 0;

            if (form.validateRequiredFields()) {
                var roleName = $("#role-name-text").val();

                $.ajax({
                    type: 'POST',
                    url: $('#page-wrapper').attr('data-save-role-url'),
                    data: JSON.stringify({
                        id: parseInt(roleId),
                        roleName: roleName,
                        description: $("#role-description-text").val()
                    }),
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8'
                }).done(function (response) {
                    if (response !== null) {
                        $('#role-validation-alert').hide();

                        $('#role-updated-alert').show();

                        window.setTimeout(function () {
                            window.location.href = '/Administration/AddRole/' + response.Id;
                        }, 2000);
                    }
                }).fail(function (err) { });
            } else {
                $('#role-validation-alert').show();

                $(window).scrollTop(0);
            }
        });

        $(document).on("click", "#role-table tbody tr td .remove-btn", function (e) {
            e.preventDefault();

            var roleName = $(this).attr('data-name');

            if (!confirm('Are you sure, you want to delete this role?')) return false;

            $.ajax({
                type: 'POST',
                url: $('#page-wrapper').attr('data-delete-role-url'),
                data: JSON.stringify({ id: parseInt($(this).attr('data-id')) }),
                dataType: 'json',
                contentType: 'application/json; charset=utf-8'
            }).done(function (response) {
                if (response !== 2) {
                    window.setTimeout(function () {
                        window.location.href = '/Administration/Roles';
                    }, 2000);
                } else {
                    alert('Unable to delete. This record is being used by the system!');
                }

            }).fail(function (err) { });
        });
    },
    form.getRoles = function (currentPage, searchText) {
        $.ajax({
            type: 'POST',
            url: $('#page-wrapper').attr('data-get-roles-url'),
            data: JSON.stringify({
                currentPage: currentPage,
                searchText: searchText
            }),
            contentType: 'application/json; charset=utf-8',
            success: function (response) {
                var roles = response.roles;
                var pager = response.pager;

                var htmlContent = '<div class="db-booking-wrap table-content table-responsive">';
                    htmlContent += '<table id="role-table" class="table table-striped">';
                        htmlContent += '<thead>';
                            htmlContent += '<tr>';
                                htmlContent += '<th class="text-left" scope="col">Role Name</th>';
                                htmlContent += '<th class="text-left" scope="col">Date Created</th>';
                                htmlContent += '<th class="text-left" scope="col">Created By</th>';
                                htmlContent += '<th scope="col">Actions</th>';
                            htmlContent += '</tr>';
                        htmlContent += '</thead>';
                        htmlContent += '<tbody>';
                            for (var x = 0; x < roles.length; x++) {
                                htmlContent += '<tr>';
                                    htmlContent += '<td class="text-left">' + roles[x].roleName + '</td>';
                                    htmlContent += '<td class="text-left">' + roles[x].dateCreated + '</td>';
                                    htmlContent += '<td class="text-left">' + roles[x].createdBy + '</td>';
                                    htmlContent += '<td>';
                                        htmlContent += '<a href="/Administration/AddRole/' + roles[x].id + '" class="btn v3"><i class="ion-android-locate"></i> View</a> ';
                                        htmlContent += '<a href="#" data-id=\"' + roles[x].id + '\" data-name=\"' + roles[x].roleName + '\" class="remove-btn btn danger"><i class="ion-android-delete"></i> Delete</a>';
                                    htmlContent += '</td>';
                                htmlContent += '</tr>';
                            }
                        htmlContent += '</tbody>';
                    htmlContent += '</table > ';
                htmlContent += '</div>';

                $('#page-wrapper .role-count').text(pager.TotalItems);

                $('#page-wrapper .role').html(htmlContent);

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

                    $('#page-wrapper .role-pagination').html(pagination);
                }
            },
            error: function (err) {
                console.log("error: " + err);
            },
            async: true
        });
    },
    form.getRole = function (id) {
        $.ajax({
            type: 'GET',
            url: $('#page-wrapper').attr('data-get-role-url'),
            data: { 'id': id },
            contentType: 'application/json; charset=utf-8',
            success: function (response) {
                var role = response[0];

                $('#role-name-text').val(role.roleName);
                $('#role-description-text').val(role.description);
                $('#role-created-by').text(role.createdBy);
                $('#role-date-created').text(role.dateCreated);
                $('#role-updated-by').text(role.updatedBy);
                $('#role-date-updated').text(role.dateUpdated);
            },
            error: function (err) {
                console.log(err);
            },
            async: true
        });
    },
    form.validateRequiredFields = function () {
        var required = true;

        if ($('#furnishing-description-text').val() === '')
            required = false;

        return required;
    }
}

var myClass = new Role();
myClass._construct();