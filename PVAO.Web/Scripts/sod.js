var SOD = function() {
    var form = this;
    var baseUrl = JSON.parse(localStorage.getItem("api")).baseUrl;

    form._construct = function() {
    },
    form._events = function() {

    },
    form.loadUncollectedPensionTypes = function() {
        var htmlContent = '<a id="bs-dropdown-action" class="btn btn-secondary dropdown-toggle" href="" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">-- Benefit Status --</a>';
        htmlContent += '<div class="dropdown-menu bs-dropdown-mnu" aria-labelledby="dropdownMenuLink">';
        htmlContent += `<a id="bs-all" data-id="0" data-description="-- Benefit Status --" class="dropdown-item" href="" onclick="return dropdownAction(this, 'bs-dropdown-action');">-- Benefit Status --</a>`;
        //htmlContent += `<a id="bs-${benefitStatus[x].id}" data-id="${benefitStatus[x].id}" data-description="${description}" class="dropdown-item" href="" onclick="return dropdownAction(this, 'bs-dropdown-action');">${description}</a>`;
        htmlContent += '</div>';
        $('#sod-form .bs-dropdown').html(htmlContent);
    }
}

var sod = new SOD();
sod._construct();