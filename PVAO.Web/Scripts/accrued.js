var Accrued = function () {
    var form = this;
    var baseUrl = JSON.parse(localStorage.getItem("api")).baseUrl;
    var container, totalcount, pagesize;

    form._construct = function () {
        var url = window.location.href;

        form._events();
        form.getUncollectedPension();
        form.getPensioners();
        if (url.split('/')[4] !== "List") {
            var id = url.split('/')[5];
            //container = $('#pagination-overremittance-forapproval');
        } else {
            //container = $('#pagination-overremittance');
            //form.getBenefitStatuses();
            //form.getYearsAndMonths('');
            //form.getOverRemittances(1, $('#search-overremittance-text').val(), '', '');
            form.getUncollectedPension();
        }
    },
    form._events = function () {

        $(document).on("click", ".view-btn", function (e) {
            //var claimNumber = $(`#${e.currentTarget.id}`).attr('data-id');

            window.open(`/Accrued/Details`, '_blank');
        });

    },
    form.getPensioners = function() {
        var htmlContent = '<thead class="thead-dark">';
        htmlContent += '<tr>';
        htmlContent += '<th scope="col">VDMS Number</th>';
        htmlContent += '<th scope="col">Claim Number</th>';
        htmlContent += '<th scope="col">Pensionare Name</th>';
        htmlContent += '<th scope="col">Unpaid Pension Type</th>';
        htmlContent += '<th scope="col">Amount</th>';
        htmlContent += '<th scope="col" class="text-center">Status</th>';
        htmlContent += '<th scope="col" class="text-center">Action</th>';
        htmlContent += '</tr>';
        htmlContent += '</thead>';
        htmlContent += '<tbody>';

        htmlContent += '<tr>';
        htmlContent += `<td>VDMS NUMBER 123</td>`;
        htmlContent += `<td>CLAIM NUMBER 456</td>`;
        htmlContent += `<td>Joey Rizal</td>`;
        htmlContent += `<td>Disability</td>`;
        htmlContent += `<td>P500,000</td>`;
        htmlContent += `<td class="text-center"><span class="badge badge-warning">FUNDED</span></td>`;
        htmlContent += '<td class="text-center">';
        htmlContent += `<button id="btnView" type="button" data class="btn btn-primary view-btn"><i class="far fa-eye"></i> View</button></td >`;
        htmlContent += '</td>';
        htmlContent += '</tr>';

        htmlContent += '<tr>';
        htmlContent += `<td>VDMS NUMBER 234</td>`;
        htmlContent += `<td>CLAIM NUMBER 567</td>`;
        htmlContent += `<td>Cat Black</td>`;
        htmlContent += `<td>Old Age</td>`;
        htmlContent += `<td>P250,000</td>`;
        htmlContent += `<td class="text-center"><span class="badge badge-warning">NOT FUNDED</span></td>`;
        htmlContent += '<td class="text-center">';
        htmlContent += `<button id="btnView" type="button" data class="btn btn-primary view-btn"><i class="far fa-eye"></i> View</button></td >`;
        htmlContent += '</td>';
        htmlContent += '</tr>';

        htmlContent += '</tbody>';

        $('#beneficiary-list').html(htmlContent);
    },
    form.getUncollectedPension = function() {

        var htmlContent = '<thead class="thead-dark">';
        htmlContent += '<tr>';
        htmlContent += '<th scope="col">VDMS Number</th>';
        htmlContent += '<th scope="col">Claim Number</th>';
        htmlContent += '<th scope="col">Pensionare Name</th>';
        htmlContent += '<th scope="col">Unpaid Pension Type</th>';
        htmlContent += '<th scope="col">Amount</th>';
        htmlContent += '<th scope="col" class="text-center">Status</th>';
        htmlContent += '<th scope="col" class="text-center">Action</th>';
        htmlContent += '</tr>';
        htmlContent += '</thead>';
        htmlContent += '<tbody>';

        htmlContent += '<tr>';
        htmlContent += `<td>VDMS NUMBER 123</td>`;
        htmlContent += `<td>CLAIM NUMBER 456</td>`;
        htmlContent += `<td>Joey Rizal</td>`;
        htmlContent += `<td>Disability</td>`;
        htmlContent += `<td>P500,000</td>`;
        htmlContent += `<td class="text-center"><span class="badge badge-warning">FUNDED</span></td>`;
        htmlContent += '<td class="text-center">';
        htmlContent += `<button id="btnView" type="button" data class="btn btn-primary view-btn"><i class="far fa-eye"></i> View</button></td >`;
        htmlContent += '</td>';
        htmlContent += '</tr>';

        htmlContent += '<tr>';
        htmlContent += `<td>VDMS NUMBER 234</td>`;
        htmlContent += `<td>CLAIM NUMBER 567</td>`;
        htmlContent += `<td>Cat Black</td>`;
        htmlContent += `<td>Old Age</td>`;
        htmlContent += `<td>P250,000</td>`;
        htmlContent += `<td class="text-center"><span class="badge badge-warning">NOT FUNDED</span></td>`;
        htmlContent += '<td class="text-center">';
        htmlContent += `<button id="btnView" type="button" data class="btn btn-primary view-btn"><i class="far fa-eye"></i> View</button></td >`;
        htmlContent += '</td>';
        htmlContent += '</tr>';

        htmlContent += '</tbody>';

        $('#accrued-list .table').html(htmlContent);
    }
}

var accrued = new Accrued();
accrued._construct();
