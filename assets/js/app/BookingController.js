app.controller('BookingController', function ($scope, $http,SocketService ,$rootScope, $location, $timeout,API, $q) {
    let url = API.getBaseUrl();
    let headers = API.getHeaders();
    $scope.isPatient = API.getUser()?API.getUser().split("-")[1]=='BENH_NHAN':null
    $scope.isLogin = localStorage.getItem("isLogin") ? localStorage.getItem("isLogin") : false;
    var specialtyId = 0;

    $scope.doctorId = -1;
    $scope.daySelected = "";
    $scope.foundServices = []
    $scope.hourLenghtSelected = 0;
    $scope.hasSelectedService = false; // Biến để kiểm tra xem có dịch vụ nào được chọn
    $scope.hasSelectedtHours = false;
    $scope.hourSelected = []
    $scope.isEnoughHour = false;
    $scope.isFastBookingForm = false; // Biến để kiểm tra xem có phải là form đặt lịch nhanh không
    $scope.issueIds = [];
    $scope.listSelectedService = [];
    $scope.listDoctorUnavailabilityByDoctorDB = [];
    $scope.listDoctorUnavailabilityByDate = []
    $scope.listDoctorScheduleByDate = []
    $scope.selectAll = false;
    $scope.selectAllEnable = true;
    $scope.listServiceSelected = []
    $scope.listShiftHours = []
    $scope.selectedShiftHour = [];
    $scope.selectedShift = null
    $scope.servicePage = false;
    $scope.showConfirmForm = true;
    $scope.symtomTrue = false;
    $scope.showSymptoms = false
    $scope.totalPrice = 0;
    $scope.totalTime = 0;
    $scope.patientAdding = [];
    $scope.patientIdLogin = -1;
    $scope.patientLogin = []
    $scope.listServiceDB = [];
    $scope.filteredServices = [];
    $scope.listAppointmentByDate = [];
    $scope.searchQuery = ""; // Search input model
    $scope.currentPage = 1;
    $scope.pageSize = 6; // Number of items per page
    $scope.isAllowedFastBooking = true;
    $scope.phoneNumber = ""; // Khởi tạo biến nếu chưa được khởi tạo

    function normalizeVietnameseString(str) {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    }
    // Hàm loại bỏ các phần tử trùng lặp
    $scope.dutyDays = [];

    $scope.init = function (){
            $scope.servicePage = false;
            
            $('.select2-multi').select2({
                multiple: true,
                theme: 'bootstrap4',
                placeholder: "   -- Chọn triệu chứng --",
                allowClear: true // Cho phép xóa lựa chọn để quay lại trạng thái placeholder
            });
            $('#formSymptom').on('change', function () {
                $timeout(function () {
                    $scope.loadTreatmeantAndServiceByIssue()
                 });
              });
            $scope.patientIdLogin = $scope.getUserLogin();
              // console.log($scope.patientIdLogin);
              if ($scope.patientIdLogin != -1) {
                  $http.get(url + '/patient-id/' + $scope.patientIdLogin, { headers: headers }).then(response => {
                      $scope.patientLogin = response.data;
                      $scope.fullName = $scope.patientLogin.fullName;
                      $scope.phoneNumber =  $scope.patientLogin.phoneNumber
                  });
              }
                    // Lấy URL hiện tại
            var currentUrl = window.location.href;
            // Tách chuỗi để lấy số sau dấu '/' cuối cùng
            var segments = currentUrl.split('/');
            var lastSegment = segments.pop(); // Lấy phần tử cuối cùng của mảng
            // console.log(lastSegment);
              
            // Nếu số được lấy có giá trị hợp lệ, thực hiện chức năng
            if (!isNaN(lastSegment) && lastSegment) {
                // console.log("Số sau dấu '/' cuối cùng là:", lastSegment);
                $scope.selectDoctor(lastSegment)
            
            }
            if(!($scope.getUserLogin() == -1) && !$scope.isPatient){
                $scope.isAllowedFastBooking = false;
            }
            console.log( $scope.isLogin);
            
    }

    $scope.getUserLogin = function() {
        var userString = localStorage.getItem('userLogin');
        if (userString) {
            // Tách chuỗi tại dấu gạch ngang đầu tiên
            var parts = userString.split('-');
            var userNumber = parts[0];
            var userType = parts[1];
            
            // Kiểm tra nếu phần đầu tiên là số và phần thứ hai là "BENH_NHAN"
            var numberOnly = userNumber.match(/^\d+/);

            if (numberOnly && userType === "BENH_NHAN") {
                // Thực hiện tiếp chương trình
                return numberOnly[0];
            } else {
                return -1; // hoặc xử lý lỗi nếu không đúng định dạng
            }
        }
        return -1;
    };
    
    
    $scope.formValidateColor = function() {
            var form = document.getElementById('appointmentForm');
            var isVal = form.checkValidity()
            var shiftClass = document.getElementById("formShift").classList;
            var shiftHour = document.getElementById("formShiftHour-feedback");
            var shift = document.getElementById("formShift-feedback");
            isVal = true;

            if ($scope.issueIds.length === 0 && !$scope.showSymptoms) {
                var firstElement = document.querySelector('.select2-selection.select2-selection--multiple');
                if (firstElement) {
                    firstElement.style.borderColor = '#dc3545';
                }
                $scope.symtomTrue = true;
                isVal = false;
                return isVal;
            } else {
                var firstElement = document.querySelector('.select2-selection.select2-selection--multiple');
                if (firstElement) {
                    firstElement.style.borderColor = '#3ad29f';
                }

                $scope.symtomTrue = false;
            }
            console.log(isVal);
            
        if($scope.isFastBookingForm){
            //Nếu là form đặt nhanh
            $scope.phoneNumber = document.getElementById("formPhoneNumber").value;
            $scope.daySelected = document.getElementById("formDate").value;
            $scope.fullName = document.getElementById("fullName").value

            if($scope.fullName === ""){              
                isVal = false
                console.log(isVal);
                return isVal
            }
            
            if($scope.phoneNumber === ""){
                isVal = false
                console.log(isVal);
                return isVal
            }
            console.log(isVal);
            
        }else{

            if (shiftClass.contains('ng-invalid')) {

                shift.classList.remove("ng-hide");
                isVal = false;
                return isVal;
            }else{
                shift.classList.add("ng-hide");
                
            }
            if (!$scope.hasSelectedtHours) {
                shiftHour.classList.remove("ng-hide");
                isVal = false;
                return isVal;
            }else{
                shiftHour.classList.add("ng-hide");
            }
            
            
            if(!$scope.isCorrectBookingHoour()){
                isVal = false;
                
                return isVal;
            }
        }
        
        
        return isVal;
    }
    $scope.isCorrectBookingHoour  = function() {
        var sortedShifts = $scope.hourSelected.slice().sort(function(a, b) {
            return a.timeOfShiftId - b.timeOfShiftId;
        });

        // Kiểm tra tính liên tiếp
        for (var i = 0; i < sortedShifts.length - 1; i++) {
            if (sortedShifts[i + 1].timeOfShiftId !== sortedShifts[i].timeOfShiftId + 1) {
               
                return false; // Không liên tiếp
            }
        }
        return true;
    }
    $scope.showConfirmModal = function() {
        try {
            var isCorrectForm = $scope.formValidateColor();
            var isBookingYet = false;
            console.log('isCorrectForm', isCorrectForm);
            var validStatuses = ["đã đặt", "đã xác nhận", "đang diễn ra", "hoàn thành"];
            if (isCorrectForm) {
                if($scope.listSelectedService.length > 4 ){
                    Swal.fire({
                        title: "Không thành công!",
                        html: "Quý khách chỉ chọn trước tối đa 4 dịch vụ!",
                        icon: "error"
                    });
                    $scope.showConfirmForm = true;
                    return false;
                }
        
                $scope.getListAppointmentByDate($scope.daySelected).then(function() {
                    if ($scope.listAppointmentByDate && $scope.listAppointmentByDate.length > 0) {
                        if($scope.isFastBookingForm){
                            var apByNum = $scope.listAppointmentByDate.filter(a => a.patient.phoneNumber == $scope.phoneNumber);
                            console.log(apByNum);
                            if (apByNum.length > 0) {
                                if(validStatuses.includes(apByNum.appointmentStatus.status.toLowerCase())){
                                    if (apByNum.appointmentType.typeNametoLowerCase() !== "tái khám") {
                                    Swal.fire({
                                        title: "Không thành công!",
                                        html: "Quý khách đã có lịch khám ngày " + $scope.daySelected + "!\n Quý khách vui lòng liên hệ nhân viên tư vấn nếu cần hỗ trợ thêm.",
                                        icon: "error"
                                    });
                                    isBookingYet = true;
                                }
                                }
                            }
                        } else if($scope.patientIdLogin != -1){
                            var apById = $scope.listAppointmentByDate.find(a => a.patient.patientId == $scope.patientIdLogin);
                            console.log(apById);

                            if (apById && validStatuses.includes(apById.appointmentStatus.status.toLowerCase())) {
                                if (apById.appointmentType.typeName.toLowerCase() !== "tái khám") {
                                    Swal.fire({
                                        title: "Không thành công!",
                                        html: "Quý khách đã có lịch khám ngày " + $scope.daySelected + "!\n Quý khách vui lòng liên hệ nhân viên tư vấn nếu cần hỗ trợ thêm.",
                                        icon: "error"
                                    });
                                    isBookingYet = true;
                                }
                            }
                        }
                    }
                
                    if(isBookingYet){
                        return false;
                    }
                
                    if($scope.showformShift || !$scope.isFastBookingForm){
                        if($scope.hourLenghtSelected != $scope.getRecommendation()){
                            Swal.fire({
                                title: "Không thành công!!",
                                html: "Số ca quý khách chọn chưa đúng!",
                                icon: "error"
                            });
                            return false;
                        }
                        if(!$scope.isCorrectBookingHoour()){
                            Swal.fire({
                                title: "Không thành công!!",
                                html: "Quý khách cần chọn giờ liên tiếp tránh dịch vụ bị gián đoạn!",
                                icon: "error"
                            });
                            return false;
                        }
                
                        if ($scope.hourSelected.length < $scope.getRecommendation()) {
                            $scope.showConfirmForm = false;
                        } else {
                            $scope.showConfirmForm = false;
                            $scope.getListServiceSelected();
                        }
                    } else {
                        $scope.showConfirmForm = false;
                        $scope.getListServiceSelected();
                    }
                }).catch(error => {
                    console.error('Error in showConfirmModal:', error);
                });
                
            } else {
                $scope.showConfirmForm = true;
                document.getElementById('appointmentForm').classList.add('was-validated');
                Swal.fire({
                    title: "Thất bại!",
                    html: "Quý khách vui lòng chọn đầy đủ thông tin chính xác!",
                    icon: "error"
                });
            }
        } catch (error) {
            
            console.log('Đã xảy ra lỗi: ' + error.message);
        }
    }
    

    $scope.addPatientFastBooking = function(){        
        if($scope.patientIdLogin != -1){
            $scope.patientAdding = $scope.listPatient.filter(p => p.patientId == $scope.patientIdLogin)
            console.log( $scope.patientAdding);
            return $http.get(url + '/patient-id', $scope.patientAdding.patientId, { headers: headers });
        }else if($scope.isExistPatient($scope.phoneNumber)){
            $scope.patientAdding = $scope.listPatient.filter(p => p.phoneNumber == $scope.phoneNumber)

            console.log( "isExistPatien: ", $scope.patientAdding);
            return $http.get(url + '/patient-id', $scope.patientAdding.patientId, { headers: headers });
        }else{
            try {
                $scope.fullName = document.getElementById("fullName").value;
                $scope.phoneNumber = document.getElementById("phoneNumber").value;
            } catch (error) {
                
            }
           

            var patientData = {
                fullName: $scope.fullName,
                phoneNumber: $scope.phoneNumber,
                gender: "UNISEX",   
                birthday: null,
                CitizenIdentificationNumber: null,
                Type: false,
                deleted: false,
                imageURL: null,
            }

            console.log("Lưu thành công patient: ", patientData);
        
            return $http.post(url + '/patient', patientData, { headers: headers });
        }
        
    }

    $scope.addAppointmentPatientRecord = function(patientId) {
        var appointmentPatientRecordData = {
            createAt: new Date(),
            currentCondition: $scope.selectedIssuesString,
            reExamination: null,
            isDeleted: false,
            patientId: parseInt(patientId)
        };
        // console.log(appointmentPatientRecordData);
        
        return $http.post(url + '/appointment-patient-record', appointmentPatientRecordData, { headers: headers });
    };
    
    $scope.addAppointment = function(createdAppointmentPatientRecord, doctorId, patientId) {
        var appointmentTypeSelected = $scope.listAppointmentTypeDB.find(function(appointmentType) {
            return appointmentType.appointment_TypeId === 1;
        });
    
        var appointmentStatusSelected = $scope.listAppointmentStatusDB.find(function(appointmentStatus) {
            return appointmentStatus.appointment_StatusId === 1;
        });
        var note = $scope.formAppointmentRequestNote;

        if (Array.isArray(note)) {
            note = ""; // Nếu là mảng, chuyển thành chuỗi rỗng
        }

        note = note ? String(note) : null; // Ép kiểu về chuỗi, nếu rỗng hoặc undefined thì gán là null

        var appointmentRequestData = {
            createAt: new Date(),
            note: note,
            appointmentDate: $scope.daySelected,
            appointmentType: appointmentTypeSelected ? appointmentTypeSelected.appointment_TypeId : null,
            appointmentStatus: appointmentStatusSelected ? appointmentStatusSelected.appointment_StatusId : null,
            appointmentPatientRecord: createdAppointmentPatientRecord.appointmentPatientRecordId,
            dentalStaffId: null,
            doctorId: doctorId,
            patientId: patientId,
            isDeleted: false
        };
    
        return $http.post(url + '/appointment', appointmentRequestData, { headers: headers });
    };
    
    $scope.addDoctorUnavailability = function(createdAppointment) {
        var promises = [];
        $scope.hourSelected.forEach(hr => {
            var dateDoctorUnavailability = new Date($scope.daySelected);
            var hourParts = hr.beginTime.split(':');
            dateDoctorUnavailability.setHours(hourParts[0], hourParts[1], 0, 0);
    
            var doctorUnavailabilityData = {
                description: "Bận",
                isDeleted: false,
                date: dateDoctorUnavailability,
                timeOfShiftId: hr.timeOfShiftId,
                appointmentId: createdAppointment.appointmentId
            };
    
            promises.push($http.post(url + '/doctorUnavailability', doctorUnavailabilityData, { headers: headers }));
        });
    
        return Promise.all(promises);
    };

    $scope.addAppointmentService = function(appointmentId, serviceId, price) {
        var appointmentServiceData = {
            appointmentId: appointmentId,
            isDeleted: false,
            price: price,
            quantity: 1,
            serviceId: serviceId,
        };
        // console.log(appointmentServiceData)
        return $http.post(url + '/appointment-service', appointmentServiceData, { headers: headers });
    };

    $scope.confirmSaveAppointment = function() {
        let idAppointment;
        let appointmentPromise;
    
        if (!$scope.isFastBookingForm) {
            // Nếu là form chọn bác sĩ
            var patient = $scope.patientLogin;
            // console.log(patient);
            
            appointmentPromise = $scope.addAppointmentPatientRecord(patient.patientId)
                .then(response => {
                    var createdAppointmentPatientRecord = response.data;
                    return $scope.addAppointment(createdAppointmentPatientRecord, $scope.doctorId, patient.patientId);
                });
        } else {
            // console.log("đặt lich nhanh");
            // Nếu là form đặt lịch nhanh
            appointmentPromise = $scope.addPatientFastBooking()
                .then(response => {
                    if ($scope.isExistPatient($scope.phoneNumber)) {
                        var patientAdding = $scope.listPatient.filter(p => p.phoneNumber == $scope.phoneNumber);
                        $scope.patientAdding = patientAdding[0];
                        const patientId = Array.isArray($scope.patientAdding) ? $scope.patientAdding.patientId : $scope.patientAdding.patientId;
                        return $scope.addAppointmentPatientRecord(patientId);
                    } else {
                        $scope.patientAdding = response.data;
                        return $scope.addAppointmentPatientRecord($scope.patientAdding.patientId);
                    }
                })
                .then(response => {
                    var createdAppointmentPatientRecord = response.data;
                    return $scope.addAppointment(createdAppointmentPatientRecord, null, $scope.patientAdding.patientId);
                });
        }
    
        appointmentPromise
            .then(response => {
                var createdAppointment = response.data;
                idAppointment = createdAppointment.appointmentId;
                return $scope.getListServiceSelected().then(selectedServices => {
                    var servicePromises = selectedServices.map(service => {
                        return $scope.addAppointmentService(idAppointment, service.serviceId, service.price);
                    });
                    return $q.all(servicePromises).then(() => createdAppointment);
                });
            })
            .then(createdAppointment => {
                return $scope.addDoctorUnavailability(createdAppointment);
            })
            .then(() => {
                new Noty({
                    text: 'Thêm đặt lịch khám thành công !',
                    type: 'success',
                    timeout: 5000
                }).show() ;
                $scope.showConfirmForm = true;
                $scope.resetForm();
            
                // Send the idAppointment via WebSocket after everything is done
                SocketService.getStompClient().then(function (stompClient) {
                    // console.log('I send ' + idAppointment);
                    stompClient.send("/chatroom", {}, idAppointment);
                }).catch(function (error) {
                    console.error('Socket connection error: ' + error);
                });
                console.log(idAppointment);
                
                // // Đợi 5 giây sau khi Noty thông báo xong mới tải lại trang
                // setTimeout(function() {
                //     window.location.reload();
                // }, 5000);
            })
            .catch(error => {
                // console.log("Lỗi khi lưu dữ liệu!", error);
                $scope.showConfirmForm = true;
            });
    }            
    

    $scope.loadTreatmeantAndServiceByIssue = function() {
        // Lấy các triệu chứng đã chọn từ select2
        var selectedIssues = $('#formSymptom').val();
        // // console.log("Selected issues from select2:", selectedIssues);

        // Đảm bảo selectedIssuesForm là một mảng và reset lại mảng
        $scope.selectedIssuesForm = []
        selectedIssues.forEach(iss => {
            // Tìm đối tượng cần thêm từ danh sách database
            let issueToAdd = $scope.listDentalIssuesDB.find(issSel => issSel.dentalIssuesId == iss);

            // Nếu tìm thấy đối tượng, thêm vào mảng selectedIssuesForm
            if (issueToAdd) {
                $scope.selectedIssuesForm.push(issueToAdd);
                // // console.log("Đã thêm triệu chứng: ", issueToAdd);
            } else {
                // // console.log("Không tìm thấy triệu chứng với ID: ", iss);
            }
        });
        $scope.selectedIssuesString = $scope.selectedIssuesForm.map(issue => issue.name).join(', ');
        $scope.issueIds = selectedIssues.map(id => parseInt(id));
        if($scope.issueIds != []){
            $scope.selectAllEnable = true;
        }else{
            $scope.selectAllEnable = false;
        }
    
        // Tìm các điều trị tương ứng với các vấn đề đã chọn
        $scope.foundTreatments = $scope.issueIds.flatMap(issueId => 
            $scope.listIssuesTreatmentAutomationDB.filter(list => list.dentalIssues.dentalIssuesId === issueId)
        );
    
        $scope.foundTreatments = $scope.foundTreatments.filter(treatment => treatment.treatment !== null);
        // // console.log("Found issues:", $scope.selectedIssuesForm);
        
        // Tìm các dịch vụ tương ứng với các điều trị đã tìm được
        $scope.foundServices = $scope.foundTreatments.flatMap(treatment => 
            $scope.listServiceTreatmentAutomationDB.filter(list => list.treatment.treatmentId === treatment.treatment.treatmentId)
        );
    
        // Loại bỏ các dịch vụ trùng lặp
        let uniqueServices = {};
        $scope.foundServices.forEach(service => {
            if (service.service && service.service.serviceId && !uniqueServices[service.service.serviceId]) {
                uniqueServices[service.service.serviceId] = service;
            }
        });
    
        // Chuyển đối tượng uniqueServices thành mảng
        $scope.foundServices = Object.values(uniqueServices);
    
        // Sắp xếp dịch vụ theo giá tiền
        $scope.foundServices.sort((a, b) => {
            return a.service.price - b.service.price;
        });

        $scope.updateStatistics()
    };
    $scope.getListServiceSelected = function() {
        var selectedServices = [];
        var promises = [];

        if($scope.showSymptoms){
            
            angular.forEach($scope.listServiceDB, function(service) {
                if (service.selected) {
                    var promise = $http.get(url + '/service-id/' + service.serviceId, { headers: headers }).then(response => {
                        selectedServices.push(response.data);
                    });
                    promises.push(promise);
                }
            });
            return $q.all(promises).then(function() {
                $scope.listSelectedService = selectedServices;
                // console.log($scope.listSelectedService)
                $scope.convertedString = $scope.convertSelectedServiceToString();
                return selectedServices;
            });
        }else{
            angular.forEach($scope.foundServices, function(service) {
                if (service.selected) {
                    var promise = $http.get(url + '/service-id/' + service.service.serviceId, { headers: headers }).then(response => {
                        selectedServices.push(response.data);
                    });
                    promises.push(promise);
                }
            });
            return $q.all(promises).then(function() {
                $scope.listSelectedService = selectedServices;
                $scope.convertedString = $scope.convertSelectedServiceToString();
                return selectedServices;
            });
        }
    };

    $scope.convertSelectedServiceToString = function() {
        return $scope.listSelectedService.map(service => service.serviceName).join(', ');
    };

    $scope.uncheckAllCheckboxes = function() {
        $scope.listSelectedService = [];
        angular.forEach($scope.foundServices, function(service) {
            service.selected = false
        });
        console.log($scope.foundServices);
        $scope.resetForm()
        $scope.showSymptoms = ! $scope.showSymptoms;
        $scope.updateStatistics()
    };

    $scope.getListDoctorScheduleByDate = function(date) {
        var formattedDate = new Date(date).toISOString().split('T')[0];  // Ensure date is in yyyy-MM-dd format
        var params = { date: formattedDate };  // Wrap date in an object with key 'date'
        // // // console.log('Calling API with params:', params);  // Log params to verify
        return $http.get(url + '/doctor-schedule-by-date', { params: params }).then(response => {
            $scope.listDoctorScheduleByDate = response.data;
            
            return response.data;  // Ensure the promise resolves with the response data
        }).catch(error => {
            console.error('Error fetching doctor schedule:', error);
            $scope.listDoctorScheduleByDate = [];  // Reset data on error
            return [];  // Ensure the promise resolves with an empty array on error
        });
    };
    $scope.getTreatmentNamesString = function() {
            if ($scope.foundTreatments && $scope.foundTreatments.length > 0) {
                return $scope.foundTreatments.map(function(treatment) {
                    return treatment.treatment.treatmentName;
                }).join(', ');
            } else {
                return '';
            }
    }
    $scope.getListDentalStaff = function () {
        $http.get(url + '/dental-staff-except-deleted', { headers: headers }).then(response => {
            $scope.listDentalStaffDB = response.data;
        });
    }
    $scope.getListAppointmentType = function () {
        $http.get(url + '/appointment-type-except-deleted', { headers: headers }).then(response => {
            $scope.listAppointmentTypeDB = response.data;
            // console.log($scope.listAppointmentTypeDB)
        });
    }
    $scope.getListAppointmentStatus = function () {
        $http.get(url + '/appointment-status-except-deleted', { headers: headers }).then(response => {
            
            $scope.listAppointmentStatusDB = response.data;
        });
    }
    $scope.getListAppointmentPatientRecord = function () {
        $http.get(url + '/appointment-patient-record-except-deleted', { headers: headers }).then(response => {
            $scope.listAppointmentPatientRecordDB = response.data;
        });
    }
    $scope.getListAppointmentByDate = function (date) {
        return $http.get(url + '/appointment-by-date', { params: { date: date } })
        .then(response => {
            if (response.data && response.data.length > 0) {
                $scope.listAppointmentByDate = response.data;
            } else {
                // Xử lý trường hợp không có kết quả
                $scope.listAppointmentByDate = [];
            }
        })
        .catch(error => {
            // Xử lý lỗi nếu có
            console.error('Error fetching appointments:', error);
            $scope.listAppointmentByDate = [];
        });
    }

    $scope.getListIssuesTreatmentAutomation = function () {
        $http.get(url + '/issues-treatment-automation-except-deleted', { headers: headers }).then(response => {
            $scope.listIssuesTreatmentAutomationDB = response.data;
            // // // console.log('API getListIssuesTreatmentAutomation response:', response.data); 
        });
    }
    $scope.getListServiceTreatmentAutomation = function () {
        $http.get(url + '/service-treatment-except-deleted', { headers: headers }).then(response => {
            $scope.listServiceTreatmentAutomationDB = response.data;
            // // // console.log('API getListServiceTreatmentAutomation response:', $scope.listServiceTreatmentAutomationDB); 
        });
    }
    $scope.getListPatient = function () {
        $http.get(url + '/patient', { headers: headers }).then(response => {
            $scope.listPatient = response.data;
            // console.log($scope.listPatient);
            
        });
    }
    $scope.isExistPatient = function(phoneNum){
        return $scope.listPatient.find( p => p.phoneNumber == phoneNum ) !== undefined
    }
    $scope.getListDentalIssues = function () {
        $http.get(url + '/dental-issues', { headers: headers }).then(response => {
            $scope.listDentalIssuesDB = response.data;
           
            // Sắp xếp danh sách theo thuộc tính name sau khi đã chuẩn hóa
            $scope.listDentalIssuesDB.sort((a, b) => {
                let nameA = normalizeVietnameseString(a.name);
                let nameB = normalizeVietnameseString(b.name);

                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }
                return 0;
            });
            
            // // // console.log('API getListDentalIssues response:', $scope.listDentalIssuesDB); 
        });
    };

    $scope.getListService = function () {
        $http.get(url + '/service-except-deleted', { headers: headers }).then(response => {
            $scope.listServiceDB = response.data;
            $scope.updateFilteredServices();
        });
    }
    $scope.getListTreatment = function () {
        $http.get(url + '/treatment', { headers: headers }).then(response => {
            $scope.listTreatmentDB = response.data;
    
            // Sắp xếp danh sách theo thuộc tính treatmentName
            $scope.listTreatmentDB.sort((a, b) => {
                let nameA = normalizeVietnameseString(a.treatmentName); // chuyển đổi tất cả sang chữ hoa
                let nameB = normalizeVietnameseString(b.treatmentName); // chuyển đổi tất cả sang chữ hoa
    
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }
                return 0;
            });
    
            // // // console.log('Sorted getListTreatment:', $scope.listTreatmentDB); 
        }).catch(error => {
            console.error('API error:', error);
        });
    };
    $scope.getListAppointmentService = function () {
        $http.get(url + '/appointment-service', { headers: headers }).then(response => {
            $scope.listAppointmentService = response.data;
            // // console.log($scope.listAppointmentService)
        });
    }
    $scope.getListSpecialty = function () {
        $http.get(url + '/specialty', { headers: headers }).then(response => {
            $scope.listSpecialtyDB = response.data;
        });
    }
    $scope.getListDoctor = function () {
        $http.get(url + '/doctor', { headers: headers }).then(response => {
            $scope.listDoctorsDB = response.data;
            // // console.log($scope.listDoctorsDB)
        });
    }
    $scope.getListDoctorUnavailabilityByDoctor = function () {
        $http.get(url + '/doctorUnavailability-by-doctor', { params: { doctorId: $scope.doctorId } }).then(response => {
            $scope.listDoctorUnavailabilityByDoctorDB = response.data;
            // // // console.log(response.data)
        }).catch(error => {
            console.error('Error fetching doctor unavailability:', error);
            $scope.listDoctorUnavailabilityByDoctorDB = []; // Đặt lại danh sách nếu có lỗi
        });
    };

    $scope.getListShift = function () {
        $http.get(url + '/shift', { headers: headers }).then(response => {
            // console.log(response.data); 
            $scope.listShifts = response.data;
        });
    }
    $scope.getListTimeOfShift = function () {
        $http.get(url + '/time-of-shift', { headers: headers }).then(response => {
            // console.log(response.data)
            $scope.listTimeOfShifts = response.data;
          
        });
    }

    $scope.loadShiftHours = function() {


        
        var selectedOption = document.getElementById('formShift').options[document.getElementById('formShift').selectedIndex];
        var selectedLabel = selectedOption.text;
        console.log($scope.selectedShift);
        
        
        if ($scope.doctorId != -1) {
            // console.log($scope.listDoctorUnavailabilityByDoctorDB);
            
            $scope.listDoctorUnavailabilityByDate = $scope.listDoctorUnavailabilityByDoctorDB.filter(d => {
                // Lấy phần đầu của chuỗi ngày đến ký tự thứ 10 (2024-08-24)
                const formattedDate = d.date.slice(0, 10);
                
                // So sánh với $scope.daySelected
                return formattedDate === $scope.daySelected;
            });
            

            // console.log("$scope.listDoctorUnavailabilityByDate: ", $scope.listDoctorUnavailabilityByDate);
            var selectedShift = $scope.listShifts.find(shift => shift.name === selectedLabel);
            
            if (selectedShift) {
                var shiftId = selectedShift.shiftId;
                
                if (shiftId) {
                    $http.get(url + '/time-of-shift-by-shift-id/' + shiftId, { headers: headers }).then(response => {
                        $scope.listShiftHours = response.data;
    
                        angular.forEach($scope.listShiftHours, function(hour) {
                            if ($scope.listDoctorUnavailabilityByDate.some(avail => avail.timeOfShift.timeOfShiftId === hour.timeOfShiftId)) {
                                hour.isValid = true;
                            }
                        });
                        // console.log($scope.listShiftHours);
    
                    }).catch(error => {
                        // // console.log("Error fetching time of shift: " + error);
                        $scope.listShiftHours = [];
                    });
                } else {
                    // // console.log("Không lấy được Id");
                    $scope.listShiftHours = []; // Nếu không có ca làm việc được chọn, xóa danh sách giờ làm việc
                }
                $scope.selectedShiftHour = null; // Đặt lại giá trị giờ làm việc được chọn
            } else {
                // // console.log("Không tìm thấy ca làm việc tương ứng");
            }
            
        }else{
            //Fast
            var selectedShift = $scope.listShifts.find(shift => shift.name === selectedLabel);
            
            if (selectedShift) {
                var shiftId = selectedShift.shiftId;
                
                if (shiftId) {
                    $http.get(url + '/time-of-shift-by-shift-id/' + shiftId, { headers: headers }).then(response => {
                        $scope.listShiftHours = response.data;
    
                        // console.log($scope.listShiftHours);``
    
                    }).catch(error => {
                        // // console.log("Error fetching time of shift: " + error);
                        $scope.listShiftHours = [];
                    });
                } else {
                    // // console.log("Không lấy được Id");
                    $scope.listShiftHours = []; // Nếu không có ca làm việc được chọn, xóa danh sách giờ làm việc
                }
                $scope.selectedShiftHour = null; // Đặt lại giá trị giờ làm việc được chọn
            } else {
                // // console.log("Không tìm thấy ca làm việc tương ứng");
            }
        }
    };
    
    $scope.getFreeShiftOfDoctor = (shiftId, dateSelected, doctorId) => {
        var params = { 
            shiftId: shiftId,
            date: dateSelected,
            doctorId: doctorId
        }
        return $http.get(url + '/time-of-shift-available', { params: params }).then(response => {
            return $scope.listFreeShiftOfDoctorDB = response.data;

        }).catch(error => {
            // // console.log("Error: " + error)
            return []
        })
    }

    $scope.formBookingFill = (doctorId, dateValue) => {
        if($scope.isFastBookingForm){
            var today = $scope.getDateString(new Date())                
            $scope.dateChosen = today;
        }else{
            // Tìm đối tượng bác sĩ theo doctorId trong danh sách
            const doctor = $scope.listDoctorsDB.find(doc => doc.doctorId === doctorId);
            if (doctor) {
                // Điền thông tin vào form
                $scope.dateChosen = dateValue;
            } else {
                // // console.log(`Không tìm thấy bác sĩ với doctorId ${doctorId}`);
        }   
        }    
    };
    $scope.getDateString = function(date){
        if(!date){
            return ""
        }
        return date.toISOString().split('T')[0] // Sets the minimum selectable date to today      
    }
    $scope.getListShiftOfDoctorOnMonth = () => {
        // Chọn thẻ <h2> bên trong thẻ có class fc-center
        var headingElement = document.querySelector('.fc-toolbar-title');
        if (headingElement) {
            var headingText = headingElement.textContent || headingElement.innerText;

            // Giả sử nội dung văn bản là "tháng 6 năm 2024" hoặc "tháng 10 năm 2024"
            // Tách chuỗi để lấy tháng và năm
            var parts = headingText.split(' ');
            var month = "";
            var year = "";
            // Kiểm tra cấu trúc của parts để đảm bảo độ dài và giá trị hợp lý
            if (parts.length === 4 && parts[0] === 'tháng' && parts[2] === 'năm') {
                month = parts[1]; // Lấy giá trị tháng
                year = parts[3];  // Lấy giá trị năm

                // Kiểm tra và chuyển đổi tháng và năm sang số nguyên nếu cần thiết
                month = parseInt(month, 10);
                year = parseInt(year, 10);

                // Bây giờ bạn có thể sử dụng biến month và year để xử lý
            } else {
                // // console.log('Định dạng văn bản không đúng');
            }
        } else {
            // // console.log('Không tìm thấy thẻ <h2> bên trong thẻ có class fc-center');
        }        
        
        
        if(month == "" || year == ""){
            Swal.fire({
                title: "Lỗi!",
                html: "Không có dữ liệu lịch làm của bác sĩ theo tháng!",
                icon: "error"
            })
            return false;
        }
        
        var params = {
            doctorId: $scope.doctorId,
            month: month,
            year: year
        }
        // // console.log(params)
        $http.get(url + '/time-of-shift-available-by-month', { params: params }).then(response => {
            $scope.listFreeShiftOfDoctorDB = response.data;
             // Khởi tạo lại mảng dutyDays
             // console.log($scope.listFreeShiftOfDoctorDB);
             
            $scope.listFreeShiftOfDoctorDB.forEach(function(shift) {
                // Kiểm tra nếu mảng không rỗng và có phần tử đầu tiên
                if (shift.length > 0 && shift[0].date) {
                    var dateTime = shift[0].date;
                    var date = dateTime.split('T')[0]; // Lấy phần YYYY-MM-DD từ chuỗi datetime
        
                    // Kiểm tra nếu ngày chưa có trong mảng dutyDays
                    if (!$scope.dutyDays.includes(date)) {
                        $scope.dutyDays.push(date); // Thêm ngày vào mảng
                    }
                } else {
                    // // console.log("No date available in shift.");
                }
            });
            // Thêm class .fc-able cho các thẻ có data-date trùng với bất kỳ dữ liệu trong mảng dutyDays
            document.querySelectorAll('[data-date]').forEach(function(element) {
                var date = element.getAttribute('data-date');
                if ($scope.dutyDays.includes(date) && !element.classList.contains('fc-day-past')) {
                    element.classList.add('fc-able');
                }   
                if (element.classList.contains('fc-day-past') && !element.classList.contains('fc-able') && !element.classList.contains('fc-day-other')) {
                    element.classList.add('fc-unavailable');
                }
                if (element.classList.contains('fc-day-future') && !element.classList.contains('fc-able') && !element.classList.contains('fc-day-other')) {
                    element.classList.add('fc-unavailable');
                }
                // if (element.classList.contains('fc-day-past') && element.classList.contains('fc-past') ) {
                //     element.classList.remove('fc-able');  // Remove fc-able class if present
                // }
                
            });
        }).catch(error => {
            // // console.log("Error: " + error);
            return false;
        });
    }
    
    $scope.selectSpecialty = function(specialtyId) {
        $scope.selectedSpecialtyId = specialtyId; 
        if(specialtyId != 0){
            // // console.log("Selected Specialty ID:", specialtyId);
            $http.get(url + '/doctor-specialty/' + specialtyId, { headers: headers }).then(response => {
            $scope.listDoctorsDB = response.data;
        });
        }else{
            $http.get(url + '/doctor', { headers: headers }).then(response => {
                $scope.listDoctorsDB = response.data;
                // // console.log($scope.listDoctorsDB)
            });
        }
    }

    $scope.getListDoctorId = function() {
            $http.get(url + '/doctor-id/'+ $scope.doctorId, { headers: headers }).then(response => {
                $scope.doctorModel = response.data;
            });
    }

    $scope.selectDoctor = function(doctorId) {
        $scope.doctorId = angular.copy(doctorId);
        $scope.booleanDoctorChoosen = true;
        // Gọi hàm xóa và tạo lại thẻ calendar-book-appointment
        $scope.resetCalendarElement(doctorId);
        $scope.getListDoctorId();
    };
    
    $scope.resetCalendarElement = function(doctorId) {
        var oldCalendar = document.getElementById('calendar-book-appointment');
        if (oldCalendar) {
            var parent = oldCalendar.parentNode;
            var classes = oldCalendar.className;
            var newCalendar = document.createElement('div');
            newCalendar.id = 'calendar-book-appointment';
            newCalendar.className = classes;

            parent.removeChild(oldCalendar);
            parent.appendChild(newCalendar);
            
            $scope.initializeFullCalendar(doctorId)
        }
    };
    $scope.initializeFullCalendar = (doctorIdPicked) => {
        window.scrollTo(0, 1000);
        $scope.doctorId = doctorIdPicked;
        var events = [];
    
        let calendarEl = document.getElementById('calendar-book-appointment');
        let calendar = new FullCalendar2.Calendar(calendarEl, {
            timeZone: 'Asia/Ho_Chi_Minh',
            themeSystem: 'bootstrap',
            locale: 'vi',
            buttonText: {
                today: 'Hôm nay',
                month: 'Tháng',
                list: 'Lịch sử'
            },
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth'
            },
            navLinks: true,
            selectable: true,
            selectMirror: true,
            select: function (arg) {
                var userString = localStorage.getItem('userLogin');
                if(!userString){
                    console.log(userString);
                    Swal.fire({
                        title: "Không thành công!",
                        html: "Quý khách vui lòng đăng nhập để thực hiện chức năng !",
                        icon: "error"
                    });
                    return 0;
                }
                $scope.resetForm()
                $scope.daySelected = arg.startStr;

                $scope.getListAppointmentByDate($scope.daySelected);
                console.log($scope.listAppointmentByDate);
                
                // listApp.find(l => {
                    
                // })
                // Lấy ngày hiện tại
                var today = new Date();
                today.setHours(0, 0, 0, 0); // Đặt giờ phút giây milli giây về 0 để chỉ so sánh ngày

                // Lấy ngày được chọn
                var selectedDate = new Date($scope.daySelected);
               
                
                // Nếu ngày được chọn là ngày trước ngày hiện tại thì không làm gì cả
                if (selectedDate < today) {
                    return;
                }

                if ($scope.dutyDays.includes($scope.daySelected)) {
                    var modalElement = document.getElementById('modalBookAppointment');
                    var modal = new bootstrap.Modal(modalElement);
                    modal.show();        
                    $scope.formBookingFill($scope.doctorId, $scope.daySelected);
                    
                    $scope.getListDoctorScheduleByDate($scope.daySelected).then(function() {
                        $scope.getListDoctorScheduleByDoctorId = $scope.listDoctorScheduleByDate.filter(function(schedule) {
                            return schedule.doctor.doctorId === $scope.doctorId;
                        });
                        
                        if ($scope.getListDoctorScheduleByDoctorId.length > 0) {
                            $scope.selectedShift = null;  // hoặc chọn một giá trị mặc định
                        }
                        const shiftOrder = {
                            "Sáng": 1,
                            "Chiều": 2,
                            "Tối": 3
                        };
                    
                        $scope.getListDoctorScheduleByDoctorId.sort(function(a, b) {
                            return shiftOrder[a.shift.name] - shiftOrder[b.shift.name];
                        });

                        // console.log($scope.getListDoctorScheduleByDoctorId);
                        
                        
                        document.querySelectorAll('.invalid-feedback').forEach(function(element) {
                            element.classList.add('ng-hide');
                        });

                        $scope.getListDoctorUnavailabilityByDoctor();
                    });
                }

            },
            eventClick: function (arg) {
                // // console.log("Yo what's");
            },
            editable: true,
            dayMaxEvents: true,
            events: events,
            datesSet: function() {
                const disableClickOnDayNumbers = () => {
                    document.querySelectorAll(".fc-daygrid-day-number").forEach(fc => {
                        fc.parentNode.style.pointerEvents = 'none'; // Disable all pointer events on the parent container
                    });
                };
                
                // Run initially
                disableClickOnDayNumbers();
            
                // Observe changes in the calendar
                const observer = new MutationObserver(disableClickOnDayNumbers);
                observer.observe(document.getElementById('calendar-book-appointment'), {
                    childList: true,
                    subtree: true
                });
                var day = ""
                var todayElement = document.querySelector(".fc-day-today .fc-daygrid-day-number");
                // Kiểm tra nếu thẻ này tồn tại
                if (todayElement) {
                    // Đổi nội dung thành "25 ( Hôm nay )"
                    day = todayElement.textContent;
                    todayElement.textContent = "( Hôm nay: " +day +" )";
                }
                addButtonEventListeners();
            },
                     
            validRange: {
                start: new Date().toISOString().split('T')[0] // Sets the minimum selectable date to today
            }
           
        });
    
        calendar.render();
        $scope.getListShiftOfDoctorOnMonth();
    
        // Hàm để thêm sự kiện lắng nghe click cho các nút
        function addButtonEventListeners() {
            let todayButton = calendarEl.querySelector('.fc-today-button');
            let prevButton = calendarEl.querySelector('.fc-prev-button');
            let nextButton = calendarEl.querySelector('.fc-next-button');
            let monthButton = calendarEl.querySelector('.fc-dayGridMonth-button');
            
            if (todayButton && !todayButton.classList.contains('listener-added')) {
                todayButton.addEventListener('click', function() {
                    $scope.$apply(function() {
                        $scope.getListShiftOfDoctorOnMonth();
                    });
                });
                todayButton.classList.add('listener-added');
            }
    
            if (prevButton && !prevButton.classList.contains('listener-added')) {
                prevButton.addEventListener('click', function() {
                    $scope.$apply(function() {
                        $scope.getListShiftOfDoctorOnMonth();
                    });
                });
                prevButton.classList.add('listener-added');
            }
    
            if (nextButton && !nextButton.classList.contains('listener-added')) {
                nextButton.addEventListener('click', function() {
                    $scope.$apply(function() {
                        $scope.getListShiftOfDoctorOnMonth();
                    });
                });
                nextButton.classList.add('listener-added');
            }

            if (monthButton && !monthButton.classList.contains('listener-added')) {
                monthButton.addEventListener('click', function() {
                    $scope.$apply(function() {
                        $scope.getListShiftOfDoctorOnMonth();
                    });
                });
                monthButton.classList.add('listener-added');
            }
    
        }    
        
        // Gọi hàm để thêm sự kiện lắng nghe click lần đầu tiên
        addButtonEventListeners();
    };

    $scope.checkShifts = (dateValue) => {
        var doctorId = $scope.doctorId;
        Promise.all([
            $scope.getFreeShiftOfDoctor(1, dateValue, doctorId),
            $scope.getFreeShiftOfDoctor(2, dateValue, doctorId),
            $scope.getFreeShiftOfDoctor(3, dateValue, doctorId)
        ]).then(results => {
            var [shift1, shift2, shift3] = results;
            // // console.log(results);
            if (shift1.length == 0 || shift2.length == 0 || shift3.length == 0) {
                var dateElement = document.querySelector(`[data-date="${dateValue}"]`);
                if (dateElement) {
                    dateElement.classList.add('fc-unavailable');
                }
            } else {
                // // console.log("Có thể đăng ký hôm nay");
            }
        }).catch(error => {
            // // console.log("Có lỗi xảy ra khi kiểm tra các shift: ", error);
        });
    }

    $scope.toggleRowCheckbox = function(service) {
        if($scope.listSelectedService.length < 4 || service.selected) {
            service.selected = !service.selected;
        }

        
        // Cập nhật danh sách dịch vụ đã chọn
        $scope.getListServiceSelected();
        $scope.updateStatistics();
    }
    
    $scope.updateStatistics = function() {
        
        if($scope.foundServices.length > 0){
            $scope.totalPrice = $scope.foundServices
                .filter(service => service.selected)
                .reduce((sum, service) => sum + service.service.price, 0);
            
            $scope.totalTime = $scope.foundServices
                .filter(service => service.selected)
                .reduce((sum, service) => sum + service.service.timeEstimate, 0);
            
            $scope.hasSelectedService = $scope.foundServices.some(function(service) {
                return service.selected;
            })
        } else {
            
            var formSymptom = document.getElementById("formSymptom")
            formSymptom.classList.remove("ng-valid")
            formSymptom.classList.add("ng-invalid")

            $scope.totalPrice = $scope.listServiceDB
                .filter(service => service.selected)
                .reduce((sum, service) => sum + service.price, 0);
            $scope.totalTime = $scope.listServiceDB
                .filter(service => service.selected)
                .reduce((sum, service) => sum + service.timeEstimate, 0);
            
            $scope.hasSelectedService = $scope.listServiceDB.some(function(service) {
                return service.selected;
            });
        }
       
    };
    
    $scope.getRecommendation = function() {
        // Giả sử đây là logic để tính số khung thời gian khuyến nghị
        // Bạn có thể thay đổi logic này dựa trên yêu cầu của mình
        return Math.ceil($scope.totalTime / 30); // Ví dụ: 1 khung thời gian mỗi giờ
    };

    $scope.getTimeString = function() {
        if ( $scope.hourSelected.length === 0) {
            return '';
        }
    
        // Sắp xếp mảng dựa trên timeOfShiftId
        var sortedShifts = $scope.hourSelected.slice().sort(function(a, b) {
            return a.timeOfShiftId - b.timeOfShiftId;
        });
    
        // Lấy beginTime của đối tượng đầu tiên và endTime của đối tượng cuối cùng
        var beginTime = sortedShifts[0].beginTime;
        var endTime = sortedShifts[sortedShifts.length - 1].endTime;
    
        return beginTime + ' - ' + endTime;
    };
    $scope.resetForm = function() {

        $('#formSymptom').val(null).trigger('change');
        // Đặt mô hình AngularJS về giá trị rỗng

        $scope.selectedIssues = [];
        $scope.hasSelectedService = false;
        $scope.selectedShift = null;
        hasSelectedtHours = false;
        $scope.hourSelected = []
        $scope.selectedShiftHour = [];
        $scope.totalPrice = 0;
        $scope.totalTime = 0;
        $scope.listServiceSelected = []
        $scope.formAppointmentRequestNote = []
        $scope.listShiftHours = []
        $scope.loadTreatmeantAndServiceByIssue();
        $scope.hourLenghtSelected = 0;4

        angular.forEach($scope.listServiceDB, function(service) {
            service.selected = false
        });
        
        angular.forEach($scope.listShiftHours, function(hour) {
                hour.selected = false
        })
 
        
        console.log($scope.showSymptoms);
        
    }

    $scope.changeHourSelected = function(hour) {
        // Đổi trạng thái `selected` của đối tượng `hour`
        if(hour.isValid){
            return false;
        }

        if($scope.hourSelected.length == $scope.getRecommendation() && !hour.selected){

        }else{
            hour.selected = !hour.selected;
             // Cập nhật danh sách các giờ được chọn
        $scope.hourSelected = $scope.listShiftHours.filter(function(hour) {
            return hour.selected;
        });
        console.log($scope.hourSelected );
        // Kiểm tra xem có bất kỳ giờ nào được chọn hay không
        $scope.hasSelectedtHours = $scope.hourSelected.length > 0;
        $scope.hourLenghtSelected = $scope.hourSelected.length;
        }
    };
    
    //FastBookingForm>>
    $scope.openFastBookingModal = function(){
        
        $('.select2-multi').select2({
            multiple: true,
            theme: 'bootstrap4',
            placeholder: "   -- Chọn triệu chứng --",
            allowClear: true // Cho phép xóa lựa chọn để quay lại trạng thái placeholder
        });
        $('#formSymptom').on('change', function () {
            $timeout(function () {
                $scope.loadTreatmeantAndServiceByIssue()
             });
          });

        $scope.isFastBookingForm = true;
        var modalElement = document.getElementById('modalFastBookAppointment');
        var modal = new bootstrap.Modal(modalElement);
        modal.show();
        $scope.formBookingFill()
    }
    
    $scope.leaveFastBookingModal = function(){
        $scope.resetForm()
        $scope.isFastBookingForm = false;
    }


    $scope.serviceChoose = function(serviceId) {
        if(serviceId) {
            console.log(serviceId);
        
            // Lưu ID vào localStorage
            localStorage.setItem('selectedServiceId', serviceId);
        
            // Chuyển trang đến /service/{serviceId} mà không tải lại trang
            $location.path('/service/' + serviceId);
        }
    };
    
    $scope.updateFilteredServices = function() {
        let filteredList = $scope.listServiceDB.filter(function(service) {
            // Kiểm tra nếu searchQuery khớp với serviceName hoặc price
            let searchQueryLower = $scope.searchQuery.toLowerCase();
            return service.serviceName.toLowerCase().includes(searchQueryLower) ||
                   service.price.toString().includes($scope.searchQuery);
        });
    
        // Cập nhật tổng số trang
        $scope.totalPages = Math.ceil(filteredList.length / $scope.pageSize);
    
        // Phân trang kết quả tìm kiếm
        let start = ($scope.currentPage - 1) * $scope.pageSize;
        let end = start + $scope.pageSize;
        $scope.filteredServices = filteredList.slice(start, end);
        // console.log($scope.filteredServices);
    };

    $scope.setPage = function(page, event) {
        if (page >= 1 && page <= $scope.totalPages) {
            $scope.currentPage = page;
            $scope.updateFilteredServices();
        }
        if (event) {
            event.preventDefault(); // Prevent default link behavior
        }
    };

    $scope.prevPage = function(event) {
        if ($scope.currentPage > 1) {
            $scope.setPage($scope.currentPage - 1, event);
        }
    };

    $scope.nextPage = function(event) {
        if ($scope.currentPage < $scope.totalPages) {
            $scope.setPage($scope.currentPage + 1, event);
        }
    };
    $scope.findNameByPhoneNumber = function() {
        console.log($scope.phoneNumber);
        
        $scope.phoneNumber = document.getElementById("formPhoneNumber").value;

       if ($scope.phoneNumber.length >= 8 && $scope.phoneNumber.length <= 11) {
           
        
             var patient = $scope.listPatient.find(p => { 
                return p.phoneNumber == $scope.phoneNumber
            });
             if(patient){
                $scope.fullName = patient.fullName;
             }
       }else{
            $scope.fullName = "";
       }
    }

    $scope.closeConfirmForm = function(){
        $scope.showConfirmForm = true;
    }

    



    $scope.selectSpecialty(specialtyId) 
    $scope.getListDoctor()
    $scope.getListSpecialty()
    $scope.init()
    $scope.getListShift()
    $scope.getListDentalIssues()
    $scope.getListTreatment()
    $scope.getListService()
    $scope.getListIssuesTreatmentAutomation()
    $scope.getListServiceTreatmentAutomation()
    //Lấy dữ liệu đặt lịch
    $scope.getListAppointmentType()
    $scope.getListAppointmentStatus()
    $scope.getListAppointmentPatientRecord()

    $scope.getListTimeOfShift()
    $scope.getListAppointmentService()
    $scope.getListPatient()
})