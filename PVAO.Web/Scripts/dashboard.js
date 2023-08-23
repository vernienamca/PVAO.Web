var Dashboard = function () {
    var form = this;
    var baseUrl = JSON.parse(localStorage.getItem("applicationApiUrl")).baseUrl;
    //var baseUrl = 'http://172.16.1.113:3020';

    form._construct = function () {
        form.getTotalVeterans();

        form.getTotalBeneficiaries();

        form.getTotalOverremittances();

        form.getTotalForApprovalOverRemittances();
    },
    form.getTotalVeterans = function () {
        $.get(`${baseUrl}/dashboard/gettotalveterans`)
            .done(function (data) {
                $('#total-veterans').text(data);
            }).fail(function (error) {
                    console.log('There is a problem fetching on total veterans count. Please try again later.');
            }
        );
    },
    form.getTotalBeneficiaries = function () {
        $.get(`${baseUrl}/dashboard/gettotalbeneficiaries`)
            .done(function (data) {
                $('#total-beneficiaries').text(data);
            }).fail(function (error) {
                console.log('There is a problem fetching on total beneficiaries count. Please try again later.');
            }
        );
    },
    form.getTotalOverremittances = function () {
        $.get(`${baseUrl}/dashboard/gettotaloverremittances`)
            .done(function (data) {
                var url = window.location.href;

                $('#total-overremittances').text(data);

                if (url.split('/')[3] === 'OverRemittance') {
                    if (url.split('/')[4] === 'Index') {
                        $('#over-remittance-index .total-list').text(`Over-remittance List (${data})`);
                    }
                }
            }).fail(function (error) {
                console.log('There is a problem fetching on total over-remittances count. Please try again later.');
            }
        );
    },
    form.getTotalForApprovalOverRemittances = function () {
        $.get(`${baseUrl}/dashboard/gettotalforapprovaloverremittances`)
            .done(function (data) {
                var url = window.location.href;

                if (url.split('/')[3] === 'OverRemittance') {
                    if (url.split('/')[4] === 'Index') {
                        $('#over-remittance-index .for-approval').text(`For Approval (${data})`);
                    }
                }
            }).fail(function (error) {
                console.log('There is a problem fetching on total for approval over-remittances count. Please try again later.');
            }
        );
    }
}

var dashboard = new Dashboard();
dashboard._construct();

(function($) {
    // USE STRICT
    "use strict";

    // Scroll Bar
    try {
        var jscr1 = $('.js-scrollbar1');
        if (jscr1[0]) {
            const ps1 = new PerfectScrollbar('.js-scrollbar1');
        }

        var jscr2 = $('.js-scrollbar2');
        if (jscr2[0]) {
            const ps2 = new PerfectScrollbar('.js-scrollbar2');

        }

    } catch (error) {
        console.log(error);
    }

    // Dropdown 
    try {
        var menu = $('.js-item-menu');
        var sub_menu_is_showed = -1;

        for (var i = 0; i < menu.length; i++) {
            $(menu[i]).on('click', function(e) {
                e.preventDefault();

                $('.js-right-sidebar').removeClass("show-sidebar");
                if (jQuery.inArray(this, menu) == sub_menu_is_showed) {
                    $(this).toggleClass('show-dropdown');

                    sub_menu_is_showed = -1;
                } else {
                    for (var i = 0; i < menu.length; i++) {
                        $(menu[i]).removeClass("show-dropdown");
                    }
                    $(this).toggleClass('show-dropdown');
                    sub_menu_is_showed = jQuery.inArray(this, menu);
                }
            });
        }
        $(".js-item-menu, .js-dropdown").click(function(event) {
            event.stopPropagation();
        });

        $("body,html").on("click", function() {
            for (var i = 0; i < menu.length; i++) {
                menu[i].classList.remove("show-dropdown");
            }
            sub_menu_is_showed = -1;
        });

    } catch (error) {
        console.log(error);
    }
    //tooltip
    $(function() {
        $('[data-toggle="tooltip"]').tooltip()
    })

    if (document.querySelector('#buyers') !== null) {
        $.ajax({
            type: 'GET',
            url: $('#page-wrapper').attr('data-get-property-view-summary-url'),
            dataType: 'json',
            contentType: 'application/json; charset=utf-8'
        }).done(function (response) {
            if (response !== null) {
                console.log(response);

                // line chart data
                var buyerData = {
                    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                    datasets: [{
                        fillColor: "transparent",
                        strokeColor: "#6449e7",
                        pointColor: "#fff",
                        pointStrokeColor: "#6449e7",
                        data: response
                    }]
                }
                // get line chart canvas
                var buyers = document.getElementById('buyers').getContext('2d');
                // draw line chart
                new Chart(buyers).Line(buyerData);
            }
        }).fail(function (err) { });
    }

    var wW = $(window).width();
    // Right Sidebar
    var right_sidebar = $('.js-right-sidebar');
    var sidebar_btn = $('.js-sidebar-btn');

    sidebar_btn.on('click', function(e) {
        e.preventDefault();
        for (var i = 0; i < menu.length; i++) {
            menu[i].classList.remove("show-dropdown");
        }
        sub_menu_is_showed = -1;
        right_sidebar.toggleClass("show-sidebar");
    });

    $(".js-right-sidebar, .js-sidebar-btn").click(function(event) {
        event.stopPropagation();
    });

    $("body,html").on("click", function() {
        right_sidebar.removeClass("show-sidebar");

    });


    // Sublist Sidebar
    try {
        var arrow = $('.js-arrow');
        arrow.each(function() {
            var that = $(this);
            that.on('click', function(e) {
                e.preventDefault();
                that.find(".arrow").toggleClass("up");
                that.toggleClass("open");
                that.parent().find('.js-sub-list').slideToggle("250");
            });
        });

    } catch (error) {
        console.log(error);
    }


    try {
        // Hamburger Menu
        $('.hamburger').on('click', function() {
            $(this).toggleClass('is-active');
            $('.navbar-mobile').slideToggle('500');
        });
        $('.navbar-mobile__list li.has-dropdown > a').on('click', function() {
            var dropdown = $(this).siblings('ul.navbar-mobile__dropdown');
            $(this).toggleClass('active');
            $(dropdown).slideToggle('500');
            return false;
        });
    } catch (error) {
        console.log(error);
    }

    // Chatbox
    try {
        var inbox_wrap = $('.js-inbox');
        var message = $('.au-message__item');
        message.each(function() {
            var that = $(this);

            that.on('click', function() {
                $(this).parent().parent().parent().toggleClass('show-chat-box');
            });
        });


    } catch (error) {
        console.log(error);
    }
    /* // line chart data
     var buyerData = {
         labels: ["January", "February", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"],
         datasets: [{
             fillColor: "#f5f6f7",
             strokeColor: "#6449e7",
             pointColor: "#fff",
             pointStrokeColor: "#6449e7",
             data: [203, 156, 99, 251, 305, 247, 312, 210, 190, 210, 233, 111]
         }]
     }
     // get line chart canvas
     var buyers = document.getElementById('buyers').getContext('2d');
     // draw line chart
     new Chart(buyers).Line(buyerData);*/


})(jQuery);