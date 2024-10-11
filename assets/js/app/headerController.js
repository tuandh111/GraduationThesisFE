app.controller('HeaderController', function ($scope, $http, $rootScope, SocketService, $location, $timeout, $window, API, $route, adminBreadcrumbService, processSelect2Service) {
    let url = API.getBaseUrl();
    let headers = API.getHeaders();
    $scope.isLogin = localStorage.getItem("isLogin") ? localStorage.getItem("isLogin") : false;
    $scope.isPatient = API.getUser() ? API.getUser().split("-")[1] == 'BENH_NHAN' : null
  
    SocketService.getStompClient().then(function (stompClient) {
        // stompClient is ready and subscriptions are set
    }).catch(function (error) {
        // console.error('Connection error in controller: ' + error);
    });

    $scope.getRoute = () => {
        let role = API.getUser() ? API.getUser().split("-")[1] : null
        switch (role) {
            case 'QUAN_LY':
                return '#!admin'
            case 'HANH_CHINH':
                return '#!admin/admin-calendar'
            case 'KY_THUAT':
                return '#!admin/ct-results'
            case 'BAC_SI':
                return '#!admin/doctor-calendar'
            default:
                return '#!home'
        }
    }

    $scope.logout = () => {
        $http.post(url + '/logout', {}, { headers: headers })
            .then(function (response) {
                localStorage.removeItem("isLogin");
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("userLogin");
                $location.path('/login');
                $scope.isLogin = false;
            })
            .catch(function (error) {
                console.error("Logout failed", error);
            });
    }

    function createAndShowToast(id) {
        // Tạo container cho toast nếu chưa tồn tại
        let toastContainer = document.querySelector('.notify-toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'notify-toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }

        // Kiểm tra xem đã có toast với ID này chưa
        let existingToast = document.querySelector(`.notify-toast[data-toast-id="${id}"]`);
        if (existingToast) {
            return; // Nếu đã có, không tạo mới
        }

        // Tạo toast mới
        const toast = document.createElement('div');
        toast.className = 'notify-toast';
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        toast.setAttribute('data-toast-id', id); // Gán ID cho toast để dễ quản lý
        toast.style.cursor = 'pointer';

        // Tạo header cho toast
        const toastHeader = document.createElement('div');
        toastHeader.className = 'notify-toast-header d-flex align-items-center justify-content-between';
        toastHeader.style.backgroundColor = '#0096FF';

        // Tạo tiêu đề
        const strong = document.createElement('strong');
        strong.className = 'me-auto';
        strong.innerText = ' Cập nhật lịch khám';
        strong.style.color = '#fff';

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn-close';
        button.setAttribute('data-bs-dismiss', 'toast');
        button.setAttribute('aria-label', 'Close');

        button.onclick = () => {
            if (toast) {
                toastBootstrap.dispose(); // Loại bỏ Bootstrap toast instance
                toast.remove(); // Xóa phần tử khỏi DOM
            }
        };

        // Gắn các phần tử vào header
        toastHeader.appendChild(strong);
        toastHeader.appendChild(button);

        // Tạo body cho toast
        const toastBody = document.createElement('div');
        toastBody.className = 'notify-toast-body';
        toastBody.innerText = id;

        // event listener


        // Gắn header và body vào toast
        toast.appendChild(toastHeader);
        toast.appendChild(toastBody);

        // Gắn toast vào container
        toastContainer.appendChild(toast);

        // Hiển thị toast với thời gian delay 3 phút
        const toastBootstrap = new bootstrap.Toast(toast, {
            delay: 180000, // 3 phút
            autohide: true
        });
        toastBootstrap.show();

        // Tự động xóa toast sau 3 phút (180000 milliseconds = 3 minutes)
        setTimeout(() => {
            if (toast) {
                toastBootstrap.dispose(); // Loại bỏ Bootstrap toast instance
                toast.remove(); // Xóa phần tử khỏi DOM
            }
        }, 180000);

        // Thêm event listener để chuyển hướng khi toast được nhấp
        toast.addEventListener('click', () => {
            // Remove the Bootstrap toast instance and the toast element from the DOM
            toastBootstrap.dispose(); // Remove Bootstrap toast instance
            toast.remove(); // Remove element from DOM

        });


    }

    $rootScope.$on('yourAppointAccepted', function (event, message) {
        createAndShowToast(message)

    });
});
