app.controller('AdminDoctorController', function ($scope, $http, $rootScope, $location, $timeout, API, $route, adminBreadcrumbService, TimezoneService) {
    let url = API.getBaseUrl();
    let headers = API.getHeaders();
    adminBreadcrumbService.generateBreadcrumb()
    // code here
    const defaultTimezone = "Asia/Ho_Chi_Minh"

    $scope.initData = () => {
        $scope.fileDoctorCloudinary = []
        $scope.fileSignatureCloudinary = []
        $scope.filenames = []
        $scope.fileSignatures = []
        $scope.isUpdateDoctor = false
        $scope.isLoadingCreate = false
        $scope.isLoadingUpdate = false
        $scope.formDoctor = {
            image: 'default.jpg',
            doctorId: -1,
            fullName: '',
            degrees: '',
            specialtyId: '',
            phoneNumber: '',
            gender: '',
            address: '',
            birthday: moment("01/1/1999", "DD/MM/YYYY").format('DD/MM/YYYY'),
            signature: 'abc',
            deleted: false
        }
    }

    $scope.listDegreesTypeDB = [
        { degreesId: 1, degreesName: 'Thạc sĩ' },
        { degreesId: 2, degreesName: 'Tiến sĩ' },
        { degreesId: 3, degreesName: 'Bác sĩ' },
        { degreesId: 4, degreesName: 'Giáo sư' },
        { degreesId: 5, degreesName: 'Y tá' },
        { degreesId: 6, degreesName: 'Y sĩ' },
        // Các chuyên khoa khác trong nha khoa
    ];

    $scope.listGenderTypeDB = [
        { genderId: 'MALE', genderName: 'Nam' },
        { genderId: 'FEMALE', genderName: 'Nữ' },
        { genderId: 'UNISEX', genderName: 'Khác' }
    ];

    $scope.initializeUIComponents = () => {
        $timeout(() => {
            $('.select2-degrees').select2(
                {
                    theme: 'bootstrap4',
                    placeholder: '---Chọn cấp bậc---',
                    allowClear: true
                }).val(null).trigger('change')

            $('.select2-specialty').select2(
                {
                    theme: 'bootstrap4',
                    placeholder: '---Chọn chuyên khoa---',
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
                });


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
            $('.drgpicker').on('apply.daterangepicker', function (ev, picker) {
                let selectedDate = picker.startDate.format('DD/MM/YYYY');
                $scope.formDoctor.birthday = selectedDate
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

        $('#degreesId').on('change', function () {
            $timeout(function () {
                $scope.formDoctor.degrees = $('#degreesId').val();
            });
        });
        $('#specialtyId').on('change', function () {
            $timeout(function () {
                $scope.formDoctor.specialtyId = $('#specialtyId').val();
            });
        });
        $('#doctorGender').on('change', function () {
            $timeout(function () {
                $scope.formDoctor.gender = $('#doctorGender').val();
            });
        });
    }

    $scope.getListDegrees = () => {
        $http.get(url + "/specialty", { headers: headers }).then(response => {
            $scope.listSpecialtyTypeDB = response.data
        }).catch(err => {
            new Noty({
                text: 'Xảy ra lỗi !',
                type: 'error',
                timeout: 3000
            }).show();
        })
    }

    $scope.getListDoctor = () => {
        $http.get(url + '/doctor-except-deleted', { headers: headers }).then(respone => {
            $scope.listDoctorDB = respone.data
            if ($.fn.DataTable.isDataTable('#dataTable-list-doctor')) {
                $('#dataTable-list-doctor').DataTable().clear().destroy();
            }
            $(document).ready(function () {
                $('#dataTable-list-doctor').DataTable({
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
                    autoWidth: false,
                    columnDefs: [
                        { width: '10%', targets: 0 },
                        { width: '10%', targets: 1 },
                        { width: '20%', targets: 2 },
                        { width: '15%', targets: 3 },
                        { width: '10%', targets: 4 },
                        { width: '15%', targets: 5 },
                        { width: '10%', targets: 6 },
                        { width: '10%', targets: 7 }
                    ]
                });
            });
        }).catch(err => {
            console.log("Error", err);
        })
    }

    $scope.crudDoctor = () => {
        var currentDate = new Date();
        $scope.formDoctor = {
            image: 'default.jpg',
            doctorId: -1,
            fullName: '',
            degrees: '',
            specialtyId: '',
            phoneNumber: '',
            gender: '',
            address: '',
            birthday: new Date("01/01/1999"),
            signature: 'abc',
            deleted: false
        }
        $scope.checkAge = function (dateOfBirth) {
            if (!dateOfBirth) return false;

            var birthDate = new Date(moment(dateOfBirth, "DD/MM/YYYY").format("YYYY-MM-DD"));

            var age = currentDate.getFullYear() - birthDate.getFullYear();
            if (currentDate.getMonth() < birthDate.getMonth() ||
                (currentDate.getMonth() === birthDate.getMonth() && currentDate.getDate() < birthDate.getDate())) {
                age--;
            }
            return age >= 18;
        };

        $scope.validateBirthday = function () {
            return $scope.checkAge($scope.formDoctor.birthday);
        };

        $scope.$watch('formDoctor.birthday', function (newVal, oldVal) {
            if (newVal !== oldVal) {
                $scope.validateBirthday();
            }
        });

        $scope.validationForm = () => {
            var valid = false
            $scope.processSelect2Data = () => {
                if (typeof $scope.formDoctor.degrees === 'string' && $scope.formDoctor.degrees.includes(':')) {
                    $scope.formDoctor.degrees = parseInt($scope.formDoctor.degrees.split(':')[1]);
                }

                if (typeof $scope.formDoctor.specialtyId === 'string' && $scope.formDoctor.specialtyId.includes(':')) {
                    $scope.formDoctor.specialtyId = parseInt($scope.formDoctor.specialtyId.split(':')[1]);
                }

                if (typeof $scope.formDoctor.gender === 'string' && $scope.formDoctor.gender.includes(':')) {
                    $scope.formDoctor.gender = $scope.formDoctor.gender.split(':')[1];
                }
            }

            if ($scope.formDoctor.degrees == "" || $scope.formDoctor.degrees == null) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng chọn bằng cấp!",
                    icon: "error"
                })
            } else if ($scope.formDoctor.specialtyId == "" || $scope.formDoctor.specialtyId == null) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng chọn chuyên khoa!",
                    icon: "error"
                })
            } else if ($scope.formDoctor.gender == "" || $scope.formDoctor.gender == null) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng chọn giới tính!",
                    icon: "error"
                })
            } else if ($scope.formDoctor.fullName == "" || $scope.formDoctor.fullName == null) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng nhập họ tên!",
                    icon: "error"
                })
            } else if (!$scope.validateBirthday()) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Ngày sinh phải đủ 18 tuổi!",
                    icon: "error"
                })
            } else if ($scope.formDoctor.phoneNumber == "") {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng nhập số điện thoại!",
                    icon: "error"
                })
            } else if ($scope.formDoctor.address == "") {
                Swal.fire({
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

        $scope.editDoctor = (doctor, $event) => {
            $event.preventDefault()
            $scope.isUpdateDoctor = true
            if (doctor != null) {
                $scope.formDoctor = {
                    image: doctor.image,
                    doctorId: doctor.doctorId,
                    fullName: doctor.fullName,
                    degrees: doctor.degrees,
                    phoneNumber: doctor.phoneNumber,
                    gender: doctor.gender,
                    address: doctor.address,
                    birthday: moment(new Date(doctor.birthday)).format("DD/MM/YYYY"),
                    signature: doctor.signature,
                    deleted: doctor.deleted
                }
                $scope.formDoctor.specialtyId = doctor.specialty ? doctor.specialty.specialtyId : -1
                $scope.imageUrlDoctor = doctor.image
                $scope.imageUrlSignature = doctor.signature
            }

            const firstTabButtonCreate = document.getElementById('form-tab-doctor');
            firstTabButtonCreate.click();
        }

        $scope.createDoctor = async () => {

            if ($scope.formDoctor.doctorId != -1) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Thông tin đã có trên hệ thống!",
                    icon: "error"
                })
                return
            }
            var valid = $scope.validationForm()
            if (valid) {
                $scope.isLoadingCreate = true
                $scope.formDoctor.image = $scope.imageUrlDoctor
                $scope.formDoctor.signature = $scope.imageUrlSignature
                $scope.formDoctor.birthday = TimezoneService.convertToTimezone(moment($scope.formDoctor.birthday, "DD/MM/YYYY"), defaultTimezone)
                var requestDoctorJSON = angular.toJson($scope.formDoctor)

                try {
                    const response = await $http.post(url + '/doctor', requestDoctorJSON, { headers: headers });
                    $timeout(() => {
                        new Noty({
                            text: 'Thêm bác sĩ thành công!',
                            type: 'success',
                            timeout: 3000
                        }).show();

                        $scope.resetForm();
                        $scope.getListDoctor();
                        const secondTabButtonCreate = document.getElementById('list-tab-doctor');
                        if (secondTabButtonCreate) {
                            secondTabButtonCreate.click();
                        }
                    }, 3000);

                } catch (error) {
                    console.error('Có lỗi xảy ra:', error);
                    new Noty({
                        text: 'Thêm bác sĩ thất bại. Vui lòng thử lại!',
                        type: 'error',
                        timeout: 3000
                    }).show();
                } finally {
                    $timeout(() => {
                        $scope.isLoadingCreate = false;
                    }, 3000);
                }
            }
        }

        $scope.updateDoctor = async () => {
            if ($scope.formDoctor.doctorId == -1) {
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
                if ($scope.imageUrlDoctor != null) {
                    $scope.formDoctor.image = $scope.imageUrlDoctor
                }
                if ($scope.imageUrlSignature != null) {
                    $scope.formDoctor.signature = $scope.imageUrlSignature
                }
                $scope.formDoctor.birthday = TimezoneService.convertToTimezone(moment($scope.formDoctor.birthday, "DD/MM/YYYY"), defaultTimezone)
                var requestDoctorJSON = angular.toJson($scope.formDoctor)

                try {
                    const response = await $http.put(url + '/doctor/' + $scope.formDoctor.doctorId, requestDoctorJSON, { headers: headers });

                    $timeout(() => {
                        new Noty({
                            text: 'Cập nhật thông tin thành công !',
                            type: 'success',
                            timeout: 3000
                        }).show();

                        $scope.resetForm();
                        $scope.getListDoctor();
                        const secondTabButtonCreate = document.getElementById('list-tab-doctor');
                        if (secondTabButtonCreate) {
                            secondTabButtonCreate.click();
                        }
                    }, 3000);

                } catch (error) {
                    console.error('Có lỗi xảy ra:', error);
                    new Noty({
                        text: 'Cập nhật thất bại. Vui lòng thử lại!',
                        type: 'error',
                        timeout: 3000
                    }).show();
                } finally {
                    $timeout(() => {
                        $scope.isLoadingUpdate = false;
                    }, 3000);
                }
            }
        }



        $scope.deleteDoctor = (doctor, $event) => {
            $event.preventDefault()
            var doctorId = doctor.doctorId
            Swal.fire({
                text: "Bạn có muốn xóa Bác sĩ " + doctor.fullName + " ?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                cancelButtonText: 'Trở lại',
                confirmButtonText: 'Có'
            }).then(rs => {
                if (rs.isConfirmed) {
                    $http.delete(url + '/soft-delete-doctor/' + doctorId, { headers: headers }).then(respone => {
                        new Noty({
                            text: 'Đã xóa thành công!',
                            type: 'success',
                            timeout: 3000
                        }).show();
                        $scope.getListDoctor()
                    }).catch(err => {
                        console.log("err", err);

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
            $scope.initData()
            $scope.deleteImgDoctor()
            $scope.deleteImgSignature()
        }
    }

    $scope.uploadImgDoctorToTempFolder = (files) => {

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
            $scope.imageUrlDoctor = response.data.message;
            swal.close();
            new Noty({
                text: 'Tải ảnh lên thành công!',
                type: 'success',
                timeout: 3000
            }).show();
        }).catch(function (error) {
            swal.close();
            new Noty({
                text: 'Tải ảnh lên thất bại. Vui lòng thử lại!',
                type: 'error',
                timeout: 3000
            }).show();
            console.log("Upload failed:", error);
        });
    }

    $scope.deleteImgDoctor = () => {
        document.getElementById('filesDoctorCloudinary').value = "";
        $scope.imageUrlDoctor = null;
    }


    $scope.uploadImgSignatureToTempFolder = (files) => {

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
            $scope.imageUrlSignature = response.data.message;
            $scope.filename = file.name;
            swal.close();
            new Noty({
                text: 'Tải ảnh lên thành công !',
                type: 'success',
                timeout: 3000
            }).show();
        }).catch(function (error) {
            swal.close();
            new Noty({
                text: 'Tải ảnh lên thất bại. Vui lòng thử lại!',
                type: 'error',
                timeout: 3000
            }).show();
            console.log("Upload failed:", error);
        });
    }


    $scope.deleteImgSignature = () => {
        document.getElementById('filesSignatureCloudinary').value = "";
        $scope.imageUrlSignature = null;
    }



    $scope.initializeUIComponents()
    $scope.getListDoctor()
    $scope.crudDoctor()
    $scope.getListDegrees()
    $scope.initData()
})