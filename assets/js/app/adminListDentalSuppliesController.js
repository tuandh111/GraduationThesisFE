
app.controller('AdminListDentalSupplies', function ($scope, $http, $rootScope, $location, $timeout, API, adminBreadcrumbService, processSelect2Service) {
    let url = API.getBaseUrl();
    let headers = API.getHeaders();
    adminBreadcrumbService.generateBreadcrumb()
    //code here
    $scope.listDistributionSuppliesFormDB = [];
    $scope.listDentalSuppliesFromDB = [];
    $scope.editDentalSupplies = {};
    //code here
    //clear form dental supplies
    $scope.clearFormDentalSuppliesFormDB = () => {
        $scope.suppliesName = ''

        $scope.description = ''

        $scope.distributionSuppliesId = ''
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

        $('#manageMedicinesModaldistributionName').on('change', function () {
            $timeout(function () {
                let selectedVal = $('#manageMedicinesModaldistributionName').val();
                $scope.editDentalSupplies.distributionSupplies.distributionId = processSelect2Service.processSelect2Data(selectedVal)[0]
            });
        });
    }
    $scope.listDentalSuppliesFromDB = () => {
        $http.get(url + '/dental-supplies-except-deleted', { headers: headers }).then(response => {
            $scope.listDentalSuppliesFromDB = response.data
            if ($.fn.DataTable.isDataTable('#dataTable-list-service1')) {
                $('#dataTable-list-service1').DataTable().clear().destroy();
            }
            $(document).ready(function () {
                $('#dataTable-list-service1').DataTable({
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
                $scope.$apply()
            });
        }).catch(error => {
            console.log("error", error);
        })
    }
    $scope.listDentalSuppliesFromDB1 = () => {
        $http.get(url + '/dental-supplies-except-deleted', { headers: headers }).then(response => {
            $scope.listDentalSuppliesFromDB = response.data
            $('#dataTable-list-service1').DataTable().clear().destroy();
            $(document).ready(function () {
                $('#dataTable-list-service1').DataTable({
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
                $scope.$apply()
            });
        }).catch(error => {
            console.log("error", error);
        })
    }


    $scope.createDentalSuppliesFromDB = () => {
        $scope.errorSuppliesName = false;
        $scope.errorDistributionSupplies = false;
        if ($scope.suppliesName == '' || $scope.suppliesName == undefined) {
            $scope.errorSuppliesName = true;
        } else {
            $scope.errorSuppliesName = false;
        }
        if ($scope.errorSuppliesName || $scope.errorDistributionSupplies) {
            return;
        }
        var DentalSuppliesRequest = {
            suppliesName: $scope.suppliesName,

            description: $scope.description,

            distributionSuppliesId: parseInt($scope.distributionSuppliesId, 10)
        }
        $http.post(url + '/dental-supplies', angular.toJson(DentalSuppliesRequest), { headers: headers }).then(response => {

            new Noty({
                text: 'Thêm vật tư thành công !',
                type: 'success',
                timeout: 3000
            }).show();
            $scope.clearFormDentalSuppliesFormDB();
        }).catch(error => {
            new Noty({
                text: 'Thêm vật tư thất bại. Vui lòng thử lại!',
                type: 'error',
                timeout: 3000
            }).show();
            console.log("error", error);
        });
    }

    $scope.deleteDentalSupplies = (d) => {

        Swal.fire({
            title: "Bạn có chắc?",
            text: "Bạn có muốn xóa " + d.suppliesName + " này không?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Có"
        }).then((result) => {
            if (result.isConfirmed) {
                $http.delete(url + '/soft-delete-dental-supplies/' + d.suppliesId, { headers: headers }).then(response => {
                    new Noty({
                        text: 'Xóa vật tư thành công !',
                        type: 'success',
                        timeout: 3000
                    }).show();
                    $scope.listDentalSuppliesFromDB1();
                }).catch(error => {
                    new Noty({
                        text: 'Xóa vật tư thất bại. Vui lòng thử lại!',
                        type: 'error',
                        timeout: 3000
                    }).show();
                    console.log("error", error);
                })

            }
        });
    }

    $scope.editDentalSupply = (d) => {


        $scope.editDentalSupplies = angular.copy(d)

    }

    $scope.updateDentalSupply = () => {
        var DentalSuppliesRequest = {
            suppliesName: $scope.editDentalSupplies.suppliesName,

            description: $scope.editDentalSupplies.description,

            distributionSuppliesId: parseInt($scope.editDentalSupplies.distributionSupplies.distributionId, 10)
        }
        $http.put(url + '/dental-supplies/' + $scope.editDentalSupplies.suppliesId, angular.toJson(DentalSuppliesRequest), { headers: headers }).then(response => {


            new Noty({
                text: 'Cập nhật thành công !',
                type: 'success',
                timeout: 3000
            }).show();
            $scope.listDentalSuppliesFromDB1();




        }).catch(error => {
            new Noty({
                text: 'Cập nhật thất bại. Vui lòng thử lại!',
                type: 'error',
                timeout: 3000
            }).show();
            console.log("error", error);
        });
    }

    $scope.listDistributionSupplies = () => {
        $http.get(url + '/distribution-supplies', { headers: headers }).then(response => {
            $scope.listDistributionSuppliesFormDB = response.data

        }).catch(error => {
            console.log("error", error);
        })
    }

    $scope.createDistributionSupplies = () => {
        $scope.errorDistribution = false
        $scope.errorName = false
        $scope.errorAddress = false
        $scope.errorContactPerson = false
        $scope.errorEmail = false
        $scope.errorTaxCode = false
        if ($scope.distribution == "" || $scope.distribution == undefined) {
            $scope.errorDistribution = true
        } else {
            $scope.errorDistribution = false
        }

        if ($scope.name == "" || $scope.name == undefined) {
            $scope.errorName = true
        } else {
            $scope.errorName = false
        }
        if ($scope.address == "" || $scope.address == undefined) {
            $scope.errorAddress = true
        } else {
            $scope.errorAddress = false
        }

        if ($scope.contactPerson == "" || $scope.contactPerson == undefined) {
            $scope.errorContactPerson = true
        } else {
            $scope.errorContactPerson = false
        }

        if ($scope.email == "" || $scope.email == undefined) {
            $scope.errorEmail = true
        } else {
            $scope.errorEmail = false
        }

        if ($scope.taxCode == "" || $scope.taxCode == undefined) {
            $scope.errorTaxCode = true
        } else {
            $scope.errorTaxCode = false
        }
        if ($scope.errorDistribution ||
            $scope.errorName ||
            $scope.errorAddress ||
            $scope.errorContactPerson ||
            $scope.errorEmail ||
            $scope.errorTaxCode) {
            console.log($scope.errorDistribution,
                $scope.errorName,
                $scope.errorAddress,
                $scope.errorContactPerson,
                $scope.errorEmail,
                $scope.errorTaxCode); return;
        }

        var DistributionSuppliesRequest = {
            distribution: $scope.distribution,

            name: $scope.name,

            address: $scope.address,

            contactPerson: $scope.contactPerson,

            email: $scope.email,

            note: $scope.note,

            taxCode: $scope.taxCode
        }
        $http.post(url + '/distribution-supplies', DistributionSuppliesRequest, { headers: headers }).then(response => {

            new Noty({
                text: 'Thêm nhà phân phối thành công !',
                type: 'success',
                timeout: 3000
            }).show();
            $scope.listDistributionSupplies();
        }).catch(error => {
            new Noty({
                text: 'Thêm nhà phân phối thất bại. Vui lòng thử lại!',
                type: 'error',
                timeout: 3000
            }).show();
            console.log("error", error);
        })
    }




    $scope.listDentalSuppliesFromDB();
    $scope.listDistributionSupplies();
    $scope.initializeUIComponents();
})