app.controller('AdminCTResultController', function ($scope, $http, $rootScope, $location, TimezoneService, $timeout, API, adminBreadcrumbService, processSelect2Service) {
    let url = API.getBaseUrl();
    let headers = API.getHeaders();
    const defaultTimezone = "Asia/Ho_Chi_Minh";
    adminBreadcrumbService.generateBreadcrumb()
    let dentalStaffLogin = API.getUser() ? parseInt(API.getUser().split("-")[0]) : null

    $scope.listDentalStaffsDB = []
    $scope.listAppointmentsDB = []
    $scope.listImagingPlanesDB = []
    $scope.listCTResultsDB = []
    $scope.listAbnormalitiesDB = []
    $scope.listCTResultAbnormalitiesDB = []
    $scope.isUpdateCTResult = false
    $scope.isLoadingCreate = false
    $scope.isLoadingUpdate = false
    $scope.selectedAbnormalityId = []
    $scope.selectedTempAbnormalityId = []
    $scope.originalCtresultAbnormality = []
    $scope.originalAppointmentCTResult = []
    $scope.imageUrl = null

    $scope.initializeUIComponents = () => {

        $timeout(() => {
            $('.select2-appointment').select2(
                {
                    theme: 'bootstrap4',
                    placeholder: '---Chọn thông tin bệnh nhân---',
                    allowClear: true
                }).val(null).trigger('change')
            $('.select2-imagingPlanes').select2(
                {
                    theme: 'bootstrap4',
                    placeholder: '---Chọn hướng chụp---',
                    allowClear: true
                }).val(null).trigger('change')
            $('.select2-multi-abnormality').select2(
                {
                    multiple: true,
                    theme: 'bootstrap4',
                    placeholder: '---Nhập dấu hiệu bất thường---',
                    allowClear: true
                }).val(null).trigger('change')
        }, 500)

        $('.drgpicker-ct').daterangepicker(
            {
                singleDatePicker: true,
                timePicker: false,
                showDropdowns: true,
                locale:
                {
                    format: 'DD/MM/YYYY',
                    applyLabel: 'Áp dụng',
                    cancelLabel: 'Hủy',
                },
                maxDate: moment().format('DD/MM/YYYY'),
                minDate: moment().subtract(5, 'days').format('DD/MM/YYYY')
            });
        $('.drgpicker-ct').on('apply.daterangepicker', function (ev, picker) {
            let selectedDate = picker.startDate.format('DD/MM/YYYY');
            $scope.formCTResult.date = selectedDate
        });
        $('.time-input').timepicker(
            {
                'scrollDefault': 'now',
                'zindex': '9999' /* fix modal open */
            });
        /** date range picker */
        if ($('.datetimes').length) {
            $('.datetimes').daterangepicker(
                {
                    timePicker: true,
                    startDate: moment().startOf('hour'),
                    endDate: moment().startOf('hour').add(32, 'hour'),
                    locale:
                    {
                        format: 'M/DD hh:mm A'
                    }
                });
        }
        var start = moment().subtract(29, 'days');
        var end = moment();

        function cb(start, end) {
            $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
        }
        $('#reportrange').daterangepicker(
            {
                startDate: start,
                endDate: end,
                ranges:
                {
                    'Today': [moment(), moment()],
                    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                    'This Month': [moment().startOf('month'), moment().endOf('month')],
                    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                }
            }, cb);
        cb(start, end);
        $('.input-placeholder').mask("00/00/0000",
            {
                placeholder: "__/__/____"
            });
        $('.input-zip').mask('00000-000',
            {
                placeholder: "____-___"
            });
        $('.input-money').mask("#.##0,00",
            {
                reverse: true
            });
        $('.input-phoneus').mask('(000) 000-0000');
        $('.input-mixed').mask('AAA 000-S0S');
        $('.input-ip').mask('0ZZ.0ZZ.0ZZ.0ZZ',
            {
                translation:
                {
                    'Z':
                    {
                        pattern: /[0-9]/,
                        optional: true
                    }
                },
                placeholder: "___.___.___.___"
            });
        // editor
        var editor = document.getElementById('editor');
        if (editor) {
            var toolbarOptions = [
                [
                    {
                        'font': []
                    }],
                [
                    {
                        'header': [1, 2, 3, 4, 5, 6, false]
                    }],
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [
                    {
                        'header': 1
                    },
                    {
                        'header': 2
                    }],
                [
                    {
                        'list': 'ordered'
                    },
                    {
                        'list': 'bullet'
                    }],
                [
                    {
                        'script': 'sub'
                    },
                    {
                        'script': 'super'
                    }],
                [
                    {
                        'indent': '-1'
                    },
                    {
                        'indent': '+1'
                    }], // outdent/indent
                [
                    {
                        'direction': 'rtl'
                    }], // text direction
                [
                    {
                        'color': []
                    },
                    {
                        'background': []
                    }], // dropdown with defaults from theme
                [
                    {
                        'align': []
                    }],
                ['clean'] // remove formatting button
            ];
            var quill = new Quill(editor,
                {
                    modules:
                    {
                        toolbar: toolbarOptions
                    },
                    theme: 'snow'
                });
        }
        (function () {
            'use strict';
            window.addEventListener('load', function () {
                // Fetch all the forms we want to apply custom Bootstrap validation styles to
                var forms = document.getElementsByClassName('needs-validation');
                // Loop over them and prevent submission
                var validation = Array.prototype.filter.call(forms, function (form) {
                    form.addEventListener('submit', function (event) {
                        if (form.checkValidity() === false) {
                            event.preventDefault();
                            event.stopPropagation();
                        }
                        form.classList.add('was-validated');
                    }, false);
                });
            }, false);
        })();

        $('#appointmentId').on('change', function () {
            $timeout(function () {
                $scope.formCTResult.appointmentId = $('#appointmentId').val();
            });
        });
        $('#imagingPlanesId').on('change', function () {
            $timeout(function () {
                $scope.formCTResult.imagingPlanesId = $('#imagingPlanesId').val();
            });
        });
        $('#abnormalityId').on('change', function () {
            $timeout(function () {
                let selectedVals = $('#abnormalityId').val()
                $scope.selectedAbnormalityId = processSelect2Service.processSelect2Data(selectedVals)
            });
        });
    }

    $scope.getListAppointments = () => {
        $http.get(url + "/appointment-without-ctresult", { headers: headers }).then(response => {
            const status = ['đã xác nhận', 'đang diễn ra']
            $scope.listAppointmentsDB = response.data.filter(app => status.includes(app.appointmentStatus.status.toLowerCase()))
        }).catch(err => {
            new Noty({
                text: 'Đã xảy ra lỗi!',
                type: 'error',
                timeout: 3000
            }).show();
        })
    }


    $scope.getListImagingPlanes = () => {
        $http.get(url + "/imaging-planes-except-deleted", { headers: headers }).then(response => {
            $scope.listImagingPlanesDB = response.data
        }).catch(err => {
            new Noty({
                text: 'Đã xảy ra lỗi!',
                type: 'error',
                timeout: 3000
            }).show();
        })
    }

    $scope.getListAbnormalities = () => {
        $http.get(url + "/abnormality-except-deleted", { headers: headers }).then(response => {
            $scope.listAbnormalitiesDB = response.data
        }).catch(err => {
            new Noty({
                text: 'Đã xảy ra lỗi!',
                type: 'error',
                timeout: 3000
            }).show();
        })
    }

    $scope.getListCTResultAbnormalities = () => {
        $http.get(url + "/ct-result-abnormality-except-deleted", { headers: headers }).then(response => {
            $scope.listCTResultAbnormalitiesDB = response.data
        }).catch(err => {
            new Noty({
                text: 'Đã xảy ra lỗi!',
                type: 'error',
                timeout: 3000
            }).show();
        })
    };


    $scope.showCTResultAbnormality = (appointmentCTResultId) => {
        const result = $scope.listCTResultAbnormalitiesDB.filter(item => {
            if (item.appointmentCTResult != null) {
                return item.appointmentCTResult.appointmentCTResultId === appointmentCTResultId
            }
        }
        );
        return result;
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
            $scope.zoomInImage()
            swal.close();
            new Noty({
                text: 'Tải ảnh lên thành công!',
                type: 'success',
                timeout: 3000
            }).show();
            $scope.formCTResult.image = $scope.imageUrl;
        }).catch(function (error) {
            swal.close();
            new Noty({
                text: 'Tải ảnh lên thất bại. Vui lòng thử lại !',
                type: 'error',
                timeout: 3000
            }).show();

            console.log("Upload failed:", error);
        });
    };


    $scope.deleteImg = () => {
        document.getElementById('imageInput').value = "";
        $scope.imageUrl = null;
    }

    $scope.getListCTResults = () => {
        $http.get(url + '/appointment-ct-result-except-deleted', { headers: headers }).then(respone => {
            $scope.listCTResultsDB = respone.data
            if ($.fn.DataTable.isDataTable('#dataTable-list-ct-result')) {
                $('#dataTable-list-ct-result').DataTable().clear().destroy();
            }
            $(document).ready(function () {
                $('#dataTable-list-ct-result').DataTable({
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
        }).catch(err => {
            console.log("Error", err);
        })
    }
    $scope.crudCTResult = () => {
        var currentDate = new Date();
        $scope.formCTResult = {
            appointmentCTResultId: -1,
            image: '',
            dentalStaffId: dentalStaffLogin,
            appointmentId: '',
            imagingPlanesId: '',
            date: moment().format('DD/MM/YYYY'),
        }
        $scope.formCTResultAbnormality = {
            ctresultAbnormalityId: -1,
            abnormalityId: '',
            appointmentCTResult: '',
            description: '',
        }
        $scope.checkDate = function (dateTakeCT) {
            if (!dateTakeCT) return false;

            var dateTackPic = new Date(dateTakeCT);

            return dateTackPic <= currentDate;
        };

        $scope.validateDate = function () {
            return $scope.checkDate($scope.formCTResult.date);
        };


        $scope.validationForm = () => {
            var valid = false
            $scope.processSelect2Data = () => {
                if (typeof $scope.formCTResult.appointmentId === 'string' && $scope.formCTResult.appointmentId.includes(':')) {
                    $scope.formCTResult.appointmentId = parseInt($scope.formCTResult.appointmentId.split(':')[1]);
                }

                if (typeof $scope.formCTResult.imagingPlanesId === 'string' && $scope.formCTResult.imagingPlanesId.includes(':')) {
                    $scope.formCTResult.imagingPlanesId = $scope.formCTResult.imagingPlanesId.split(':')[1];
                }
            }
            if ($scope.formCTResult.dentalStaffId == "" || $scope.formCTResult.dentalStaffId == null) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng đăng nhập!",
                    icon: "error"
                })
            }
            else if ($scope.formCTResult.imagingPlanesId == "" || $scope.formCTResult.imagingPlanesId == null) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng chọn hướng chụp!",
                    icon: "error"
                })
            }
            else if ($scope.selectedAbnormalityId.length == 0 && $scope.selectedTempAbnormalityId.length == 0) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng chọn vấn đề bất thường!",
                    icon: "error"
                })
            }
            else {
                $scope.processSelect2Data()
                valid = true
            }
            return valid
        }

        $scope.generateCTResultAbnormalityRequest = (selectedAbnormalityId, appointmentCTResultId) => {
            let dataArray = []
            selectedAbnormalityId.forEach(abnormalityId => {
                let cTResultAbnormalityRequest = {
                    description: '',
                    abnormalityId: abnormalityId,
                    appointmentCTResult: appointmentCTResultId
                }
                dataArray.push(cTResultAbnormalityRequest)
            })
            return dataArray
        }

        $scope.processDataUpdate = (originalArr, reqArr) => {
            const oL = originalArr.length
            const rL = reqArr.length

            let updateArr = [];
            let deleteArr = [];
            let postArr = [];
            if (oL > rL) {
                deleteArr = originalArr.slice(rL)
                updateArr = [originalArr.slice(0, rL), reqArr]
            } else if (oL < rL) {
                updateArr = [originalArr, reqArr.slice(0, oL)]
                postArr = reqArr.slice(oL)
            } else {
                updateArr = [originalArr, reqArr]
            }
            return {

                updateArr: [updateArr],
                deleteArr: [deleteArr],
                postArr: [postArr]
            }
        }

        $scope.getOriginalData = (appointmentId) => {
            // let params = {
            //     appId: appointmentId
            // }           
            let getOriginalCtresultAbnormalityPromise = $http.get(url + '/ct-result-abnormality-by-appointmnet-id/' + appointmentId, { headers: headers }).then((response) => {
                $scope.originalCtresultAbnormality = response.data
                $scope.originalCtresultAbnormality.forEach(item => {
                    let id = item.abnormality.abnormalityId
                    $scope.selectedTempAbnormalityId.push(id)
                })
            })

            let getOriginalAppointmentCTResultPromise = $http.get(url + '/appointment-ct-result-by-appointment/' + appointmentId, { headers: headers }).then((response) => {
                $scope.originalAppointmentCTResult = response.data
            })


            Promise.all([getOriginalCtresultAbnormalityPromise, getOriginalAppointmentCTResultPromise])
        }

        $scope.editCTResult = (cs, $event) => {
            $event.preventDefault()
            $scope.isUpdateCTResult = true
            if (cs != null) {
                $scope.formCTResult = {
                    appointmentCTResultId: cs.appointmentCTResultId,
                    image: cs.imageURL,
                    dentalStaffId: cs.dentalStaff.dentalStaffId,
                    imagingPlanesId: cs.imagingPlanes.imagingPlanesId,
                    appointmentId: cs.appointment.appointmentId,
                    date: moment(cs.date).format("DD/MM/YYYY")
                }

                $scope.imageUrl = cs.imageURL
                // var cTResultAbnormality = $scope.showCTResultAbnormality(cs.appointmentCTResultId)
                // $scope.formCTResultAbnormality = {
                //     ctresultAbnormalityId: cTResultAbnormality.ctresultAbnormalityId,
                //     abnormalityId:"",
                //     appointmentCTResult: cTResultAbnormality.appointmentCTResult.appointmentCTResultId
                // }

                let appointmentId = cs.appointment.appointmentId
                $scope.getOriginalData(appointmentId)
                $scope.zoomInImage()
            }

            const firstTabButtonCreate = document.getElementById('form-tab-ct-result');
            firstTabButtonCreate.click();
        }

        $scope.createCTResult = async () => {
            if ($scope.formCTResult.appointmentCTResultId != -1) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Thông tin đã có trên hệ thống!",
                    icon: "error"
                });
                return;
            }

            var valid = $scope.validationForm();
            if (valid) {
                $scope.isLoadingCreate = true
                $scope.formCTResult.date = TimezoneService.convertToTimezone(moment($scope.formCTResult.date, "DD/MM/YYYY"), defaultTimezone)
                var requestCTResultJSON = angular.toJson($scope.formCTResult);

                let responseAppCTRS = await $http.post(url + '/appointment-ct-result', requestCTResultJSON, { headers: headers })

                let appointmentCTResultId = responseAppCTRS.data.appointmentCTResultId
                let abnormalityArr = $scope.generateCTResultAbnormalityRequest($scope.selectedAbnormalityId, appointmentCTResultId)

                let abnormalityRequest = abnormalityArr.map(item => {
                    let dataAbnormalityRequestJson = angular.toJson(item);
                    return $http.post(url + '/ct-result-abnormality', dataAbnormalityRequestJson, { headers: headers });
                })

                await Promise.all([...abnormalityRequest]).then(() => {
                    $timeout(() => { $scope.isLoadingCreate = false }, 3000)
                }).finally(() => {
                    $timeout(() => {
                        new Noty({
                            text: 'Thêm phim chụp thành công !',
                            type: 'success',
                            timeout: 3000
                        }).show();
                        $scope.resetForm();
                        $scope.getListCTResultAbnormalities();
                        $scope.getListCTResults();

                        const secondTabButtonCreate = document.getElementById('list-tab-ct-result');
                        secondTabButtonCreate.click();
                    }, 3000)
                }).catch(err => {
                    new Noty({
                        text: 'Thêm phim chụp thất bại !',
                        type: 'error',
                        timeout: 3000
                    }).show();
                })
            }
        };

        const handleApiRequest = (deleteUrl, postUrl, putUrl, data, idKey) => {
            const promises = []
            const ensureArray = arr => Array.isArray(arr) ? arr : [arr]
            if (data.deleteArr.length !== 0) {
                data.deleteArr.forEach(arrReq => {
                    if (arrReq.length === 0) return
                    arrReq.forEach(itemReq => {
                        promises.push($http.delete(`${deleteUrl}/${itemReq[idKey]}`, { headers: headers }))
                    })
                });
            }

            if (data.postArr.length !== 0) {
                data.postArr.forEach(arrReq => {
                    if (arrReq.length === 0) return
                    arrReq.forEach(itemReq => {
                        promises.push($http.post(postUrl, itemReq, { headers: headers }))
                    })
                });
            }

            if (data.updateArr.length !== 0) {
                data.updateArr.forEach(arrReq => {
                    if (arrReq.length === 0) return
                    let oItem = ensureArray(arrReq[0])
                    let uItem = ensureArray(arrReq[1])
                    oItem.forEach(o => {
                        const id = o[idKey]
                        uItem.forEach(u => {
                            promises.push($http.put(`${putUrl}/${id}`, u, { headers: headers }))
                        })
                    })
                })
            }

            return Promise.all(promises)
        };

        $scope.updateCTResult = async () => {
            if ($scope.formCTResult.appointmentCTResultId == -1) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Thông tin chưa có trên hệ thống!",
                    icon: "error"
                })
                return
            }
            var valid = $scope.validationForm()
            if (valid) {
                if ($scope.selectedAbnormalityId.length == 0) {
                    $scope.selectedAbnormalityId = $scope.selectedTempAbnormalityId
                }
                $scope.isLoadingUpdate = true
                $scope.formCTResult.date = TimezoneService.convertToTimezone(moment($scope.formCTResult.date, "DD/MM/YYYY"), defaultTimezone)
                // var requestCTResultJSON = angular.toJson($scope.formCTResult)
                let appointmentCTResultId = $scope.formCTResult.appointmentCTResultId
                // var requestCTResultAbnormalityJSON = angular.toJson($scope.formCTResultAbnormality);

                let originalAppointmentCTResult = $scope.originalAppointmentCTResult

                let cTAbnormalityId = []
                let originalCTAbnormality = $scope.originalCtresultAbnormality
                originalCTAbnormality.forEach(item => {
                    let id = item.ctresultAbnormalityId
                    cTAbnormalityId.push(id)
                })

                let abnormalityArr = $scope.generateCTResultAbnormalityRequest($scope.selectedAbnormalityId, appointmentCTResultId)
                let reqCTRSData = $scope.processDataUpdate(originalCTAbnormality, abnormalityArr)
                const ctrsKey = "ctresultAbnormalityId"

                let appCTRSData = $scope.processDataUpdate(originalAppointmentCTResult, [$scope.formCTResult])
                const appCTRSKey = "appointmentCTResultId"

                Promise.all([
                    handleApiRequest(url + "/soft-delete-ct-result-abnormality", url + "/ct-result-abnormality", url + "/ct-result-abnormality", reqCTRSData, ctrsKey),
                    handleApiRequest(url + "/soft-delete-appointment-ct-result", url + "/appointment-ct-result", url + "/appointment-ct-result", appCTRSData, appCTRSKey)
                ]).then(() => {
                    $timeout(() => { $scope.isLoadingUpdate = false }, 3000)
                }).finally(() => {
                    $timeout(() => {
                        new Noty({
                            text: 'Cập nhật thành công!',
                            type: 'success',
                            timeout: 3000
                        }).show();
                        $scope.resetForm()
                        $scope.getListCTResultAbnormalities()
                        $scope.getListCTResults()
                        const secondTabButtonCreate = document.getElementById('list-tab-ct-result');
                        secondTabButtonCreate.click();
                    }, 3000)
                }).catch(err => {
                    new Noty({
                        text: 'Cập nhật thất bại. Vui lòng thử lại !',
                        type: 'error',
                        timeout: 3000
                    }).show();
                })

            }

        }

        $scope.deleteCTResult = (cs, $event) => {
            $event.preventDefault()
            var appointmentCTResultId = cs.appointmentCTResultId
            Swal.fire({
                text: "Bạn có muốn xóa ảnh này ?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                cancelButtonText: 'Trở lại',
                confirmButtonText: 'Có'
            }).then(rs => {
                if (rs.isConfirmed) {
                    $http.delete(url + '/soft-delete-appointment-ct-result/' + appointmentCTResultId).then(respone => {
                        new Noty({
                            text: 'Đã xóa thành công!',
                            type: 'success',
                            timeout: 3000
                        }).show();
                        $scope.getListCTResults()
                    }).catch(err => {
                        new Noty({
                            text: 'Xóa thất bại. Vui lòng thử lại !',
                            type: 'error',
                            timeout: 3000
                        }).show();
                    })
                }
            })
        }

        $scope.resetForm = () => {
            $scope.imageUrl = null
            $scope.isUpdateCTResult = false
            $scope.isLoadingCreate = false
            $scope.isLoadingUpdate = false
            document.getElementById('imageInput').value = "";
            $scope.formCTResult = {
                image: null,
                appointmentCTResultId: -1,
                dentalStaffId: '',
                AppointmentId: '',
                imagingPlanesId: '',
                date: '',
            }
            $scope.formCTResultAbnormality = {
                ctresultAbnormalityId: -1,
                abnormalityId: '',
                appointmentCTResult: '',
                description: '',
            }
            $('#imagingPlanesId').val(null).trigger('change');
            $('#appointmentId').val(null).trigger('change');
            $('#dentalStaffId').val(null).trigger('change');
            $('#abnormalityId').val(null).trigger('change');
        }
    }

    $scope.zoomInImage = () => {
        $timeout(() => {
            const mousemove = document.getElementById("zoom_img");
            const imgmove = document.getElementById("selectedImage");

            mousemove.addEventListener("mousemove", (e) => {
                const rect = mousemove.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                imgmove.style.transformOrigin = `${x}px ${y}px`;
                imgmove.style.transform = "scale(2)";
            });

            mousemove.addEventListener("mouseleave", () => {
                imgmove.style.transform = "scale(1)";
            });
        });

    }






    $scope.initializeUIComponents()
    $scope.getListAbnormalities()
    $scope.getListAppointments()
    $scope.getListImagingPlanes()
    $scope.getListCTResultAbnormalities()
    $scope.getListCTResults()
    $scope.crudCTResult()
})