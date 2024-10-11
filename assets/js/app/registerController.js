app.controller('RegisterController', function ($scope, $http, $rootScope, $location, $timeout, API, $route, adminBreadcrumbService, processSelect2Service, TimezoneService) {
    let url = API.getBaseUrl();
    let headers = API.getHeaders();
    const defaultTimezone = "Asia/Ho_Chi_Minh";
    adminBreadcrumbService.generateBreadcrumb();
    // code here
    $scope.isInvalidEmail = false;
    $scope.isValidIEmail = false;
    $scope.isExistEmail = false;


    $scope.initAccountForm = () => {
        $scope.formAcc = {
            firstname: '',
            lastname: '',
            email: '',
            phoneNumber: '',
            gender: '',
            birthday: '',
            address: '',
            password: '',
            confirmPassword: ''
        }

        $scope.mailInfo = {
            from: '',
            to: '',
            subject: '',
            body: ''
        }

        $scope.patientAndUserRequest = {
            fullName: '',
            email: '',
            phoneNumber: '',
            gender: '',
            birthday: '',
            address: '',
            password: '',
        }

        $scope.listGenderTypeDB = [
            { genderId: 'MALE', genderName: 'Nam' },
            { genderId: 'FEMALE', genderName: 'Nữ' },
            { genderId: 'UNISEX', genderName: 'Khác' }
        ];

    }

    $scope.validateName = (name) => {
        const namePattern = /^[A-Za-zÀ-ỹ ]+$/;
        let checkName = namePattern.test(name);
        return checkName;
    }

    $scope.validateEmail = () => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let email = $scope.formAcc.email;
        let checkEmail = emailPattern.test(email)
        if (checkEmail) {
            $scope.isValidEmail = true;
            $scope.isInvalidEmail = false;
        } else {
            $scope.isValidEmail = false;
            $scope.isInvalidEmail = true;
        }
        return checkEmail
    }

    $scope.validatePhoneNumber = () => {
        const phoneNumberPattern = /^0\d{9}$/;
        let phone = $scope.formAcc.phoneNumber;
        let checkPhone = phoneNumberPattern.test(phone);
        return checkPhone;
    }

    $scope.checkAge = (dateOfBirth) => {
        if (!dateOfBirth) {
            return false;
        }
        let birthDate = new Date(dateOfBirth);
        let currentDate = new Date();
        return birthDate <= currentDate;
    }

    $scope.validateBirthday = () => {
        return $scope.checkAge($scope.formAcc.birthday);
    }

    $scope.validatePassword = () => {
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@!#$%^&*])[A-Za-z\d@!#$%^&*]{8,}$/;
        let password = $scope.formAcc.password;
        let checkPass = passwordPattern.test(password);
        return checkPass;
    }

    $scope.validateConfirmPassword = () => {
        let password = $scope.formAcc.password;
        let confirmPassword = $scope.formAcc.confirmPassword;

        return password === confirmPassword;
    }

    $scope.validateForm = () => {
        let acc = $scope.formAcc;
        let valid = false;
        let vaidateLastname = $scope.validateName(acc.lastname);
        let vaidateFirstname = $scope.validateName(acc.firstname);
        let validateEmail = $scope.validateEmail();
        let validatePhoneNumber = $scope.validatePhoneNumber();
        let validateBirthday = $scope.validateBirthday();
        let validatePassword = $scope.validatePassword();
        let validateConfirmPassword = $scope.validateConfirmPassword();
        if (acc.lastname == '') {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Vui lòng nhập họ của bạn !",
                icon: "error"
            })
        } else if (!vaidateLastname) {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Họ không đúng định dạng !",
                icon: "error"
            })
        } else if (acc.firstname == '') {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Vui lòng nhập tên của bạn !",
                icon: "error"
            })
        } else if (!vaidateFirstname) {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Tên không đúng định dạng !",
                icon: "error"
            })
        } else if (acc.email == '') {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Vui lòng nhập email !",
                icon: "error"
            })
        } else if (!validateEmail) {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Email nhập không đúng định dạng !",
                icon: "error"
            })
        } else if (acc.phoneNumber == '') {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Vui lòng nhập số điện thoại !",
                icon: "error"
            })
        } else if (!validatePhoneNumber) {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Số điện thoại nhập không đúng định dạng !",
                icon: "error"
            })
        } else if (acc.gender == "" || acc.gender == null) {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Vui lòng chọn giới tính!",
                icon: "error"
            })
        } else if (acc.birthday == "") {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Vui lòng chọn ngày sinh!",
                icon: "error"
            })
        } else if (!validateBirthday) {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Ngày sinh chưa phù hợp !",
                icon: "error"
            })
        } else if (acc.address == '') {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Vui lòng nhập địa chỉ !",
                icon: "error"
            })
        } else if (acc.password == '') {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Vui lòng nhập mật khẩu !",
                icon: "error"
            })
        } else if (!validatePassword) {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Mật khẩu chưa đúng định dạng !",
                icon: "error"
            })
        } else if (acc.confirmPassword == '') {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Vui lòng xác nhận mật khẩu !",
                icon: "error"
            })
        } else if (!validateConfirmPassword) {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Mật khẩu chưa trùng khớp !",
                icon: "error"
            })
        } else {
            valid = true
        }
        return valid
    }

    $scope.getPatientAndUserRequest = () => {
        let acc = $scope.formAcc;

        if (typeof acc.gender === 'string' && acc.gender.includes(':')) {
            acc.gender = acc.gender.split(':')[1];
        }

        $scope.patientAndUserRequest = {
            fullName: acc.lastname + ' ' + acc.firstname,
            email: acc.email,
            phoneNumber: acc.phoneNumber,
            gender: acc.gender,
            birthday: TimezoneService.convertToTimezone(moment(acc.birthday), defaultTimezone),
            address: acc.address,
            password: acc.password,
        }

    }

    $scope.register = () => {

        let checkForm = $scope.validateForm()

        if (checkForm) {

            Swal.fire({
                title: 'Đang đăng ký...',
                text: 'Vui lòng chờ trong giây lát.',
                allowOutsideClick: false,
                didOpen: () => {
                    swal.showLoading();
                }
            });

            $scope.getPatientAndUserRequest();
            $http.post(url + '/patient-user', $scope.patientAndUserRequest).then(response => {
                    Swal.fire({
                        title: "Thành công!",
                        html: "Đăng ký thành công!",
                        icon: "success"
                    }).then(rp => {
                        if (rp.isConfirmed) {
                            window.location.href = "#!login";
                        }
                    })
            }).catch(err => {
                if (err.data.message == 'email already exists') {
                    Swal.fire({
                        title: "Cảnh báo !",
                        html: "Email đã được sử dụng !",
                        icon: "error"
                    })
                } else if (err.data.message == 'ailed to create account') {
                    Swal.fire({
                        title: "Thất bại !",
                        html: "Vui lòng thử lại !",
                        icon: "error"
                    })
                } 
            });
        }
    }

    $scope.innitUI = () => {
        $('.select2').select2(
            {
                theme: 'bootstrap4',
            });

        $('#gender').on('change', function () {
            $timeout(function () {
                $scope.formAcc.gender = $('#gender').val();
                console.log("$scope.formAcc.gender", $scope.formAcc.gender);

            });
        });
    }

    $scope.initAccountForm()
    $scope.innitUI()
})