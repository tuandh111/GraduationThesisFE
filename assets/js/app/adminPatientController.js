app.controller('AdminPatientController', function ($scope, $http, $rootScope, $location, $timeout, API, adminBreadcrumbService, processSelect2Service, convertMoneyService) {
    let url = API.getBaseUrl();
    let headers = API.getHeaders();
    adminBreadcrumbService.generateBreadcrumb()

    $scope.initData = () => {
        $scope.listMedicalHistoriesDetailDB = [];
        $scope.listMedicalHistoriesOfPatient = [];
        $scope.listBillByAppointmentAndPatientDB = [];
        $scope.listPrescriptionByAppointmentAndMedicinesDB = [];
        $scope.listDoctorUnavailabilityAllDoctorDB = []
        $scope.isUpdatePatient = false
        $scope.isLoadingCreate = false
        $scope.isLoadingUpdate = false
        $scope.formPatient = {
            patientId: -1,
            fullName: "",
            citizenIdentificationNumber: "",
            phoneNumber: "",
            gender: "",
            imageURL: "",
            birthday: new Date("1/01/1999"),
            deleted: false
        }
    }
    $scope.getDetailsAppointment = (appointmentId) => {
        let duData = $scope.listDoctorUnavailabilityAllDoctorDB.filter(du => du.appointment.appointmentId === appointmentId)

        return duData
    };
    $scope.processDoctorUnavailabilityAllDoctor = () => {
        return new Promise((resolve, reject) => {
            $http.get(url + '/doctorUnavailability', { headers: headers }).then((response) => {
                let filteredData = response.data;
                console.log("---------------------------------------------------------------------")
                console.log(filteredData)
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

    $scope.getListDoctorUnavailabilityAllDoctor = async () => {
        await $scope.processDoctorUnavailabilityAllDoctor().then(result => {
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
    $scope.initUI = () => {
        $timeout(() => {
            $('.select2').select2(
                {
                    theme: 'bootstrap4',
                    placeholder: '---Chọn giới tính---',
                    allowClear: true
                }).val(null).trigger('change');
            $('.select2-multi').select2(
                {
                    multiple: true,
                    theme: 'bootstrap4',
                    placeholder: '---Chọn tiền sử bệnh---'
                }).val(null).trigger('change');
        }, 1000)

        $('#managePatientsModalMedicalHistory').on('change', function () {
            $timeout(function () {
                let selectedVals = $('#managePatientsModalMedicalHistory').val()
                $scope.medicalHistoriesSelections = processSelect2Service.processSelect2Data(selectedVals)
                console.log("$scope.medicalHistoriesSelections", $scope.medicalHistoriesSelections);
            });
        });

        $('#managePatientsModalpatientsGender').on('change', function () {
            $timeout(function () {
                $scope.formPatient.gender = $('#managePatientsModalpatientsGender').val();
            });
        });
    }

    $scope.createMedicalHistoryDetails = (patientId, medicalHistoryDetailId) => {
        $scope.formMedicalHistoryDetail = {
            medicalHistoryDetailId: -1,
            patientId: patientId,
            medicalHistoryId: medicalHistoryDetailId,
        };
        var requestMedicalHistoryDetailJSON = angular.toJson($scope.formMedicalHistoryDetail)
        $http.post(url + '/medical-history-detail', requestMedicalHistoryDetailJSON, { headers: headers })
    }

    $scope.getListMedicalHistoriesDetail = () => {
        $http.get(url + "/medical-history-detail-except-deleted", { headers: headers }).then(response => {
            $scope.listMedicalHistoriesDetailDB = response.data
            console.log(" $scope.listMedicalHistoriesDetailDB", $scope.listMedicalHistoriesDetailDB);
        }).catch(err => {
            new Noty({
                text: 'Đã xảy ra lỗi!',
                type: 'error',
                timeout: 3000
            }).show();
        })
    };

    $scope.historyTreatmentPatient = function (p, $event) {
        $event.preventDefault();

        $scope.getAllAppGroupByDate(p.patientId);

        $('#treatmentHistoryModal').modal('show');
    };

    $scope.getAllAppGroupByDate = (patientId) => {
        let pIds = patientId;

        let params = {
            startDate: "",
            endDate: "",
            patientIds: pIds,
            doctorIds: ""
        }
        $http.get(url + '/appointment-group-by-date', { params: params }, { headers: headers }).then(response => {
            $scope.listAppGroupByDateDB = []
            for (let key in response.data) {
                if (response.data.hasOwnProperty(key)) {
                    if (response.data[key].length > 0) {
                        $scope.listAppGroupByDateDB.push([key, response.data[key]])
                    }
                }
            }
            $scope.listAppGroupByDateDB.sort((a, b) => new Date(b[0]) - new Date(a[0]))

            console.log("data: ", $scope.listAppGroupByDateDB);


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

    $scope.setupTab = async (appointment) => {

        let appointmentId = appointment.appointmentId

        let patientId = appointment.patient.patientId
        $scope.currentTab = -1 + '-' + appointmentId;
        $scope.selectTab = (tab, $event) => {
            $event.preventDefault()
            $scope.currentTab = tab + '-' + appointmentId
        }
        $scope.isSelected = (tab) => {
            return $scope.currentTab === tab + '-' + appointmentId
        }

        await $scope.getListDoctorUnavailabilityAllDoctor()
        await $scope.getDetailsAppointment(appointmentId)
        await $scope.getBillByAppointmentAndPatient(appointmentId, patientId)
        await $scope.getAllAppointmentServiceExceptDeleted()
        await $scope.getBillByAppointment(appointmentId, $scope.listBillByAppointmentAndPatientDB)
        await $scope.getPrescriptionWithMedicinesByAppointment(appointmentId)
        await $scope.getPrescriptionByAppointment(appointment, $scope.listPrescriptionByAppointmentAndMedicinesDB)
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
    $scope.getAllAppointmentServiceExceptDeleted = () => {
        $http.get(url + '/appointment-service-except-deleted', { headers: headers }).then(response => {
            $scope.listAPSDB = response.data
        })
    }


    $scope.getBillByAppointment = (appointmentId, listBillByAppointmentAndPatientDB) => {
        $scope.bill = listBillByAppointmentAndPatientDB.filter(bill => bill.appointments.appointmentId === appointmentId)
        console.log("Bill" + listBillByAppointmentAndPatientDB)
    }

    $scope.getBillByAppointmentAndPatient = (appointmentIdParam, patientIdParam) => {
        return new Promise((resolve, reject) => {
            let params = {
                appointmentId: appointmentIdParam,
                patientId: patientIdParam
            };
            console.log(params);
            $http.get(url + '/bill-by-appointment-and-patient', { params: params, headers: headers })
                .then(response => {
                    $scope.listBillByAppointmentAndPatientDB = response.data;
                    console.log("OK" + response.data);
                    resolve(response.data);
                })
                .catch(error => {
                    reject(error);
                });
        });
    };


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
        return new Promise((resolve, reject) => {
            let params = {
                appointmentId: appointmentId
            };

            $http.get(url + '/prescription-by-appointment', { params: params, headers: headers })
                .then(response => {
                    $scope.listPrescriptionByAppointmentAndMedicinesDB = response.data;
                    resolve(response.data);
                })
                .catch(error => {
                    reject(error);  // Từ chối promise nếu có lỗi
                });
        });
    };



    $scope.showMedicalHistories = (patientId) => {
        const result = $scope.listMedicalHistoriesDetailDB.filter(item => {
            if (item.patient != null) {
                return item.patient.patientId === patientId;
            }
        }
        );
        return result;
    };

    $scope.showMedicalHistoryOfPatient = (patientId) => {
        const result = $scope.listMedicalHistoriesDetailDB.filter(item => {
            if (item.patient != null) {
                return item.patient.patientId === patientId;
            }
        });
        result.forEach(item => {
            if (item.medicalHistory) {
                $scope.listMedicalHistoriesOfPatient.push(item.medicalHistory);
            }
        });
        console.table($scope.listMedicalHistoriesOfPatient);
    };

    $scope.listGenderTypeDB = [
        { genderId: 'MALE', genderName: 'Nam' },
        { genderId: 'FEMALE', genderName: 'Nữ' },
        { genderId: 'UNISEX', genderName: 'Khác' }
    ];

    $scope.getMedicalHistories = function () {
        $http.get(url + '/medical-history', { headers: headers }).then(function (response) {
            $scope.listMedicalHistoryDB = response.data;
        }, function (error) {
            console.error('Error fetching medical histories:', error);
        });

    };

    $scope.getGenderText = function (gender) {
        switch (gender) {
            case 'MALE':
                return 'Nam';
            case 'FEMALE':
                return 'Nữ';
            case 'OTHER':
                return 'Khác';
            default:
                return '';
        }
    };

    $scope.formatDate = function (date) {
        var d = new Date(date);
        if (isNaN(d.getTime())) return '';
        var day = ('0' + d.getDate()).slice(-2);
        var month = ('0' + (d.getMonth() + 1)).slice(-2);
        var year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    $scope.getListPatient = () => {
        $http.get(url + '/patient-except-deleted', { headers: headers }).then(respone => {
            $scope.listPatientDB = respone.data
            if ($.fn.DataTable.isDataTable('#dataTable-list-patient')) {
                $('#dataTable-list-patient').DataTable().clear().destroy();
            }
            $(document).ready(function () {
                $('#dataTable-list-patient').DataTable({
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

    $scope.crudPatient = () => {
        var currentDate = new Date();
        $scope.formPatient = {
            patientId: -1,
            fullName: '',
            Type: '',
            CitizenIdentificationNumber: '',
            phoneNumber: '',
            gender: '',
            birthday: new Date("01/01/1999"),
            imageURL: 'abc.jpg',
            deleted: false
        };

        $scope.formMedicalHistoryDetail = {
            medicalHistoryDetailId: -1,
            patientId: '',
            medicalHistoryId: '',
        };

        $scope.medicalHistoriesSelections = []

        $scope.validationForm = () => {
            var valid = false;
            $scope.processSelect2Data = () => {
                if (typeof $scope.formPatient.gender === 'string' && $scope.formPatient.gender.includes(':')) {
                    $scope.formPatient.gender = $scope.formPatient.gender.split(':')[1];
                }
            };

            if ($scope.formPatient.fullName == "" || $scope.formPatient.fullName == null) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng nhập họ tên!",
                    icon: "error"
                });
            } else if ($scope.formPatient.phoneNumber == "") {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng nhập số điện thoại!",
                    icon: "error"
                });
            } else if ($scope.formPatient.gender == "" || $scope.formPatient.gender == null) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng chọn giới tính!",
                    icon: "error"
                });
            } else if ($scope.formPatient.citizenIdentificationNumber == "" || $scope.formPatient.citizenIdentificationNumber == null) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Vui lòng nhập số CMND/CCCD!",
                    icon: "error"
                });
            } else {
                $scope.processSelect2Data();
                valid = true;
            }
            return valid;
        };

        $scope.editPatient = (patient, $event) => {
            $event.preventDefault()
            $scope.isUpdatePatient = true
            if (patient != null) {
                $scope.formPatient = {
                    patientId: patient.patientId,
                    fullName: patient.fullName,
                    citizenIdentificationNumber: patient.citizenIdentificationNumber,
                    phoneNumber: patient.phoneNumber,
                    gender: patient.gender,
                    imageURL: patient.imageURL,
                    birthday: new Date(patient.birthday),
                    deleted: false
                }
            }

            $scope.showMedicalHistoryOfPatient(patient.patientId)
            const firstTabButtonCreate = document.getElementById('form-tab-patient');
            firstTabButtonCreate.click();
            var element = document.getElementById('managePatientsModalMedicalHistory');
            element.disabled = true;
        }

        $scope.createPatient = () => {
            if ($scope.formPatient.patientId != -1) {
                new Noty({
                    text: 'Thông tin đã có trên hệ thống !',
                    type: 'error',
                    timeout: 3000
                }).show();
                return
            }
            var valid = $scope.validationForm()
            if (valid) {
                $scope.isLoadingCreate = true
                var requestPatientJSON = angular.toJson($scope.formPatient)
                $http.post(url + '/patient', requestPatientJSON).then(response => {
                    var idpatient = response.data.patientId;
                    $scope.medicalHistoriesSelections.forEach(element => {
                        $scope.createMedicalHistoryDetails(idpatient, element);
                    });
                    $timeout(() => {
                        $scope.isLoadingCreate = false
                    }, 3000)
                }).finally(() => {
                    $timeout(() => {
                        new Noty({
                            text: 'Thêm bệnh nhân thành công!',
                            type: 'success',
                            timeout: 3000
                        }).show();
                        $scope.resetForm()
                        $scope.getListPatient()
                        const secondTabButtonCreate = document.getElementById('list-tab-patient');
                        secondTabButtonCreate.click();
                    }, 3000)
                }).catch(err => {
                    new Noty({
                        text: 'Thêm bệnh nhân thất bại!',
                        type: 'error',
                        timeout: 3000
                    }).show();
                });
            }
        }
        $scope.updatePatient = () => {
            if ($scope.formPatient.patientId == -1) {
                new Noty({
                    text: 'Thông tin chưa có trên hệ thống !',
                    type: 'error',
                    timeout: 3000
                }).show();
                return
            }
            var valid = $scope.validationForm()
            if (valid) {
                $scope.isLoadingUpdate = true
                var requestPatientJSON = angular.toJson($scope.formPatient)
                var patientId = $scope.formPatient.patientId
                $http.put(url + '/patient/' + patientId, requestPatientJSON, { headers: headers }).then(response => {
                    $timeout(() => {
                        $scope.isLoadingUpdate = false
                    }, 3000)

                }).finally(() => {
                    $timeout(() => {
                        new Noty({
                            text: 'Cập nhật thành công!',
                            type: 'success',
                            timeout: 3000
                        }).show();
                        $scope.resetForm()
                        $scope.getListPatient()
                        const secondTabButtonCreate = document.getElementById('list-tab-patient');
                        secondTabButtonCreate.click();
                    }, 3000)
                }).catch(err => {
                    new Noty({
                        text: 'Cập nhật thất bại!',
                        type: 'error',
                        timeout: 3000
                    }).show();
                })
            }
        }

        $scope.deletePatient = (patient, $event) => {
            $event.preventDefault()
            var patientId = patient.patientId
            Swal.fire({
                text: "Bạn có muốn xóa Bệnh nhân " + patient.fullName + " ?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                cancelButtonText: 'Trở lại',
                confirmButtonText: 'Có'
            }).then(rs => {
                if (rs.isConfirmed) {
                    $http.delete(url + '/soft-delete-patient/' + patientId, { headers: headers }).then(response => {
                        new Noty({
                            text: 'Xóa thành công!',
                            type: 'success',
                            timeout: 3000
                        }).show();
                        $scope.getListPatient()
                    }).catch(err => {
                        new Noty({
                            text: 'Xóa thất bại!',
                            type: 'error',
                            timeout: 3000
                        }).show();
                    })
                }
            })
        }

        $scope.resetForm = () => {
            $scope.initData()
            $scope.formMedicalHistoryDetail = {
                medicalHistoryDetailId: -1,
                patientId: '',
                medicalHistoryId: '',
            };
            $scope.medicalHistoriesSelections = []
            $scope.getMedicalHistories();
            $scope.getListMedicalHistoriesDetail();
            var element = document.getElementById('managePatientsModalMedicalHistory');
            element.disabled = false;
        }
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
    $scope.getMedicalHistories();
    $scope.initUI()
    $scope.getListMedicalHistoriesDetail();
    $scope.crudPatient();
    $scope.getListPatient()
    $scope.initData()
})


