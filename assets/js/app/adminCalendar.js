app.controller('AdminCalendar', function ($scope, $http, SocketService, $rootScope, $location, $timeout, processSelect2Service, TimezoneService, $route, convertMoneyService, API, adminBreadcrumbService) {
    let url = API.getBaseUrl();
    let headers = API.getHeaders();
    adminBreadcrumbService.generateBreadcrumb()
    //code here
    const defaultTimezone = "Asia/Ho_Chi_Minh"
    let dentalStaff = API.getUser() ? parseInt(API.getUser().split("-")[0]) : null

    $scope.listServiceByDentalIssuesDB = []
    $scope.listServiceByDentalIssuesDBUp = []
    $scope.listDoctorDB = []
    $scope.listAppointmentDB = []
    $scope.listTimeOfShiftByRangeTimeDB = []
    $scope.listDuDB = []
    $scope.selectedServices = []
    $scope.selectedServicesUp = []
    $scope.arrSelectedTemp = []
    $scope.selectedTimeOfShift = []
    $scope.selectedTimeOfShiftUp = []
    $scope.listTOS = []
    $scope.listTOSFilter = []
    $scope.showFormRegister = false
    $scope.disableContinue = false
    $scope.isSelectCalendar = false
    $scope.validAppointmentType = true
    $scope.isUpdate = false
    $scope.isShowFormResult = false
    $scope.isValidServiceUp = false
    $scope.showNextStepUp = false
    $scope.originalAppointment = []
    $scope.originalAPR = []
    $scope.originalDU = []
    $scope.originalAS = []
    $scope.listAppByPatientDB = []
    $scope.fullCalendarDate = new Date()
    $scope.validStatus = ""
    $scope.validDateByPatient = ""
    $scope.isSelectByService = false
    $scope.isSelectByServiceUp = false
    $scope.isLoadingCreate = false
    $scope.listDentalIssueDB=[]
    //List appointment
    $scope.selectedDatesLApp = []
    $scope.selectedDoctorLApp = []
    $scope.selectedPatientLApp = []
    $scope.selectedStatusLApp = []
    $scope.isReExaminationFilter = false
    $scope.listBillByAppointmentAndPatientDB = []
    $scope.listPrescriptionByAppointmentAndMedicinesDB = []

    $scope.appointmentIdParam = null
    $scope.patientIdParam = null
    $scope.listAPSDB = []
    $scope.formPatientRecord = {
        patientId: null,
        doctorId: null
    }

    $scope.formAppoinmentFilter = {
        appointment_StatusId: null,
        patientId: null,
        doctorId: null,
        filterDateLapp: moment().format("DD/MM/YYYY")
    }

    $scope.initReExaminationDate = [
        { value: 5, checked: false },
        { value: 15, checked: false },
        { value: 30, checked: false },
    ]

    $scope.formApp = {
        appointmentDate: moment(new Date).format('DD/MM/YYYY'),
        doctorId: -1,
        title: '',
        appointmentTypeId: null,
        patientId: null,
        notes: '',
        fullName: "",
        startTime: "",
        endTime: "",
        dentalIssuesId: null
    }
    $scope.formUpApp = {
        reExaminationDate: moment(new Date).format('DD/MM/YYYY'),
        currentCondition: "",
        appointmentDate: moment(new Date).format('DD/MM/YYYY'),
        fullName: "",
        startTime: "",
        endTime: "",
        patientId: "",
        appointmentStatus: "",
        appointmentTypeId: "",
        deleted: false,
        quantity: 1,
        isReExamination: false
    }

    $scope.initDataRequest = (isUpdate) => {
        let fa = $scope.formApp
        let fu = $scope.formUpApp

        $scope.appointmentPatientRecordRequest = {
            patientId: isUpdate ? fu.patientId : fa.patientId,
            createAt: isUpdate ? fu.createDate : TimezoneService.convertToTimezone(moment(new Date()), defaultTimezone),
            currentCondition: isUpdate ? fu.currentCondition : fa.notes,
            reExamination: isUpdate ? fu.reExaminationDate : "",
            deleted: isUpdate ? fu.deleted : false,
            isDeleted: isUpdate ? fu.deleted : false
        }

        $scope.appointmentRequest = {
            patientId: isUpdate ? fu.patientId : fa.patientId,
            appointmentPatientRecord: isUpdate ? $scope.originalAPR.appointmentPatientRecordId : -1,
            appointmentType: isUpdate ? fu.appointmentTypeId : fa.appointmentTypeId,
            doctorId: isUpdate ? fu.doctorId : fa.doctorId,
            dentalStaffId: dentalStaff,
            appointmentStatus: isUpdate ? fu.appointmentStatus : fa.appointmentStatus,
            appointmentDate: TimezoneService.convertToTimezone(moment(isUpdate ? fu.appointmentDate : fa.appointmentDate, "DD/MM/YYYY"), defaultTimezone),
            note: isUpdate ? $scope.originalAppointment.note : fa.notes,
            createAt: isUpdate ? fu.createDate : TimezoneService.convertToTimezone(moment(new Date()), defaultTimezone),
            deleted: isUpdate ? fu.deleted : false,
            isDeleted: isUpdate ? fu.deleted : false
        }

    }



    $scope.isShowService = (isUpdate) => {
        return isUpdate ? $scope.listServiceByDentalIssuesDBUp.length > 0 : $scope.listServiceByDentalIssuesDB.length > 0
    }


    $scope.isContinueShow = () => {
        return $scope.selectedServices.length > 0
    }

    $scope.isShowFormRegister = ($event) => {
        $event.preventDefault()
        $scope.showFormRegister = true
    }

    $scope.updateSelectedServices = (service, isUpdate) => {
        const updateServiceList = (service, list) => {
            if (service.checked) {
                list.push(service);
            } else {
                const index = list.findIndex(s => s.serviceId === service.serviceId);
                if (index !== -1) {
                    list.splice(index, 1);
                }
            }
        };

        if (isUpdate) {
            updateServiceList(service, $scope.selectedServicesUp);
        }
        updateServiceList(service, $scope.selectedServices);
    }

    $scope.toggleAll = (isUpdate) => {
        const toggleSelectAll = (selectAllId, listServiceDB, selectedServices) => {
            const selectAll = document.getElementById(selectAllId).checked;
            $scope[selectedServices] = listServiceDB.filter(service => {
                service.checked = selectAll;
                return selectAll;
            });
        };

        if (isUpdate) {
            toggleSelectAll('selectAllUp', $scope.listServiceByDentalIssuesDBUp, 'selectedServicesUp');
        }
        toggleSelectAll('selectAll', $scope.listServiceByDentalIssuesDB, 'selectedServices');
    }

    $scope.toggleCheckbox = function ($event, service, isUpdate) {
        $event.stopPropagation();
        service.checked = !service.checked;
        $scope.updateSelectedServices(service, isUpdate);
    }

    $scope.getTotalPrice = () => {
        return $scope.selectedServices.reduce((total, service) => total + service.price, 0)
    }

    $scope.getTotalTime = () => {
        return $scope.selectedServices.reduce((total, service) => total + service.timeEstimate, 0)
    }

    $scope.recommendShifts = (getTotalTime) => {
        if (getTotalTime <= 40) {
            return 1;
        } else if (getTotalTime <= 70) {
            return 2;
        } else if (getTotalTime <= 100) {
            return 3;
        } else {
            return 4;
        }
    }

    $scope.getRecommendation = () => {
        const totalTime = $scope.getTotalTime()
        const recommendation = $scope.recommendShifts(totalTime)
        return recommendation
    };

    $scope.getAllDentalIssuesExceptDeleted = () => {
        $http.get(url + '/dental-issues-except-deleted', { headers: headers }).then(response => {
            $scope.listDentalIssueDB = response.data
        })
    }

    $scope.getAllDentalIssuesExceptDeletedUp = () => {
        $http.get(url + '/dental-issues-except-deleted', { headers: headers }).then(response => {
            $scope.listDentalIssueDBUp = response.data
        })
    }

    $scope.getServiceByDentalIssues = (dentalIssuesIds) => {
        let ids = dentalIssuesIds.join(',')
        let params = {
            ids: ids
        }
        $http.get(url + '/service-by-dental-issues', { params: params, headers: headers }).then(response => {
            $scope.listServiceByDentalIssuesDB = response.data
        })
    }

    $scope.getServiceByDentalIssuesUp = (dentalIssuesIds) => {
        let ids = dentalIssuesIds.join(',')
        let params = {
            ids: ids
        }
        $http.get(url + '/service-by-dental-issues', { params: params, headers: headers }).then(response => {
            $scope.listServiceByDentalIssuesDBUp = response.data.map(service => {
                if (service.quantity === undefined || service.quantity === null) {
                    service.quantity = 1
                }
                return service;
            });
        })
    }

    $scope.getListAppointmentType = () => {
        $http.get(url + '/appointment-type', { headers: headers }).then(respone => {
            let allOptions = {
                appointment_TypeId: null,
                typeName: '---Chọn loại ca khám ---'
            }
            $scope.listAppointmentTypeDB = respone.data
            $scope.listAppointmentTypeDB.unshift(allOptions);
        }).catch(err => {
            console.log("Error", err);
        })
    }

    $scope.getListPatient = () => {
        $http.get(url + '/patient-except-deleted').then(response => {
            let allOptions = {
                patientId: null,
                fullName: '---Chọn bệnh nhân ---'
            }
            $scope.listPatientDB = response.data
            $scope.listPatientDB.unshift(allOptions);
        })
    }

    $scope.getListPatientFilter = () => {
        $http.get(url + '/patient-except-deleted').then(response => {
            let allOptions = {
                patientId: null,
                fullName: '---Tất cả ---'
            }
            $scope.listPatientDBFilter = response.data
            $scope.listPatientDBFilter.unshift(allOptions);
        })
    }

    $scope.getListAppointmentStatus = () => {
        $http.get(url + '/appointment-status-except-deleted', { headers: headers }).then(resp => {
            $scope.listAppointmentStatusBD = resp.data
            $scope.formApp.appointmentStatus = $scope.listAppointmentStatusBD.find((item) => item.status.toLowerCase() === 'đã xác nhận').appointment_StatusId
        })
    }

    $scope.getListAppointmentStatusFilter = () => {
        $http.get(url + '/appointment-status-except-deleted', { headers: headers }).then(resp => {
            let allOptions = {
                appointment_StatusId: null,
                status: "---Tất cả---",
                description: "Tất cả trạng thái",
                deleted: false
            }
            $scope.listAppointmentStatusBDFilter = resp.data
            $scope.listAppointmentStatusBDFilter.unshift(allOptions)

        })
    }

    $scope.getListAppointmentStatusUp = () => {
        $http.get(url + '/appointment-status-except-deleted', { headers: headers }).then(resp => {
            $scope.listAppointmentStatusBDUp = resp.data
            $scope.listAppointmentStatusBDUp = resp.data.filter(item => item.status.toLowerCase() !== 'hoàn thành');
        })
    }


    $scope.getListAppointment = () => {
        $http.get(url + '/appointment', { headers: headers }).then(resp => {
            $scope.listAppointmentDB = resp.data
            const today = moment(new Date()).format('YYYY-MM-DD');
            const past = moment(today).subtract(1, 'days').format('YYYY-MM-DD');

            $scope.listAppointmentDBToday = $scope.listAppointmentDB.filter(app => app.createAt === today)
            $scope.listAppointmentDBPast = $scope.listAppointmentDB.filter(app => app.createAt === past)

            let todayLength = $scope.listAppointmentDBToday.length
            let pastLength = $scope.listAppointmentDBPast.length
            let caculator = ((todayLength - pastLength) / (pastLength == 0 ? 1 : pastLength)) * 100

            $scope.appFluctuate = Math.round(caculator);
            $scope.appFluctuate = parseFloat($scope.appFluctuate.toFixed(2))
        })
    }

    $scope.getListAppointmentBySatus = (listAppointmentDB, st) => {

        if (listAppointmentDB.length === 0) {
            return 0;
        } else {
            let filteredData = listAppointmentDB.filter(app => {
                return app.appointmentStatus && app.appointmentStatus.appointment_StatusId === st.appointment_StatusId
            });
            let percent = (filteredData.length / listAppointmentDB.length) * 100;
            return [st.status, Math.round(percent), filteredData.length];
        }
    }

    $scope.getAllDoctorUnavailabilityExceptDeleted = () => {
        $http.get(url + '/doctorUnavailability-except-deleted', { headers: headers }).then(response => {
            $scope.listDuDB = response.data
        })
    }

    $scope.getListDoctorSchedule = (date) => {
        let dateRequest = {
            date: moment(date, "DD/MM/YYYY").format("YYYY-MM-DD")
        }
        $http.get(url + '/doctor-schedule-by-date', { params: dateRequest, headers: headers }).then(response => {
            let doctorMap = new Map();
            response.data.forEach(d => {
                if (d.doctor) {
                    doctorMap.set(d.doctor.doctorId, d.doctor);
                }
            });

            // Chuyển Map thành mảng
            $scope.doctorDB = Array.from(doctorMap.values());
            $scope.shiftDB = (doctorId) => {
                let shift = response.data
                    .filter(item => item.doctor && item.doctor.doctorId === doctorId)
                    .map(item => item.shift);
                shift.sort((a, b) => a.shiftId - b.shiftId)
                return shift
            }
        })
    }

    $scope.getDoctorScheduleShiftsExcludingDeleted = (date, doctorId) => {
        let params = {
            date: date,
            doctorId: doctorId
        }
        return new Promise((resolve, reject) => {
            $http.get(url + '/get-doctor-shifts-excluding-deleted', { params: params, headers: headers }).then(response => {
                resolve(response.data)
            }).catch(err => reject(err))
        })
    }

    $scope.getAllDoctorScheduleExceptDeleted = () => {
        return new Promise((resolve, reject) => {
            // /doctor-schedule-and-tos
            $http.get(url + '/doctor-schedule-except-deleted', { headers: headers }).then(response => {
                resolve(response.data)
            }).catch(err => reject(err))
        })
    }

    $scope.getTimeOfShiftByShiftId = (shiftId) => {
        return new Promise((resolve, reject) => {
            $http.get(url + '/time-of-shift-by-shift-id/' + shiftId, { headers: headers }).then(response => {
                resolve(response.data)
            }).catch(err => reject(err))
        })
    }

    $scope.getTimeOfShiftAvailable = (shiftId, dateSelected, doctorId) => {
        let convertedDate = TimezoneService.convertToTimezone(dateSelected, defaultTimezone)
        let params = {
            shiftId: shiftId,
            date: convertedDate,
            doctorId: doctorId
        }
        return $http.get(url + '/time-of-shift-available', { params: params, headers: headers }).then(response => {
            return response.data
        }).catch(error => {
            console.log("Error: " + error)
            throw error
        })
    }

    $scope.getAllTimeOfShiftDetails = (shiftId, dateSelected, doctorId) => {
        let convertedDate = TimezoneService.convertToTimezone(dateSelected, defaultTimezone)
        let params = {
            shiftId: shiftId,
            date: convertedDate,
            doctorId: doctorId
        }
        return $http.get(url + '/time-of-shift-details', { params: params, headers: headers }).then(response => {
            return response.data
        }).catch(error => {
            console.log("Error: " + error)
            throw error
        })
    }

    $scope.comparasionDate = (selectDate) => {
        let date = new Date();
        date.setHours(0, 0, 0, 0);
        if (!(selectDate instanceof Date)) {
            selectDate = new Date(selectDate);
        }
        selectDate.setHours(0, 0, 0, 0);

        return selectDate.getTime() === date.getTime();
    }

    $scope.getCurrentTimeInSeconds = () => {
        let now = new Date();
        return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    }

    $scope.timeStringToSeconds = (timeString) => {
        let [hours, minutes, seconds] = timeString.split(':').map(Number);
        return hours * 3600 + minutes * 60 + (seconds || 0);
    }

    $scope.isShiftAvailable = (timeOfShiftId) => {
        let checkData = $scope.listTOSFilter.filter(tos => tos[1].timeOfShiftId === timeOfShiftId)
        return checkData.length > 0 // trống lịch
    }

    $scope.isCheckTos = (timeOfShiftId, doctorId) => {
        return $scope.originalDU.some(oDu => oDu.timeOfShift.timeOfShiftId === timeOfShiftId && oDu.appointment.doctor.doctorId === doctorId)
    }


    $scope.isTimeLess = (tos, isUpdate) => {
        let timeLess = true
        let dateSelected = moment($scope.formApp.appointmentDate, "DD/MM/YYYY").toDate()
        if (isUpdate) {
            dateSelected = moment($scope.formUpApp.appointmentDate, "DD/MM/YYYY").toDate()
        }
        if ($scope.comparasionDate(dateSelected)) {
            let currentTimeInSeconds = $scope.getCurrentTimeInSeconds()
            let beginTimeInSeconds = $scope.timeStringToSeconds(tos.beginTime) + 600
            if (beginTimeInSeconds > currentTimeInSeconds) {
                timeLess = false
            }
        } else {
            timeLess = false
        }
        return timeLess
    }

    $scope.showBaseInAppStatus = (orginalAppointment) => {
        let status = orginalAppointment.status.toLowerCase()
        let validStatus = false
        switch (status) {
            case "đã xác nhận":
            case "đã đặt":
                validStatus = true
            default:
                validStatus = false
        }
        return validStatus
    }

    $scope.getOriginalData = (appointmentId) => {
        let params = {
            appId: appointmentId
        }
        let getAppointmentPromise = $http.get(url + '/appointment-id/' + appointmentId, { headers: headers }).then((response) => {
            $scope.originalAppointment = response.data
            $scope.originalAPR = response.data.appointmentPatientRecord
        })
        let getOriginalDUPromise = $http.get(url + '/doctorUnavailability-by-appid', { params: params, headers: headers }).then((response) => {
            let checkStatus = ['đã hủy', 'không đến', 'hoãn']
            $scope.originalDU = response.data.filter(du => {
                let stt = du.appointment.appointmentStatus
                let isAuth = checkStatus.includes(stt ? du.appointment.appointmentStatus.status.toLowerCase() : 'đã xác nhận')
                return (du.deleted == false) || (du.deleted == true && isAuth)
            })
        })
        let getOriginalASPromise = $http.get(url + '/appointment-service-by-appid', { params: params, headers: headers }).then((response) => {
            $scope.originalAS = response.data
        })

        Promise.all([getAppointmentPromise, getOriginalDUPromise, getOriginalASPromise])
    }

    $scope.setupTab = () => {
        $scope.currentTab = { shiftId: -1, doctorId: -1 }

        $scope.selectTab = (shiftId, doctorId, $event, isUpdate) => {
            let dateSelected = moment($scope.formApp.appointmentDate, "DD/MM/YYYY").toDate();
            if (isUpdate) {
                dateSelected = moment($scope.formUpApp.appointmentDate, "DD/MM/YYYY").toDate();
                $scope.formUpApp.doctorId = doctorId
            }
            $scope.formApp.doctorId = doctorId
            $event.preventDefault();
            $scope.currentTab = { shiftId: shiftId, doctorId: doctorId }

            $scope.getAllTimeOfShiftDetails(shiftId, dateSelected, doctorId).then(result => {
                $scope.listTOS = result
            })

            $scope.getTimeOfShiftAvailable(shiftId, dateSelected, doctorId).then(data => {
                $scope.listTOSFilter = data
            })
        }

        $scope.isSelected = (shiftId, doctorId) => {
            return $scope.currentTab.shiftId === shiftId && $scope.currentTab.doctorId === doctorId;
        }
    }

    $scope.onChangeTimeOfShift = (tos, isUpdate, doctorId) => {
        let item = [tos, doctorId]
        const findDoctor = (doctorId) => {
            return $scope.arrSelectedTemp.some(item => item[1] === doctorId)
        }

        if (tos.checked) {
            if ($scope.arrSelectedTemp.length > 0) {
                let isAuth = findDoctor(doctorId)
                if (!isAuth) {
                    $scope.arrSelectedTemp = []
                }
            }
            $scope.arrSelectedTemp.push(item)
        } else {
            let index = $scope.arrSelectedTemp.findIndex(item => item[0].timeOfShiftId === tos.timeOfShiftId)
            if (index !== -1) {
                $scope.arrSelectedTemp.splice(index, 1)
            }
        }

        $scope.selectedTimeOfShift = [];
        $scope.selectedTimeOfShiftUp = [];

        if ($scope.arrSelectedTemp.length > 0) {

            $scope.arrSelectedTemp.forEach(item => {
                if (isUpdate) {
                    $scope.selectedTimeOfShiftUp.push(item[0]);
                }
                $scope.selectedTimeOfShift.push(item[0]);
            });
        }

    }

    $scope.onChangeReExaminationDate = (number) => {
        let currentDate = new Date()
        $scope.formUpApp.reExaminationDate = moment(currentDate).add(number, 'days').format('DD/MM/YYYY');

    }

    $scope.generateAppointmentServiceRequest = (selectedServices, appointmentIdResponse, isUpdate) => {
        let dataArray = []
        let fu = $scope.formUpApp
        selectedServices.forEach(s => {
            let appointmentServiceRequest = {
                appointmentId: appointmentIdResponse, //respone
                serviceId: s.serviceId,
                quantity: s.quantity ? s.quantity : 1,
                price: s.price,
                deleted: isUpdate ? fu.deleted : false,
                isDeleted: isUpdate ? fu.deleted : false
            }
            dataArray.push(appointmentServiceRequest)
        })
        return dataArray
    }

    $scope.generateDoctorUnavailabilityRequest = (selectedTimeOfShift, appointmentIdResponse, isUpdate) => {
        let dataArray = []
        let fa = $scope.formApp
        let fu = $scope.formUpApp
        selectedTimeOfShift.forEach(tos => {
            let doctorUnavailabilityRequest = {
                description: "",
                timeOfShiftId: tos.timeOfShiftId,
                appointmentId: appointmentIdResponse,//respone
                date: TimezoneService.convertToTimezone(moment(isUpdate ? fu.appointmentDate : fa.appointmentDate, "DD/MM/YYYY"), defaultTimezone),
                deleted: isUpdate ? fu.deleted : false,
                isDeleted: isUpdate ? fu.deleted : false
            }
            dataArray.push(doctorUnavailabilityRequest)
        })
        return dataArray;
    }

    $scope.validationForm = () => {
        let patientId = $scope.formApp.patientId
        let doctorId = $scope.formApp.doctorId
        let tosArr = $scope.selectedTimeOfShift
        let serviceArr = $scope.selectedServices
        let title = $scope.formApp.title
        let appType = $scope.formApp.appointmentTypeId
        let valid = true

        // if (title == "" || title == null) {
        //     Swal.fire({
        //         title: "Cảnh báo!",
        //         html: "Vui lòng điền tiêu đề ca khám!",
        //         icon: "error"
        //     })
        //     valid = false
        // } else 
        if (doctorId == -1) {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Vui lòng chọn bác sĩ khám!",
                icon: "error"
            })
            valid = false
        } else if (tosArr.length == 0) {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Vui lòng chọn thời gian khám!",
                icon: "error"
            })
            valid = false
        } else if (appType == null || appType === undefined || appType == "") {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Vui lòng chọn loại ca khám!",
                icon: "error"
            })
            valid = false
        } else if (patientId == null || patientId === undefined || patientId == "") {
            Swal.fire({
                title: "Cảnh báo!",
                html: "Vui lòng chọn bệnh nhân!",
                icon: "error"
            })
            valid = false
        }
        return valid
    }

    $scope.validPatient = (patientId, dateSelected) => {
        if (patientId === undefined || patientId === null) return
        if (dateSelected == "") {
            $scope.listAppByPatientDB = []
        } else {
            let params = {
                date: moment(dateSelected, 'DD/MM/YYYY').format('YYYY-MM-DD'),
                patientId: patientId
            }

            $http.get(url + '/appointment-by-patient', { params: params, headers: headers }).then(response => {
                $scope.listAppByPatientDB = response.data
            })
        }
    }

    $scope.saveAppointment = async () => {
        let isUpdate = false
        $scope.initDataRequest(isUpdate)
        let valid = $scope.validationForm()
        if (valid) {
            try {
                $scope.isLoadingCreate = true
                let dataAPRReq = angular.toJson($scope.appointmentPatientRecordRequest)

                let responseApr = await $http.post(url + '/appointment-patient-record', dataAPRReq, { headers: headers })
                $scope.appointmentRequest.appointmentPatientRecord = responseApr.data.appointmentPatientRecordId

                let dataAppoinmentReq = angular.toJson($scope.appointmentRequest)
                let respApp = await $http.post(url + '/appointment', dataAppoinmentReq, { headers: headers })

                let appointmentId = respApp.data.appointmentId == null ? null : respApp.data.appointmentId

                let dataArrayDUReq = $scope.generateDoctorUnavailabilityRequest($scope.selectedTimeOfShift, appointmentId, isUpdate)
                let dataArrayServiceReq = $scope.generateAppointmentServiceRequest($scope.selectedServices, appointmentId, isUpdate)

                let doctorUnavailabilityRequests = dataArrayDUReq.map(item => {
                    let dataArrayDUReqJson = angular.toJson(item);
                    return $http.post(url + '/doctorUnavailability', dataArrayDUReqJson, { headers: headers });
                })

                let appointmentServiceRequests = dataArrayServiceReq.map(item => {
                    let dataArrayServiceReqJson = angular.toJson(item);
                    return $http.post(url + '/appointment-service', dataArrayServiceReqJson, { headers: headers });
                })

                await Promise.all([...doctorUnavailabilityRequests, ...appointmentServiceRequests]).then(() => {
                    $timeout(() => { $scope.isLoadingCreate = false }, 3000)
                }).finally(() => {
                    $timeout(() => {
                        new Noty({
                            text: 'Đặt lịch khám thành công !',
                            type: 'success',
                            timeout: 3000
                        }).show()
                       $route.reload()

                    }, 3000)
                })

            } catch (error) {
                console.error('Có lỗi xảy ra khi đặt lịch khám:', error);
                new Noty({
                    text: 'Có lỗi xảy ra khi đặt lịch khám. Vui lòng thử lại !',
                    type: 'error',
                    timeout: 3000
                }).show();
            }
        }
    }

    $scope.processDoctorsWithAppointmentStatus = () => {
        return new Promise((resolve, reject) => {
            $http.get(url + '/doctor-with-appointment-status', { headers: headers }).then(response => {
                resolve(response.data)
            }).catch(err =>
                reject(err)
            )
        })
    }

    $scope.processDSWithAppointmentStatus = (curentDate) => {
        let params = {
            date: curentDate
        }
        return new Promise((resolve, reject) => {
            $http.get(url + '/doctor-schedule-with-appointment-status', { params: params, headers: headers }).then(response => {
                resolve(response.data)
            }).catch(err =>
                reject(err)
            )
        })
    }

    $scope.processDoctorUnavailability = () => {
        return new Promise((resolve, reject) => {
            $http.get(url + '/doctorUnavailability', { headers: headers }).then(response => {
                resolve(response.data)
            }).catch(err =>
                reject(err)
            )
        })
    }

    $scope.getTimeOfShiftByRangeTime = (startStr, endStr) => {
        startStr = startStr.split("T")[1]
        endStr = endStr.split("T")[1]
        let params = {
            startStr: startStr,
            endStr: endStr
        }
        $http.get(url + '/time-of-shift-by-range', { params: params, headers: headers }).then(response => {
            $scope.selectedTimeOfShift = response.data
        })
    }

    $scope.processChangeAppStatus = (statusId) => {
        let st = $scope.listAppointmentStatusBD.find(s => s.appointment_StatusId === statusId)
        if (!st) {
            console.log("Không tìm thấy trạng thái với id:", statusId);
            return
        }
        switch (st.status.toLowerCase()) {
            case 'đã hủy':
            case 'không đến':
            case 'hoãn':
                $scope.isShowFormResult = false
                $scope.formUpApp.deleted = true
                $scope.isValidServiceUp = false
                $scope.isDisableStatus = true
                break
            case 'hoàn thành':
                $scope.isShowFormResult = true
                $scope.formUpApp.deleted = false
                $scope.isValidServiceUp = true
                $scope.isDisableStatus = true
                break
            default:
                $scope.isShowFormResult = false
                $scope.formUpApp.deleted = false
                $scope.isValidServiceUp = false
                $scope.isDisableStatus = false
                break
        }
    }

    $scope.isDisabledStatus = (tableStatus) => {
        const status = tableStatus || $scope.validStatus;
        return status && ['hoàn thành', 'đã hủy', 'không đến', 'hoãn'].includes(status.toLowerCase());
    }

    $scope.comparasionDateEvent = (selectDate) => {
        let date = new Date();
        date.setHours(0, 0, 0, 0);
        if (!(selectDate instanceof Date)) {
            selectDate = new Date(selectDate);
        }
        selectDate.setHours(0, 0, 0, 0);
        $scope.validDateEvent = selectDate.getTime() >= date.getTime()
    }

    $scope.closeFormUp = () => {
        $scope.selectedServices = []
        $scope.selectedTimeOfShift = []
        const btnCloseFormUpApp = document.getElementById('btn-close-formUpApp')
        btnCloseFormUpApp.click()
        $route.reload()
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


    $scope.getNameStatus = (statusId) => {
        let st = $scope.listAppointmentStatusBD.find(s => s.appointment_StatusId === statusId);

        if (!st) {
            console.log("Không tìm thấy trạng thái với id:", statusId);
            return 'trạng thái không xác định';
        }

        return st.status.toLowerCase();
    }

    function convertDateOfAlert(dateString) {
        // Split the date string into an array of [year, month, day]
        const [year, month, day] = dateString.split("-");

        // Return the date in dd/mm/yyyy format
        return `${day}/${month}/${year}`;
    }


    $scope.updateAppointment = () => {
        const isUpdate = true
        $scope.initDataRequest(isUpdate)

        let originalApr = $scope.originalAPR
        let originalApp = $scope.originalAppointment
        let originalDu = $scope.originalDU
        let originalAs = $scope.originalAS

        let aprId = originalApr.appointmentPatientRecordId
        let appId = originalApp.appointmentId
        let duId = []
        let apsId = []
        originalDu.forEach(du => {
            duId.push(du.doctorUnavailabilityId)
        })
        originalAs.forEach(aps => {
            apsId.push(aps.appointment_ServiceId)
        })

        if ($scope.selectedTimeOfShiftUp.length == 0) {
            originalDu.forEach(du => {
                $scope.selectedTimeOfShiftUp.push(du.timeOfShift)
            })
        }

        if ($scope.selectedServicesUp.length == 0) {
            if ($scope.isValidServiceUp) {
                Swal.fire({
                    title: "Cảnh báo!",
                    html: "Bạn chưa chọn dịch vụ",
                    icon: "warning"
                })
                return
            }
            originalAs.forEach(as => {
                $scope.selectedServicesUp.push(as.service)
            })
        }

        if (!$scope.formUpApp.isReExamination) {
            $scope.formUpApp.reExaminationDate = ""
        }

        let reqApr = $scope.appointmentPatientRecordRequest
        let reqApp = $scope.appointmentRequest


        $http.get(url + '/get-email-by-doctor-id', {
            params: { doctorId: reqApp.doctorId },
        }, { headers: headers }).then(function (response) {
            let emailOfDoctor = response.data.email;
            let messageToDoctor = {
                getterMail: emailOfDoctor,
                body: "Lịch khám cho bệnh nhân ngày " + convertDateOfAlert(reqApp.appointmentDate.split("T")[0]) + " " + $scope.getNameStatus(reqApp.appointmentStatus)
            };

            $http.get(url + '/get-email-by-patient-id', { params: { patientId: reqApp.patientId } }, { headers: headers }).then(function (response) {
                let email = response.data.email;

                let message = {
                    getterMail: email,
                    body: "Lịch khám ngày " + convertDateOfAlert(reqApp.appointmentDate.split("T")[0]) + " " + $scope.getNameStatus(reqApp.appointmentStatus)
                };

                SocketService.getStompClient().then(function (stompClient) {
                    stompClient.send("/app/private-message", {}, JSON.stringify(message));
                    stompClient.send("/app/private-message", {}, JSON.stringify(messageToDoctor));

                }).catch(function (error) {
                    console.error('Socket connection error: ' + error);
                });
            }).catch(function (error) {
                console.error('Error fetching patient email: ' + error);
            });

        }).catch(function (error) {
            console.error('Error fetching doctor email: ' + error);
        });




        let reqDu = $scope.generateDoctorUnavailabilityRequest($scope.selectedTimeOfShiftUp, appId, isUpdate)
        let reqAs = $scope.generateAppointmentServiceRequest($scope.selectedServicesUp, appId, isUpdate)


        let reqAprData = $scope.processDataUpdate(originalApr, reqApr)
        let reqAppData = $scope.processDataUpdate(originalApp, reqApp)
        let reqDuData = $scope.processDataUpdate(originalDu, reqDu)
        let reqAsData = $scope.processDataUpdate(originalAs, reqAs)
        const aprKey = "appointmentPatientRecordId"
        const appKey = "appointmentId"
        const duKey = "doctorUnavailabilityId"
        const asKey = "appointment_ServiceId"


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
                    oItem.forEach((o, index) => {
                        if (index >= uItem.length) return;
                        const id = o[idKey];
                        const updateData = uItem[index]
                        promises.push(
                            $http.put(`${putUrl}/${id}`, updateData, { headers: headers })
                        )
                    })
                })
            }

            return Promise.all(promises)
        };

        Promise.all([
            handleApiRequest(url + "/soft-delete-appointment-patient-record", url + "/appointment-patient-record", url + "/appointment-patient-record", reqAprData, aprKey),
            handleApiRequest(url + "/soft-delete-appointment", url + "/appointment", url + "/appointment", reqAppData, appKey),
            handleApiRequest(url + "/soft-delete-doctorUnavailability", url + "/doctorUnavailability", url + "/doctorUnavailability", reqDuData, duKey),
            handleApiRequest(url + "/soft-delete-appointment-service", url + "/appointment-service", url + "/appointment-service", reqAsData, asKey)
        ]).then(result => {

            new Noty({
                text: 'Cập nhật lịch khám thành công !',
                type: 'success',
                timeout: 3000
            }).show()
            const btnCloseFormUpApp = document.getElementById('btn-close-formUpApp')
            btnCloseFormUpApp.click()
            $route.reload()
        }).catch(error => {
            console.error("Lỗi cập nhật lịch khám", error);
        })
    }

    $scope.reSelect = () => {
        $scope.formApp = {
            appointmentDate: moment(new Date).format('DD/MM/YYYY'),
            doctorId: -1,
            title: '',
            appointmentTypeId: null,
            patientId: null,
            notes: '',
            fullName: "",
            startTime: "",
            endTime: ""
        }
        $scope.isSelectCalendar = false
        const divRegisterAppointment = document.getElementById('div-register-appointment');
        divRegisterAppointment.click();
    }

    $scope.listServiceInfo = () => {
        $http.get(url + '/service').then(response => {
            $scope.listServiceFromDB = response.data
            if ($.fn.DataTable.isDataTable('#dataTable-list-service-app')) {
                $('#dataTable-list-service-app').DataTable().clear().destroy();
            }
            $(document).ready(function () {
                $('#dataTable-list-service-app').DataTable({
                    autoWidth: true,
                    "lengthMenu": [
                        [10, 20, 30, -1],
                        [10, 20, 30, "Tất cả"]
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
                    ordering: false,
                    autoWidth: false,
                    columnDefs: [
                        { width: '5%', targets: 0 },
                        { width: '25%', targets: 1 },
                        { width: '40%', targets: 2 },
                        { width: '15%', targets: 3 },
                        { width: '15%', targets: 4 }
                    ]
                });
                $scope.$apply()
            });
        }).catch(error => {
            console.log("error", error);
        })
    }

    $scope.listServiceInfoUpdate = () => {
        $http.get(url + '/service').then(response => {
            $scope.listServiceFromDB = response.data
            if ($.fn.DataTable.isDataTable('#dataTable-list-service-app-update')) {
                $('#dataTable-list-service-app-update').DataTable().clear().destroy();
            }
            $(document).ready(function () {
                $('#dataTable-list-service-app-update').DataTable({
                    autoWidth: true,
                    "lengthMenu": [
                        [5, 10, 20, 30, -1],
                        [5, 10, 20, 30, "All"]
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

    $scope.initializeUIComponentsModal = () => {
        $('.select2').select2(
            {
                theme: 'bootstrap4',
                placeholder: 'Select an option',
                allowClear: true
            });

        $timeout(() => {
            $('.select2-multi-up').select2(
                {
                    multiple: true,
                    theme: 'bootstrap4',
                    placeholder: '---Nhập triệu chứng---',
                    allowClear: true
                }).val(null).trigger('change')

            $('.select2-multi-up-treatment').select2(
                {
                    multiple: true,
                    theme: 'bootstrap4',
                    placeholder: '---Nhập cách điều trị---',
                    allowClear: true
                }).val(null).trigger('change')
        }, 1000)

        $('.drgpicker-up').daterangepicker(
            {
                singleDatePicker: true,
                timePicker: false,
                showDropdowns: true,
                minDate: moment().format('DD/MM/YYYY') && $scope.formUpApp.appointmentDate,
                locale:
                {
                    format: 'DD/MM/YYYY',
                    applyLabel: 'Áp dụng',
                    cancelLabel: 'Hủy',
                },
            });

        $('.drgpicker-reExam').daterangepicker(
            {
                singleDatePicker: true,
                timePicker: false,
                showDropdowns: true,
                minDate: moment().format('DD/MM/YYYY') && $scope.formUpApp.reExaminationDate,
                locale:
                {
                    format: 'DD/MM/YYYY',
                    applyLabel: 'Áp dụng',
                    cancelLabel: 'Hủy',
                },
            });

        $('.drgpicker-reExam').on('apply.daterangepicker', function (ev, picker) {
            let selectedDate = picker.startDate.format('DD/MM/YYYY');
            $scope.formUpApp.reExaminationDate = selectedDate
        });

        $('.drgpicker-up').on('apply.daterangepicker', function (ev, picker) {
            let selectedDate = picker.startDate.format('DD/MM/YYYY');
            $scope.getListDoctorSchedule(selectedDate)
            $scope.formUpApp.appointmentDate = selectedDate
            $scope.showNextStepUp = true
        });


        $('#dental-issuesUp').on('change', function () {
            $timeout(function () {
                let selectedVals = $('#dental-issuesUp').val()
                selecteDentalIssues = processSelect2Service.processSelect2Data(selectedVals)
                $scope.getServiceByDentalIssuesUp(selecteDentalIssues)
                let getDentalIssueNames = $scope.listDentalIssueDBUp
                    .filter(di => selecteDentalIssues.includes(di.dentalIssuesId))
                    .map(di => di.name)
                $scope.formUpApp.currentCondition = getDentalIssueNames.join(' ,')

            });
        });
        $('#appointmentPatientUp').on('change', function () {
            $timeout(function () {
                let selectedVal = $('#appointmentPatientUp').val();
                $scope.formUpApp.patientId = processSelect2Service.processSelect2Data(selectedVal)[0]
            });
        });
        $('#appointmentTypeUp').on('change', function () {
            $timeout(function () {
                let selectedVal = $('#appointmentTypeUp').val()
                $scope.formUpApp.appointmentTypeId = processSelect2Service.processSelect2Data(selectedVal)[0]
            });
        });
        $('#appointmentStatusUp').on('change', function () {
            $timeout(function () {
                let selectedVal = $('#appointmentStatusUp').val()

                $scope.formUpApp.appointmentStatus = processSelect2Service.processSelect2Data(selectedVal)[0]
                $scope.processChangeAppStatus($scope.formUpApp.appointmentStatus)
            });
        });
    }

    $scope.initializeUIComponents = () => {
        $('.select2').select2(
            {
                theme: 'bootstrap4',
                placeholder: 'Chọn dữ liệu',
                allowClear: true
            });

        $timeout(function () {
            $('.select2-multi-dentalIssue').select2({
                multiple: true,
                theme: 'bootstrap4',
                placeholder: '---Nhập triệu chứng ---',
                allowClear: true
            }).val(null).trigger('change');
        }, 100)

        $('.drgpicker-appointmentDate').daterangepicker(
            {
                singleDatePicker: true,
                timePicker: false,
                showDropdowns: true,
                minDate: moment().format('DD/MM/YYYY'),
                locale:
                {
                    format: 'DD/MM/YYYY',
                    applyLabel: 'Áp dụng',
                    cancelLabel: 'Hủy',
                },
            });

        $('.drgpicker-appointmentDate').on('apply.daterangepicker', function (ev, picker) {
            let selectedDate = picker.startDate.format('DD/MM/YYYY');
            $scope.getListDoctorSchedule(selectedDate)
            $scope.formApp.appointmentDate = selectedDate
            $scope.validDateByPatient = selectedDate
            $scope.showNextStepUp = true
            $scope.validPatient($scope.formApp.patientId, $scope.validDateByPatient)
        });

        $('#dental-issues').on('change', function () {
            $timeout(function () {
                let selectedVals = $('#dental-issues').val()
                selecteDentalIssues = processSelect2Service.processSelect2Data(selectedVals)
                $scope.getServiceByDentalIssues(selecteDentalIssues)
                let getDentalIssueNames = $scope.listDentalIssueDB
                    .filter(di => selecteDentalIssues.includes(di.dentalIssuesId))
                    .map(di => di.name)
                $scope.formApp.notes = getDentalIssueNames.join(', ')
                $scope.formApp.title = getDentalIssueNames.join(', ')
                $('#appointmentTitle').val(getDentalIssueNames.join(', '));
            });
        });

        $scope.formApp.appointmentDate = $('#appointmentDateRequest').val()

        $('#appointmentPatient').on('change', function () {
            $timeout(function () {
                let selectedVal = $('#appointmentPatient').val();
                $scope.formApp.patientId = processSelect2Service.processSelect2Data(selectedVal)[0] ? processSelect2Service.processSelect2Data(selectedVal)[0] : null
                $scope.validPatient($scope.formApp.patientId, $scope.validDateByPatient)
            });
        });

        $('#appointmentType').on('change', function () {
            $timeout(function () {
                let selectedVal = $('#appointmentType').val()
                $scope.formApp.appointmentTypeId = processSelect2Service.processSelect2Data(selectedVal)[0] ? processSelect2Service.processSelect2Data(selectedVal)[0] : null

                $scope.validAppointmentType = $scope.listAppointmentTypeDB.filter(item => item.appointment_TypeId === $scope.formApp.appointmentTypeId)[0].typeName.toUpperCase() === 'TÁI KHÁM'
            });
        });

        $('#appointmentStatus').on('change', function () {
            $timeout(function () {
                let selectedVal = $('#appointmentStatus').val()
                $scope.formApp.appointmentStatus = processSelect2Service.processSelect2Data(selectedVal)[0]
            });
        });
    }

    $scope.initializeCalendarAppointment = () => {
        let calendar;
        let resources = [];
        let eventArr = [];

        const loadResourcesAndEvents = (currentDate) => {
            $scope.processDSWithAppointmentStatus(currentDate).then(result => {
                resources = [];
                for (let key in result) {
                    if (result.hasOwnProperty(key)) {
                        let obj = {
                            id: key.split('-')[0],
                            title: key.split('-')[1],
                        };
                        resources.push(obj);
                    }
                }
                resources.sort((a, b) => a.id - b.id);
                loadDoctorUnavailability();
            });
        };

        const loadDoctorUnavailability = () => {
            eventArr = []

            $scope.processDoctorUnavailability().then(dataDu => {
                let checkStatus = ['đã hủy', 'không đến', 'hoãn']
                dataDu = dataDu.filter(du => {
                    let stt = du.appointment.appointmentStatus
                    let isAuth = checkStatus.includes(stt ? du.appointment.appointmentStatus.status.toLowerCase() : 'đã xác nhận')
                    return (du.deleted == false) || (du.deleted == true && isAuth)
                })

                dataDu.forEach(du => {

                    let status = du.appointment.appointmentStatus;
                    let color = status ? $scope.getColorForStatusId(du.appointment.appointmentStatus.status) : 'rgba(92, 184, 92, 0.7)';
                    let event = {
                        id: du.appointment.appointmentId,
                        start: du.appointment.appointmentDate + "T" + du.timeOfShift.beginTime,
                        end: du.appointment.appointmentDate + "T" + du.timeOfShift.endTime,
                        resourceId: du.appointment.doctor.doctorId,
                        color: color,
                        doctor: du.appointment.doctor ? du.appointment.doctor : null,
                        appointment: du.appointment ? du.appointment : null,
                        tos: du.timeOfShift ? du.timeOfShift : null
                    };

                    eventArr.push(event);
                });
                updateCalendar();
            });

            $scope.getAllDoctorScheduleExceptDeleted().then(dataDs => {
                dataDs.forEach(ds => {
                    let event = {
                        id: "",
                        start: ds.date.split("T")[0] + "T" + ds.shift.beginTime,
                        end: ds.date.split("T")[0] + "T" + ds.shift.endTime,
                        resourceId: ds.doctor.doctorId,
                        color: "#c8e5e9",
                        clickCount: 0
                    }
                    eventArr.push(event);
                })
                updateCalendar();
            })
        };

        const updateCalendar = () => {
            calendar.getResources().forEach(resource => {
                calendar.getResourceById(resource.id).remove();
            });
            resources.forEach(resource => {
                calendar.addResource(resource);
            });

            calendar.getEvents().forEach(event => {
                event.remove();
            });
            eventArr.forEach(event => {
                calendar.addEvent(event);
            });
        };

        const renderCalendar = () => {
            const calendarEl = document.getElementById('calendar-book-appointment');
            calendar = new FullCalendar.Calendar(calendarEl, {
                plugins: ['interaction', 'resourceTimeline'],
                defaultView: 'resourceTimelineDay',
                timeZone: 'Asia/Ho_Chi_Minh',
                themeSystem: 'bootstrap',
                dragScroll: true,
                locale: 'vi',
                aspectRatio: 4,
                header: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'resourceTimelineDay'
                },
                editable: false,//không cho drag và resize events            
                slotDuration: '00:30:00',
                maxTime: "22:00:00",
                minTime: "07:00:00",
                slotLabelFormat: {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                },
                buttonText: {
                    today: 'Hôm nay',
                    month: 'Tháng',
                    week: 'Tuần',
                    day: 'Ngày',
                    list: 'Lịch sử'
                },
                resourceLabelText: 'Bác sĩ',
                events: eventArr,
                resources: resources,
                selectable: true,
                selectMirror: true,
                select: function (arg) {

                    let events = calendar.getEvents().filter(event => {
                        return (
                            event.start < arg.end && arg.start < event.end &&
                            event.getResources().some(resource => resource != null && resource.id === arg.resource.id)
                        )
                    });

                    if (events.length === 0) {
                        Swal.fire({
                            position: "top-end",
                            icon: "warning",
                            title: "Bác sĩ không có lịch làm việc !",
                            showConfirmButton: false,
                            timer: 1500
                        });
                        calendar.unselect();
                        return;
                    }

                    let hasAppointment = events.some(event => event.id !== "" && event.extendedProps.appointment.deleted == false)
                    if (hasAppointment) {
                        Swal.fire({
                            position: "top-end",
                            icon: "warning",
                            title: "Đã có lịch khám!",
                            showConfirmButton: false,
                            timer: 1500
                        });
                        calendar.unselect();
                        return
                    }

                    let now = new Date();
                    let startDate = new Date(arg.startStr);
                    startDate.setMinutes(now.getMinutes() + 15);
                    if (startDate < now ||
                        (startDate.getHours() === 7 && startDate.getMinutes() < 30 && startDate < now) ||
                        (startDate.getHours() > 21 && startDate < now)) {
                        Swal.fire({
                            position: "top-end",
                            icon: "warning",
                            title: "Đã quá giờ đăng ký lịch khám !",
                            showConfirmButton: false,
                            timer: 1500
                        });
                        calendar.unselect();
                        return;
                    }

                    $scope.getTimeOfShiftByRangeTime(arg.startStr, arg.endStr);
                    $scope.formApp.doctorId = parseInt(arg.resource.id);
                    $scope.formApp.fullName = arg.resource.title;
                    $scope.formApp.appointmentDate = moment(arg.startStr.split("T")[0], "YYYY-MM-DD").format("DD/MM/YYYY")
                    $scope.validDateByPatient = moment(arg.startStr.split("T")[0], "YYYY-MM-DD").format("DD/MM/YYYY")
                    $scope.formApp.startTime = arg.startStr.split("T")[1]
                    $scope.formApp.endTime = arg.endStr.split("T")[1]
                    $scope.isSelectCalendar = true;
                    $scope.$apply();
                    const divRegisterAppointment = document.getElementById('div-register-appointment');
                    divRegisterAppointment.click();

                },
                eventClick: function (arg) {

                    if (arg.event.id === "") {
                        return
                    }

                    let originalApp = arg.event.extendedProps.appointment
                    if (originalApp == null) {
                        return
                    }

                    $scope.getOriginalData(parseInt(arg.event.id));
                    $scope.originalDate = moment(originalApp.appointmentDate, ('YYYY-MM-DD')).format('DD/MM/YYYY')
                    $scope.originalPatient = originalApp.patient
                    $scope.comparasionDateEvent(originalApp.appointmentDate)
                    $scope.formUpApp = {
                        reExaminationDate: originalApp.appointmentPatientRecord.reExamination,
                        currentCondition: originalApp.appointmentPatientRecord.currentCodition,
                        appointmentDate: $scope.originalDate,
                        fullName: originalApp.doctor.fullName,
                        startTime: arg.event.extendedProps.tos.beginTime,
                        endTime: arg.event.extendedProps.tos.endTime,
                        patientId: originalApp.patient.patientId,
                        appointmentStatus: originalApp.appointmentStatus ? originalApp.appointmentStatus.appointment_StatusId : 2,
                        appointmentTypeId: originalApp.appointmentType.appointment_TypeId,
                        createDate: originalApp.createAt,
                        doctorId: originalApp.doctor.doctorId,
                        deleted: originalApp.deleted,
                        quantity: 1,
                        isReExamination: originalApp.appointmentPatientRecord.reExamination == "" ? false : true
                    }
                    $scope.validStatus = originalApp.appointmentStatus ? originalApp.appointmentStatus.status : ""
                    $scope.$apply();

                    const btnUpdateAppointment = document.getElementById('btnUpdateAppointment');
                    btnUpdateAppointment.click();
                },
                datesRender: function (info) {
                    $scope.fullCalendarDate = info.view.currentStart;
                    loadResourcesAndEvents(info.view.currentStart);
                    let now = new Date();
                    now.setMinutes(now.getMinutes() - 15);
                    let tdElements = calendarEl.querySelectorAll('td.fc-widget-content.fc-minor, td.fc-widget-content.fc-major')
                    tdElements.forEach(td => {
                        let tdDate = new Date(td.getAttribute('data-date'));
                        let isPast = tdDate < now || (tdDate.getHours() === 7 && tdDate.getMinutes() < 30) || tdDate.getHours() >= 21;
                        if (isPast) {
                            td.classList.add('fc-custom-past');
                        }
                    });
                },

            });

            calendar.render();
            let licenseMessage = document.querySelector('.fc-license-message');
            if (licenseMessage) {
                licenseMessage.parentNode.removeChild(licenseMessage);
            }
        };

        $scope.getColorForStatusId = (status) => {
            switch (status.toLowerCase()) {
                case "đã xác nhận":
                    return 'rgba(92, 184, 92, 0.7)';
                case "đã đặt":
                    return 'rgba(158, 234, 16, 0.7)';
                case "đang diễn ra":
                    return 'rgba(0, 123, 255, 0.7)';
                case "đã hủy":
                    return 'rgba(217, 83, 79, 0.7)';
                case "không đến":
                    return 'rgba(240, 173, 78, 0.7)';
                case "hoãn":
                    return 'rgba(255, 193, 7, 0.7)';
                case "hoàn thành":
                    return 'rgb(26 6 244)';
                default:
                    return 'rgba(158, 234, 16, 0.7)';
            }
        };

        renderCalendar();
    };

    $('#updateAppointment').on('shown.bs.modal', function () {
        $scope.initializeUIComponentsModal()
        $scope.listServiceInfoUpdate()
        $scope.getListAppointmentStatusUp()
    })


    // list appointment

    $scope.processDoctorUnavailabilityAllDoctor = () => {
        return new Promise((resolve, reject) => {

            Promise.all([
                $http.get(url + '/doctorUnavailability', { headers: headers }),
                $http.get(url + '/appointment', { headers: headers })
            ]).then(([doctorUnavailabilityResponse, appointmentResponse]) => {
                let doctorUnavailabilityData = doctorUnavailabilityResponse.data;
                let appointmentsData = appointmentResponse.data;
                let appointmentsWithNoDoctor = appointmentsData.filter(appointment => appointment.doctor === null);
                             
                let combinedData = doctorUnavailabilityData.concat(appointmentsWithNoDoctor);
                if ($scope.selectedDoctorLApp.length > 0) {
                    combinedData = combinedData.filter(item =>
                        item.appointment && item.appointment.doctor &&
                        $scope.selectedDoctorLApp.includes(item.appointment.doctor.doctorId)
                    );
                }

                if ($scope.selectedDatesLApp.length > 0) {
                    combinedData = combinedData.filter(item =>
                        item.date && $scope.selectedDatesLApp.includes(moment(item.date).format("YYYY-MM-DD"))
                    );
                }

                if ($scope.selectedPatientLApp.length > 0) {
                    combinedData = combinedData.filter(item =>
                        item.appointment && item.appointment.patient &&
                        $scope.selectedPatientLApp.includes(item.appointment.patient.patientId)
                    );
                }

                if ($scope.selectedStatusLApp.length > 0) {
                    combinedData = combinedData.filter(item =>
                        item.appointment && item.appointment.appointmentStatus &&
                        $scope.selectedStatusLApp.includes(item.appointment.appointmentStatus.appointment_StatusId)
                    );
                }

                if ($scope.isReExaminationFilter) {
                    combinedData = combinedData.filter(item => {
                        let app = item.appointment ? item.appointment : item;
                        return app && app.appointmentPatientRecord &&
                            app.appointmentPatientRecord.reExamination != "" && app.appointmentPatientRecord.reExamination != null
                    });

                    combinedData.sort((a, b) => {
                        let appA = a.appointment ? a.appointment : a
                        let appB = b.appointment ? b.appointment : b
                        let dateStrA = appA.appointmentPatientRecord.reExamination;
                        let dateStrB = appB.appointmentPatientRecord.reExamination;
                        let dateA = moment(dateStrA, "DD/MM/YYYY").toDate();
                        let dateB = moment(dateStrB, "DD/MM/YYYY").toDate();
                        return dateB - dateA;
                    });
                }

                let checkStatus = ['đã hủy', 'không đến', 'hoãn'];
                combinedData = combinedData.filter(du => {
                    let stt = du.appointment && du.appointment.appointmentStatus;
                    let isAuth = stt ? checkStatus.includes(stt.status.toLowerCase()) : false;
                    return du.deleted == false || (du.deleted == true && isAuth);
                });

                // Apply final sorting
                combinedData.sort((a, b) => {
                    var dateA = new Date(a.appointmentDate);
                    var dateB = new Date(b.appointmentDate);
                    if (dateA > dateB) return -1;
                    if (dateA < dateB) return 1;
                    var idA = a.appointmentId;
                    var idB = b.appointmentId;
                    if (idA > idB) return -1;
                    if (idA < idB) return 1;
                    return 0;
                });
                 
                resolve(combinedData);
            }).catch(error => reject(error));
        })
    }

    $rootScope.$on('reloadTableAppointment', function (event) {
        $scope.getListDoctorUnavailabilityAllDoctor();
    });

    $scope.getListDoctorUnavailabilityAllDoctor = () => {
        $scope.processDoctorUnavailabilityAllDoctor().then(result => {
            $scope.listDoctorUnavailabilityAllDoctorDB = result
            $scope.listAppointmentDBFromDu = []
            let seenAppointmentIds = {}
            let quickAppArr=[]
            result.forEach(rs => {
                let appointmentId = rs.appointment && rs.appointment.appointmentId ? rs.appointment.appointmentId : rs.appointmentId;         
                if (appointmentId && !seenAppointmentIds[appointmentId]) {
                    seenAppointmentIds[appointmentId] = true              
                    if (rs.appointment) {
                        $scope.listAppointmentDBFromDu.push(rs.appointment);
                    } else{
                        quickAppArr.push(rs)
                    }            
                }
            })
            $scope.listAppointmentDBFromDu=$scope.listAppointmentDBFromDu.concat(quickAppArr)
            $timeout(() => {
                if ($.fn.DataTable.isDataTable('#dataTable-list-app')) {
                    $('#dataTable-list-app').DataTable().clear().destroy();
                }
                $(document).ready(function () {
                    $('#dataTable-list-app').DataTable({
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
                    })
                })
            }, 0)
        })
    }

    $scope.getListDoctor = () => {
        $http.get(url + '/doctor-except-deleted').then(respone => {
            $scope.listDoctorDB = respone.data
        }).catch(err => {
            console.log("Error", err);
        })
    }

    $scope.getListDoctorFilter = () => {
        $http.get(url + '/doctor-except-deleted').then(respone => {
            let allOptions = {
                doctorId: null,
                fullName: '---Tất cả ---'
            }
            $scope.listDoctorDBFilter = respone.data
            $scope.listDoctorDBFilter.unshift(allOptions);
        }).catch(err => {
            console.log("Error", err);
        })
    }
    $scope.clearDateFilter = () => {
        $scope.selectedDatesLApp = []
        $scope.getListDoctorUnavailabilityAllDoctor()
        $('#formAppoinmentSearchDate').val(moment().format("DD/MM/YYYY"))
    }

    $scope.getDateFilter = (selectedDate) => {
        $scope.selectedDatesLApp = [];
        let dates = selectedDate.split(' - ');
        let fromDate = moment(dates[0], 'DD/MM/YYYY');
        let toDate = moment(dates[1], 'DD/MM/YYYY');
        while (fromDate <= toDate) {
            $scope.selectedDatesLApp.push(moment(fromDate, "DD/MM/YYYY").format("YYYY-MM-DD"));
            fromDate = fromDate.add(1, 'days');
        }
        $scope.getListDoctorUnavailabilityAllDoctor()

    }

    $scope.refreshFilter = () => {
        $route.reload()
    }

    $scope.highlightReExamination = (reExamination) => {
        if (reExamination != "") {
            let currentDate = new Date()
            let nextWeekDate = moment(currentDate).add(7, 'days').toDate();
            let reExaminationDate = moment(reExamination, 'DD/MM/YYYY').toDate()
            return reExaminationDate <= nextWeekDate && reExaminationDate >= currentDate
        }
        return false
    }

    $scope.updateStatus = (app, status) => {
        $scope.originalPatient = app.patient
        let details = $scope.getDetailsAppointment(app.appointmentId)
 
        let isDetails = details.length > 0
        if ($scope.isDisabledStatus(status)) return;
        const originalApp = app
        if (originalApp == null) {
            return
        }
        $scope.getOriginalData(originalApp.appointmentId);
        $scope.originalDate = moment(originalApp.appointmentDate, ('YYYY-MM-DD')).format('DD/MM/YYYY')
        $scope.comparasionDateEvent(originalApp.appointmentDate)
        $scope.selectedTosOriginal = []
        details.forEach(du => {
            $scope.selectedTosOriginal.push(du.timeOfShift)
        })
        $scope.formUpApp = {
            reExaminationDate: originalApp.appointmentPatientRecord.reExamination,
            currentCondition: originalApp.appointmentPatientRecord.currentCodition,
            appointmentDate: $scope.originalDate,
            fullName: originalApp.doctor ? originalApp.doctor.fullName : 'Đang chờ sắp bác sĩ',
            startTime: isDetails && details[0] && details[0].timeOfShift ? details[0].timeOfShift.beginTime : 'Đang chờ sắp xếp',
            endTime: isDetails && details[0] && details[0].timeOfShift ? details[details.length - 1].timeOfShift.endTime : 'Đang chờ sắp xếp',
            patientId: originalApp.patient.patientId,
            appointmentStatus: originalApp.appointmentStatus ? originalApp.appointmentStatus.appointment_StatusId : 2,
            appointmentTypeId: originalApp.appointmentType.appointment_TypeId,
            createDate: originalApp.createAt,
            doctorId: originalApp.doctor ? originalApp.doctor.doctorId : -1,
            deleted: originalApp.deleted,
            quantity: 1,
            isReExamination: originalApp.appointmentPatientRecord.reExamination == "" ? false : true
        }
        $scope.validStatus = originalApp.appointmentStatus ? originalApp.appointmentStatus.status : ""

        const btnUpdateAppointment = document.getElementById('btnUpdateAppointment');
        btnUpdateAppointment.click();
    }

    $scope.setupTabLApp = (appointment) => {
        let appointmentId = appointment.appointmentId
        $scope.currentTab = -1 + '-' + appointmentId;

        $scope.selectTabLApp = (tab, $event) => {
            $event.preventDefault()
            $scope.currentTab = tab + '-' + appointmentId
        }
        $scope.isSelectedLApp = (tab) => {
            return $scope.currentTab === tab + '-' + appointmentId
        }

        $scope.day = moment(appointment.appointmentDate, ('YYYY-MM-DD')).toDate().getDate();
        $scope.day < 10 ? '0' + $scope.day : $scope.day
        $scope.month = moment(appointment.appointmentDate, ('YYYY-MM-DD')).toDate().getMonth() + 1;
        $scope.month < 10 ? '0' + $scope.month : $scope.month
        $scope.year = moment(appointment.appointmentDate, ('YYYY-MM-DD')).toDate().getFullYear();

        $scope.getBillByAppointment(appointmentId, $scope.listBillByAppointmentAndPatientDB)
        $scope.getPrescriptionByAppointment(appointment, $scope.listPrescriptionByAppointmentAndMedicinesDB)
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

    $scope.getBillByAppointment = (appointmentId, listBillByAppointmentAndPatientDB) => {
        if (listBillByAppointmentAndPatientDB == null || appointmentId == null) return
        $scope.bill = listBillByAppointmentAndPatientDB.filter(bill => bill.appointments.appointmentId === appointmentId)
        $http.post(url + '/generateBarcode', { text: $scope.bill[0].appointments.patient.patientId }, { headers: headers })
            .then(response => {
                if (response.data && response.data.message) {
                    $scope.barcodeImage = response.data.message;
                    console.log("Barcode generated successfully");
                } else {
                    console.error("Unexpected response format");
                }
            })
            .catch(err => {
                console.error("Error generating barcode", err);
            });
    }

    $scope.getPrescriptionWithMedicinesByAppointment = (appointmentId) => {
        let params = {
            appointmentId: appointmentId
        }
        $http.get(url + '/prescription-by-appointment', { params: params, headers: headers }).then(response => {
            $scope.listPrescriptionByAppointmentAndMedicinesDB = response.data

        })
            .catch(err => {
                console.error("Error fetching prescription data", err);
            });
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
        //return uniqueMedicines
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

    $scope.getDetailsAppointment = (appointmentId) => {
        let duData = $scope.listDoctorUnavailabilityAllDoctorDB.filter(du => {
            let id = du.appointment && du.appointment.appointmentId ? du.appointment.appointmentId : du.appointmentId
            return id === appointmentId
        })
        return duData
    };


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

        $scope.$evalAsync(() => {
            document.fonts.ready.then(() => {
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
                        const imgData = canvas.toDataURL('image/png');

                        if (imgData === 'data:,') {
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
    };


    $scope.initializeUIComponentsLApp = () => {
        $('.drgpicker-lapp').daterangepicker(
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
            }
        );
        $('.drgpicker-lapp').on('apply.daterangepicker', function (ev, picker) {
            let selectedDate = $('#formAppoinmentSearchDate').val();
            $scope.getDateFilter(selectedDate)
        });
        $('.drgpicker-lapp').on('cancel.daterangepicker', function (ev, picker) {
            $scope.clearDateFilter()
        });

        $('.select2-multi').select2({
            multiple: true,
            theme: 'bootstrap4',
            placeholder: '---Nhập triệu chứng ---',
            allowClear: true
        }).val(null).trigger('change');


        $('#doctorFilterTableApp').on('change', function () {
            $timeout(function () {
                let selectedVals = $('#doctorFilterTableApp').val()
                $scope.selectedDoctorLApp = processSelect2Service.processSelect2Data(selectedVals)
                $scope.getListDoctorUnavailabilityAllDoctor()
            });
        });

        $('#patientFilterTableApp').on('change', function () {
            $timeout(function () {
                let selectedVals = $('#patientFilterTableApp').val()
                $scope.selectedPatientLApp = processSelect2Service.processSelect2Data(selectedVals)
                $scope.getListDoctorUnavailabilityAllDoctor()
            });
        });

        $('#IsReExaminationFilter').on('change', function () {
            $timeout(function () {
                $scope.getListDoctorUnavailabilityAllDoctor()
            });
        });

        $('#appStatusFilterTableApp').on('change', function () {
            $timeout(function () {
                let selectedVals = $('#appStatusFilterTableApp').val()
                $scope.selectedStatusLApp = processSelect2Service.processSelect2Data(selectedVals)
                $scope.getListDoctorUnavailabilityAllDoctor()
            });
        });
    }

    $scope.closeModalAndNavigate = () => {
        $location.path('/admin/patients');
        $scope.$apply();
    }

    $scope.urlImgDoctorSignatureDisplay = (filename) => {
        return url + "/imgDoctorSignature/" + filename;
    }

    $scope.clickAppointmentToAccept = () => {
        const appointmentId = localStorage.getItem('clickedAppointmentId');
        const attemptClick = (retries) => {
            if (retries <= 0) {
                localStorage.removeItem('clickedAppointmentId');
                return;
            }

            const pElement = document.getElementById('appointment' + appointmentId);

            if (pElement) {
                pElement.click();
                localStorage.removeItem('clickedAppointmentId');
            } else {
                $timeout(() => attemptClick(retries - 1), 500);
            }
        };
        attemptClick(10);
    };




    $scope.initializeUIComponents()
    $scope.getAllDentalIssuesExceptDeleted()
    $scope.getAllDentalIssuesExceptDeletedUp()
    $scope.initializeCalendarAppointment()
    $scope.setupTab()
    $scope.getListAppointmentType()
    $scope.getListAppointmentStatus()
    $scope.getListPatient()
    $scope.getListAppointment()
    $scope.getAllDoctorUnavailabilityExceptDeleted()
    $scope.getListDoctor()
    $scope.listServiceInfo()
    // list appointment
    $scope.initializeUIComponentsLApp()
    $scope.getListDoctorUnavailabilityAllDoctor()
    $scope.getBillByAppointmentAndPatient($scope.appointmentIdParam, $scope.patientIdParam)
    $scope.getPrescriptionWithMedicinesByAppointment($scope.appointmentIdParam)
    $scope.getAllAppointmentServiceExceptDeleted()
    $scope.getListAppointmentStatusFilter()
    $scope.getListPatientFilter()
    $scope.getListDoctorFilter()
    $scope.clickAppointmentToAccept();
})


