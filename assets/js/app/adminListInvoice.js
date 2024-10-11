app.controller('AdminListInvoice', function ($scope, $http, SocketService, $rootScope, $location, $timeout, TimezoneService, $route, API, adminBreadcrumbService, processSelect2Service) {
    let url = API.getBaseUrl();
    let headers = API.getHeaders();
    adminBreadcrumbService.generateBreadcrumb()
    //code here

    var defaultTimezone = "Asia/Ho_Chi_Minh"
    $scope.listAppointmentServiceDB = []
    $scope.selectedDates = []

    $scope.editInvoiceForm = []

    $scope.setupTab = () => {
        $scope.currentTab = -1;
        $scope.selectTab = (tab, $event) => {
            $event.preventDefault()
            $scope.currentTab = tab;
        }
        $scope.isSelected = (tab) => {
            return $scope.currentTab === tab;
        }
    }

    $scope.initializeFullCalendar = () => {
        $scope.extractTimeFromISOString = (isoString) => {
            var timePart = isoString.split('T')[1];
            return timePart.slice(0, 5);
        }
    }
    $scope.getStatusColor = function (status) {
        if (status) { // assuming true for paid
            return 'green';
        } else {
            return 'red';
        }
    };

    $scope.initializeUIComponents = () => {
        $timeout(() => {
            $('.select2-chooseInfo').select2(
                {
                    theme: 'bootstrap4',
                    placeholder: '---Chọn thông tin khách hàng---',
                    allowClear: true
                }).val(null).trigger('change')
            $('.select2-multi').select2(
                {
                    multiple: true,
                    theme: 'bootstrap4',
                }).val(null).trigger('change')
        },500)
       
        $('.drgpicker').daterangepicker(
            {
                singleDatePicker: false,
                timePicker: false,
                showDropdowns: true,
                locale:
                {
                    format: 'DD/MM/YYYY',
                    applyLabel: 'Áp dụng',
                    cancelLabel: 'Hủy',
                },
                // isInvalidDate: function (date) {
                //     return registeredDates.includes(date.format('YYYY-MM-DD'));
                // }
            }
        );
        $('.drgpicker').on('apply.daterangepicker', function (ev, picker) {
            var selectedDate = $('#formAppoinmentSearchDate').val();
            $scope.getDateFilter(selectedDate)
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

        $('#chooseInfo').on('change', function () {
            $timeout(function () {
                let selectedVals = $('#chooseInfo').val();
                $scope.selectedAppointmentId = processSelect2Service.processSelect2Data(selectedVals)[0]
                $scope.getAppointmentServiceByAppointmentId($scope.selectedAppointmentId)
            });
        });

    }

    $scope.calculateTotalPrice = function (services) {
        return services.reduce((total, service) => total + (service.price * (service.quantity || 1)), 0);
    };


    $scope.convert_text = function (totalAmount) {
        return to_vietnamese(totalAmount);
    };
    $scope.calculateAge = function (birthdate) {
        if (!birthdate) return null;

        var today = new Date();
        var birthDate = new Date(birthdate);

        var age = today.getFullYear() - birthDate.getFullYear();
        var monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };
    $scope.editInvoice = function (invoice) {
        $scope.editInvoiceForm = angular.copy(invoice);
        $scope.editInvoiceForm.totalAmount = $scope.calculateTotalPrice(invoice.services);
        $scope.editInvoiceForm.text = $scope.convert_text($scope.editInvoiceForm.totalAmount);
        $scope.editInvoiceForm.patientAge = $scope.calculateAge($scope.editInvoiceForm.appointment.patient.birthday);
    };
    $scope.getListAppointmentStatus = () => {
        $http.get(url + '/appointment-status', { headers: headers }).then(resp => {
            $scope.listAppointmentStatusBD = resp.data
        })
    }
    $scope.getServiceDescription = function (appointmentId) {
        if ($scope.editInvoiceForm && $scope.editInvoiceForm.services && $scope.editInvoiceForm.services.length > 0) {
            let serviceNames = $scope.editInvoiceForm.services.map(service => service.serviceName);
            return 'Thanh toán dịch vụ: ' + serviceNames.join(', ') + " appointment " + appointmentId;
        }
        return 'Thanh toán dịch vụ:';
    };
    $scope.getListAppointmentService = () => {
        $scope.clearDateFilter();
        $http.get(url + '/appointment-invoice', { headers: headers }).then(respone => {
            $scope.appointments = respone.data
            console.log("$scope.appointmentservice", $scope.appointments);
            $(document).ready(function () {
                $('#dataTable-list-invoice').DataTable({
                    autoWidth: true,
                    "lengthMenu": [
                        [10, 20, 30, -1],
                        [10, 20, 30, "All"]
                    ],
                    language: {
                        sProcessing: "Đang xử lý...",
                        sLengthMenu: "Hiển thị _MENU_ mục",
                        sZeroRecords: "Không tìm thấy dòng nào phù hợp",
                        sInfo: "Đang hiển thị _START_ đến _END_ trong tổng số _TOTAL_ mục",
                        sInfoEmpty: "Đang hiển thị 0 đến 0 trong tổng số 0 mục",
                        sInfoFiltered: "(được lọc từ _MAX_ mục)",
                        sInfoPostFix: "",
                        sSearch: "Tìm kiếm:",
                        sUrl: "",
                        oPaginate: {
                            sFirst: "Đầu",
                            sPrevious: "Trước",
                            sNext: "Tiếp",
                            sLast: "Cuối"
                        }
                    },
                    "ordering": false,
                });
            });
        }).catch(err => {
            console.log("Error", err);
        })
    }

    $scope.getListBillCancel = () => {
        $scope.clearDateFilter();
        $http.get(url + '/appointment-invoice-cancel', { headers: headers }).then(respone => {
            $scope.appointments_cancel = respone.data
            $(document).ready(function () {
                $('#dataTable-list-invoice-cancel1').DataTable({
                    autoWidth: true,
                    "lengthMenu": [
                        [10, 20, 30, -1],
                        [10, 20, 30, "All"]
                    ],
                    language: {
                        sProcessing: "Đang xử lý...",
                        sLengthMenu: "Hiển thị _MENU_ mục",
                        sZeroRecords: "Không tìm thấy dòng nào phù hợp",
                        sInfo: "Đang hiển thị _START_ đến _END_ trong tổng số _TOTAL_ mục",
                        sInfoEmpty: "Đang hiển thị 0 đến 0 trong tổng số 0 mục",
                        sInfoFiltered: "(được lọc từ _MAX_ mục)",
                        sInfoPostFix: "",
                        sSearch: "Tìm kiếm:",
                        sUrl: "",
                        oPaginate: {
                            sFirst: "Đầu",
                            sPrevious: "Trước",
                            sNext: "Tiếp",
                            sLast: "Cuối"
                        }
                    }
                });
            });
        }).catch(err => {
            console.log("Error", err);
        })
    }

    $scope.getListAppointmentServiceClear = () => {
        $scope.clearDateFilter();
        $http.get(url + '/appointment-invoice', { headers: headers }).then(respone => {
            $scope.appointments = respone.data
        }).catch(err => {
            console.log("Error", err);
        })
    }
    $scope.formAppoinmentFilter = {
        filterDate: ''
    };
    function formatDate(date) {
        let day = ('0' + date.getDate()).slice(-2);
        let month = ('0' + (date.getMonth() + 1)).slice(-2); // Tháng từ 0-11
        let year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
    $scope.filterDate = function () {
        let startDate = $scope.formAppoinmentFilter.startDate;
        let endDate = $scope.formAppoinmentFilter.endDate;

        // Kiểm tra xem các giá trị ngày có hợp lệ không
        if (!startDate || !endDate) {
            console.error('Start date or end date is not specified.');
            return;
        }
        let formattedStartDate = formatDate(new Date(startDate));
        let formattedEndDate = formatDate(new Date(endDate));
        $http.post(url + '/appointment-filter', {
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            headers: headers
        }).then(function (response) {
            $scope.appointments = response.data;
            table.clear().rows.add($scope.appointments).draw();
        }, function (error) {
            console.error('Error fetching data:', error);
        });
    };
    $scope.clearDateFilter = function () {
        $scope.formAppoinmentFilter.filterDate = '';
        var dateRangePicker = $('#formAppoinmentSearchDate').data('daterangepicker');
        if (dateRangePicker) {
            dateRangePicker.setStartDate(moment().startOf('day'));
            dateRangePicker.setEndDate(moment().startOf('day'));
            $('#formAppoinmentSearchDate').val('');
        }
    };
    $scope.getListAppointmentServiceCancel = () => {
        $http.get(url + '/appointment-invoice', { headers: headers }).then(respone => {
            $scope.appointments = respone.data
            $scope.filteredAppointments = $scope.appointments.filter(function (appointment) {
                return appointment.status == true;
            });
            $(document).ready(function () {
                $('#dataTable-list-invoice-cancel').DataTable({
                    autoWidth: true,
                    "lengthMenu": [
                        [10, 20, 30, -1],
                        [10, 20, 30, "All"]
                    ],
                    language: {
                        sProcessing: "Đang xử lý...",
                        sLengthMenu: "Hiển thị _MENU_ mục",
                        sZeroRecords: "Không tìm thấy dòng nào phù hợp",
                        sInfo: "Đang hiển thị _START_ đến _END_ trong tổng số _TOTAL_ mục",
                        sInfoEmpty: "Đang hiển thị 0 đến 0 trong tổng số 0 mục",
                        sInfoFiltered: "(được lọc từ _MAX_ mục)",
                        sInfoPostFix: "",
                        sSearch: "Tìm kiếm:",
                        sUrl: "",
                        oPaginate: {
                            sFirst: "Đầu",
                            sPrevious: "Trước",
                            sNext: "Tiếp",
                            sLast: "Cuối"
                        }
                    }
                });
            });
        }).catch(err => {
            console.log("Error", err);
        })
    }

    $scope.payments = [];
    $scope.payments = async function () {
        console.log("Payments", $scope.editInvoiceForm.paymentMethod)
        const result = await Swal.fire({
            title: "Thanh toán hóa đơn",
            text: "Bạn có chắc thanh toán hóa đơn này không?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Chấp nhận"
        });

        if (result.isConfirmed) {
            $scope.payments = $scope.editInvoiceForm;
            var PaymentRequest = {
                appointmentId: $scope.payments.appointment.appointmentId,
                text: $scope.payments.text,
                paymentMethod: $scope.editInvoiceForm.paymentMethod,
            };
            Swal.fire({
                title: 'Đang thao tác. </br> Vui lòng chờ trong giây lát !',
                showConfirmButton: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                timerProgressBar: true,
                timer: 0,
                html: `<div class="loadingspinner">
                    <div id="square1"></div>
                    <div id="square2"></div>
                    <div id="square3"></div>
                    <div id="square4"></div>
                    <div id="square5"></div>
                </div>`,
                onBeforeOpen: () => {
                    Swal.showLoading();
                }
            });
            try {
                const response = await $http.post(url + '/sendMail', PaymentRequest, { headers: headers });

            } catch (err) {
                console.error(err);
                // Xử lý lỗi nếu cần
            } finally {

                Swal.close();
                new Noty({
                    text: 'Thanh toán thành công !',
                    type: 'success',
                    timeout: 3000
                }).show()

                $('#myModal').modal('hide');
                window.location.href = "#!admin/list-invoice";

            }
        }
    };

    $scope.editAppoinment = (appointment, $event) => {
        $event.preventDefault()
        if (appointment != null) {
            console.log("appointment", appointment);
        }
        const formTab = document.getElementById('form-tab-appoinment');
        formTab.click();
    }

    $scope.refresh = () => {
        $route.reload()
        $timeout(function () {
            const tabLink = document.querySelector('.nav-link[ng-click*="selectTab(-2"]')
            tabLink.click();
        }, 1000)
    }

    $scope.isDisabled = function (status) {
        return ['Hoàn Thành', 'Đã Hủy', 'Không Đến', 'Hoãn'].includes(status);
    };

    $scope.updateStatus = (appoinment) => {
        console.log("appoinment update", appoinment);
    }

    //Them code moi

    $scope.initData = () => {
        $scope.paymentMethod = 'bank'
        $scope.isLoadingCreateBill = false
        $scope.getAppointmentWithOutBill()
    }

    $scope.getAppointmentWithOutBill = async () => {
        const responseStatus = await $http.get(url + "/appointment-status-except-deleted", { headers: headers });
        let completedStatus = responseStatus.data.filter(st => st.status.toLowerCase() === 'hoàn thành');
        if (completedStatus.length > 0) {
            let completedStatusId = completedStatus[0].appointment_StatusId;
            let params = { appStatus: completedStatusId }
            const responseAppointment = await $http.get(url + "/appointment-without-bill", { params, headers })
            $scope.listAppointmentWithOutBill = responseAppointment.data
        } else {
            console.log("Không tìm thấy trạng thái hoàn thành");
        }
    }

    let intervalId;  // Declare a variable to store the interval ID
    const requestDelay = 1000;  // 1 second delay between requests
    const backtrackSeconds = 55;  // Seconds to go back in time

    $scope.selectPaymentMethod = (method) => {
        if (method === 'atm') {
            if (intervalId) {  // Check if there is an existing interval
                clearInterval(intervalId);  // Clear the existing interval
            }

            intervalId = setInterval(() => {
                let time = new Date();
                let formattedTime = formatTime(time);
                let backtrackTime = new Date(time.getTime() - (backtrackSeconds * 1000));
                let formattedBacktrackTime = formatTime(backtrackTime);

                // Make API requests for both the current time and the time 10 seconds before
                makeRequest(formattedTime);
                // Delay the backtrack request by 1 second
                setTimeout(() => {
                    makeRequest(formattedBacktrackTime);
                }, requestDelay);
            }, requestDelay);  // Call the function every 2 seconds to allow time for both requests
        } else if (method === 'cash') {
            // If switching to 'cash', clear the interval if it exists
            if (intervalId) {
                clearInterval(intervalId);
            }
        }
    };

    // Function to make an API request
    const makeRequest = (formattedTime) => {
        $http.get(url + '/transactions', {
            params: {
                accountNumber: "0969281254",
                transactionDateMin: formattedTime,
                limit: 1
            }
        }, { headers: headers }).then((response) => {
            console.log('Time:', formattedTime, 'Response:', response.data);

            if (response.data.transactions && response.data.transactions.length > 0) {
                $scope.closeModal();
                clearInterval(intervalId);  // Stop the interval if transactions are found
                window.location.href = 'http://127.0.0.1:5501/#!/admin/transaction-success';
            }
        }).catch((error) => {
            console.error('Error fetching transactions:', error);
        });
    };

    // Function to format date to required format
    const formatTime = (date) => {
        return date.getFullYear() + '-' +
            String(date.getMonth() + 1).padStart(2, '0') + '-' +
            String(date.getDate()).padStart(2, '0') + ' ' +
            String(date.getHours()).padStart(2, '0') + ':' +
            String(date.getMinutes()).padStart(2, '0') + ':' +
            String(date.getSeconds()).padStart(2, '0');
    };

    // Function to be called when the modal is closed
    $scope.closeModal = () => {
        if (intervalId) {
            clearInterval(intervalId);
        }
    };

    // Function to be called when switching between payment methods
    $scope.switchPaymentMethod = (method) => {
        if (intervalId) {
            clearInterval(intervalId);
        }
        $scope.selectPaymentMethod(method);
    };

    // Example for using the modal close event
    angular.element(document).ready(() => {
        angular.element('#myModal').on('hidden.bs.modal', () => {
            $scope.closeModal();
        });
    });



    $scope.getAppointmentServiceByAppointmentId = (appointmentId) => {
        $http.get(url + '/appointment-service-appointment-id/' + appointmentId, { headers: headers }).then((response) => {
            $scope.listAppointmentService = response.data.filter(item => item.deleted == false)
            $scope.totalPrice = response.data.reduce((total, s) => total + (s.price * s.quantity), 0)
        })
    }

    $scope.createBill = () => {
        if (!$scope.selectedAppointmentId) {
            Swal.fire({
                title: "Cảnh báo!",
                html: '<p class="text-danger">Vui lòng chọn thông tin khách hàng!</p>',
                icon: "error"
            })
            return
        }
        let billRequest = {
            status: 'NOT_PAY',
            totalCost: $scope.totalPrice,
            paymentMethod: null,
            createAt: new Date(),
            appointmentId: $scope.selectedAppointmentId
        }
        $scope.isLoadingCreateBill = true
        $http.post(url + "/bill", angular.toJson(billRequest), { headers: headers }).then(response => {
            $timeout(() => {
                new Noty({
                    text: 'Tạo hóa đơn thành công !',
                    type: 'success',
                    timeout: 3000
                }).show();
                $scope.initData()
                $route.reload()
            }, 3000)
        }).then(() => {
            $timeout(() => {
                $scope.isLoadingCreateBill = false
            }, 3000)
        })
    }

    $scope.initData()
    //End Them code moi


    $scope.setupTab()
    $scope.getListAppointmentService();
    $scope.getListBillCancel();
    $scope.getListAppointmentStatus()
    $scope.initializeFullCalendar()
    $scope.initializeUIComponents()
    $scope.getListAppointmentServiceCancel();
    $scope.initializeCalendars = () => {
        $timeout(() => {
            angular.forEach($scope.listDoctorDB, (doctor) => {
                var calendarId = 'calendar-doctor-' + doctor.doctorId;
                $scope.initializeFullCalendar(calendarId, doctor.doctorId);
            }
            )
        })
    }
    function convert_text(e) {
        var result = document.getElementById('result');
        if (e.validity.valid) {
            result.innerHTML = to_vietnamese(e)
        }
    }
    (function () {
        var default_numbers = ' hai ba bốn năm sáu bảy tám chín';
        var dict = {
            units: ('? một' + default_numbers).split(' '),
            tens: ('lẻ mười' + default_numbers).split(' '),
            hundreds: ('không một' + default_numbers).split(' '),
        }
        const tram = 'trăm';
        var digits = 'x nghìn triệu tỉ nghìn'.split(' ');

        /**
         * additional words
         * @param  {string} block_of_2 [description]
         * @return {string}   [description]
         */
        function tenth(block_of_2) {
            var sl1 = dict.units[block_of_2[1]];
            var result = [dict.tens[block_of_2[0]]]
            if (block_of_2[0] > 0 && block_of_2[1] == 5)
                sl1 = 'lăm';
            if (block_of_2[0] > 1) {
                result.push('mươi');
                if (block_of_2[1] == 1)
                    sl1 = 'mốt';
            }
            if (sl1 != '?') result.push(sl1);
            return result.join(' ');
        }

        /**
         * convert number in blocks of 3
         * @param  {string} block "block of 3 mumbers"
         * @return {string}   [description]
         */
        function block_of_three(block) {

            switch (block.length) {
                case 1:
                    return dict.units[block];

                case 2:
                    return tenth(block);

                case 3:
                    var result = [dict.hundreds[block[0]], tram];
                    if (block.slice(1, 3) != '00') {
                        var sl12 = tenth(block.slice(1, 3));
                        result.push(sl12);
                    }
                    return result.join(' ');
            }
            return '';
        }
        /**
         * Get number from unit, to string
         * @param  {mixed} nStr input money
         * @return {String}  money string, removed digits
         */
        function formatnumber(nStr) {
            nStr += '';
            var x = nStr.split('.');
            var x1 = x[0];
            var x2 = x.length > 1 ? '.' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;
        };

        function digit_counting(i, digit_counter) {
            var result = digits[i]

            return result
        }
        function to_vietnamese(input, currency) {
            var str = parseInt(input) + '';
            var index = str.length;
            if (index == 0 || str == 'NaN')
                return '';
            var i = 0;
            var arr = [];
            var result = []

            //explode number string into blocks of 3numbers and push to queue
            while (index >= 0) {
                arr.push(str.substring(index, Math.max(index - 3, 0)));
                index -= 3;
            }
            //loop though queue and convert each block
            var digit_counter = 0;
            var digit;
            var adding;
            for (i = arr.length - 1; i >= 0; i--) {
                if (arr[i] == '000') {
                    digit_counter += 1;
                    if (i == 2 && digit_counter == 2) {
                        result.push(digit_counting(i + 1, digit_counter));
                    }
                }
                else if (arr[i] != '') {
                    digit_counter = 0
                    result.push(block_of_three(arr[i]))
                    digit = digit_counting(i, digit_counter);
                    if (digit && digit != 'x') result.push(digit);
                }
            }
            if (currency)
                result.push(currency);
            //remove unwanted white space
            return result.join(' ')
        }

        if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
            module.exports = to_vietnamese;
        }
        else if (typeof window !== undefined) {
            window.to_vietnamese = to_vietnamese;
        }
        return to_vietnamese
    })();


})
