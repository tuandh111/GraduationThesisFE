app.controller('AdminListDistributionSupplies', function ($scope, $http, $rootScope, $location, $timeout, API, adminBreadcrumbService) {
    let url = API.getBaseUrl();
    let headers = API.getHeaders();
    adminBreadcrumbService.generateBreadcrumb()
    //code here
    $scope.listDistributionSuppliesFormDB = [];
    //code here
    //jquery

    $scope.clearFormDistributionSupplies = () => {
        $scope.distribution = ''
        $scope.name = ''
        $scope.address = ''
        $scope.contactPerson = ''
        $scope.email = ''
        $scope.note = ''
        $scope.taxCode = ''
    }

    $scope.listDistributionSupplies = () => {
        $http.get(url + '/distribution-supplies-except-deleted', { headers: headers }).then(response => {
            $scope.listDistributionSuppliesFormDB = response.data
            if ($.fn.DataTable.isDataTable('#dataTable-list-service')) {
                $('#dataTable-list-service').DataTable().clear().destroy();
            }
            $(document).ready(function () {
                $('#dataTable-list-service').DataTable({
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
                    }
                });
                $scope.$apply()
            });
        }).catch(error => {
            console.log("error", error);
        })
    }

    $scope.loadDistributionSupplies = () => {
        $http.get(url + '/distribution-supplies-except-deleted', { headers: headers }).then(response => {
            $scope.listDistributionSuppliesFormDB = response.data
            $('#dataTable-list-service').DataTable().clear().destroy();
            $(document).ready(function () {
                $('#dataTable-list-service').DataTable({
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
                    }
                });
                $scope.$apply()
            });
        }).catch(error => {
            console.log("error", error);
        })
    }

    $scope.createDistributionSupplies = () => {
        $scope.errorDistribution = false
        $scope.errorName = false
        $scope.errorAddress = false
        $scope.errorContactPerson = false
        $scope.errorEmail = false
        $scope.errorTaxCode = false
        if ($scope.distribution == "" || $scope.distribution == undefined) {
            $scope.errorDistribution = true
        } else {
            $scope.errorDistribution = false
        }

        if ($scope.name == "" || $scope.name == undefined) {
            $scope.errorName = true
        } else {
            $scope.errorName = false
        }
        if ($scope.address == "" || $scope.address == undefined) {
            $scope.errorAddress = true
        } else {
            $scope.errorAddress = false
        }

        if ($scope.contactPerson == "" || $scope.contactPerson == undefined) {
            $scope.errorContactPerson = true
        } else {
            $scope.errorContactPerson = false
        }

        if ($scope.email == "" || $scope.email == undefined) {
            $scope.errorEmail = true
        } else {
            $scope.errorEmail = false
        }

        if ($scope.taxCode == "" || $scope.taxCode == undefined) {
            $scope.errorTaxCode = true
        } else {
            $scope.errorTaxCode = false
        }
        if ($scope.errorDistribution ||
            $scope.errorName ||
            $scope.errorAddress ||
            $scope.errorContactPerson ||
            $scope.errorEmail ||
            $scope.errorTaxCode) {
            console.log($scope.errorDistribution,
                $scope.errorName,
                $scope.errorAddress,
                $scope.errorContactPerson,
                $scope.errorEmail,
                $scope.errorTaxCode); return;
        }

        var DistributionSuppliesRequest = {
            distribution: $scope.distribution,

            name: $scope.name,

            address: $scope.address,

            contactPerson: $scope.contactPerson,

            email: $scope.email,

            note: $scope.note,

            taxCode: $scope.taxCode
        }
        $http.post(url + '/distribution-supplies', DistributionSuppliesRequest, { headers: headers }).then(response => {
            new Noty({
                text: 'Thêm nhà phân phối thành công !',
                type: 'success',
                timeout: 3000
            }).show() ;
            $scope.clearFormDistributionSupplies();
        }).catch(error => {
            new Noty({
                text: 'Thêm nhà phân phối thất bại. Vui lòng thử lại!',
                type: 'error',
                timeout: 3000
            }).show() ;
            console.log("error", error);
        })
    }


    $scope.deleteDistribution = (d) => {
        Swal.fire({
            title: "Bạn có chắc?",
            text: "Bạn có muốn xóa " + d.name + " này không?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Có"
        }).then((result) => {
            if (result.isConfirmed) {
                $http.delete(url + '/soft-delete-distribution-supplies/' + d.distributionId, { headers: headers }).then(response => {

                    new Noty({
                        text: 'Xóa nhà phân phối thành công !',
                        type: 'success',
                        timeout: 3000
                    }).show() ;
                    $scope.loadDistributionSupplies();
                }).catch(error => {
                    new Noty({
                        text: 'Xóa nhà phân phối thất bại. Vui lòng thử lại!',
                        type: 'error',
                        timeout: 3000
                    }).show() ;
                    console.log("error", error);
                })
            }
        });

    }


    $scope.editDistributionSupplies = [];
    $scope.editDistribution = (d) => {

        $http.get(url + '/distribution-supplies-id/' + d.distributionId, { headers: headers }).then(response => {

            $scope.editDistributionSupplies = response.data
        }).catch(error => {
            console.log("error", error);
        });
    }

    $scope.updateDistribution = (d) => {

        var DistributionSuppliesRequest = {
            distribution: $scope.editDistributionSupplies.distribution,

            name: $scope.editDistributionSupplies.name,

            address: $scope.editDistributionSupplies.address,

            contactPerson: $scope.editDistributionSupplies.contactPerson,

            email: $scope.editDistributionSupplies.email,

            note: $scope.editDistributionSupplies.note,

            taxCode: $scope.editDistributionSupplies.taxCode
        }
        $http.put(url + '/distribution-supplies/' + $scope.editDistributionSupplies.distributionId, DistributionSuppliesRequest, { headers: headers }).then(response => {

            var updatedDistribution = response.data
            new Noty({
                text: 'Cập nhật nhà phân phối thành công !',
                type: 'success',
                timeout: 3000
            }).show() ;
            $scope.loadDistributionSupplies();
        }).catch(error => {
            new Noty({
                text: 'Cập nhật nhà phân phối thất bại. Vui lòng thử lại!',
                type: 'error',
                timeout: 3000
            }).show() ;
            console.log("error", error);
        })
    }


    $scope.listDistributionSupplies();
})