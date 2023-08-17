var Layout = function () {
    var form = this;

    form._construct = function () {
        form._events();
        form.get();

        localStorage.setItem("applicationApiUrl", JSON.stringify({
            baseUrl: 'http://localhost:55653/api'
        }));

        $('#page-loader').fadeOut();
    },
    form._events = function () {
        $('#logout').click(function (e) {
            e.preventDefault();

            if (!confirm('Are you sure, you want to log out?')) return false;

            $.ajax({
                type: 'POST',
                url: $('#page-wrapper').attr('data-logout-user-url'),
                dataType: 'json',
                contentType: 'application/json; charset=utf-8'
            }).done(function (response) {
                window.location.href = "/Account/Login";
            }).fail(function (err) { });
        });
    },
    form.get = function () {
        $.ajax({
            type: 'GET',
            url: $('#page-wrapper').attr('data-get-current-user-url'),
            contentType: 'application/json; charset=utf-8',
            success: function (response) {
                var user = response[0];

                const currentDate = moment();

                if (!currentDate || !currentDate.isValid()) {
                    $('#user-greetings').text(`Hello, ${user.FirstName}`);
                }

                const splitAfternoon = 12;
                const splitEvening = 17;
                const currentHour = parseFloat(currentDate.format('HH'));

                if (currentHour >= splitAfternoon && currentHour <= splitEvening)
                    $('#user-greetings').text(`Good Afternoon, ${user.firstName}`);
                else if (currentHour >= splitEvening)
                    $('#user-greetings').text(`Good Evening, ${user.firstName}`);
                else
                    $('#user-greetings').text(`Good Morning, ${user.firstName}`);

                $('#user-avatar-image').attr('src', user.avatarUrl);
                $('#current-user').text(`${user.firstName} ${user.lastName}`);

                $('#page-loader').fadeOut();
            },
            error: function (err) {
                console.log(err);

                $('#page-loader').fadeOut();
            },
            async: true
        });
    }
}

var myClass = new Layout();
myClass._construct();