app.controller('AdminDoctorScheduleController', function ($scope, $http, $rootScope, $location) {
    let url = "http://localhost:8081/api/v1/auth"
    let headers = {
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
        "X-Refresh-Token": localStorage.getItem("refreshToken"),
    }
    //code here
    $scope.currentTab = 1;
    $scope.formDoctorSchedule = {
        date: moment().add(1, 'days').format('DD/MM/YYYY')
    };
    $scope.selectTab = (tab, $event) => {
        $event.preventDefault()
        $scope.currentTab = tab;
        return tab
    }
    $scope.isSelected = (tab) => {
        return $scope.currentTab === tab;
    }
    $scope.getListShift = () => {
        $http.get(url + "/shift").then(respone => {
            $scope.listShiftDB = respone.data
            console.log("$scope.listShiftDB", $scope.listShiftDB);
        }).catch(err => {
            console.log("error", err);
        })
    }
    $scope.initializeUIComponents = () => {
        $('.select2').select2(
            {
                theme: 'bootstrap4',
            });
        $('.select2-multi').select2(
            {
                multiple: true,
                theme: 'bootstrap4',
            });
        $('.drgpicker').daterangepicker(
            {
                singleDatePicker: true,
                timePicker: false,
                showDropdowns: true,
                minDate: moment().add(1, 'days'),
                locale:
                {
                    format: 'DD/MM/YYYY',
                    applyLabel: 'Áp dụng',
                    cancelLabel: 'Hủy',
                },
            },
            function (start) {
                $scope.$apply(function () {
                    $scope.formDoctorSchedule.date = start.format('DD/MM/YYYY');
                });
            });
        $('.time-input').timepicker(
            {
                'scrollDefault': 'now',
                'zindex': '9999' /* fix modal open */
            });
        /** date range picker */
        if ($('.datetimes').length) {
            $('.datetimes').daterangepicker(
                {
                    timePicker: true,
                    startDate: moment().startOf('hour'),
                    endDate: moment().startOf('hour').add(32, 'hour'),
                    locale:
                    {
                        format: 'M/DD hh:mm A'
                    }
                });
        }
        var start = moment().subtract(29, 'days');
        var end = moment();

        function cb(start, end) {
            $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
        }
        $('#reportrange').daterangepicker(
            {
                startDate: start,
                endDate: end,
                ranges:
                {
                    'Today': [moment(), moment()],
                    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                    'This Month': [moment().startOf('month'), moment().endOf('month')],
                    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                }
            }, cb);
        cb(start, end);
        $('.input-placeholder').mask("00/00/0000",
            {
                placeholder: "__/__/____"
            });
        $('.input-zip').mask('00000-000',
            {
                placeholder: "____-___"
            });
        $('.input-money').mask("#.##0,00",
            {
                reverse: true
            });
        $('.input-phoneus').mask('(000) 000-0000');
        $('.input-mixed').mask('AAA 000-S0S');
        $('.input-ip').mask('0ZZ.0ZZ.0ZZ.0ZZ',
            {
                translation:
                {
                    'Z':
                    {
                        pattern: /[0-9]/,
                        optional: true
                    }
                },
                placeholder: "___.___.___.___"
            });
        // editor
        var editor = document.getElementById('editor');
        if (editor) {
            var toolbarOptions = [
                [
                    {
                        'font': []
                    }],
                [
                    {
                        'header': [1, 2, 3, 4, 5, 6, false]
                    }],
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [
                    {
                        'header': 1
                    },
                    {
                        'header': 2
                    }],
                [
                    {
                        'list': 'ordered'
                    },
                    {
                        'list': 'bullet'
                    }],
                [
                    {
                        'script': 'sub'
                    },
                    {
                        'script': 'super'
                    }],
                [
                    {
                        'indent': '-1'
                    },
                    {
                        'indent': '+1'
                    }], // outdent/indent
                [
                    {
                        'direction': 'rtl'
                    }], // text direction
                [
                    {
                        'color': []
                    },
                    {
                        'background': []
                    }], // dropdown with defaults from theme
                [
                    {
                        'align': []
                    }],
                ['clean'] // remove formatting button
            ];
            var quill = new Quill(editor,
                {
                    modules:
                    {
                        toolbar: toolbarOptions
                    },
                    theme: 'snow'
                });
        }
        // Example starter JavaScript for disabling form submissions if there are invalid fields
        (function () {
            'use strict';
            window.addEventListener('load', function () {
                // Fetch all the forms we want to apply custom Bootstrap validation styles to
                var forms = document.getElementsByClassName('needs-validation');
                // Loop over them and prevent submission
                var validation = Array.prototype.filter.call(forms, function (form) {
                    form.addEventListener('submit', function (event) {
                        if (form.checkValidity() === false) {
                            event.preventDefault();
                            event.stopPropagation();
                        }
                        form.classList.add('was-validated');
                    }, false);
                });
            }, false);
        })();

        // $('#drgpicker-start').on('change', function () {
        //     $timeout(function () {
        //         $scope.formDoctorSchedule.date = $('#drgpicker-start').val();
        //     });
        // });

    }
    $scope.selectTimeShift = () => {
        $('.drag').draggable({
            appendTo: 'body',
            helper: 'clone'
        });

        $('#dropzone-time-shift').droppable({
            activeClass: 'active',
            hoverClass: 'hover',
            accept: ":not(.ui-sortable-helper)", // Reject clones generated by sortable
            drop: function (e, ui) {
                var droppedText = ui.draggable.text(); // Lấy nội dung của phần tử đã thả vào

                // Kiểm tra xem dữ liệu đã tồn tại trong #dropzone chưa
                var isDuplicate = false;
                $(this).find('.drop-item').each(function () {
                    if ($(this).find('summary').text() === droppedText) {
                        isDuplicate = true;
                        return false; // Break out of each loop
                    }
                });
                if (!isDuplicate) {
                    var $el = $('<div class="drop-item"><details><summary>' + ui.draggable.text() + '</summary></details></div>');
                    $el.append($('<button type="button" class="btn btn-default btn-xs remove"><i class="bi bi-trash3" style="position: absolute;top: 0;right: 0;"></i></button>').click(function () { $(this).parent().detach(); }));
                    $(this).append($el);
                } else {
                    Swal.fire({
                        title: "Thất bại!",
                        html: '<p class="text-danger">Dữ liệu đã tồn tại trong. Không thể thêm.!</p>',
                        icon: "error"
                    })
                }

            }
        }).sortable({
            items: '.drop-item',
            sort: function () {
                // gets added unintentionally by droppable interacting with sortable
                // using connectWithSortable fixes this, but doesn't allow you to customize active/hoverClass options
                $(this).removeClass("active-time-shift");
            }
        });
    }

    $scope.getTimeShift = () => {
        var dropItems = $('#dropzone-time-shift').find('.drop-item');
        var dropContents = dropItems.map(function () {
            return $(this).find('summary').text();
        }).get();
        var date = $scope.formDoctorSchedule.date
        var shift = $scope.currentTab
        $scope.htmlContent = '<p>Thời gian đăng ký là : ' + dropContents + '</p>' +
            '<p>Ngày đăng ký: ' + date + '</p>' +
            '<p>Ca đăng ký: ' + shift + '</p>';
        Swal.fire({
            title: "Thành công",
            html: $scope.htmlContent,
            icon: "success"
        })
    }
    $scope.initializeUIComponents()
    $scope.getListShift()
    $scope.selectTimeShift()
})