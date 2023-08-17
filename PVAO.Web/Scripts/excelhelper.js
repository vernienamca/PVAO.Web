var ExcelHelper = function() {
    var form = this;
    form.exportToExcel = function (table, name) {
        var style = "<style>table tr th { background-color: #76A03C; }</style>";
        var uri = 'data:application/vnd.ms-excel;base64,'
            , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" ' +
                  'xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>' +
                  '<x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets>' +
                  '</x:ExcelWorkbook></xml><![endif]-->' + style + '</head><body><table>{table}</table></body></html>'
            , base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))) }
            , format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }

        if (!table.nodeType) table = document.getElementById(table);
        form.RemoveColumnAndRows(table, 'Action');

        var ctx = { worksheet: name || 'Worksheet', table: table.innerHTML }
        window.location.href = uri + base64(format(template, ctx));
    },
    form.RemoveColumnAndRows = function(table, columnName) {
        var chosenHeaderText = columnName;
        var tableHeaders = $(table).find('th');
        var chosenHeader = tableHeaders.filter(function(header) {
            return tableHeaders[header].innerHTML == chosenHeaderText;
        }),
        chosenHeaderIndex = chosenHeader[0].cellIndex + 1;
        $(table).find('tr th:nth-child(' + chosenHeaderIndex + ')').remove();
        $(table).find('tr td:nth-child(' + chosenHeaderIndex + ')').remove();
    }
}

var excelHelper = new ExcelHelper();
