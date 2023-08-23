var OverRemittance = function () {
    var form = this;
    var baseUrl = JSON.parse(localStorage.getItem("applicationApiUrl")).baseUrl;
    //var baseUrl = 'http://172.16.1.113:3020';

    form._construct = function () {
        var url = window.location.href;

        form._events();

        if (url.split('/')[4] !== "List") {
            var id = url.split('/')[5];

            form.getOverRemittanceById(id);

            form.validateOverRemittanceApprover();
        } else {
            form.getBenefitStatuses();

            form.getYearsAndMonths($('#bs-dropdown-action').text().split('-')[0].replace(/\s/g, ''), '');

            form.getOverRemittances(1, $('#bs-dropdown-action').text().split('-')[0].replace(/\s/g, ''), $('#search-overremittance-text').val(), '', '');
        }
    },
    form._events = function () {
        $(document).on("click", "#over-remittance-list .di-benefitStatus", function (e) {
            e.preventDefault();

            form.getYearsAndMonths($('#bs-dropdown-action').text().split('-')[0].replace(/\s/g, ''), '');

            form.getOverRemittances(1, $('#bs-dropdown-action').text().split('-')[0].replace(/\s/g, ''), $('#search-overremittance-text').val(), $('#yr-dropdown-action').text(), $('#mt-dropdown-action').text());
        });

        $(document).on("click", "#over-remittance-list .di-year", function (e) {
            e.preventDefault();
            var year = $(this).attr('data-description');

            form.getYearsAndMonths($('#bs-dropdown-action').text().split('-')[0].replace(/\s/g, ''), year);

            form.getOverRemittances(1, $('#bs-dropdown-action').text().split('-')[0].replace(/\s/g, ''), $('#search-overremittance-text').val(), year, '');
        });

        $(document).on("click", "#over-remittance-list .di-month", function (e) {
            e.preventDefault();

            form.getOverRemittances(1, $('#bs-dropdown-action').text().split('-')[0].replace(/\s/g, ''), $('#search-overremittance-text').val(), $('#yr-dropdown-action').text(), $(this).attr('data-description'));
        });

        $(document).on("click", "#export-excel-button", function (e) {
            var exportDone = [].concat.apply([], [
                excelHelper.exportToExcel('overremittance-table', 'overremittancetable')
            ]);

            $.when.apply($, exportDone).then(function () {
                window.location.reload();
            });
        });

        $(document).on("click", "#export-excel-forapproval-button", function (e) {
            excelHelper.exportToExcel('overremittance-forapproval-table', 'overremittancetable');
        });

        $(document).on("click", "#export-pdf-button", function (e) {
            pdfHelper.exportTableToPdf('#overremittance-table', `overremittancetable_${Date.now()}`, 'landscape' );
        });

        $(document).on("click", "#export-pdf-forapproval-button", function (e) {
            pdfHelper.exportTableToPdf('#overremittance-forapproval-table', `overremittancetableforapproval_${Date.now()}`, 'landscape');
        });

        $(document).on("click", ".view-btn", function (e) {
            var claimNumber = $(`#${e.currentTarget.id}`).attr('data-id');

            window.open(`/OverRemittance/Details/${claimNumber}`, '_blank');
        });

        $(document).keypress(function (e) {
            if (e.which == 13) {
                e.preventDefault();

                if (e.target.id === 'search-overremittance-text')
                    form.getOverRemittances(1, $('#bs-dropdown-action').text().split('-')[0].replace(/\s/g, ''), $('#search-overremittance-text').val(), $('#yr-dropdown-action').text(), $('#mt-dropdown-action').text());
            }
        });

        $(document).on('click', '#page-wrapper .overremittance-pagination ul > li', function (e) {
            e.preventDefault();

            var currentActivePage = $("#page-wrapper .overremittance-pagination ul .active").text();
            var currentPage = parseInt(currentActivePage) + 1;

            if (e.target.className.split(' ')[1] !== 'disabled') {
                if (e.target.innerText === 'Previous' || e.target.innerText === 'Next')
                    currentPage = (e.target.innerText !== 'Previous') ? parseInt(currentActivePage) + 1 : parseInt(currentActivePage) - 1;
                else
                    currentPage = parseInt(e.target.innerText);

                form.getOverRemittances(currentPage, $('#bs-dropdown-action').text().split('-')[0].replace(/\s/g, ''), $('#search-overremittance-text').val(), $('#yr-dropdown-action').text(), $('#mt-dropdown-action').text());
            }
        });

        $('#compute-btn').click(function (e) {
            $.ajax({
                type: 'POST',
                url: `${baseUrl}/pensioner/compute`,
                data: JSON.stringify({
                    RefOverRemittance: {
                        claimNumber: $('#claim-number-text').val(),
                        benefitStatus: $('#benefit-status-text').val(),
                        vDMSNumber: $('#vdms-number-name').val(),
                        pensionerName: $('#pensioner-name-text').val(),
                        status: 2,
                        ComputedBy: JSON.parse(sessionStorage.getItem('auth')).userId
                    }
                }),
                dataType: 'json',
                contentType: 'application/json; charset=utf-8'
            }).done(function (response) {
                $('#computed-amount-div').removeClass('invisible-element').addClass('visible-element');

                $('#status-claim-number').html(`Status: <span class="badge badge-warning">${response.status}</span>`);

                $('#computed-by').text(response.computedBy);
                $('#date-computed').text(response.dateComputed);

                $('#compute-btn').hide();
                $('#submit-approval-btn').show();

                $('#alert-div').removeClass('invisible-element').addClass('visible-element');

                $(window).scrollTop(0);
            }).fail(function (err) { });
        });

        $('#submit-approval-btn').click(function (e) {
            e.preventDefault();

            $('#submit-confirmation-modal').modal('toggle');
        });

        $('#submit-confirmation-modal .submit-approval-btn').click(function (e) {
            e.preventDefault();

            $.ajax({
                type: 'POST',
                url: `${baseUrl}/pensioner/submitforapproval`,
                data: JSON.stringify({
                    RefOverRemittance: {
                        claimNumber: $('#claim-number-text').val(),
                        submittedBy: JSON.parse(sessionStorage.getItem('auth')).userId,
                        status: 3
                    }
                }),
                dataType: 'json',
                contentType: 'application/json; charset=utf-8'
            }).done(function (response) {
                $('#status-claim-number').html(`Status: <span class="badge badge-warning">${response.status}</span>`);
                $('#submitted-by').text(response.submittedBy);
                $('#date-submitted').text(response.dateSubmitted);

                $('#compute-btn').hide();
                $('#submit-approval-btn').hide();
                $('#approve-btn').show();
                $('#reject-btn').show();

                $('#alert-div .message').text('Over-remittance has been successfully submitted waiting for approval.');
                $('#alert-div').removeClass('invisible-element').addClass('visible-element');

                $('#submit-confirmation-modal').modal('toggle');

                $(window).scrollTop(0);
            }).fail(function (err) { });
        });

        $('#approve-btn').click(function (e) {
            e.preventDefault();

            $('#approve-confirmation-modal').modal('toggle');
        });

        $('#approve-confirmation-modal .approve-btn').click(function (e) {
            e.preventDefault();

            $.ajax({
                type: 'POST',
                url: `${baseUrl}/pensioner/approvereject`,
                data: JSON.stringify({
                    RefOverRemittance: {
                        claimNumber: $('#claim-number-text').val(),
                        approvedRejectedBy: JSON.parse(sessionStorage.getItem('auth')).userId,
                        status: 4
                    }
                }),
                dataType: 'json',
                contentType: 'application/json; charset=utf-8'
            }).done(function (response) {
                $('#status-claim-number').html(`Status: <span class="badge badge-warning">${response.status}</span>`);
                $('#approve-btn').hide();
                $('#reject-btn').hide();
                $('#compute-btn').hide();
                $('#submit-approval-btn').hide();

                $('#approved-rejected-status').html(`<strong>Status: </strong> ${response.status}`);
                $('#approved-rejected-by').html(`<strong>Approved By: </strong> ${response.approvedRejectedBy}`);
                $('#date-approved-reject').html(`<strong>Date Approved: </strong> ${response.approvedRejectedDate}`);

                $('#approved-rejected-line').removeClass('invisible-element').addClass('visible-element');

                $('#alert-div .message').text('Over-remittance has been successfully approved.');
                $('#alert-div').removeClass('invisible-element').addClass('visible-element');

                $('#approve-confirmation-modal').modal('toggle');

                $(window).scrollTop(0);
            }).fail(function (err) { });
        });

        $('#reject-btn').click(function (e) {
            e.preventDefault();

            $('#reject-reason-modal .reason-rejection-alert').removeClass('visible-element').addClass('invisible-element');

            $('#reject-reason-modal').modal('toggle');
        });

        $('#reject-reason-modal .reject-btn').click(function (e) {
            e.preventDefault();

            if ($('#reason-rejection-text').val().length !== 0) {
                e.preventDefault();

                $.ajax({
                    type: 'POST',
                    url: `${baseUrl}/pensioner/approvereject`,
                    data: JSON.stringify({
                        RefOverRemittance: {
                            claimNumber: $('#claim-number-text').val(),
                            approvedRejectedBy: JSON.parse(sessionStorage.getItem('auth')).userId,
                            remarks: $('#reason-rejection-text').val(),
                            status: 5
                        }
                    }),
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8'
                }).done(function (response) {
                    $('#status-claim-number').html(`Status: <span class="badge badge-warning">${response.status}</span>`);
                    $('#approve-btn').hide();
                    $('#reject-btn').hide();
                    $('#compute-btn').hide();
                    $('#submit-approval-btn').hide();

                    $('#approved-rejected-status').html(`<strong>Status: </strong> ${response.status}`);
                    $('#approved-rejected-by').html(`<strong>Rejected By: </strong> ${response.approvedRejectedBy}`);
                    $('#date-approved-reject').html(`<strong>Date Rejected: </strong> ${response.approvedRejectedDate}`);
                    $('#reject-remarks').html(`<strong>Remarks: </strong> ${response.remarks}`);

                    $('#approved-rejected-line').removeClass('invisible-element').addClass('visible-element');

                    $('#alert-div .message').text('Over-remittance has been rejected.');
                    $('#alert-div').removeClass('invisible-element').addClass('visible-element');

                    $('#reject-reason-modal').modal('toggle');
                    $(window).scrollTop(0);
                }).fail(function (err) { });
            } else {
                $('#reject-reason-modal .reason-rejection-alert').removeClass('invisible-element').addClass('visible-element');
            }
        });

        $('#close-btn').click(function (e) {
            e.preventDefault();

            window.close();
        });
    },
    form.getBenefitStatuses = function () {
        $.get(`${baseUrl}/pensioner/getbenefitstatus`)
            .done(function (data) {
                var benefitStatus = data.filter(function (item) { return item.prefix == "DW" || item.prefix == "DC" || item.prefix == "TP"; });

                var htmlContent = '<a id="bs-dropdown-action" class="btn btn-secondary dropdown-toggle" href="" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">-- Benefit Status --</a>';
                htmlContent += '<div class="dropdown-menu bs-dropdown-mnu" aria-labelledby="dropdownMenuLink">';
                htmlContent += `<a id="bs-all" data-id="0" data-description="-- Benefit Status --" class="dropdown-item di-benefitStatus" href="" onclick="return dropdownAction(this, 'bs-dropdown-action');">-- Benefit Status --</a>`;

                    for (var x = 0; x < benefitStatus.length; x++) {
                        var description = `${benefitStatus[x].prefix} - ${benefitStatus[x].description} ( ${benefitStatus[x].claimant} )`;

                        htmlContent += `<a id="bs-${benefitStatus[x].id}" data-id="${benefitStatus[x].id}" data-description="${description}" class="dropdown-item di-benefitStatus" href="" onclick="return dropdownAction(this, 'bs-dropdown-action');">${description}</a>`;
                    }

                htmlContent += '</div>';

                $('#over-remittance-list .bs-dropdown').html(htmlContent);
            }).fail(function (error) {
                console.log('There is a problem fetching on benefit status. Please try again later.');
            }
        );
    },
    form.getOverRemittances = function (currentPage, benefitStatus, searchValue, year, month) {
        var endpointUrl = `${baseUrl}/pensioner/getoverremittances?benefitStatus=${benefitStatus}&searchValue=${searchValue}&currentPage=${currentPage}&pageSize=10`;

        if (year !== '-- Year --' && month !== '-- Month --')
            endpointUrl = `${baseUrl}/pensioner/getoverremittances?benefitStatus=${benefitStatus}&searchValue=${searchValue}&year=${year}&month=${month}&currentPage=${currentPage}&pageSize=10`;
        
        if (year !== '-- Year --' && month === '-- Month --')
            endpointUrl = `${baseUrl}/pensioner/getoverremittances?benefitStatus=${benefitStatus}&searchValue=${searchValue}&year=${year}&currentPage=${currentPage}&pageSize=10`;

        $.get(endpointUrl)
            .done(function (data) {
                var overRemittances = data.items;
                var totalCount = data.totalItems;

                var htmlContent = '<thead class="thead-dark">';
                    htmlContent += '<tr>';
                        htmlContent += '<th scope="col">Claim Number</th>';
                        htmlContent += '<th scope="col">Description</th>';
                        htmlContent += '<th scope="col">VDMS Number</th>';
                        htmlContent += '<th scope="col">Veteran Date of Death</th>';
                        htmlContent += '<th scope="col">Pensioner Name</th>';
                        htmlContent += '<th scope="col">Relation</th>';
                        htmlContent += '<th scope="col">Last Checque Date</th>';
                        htmlContent += '<th scope="col" class="text-right">Amount</th>';
                        htmlContent += '<th scope="col">Date Approved</th>';
                        htmlContent += '<th scope="col" class="text-center">Status</th>';
                        htmlContent += '<th scope="col" class="text-center">Action</th>';
                    htmlContent += '</tr>';
                htmlContent += '</thead>';
                htmlContent += '<tbody>';

                for (var x = 0; x < overRemittances.length; x++) {
                    var status = `<span class="badge badge-primary">${overRemittances[x].status}</span>`;

                    if (overRemittances[x].status === 'Computed')
                        status = `<span class="badge badge-secondary">${overRemittances[x].status}</span>`;
                    else if (overRemittances[x].status === 'For Approval')
                        status = `<span class="badge badge-warning">${overRemittances[x].status}</span>`;
                    else if (overRemittances[x].status === 'Approved')
                        status = `<span class="badge badge-success">${overRemittances[x].status}</span>`;
                    else if (overRemittances[x].status === 'Rejected')
                        status = `<span class="badge badge-danger">${overRemittances[x].status}</span>`;
                    else
                        status = `<span class="badge badge-primary">${overRemittances[x].status}</span>`;

                    htmlContent += '<tr>';
                        htmlContent += `<td>${overRemittances[x].claimNumber}</td>`;
                        htmlContent += `<td>${overRemittances[x].benefitDescription}</td>`;
                        htmlContent += `<td>${overRemittances[x].vdmsNumber}</td>`;
                        htmlContent += `<td>${new Date(overRemittances[x].veteranDeathDate).toLocaleDateString()}</td>`;
                        htmlContent += `<td>${overRemittances[x].pensionerName}</td>`;
                        htmlContent += `<td>${overRemittances[x].relation}</td>`;
                        htmlContent += `<td>${new Date(overRemittances[x].lastChecqueDate).toLocaleDateString()}</td>`;
                        htmlContent += `<td class="text-right">${overRemittances[x].amount}</td>`;
                        htmlContent += `<td>${new Date(overRemittances[x].dateApproved).toLocaleDateString()}</td>`;
                        htmlContent += `<td class="text-center">${status}</td>`;
                        htmlContent += '<td class="text-center">';
                            htmlContent += `<button id="or-${overRemittances[x].claimNumber}" data-id="${overRemittances[x].claimNumber}" type="button" data class="btn btn-primary view-btn"><i class="far fa-eye"></i> View</button></td >`;
                        htmlContent += '</td>';
                    htmlContent += '</tr>';
                }

                htmlContent += '</tbody>';

                $('#over-remittance-list .header-text').text(`Over-remittance List (${totalCount})`);

                $('#over-remittance-list .table').html(htmlContent);

                if (data.pageCount > 1) {
                    var paginationHtml = '<nav aria-label="...">';
                        paginationHtml += '<ul class="pagination">';

                            paginationHtml += `<li class="page-item ${currentPage !== 1 ? '' : 'disabled'} ">`;
                                paginationHtml += '<span class="page-link">Previous</span>';
                            paginationHtml += '</li>';

                            for (var i = 1; i <= data.pageCount; i++) {
                                paginationHtml += `<li class="page-item ${currentPage !== i ? '' : 'active'}">`;
                                    paginationHtml += `<a class="page-link" href="#">${i}</a>`;
                                paginationHtml += '</li>';
                            }
                        
                            paginationHtml += `<li class="page-item ${currentPage !== data.pageCount ? '' : 'disabled'}">`;
                                paginationHtml += '<a class="page-link" href="#">Next</a>';
                            paginationHtml += '</li>';
                        paginationHtml += '</ul>';
                    paginationHtml += '</nav>';

                    $('#page-wrapper .overremittance-pagination').html(paginationHtml);

                    $('#page-wrapper .overremittance-pagination').show();
                } else {
                    $('#page-wrapper .overremittance-pagination').hide();
                }

                if (overRemittances.length != 0) {
                    $('#no-available-overremittances').hide();

                    $('#export-excel-button').show();
                    $('#export-pdf-button').show();
                } else {
                    $('#no-available-overremittances').show();

                    $('#export-excel-button').hide();
                    $('#export-pdf-button').hide();
                }
            }).fail(function (error) {
                console.log('There is a problem fetching on over-remittance list. Please try again later.');
            });
    },
    form.getYearsAndMonths = function (benefitStatus, year) {
        $.get(`${baseUrl}/pensioner/getyearsandmonths?benefitStatus=${benefitStatus}`)
            .done(function (data) {
                if (year !== '') {
                    var dates = data.months;
                    var arrMonths = [];

                    for (var i = 0; i < dates.length; i++) {
                        if (dates[i].split('/')[2] == year) {
                            var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

                            if (arrMonths.indexOf(months[parseInt(dates[i].split('/')[0]) - 1]) === -1) {
                                arrMonths.push(months[parseInt(dates[i].split('/')[0]) - 1]);
                            }
                        }
                    }

                    var htmlContent = '<a id="mt-dropdown-action" class="btn btn-secondary dropdown-toggle" href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">-- Month --</a>';
                    htmlContent += '<div class="dropdown-menu mt-dropdown-mnu" aria-labelledby="dropdownMenuLink">';
                        htmlContent += `<a id="mt-all" data-id="0" data-description="-- Month --" class="dropdown-item di-month" href="" onclick="return dropdownAction(this, 'mt-dropdown-action');">-- Month --</a>`;

                        for (var x = 0; x < arrMonths.length; x++) {
                            htmlContent += `<a id="yr-${arrMonths[x]}" data-id="${arrMonths[x]}" data-description="${arrMonths[x]}" class="dropdown-item di-month" href="" onclick="return dropdownAction(this, 'mt-dropdown-action');">${arrMonths[x]}</a>`;
                        }

                    htmlContent += '</div>';

                    $('#over-remittance-list .mt-dropdown').html(htmlContent);
                } else {
                    var years = data.years;

                    var yearContent = '<a id="yr-dropdown-action" class="btn btn-secondary dropdown-toggle" href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">-- Year --</a>';
                    yearContent += '<div class="dropdown-menu yr-dropdown-mnu" aria-labelledby="dropdownMenuLink">';
                        yearContent += `<a id="yr-all" data-id="0" data-description="-- Year --" class="dropdown-item di-year" href="" onclick="return dropdownAction(this, 'yr-dropdown-action');">-- Year --</a>`;

                        for (var x = 0; x < years.length; x++) {
                            yearContent += `<a id="yr-${years[x]}" data-id="${years[x]}" data-description="${years[x]}" class="dropdown-item di-year" href="" onclick="return dropdownAction(this, 'yr-dropdown-action');">${years[x]}</a>`;
                        }
                    yearContent += '</div>';

                    var monthContent = '<a id="mt-dropdown-action" class="btn btn-secondary dropdown-toggle" href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">-- Month --</a>';
                    monthContent += '<div class="dropdown-menu mt-dropdown-mnu" aria-labelledby="dropdownMenuLink">';
                        monthContent += `<a id="mt-all" data-id="0" data-description="-- Month --" class="dropdown-item di-month" href="" onclick="return dropdownAction(this, 'mt-dropdown-action');">-- Month --</a>`;
                    monthContent += '</div>';

                    $('#over-remittance-list .yr-dropdown').html(yearContent);

                    $('#over-remittance-list .mt-dropdown').html(monthContent);
                }
            }).fail(function (error) {
                console.log('There is a problem fetching years and months filter. Please try again later.');
            }
        );
    }
    form.getOverRemittanceById = function (id) {
        $.get(`${baseUrl}/pensioner/getoverremittancebyid?claimNumber=${id}`)
            .done(function (data) {
                var overRemittance = data.overRemittance;

                var status = `Status: <span class="badge badge-primary">${overRemittance.status}</span>`;

                if (overRemittance.status === 'Computed')
                    status = `Status: <span class="badge badge-secondary">${overRemittance.status}</span>`;
                else if (overRemittance.status === 'For Approval')
                    status = `Status: <span class="badge badge-warning">${overRemittance.status}</span>`;
                else if (overRemittance.status === 'Approved')
                    status = `Status: <span class="badge badge-success">${overRemittance.status}</span>`;
                else if (overRemittance.status === 'Rejected')
                    status = `Status: <span class="badge badge-danger">${overRemittance.status}</span>`;
                else
                    status = `Status: <span class="badge badge-primary">${overRemittance.status}</span>`;

                $('#benefit-status').html(`<i class="fa fa-briefcase"></i> Claim Number: ${overRemittance.claimNumber} | ${overRemittance.benefitCode} - ${overRemittance.benefitDescription}`);
                $('#vdms-number-name').html(`<i class="fa fa-user"></i> ${overRemittance.lastName}, ${overRemittance.firstName} ${overRemittance.middleName}`);
                $('#status-claim-number').html(status);
                $('#claim-number-text').val(overRemittance.claimNumber);
                $('#benefit-status-text').val(`${overRemittance.benefitCode} - ${overRemittance.benefitDescription}`);
                $('#pensioner-name-text').val(overRemittance.pensionerName);
                $('#relation-text').val(overRemittance.relation);
                $('#address-text').val(overRemittance.address);
                $('#mobile-number-text').val(overRemittance.mobileNumber);
                $('#email-address-text').val(overRemittance.emailAddress);
                $('#vdms-number-text').val(overRemittance.vdmsNumber);
                $('#veteran-name-text').val(overRemittance.veteranName);
                $('#birth-date-text').val(new Date(overRemittance.dateOfBirth).toLocaleDateString());
                $('#age-text').val(overRemittance.age);
                $('#gender-text').val(overRemittance.gender);
                $('#date-death-text').val(new Date(overRemittance.dateOfDeath).toLocaleDateString());
                $('#cause-death-text').val(overRemittance.causeOfDeath);
                $('#bank-name-text').val(overRemittance.bankName);
                $('#bank-branch-text').val(overRemittance.bankBranch);
                $('#account-number-text').val(overRemittance.bankAccount);
                $('#cheque-number-text').val(overRemittance.chequeNumber);
                $('#date-issued-text').val(new Date(overRemittance.dateIssued).toLocaleDateString());
                $('#total-overremittance-amount').text(overRemittance.checqueAmount.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"));
                $('#computed-by').text(overRemittance.computedBy);
                $('#date-computed').text(overRemittance.dateComputed);
                $('#submitted-by').text(overRemittance.submittedBy);
                $('#date-submitted').text(overRemittance.dateSubmitted);

                form.getIssuedChequePayPeriod(overRemittance.claimNumber, overRemittance.dateOfDeath, overRemittance.bankAccount, overRemittance.bankName, overRemittance.bankBranch);

                $('#approve-btn').hide();
                $('#reject-btn').hide();

                if (overRemittance.status !== 'Computed') {
                    $('#compute-btn').show();
                    $('#submit-approval-btn').hide();
                } else {
                    $('#compute-btn').hide();
                    $('#submit-approval-btn').show();

                    $('#computed-amount-div').removeClass('invisible-element').addClass('visible-element');
                }

                if (overRemittance.status === 'For Approval') {
                    $('#approve-btn').show();
                    $('#reject-btn').show();
                    $('#compute-btn').hide();
                    $('#submit-approval-btn').hide();

                    $('#computed-amount-div').removeClass('invisible-element').addClass('visible-element');
                }

                if (overRemittance.status === 'Approved') {
                    $('#approve-btn').hide();
                    $('#reject-btn').hide();
                    $('#compute-btn').hide();
                    $('#submit-approval-btn').hide();

                    $('#approved-rejected-status').html(`<strong>Status: </strong> ${overRemittance.status}`);
                    $('#approved-rejected-by').html(`<strong>Approved By: </strong> ${overRemittance.approvedRejectedBy}`);
                    $('#date-approved-reject').html(`<strong>Date Approved: </strong> ${overRemittance.approvedRejectedDate}`);

                    $('#computed-amount-div').removeClass('invisible-element').addClass('visible-element');
                    $('#approved-rejected-line').removeClass('invisible-element').addClass('visible-element');
                }

                if (overRemittance.status === 'Rejected') {
                    $('#approve-btn').hide();
                    $('#reject-btn').hide();
                    $('#compute-btn').hide();
                    $('#submit-approval-btn').hide();

                    $('#approved-rejected-status').html(`<strong>Status: </strong> ${overRemittance.status}`);
                    $('#approved-rejected-by').html(`<strong>Rejected By: </strong> ${overRemittance.approvedRejectedBy}`);
                    $('#date-approved-reject').html(`<strong>Date Rejected: </strong> ${overRemittance.approvedRejectedDate}`);
                    $('#reject-remarks').html(`<strong>Remarks: </strong> ${overRemittance.remarks}`);

                    $('#computed-amount-div').removeClass('invisible-element').addClass('visible-element');
                    $('#approved-rejected-line').removeClass('invisible-element').addClass('visible-element');
                }

            }).fail(function (error) {
                console.log(error);
            }
        );
    },
    form.getIssuedChequePayPeriod = function (claimNumber, dateOfDeath, accountNumber, bankName, bankBranch) {
        $.get(`${baseUrl}/pensioner/getissuedchequepayperiod?claimNumber=${claimNumber}&dateOfDeath=${dateOfDeath}`)
            .done(function (data) {
                var cheques = data.cheques;

                var htmlContent = '<thead class="thead-dark">';
                    htmlContent += '<tr>';
                        htmlContent += '<th scope="col">Cheque Number</th>';
                        htmlContent += '<th scope="col">Account Number</th>';
                        htmlContent += '<th scope="col">Bank Name</th>';
                        htmlContent += '<th scope="col">Bank Branch</th>';
                        htmlContent += '<th scope="col">Date Issued</th>';
                        htmlContent += '<th scope="col">Amount</th>';
                    htmlContent += '</tr>';
                htmlContent += '</thead>';
                htmlContent += '<tbody>';

                for (var x = 0; x < cheques.length; x++) {
                    htmlContent += '<tr>';
                        htmlContent += `<td>${cheques[x].checkNumber}</td>`;
                        htmlContent += `<td>${accountNumber}</td>`;
                        htmlContent += `<td>${bankName}</td>`;
                        htmlContent += `<td>${bankBranch}</td>`;
                        htmlContent += `<td>${new Date(cheques[x].dateIssued).toLocaleDateString()}</td>`;
                        htmlContent += `<td>${cheques[x].checkAmount.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")}</td>`;
                    htmlContent += '</tr>';
                }

                htmlContent += '</tbody>';

                $('#pay-period-table').html(htmlContent);
            }).fail(function (error) {
                console.log('There is a problem fetching cheque pay period. Please try again later.');
            });
    },
    form.validateOverRemittanceApprover = function () {
        var userId = JSON.parse(sessionStorage.getItem('auth')).userId;

        $.get(`${baseUrl}/user/getoverremittanceapprover?userId=${userId}`)
            .done(function (response) {
                if (response.hasApproverRole === false) {
                    $('#approve-btn').hide();
                    $('#reject-btn').hide();
                } 
            }).fail(function (error) {
                console.log(error);
            }
        );
    }
}

var overRemittance = new OverRemittance();
overRemittance._construct();
