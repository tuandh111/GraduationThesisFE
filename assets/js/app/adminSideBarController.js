app.controller('AdminSideBarController', function ($scope, $http, $rootScope, $location, $timeout, processSelect2Service, TimezoneService, $route, convertMoneyService, API, adminBreadcrumbService) {
    let url = API.getBaseUrl();
    let headers = API.getHeaders();
    let roleName = API.getUser() ? API.getUser().split("-")[1] : null

    $scope.permissonBaseInRole = () => {
        switch (roleName) {
            case 'QUAN_LY':
                $scope.QUAN_LY = true
                break
            case 'HANH_CHINH':
                $scope.HANH_CHINH = true
                break
            case 'BAC_SI':
                $scope.BAC_SI = true
                break
            case 'KY_THUAT':
                $scope.KY_THUAT = true
                break
            default:
                $scope.QUAN_LY = true
                break
        }
    }
   
    $scope.permissonBaseInRole()

})