app.controller('LoginController', function ($scope, $http, $rootScope, $location, $timeout, $window, API, $route, adminBreadcrumbService, processSelect2Service) {
    let url = API.getBaseUrl();
    let headers = API.getHeaders();
    adminBreadcrumbService.generateBreadcrumb();
    $scope.isInvalidInput = false;
    $scope.isValidInput = false;
    $scope.isLogin = false;

    // Initialize form data and load cookies
    $scope.initAccountForm = () => {
        $scope.formLogin = {
            email: '',
            password: ''
        };

        // Load cookies if they exist
        let savedEmail = getCookie('email');
        let savedPassword = getCookie('password');
        let rememberMe = getCookie('remember-me');

        if (savedEmail) {
            $scope.formLogin.email = savedEmail;
        }

        if (savedPassword) {
            $scope.formLogin.password = savedPassword;
        }

        // Set checkbox state based on cookie
        if (rememberMe === 'true') {
            document.getElementById('remember-me').checked = true;
        }
    };

    // Validate email format
    $scope.validateEmail = () => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const email = $scope.formLogin.email;
        let checkEmail = emailPattern.test(email);
        $scope.isValidInput = checkEmail;
        $scope.isInvalidInput = !checkEmail;
        return checkEmail;
    };

    // Validate form inputs
    $scope.validateForm = () => {
        let acc = $scope.formLogin;
        let valid = false;
        let validateEmail = $scope.validateEmail();
        if (acc.email === '') {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Vui lòng nhập email!",
                icon: "error"
            });
        } else if (!validateEmail) {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Email nhập không đúng định dạng!",
                icon: "error"
            });
        } else if (acc.password === '') {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Vui lòng tạo mật khẩu!",
                icon: "error"
            });
        } else {
            valid = true;
        }
        return valid;
    };

    // Login function
    $scope.login = () => {
        let checkForm = $scope.validateForm();

        if (checkForm) {
            var AuthenticationRequest = angular.toJson($scope.formLogin);
            $http.post(url + '/authenticate', AuthenticationRequest).then(response => {
                localStorage.setItem('accessToken', response.data.access_token);
                localStorage.setItem('refreshToken', response.data.refresh_token);
                localStorage.setItem('isLogin',true)

                let userString = ""
                if (response.data.user.role.roleName == 'BENH_NHAN') {
                    userString = response.data.user.patient.patientId + '-' + response.data.user.role.roleName + '-' + response.data.user.email;
                } else if (response.data.user.role.roleName == 'BAC_SI') {
                    userString = response.data.user.doctor.doctorId + '-' + response.data.user.role.roleName + '-' + response.data.user.email;
                } else {
                    userString = response.data.user.dentalStaff.dentalStaffId + '-' + response.data.user.role.roleName + '-' + response.data.user.email;
                }
                localStorage.setItem('userLogin', userString);


                if (document.getElementById('remember-me').checked) {
                    document.cookie = `email=${$scope.formLogin.email};path=/;max-age=${60 * 60 * 24 * 30}`; // Cookie hết hạn sau 30 ngày
                    document.cookie = `password=${$scope.formLogin.password};path=/;max-age=${60 * 60 * 24 * 30}`;
                    document.cookie = `remember-me=true;path=/;max-age=${60 * 60 * 24 * 30}`;
                } else {
                    // If not remembered, clear the cookies
                    document.cookie = `email=;path=/;max-age=0`;
                    document.cookie = `password=;path=/;max-age=0`;
                    document.cookie = `remember-me=false;path=/;max-age=0`;
                }

                Swal.fire({
                    title: "Thông báo!",
                    html: "Đăng nhập thành công!",
                    icon: "success",
                }).then((rs) => {
                    if (rs.isConfirmed) {
                        if (response.data.user.role.roleName != "BENH_NHAN") {              
                            if(response.data.user.role.roleName=='BAC_SI'){
                                $location.path('/admin/doctor-calendar');   
                            }else if(response.data.user.role.roleName=='HANH_CHINH'){
                                $location.path('/admin/admin-calendar');  
                            }else if(response.data.user.role.roleName=='KY_THUAT'){
                                $location.path('/admin/ct-results')
                            }else{
                                $location.path('/admin')
                            }
                        } else {
                            $location.path('/')
                        }  
                        $scope.$apply()
                        window.location.reload()
                    }
                })                             
            }).catch(error => {
                if(error.status == 410) {
                    Swal.fire({
                        title: "Lỗi!",
                        html: "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ với nha khoa !",
                        icon: "error"
                    });
                } else {
                    Swal.fire({
                        title: "Lỗi!",
                        html: "Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin và thử lại !",
                        icon: "error"
                    });
                }         
            });
        }
    };

    function getCookie(name) {
        let value = `; ${document.cookie}`;
        let parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }
    function checkCookie(name) {
        return new Promise((resolve) => {
            const nameEQ = name + "=";
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                let cookie = cookies[i];
                while (cookie.charAt(0) === ' ') cookie = cookie.substring(1);
                if (cookie.indexOf(nameEQ) === 0) {
                    resolve(true);
                    return;
                }
            }
            resolve(false);
        });
    }
    function deleteCookie(name) {
        return new Promise((resolve) => {
            document.cookie = name + '=; Max-Age=-99999999;';
            resolve();
        });
    }
    function setCookie(name, value, days) {
        return new Promise((resolve) => {
            let expires = "";
            if (days) {
                const date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "expires=" + date.toUTCString();
            }
            document.cookie = name + "=" + (value || "") + "; " + expires + "; path=/";
            resolve();
        });
    }
    $scope.loginWithGoogle = async function () {
        console.log('Logging in with Google');
        const cookieExists = await checkCookie("loginSource");
        if (cookieExists) {
            await deleteCookie("loginSource");
        }
        await setCookie("loginSource", "google", 1);
        console.log('Cookie after setting:', document.cookie);
        let googleAuthUrl = 'https://accounts.google.com/o/oauth2/auth?scope=profile email&redirect_uri=http://localhost:5501/index.html&response_type=code&client_id=696627188228-lppdd724j8bftrq7pi0pj6eefjqh8erl.apps.googleusercontent.com&approval_prompt=force';
        $window.location.href = googleAuthUrl;
    };

    
    // Initialize form on load
    $scope.initAccountForm();
});
