app.controller('BlogController', function ($scope, $http, $rootScope, $location, $timeout, API, $q, $sce) {
    let url = API.getBaseUrl();
    let headers = API.getHeaders();
    $scope.dentalLogged = -1;
    console.log(localStorage.getItem('userLogin'))
    $scope.init = function () {
        if ($.fn.DataTable.isDataTable('#dataTable-post')) {
            $('#dataTable-post').DataTable().clear().destroy();
        }
        $(document).ready(function () {
            $('#dataTable-post').DataTable({
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
    }
    $scope.getListPosts = function () {
        $http.get(url + '/post', { headers: headers }).then(response => {
            $scope.listPostDB = response.data;
            $scope.listPostDB = response.data.map(post => {
                post.body = $sce.trustAsHtml(post.body);
                return post;
            });
            console.log('API posts response:', response.data);
        });
    }

    $scope.getListPosts()
    $scope.init()
})
