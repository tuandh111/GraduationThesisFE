app.controller('AdminNotifications', function ($scope, $http, $rootScope, $location, $timeout, API, $route, adminBreadcrumbService, processSelect2Service) {
    let url = API.getBaseUrl();
    let headers = API.getHeaders();
    adminBreadcrumbService.generateBreadcrumb()
    // code here
    $scope.updateStatus = () => {
        // let details = $scope.getDetailsAppointment(app.appointmentId)
        // if ($scope.isDisabledStatus(status)) return;
        // const originalApp = app
        // if (originalApp == null) {
        //     return
        // }
        // $scope.getOriginalData(originalApp.appointmentId);
        // $scope.originalDate = moment(originalApp.appointmentDate, ('YYYY-MM-DD')).format('DD/MM/YYYY')
        // $scope.comparasionDateEvent(originalApp.appointmentDate)
        // $scope.selectedTosOriginal = []
        // details.forEach(du => {
        //     $scope.selectedTosOriginal.push(du.timeOfShift)
        // })
        // $scope.formUpApp = {
        //     reExaminationDate: originalApp.appointmentPatientRecord.reExamination,
        //     currentCondition: originalApp.appointmentPatientRecord.currentCodition,
        //     appointmentDate: $scope.originalDate,
        //     fullName: originalApp.doctor.fullName,
        //     startTime: details[0].timeOfShift.beginTime,
        //     endTime: details[details.length - 1].timeOfShift.endTime,
        //     patientId: originalApp.patient.patientId,
        //     appointmentStatus: originalApp.appointmentStatus ? originalApp.appointmentStatus.appointment_StatusId : 2,
        //     appointmentTypeId: originalApp.appointmentType.appointment_TypeId,
        //     createDate: originalApp.createAt,
        //     doctorId: originalApp.doctor.doctorId,
        //     deleted: originalApp.deleted,
        //     quantity: 1,
        //     isReExamination: originalApp.appointmentPatientRecord.reExamination == "" ? false : true
        // }
        // $scope.validStatus = originalApp.appointmentStatus ? originalApp.appointmentStatus.status : ""

        const btnUpdateAppointmentNotifications = document.getElementById('btnUpdateAppointmentNotifications');
        btnUpdateAppointmentNotifications.click();
    }

    $scope.closeFormUp = () => {
        $scope.selectedServices = []
        $scope.selectedTimeOfShift = []
        const btnCloseFormUpApp = document.getElementById('btn-close-form-update-status')
        btnCloseFormUpApp.click()
        $scope.$apply()
        $route.reload()
    }
})