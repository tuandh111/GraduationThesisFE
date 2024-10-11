app.controller('ForgotPasswordController', function ($scope, $http, $rootScope, $location, $timeout, $window, API, $route, adminBreadcrumbService, processSelect2Service) {
    let url = API.getBaseUrl();
    let headers = API.getHeaders();
    adminBreadcrumbService.generateBreadcrumb();


    $scope.initForm = function () {
        $scope.formForgotPassword = {
            email: '',
            code: '',
            newPassword: '',
            confirmPassword: ''
        }

        $scope.isInvalidInput = false;
        $scope.isValidInput = false;
        $scope.codeSent = false;
    }

    $scope.formForgotPassword = {
        email: '',
        code: '',
        password: '',
        confirmPassword: ''
    }

    $scope.validateEmail = (email) => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let checkEmail = emailPattern.test(email);
        $scope.isValidInput = checkEmail;
        $scope.isInvalidInput = !checkEmail;
        return checkEmail;
    };

    $scope.validatePassword = (password) => {
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@!#$%^&*])[A-Za-z\d@!#$%^&*]{8,}$/;
        let checkPass = passwordPattern.test(password);
        return checkPass;
    }

    $scope.validateConfirmPassword = (newPassword, confirmPassword) => {
        return newPassword === confirmPassword;
    }

    $scope.validateFormPassword = () => {
        let valid = false;
        let newPassword = $scope.formForgotPassword.newPassword;
        let confirmPassword = $scope.formForgotPassword.confirmPassword;
        let validatePassword = $scope.validatePassword(newPassword);
        let validateConfirmPassword = $scope.validateConfirmPassword(newPassword, confirmPassword);

        if (!validatePassword) {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Mật khẩu nhập không đúng định dạng !",
                icon: "error"
            })
        } else if (!validateConfirmPassword) {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Mật khẩu chưa trùng khớp !",
                icon: "error"
            })
        } else {
            valid = true;
        }
        return valid;
    }

    $scope.requestPasswordReset = function () {
        let email = $scope.formForgotPassword.email;
        let vaidateEmail = $scope.validateEmail(email);
        if (vaidateEmail) {
            Swal.fire({
                title: 'Đang gửi mã xác thực...',
                text: 'Vui lòng chờ trong giây lát.',
                allowOutsideClick: false,
                didOpen: () => {
                    swal.showLoading();
                }
            });
            $http.post(url + '/send-code?email=' + email).then(response => {
                if (response.data.message == "null") {
                    Swal.fire({
                        title: "Thất bại!",
                        html: "Email không tồn tại !",
                        icon: "error"
                    })
                } else {
                    Swal.fire({
                        position: "top-end",
                        icon: "success",
                        title: "Mã xác thực đã được gửi đến email của bạn!",
                        showConfirmButton: false,
                        timer: 1500
                    });
                    $scope.codeSent = true;
                }
            })
        } else {
            Swal.fire({
                title: "Thất bại!",
                html: "Email sai định dạng !",
                icon: "error"
            })
        }
    };

    $scope.resetPassword = function () {
        let validateFormPassword = $scope.validateFormPassword();

        if (validateFormPassword) {
            let email = $scope.formForgotPassword.email;
            let code = $scope.formForgotPassword.code;
            $http.post(url + '/verify-code', { email: email, code: code }).then(response => {
                if (response.data.message != "fail") {
                    let updatePasswordRequest = {
                        email: email,
                        password: $scope.formForgotPassword.newPassword
                    }
                    $http.post(url + '/update-password', updatePasswordRequest).then(response => {
                        Swal.fire({
                            title: "Thành công!",
                            html: "Cập nhật thành công!",
                            icon: "success"
                        })
                    }).finally(() => {
                        $window.location.href = "#!login" ;
                    })
                } else {
                    Swal.fire({
                        title: "Thất bại!",
                        html: "Mã xác thực sai vui lòng thử lại!",
                        icon: "error"
                    })
                }
            });
        }
    };

    $scope.initForm();

});
