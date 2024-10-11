app.controller('AdminMedicineController', function ($scope, $http, $rootScope, $location, processSelect2Service, $timeout, API, adminBreadcrumbService) {
    let url = API.getBaseUrl();
    let headers = API.getHeaders();
    adminBreadcrumbService.generateBreadcrumb()
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
                $scope.formMedicine.distributionMedicinesId = processSelect2Service.processSelect2Data(selectedVal)[0]
            });
        });

        $('#manageMedicinesModalmedicineCategory').on('change', function () {
            $timeout(function () {
                let selectedVal = $('#manageMedicinesModalmedicineCategory').val();
                $scope.formMedicine.medicineCategoryId = processSelect2Service.processSelect2Data(selectedVal)[0]
            });
        });
        $('#manageMedicinesModalmedicinesDosageAmount').on('change', function () {
            $timeout(function () {
                let selectedVal = $('#manageMedicinesModalmedicinesDosageAmount').val();
                $scope.formMedicine.medicinesDosageAmountId = processSelect2Service.processSelect2Data(selectedVal)[0]
            });
        });
        $('#manageMedicinesModalmedicinesDosageUnit').on('change', function () {
            $timeout(function () {
                let selectedVal = $('#manageMedicinesModalmedicinesDosageUnit').val();
                $scope.formMedicine.medicinesDosageUnitId = processSelect2Service.processSelect2Data(selectedVal)[0]
            });
        });
    }

    $scope.getListMedicine = () => {
        $http.get(url + '/medicines', { headers: headers }).then(response => {
            $scope.listMedicineDB = response.data;

            // Function to generate QR code for a medicine
            const generateQRCodeForMedicine = (medicine) => {
                const medicineString = "Ma thuoc: " + JSON.stringify(medicine.medicinesId) + ", Ten thuoc" + JSON.stringify(medicine.medicineName);
                return $http.post(url + '/generateQRCode', { data: medicineString }, { headers: headers })
                    .then(response => {
                        // Assuming the response contains the QR code data
                        console.log("Data3: " + response.data.message);
                        medicine.qrCode = response.data.message;
                    }).catch(err => {
                        console.log("Error generating QR code", err);
                    });
            };

            // Generate QR codes for all medicines
            const promises = $scope.listMedicineDB.map(medicine => generateQRCodeForMedicine(medicine));

            // Wait for all QR codes to be generated before initializing DataTable
            Promise.all(promises).then(() => {
                if ($.fn.DataTable.isDataTable('#dataTable-list-medicine')) {
                    $('#dataTable-list-medicine').DataTable().clear().destroy();
                }
                $(document).ready(function () {
                    $('#dataTable-list-medicine').DataTable({
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
                            sSearch: "Tìm kiếm:",
                            oPaginate: {
                                sFirst: "Đầu",
                                sPrevious: "Trước",
                                sNext: "Tiếp",
                                sLast: "Cuối"
                            }
                        }
                    });
                });
            });

        }).catch(err => {
            console.log("Error fetching medicines", err);
        });
    };
    $scope.getListMedicine1 = () => {
        $http.get(url + '/medicines', { headers: headers }).then(response => {
            $scope.listMedicineDB = response.data;

            // Function to generate QR code for a medicine
            const generateQRCodeForMedicine = (medicine) => {
                const medicineString = "Ma thuoc: " + JSON.stringify(medicine.medicinesId) + ", Ten thuoc" + JSON.stringify(medicine.medicineName);
                return $http.post(url + '/generateQRCode', { data: medicineString }, { headers: headers })
                    .then(response => {
                        // Assuming the response contains the QR code data
                        console.log("Data3: " + response.data.message);
                        medicine.qrCode = response.data.message;
                    }).catch(err => {
                        console.log("Error generating QR code", err);
                    });
            };

            // Generate QR codes for all medicines
            const promises = $scope.listMedicineDB.map(medicine => generateQRCodeForMedicine(medicine));
            $('#dataTable-list-medicine').DataTable().clear().destroy();

            $(document).ready(function () {
                $('#dataTable-list-medicine').DataTable({
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
                        sSearch: "Tìm kiếm:",
                        oPaginate: {
                            sFirst: "Đầu",
                            sPrevious: "Trước",
                            sNext: "Tiếp",
                            sLast: "Cuối"
                        }
                    }
                });
            });// Wait for all QR codes to be generated before initializing DataTable


        }).catch(err => {
            console.log("Error fetching medicines", err);
        });
    };

    $scope.getListMedicineCategory = function () {
        $http.get(url + '/medicine-categories', { headers: headers }).then(response => {
            $scope.listMedicineCategoryDB = response.data;
        });
    };

    $scope.getListMedicinesDosageUnit = function () {
        $http.get(url + '/medicines-dosage-units', { headers: headers }).then(response => {
            $scope.listMedicinesDosageUnitDB = response.data;
        });
    };

    $scope.getListMedicineDistribution = function () {
        $http.get(url + '/distribution-medicines', { headers: headers }).then(response => {
            $scope.listDistributionMedicinesDB = response.data;
        });
    };

    $scope.getListMedicineDosageAmount = function () {
        $http.get(url + '/medicines-dosage-amounts', { headers: headers }).then(response => {
            $scope.listMedicinesDosageAmountDB = response.data;
        });
    };

    $scope.crudMedicine = () => {
        $scope.formMedicine = {
            medicinesId: -1,
            medicineName: '',
            medicineCategoryId: -1,
            distributionMedicinesId: -1,
            medicinesDosageAmountId: -1,
            medicinesDosageUnitId: -1,
            beforeEating: false
        };

        $scope.validationForm = () => {
            if (!$scope.formMedicine.medicineName) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng nhập tên thuốc!",
                    icon: "error"
                });
                return false;
            } else if ($scope.formMedicine.medicineCategoryId === -1) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng chọn loại thuốc!",
                    icon: "error"
                });
                return false;
            } else if ($scope.formMedicine.distributionMedicinesId === -1) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng chọn nhà phân phối!",
                    icon: "error"
                });
                return false;
            } else if ($scope.formMedicine.medicinesDosageAmountId === -1) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng chọn liều lượng!",
                    icon: "error"
                });
                return false;
            } else if ($scope.formMedicine.medicinesDosageUnitId === -1) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng chọn đơn vị liều lượng!",
                    icon: "error"
                });
                return false;
            }
            return true;
        };

        $scope.createMedicine = () => {
            if ($scope.formMedicine.medicinesId !== -1) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Thông tin đã có trên hệ thống!",
                    icon: "error"
                });
                return;
            }
            if ($scope.validationForm()) {
                var requestMedicineJSON = angular.toJson($scope.formMedicine);
                $http.post(url + '/medicines', requestMedicineJSON, { headers: headers }).then(response => {
                    new Noty({
                        text: 'Thêm thuốc thành công !',
                        type: 'success',
                        timeout: 3000
                    }).show();
                    $scope.resetForm();
                    $scope.getListMedicine1();
                    document.getElementById('list-tab-medicine').click();
                }).catch(err => {
                    new Noty({
                        text: 'Thêm thuốc thất bại. Vui lòng thử lại!',
                        type: 'error',
                        timeout: 3000
                    }).show();
                });
            }
        };

        $scope.updateMedicine = () => {
            if ($scope.formMedicine.medicinesId === -1) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Thông tin chưa có trên hệ thống!",
                    icon: "error"
                });
                return;
            }
            if ($scope.validationForm()) {
                var requestMedicineJSON = angular.toJson($scope.formMedicine);
                var medicinesId = $scope.formMedicine.medicinesId;
                $http.put(url + '/medicines/' + medicinesId, requestMedicineJSON, { headers: headers }).then(response => {
                    new Noty({
                        text: 'Cập nhật thuốc thành công !',
                        type: 'success',
                        timeout: 3000
                    }).show();
                    $scope.resetForm();
                    $scope.getListMedicine1();
                    document.getElementById('list-tab-medicine').click();
                }).catch(err => {
                    new Noty({
                        text: 'Cập nhật thuốc thất bại. Vui lòng thử lại!',
                        type: 'error',
                        timeout: 3000
                    }).show();
                });
            }
        };

        $scope.deleteMedicine = (medicine, $event) => {
            $event.preventDefault();
            var medicinesId = medicine.medicinesId;
            Swal.fire({
                text: "Bạn có muốn xóa Thuốc " + medicine.medicineName + " ?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                cancelButtonText: 'Trở lại',
                confirmButtonText: 'Có'
            }).then(rs => {
                if (rs.isConfirmed) {
                    $http.delete(url + '/medicines/' + medicinesId, { headers: headers }).then(response => {
                        new Noty({
                            text: 'Xóa thuốc thành công !',
                            type: 'success',
                            timeout: 3000
                        }).show();
                        $scope.getListMedicine1();
                    }).catch(err => {
                        new Noty({
                            text: 'Xóa thuốc thất bại. Vui lòng thử lại!',
                            type: 'error',
                            timeout: 3000
                        }).show();
                    });
                }
            });
        };

        $scope.resetForm = () => {
            $scope.formMedicine = {
                medicinesId: -1,
                medicineName: '',
                medicineCategoryId: -1,
                distributionMedicinesId: -1,
                medicinesDosageAmountId: -1,
                medicinesDosageUnitId: -1,
                beforeEating: false
            };
        };

        $scope.editMedicine = (medicine, $event) => {
            $event.preventDefault();
            if (medicine != null) {
                $scope.formMedicine = {
                    medicinesId: medicine.medicinesId,
                    medicineName: medicine.medicineName,
                    medicineCategoryId: medicine.medicineCategory.medicineCategoryId,
                    distributionMedicinesId: medicine.distributionMedicines.distributionMedicinesId,
                    medicinesDosageAmountId: medicine.medicinesDosageAmount.medicinesDosageAmountId,
                    medicinesDosageUnitId: medicine.medicinesDosageUnit.medicinesDosageUnitId,
                    beforeEating: medicine.beforeEating,
                    deleted: medicine.deleted
                };
            }
            document.getElementById('form-tab-medicine').click();
        };
    };

    $scope.crudMedicine();
    $scope.getListMedicinesDosageUnit();
    $scope.getListMedicineDosageAmount();
    $scope.getListMedicineDistribution();
    $scope.getListMedicine();
    $scope.getListMedicineCategory();
    $scope.initializeUIComponents();
});
