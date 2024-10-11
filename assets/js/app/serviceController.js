app.controller('ServiceController', function ($scope, $http, $rootScope, $location, $timeout, API, $q, $filter) {
    let url = API.getBaseUrl();
    let headers = API.getHeaders();

    $scope.listServiceDB = [];
    $scope.filteredServices = [];
    $scope.searchQuery = ""; // Search input model
    $scope.currentPage = 1;
    $scope.pageSize = 6; // Number of items per page

    $scope.getListService = function () {
        $http.get(url + '/service-except-deleted', { headers: headers }).then(response => {
            $scope.listServiceDB = response.data;
            $scope.updateFilteredServices();
            console.log('API getListService response:', response.data); 
        });
    }
    $scope.serviceChoose = function(serviceId) {
        if(serviceId) {
            console.log(serviceId);
        
            // Lưu ID vào localStorage
            localStorage.setItem('selectedServiceId', serviceId);
        
            // Chuyển trang đến /service/{serviceId} mà không tải lại trang
            $location.path('/service/' + serviceId);
        }
    };
    
    $scope.updateFilteredServices = function() {
        let filteredList = $scope.listServiceDB.filter(function(service) {
            // Kiểm tra nếu searchQuery khớp với serviceName hoặc price
            let searchQueryLower = $scope.searchQuery.toLowerCase();
            return service.serviceName.toLowerCase().includes(searchQueryLower) ||
                   service.price.toString().includes($scope.searchQuery);
        });
    
        // Cập nhật tổng số trang
        $scope.totalPages = Math.ceil(filteredList.length / $scope.pageSize);
    
        // Phân trang kết quả tìm kiếm
        let start = ($scope.currentPage - 1) * $scope.pageSize;
        let end = start + $scope.pageSize;
        $scope.filteredServices = filteredList.slice(start, end);
        console.log($scope.filteredServices);
        
    };

    $scope.setPage = function(page, event) {
        if (page >= 1 && page <= $scope.totalPages) {
            $scope.currentPage = page;
            $scope.updateFilteredServices();
        }
        if (event) {
            event.preventDefault(); // Prevent default link behavior
        }
    };

    $scope.prevPage = function(event) {
        if ($scope.currentPage > 1) {
            $scope.setPage($scope.currentPage - 1, event);
        }
    };

    $scope.nextPage = function(event) {
        if ($scope.currentPage < $scope.totalPages) {
            $scope.setPage($scope.currentPage + 1, event);
        }
    };

    $scope.getListService();
});
