app.controller('AdminListService', function ($scope, $http, $rootScope, $location, $filter, $timeout, API, adminBreadcrumbService) {
    let url = API.getBaseUrl();
    let headers = API.getHeaders();
    adminBreadcrumbService.generateBreadcrumb()
    $scope.listServiceFromDB = [];
    //code here  

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
                locale:
                {
                    format: 'MM/DD/YYYY'
                }
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
        $('.input-money').mask("#,##0",
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

        $('#serviceTypeId').on('change', function () {
            $timeout(function () {
                $scope.formService.serviceTypeId = $('#serviceTypeId').val();
            });
        });
    }

    $scope.listServiceInfo = () => {
        $http.get(url + '/service', { headers: headers }).then(response => {
            $scope.listServiceFromDB = response.data
            console.log("$scope.listServiceFromDB", response.data);
            if ($.fn.DataTable.isDataTable('#dataTable-list-service')) {
                $('#dataTable-list-service').DataTable().clear().destroy();
            }
            $(document).ready(function () {
                $('#dataTable-list-service').DataTable({
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
                    "ordering": false
                });
                $scope.$apply()
            });
        }).catch(error => {
            console.log("error", error);
        })
    }


    $scope.listServiceTypeInfo = () => {
        $http.get(url + '/service-type', { headers: headers }).then(response => {
            $scope.listServiceTypeDB = response.data
        }).catch(error => {
            console.log(("error", error));
        })
    }

    $scope.crudService = () => {
        $scope.viewMode = ""
        $scope.formService = {
            serviceId: -1,
            serviceName: '',
            price: 0,
            timeEstimate: 0,
            serviceTypeId: '',
            description: '',
            deleted: false
        };

        $scope.modalMode = (view, service) => {
            $scope.viewMode = view
            if (service != "") {


                $scope.formService = angular.copy(service);
                $scope.formService.price = $filter('number')(service.price);
                $scope.formService.serviceTypeId = service.serviceType ? service.serviceType.service_TypeId : -1
            } else {
                $scope.resetForm()
            }
        }

        $scope.resetForm = () => {
            $scope.formService = {
                serviceId: -1,
                serviceName: '',
                price: 0,
                timeEstimate: 0,
                serviceTypeId: '',
                description: ''
            };
        }

        $scope.refreshData = () => {
            $scope.listServiceInfo()
        }

        $scope.validationForm = () => {
            var valid = false
            $scope.processSelect2Data = () => {
                if (typeof $scope.formService.serviceTypeId === 'string' && $scope.formService.serviceTypeId.includes(':')) {
                    $scope.formService.serviceTypeId = parseInt($scope.formService.serviceTypeId.split(':')[1]);
                }
            }
            if ($scope.formService.serviceName == "" || $scope.formService.serviceName == null) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng nhập tên dịch vụ!",
                    icon: "error"
                })
            } else if ($scope.formService.serviceTypeId == "" || $scope.formService.serviceTypeId == null) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng chọn loại dịch vụ!",
                    icon: "error"
                })
            } else if ($scope.formService.price < 0 || $scope.formService.timeEstimate < 0) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Không được nhập số âm!",
                    icon: "error"
                })
            } else {
                $scope.processSelect2Data()
                valid = true
            }
            return valid
        }

        $scope.createService = () => {
            var valid = $scope.validationForm()
            $scope.formService.price = parseFloat($scope.formService.price.replace(/,/g, ''));
            var requsetServiceJSON = angular.toJson($scope.formService)
            if (valid) {
                $http.post(url + '/service', requsetServiceJSON, { headers: headers }).then(response => {
                    new Noty({
                        text: 'Thêm dịch vụ thành công !',
                        type: 'success',
                        timeout: 3000
                    }).show();
                    $scope.resetForm()
                    $scope.listServiceInfo()
                }).catch(err => {
                    new Noty({
                        text: 'Thêm dịch vụ thất bại. Vui lòng thử lại!',
                        type: 'error',
                        timeout: 3000
                    }).show();
                })
            }
        }

        $scope.updateService = () => {
            var valid = $scope.validationForm()
            $scope.formService.price = parseFloat($scope.formService.price.replace(/,/g, ''));
            var requsetServiceJSON = angular.toJson($scope.formService)
            var serviceId = $scope.formService.serviceId
            if (valid) {
                $http.put(url + '/service/' + serviceId, requsetServiceJSON, { headers: headers }).then(response => {
                    $('#serviceModalllll').modal('hide');

                    new Noty({
                        text: ' Cập nhật dịch vụ thành công !',
                        type: 'success',
                        timeout: 3000
                    }).show();

                    $scope.listServiceInfo()
                    $scope.resetForm()
                }).catch(error => {
                    new Noty({
                        text: 'Cập nhật dịch vụ thất bại. Vui lòng thử lại!',
                        type: 'error',
                        timeout: 3000
                    }).show();
                })
            }
        }

        $scope.deleteService = (service, $event) => {
            $event.preventDefault()
            var serviceId = service.serviceId
            console.log(serviceId)

            Swal.fire({
                text: "Bạn có muốn xóa dịch vụ ?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                cancelButtonText: 'Trở lại',
                confirmButtonText: 'Có'
            }).then(rs => {
                if (rs.isConfirmed) {
                    $http.delete(url + '/soft-delete-service/' + serviceId, { headers: headers }).then(respone => {
                        new Noty({
                            text: 'Xóa dịch vụ thành công !',
                            type: 'success',
                            timeout: 3000
                        }).show();
                        $scope.LoadServiceInfo()
                    }).catch(err => {
                        new Noty({
                            text: 'Xóa dịch vụ thất bại. Vui lòng thử lại!',
                            type: 'error',
                            timeout: 3000
                        }).show();
                    })
                }
            })

        }
    }


    $scope.initializeUIComponents()
    $scope.listServiceInfo();
    $scope.listServiceTypeInfo();
    $scope.crudService();

})