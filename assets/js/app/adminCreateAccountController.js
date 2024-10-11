app.controller('AdminCreateAccountController', function ($scope, $http, $rootScope, $location, $timeout, API, $route, adminBreadcrumbService, processSelect2Service) {
    let url = API.getBaseUrl();
    let headers = API.getHeaders();
    adminBreadcrumbService.generateBreadcrumb()
    let roleNameLogin = API.getUser() ? API.getUser().split("-")[1] : null
    if (roleNameLogin == 'HANH_CHINH') {
        $scope.HANH_CHINH = true
    }
    // code here
    $scope.dataObject = []
    $scope.selectedOption = ''
    $scope.isInvalidInput = false;
    $scope.isValidInput = false;
    $scope.isLoadingBtn = false

    $scope.initAccountForm = () => {
        $scope.accForm = {
            email: '',
            password: '',
            roleId: '',
            dentalStaffId: '',
            patientId: '',
            doctorId: '',
            firstname: 'Tài khoản tạo từ admin',
            lastname: 'Tài khoản tạo từ admin'
        }

        $scope.mailInfo = {
            from: '',
            to: '',
            subject: '',
            body: ''
        }

        $scope.validParam = {
            doctorId: null,
            patientId: null,
            doctorId: null,
        }
    }

    $scope.getRoleOption = async (option) => {
        $scope.accForm.roleId = option.roleId
        let op = option.roleName
        switch (op) {
            case 'BENH_NHAN':
                await $http.get(url + '/patient-except-deleted', { headers: headers }).then(response => {
                    $scope.dataObject = response.data
                    $scope.selectedOption = 'BENH_NHAN'
                })

                break
            case 'BAC_SI':
                await $http.get(url + '/doctor-except-deleted', { headers: headers }).then(response => {
                    $scope.dataObject = response.data
                    $scope.selectedOption = 'BAC_SI'
                })

                break
            case 'NHAN_VIEN':
            case 'HANH_CHINH':
            case 'KY_THUAT':
            case 'ADMIN':
            case 'LE_TAN':
            case 'QUAN_LY':
                await $http.get(url + '/dental-staff-except-deleted', { headers: headers }).then(response => {
                    $scope.dataObject = response.data
                    $scope.selectedOption = 'HANH_CHINH'
                })
                break
            default:
                $scope.selectedOption = ''
                console.log("ID tùy chọn không hợp lệ:", op);
                break
        }
        $scope.initializeUIComponents(option)
    }

    $scope.initializeUIComponents = (option) => {
        let op = option.roleName
        if (op === 'ADMIN' || op === 'LE_TAN' || op === 'QUAN_LY' || op === 'KY_THUAT' || op === 'NHAN_VIEN') {
            op = 'HANH_CHINH'
        }

        $('.select2').select2(
            {
                theme: 'bootstrap4',
                placeholder: 'Select an option',
                allowClear: true
            });

        $('#selectedOption' + op).on('change', function () {
            $timeout(function () {
                let selectedVal = $('#selectedOption' + op).val()
                let processedValue = processSelect2Service.processSelect2Data(selectedVal)[0];
                $scope.validParam = {
                    doctorId: null,
                    patientId: null,
                    doctorId: null,
                    isDeleted: false
                }
                function updateAndCheckUser(paramName, value) {
                    $scope.accForm[paramName] = value;
                    $scope.validParam[paramName] = value;
                    $scope.checkUserByAnObject($scope.validParam);
                }
                switch (op) {
                    case 'BENH_NHAN':
                        updateAndCheckUser('patientId', processedValue);
                        break;
                    case 'BAC_SI':
                        updateAndCheckUser('doctorId', processedValue);
                        break;
                    default:
                        updateAndCheckUser('dentalStaffId', processedValue);
                        break;
                }

            });
        });
    }

    $scope.getRole = () => {
        $http.get(url + '/role-except-deleted', { headers: headers }).then(response => {
            $scope.listRoleDB = response.data
            if (roleNameLogin == 'HANH_CHINH') {
                let data = response.data.find(role => role.roleName == 'BENH_NHAN')
                $scope.listRoleDB = [data]
            }
            console.log(" $scope.listRoleDB", $scope.listRoleDB);
        })
    }

    $scope.checkUserByAnObject = (param) => {
        $http.get(url + '/check-exist-user-by-object', { params: param, headers: headers }).then(response => {
            $scope.isExistUser = response.data.message
        })
    }

    $scope.checkExistEmail = (email) => {
        let p = {
            email: email
        }
        $http.get(url + '/check-exist-email', { params: p, headers: headers }).then(response => {
            $scope.isExistEmail = response.data.message
        })
    }

    $scope.generatePassword = ($event) => {
        $event.preventDefault();
        $scope.accForm.password = "";

        var upperChars = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "M", "N", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
        var lowerChars = ["a", "b", "c", "d", "e", "f", "g", "h", "j", "k", "m", "n", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
        var numbers = ["2", "3", "4", "5", "6", "7", "8", "9"];
        var symbols = ["!", "#", "$", "%", "&", "*", "+", "-", "?", "@"];
        var similars_lower = ["i", "l", "o"];
        var similars_upper = ["I", "L", "O"];
        var similars_numbers = ["1", "0"];
        var similars_symbols = ["|"];
        //  var ambiguous = ["\"", "'", "(", ")", ",", ".", "/", ":", ";", "<", "=", ">", "[", "\\", "]", "^", "_", "`", "{", "}", "~"];
        var passwordLength = 8

        var combinedArray = upperChars.concat(
            lowerChars,
            numbers,
            symbols,
            similars_lower,
            similars_upper,
            similars_numbers,
            similars_symbols
            // ,ambiguous
        );

        var randomIndex;
        if (combinedArray.length > 1) {
            for (var i = 0; i < passwordLength; i++) {
                randomIndex = Math.floor(Math.random() * combinedArray.length);
                $scope.accForm.password = $scope.accForm.password + combinedArray[randomIndex];
            }
        }
        const passwordEl = document.getElementById('user-password')
        passwordEl.classList.add('input-success');
    }

    $scope.validateEmail = () => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const email = $scope.accForm.email;
        let checkEmail = emailPattern.test(email)
        if (checkEmail) {
            $scope.isValidInput = true;
            $scope.isInvalidInput = false;
        } else {
            $scope.isValidInput = false;
            $scope.isInvalidInput = true;
        }
        return checkEmail
    }

    $scope.validateOnFocus = () => {
        $scope.isInvalidInput = false;
        $scope.isValidInput = false;
    }

    $scope.validateOnBlur = () => {
        $scope.validateEmail();
        $scope.checkExistEmail($scope.accForm.email)
    }

    $scope.validateForm = () => {
        let acc = $scope.accForm
        let valid = false
        let validateEmail = $scope.validateEmail()
        if (acc.dentalStaffId == '' && acc.doctorId == '' && acc.patientId == '') {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Vui lòng chọn thông tin người dùng!",
                icon: "error"
            })
        } else if (acc.email == '') {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Vui lòng nhập email!",
                icon: "error"
            })
        } else if (!validateEmail) {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Email nhập không đúng định dạng!",
                icon: "error"
            })
        } else if (acc.password == '') {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Vui lòng tạo mật khẩu!",
                icon: "error"
            })
        } else {
            valid = true
        }
        return valid
    }

    $scope.createAccount = () => {

        // const passwordEl = document.getElementById('user-password')
        // passwordEl.classList.add('input-error');
        const generatePasswordEl = document.getElementById('generatePassword')
        generatePasswordEl.click();
        $scope.isLoadingBtn = true
        let checkForm = $scope.validateForm()
        if (checkForm) {
            $scope.mailInfo = {
                from: 'trung2894@gmail.com',
                to: $scope.accForm.email,
                subject: 'Thông báo tạo tài khoản',
                body: '<p>Chúc mừng bạn đã tạo tại khoản thành công tại nha khoa Tooth Teeth.</p> <p>Mật khẩu của bạn là: ' + '<bold>' + $scope.accForm.password + '</bold>' + '</p>'
            }

            let accRequest = $http.post(url + '/register', angular.toJson($scope.accForm), { headers: headers })
            let emailRequest = $http.post(url + '/send-account-info', angular.toJson($scope.mailInfo), { headers: headers })
            Promise.all([accRequest, emailRequest]).then(() => {
                $timeout(() => {
                    $scope.isLoadingBtn = false
                }, 3000)
            }).then(() => {
                $timeout(() => {
                    new Noty({
                        text: 'Tạo tài khoản thành công thành công!',
                        type: 'success',
                        timeout: 3000
                    }).show()

                    $scope.initAccountForm()
                    const passwordEl = document.getElementById('user-password')
                    passwordEl.classList.remove('input-success');
                    passwordEl.classList.remove('input-error');
                    const emaildEl = document.getElementById('user-email')
                    emaildEl.classList.remove('input-success');
                    $scope.$apply()

                }, 3000)
            })
        }
    }

    // for list account

    $scope.getAllAccount = () => {
        $http.get(url + "", { headers: headers }).then(response => {
            $scope.listAccountDB = response.data.map(acc => {
                if (acc.activity === undefined || acc.activity === null) {
                    acc.activity = !acc.deleted
                }
                return acc
            })
            if ($.fn.DataTable.isDataTable('#dataTable-list-account')) {
                $('#dataTable-list-account').DataTable().clear().destroy();
            }
            $(document).ready(function () {
                $('#dataTable-list-account').DataTable({
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
        })
    }

    $scope.getAccountName = (account) => {
        let roleName = account.role.roleName
        switch (roleName) {
            case 'BENH_NHAN':
                return account.patient ? account.patient.fullName : null
            case 'BAC_SI':
                return account.doctor ? account.doctor.fullName : null
            case 'NHAN_VIEN':
            case 'HANH_CHINH':
            case 'KY_THUAT':
            case 'ADMIN':
            case 'LE_TAN':
            case 'QUAN_LY':
                return account.dentalStaff ? account.dentalStaff.fullname : null
            default:
                return null
        }

    }

    $scope.isCheckboxChecked = (account) => {
        return !account.deleted;
    };

    $scope.disabledAccount = async (account) => {
        let userRequest = {
            email: account.email,
            deleted: !account.activity
        };

        try {
            const result = await Swal.fire({
                text: "Bạn có " + (account.activity ? "kích hoạt " : "hủy ") + "tài khoản " + account.email + " ?",
                icon: (account.activity ? "info" : "warning"),
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                cancelButtonText: 'Trở lại',
                confirmButtonText: 'Có'
            });

            if (result.isConfirmed) {
                await $http.post(url + "/disabled-user", angular.toJson(userRequest), { headers: headers });
                await new Noty({
                    text: (account.activity ? "Kích hoạt " : "Hủy ") + "tài khoản thành công!",
                    type: 'success',
                    timeout: 3000
                }).show();

            } else {
                $scope.getAllAccount();
                new Noty({
                    text: "Hành động đã hủy.",
                    type: 'info',
                    timeout: 3000
                }).show();
            }
        } catch (error) {
            console.error(error);
            await Swal.fire({
                title: 'Lỗi!',
                text: 'Đã có lỗi xảy ra, vui lòng thử lại.',
                icon: 'error'
            });
        }
    };


    $scope.getRole()
    $scope.initAccountForm()
    $scope.getAllAccount()
})