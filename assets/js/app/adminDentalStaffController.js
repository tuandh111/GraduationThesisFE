app.controller('AdminDentalStaffController', function ($scope, $http, $rootScope, $location, $timeout, API, adminBreadcrumbService) {
    let url = API.getBaseUrl();
    let headers = API.getHeaders();
    adminBreadcrumbService.generateBreadcrumb()
    //code here
    $scope.isEditDentalStaff = false
    $scope.isLoadingCreate = false
    $scope.isLoadingUpdate = false

    $scope.getListDepartments = () => {
        $http.get(url + '/department', { headers: headers }).then(response => {
            $scope.listDepartmentDB = response.data
        }).catch(error => {
            console.log("Error", error);
        })
    }

    $scope.listGenderTypeDB = [
        { genderId: 'MALE', genderName: 'Nam' },
        { genderId: 'FEMALE', genderName: 'Nữ' },
        { genderId: 'UNISEX', genderName: 'Khác' }
    ]; //backend xài enum

    $scope.initializeUIComponents = () => {
        $timeout(() => {
            $('.select2-department').select2(
                {
                    theme: 'bootstrap4',
                    placeholder: '---Chọn phòng ban---',
                    allowClear: true
                }).val(null).trigger('change')

            $('.select2-gender').select2(
                {
                    theme: 'bootstrap4',
                    placeholder: '---Chọn giới tính---',
                    allowClear: true
                }).val(null).trigger('change')

            $('.select2-multi').select2(
                {
                    multiple: true,
                    theme: 'bootstrap4',
                }).val(null).trigger('change')


            $('.drgpicker').daterangepicker(
                {
                    singleDatePicker: true,
                    timePicker: false,
                    showDropdowns: true,
                    locale:
                    {
                        format: 'DD/MM/YYYY',
                        applyLabel: 'Áp dụng',
                        cancelLabel: 'Hủy',
                    }
                });
        }, 500)
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
        $('.input-phonevn').mask('000 000 0000', {
            translation: {
                '0': { pattern: /\d/ } // Chấp nhận chỉ số
            }
        });
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

        $('#departmentId').on('change', function () {
            $timeout(function () {
                $scope.formDentalStaff.departmentId = $('#departmentId').val();
            });
        });
        $('#dentalStaffGender').on('change', function () {
            $timeout(function () {
                $scope.formDentalStaff.gender = $('#dentalStaffGender').val();
            });
        });
    }

    $scope.getListdentalStaff = () => {
        $http.get(url + '/dental-staff', { headers: headers }).then(respone => {
            $scope.listdentalStaffDB = respone.data
            if ($.fn.DataTable.isDataTable('#dataTable-list-dentalStaff')) {
                $('#dataTable-list-dentalStaff').DataTable().clear().destroy();
            }
            $(document).ready(function () {
                $('#dataTable-list-dentalStaff').DataTable({
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
            });
        }).catch(err => {
            console.log("Error", err);
        })
    }

    $scope.crudDentalStaff = () => {
        var currentDate = new Date();

        $scope.checkAge = function (dateOfBirth) {
            if (!dateOfBirth) return false;

            var birthDate = new Date(dateOfBirth);
            var age = currentDate.getFullYear() - birthDate.getFullYear();
            if (currentDate.getMonth() < birthDate.getMonth() ||
                (currentDate.getMonth() === birthDate.getMonth() && currentDate.getDate() < birthDate.getDate())) {
                age--;
            }
            return age >= 18;
        };

        $scope.validateBirthday = function () {
            return $scope.checkAge($scope.formDentalStaff.birthday);
        };

        $scope.$watch('formDentalStaff.birthday', function (newVal, oldVal) {
            if (newVal !== oldVal) {
                $scope.validateBirthday();
            }
        });

        $scope.validationForm = () => {
            var valid = false
            $scope.processSelect2Data = () => {
                if (typeof $scope.formDentalStaff.departmentId === 'string' && $scope.formDentalStaff.departmentId.includes(':')) {
                    $scope.formDentalStaff.departmentId = parseInt($scope.formDentalStaff.departmentId.split(':')[1]);
                }

                if (typeof $scope.formDentalStaff.gender === 'string' && $scope.formDentalStaff.gender.includes(':')) {
                    $scope.formDentalStaff.gender = $scope.formDentalStaff.gender.split(':')[1];
                }
            }
            if ($scope.formDentalStaff.departmentId == "" || $scope.formDentalStaff.departmentId == null) {
                Swal.fire({
                    position: "top-end",
                    title: "Cảnh báo!",
                    html: "Vui lòng chọn phòng ban!",
                    icon: "error"
                })
            } else if ($scope.formDentalStaff.gender == "" || $scope.formDentalStaff.gender == null) {
                Swal.fire({
                    position: "top-end",
                    title: "Cảnh báo!",
                    html: "Vui lòng chọn giới tính!",
                    icon: "error"
                })
            } else if ($scope.formDentalStaff.fullName == "" || $scope.formDentalStaff.fullName == null) {
                Swal.fire({
                    position: "top-end",
                    title: "Cảnh báo!",
                    html: "Vui lòng nhập họ tên!",
                    icon: "error"
                })
            } else if (!$scope.validateBirthday()) {
                Swal.fire({
                    position: "top-end",
                    title: "Cảnh báo!",
                    html: "Ngày sinh phải đủ 18 tuổi!",
                    icon: "error"
                })
            } else if ($scope.formDentalStaff.phoneNumber == "") {
                Swal.fire({
                    position: "top-end",
                    title: "Cảnh báo!",
                    html: "Vui lòng nhập số điện thoại!",
                    icon: "error"
                })
            } else if ($scope.formDentalStaff.address == "") {
                Swal.fire({
                    position: "top-end",
                    title: "Cảnh báo!",
                    html: "Vui lòng nhập địa chỉ!",
                    icon: "error"
                })
            } else {
                $scope.processSelect2Data()
                valid = true
            }
            return valid
        }

        $scope.editDentalStaff = (dentalStaff, $event) => {
            $event.preventDefault()
            $scope.isEditDentalStaff = true
            if (dentalStaff != null) {
                $scope.formDentalStaff = {
                    imageURL: dentalStaff.imageURL,
                    dentalStaffId: dentalStaff.dentalStaffId,
                    fullName: dentalStaff.fullname,
                    phoneNumber: dentalStaff.phoneNumber,
                    gender: dentalStaff.gender,
                    address: dentalStaff.address,
                    birthday: new Date(dentalStaff.birthday),
                    deleted: dentalStaff.deleted

                }
                $scope.formDentalStaff.departmentId = dentalStaff.department ? dentalStaff.department.departmentId : -1
                $scope.imageUrlStaff = dentalStaff.imageURL
            }
            const firstTabButtonCreate = document.getElementById('form-tab-dentalStaff');
            firstTabButtonCreate.click();
        }

        $scope.createdentalStaff = () => {
            if ($scope.formDentalStaff.dentalStaffId != -1) {
                Swal.fire({
                    position: "top-end",
                    title: "Cảnh báo!",
                    html: "Thông tin đã có trên hệ thống!",
                    icon: "error"
                })
                return
            }
            var valid = $scope.validationForm()
            if (valid) {
                $scope.isLoadingCreate = true
                $scope.formDentalStaff.imageURL = $scope.imageUrlStaff
                var requsetdentalStaffJSON = angular.toJson($scope.formDentalStaff)
                $http.post(url + '/dental-staff', requsetdentalStaffJSON, { headers: headers }).then(respone => {
                    $timeout(() => {
                        new Noty({
                            text: 'Đã thêm nhân viên thành công !',
                            type: 'success',
                            timeout: 3000
                        }).show();
                        $scope.resetForm()
                        $scope.getListdentalStaff()
                        const secondTabButtonCreate = document.getElementById('list-tab-dentalStaff');
                        secondTabButtonCreate.click();
                    }, 3000)
                }).finally(() => {
                    $timeout(() => {
                        $scope.isLoadingCreate = false
                    }, 3000)
                })
                    .catch(err => {
                        console.log("Error creating", err);
                        new Noty({
                            text: 'Thêm nhân viên thất bại. Vui lòng thử lại !',
                            type: 'error',
                            timeout: 3000
                        }).show();
                    });
            }
        }

        $scope.updatedentalStaff = () => {
            if ($scope.formDentalStaff.dentalStaffId == -1) {
                Swal.fire({
                    position: "top-end",
                    title: "Cảnh báo!",
                    html: "Thông tin chưa có trên hệ thống!",
                    icon: "error"
                })
                return
            }
            var valid = $scope.validationForm()
            if (valid) {
                $scope.isLoadingUpdate = true
                if ($scope.imageUrlStaff != null) {
                    $scope.formDentalStaff.imageURL = $scope.imageUrlStaff
                }
                var requsetdentalStaffJSON = angular.toJson($scope.formDentalStaff)
                var dentalStaffId = $scope.formDentalStaff.dentalStaffId
                $http.put(url + '/dental-staff/' + dentalStaffId, requsetdentalStaffJSON, { headers: headers }).then(respone => {
                    $timeout(() => {
                        new Noty({
                            text: 'Cập nhật thành công!',
                            type: 'success',
                            timeout: 3000
                        }).show();
                        $scope.resetForm()
                        $scope.getListdentalStaff()
                        const secondTabButtonCreate = document.getElementById('list-tab-dentalStaff');
                        secondTabButtonCreate.click();
                    }, 3000)
                }).finally(() => {
                    $timeout(() => {
                        $scope.isLoadingUpdate = false
                    }, 3000)
                }).catch(err => {
                    new Noty({
                        text: 'Cập nhật thất bại. Vui lòng thử lại !',
                        type: 'error',
                        timeout: 3000
                    }).show();
                })
            }

        }

        $scope.deletedentalStaff = (dentalStaff, $event) => {
            $event.preventDefault()
            var dentalStaffId = dentalStaff.dentalStaffId
            Swal.fire({
                text: "Bạn có muốn xóa nhân viên " + dentalStaff.fullname + " ?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                cancelButtonText: 'Trở lại',
                confirmButtonText: 'Có'
            }).then(rs => {
                if (rs.isConfirmed) {
                    $http.delete(url + '/sort-delete-dental-staff/' + dentalStaffId, { headers: headers }).then(respone => {
                        new Noty({
                            text: 'Đã xóa thành công!',
                            type: 'success',
                            timeout: 3000
                        }).show();
                        $scope.getListdentalStaff()
                    }).catch(err => {
                        new Noty({
                            text: 'Xóa thất bại. Vui lòng thử lại!',
                            type: 'error',
                            timeout: 3000
                        }).show();
                    })
                }
            })
        }
        $scope.resetForm = () => {
            $scope.formDentalStaff = {
                imageURL: 'abc.jpg',
                dentalStaffId: -1,
                fullName: '',
                departmentId: '',
                phoneNumber: '',
                gender: '',
                address: '',
                birthday: new Date("01/01/1999"),
                deleted: false
            }
            $scope.deleteImgStaff()
        }
    }



    $scope.uploadImg = (files) => {
        if (files == null || files.length === 0) {
            alert("No files selected for upload.");
            return;
        }
        swal.fire({
            title: 'Đang tải ảnh lên...',
            text: 'Vui lòng chờ trong giây lát.',
            allowOutsideClick: false,
            didOpen: () => {
                swal.showLoading();
            }
        });
        var file = files[0];
        var form = new FormData();
        form.append("file", file);
        $http.post(url + '/upload-cloudinary', form, {
            transformRequest: angular.identity,
            headers: { 'Content-Type': undefined }
        }).then(function (response) {
            $scope.imageUrlStaff = response.data.message;
            swal.close();
            new Noty({
                text: 'Tải ảnh thành công!',
                type: 'success',
                timeout: 3000
            }).show();
        }).catch(function (error) {
            swal.close();
            new Noty({
                text: 'Tải ảnh thất bại. Vui lòng thử lại!',
                type: 'error',
                timeout: 3000
            }).show();
            console.log("Upload failed:", error);
        });

    }

    $scope.deleteImgStaff = () => {
        document.getElementById('filesStaffCloudinary').value = "";
        $scope.imageUrlStaff = null;
    }



    $scope.getListDepartments()
    $scope.getListdentalStaff()
    $scope.initializeUIComponents()
    $scope.crudDentalStaff()
    $scope.resetForm()
})