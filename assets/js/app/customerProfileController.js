app.controller('CustomerProfileController', function ($scope, $http, $rootScope, $location, $timeout, $window, API, $route, adminBreadcrumbService, processSelect2Service, TimezoneService) {
    let url = API.getBaseUrl();
    let headers = API.getHeaders();
    let email = API.getUser().split("-")[2]
    $scope.account = null
    const defaultTimezone = "Asia/Ho_Chi_Minh"
    $scope.initData = () => {
        $scope.filenames = []
        $scope.isShowCurrentPassword = false
        $scope.isShowNewPassword = false
        $scope.isShowConfirmPassword = false
        $scope.isPatternPassword = false
        $scope.isFocusNewPassword = false
        $scope.isFocusCurrentPassword = false
        $scope.isFocusConfirmPassword = false
        $scope.isSamePreviousPasswordNewInput = false
        $scope.isSamePreviousPasswordCurrentInput = false
        $scope.isMatchNewPassword = false
        $scope.isLoadingChangePassword = false
        $scope.isLoadingUpdateInfo = false
        $scope.formPatient = {
            imageURL: "",
            patientId: parseInt(API.getUser().split("-")[0]),
            fullName: "",
            phoneNumber: "",
            gender: "",
            address: "",
            birthday: "",
            deleted: "",
            citizenIdentificationNumber: ""
        }

        $scope.formChangePassword = {
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        }

        $scope.listGenderTypeDB = [
            { genderId: 'MALE', genderName: 'Nam' },
            { genderId: 'FEMALE', genderName: 'Nữ' },
            { genderId: 'UNISEX', genderName: 'Khác' }
        ];

        $scope.initializeUIComponents()
    }

    $scope.initializeUIComponents = () => {
        $('.select2').select2(
            {
                theme: 'bootstrap4',
            });
        $('.drgpicker').daterangepicker(
            {
                singleDatePicker: true,
                timePicker: false,
                showDropdowns: true,
                maxDate: moment().format('DD/MM/YYYY'),
                locale:
                {
                    format: 'DD/MM/YYYY',
                    applyLabel: 'Áp dụng',
                    cancelLabel: 'Hủy',
                },
            });

        $('.drgpicker').on('apply.daterangepicker', function (ev, picker) {
            let selectedDate = picker.startDate.format('DD/MM/YYYY');
            $scope.formPatient.birthday = selectedDate
        });

        $('#customerGender').on('change', function () {
            $timeout(function () {
                let selectedVals = $('#customerGender').val();
                $scope.formPatient.gender = selectedVals.split(":")[1]
            });
        });
    }

    $scope.getAccount = (email) => {
        let param = {
            email: email
        }
        $http.get(url + "/get-user-by-email", { params: param }).then(response => {
            $scope.account = response.data
            let patient = $scope.account.patient
            if (patient == null) return
            console.log(" response.data", response.data);

            $scope.formPatient = {
                patientId: patient.patientId,
                fullName: patient.fullName,
                citizenIdentificationNumber: patient.citizenIdentificationNumber,
                phoneNumber: patient.phoneNumber,
                gender: patient.gender,
                imageURL: patient.imageURL,
                birthday: moment(patient.birthday).format('DD/MM/YYYY'),
                deleted: patient.deleted,
                address: patient.address
            }
        })
    }

    $scope.urlImgDisplay = () => {
        if ($scope.imageUrlPatient != null) return $scope.imageUrlPatient
        let acc = $scope.account
        if (acc == null) return
        let filename = acc.patient.imageURL
        return filename
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
            $scope.imageUrlPatient = response.data.message;
            setTimeout(() => {
                swal.close();
            }, 1500);          
            new Noty({
                text: 'Tải ảnh lên thành công !',
                type: 'success',
                timeout: 3000
            }).show();
        }).catch(function (error) {
            new Noty({
                text: 'Tải ảnh lên thất bại. Vui lòng thử lại!',
                type: 'error',
                timeout: 3000
            }).show();
            console.log("Upload failed:", error);
        });
    }

    $scope.deleteImg = () => {
        document.getElementById('customerProfileImage').value = "";
        $scope.imageUrlPatient = null;
    }

    $scope.validationForm = () => {
        var valid = false;

        if ($scope.formPatient.fullName == "" || $scope.formPatient.fullName == null) {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Vui lòng nhập họ tên!",
                icon: "error"
            });
        } else if ($scope.formPatient.phoneNumber == "") {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Vui lòng nhập số điện thoại!",
                icon: "error"
            });
        } else if ($scope.formPatient.gender == "" || $scope.formPatient.gender == null) {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Vui lòng chọn giới tính!",
                icon: "error"
            });
        } else {
            valid = true;
        }
        return valid;
    }

    $scope.updateCustomer = () => {
        if ($scope.account.patient == null) return
        if ($scope.imageUrlPatient == null) {
            $scope.formPatient.imageURL = $scope.account.patient.imageURL
        } else {
            $scope.formPatient.imageURL = $scope.imageUrlPatient
        }
        $scope.formPatient.birthday = TimezoneService.convertToTimezone(moment(new Date($scope.formPatient.birthday)), defaultTimezone)
        let requsetCustomerJSON = angular.toJson($scope.formPatient)
        let patientId = $scope.formPatient.patientId
        var valid = $scope.validationForm()
        if (valid) {
            $scope.isLoadingUpdateInfo = true
            $http.put(url + '/patient/' + patientId, requsetCustomerJSON).then(respone => {
                $timeout(() => {
                    new Noty({
                        text: 'Cập nhật thông tin thành công !',
                        type: 'success',
                        timeout: 3000
                    }).show()
                    $scope.formPatient.birthday = moment(new Date($scope.formPatient.birthday)).format('DD/MM/YYYY')
                    $scope.urlImgDisplay()
                    $scope.filenames = []
                    $scope.$apply()
                }, 3000)
            }).finally(() => {
                $timeout(() => {
                    $scope.isLoadingUpdateInfo = false
                }, 3000)
            })
        }
    }

    $scope.togglePassword = (field) => {
        if (field === 'current') {
            $scope.isShowCurrentPassword = !$scope.isShowCurrentPassword;
            var input = document.getElementById('currentPassword');
            input.type = $scope.isShowCurrentPassword ? 'text' : 'password';
        } else if (field === 'new') {
            $scope.isShowNewPassword = !$scope.isShowNewPassword;
            var input = document.getElementById('newPassword');
            input.type = $scope.isShowNewPassword ? 'text' : 'password';
        } else if (field === 'confirm') {
            $scope.isShowConfirmPassword = !$scope.isShowConfirmPassword;
            var input = document.getElementById('confirmPassword');
            input.type = $scope.isShowConfirmPassword ? 'text' : 'password';
        }
    }

    $scope.checkNewPasswordInput = (password) => {
        if (password == undefined) {
            $scope.isFocusNewPassword = false
            return
        }
        $scope.isFocusNewPassword = true
        const passwordPattern = /^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?\/|`~-]{8,250}$/;
        $scope.isPatternPassword = passwordPattern.test(password);
        $scope.checkSamePreviousPassword(password, "New")

        if ($scope.formChangePassword.confirmPassword != "") {
            $scope.checkConfirmPasswordInput($scope.formChangePassword.confirmPassword)
        }
    }

    $scope.checkCurrentPasswordInput = (inpPassword) => {
        if (inpPassword == undefined) {
            $scope.isFocusCurrentPassword = false
            return
        }
        $scope.isFocusCurrentPassword = true
        $scope.checkSamePreviousPassword(inpPassword, "Current")
    }

    $scope.checkSamePreviousPassword = (inpPassword, field) => {
        if (inpPassword == undefined) return
        let passwordMap = {
            newPassword: inpPassword,
            currentPassword: $scope.account.password
        }
        let dataJson = angular.toJson(passwordMap)
        $http.post(url + '/valid-password', dataJson, { headers: headers }).then(response => {
            if (field === 'Current') {
                $scope.isSamePreviousPasswordCurrentInput = response.data
            } else if (field === 'New') {
                $scope.isSamePreviousPasswordNewInput = response.data
            }
        })

    }

    $scope.checkConfirmPasswordInput = (inpPassword) => {
        if (inpPassword == undefined) {
            $scope.isFocusConfirmPassword = false
            return
        }
        $scope.isFocusConfirmPassword = true
        $scope.isMatchNewPassword = $scope.formChangePassword.newPassword === inpPassword;
    }

    $scope.validFormPassword = () => {
        let validCurrentPassword = !$scope.isSamePreviousPasswordCurrentInput
        let validNewPassword = !$scope.isPatternPassword && $scope.isSamePreviousPasswordNewInput
        let validConfirmPassword = !$scope.isMatchNewPassword
        let inValid = validCurrentPassword || validNewPassword || validConfirmPassword
        return !inValid
    }

    $scope.changePassword = () => {
        let valid = $scope.validFormPassword()
        if (!valid) return

        let updatePasswordRequest = {
            email: email,
            password: $scope.formChangePassword.newPassword
        }

        let mailInfo = {
            from: 'trung2894@gmail.com',
            to: email,
            subject: 'Thống báo đổi mật khẩu',
            body: '<p>Chúc mừng bạn đã đổi mật khẩu thành công.</p> <p>Mật khẩu của bạn là: ' + '<bold>' + $scope.formChangePassword.newPassword + '</bold>' + '</p>'
        }
        $scope.isLoadingChangePassword = true
        let updateRequest = $http.post(url + '/update-password', updatePasswordRequest)
        let emailRequest = $http.post(url + '/send-account-info', mailInfo)
        Promise.all([updateRequest, emailRequest]).then(() => {
            $scope.isLoadingChangePassword = false
            $scope.$apply()
        }).finally(() => {
            Swal.fire({
                title: "Thành công!",
                text: "Thay đổi mật khẩu thành công. Bạn có muốn đăng nhập lại?",
                icon: "success",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Đồng ý",
                cancelButtonText: "Ở lại",
            }).then((result) => {
                if (result.isConfirmed) {
                    $location.path('/login');
                    $scope.$apply();
                } else {
                    $scope.formChangePassword = {
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: ""
                    };
                    $scope.$apply();
                }
            });
        })
    }

    $scope.initData()
    $scope.getAccount(email)
});
