var Dashboard = function () {
    var form = this;

    form._construct = function () {
        form._events();

        form.getGreetings();
    },
    form._events = function () {
    },
    form.getGreetings = function () {
        $.ajax({
            type: 'GET',
            url: $('#page-wrapper').attr('data-get-current-user-url'),
            contentType: 'application/json; charset=utf-8',
            success: function (response) {
                var user = response[0];

                const currentDate = moment();

                if (!currentDate || !currentDate.isValid()) {
                    $('#dashboard-user-greetings').text(`Hello, ${user.FirstName}`);
                }

                const splitAfternoon = 12;
                const splitEvening = 17;
                const currentHour = parseFloat(currentDate.format('HH'));

                if (currentHour >= splitAfternoon && currentHour <= splitEvening)
                    $('#dashboard-user-greetings').text(`Good Afternoon, ${user.firstName}`);
                else if (currentHour >= splitEvening)
                    $('#dashboard-user-greetings').text(`Good Evening, ${user.firstName}`);
                else
                    $('#dashboard-user-greetings').text(`Good Morning, ${user.firstName}`);
            },
            error: function (err) {
                console.log(err);
            },
            async: true
        });
    }
}

var myClass = new Dashboard();
myClass._construct();