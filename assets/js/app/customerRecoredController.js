app.controller('CustomerRecoredController', function ($scope, $http, SocketService, $rootScope, $location, $timeout, $window, API, $route, adminBreadcrumbService, processSelect2Service, convertMoneyService) {
    let url = API.getBaseUrl();
    let headers = API.getHeaders();
    $scope.loadingStates = {};
    $scope.isLoadingCancel = (appId) => {
        return !!$scope.loadingStates[appId];
    };
    $scope.initData = () => {
        $scope.selectedDates = ""
        $scope.selectPatientIds = API.getUser() ? [parseInt(API.getUser().split("-")[0])] : []
        $scope.selectDoctorIds = []
        $scope.formPatientRecord = {
            doctorId: null,
            dateFilter: moment(new Date()).format("DD/MM/YYYY")
        }

        $scope.listDoctorUnavailabilityAllDoctorDB = []
        $scope.listBillByAppointmentAndPatientDB = []
        $scope.listPrescriptionByAppointmentAndMedicinesDB = []
        $scope.appointmentIdParam = null
        $scope.patientIdParam = null

        $scope.initializeUIComponents()
        $scope.getListDoctor()
        $scope.getAllAppGroupByDate($scope.selectedDates, $scope.selectPatientIds, $scope.selectDoctorIds)
        $scope.getListDoctorUnavailabilityAllDoctor()
        $scope.getBillByAppointmentAndPatient($scope.appointmentIdParam, $scope.patientIdParam)
        $scope.getPrescriptionWithMedicinesByAppointment($scope.appointmentIdParam)
    }

    $scope.initializeUIComponents = () => {
        $('.select2').select2(
            {
                theme: 'bootstrap4',
                placeholder: 'Select an option',
                allowClear: true
            }
        );

        $('.select2-multi').select2(
            {
                multiple: true,
                theme: 'bootstrap4',
            });

        $('.customer-drgpicker-filter-record').daterangepicker(
            {
                singleDatePicker: false,
                timePicker: false,
                showDropdowns: true,
                locale:
                {
                    format: 'DD/MM/YYYY',
                    applyLabel: 'Áp dụng',
                    cancelLabel: 'Hủy',
                },

            });

        $('.customer-drgpicker-filter-record').on('apply.daterangepicker', function (ev, picker) {
            $scope.selectedDates = $('#customerFilterByDate').val()
            $scope.getAllAppGroupByDate($scope.selectedDates, $scope.selectPatientIds, $scope.selectDoctorIds)
        });


        $('#customerFilterDoctor').on('change', function () {
            $timeout(function () {
                let selectedVals = $('#customerFilterDoctor').val()
                $scope.selectDoctorIds = processSelect2Service.processSelect2Data(selectedVals)
                $scope.getAllAppGroupByDate($scope.selectedDates, $scope.selectPatientIds, $scope.selectDoctorIds)
            });
        });
    }

    $scope.reFresh = () => {
        $scope.selectedDates = ""
        $scope.selectPatientIds = [parseInt(API.getUser().split("-")[0])]
        $scope.selectDoctorIds = []
        $scope.formPatientRecord = {
            doctorId: null,
            dateFilter: moment(new Date()).format("DD/MM/YYYY")
        }
        $('#filterDoctor').val(null).trigger('change');
        $('#filterPatient').val(null).trigger('change');
        $scope.getAllAppGroupByDate($scope.selectedDates, $scope.selectPatientIds, $scope.selectDoctorIds)
        new Noty({
            text: 'Đã làm mới dữ liệu !',
            type: 'success',
            timeout: 3000
        }).show();
    }

    $scope.isShowBtnCancel = (appointmentStatus) => {
        let checkStatus = ['đã đặt', 'đã xác nhận']
        let result = checkStatus.some(item => item == appointmentStatus.toLowerCase())
        return result
    }

    $scope.getGetCancelStatus = () => {
        $http.get(url + '/appointment-status', { headers: headers }).then(resp => {
            $scope.cancelStatus = resp.data.find((item) => item.status.toLowerCase() === 'đã hủy').appointment_StatusId
        })
    }

    $scope.cancelAppoinmnet = (appointment) => {
        let appId = appointment.appointmentId
        let aprId = appointment.appointmentPatientRecord.appointmentPatientRecordId
        let dataApr = appointment.appointmentPatientRecord
        let dataApp = appointment
        $scope.loadingStates[appId] = true
        let duRequest = $http.get(url + "/doctorUnavailability-by-appid", { params: { appId: appId }, headers: headers });
        let appServiceRequest = $http.get(url + "/appointment-service-by-appid", { params: { appId: appId }, headers: headers });
        Promise.all([duRequest, appServiceRequest]).then(([duResponse, appServiceResponse]) => {
            let duDeleteRequests = [];
            duResponse.data.forEach(du => {
                let id = du.doctorUnavailabilityId;
                duDeleteRequests.push($http.delete(url + `/soft-delete-doctorUnavailability/${id}`, { headers: headers }));
            });

            let serviceDeleteRequests = [];
            appServiceResponse.data.forEach(appService => {
                let id = appService.appointment_ServiceId;
                serviceDeleteRequests.push($http.delete(url + `/soft-delete-appointment-service/${id}`, { headers: headers }));
            });

            let appointmentPatientRecordRequest = {
                patientId: dataApr.patientId,
                createAt: dataApr.createAt,
                currentCondition: dataApr.currentCondition,
                reExamination: dataApr.reExamination,
                deleted: true,
                isDeleted: true
            };

            let aprDeleteRequest = $http.put(url + `/appointment-patient-record/${aprId}`, appointmentPatientRecordRequest, { headers: headers });

            let appointmentRequest = {
                patientId: dataApp.patient.patientId,
                appointmentPatientRecord: dataApp.appointmentPatientRecord.appointmentPatientRecordId,
                appointmentType: dataApp.appointmentType.appointment_TypeId,
                doctorId: dataApp.doctor ? dataApp.doctor.doctorId : null,
                dentalStaffId: dataApp.dentalStaff ? dataApp.dentalStaff.dentalStaffId : null,
                appointmentStatus: $scope.cancelStatus,
                appointmentDate: dataApp.appointmentDate,
                note: dataApp.note,
                createAt: dataApp.createAt,
                deleted: true,
                isDeleted: true
            };

            let appDeleteRequest = $http.put(url + `/appointment/${appId}`, appointmentRequest, { headers: headers });

            let allRequests = [...duDeleteRequests, ...serviceDeleteRequests, aprDeleteRequest, appDeleteRequest];

            Promise.all(allRequests).then(() => {
                $timeout(() => {
                    $scope.loadingStates[appId] = false
                }, 3000)

            }).then(() => {
                SocketService.getStompClient().then(function (stompClient) {
                    const message = " Lịch khám số " + appId + " đã bị hủy"
                    stompClient.send("/chatroom", {}, JSON.stringify(message));
                }).catch(function (error) {
                    console.error('Socket connection error: ' + error);
                });

                $timeout(() => {
                    new Noty({
                        text: 'Hủy cuộc hẹn thành công !',
                        type: 'success',
                        timeout: 3000
                    }).show();
                }, 3000)
            }).finally(() => {
                $timeout(() => {
                    $route.reload()
                }, 3000)
            }).catch(error => {
                console.error("Error during cancellation process:", error);
                new Noty({
                    text: 'Hủy cuộc hẹn thất bại. Vui lòng thử lại!',
                    type: 'error',
                    timeout: 3000
                }).show();
            });
        }).catch(error => {
            console.error("Error fetching initial data:", error);
            new Noty({
                text: 'Hủy cuộc hẹn thất bại. Vui lòng thử lại!',
                type: 'error',
                timeout: 3000
            }).show();
        });
    };


    $scope.getAllAppGroupByDate = (selectedDates, selectPatientIds, selectDoctorIds) => {
        let pIds = ""
        let dIds = ""
        if (selectPatientIds.length > 0) {
            pIds = selectPatientIds.join(',')
        }
        if (selectDoctorIds.length > 0) {
            dIds = selectDoctorIds.join(',')
        }
        let params = {
            startDate: selectedDates == "" ? "" : moment(selectedDates.split(' - ')[0], 'DD/MM/YYYY').format('YYYY-MM-DD'),
            endDate: selectedDates == "" ? "" : moment(selectedDates.split(' - ')[1], 'DD/MM/YYYY').format('YYYY-MM-DD'),
            patientIds: pIds,
            doctorIds: dIds
        }
        $http.get(url + '/appointment-group-by-date', { params: params }).then(response => {
            $scope.listAppGroupByDateDB = []
            for (let key in response.data) {
                if (response.data.hasOwnProperty(key)) {
                    if (response.data[key].length > 0) {
                        $scope.listAppGroupByDateDB.push([key, response.data[key]])
                    }
                }
            }
            $scope.listAppGroupByDateDB.sort((a, b) => new Date(b[0]) - new Date(a[0]))

            if ($.fn.DataTable.isDataTable('#dataTable-customer-recorded')) {
                $('#dataTable-customer-recorded').DataTable().clear().destroy();
            }
            $(document).ready(function () {
                $('#dataTable-customer-recorded').DataTable({
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

        })
    }

    $scope.getListDoctor = () => {
        $http.get(url + '/doctor').then(response => {
            $scope.listdoctorDB = response.data

        })
    }

    $scope.setupTab = (appointment) => {
        let appointmentId = appointment.appointmentId
        $scope.currentTab = -1 + '-' + appointmentId;

        $scope.selectTab = (tab, $event) => {
            $event.preventDefault()
            $scope.currentTab = tab + '-' + appointmentId
        }
        $scope.isSelected = (tab) => {
            return $scope.currentTab === tab + '-' + appointmentId
        }

        $scope.getBillByAppointment(appointmentId, $scope.listBillByAppointmentAndPatientDB)
        $scope.getPrescriptionByAppointment(appointment, $scope.listPrescriptionByAppointmentAndMedicinesDB)
    }

    $scope.getDetailsAppointment = (appointmentId) => {
        let duData = $scope.listDoctorUnavailabilityAllDoctorDB.filter(du => du.appointment.appointmentId === appointmentId)
        return duData
    };


    $scope.processDoctorUnavailabilityAllDoctor = () => {
        return new Promise((resolve, reject) => {
            $http.get(url + '/doctorUnavailability', { headers: headers }).then((response) => {
                let filteredData = response.data;
                let checkStatus = ['đã hủy', 'không đến', 'hoãn']
                filteredData = filteredData.filter(du => {
                    let stt = du.appointment.appointmentStatus
                    let isAuth = checkStatus.includes(stt ? du.appointment.appointmentStatus.status.toLowerCase() : 'đã xác nhận')
                    return (du.deleted == false) || (du.deleted == true && isAuth)
                })
                resolve(filteredData)
            }).catch((error) => reject(error))
        })
    }

    $scope.getListDoctorUnavailabilityAllDoctor = () => {
        $scope.processDoctorUnavailabilityAllDoctor().then(result => {
            $scope.listDoctorUnavailabilityAllDoctorDB = result
            $scope.listAppointmentDBFromDu = []
            let seenAppointmentIds = {}
            result.forEach(rs => {
                if (!seenAppointmentIds[rs.appointment.appointmentId]) {
                    seenAppointmentIds[rs.appointment.appointmentId] = true;
                    $scope.listAppointmentDBFromDu.push(rs.appointment);
                }
            })
        })
    }

    $scope.getBillByAppointment = (appointmentId, listBillByAppointmentAndPatientDB) => {
        $scope.bill = listBillByAppointmentAndPatientDB.filter(bill => bill.appointments.appointmentId === appointmentId)
    }

    $scope.getAllAppointmentServiceExceptDeleted = () => {
        $http.get(url + '/appointment-service-except-deleted', { headers: headers }).then(response => {
            $scope.listAPSDB = response.data
        })
    }

    $scope.getAPSByAppointment = (appointmentId, listAPSDB) => {
        let services = listAPSDB.filter(service => service.appointment.appointmentId === appointmentId)
        return services
    }

    $scope.getTotalService = (appointmentId, listAPSDB) => {
        let services = listAPSDB.filter(service => service.appointment.appointmentId === appointmentId)
        let total = services.reduce((acc, s) => acc + (s.service.price * s.quantity), 0)
        let moneyInWords = convertMoneyService.convertMoneyToWords(total)
        return [total, moneyInWords]
    }

    $scope.getBillByAppointmentAndPatient = (appointmentIdParam, patientIdParam) => {
        let params = {
            appointmentId: appointmentIdParam,
            patientId: patientIdParam
        }
        $http.get(url + '/bill-by-appointment-and-patient', { params: params, headers: headers }).then(response => {
            $scope.listBillByAppointmentAndPatientDB = response.data
        })
    }

    $scope.getPrescriptionByAppointment = (appointment, listPrescriptionByAppointmentAndMedicinesDB) => {
        let aprId = appointment.appointmentPatientRecord.appointmentPatientRecordId
        let filterData = listPrescriptionByAppointmentAndMedicinesDB.filter(item => item.prescription.appointmentPatientRecord.appointmentPatientRecordId === aprId)

        let uniqueMedicines = [];
        if (filterData.length != 0) {
            let medicines = filterData[0].medicinesList
            let prescription = filterData[0].prescription
            let prescriptionId = prescription.prescriptionId
            let filteredList = filterData[0].prescriptionMedicinesList.filter(item => item.prescription.prescriptionId === prescriptionId)


            let seenMedicineIds = new Set();
            filteredList.forEach(item => {
                if (!seenMedicineIds.has(item.medicines.medicinesId)) {
                    seenMedicineIds.add(item.medicines.medicinesId);
                    uniqueMedicines.push(item);
                }
            });

        }

        $scope.prescription = uniqueMedicines
    }

    $scope.getPrescriptionWithMedicinesByAppointment = (appointmentId) => {
        let params = {
            appointmentId: appointmentId
        }
        $http.get(url + '/prescription-by-appointment', { params: params, headers: headers }).then(response => {
            $scope.listPrescriptionByAppointmentAndMedicinesDB = response.data
        })
    }

    $scope.exportPDF = (contentId, nameDocument, idNumber) => {
        Swal.fire({
            title: 'Đang thao tác. </br> Vui lòng chờ trong giây lát !',
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            timerProgressBar: true,
            timer: 0,
            html: `<div class="loadingspinner">
                <div id="square1"></div>
                <div id="square2"></div>
                <div id="square3"></div>
                <div id="square4"></div>
                <div id="square5"></div>
            </div>`,
            onBeforeOpen: () => {
                Swal.showLoading();
            }
        });
        $timeout(() => {
            $scope.$evalAsync(() => {
                document.fonts.ready.then(() => {
                    console.log("Fonts are ready");

                    pdfMake.fonts = {
                        NimbusSans: {
                            normal: "NimbusSanL-Reg.otf",
                            bold: "NimbusSanL-Bol.otf",
                            italics: "NimbusSanL-RegIta.otf",
                            bolditalics: "NimbusSanL-BolIta.otf"
                        }
                    };

                    const pdfContent = document.getElementById(contentId);
                    if (!pdfContent) {
                        console.error('Element not found!');
                        return;
                    }



                    // Create a new element for capturing
                    const tempElement = document.createElement('div');
                    tempElement.innerHTML = pdfContent.innerHTML;
                    tempElement.style.position = 'absolute';
                    tempElement.style.left = '0px';
                    tempElement.style.top = '0px';
                    tempElement.style.width = '1000px';
                    tempElement.style.height = 'auto';
                    tempElement.style.visibility = 'visible';
                    tempElement.style.background = 'white';
                    document.body.appendChild(tempElement);

                    // Force reflow
                    tempElement.offsetHeight;

                    // Wait for images to load
                    const images = tempElement.getElementsByTagName('img');
                    const imagePromises = Array.from(images).map(img => {
                        if (img.complete) return Promise.resolve();
                        return new Promise(resolve => {
                            img.onload = img.onerror = resolve;
                        });
                    });

                    Promise.all(imagePromises).then(() => {

                        html2canvas(tempElement, {
                            useCORS: true,
                            logging: true,
                            allowTaint: true,
                            scale: 2,
                            width: 1000,
                            height: tempElement.offsetHeight
                        }).then(function (canvas) {
                            const imgData = canvas.toDataURL('image/png')

                            if (imgData === 'data:,') {
                                console.error('Canvas is empty');
                                return;
                            }

                            const documentDefinition = {
                                content: [
                                    {
                                        image: imgData,
                                        width: 600,
                                        style: {
                                            alignment: "center"
                                        }
                                    }
                                ],
                                defaultStyle: {
                                    font: "NimbusSans"
                                },
                                pageSize: "A4",
                                pageOrientation: "landscape",
                                pageMargins: [40, 60, 40, 60]
                            };

                            pdfMake.createPdf(documentDefinition).download(nameDocument + "_" + idNumber + "_export.pdf");

                        }).catch(function (error) {
                            console.error("Error generating PDF:", error);
                        }).finally(() => {
                            document.body.removeChild(tempElement);
                            Swal.close()
                        });
                    });
                });
            });
        }, 3000)
    };

    $scope.initData()
    $scope.getGetCancelStatus()
    $scope.getAllAppointmentServiceExceptDeleted()
});
