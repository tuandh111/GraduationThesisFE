app.controller('AdminPostController', function ($scope, $http, $rootScope, $location, $timeout, API, $route, adminBreadcrumbService, processSelect2Service, $sce) {
    let url = API.getBaseUrl();
    let headers = API.getHeaders();
    adminBreadcrumbService.generateBreadcrumb();
    $scope.isEditing = false;
    $scope.editingPostId = null;
    let quill;
    //validate
    $scope.isTitleValid = true;
    $scope.isBodyValid = true;

    $scope.validatePostData = () => {
        let title = $scope.postTitle;
        let body = quill.root.innerHTML.trim();

        $scope.isTitleValid = !!title;
        $scope.isBodyValid = !!body;
        $scope.isFormValid = $scope.isTitleValid && $scope.isBodyValid;

        if ($scope.isFormValid) {
            localStorage.setItem('draftPost', JSON.stringify({
                title: $scope.postTitle,
                body: quill.root.innerHTML.trim(),
                image: $scope.imageUrl,
                editingPostId: $scope.editingPostId,
                isEditing: $scope.isEditing
            }));
        }
        return $scope.isFormValid;
    };

    $scope.loadDraft = () => {
        let draft = localStorage.getItem('draftPost');

        if (draft) {
            draft = JSON.parse(draft);
            console.log(draft);
            $scope.postTitle = draft.title;
            $scope.imageUrl = draft.image;
            quill.root.innerHTML = draft.body;
            $scope.editingPostId = draft.editingPostId;

            $scope.isEditing = draft.isEditing;
        }
    };


    $scope.initEditor = () => {
        var editor = document.getElementById('editor');
        if (editor) {
            var toolbarOptions = [
                [{ 'font': [] }],
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'align': [] }],
                ['clean'],
            ];

            quill = new Quill(editor, {
                modules: {
                    toolbar: toolbarOptions
                },
                theme: 'snow'
            });
            quill.on('text-change', () => {
                $scope.$applyAsync(() => {
                    $scope.validatePostData();
                });
            })
            $scope.loadDraft();
        } else {
            console.error("Editor element not found.");
        }

    };

    $scope.clearPost = () => {
        $scope.postTitle = '';
        quill.root.innerHTML = '';
        $scope.imageUrl = '';
        document.getElementById('imageInput').value = "";
        $scope.imageUrl = null;
        $scope.isTitleValid = true;
        $scope.isBodyValid = true;
        $scope.isFormValid = false;
        $scope.isEditing = false;
        localStorage.removeItem('draftPost');
        console.log('draftPost removed from localStorage');
    };
    $scope.initDataTable = () => {
        $http.get(url + "/post-except-deleted", { headers: headers }).then(response => {
            $scope.listPost = response.data;
            $scope.listPost = response.data.map(post => {
                post.body = $sce.trustAsHtml(post.body);
                return post;
            });

            console.log($scope.listPost);
            if ($.fn.DataTable.isDataTable('#dataTable-list-post')) {
                $('#dataTable-list-post').DataTable().clear().destroy();
            }
            $(document).ready(function () {
                $('#dataTable-list-post').DataTable({
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
        });
    };

    $scope.uploadImg = function (files) {
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
            $scope.imageUrl = response.data.message;
            $scope.filename = file.name;
            swal.close();
            new Noty({
                text: 'Tải ảnh lên thành công !',
                type: 'success',
                timeout: 3000
            }).show();
            $scope.validatePostData();
        }).catch(function (error) {
            swal.close();
            new Noty({
                text: 'Tải ảnh lên thất bại. Vui lòng thử lại!',
                type: 'error',
                timeout: 3000
            }).show();
            console.log("Upload failed:", error);
        });
    };
    $scope.deleteImg = () => {
        document.getElementById('imageInput').value = "";
        $scope.imageUrl = null;
        $scope.validatePostData();
    }
    $scope.createPost = () => {
        if (!$scope.validatePostData()) {
            return;
        }
        Swal.fire({
            title: 'Bạn có chắc chắn muốn thêm bài viết này không?',
            text: "Bài viết sẽ được thêm vào hệ thống.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Có, thêm bài viết!',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                let params = {
                    title: $scope.postTitle,
                    body: quill.root.innerHTML,
                    image: $scope.imageUrl,
                    isDeleted: false,
                    createDate: new Date(),
                    createById: 1
                };
                var postRequest = angular.toJson(params);
                $http.post(url + '/post', postRequest, { headers: headers })
                    .then(response => {
                        console.log("Bài viết đã được đăng thành công:", response.data);
                        new Noty({
                            text: 'Thêm bài viết thành công !',
                            type: 'success',
                            timeout: 3000
                        }).show();
                        localStorage.removeItem('draftPost');
                        $route.reload();
                    })
                    .catch(error => {
                        new Noty({
                            text: 'Thêm bài viết thất bại. Vui lòng thử lại!',
                            type: 'error',
                            timeout: 3000
                        }).show();
                    });
            }
        });
    };


    $scope.editPost = (post, event) => {
        $scope.postTitle = post.title;
        $scope.imageUrl = post.image;
        quill.root.innerHTML = post.body;
        $scope.editingPostId = post.postId;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        $scope.isEditing = true;
    };

    $scope.updatePost = () => {
        if (!$scope.validatePostData()) {
            return;
        }

        // Hiển thị thông báo xác nhận
        Swal.fire({
            title: 'Bạn có chắc chắn muốn cập nhật bài viết này không?',
            text: "Bài viết sẽ được cập nhật trong hệ thống.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Có, cập nhật bài viết!',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                // Nếu người dùng xác nhận, thực hiện gửi yêu cầu API
                let params = {
                    title: $scope.postTitle,
                    body: quill.root.innerHTML,
                    image: $scope.imageUrl,
                    isDeleted: false,
                    createDate: new Date(),
                    createById: 1
                };

                console.log(params);
                console.log($scope.editingPostId);
                var postRequest = angular.toJson(params);
                $http.put(url + '/post/' + $scope.editingPostId, postRequest, { headers: headers })
                    .then(response => {
                        console.log("Bài viết đã được cập nhật thành công:", response.data);
                        new Noty({
                            text: 'Cập nhật bài viết thành công !',
                            type: 'success',
                            timeout: 3000
                        }).show();
                        $scope.isEditing = false;
                        $scope.clearPost();
                        $route.reload();

                    })
                    .catch(error => {
                        new Noty({
                            text: 'Cập nhật bài viết thất bại. Vui lòng thử lại!',
                            type: 'error',
                            timeout: 3000
                        }).show();
                    });
            }
        });
    };

    $scope.deletePostTable = (post, event) => {
        console.log("postId: " + post.postId)
        Swal.fire({
            title: 'Bạn có chắc chắn muốn xóa bài viết này 1?',
            text: "Bạn sẽ không thể phục hồi nó sau khi xóa!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Có, xóa!',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {

                $http.delete(url + '/post/' + post.postId, { headers: headers })
                    .then(response => {
                        console.log("Bài viết đã được xóa thành công:", response.data);
                        new Noty({
                            text: 'Xóa bài viết thành công !',
                            type: 'success',
                            timeout: 3000
                        }).show();
                        $scope.clearPost();
                        $route.reload();
                    })
                    .catch(error => {
                        console.error("Đã có lỗi xảy ra khi xóa bài viết:", error);
                        new Noty({
                            text: 'Xóa bài viết thất bại. Vui lòng thử lại!',
                            type: 'error',
                            timeout: 3000
                        }).show();
                    });
            }
        });
    };

    $scope.deletePost = () => {
        Swal.fire({
            title: 'Bạn có chắc chắn muốn xóa bài viết này?',
            text: "Bạn sẽ không thể phục hồi nó sau khi xóa!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Có, xóa!',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                $http.delete(url + '/post/' + $scope.editingPostId, { headers: headers })
                    .then(response => {
                        console.log("Bài viết đã được xóa thành công:", response.data);
                        new Noty({
                            text: 'Xóa bài viết thành công !',
                            type: 'success',
                            timeout: 3000
                        }).show();
                        $scope.clearPost();
                        $route.reload();
                    })
                    .catch(error => {
                        console.error("Đã có lỗi xảy ra khi xóa bài viết:", error);
                        new Noty({
                            text: 'Xóa bài viết thất bại. Vui lòng thử lại!',
                            type: 'error',
                            timeout: 3000
                        }).show();
                    });
            }
        });
    };
    $scope.views = () => {
        $scope.postContent = {
            id: $scope.editingPostId,
            title: $scope.postTitle,
            image: $scope.imageUrl,
            body: $sce.trustAsHtml(quill.root.innerHTML)
        };
        console.log($scope.postContent.image)
    };


    $scope.initEditor();
    $scope.initDataTable();
});
