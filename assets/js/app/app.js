let app = angular.module("dentisHub", ["ngRoute"]);
let BASE_URL = "http://localhost:8080/";
app.config(function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: 'templates/home.html',
        })
        .when("/home", {
            templateUrl: 'templates/home.html',
        })
        .when("/index", {
            templateUrl: 'templates/home.html',
        })
        .when("/login", {
            templateUrl: 'templates/login.html',
        })
        .when("/register", {
            templateUrl: 'templates/register.html',
        })
        .when("/contact", {
            templateUrl: 'templates/contact.html',
        })
        .when("/blog-sidebar", {
            templateUrl: "templates/blog-sidebar.html",
        })
        .when("/confirmation", {
            templateUrl: "templates/confirmation.html",
        })
        .when("/department", {
            templateUrl: "templates/department.html",
        })
        .when("/doctor-single/:id", {
            templateUrl: "templates/doctor-single.html",
        })
        .when("/department-single/:id", {
            templateUrl: "templates/department-single.html",
        })
        .when("/doctor", {
            templateUrl: "templates/doctor.html",
        })
        .when("/documentation", {
            templateUrl: "templates/documentation.html",
        })
        .when("/service", {
            templateUrl: "templates/service.html",
        })
        .when("/service/:id", {
            templateUrl: 'templates/home.html',
        })
        .when("/appoinment", {
            templateUrl: "templates/booking.html",
            data: { title: 'Đặt lịch khám' }
        })
        .when("/booking", {
            templateUrl: "templates/booking.html",
            data: { title: 'Đặt lịch khám' }
        })
        .when("/booking/:id", {
            templateUrl: "templates/booking.html",
            data: { title: 'Đặt lịch khám' }
        })
        .when("/confirmation", {
            templateUrl: "templates/confirmation.html",
        })
        .when("/about", {
            templateUrl: "templates/about.html",
        })
        .when("/profile", {
            templateUrl: "templates/customer-profile.html",
        })
        .when("/my-recorded", {
            templateUrl: "templates/customer-recorded.html",
        })
        .when("/admin", {
            templateUrl: "templates/admin-dashboard.html",
            data: { title: 'Dashboard', requiresAuth: true, roles: ['QUAN_LY'] }
        })
        .when("/admin/dashboard", {
            templateUrl: "templates/admin-dashboard.html",
            data: { title: 'Dashboard', requiresAuth: true, roles: ['QUAN_LY'] }
        })
        .when("/admin/doctor", {
            templateUrl: "templates/admin-doctor.html",
            data: { title: 'Thông tin bác sĩ', requiresAuth: true, roles: ['QUAN_LY'] }
        })
        .when("/admin/doctor-schedule", {
            templateUrl: "templates/admin-doctor-schedule.html",
            data: { title: 'Xếp lịch làm việc', requiresAuth: true, roles: ['QUAN_LY'] }
        })
        .when("/admin/list-appoinment", {
            templateUrl: "templates/admin-list-appoinment.html",
            data: { title: 'Danh sách ca khám', requiresAuth: true, roles: ['QUAN_LY', 'HANH_CHINH'] }
        })
        .when("/admin/list-service", {
            templateUrl: "templates/admin-list-service.html",
            data: { title: 'Dịch vụ nha khoa', requiresAuth: true, roles: ['QUAN_LY', 'HANH_CHINH'] }
        })
        .when("/admin/admin-calendar", {
            templateUrl: "templates/admin-calendar.html",
            data: { title: 'Lên lịch khám', requiresAuth: true, roles: ['QUAN_LY', 'HANH_CHINH'] }
        })
        .when("/admin/shift", {
            templateUrl: "templates/admin-shift.html",
            data: { title: 'Ca làm việc', requiresAuth: true, roles: ['QUAN_LY', 'HANH_CHINH'] }
        })
        .when("/admin/dental-staff", {
            templateUrl: "templates/admin-dental-staff.html",
            data: { title: 'Thông tin nhân viên', requiresAuth: true, roles: ['QUAN_LY'] }
        })
        .when("/admin/patients", {
            templateUrl: "templates/admin-patients.html",
            data: { title: 'Hồ sơ bệnh nhân', requiresAuth: true, roles: ['QUAN_LY', 'HANH_CHINH'] }
        })
        .when("/admin/medicines", {
            templateUrl: "templates/admin-medicines.html",
            data: { title: 'Quản lí thuốc', requiresAuth: true, roles: ['QUAN_LY', 'HANH_CHINH'] }
        })
        .when("/admin/dental-supplies", {
            templateUrl: "templates/admin-list-dental-supplies.html",
            data: { title: 'Vật tư nha khoa', requiresAuth: true, roles: ['QUAN_LY', 'HANH_CHINH'] }
        })
        .when("/admin/save-dental-supplies", {
            templateUrl: "templates/admin-save-dental-supplies.html",
            data: { title: 'Quản lý vật tư nha khoa', requiresAuth: true, roles: ['QUAN_LY', 'HANH_CHINH'] }
        })
        .when("/admin/distribution-supplies", {
            templateUrl: "templates/admin-list-distribution-supplies.html",
            data: { title: 'Nhà phân phối', requiresAuth: true, roles: ['QUAN_LY', 'HANH_CHINH'] }
        })
        .when("/admin/save-distribution-supplies", {
            templateUrl: "templates/admin-save-distribution-supplies.html",
            data: { title: 'Quản lý thông tin nhà phân phối', requiresAuth: true, roles: ['QUAN_LY', 'HANH_CHINH'] }
        })
        .when("/admin/list-invoice", {
            templateUrl: "templates/admin-list-invoice.html",
            data: { title: 'Hóa đơn', requiresAuth: true, roles: ['QUAN_LY', 'HANH_CHINH'] }
        })
        .when("/admin/ct-results", {
            templateUrl: "templates/admin-ct-results.html",
            data: { title: 'Film chụp CT', requiresAuth: true, roles: ['KY_THUAT'] }
        })
        .when("/admin/patient-record", {
            templateUrl: "templates/admin-patient-record.html",
            data: { title: 'Lịch sử điều trị', requiresAuth: true, roles: ['QUAN_LY', 'HANH_CHINH'] }
        })
        .when("/admin/doctor-calendar", {
            templateUrl: "templates/admin-doctor-calendar.html",
            data: { title: 'Lịch làm của tôi', requiresAuth: true, roles: ['BAC_SI'] }
        })
        .when("/admin/create-account", {
            templateUrl: "templates/admin-create-account.html",
            data: { title: 'Tài khoản', requiresAuth: true, roles: ['QUAN_LY','HANH_CHINH']}
        })
        .when("/login", {
            templateUrl: "templates/login.html",
            data: { title: 'Đăng nhập' }
        })
        .when("/register", {
            templateUrl: "templates/register.html",
            data: { title: 'Đăng ký' }
        })
        .when("/forgotPassword", {
            templateUrl: "templates/forgot-password.html",
            data: { title: 'Khôi phục mật khẩu' }
        })
        .when("/admin/my-profile", {
            templateUrl: "templates/admin-my-profile.html",
            data: { title: 'Hồ sơ của tôi', requiresAuth: true, roles: ['QUAN_LY', 'HANH_CHINH', 'BAC_SI', 'KY_THUAT'] }
        })
        .when("/admin/my-setting", {
            templateUrl: "templates/admin-my-setting.html",
            data: { title: 'Cài đặt', requiresAuth: true, roles: ['QUAN_LY', 'HANH_CHINH', 'BAC_SI', 'KY_THUAT'] }
        })
        .when("/admin/post", {
            templateUrl: "templates/admin-post.html",
            data: { title: 'Bài viết', requiresAuth: true, roles: ['QUAN_LY', 'HANH_CHINH'] }
        })
        .when("/admin/transaction-success", {
            templateUrl: "templates/transaction-success.html",
            data: { title: 'Thanh toán thành công', requiresAuth: true, roles: ['QUAN_LY', 'HANH_CHINH'] }
        })
        .when("/not-found", {
            templateUrl: "/component/notFound.html",
            data: { title: 'Lỗi không tìm thấy trang này' }
        })
        .otherwise({
            redirectTo: "templates/home.html"
        })
});

app
    .service('processSelect2Service', function () {
        this.processSelect2Data = (values) => {
            if (!Array.isArray(values)) {
                if (typeof values === 'string') {
                    values = [values];
                } else {
                    values = [];
                }
            }
            var processedValues = values.map(function (value) {
                var numericValue = parseInt(value.replace(/\D/g, ''), 10);
                return isNaN(numericValue) ? null : numericValue;
            }).filter(function (value) {
                return value !== null;
            });
            return processedValues;
        }        
    })
    .service('TimezoneService', function () {
        this.convertToTimezone = function (date, timezone) {
            return moment(date).tz(timezone).format();
        };

        this.convertFromTimezone = function (date, timezone) {
            return moment.tz(date, timezone).toDate();
        };
    })
    .service('API', function () {
        // const baseUrl = 'https://graduationthesis-production.up.railway.app/api/v1/auth';
        const baseUrl = 'http://localhost:8081/api/v1/auth';
        return {
            getBaseUrl: function () {
                return baseUrl;
            },
            getHeaders: function () {
                return {
                    Authorization: "Bearer " + localStorage.getItem("accessToken"),
                    "X-Refresh-Token": localStorage.getItem("refreshToken"),
                };
            },
            getUser: function () {
                return localStorage.getItem("userLogin");
            },
        };
    })
    .service('SocketService', function ($q, $rootScope) {
        let socket;
        let stompClient;
        let isConnected = false;
        const deferred = $q.defer();
        const localStorageKey = 'userLogin'; // Change this if needed

        function connect() {
            // Check if user is logged in
            const userLogin = localStorage.getItem(localStorageKey);
            // if (!userLogin) {
            //     // No user logged in, so no need to connect
            //     return $q.reject('No user logged in');
            // }

            // Check if already connected
            if (isConnected) {
                return deferred.promise;
            }

            // Connect only if not already connected
            socket = new SockJS('http://localhost:8081/ws');
            stompClient = Stomp.over(socket);

            stompClient.connect({}, function (frame) {
                console.log('Connected: ' + frame);
                isConnected = true; // Set connection state to true
                deferred.resolve(stompClient);
                subscribeToChannels(); // Subscribe after connection is established
            }, function (error) {
                console.error('Connection error: ' + error);
                deferred.reject(error);
            });

            return deferred.promise;
        }

        function getStompClient() {
            // Ensure connection is established before returning stompClient
            return connect().then(function () {
                return stompClient;
            });
        }

        function subscribeToChannels() {
            const userLogin = localStorage.getItem(localStorageKey);
            const userType = getUserType(userLogin);
            const emailMine = getUserEmail(userLogin); // Adjust this if needed
            

            if (userType === 'HANH_CHINH') {
                stompClient.subscribe('/chatroom', function (message) { 
                    try {
                        // Try to parse the message body as an integer
                        const appointmentId = parseInt(message.body, 10);
            
                        // If successful, broadcast the new appointment event
                        if (!isNaN(appointmentId)) {
                            $rootScope.$broadcast('gotNewApppointment', message.body);
                            $rootScope.$broadcast('reloadTableAppointment');

                        } else {
                            $rootScope.$broadcast('appointmentBeingCancel', message.body);
                            $rootScope.$broadcast('reloadTableAppointment');
                        }
                    } catch (e) {
                        // If parsing fails, do the other thing (you can customize this)
                        $rootScope.$broadcast('appointmentBeingCancel', message.body);
                    }
                   
                })
                stompClient.subscribe('/appointmentdone', function (message) { 
                    $rootScope.$broadcast('appointmentIsDone', message.body);
                    $rootScope.$broadcast('reloadTableAppointment');
                })
            } else if (userType === 'BENH_NHAN') {
                stompClient.subscribe('/user/' + emailMine + '/private', function (message) {
                    console.log('Private Message: ' + message);
                    $rootScope.$broadcast('yourAppointAccepted', message.body);
                });
            } else if (userType === 'BAC_SI') {
                stompClient.subscribe('/user/' + emailMine + '/private', function (message) {
                    console.log('Private Message: ' + message);
                    $rootScope.$broadcast('newJobForYou', message.body);
                });
            }
        }

        function getUserType(userLogin) {
            // Extract user type from the userLogin string
            const parts = userLogin.split('-');
            return parts[1]; // Returns "LE_TAN" or "BENH_NHAN"
        }

        function getUserEmail(userLogin) {
            // Extract user email from the userLogin string
            const parts = userLogin.split('-');
            return parts[2]; // Returns the email part
        }

        return {
            connect: connect,
            getStompClient: getStompClient
        };
    })
    .service('AuthService', function ($window) {
        this.getUserRole = function () {
            const userLogin = $window.localStorage.getItem('userLogin');
            if (userLogin) {
                const parts = userLogin.split('-');
                return parts[1];
            }
            return null;
        };

        this.isAdmin = function () {
            return this.getUserRole() === 'ADMIN';
        };
    })
    .service('convertMoneyService', function () {
        function convertNumberToWords(number) {
            var units = ['không', 'Một', 'Hai', 'Ba', 'Bốn', 'Năm', 'Sáu', 'Bảy', 'Tám', 'Chín'];
            var tens = ['', 'mười', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];
            var groups = ['', 'ngàn', 'triệu', 'tỷ'];


            function convertGroupOfThreeDigits(num) {
                var result = '';
                var hundred = Math.floor(num / 100);
                var ten = Math.floor((num % 100) / 10);
                var unit = num % 10;

                if (hundred > 0) {
                    result += units[hundred] + ' trăm ';
                }

                if (ten === 1) {
                    result += 'mười ';
                } else if (ten > 1) {
                    result += tens[ten] + ' ';
                }

                if (ten !== 1 && unit > 0) {
                    result += units[unit] + ' ';
                }

                return result.trim();
            }

            if (number === 0) {
                return 'không đồng';
            }

            var words = '';
            var groupIndex = 0;

            while (number > 0) {
                var groupNumber = number % 1000;
                var groupWords = convertGroupOfThreeDigits(groupNumber);

                if (groupWords !== '') {
                    words = groupWords + ' ' + groups[groupIndex] + ' ' + words;
                }

                groupIndex++;
                number = Math.floor(number / 1000);
            }

            return words.trim() + ' đồng';
        }


        this.convertMoneyToWords = function (money) {
            if (isNaN(money) || money < 0 || !Number.isInteger(money)) {
                return 'Số tiền không hợp lệ';
            }


            return convertNumberToWords(money);
        };

    })
    .service('adminBreadcrumbService', function ($location, $route) {
        this.getTitleForUrl = function (url) {
            var route = $route.routes[url];
            return route && route.data && route.data.title || 'Nha Khoa Tooth Teeth';
        };

        this.generateBreadcrumb = function () {
            let currentUrl = $location.url();
            let breadcrumbSec = $(".breadcrumb");
            let pageTitle = this.getTitleForUrl(currentUrl);

            breadcrumbSec.empty();
            breadcrumbSec.append(`<li class="breadcrumb-item"><a href="#"><i class="fe fe-home fe-16"></i> Trang chủ</a></li>`);
            breadcrumbSec.append(`<li class="breadcrumb-item"><a href="#!` + currentUrl + `">` + pageTitle + `</a></li>`);
        };
    });
   
app
    .filter('truncateWordsHTML', function () {
        return function (input, limit) {
            if (!input) return '';

            let words = input.split(' ');
            if (words.length <= limit) {
                return input;
            }
            return words.slice(0, limit).join(' ') + '...';
        };
    })
    .filter('formatPrice', function () {
        return function (input) {
            if (!isNaN(input)) {
                var formattedPrice = input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                return formattedPrice + ' VND';
            } else {
                return input;
            }
        };
    })
    .filter('firstFiveChars', function () {
        return function (input) {
            if (input) {
                return input.substring(0, 5); // Lấy 5 ký tự đầu tiên của input
            }
            return '';
        };
    })
    .filter('dateFormat', function () {
        return function (input) {
            if (!input) return "";
            var date = new Date(input);
            var day = date.getDate();
            var month = date.getMonth() + 1;
            var year = date.getFullYear();
            return (day < 10 ? '0' : '') + day + '/' + (month < 10 ? '0' : '') + month + '/' + year;
        };
    })
    .filter('timeFormat', function () {
        return function (input) {
            if (!input) return "";
            var timeParts = input.split(':');
            if (timeParts.length >= 2) {
                return timeParts[0] + ':' + timeParts[1];
            }
            return input;
        };
    })
    .filter('phoneNumberFormat', function () {
        return function (phoneNumber) {
            if (!phoneNumber) return '';
            phoneNumber = phoneNumber.replace(/\D/g, '');
            return phoneNumber.replace(/(\d{1,3})(\d{3})(\d{3})(\d{3})/, '(+84) $2 $3 $4');
        };
    })
    .filter('currencyVND', function () {
        return function (amount) {
            if (amount !== null && amount !== undefined) {
                return parseInt(amount).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
            }
            return amount;
        };
    })
    .filter('initialCharacter', function() {
        return function(input) {
            if (typeof input !== 'string' || input.length === 0) {
                return '';
            }
            var cleanedInput = input.replace(/[\(\)\-]/g, '');

            return cleanedInput.split(' ').map(function(word) {
                return word.charAt(0).toUpperCase();
            }).join('');
        };
    });

app.directive('loadingIndicator', function ($timeout) {
    return {
        restrict: 'E',
        replace: true,
        //template: '<div class="loading-indicator" ng-show="isLoading">Đang tải...</div>', 
        templateUrl: '/templates/loading-indicator.html',
        controller: function ($scope, $rootScope) {
            $scope.isLoading = false;

            function delay(ms) {
                return $timeout(function () {
                    // Empty callback, or you can do additional tasks here
                }, ms);
            }

            $scope.toggleLoadingIndicator = function () {
                $scope.isLoading = true;
                delay(2000).then(function () {
                    $scope.isLoading = false;
                });
            };

            $rootScope.$on('$routeChangeStart', function () {
                $scope.isLoading = true;
                delay(2000).then(function () {
                    $scope.isLoading = false;
                });
            });

            $scope.$on('getDoctorFilter', function (event, doctorId) {
                $scope.toggleLoadingIndicator();
            });

        }
    };
});

app.directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    $('.time-input').timepicker({
                        'scrollDefault': 'now',
                        'zindex': '9999', /* fix modal open */
                        'timeFormat': 'HH:mm', /* Định dạng 24 giờ */
                        'step': 30 /* Bước nhảy của thời gian */
                    });
                    scope.$emit('ngRepeatFinished');
                });
            }
        }
    };
})

app.run(function ($rootScope, $location, AuthService) {
    $rootScope.$on('$routeChangeStart', function (event, next, current) {
        if (next.data && next.data.requiresAuth) {
            if (next.data.roles && !next.data.roles.includes(AuthService.getUserRole())) {
                $location.path('/not-found');
            }
        }
        var title = next.data && next.data.title;
        document.title = title || 'Nha Khoa Tooth Teeth';
    });
});
