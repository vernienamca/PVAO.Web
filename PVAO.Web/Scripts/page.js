var Page = function () {
    var form = this;

    form._construct = function () {
        var url = window.location.href;

        form._events();

        if (url.split('/')[4] !== "Pages") {
            var pageId = url.substring(url.lastIndexOf('/') + 1);

            $('#page-validation-alert').hide();
            $('#page-updated-alert').hide();
            $('#page-role-added-alert').hide();

            if (!isNaN(pageId)) {
                $('#page-wrapper .header-text').html('Edit Page');
                $('#page-wrapper .subheader-text').html('Edit Page');

                localStorage.removeItem('tempPageAccess');

                form.getPage(pageId);

                form.getPageAccess(pageId, $('#page-access-search-text').val());
            }
        } else {
            form.getPages(1, $('#page-search-text').val());
        }
    },
    form._events = function () {
        var url = window.location.href;
        var pageId = parseInt(url.substring(url.lastIndexOf('/') + 1));

        $(document).on('click', '#page-wrapper .page-pagination ul > li', function (e) {
            e.preventDefault();

            var currentActivePage = $("#page-wrapper .page-pagination ul .active").text();
            var currentPage = parseInt(currentActivePage) + 1;

            if (e.target.innerText === '<' || e.target.innerText === '>')
                currentPage = (e.target.innerText !== '<') ? parseInt(currentActivePage) + 1 : parseInt(currentActivePage) - 1;
            else
                currentPage = parseInt(e.target.innerText);

            form.getPages(currentPage, $('#page-search-text').val());
        });

        $(document).keypress(function (e) {
            if (e.which == 13) {
                e.preventDefault();

                if (e.target.id === 'page-search-text') {
                    form.getPages(1, $('#' + e.target.id).val());
                } else if (e.target.id === 'page-role-modal-search-text') {
                    var arrAddedRoles = [];

                    $('#page-access-table tr').each(function () {
                        if ($(this).find(".role-id").html() !== undefined) {
                            arrAddedRoles.push($(this).find(".role-id").html());
                        }
                    });

                    form.getRoles(1, arrAddedRoles, $('#page-role-modal-search-text').val());
                } else if (e.target.id === 'page-access-search-text') {
                    localStorage.removeItem('tempPageAccess');

                    form.getPageAccess(pageId, $('#page-access-search-text').val());
                }
            }
        });

        $(document).on("click", "#page-wrapper .search-page-btn", function (e) {
            e.preventDefault();

            form.getPages(1, $('#page-search-text').val());
        });

        $('#page-wrapper .page-add-role-btn').click(function (e) {
            e.preventDefault();

            var arrAddedRoles = [];

            $('#page-access-table tr').each(function () {
                if ($(this).find(".role-id").html() !== undefined) {
                    arrAddedRoles.push(parseInt($(this).find(".role-id").html()));
                }
            });

            form.getRoles(1, arrAddedRoles, $('#page-role-modal-search-text').val());

            $('#page-role-modal').modal('toggle');
        });

        $(document).on("click", "#role-table-modal tbody tr td .add-btn", function (e) {
            e.preventDefault();

            var pageId = url.substring(url.lastIndexOf('/') + 1);

            var arrPageAccess = JSON.parse(localStorage.getItem('tempPageAccess'));

            if (arrPageAccess.find(x => x.roleId === parseInt($(this).attr('data-id'))) === undefined) {
                arrPageAccess.push({
                    id: 0,
                    roleId: parseInt($(this).attr('data-id')),
                    roleName: $(this).attr('data-name'),
                    canCreate: false,
                    canRead: false,
                    canUpdate: false,
                    canDelete: false
                });
            }

            localStorage.setItem('tempPageAccess', JSON.stringify(arrPageAccess));

            form.getPageAccess(pageId, $('#page-search-text').val(), 1);

            $('#page-role-added-alert').show();
            $('#page-role-alert-text').text('Role was successfully added.');
            setTimeout(function () { $('#page-role-added-alert').hide(); }, 2000);
        });

        $(document).on("click", "#page-access-table tbody tr td .remove-btn", function (e) {
            e.preventDefault();

            var pageId = url.substring(url.lastIndexOf('/') + 1);

            var pageAccess = JSON.parse(localStorage.getItem('tempPageAccess'));

            var roleId = parseInt($(this).attr('data-id'));

            pageAccess.splice(pageAccess.findIndex(function (i) {
                return i.roleId === roleId;
            }), 1);

            localStorage.setItem('tempPageAccess', JSON.stringify(pageAccess));

            form.getPageAccess(pageId, $('#page-search-text').val(), 0);
        });

        $('#save-page-btn').click(function (e) {
            e.preventDefault();

            $.ajax({
                type: 'POST',
                url: $('#page-wrapper').attr('data-save-page-url'),
                data: JSON.stringify({
                    id: pageId,
                    pageName: $("#page-name-text").val(),
                    description: $("#page-description-text").val(),
                    urlPath: $("#page-url-path-text").val(),
                    accessibleByAll: $('#accessible-all-check').prop('checked'),
                    active: $('#page-active-check').prop('checked')
                }),
                contentType: 'application/json; charset=utf-8',
                success: function (response) {
                    if (response !== null) {
                        $('#page-updated-alert').show();

                        window.setTimeout(function () {
                            window.location.href = '/Administration/AddPage/' + response.Id;
                        }, 3000);
                    }
                },
                error: function (err) {
                    console.log("error: " + err);
                },
                async: true
            });
        });

        $('#save-page-access-changes-btn').click(function (e) {
            e.preventDefault();

            var arrPageIds = [];

            $('#page-access-table tr').each(function () {
                if ($(this).find(".role-id").html() !== undefined) {
                    arrPageIds.push(parseInt($(this).find(".page-access-id").html()));
                }
            });

            if (arrPageIds !== 0) {
                $.ajax({
                    type: 'POST',
                    url: $('#page-wrapper').attr('data-remove-page-access-url'),
                    data: JSON.stringify({
                        pageId: pageId,
                        ids: arrPageIds
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

            $('#page-access-table tr').each(function () {
                if ($(this).find(".role-id").html() !== undefined) {

                    $.ajax({
                        type: 'POST',
                        url: $('#page-wrapper').attr('data-save-page-access-url'),
                        data: JSON.stringify({
                            pageAccessId: parseInt($(this).find(".page-access-id").html()),
                            pageId: pageId,
                            roleId: parseInt($(this).find(".role-id").html()),
                            canCreate: $(`#${$(this).find('.can-create input')[0].id}`).prop('checked'),
                            canRead: $(`#${$(this).find('.can-read input')[0].id}`).prop('checked'),
                            canUpdate: $(`#${$(this).find('.can-update input')[0].id}`).prop('checked'),
                            canDelete: $(`#${$(this).find('.can-delete input')[0].id}`).prop('checked')
                        }),
                        contentType: 'application/json; charset=utf-8',
                        success: function (response) {
                            if (response !== null) {
                                $('#page-role-added-alert').show();
                                $('#page-role-alert-text').text('Changes were successfully saved. The page will refresh within 3 seconds...');

                                localStorage.removeItem('tempPageAccess');

                                localStorage.setItem('tempActiveTab', 'pageAccess');

                                window.setTimeout(function () {
                                    window.location.href = '/Administration/AddPage/' + response.PageId;
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
    form.getPages = function (currentPage, searchText) {
        $.ajax({
            type: 'POST',
            url: $('#page-wrapper').attr('data-get-pages-url'),
            data: JSON.stringify({
                currentPage: currentPage,
                searchText: searchText
            }),
            contentType: 'application/json; charset=utf-8',
            success: function (response) {
                var pages = response.pages;
                var pager = response.pager;

                var htmlContent = '<div class="db-booking-wrap table-content table-responsive">';
                    htmlContent += '<table class="table table-striped">';
                        htmlContent += '<thead>';
                            htmlContent += '<tr>';
                                htmlContent += '<th class="text-left" scope="col">Page Name</th>';
                                htmlContent += '<th class="text-left" scope="col">Description</th>';
                                htmlContent += '<th class="text-left" scope="col">Url Path</th>';
                                htmlContent += '<th scope="col">Status</th>';
                                htmlContent += '<th class="text-left" scope="col">Date Created</th>';
                                htmlContent += '<th scope="col">Actions</th>';
                            htmlContent += '</tr>';
                        htmlContent += '</thead>';
                        htmlContent += '<tbody>';
                        for (var x = 0; x < pages.length; x++) {
                                htmlContent += '<tr>';
                                    htmlContent += '<td class="text-left">' + pages[x].pageName + '</td>';
                                    htmlContent += '<td class="text-left">' + pages[x].description + '</td>';
                                    htmlContent += '<td class="text-left">' + pages[x].urlPath + '</td>';
                                    htmlContent += '<td>' + pages[x].status + '</td>';
                                    htmlContent += '<td class="text-left">' + pages[x].dateCreated + '</td>';
                                    htmlContent += '<td>';
                                        htmlContent += '<a href="/Administration/AddPage/' + pages[x].id + '" class="btn v3"><i class="ion-android-locate"></i> View</a> ';
                                    htmlContent += '</td>';
                                htmlContent += '</tr>';
                            }
                        htmlContent += '</tbody>';
                    htmlContent += '</table > ';
                htmlContent += '</div>';

                $('#page-wrapper .page-count').text(pager.TotalItems);

                $('#page-wrapper .page').html(htmlContent);

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

                    $('#page-wrapper .page-pagination').html(pagination);

                    $('#page-wrapper .page-pagination').show();
                }
                else
                    $('#page-wrapper .page-pagination').hide();
            },
            error: function (err) {
                console.log("error: " + err);
            },
            async: true
        });
    },
    form.getPage = function (id) {
        $.ajax({
            type: 'GET',
            url: $('#page-wrapper').attr('data-get-page-url'),
            data: { 'id': id },
            contentType: 'application/json; charset=utf-8',
            success: function (response) {
                var page = response[0];

                $('#page-name-text').val(page.pageName);
                $('#page-description-text').val(page.description);
                $('#page-url-path-text').val(page.urlPath);
                $('#accessible-all-check').prop('checked', page.accessibleByAll);
                $('#page-active-check').prop('checked', page.active);

                if (localStorage.getItem("tempActiveTab") !== null) {
                    $('#photos-media-tab').tab('show');

                    localStorage.removeItem("tempActiveTab");
                }
            },
            error: function (err) {
                console.log(err);
            },
            async: true
        });
    },
    form.getPageAccess = function (pageId, searchText, roleModal) {
        $.ajax({
            type: 'POST',
            url: $('#page-wrapper').attr('data-get-page-access-url'),
            data: JSON.stringify({
                pageId: pageId,
                searchText: searchText
            }),
            contentType: 'application/json; charset=utf-8',
            success: function (response) {
                var pageAccess = response.pageAccess;

                if (localStorage.getItem("tempPageAccess") === null) {
                    var arrPageAccess = [];

                    for (var x = 0; x < pageAccess.length; x++) {
                        arrPageAccess.push({
                            id: pageAccess[x].id,
                            roleId: pageAccess[x].roleId,
                            roleName: pageAccess[x].roleName,
                            canCreate: pageAccess[x].canCreate,
                            canRead: pageAccess[x].canRead,
                            canUpdate: pageAccess[x].canUpdate,
                            canDelete: pageAccess[x].canDelete
                        });
                    }

                    localStorage.setItem('tempPageAccess', JSON.stringify(arrPageAccess));
                }

                var arrPageAccess = JSON.parse(localStorage.getItem('tempPageAccess'));

                var htmlContent = '<div class="db-booking-wrap table-content table-responsive">';
                    htmlContent += '<table id="page-access-table" class="table table-striped">';
                        htmlContent += '<thead>';
                            htmlContent += '<tr>';
                                htmlContent += '<th class="text-left" scope="col">Role Name</th>';
                                htmlContent += '<th scope="col">Can Create</th>';
                                htmlContent += '<th scope="col">Can Read</th>';
                                htmlContent += '<th scope="col">Can Update</th>';
                                htmlContent += '<th scope="col">Can Delete</th>';
                                htmlContent += '<th scope="col">Action</th>';
                            htmlContent += '</tr>';
                        htmlContent += '</thead>';
                        htmlContent += '<tbody>';
                            for (var x = 0; x < arrPageAccess.length; x++) {
                                var canCreate = arrPageAccess[x].canCreate === true ? 'checked' : '';
                                var canRead = arrPageAccess[x].canRead === true ? 'checked' : '';
                                var canUpdate = arrPageAccess[x].canUpdate === true ? 'checked' : '';
                                var canDelete = arrPageAccess[x].canDelete === true ? 'checked' : '';

                                htmlContent += '<tr>';
                                    htmlContent += '<td class="page-access-id" style="display: none;">' + arrPageAccess[x].id + '</td>';
                                    htmlContent += '<td class="role-id" style="display: none;">' + arrPageAccess[x].roleId + '</td>';
                                    htmlContent += '<td class="text-left">' + arrPageAccess[x].roleName + '</td>';
                                    htmlContent += '<td class="can-create"><input type="checkbox" id="can-create-check-' + arrPageAccess[x].roleName.replace(' ', '').toLowerCase() + '"' + canCreate + '></td>';
                                    htmlContent += '<td class="can-read"><input type="checkbox" id="can-read-check-' + arrPageAccess[x].roleName.replace(' ', '').toLowerCase() + '"' + canRead + '></td>';
                                    htmlContent += '<td class="can-update"><input type="checkbox" id="can-update-check-' + arrPageAccess[x].roleName.replace(' ', '').toLowerCase() + '"' + canUpdate + '></td>';
                                    htmlContent += '<td class="can-delete"><input type="checkbox" id="can-delete-check-' + arrPageAccess[x].roleName.replace(' ', '').toLowerCase() + '"' + canDelete + '></td>';
                                    htmlContent += '<td>';
                                        htmlContent += '<button data-id=\"' + arrPageAccess[x].roleId + '\" type="button" class="remove-btn btn btn-danger btn-sm"><i class="fa fa-times-circle"></i> Remove</button>';
                                    htmlContent += '</td>';
                                htmlContent += '</tr>';
                            }

                            if (arrPageAccess.length != 0)
                                $('#page-access-no-available').hide();
                            else
                                $('#page-access-no-available').show();

                        htmlContent += '</tbody>';
                    htmlContent += '</table > ';
                htmlContent += '</div>';

                $('#page-wrapper .page-access').html(htmlContent);

                if (roleModal !== undefined) {
                    var arrAddedRoles = [];

                    $('#page-access-table tr').each(function () {
                        if ($(this).find(".role-id").html() !== undefined) {
                            arrAddedRoles.push($(this).find(".role-id").html());
                        }
                    });

                    form.getRoles(1, arrAddedRoles, $('#page-role-modal-search-text').val());
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
                    htmlContent += '<table id="role-table-modal" class="table table-striped">';
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
                                            htmlContent += '<button data-id=\"' + roles[x].id + '\" data-name=\"' + roles[x].roleName + '\" type="button" class="add-btn btn btn-primary btn-sm select-city-btn"><i class="fa fa-plus-circle"></i> Add</button>';
                                        else 
                                            htmlContent += '<span class="badge badge-secondary"><i>Added</i></span>';
                                    htmlContent += '</td>';
                                htmlContent += '</tr>';
                            }
                        htmlContent += '</tbody>';
                    htmlContent += '</table > ';
                htmlContent += '</div>';

                $('#page-wrapper .page-role-modal-count').text(pager.TotalItems);

                $('#page-wrapper .page-role-modal-grid').html(htmlContent);

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

                    $('#page-wrapper .page-role-modal-pagination').html(pagination);
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

        if ($('#location-name-text').val() === '')
            required = false;

        return required;
    }
}

var myClass = new Page();
myClass._construct();