app.controller('DoctorController', function ($scope, $http, $rootScope, $location, $timeout, API, $q) {
    console.log("chạy được bác sĩ rồi nhé")
    let url = API.getBaseUrl();
    let headers = API.getHeaders();
    $scope.lenghtAppointmnetOfDoctor = 0;
    $scope.listAppointmentByDoctor = []
    $scope.maxTypeName = null;
    $scope.listDoctorsDB = [
        {
            doctorId: 1,
            fullName: "BS. Nguyễn Thị Mai",
            image: "https://randomuser.me/api/portraits/women/21.jpg",
            specialty: { specialtyName: "Nha khoa tổng quát" }
        },
        {
            doctorId: 2,
            fullName: "BS. Trần Văn Dũng",
            image: "https://randomuser.me/api/portraits/men/45.jpg",
            specialty: { specialtyName: "Chỉnh nha niềng răng" }
        },
        {
            doctorId: 3,
            fullName: "BS. Lê Thị Bích Ngọc",
            image: "https://randomuser.me/api/portraits/women/32.jpg",
            specialty: { specialtyName: "Nha khoa thẩm mỹ" }
        },
        {
            doctorId: 4,
            fullName: "BS. Phạm Minh Hoàng",
            image: "https://randomuser.me/api/portraits/men/34.jpg",
            specialty: { specialtyName: "Cấy ghép Implant" }
        },
        {
            doctorId: 5,
            fullName: "BS. Vũ Thị Hạnh",
            image: "https://randomuser.me/api/portraits/women/41.jpg",
            specialty: { specialtyName: "Phẫu thuật răng miệng" }
        },
        {
            doctorId: 6,
            fullName: "BS. Đinh Văn Quang",
            image: "https://randomuser.me/api/portraits/men/54.jpg",
            specialty: { specialtyName: "Nha chu học" }
        },
        {
            doctorId: 7,
            fullName: "BS. Nguyễn Thị Hồng",
            image: "https://randomuser.me/api/portraits/women/56.jpg",
            specialty: { specialtyName: "Nội nha – chữa tủy" }
        },
        {
            doctorId: 8,
            fullName: "BS. Bùi Thanh Tùng",
            image: "https://randomuser.me/api/portraits/men/61.jpg",
            specialty: { specialtyName: "Nha khoa trẻ em" }
        },
        {
            doctorId: 9,
            fullName: "BS. Hoàng Thị Diễm",
            image: "https://randomuser.me/api/portraits/women/67.jpg",
            specialty: { specialtyName: "Tẩy trắng răng" }
        },
        {
            doctorId: 10,
            fullName: "BS. Lâm Văn Khánh",
            image: "https://randomuser.me/api/portraits/men/69.jpg",
            specialty: { specialtyName: "Bọc răng sứ thẩm mỹ" }
        }
    ];
    $scope.init = function () {
        var currentUrl = $location.url();

        // Tách ID từ URL
        var match = currentUrl.match(/\/doctor-single\/(\d+)/);

        if (match) {
            // Nếu tìm thấy ID, match[1] chứa ID
            $scope.linkId = match[1];


            $scope.getDoctorById($scope.linkId)

            $scope.listAppointments().then(() => {
                $scope.countAppointmentOfDoctor($scope.linkId);
            });

        }
    }
    $scope.countAppointmentOfDoctor = function (doctorId) {

        $scope.listAppointmentByDoctor = $scope.listAppointment.filter(a => {
            if (!a.doctor) {
                return null
            }
            return a.doctor.doctorId = doctorId
        })

        $scope.lenghtAppointmnetOfDoctor = $scope.listAppointmentByDoctor.length;
        let typeCount = {};
        console.log();

        $scope.listAppointmentByDoctor.forEach(function (appointment) {
            let typeName = appointment.appointmentType.typeName;
            if (typeCount[typeName]) {
                typeCount[typeName]++;
            } else {
                typeCount[typeName] = 1;
            }
        });
        // Tìm typeName xuất hiện nhiều nhất

        let maxCount = 0;

        for (let typeName in typeCount) {
            if (typeCount[typeName] > maxCount) {
                maxCount = typeCount[typeName];
                $scope.maxTypeName = typeName;
            }
        }
        console.log("appointmentType.typeName xuất hiện nhiều nhất là:", $scope.maxTypeName);
        console.log($scope.listAppointmentByDoctor);
    }

    $scope.listAppointments = function () {
        return $http.get(url + '/appointment', { headers: headers }).then(response => {
            return $scope.listAppointment = response.data;
        });
    }

    $scope.getDoctorById = function (id) {
        $http.get(url + '/doctor-id/' + id, { headers: headers }).then(response => {
            $scope.doctorGot = response.data;
            console.log($scope.doctorGot)
        });
    }

    $scope.getListSpecialty = function () {
        $http.get(url + '/specialty', { headers: headers }).then(response => {
            $scope.listSpecialtyDB = response.data;
            console.log($scope.listSpecialtyDB);

        });
    }
    $scope.getListDoctor = function () {
        $http.get(url + '/doctor', { headers: headers }).then(response => {
            $scope.listDoctorsDB = response.data;
            console.log($scope.listDoctorsDB)
        });
    }

    $scope.selectSpecialty = function (specialtyId) {
        $scope.selectedSpecialtyId = specialtyId;
        if (specialtyId != 0) {
            // console.log("Selected Specialty ID:", specialtyId);
            $http.get(url + '/doctor-specialty/' + specialtyId, { headers: headers }).then(response => {
                $scope.listDoctorsDB = response.data;
            });
        } else {
            $http.get(url + '/doctor', { headers: headers }).then(response => {
                $scope.listDoctorsDB = response.data;
                // console.log($scope.listDoctorsDB)
            });
        }
    }

    $scope.urlImgDoctor = (filename) => {
        return url + "/imgDoctor/" + filename;
    }

    $scope.init()
    $scope.selectSpecialty(0)
    $scope.getListSpecialty()
    $scope.getListDoctor()
})