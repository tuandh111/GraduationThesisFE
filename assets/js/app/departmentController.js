app.controller('DepartmentController', function ($scope, $http, $rootScope, $location, $timeout, API, $q, $filter) {
    let url = API.getBaseUrl();
    let headers = API.getHeaders();
    $scope.departmentLinkId = -1;
    $scope.listDentalStaffs = [];
    $scope.currentPage = 1;
    $scope.itemsPerPage = 8;
    $scope.totalPages = 0;
    $scope.listFilterDentalStaffDepartment = [];

    $scope.init = function() {
        // Lấy URL hiện tại
        var currentUrl = $location.url();
        
        // Tách ID từ URL
        var match = currentUrl.match(/\/department-single\/(\d+)/);

        if (match) {
            // Nếu tìm thấy ID, match[1] chứa ID
            $scope.departmentLinkId = match[1];
            $scope.getDepartmentById($scope.departmentLinkId)
            // Thực hiện các thao tác khác với departmentId nếu cần
            $scope.listDentalStaff().then(() => {
                // Chỉ gọi getListDentalStaffByDepartmentId sau khi listDentalStaff đã hoàn tất
                $scope.getListDentalStaffByDepartmentId();
            });
            
        } else {
            console.log('ID không tìm thấy trong URL');
        }
    };

    $scope.getListDentalStaffByDepartmentId = function() {
        const defaultImageUrl = 'https://inkythuatso.com/uploads/thumbnails/800/2023/03/10-anh-dai-dien-trang-inkythuatso-03-15-27-10.jpg'; // URL của avatar mặc định
    
        if ($scope.departmentLinkId != -1) {
            // Kiểm tra nếu $scope.listDentalStaffs không phải là undefined hoặc null
            if ($scope.listDentalStaffs && Array.isArray($scope.listDentalStaffs)) {
                $scope.listFilterDentalStaffDepartment = $scope.listDentalStaffs.filter(d => {
                    return d.department && d.department.departmentId == $scope.departmentLinkId;
                });

                // Cập nhật mỗi nhân viên để đảm bảo có URL hình ảnh hợp lệ
                $scope.listFilterDentalStaffDepartment = $scope.listFilterDentalStaffDepartment.map(d => {
                    // Nếu imageURL không hợp lệ, sử dụng defaultImageUrl
                    d.imageURL = d.imageURL ? d.imageURL : defaultImageUrl;
                    return d;
                });

                // Tính tổng số trang
                $scope.totalPages = Math.ceil($scope.listFilterDentalStaffDepartment.length / $scope.itemsPerPage);
                $scope.updatePage();

                console.log("Filtered dental staff by department ID:", $scope.listFilterDentalStaffDepartment);
            } else {
                console.log("Danh sách nhân viên nha khoa không tồn tại hoặc không phải là một mảng.");
                $scope.listFilterDentalStaffDepartment = [];
            }
        } else {
            console.log("Không tìm thấy departmentLinkId:", $scope.departmentLinkId);
            $scope.listFilterDentalStaffDepartment = [];
        }
    };

    $scope.updatePage = function() {
        let start = ($scope.currentPage - 1) * $scope.itemsPerPage;
        let end = start + $scope.itemsPerPage;
        $scope.currentPageItems = $scope.listFilterDentalStaffDepartment.slice(start, end);
    };

    $scope.changePage = function(page) {
        if (page < 1 || page > $scope.totalPages) return;
        $scope.currentPage = page;
        $scope.updatePage();
    };

    $scope.listDentalStaff = function() {
        return $http.get(url + '/dental-staff-except-deleted', { headers: headers }).then(response => {
            $scope.listDentalStaffs = response.data;
            console.log("response.data: ", response.data);
            return $scope.listDentalStaffs;
        }).catch(error => {
            console.error("Error fetching dental staff:", error);
        });
    };

    $scope.getListDepartments = function () {
        $http.get(url + '/department-except-deleted', { headers: headers }).then(response => {
            $scope.listDepartments = response.data;
            console.log('API department response:', response.data); 
        }).catch(error => {
            console.error("Error fetching departments:", error);
        });
    };

    $scope.getDepartmentById = function (id) {
        $http.get(url + '/department-id/'+id, { headers: headers }).then(response => {
            $scope.departmentGot = response.data;
        }).catch(error => {
            console.error("Error fetching department:", error);
        });
    };

    $scope.init();
    $scope.getListDepartments();
});
