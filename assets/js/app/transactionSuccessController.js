app.controller('TransactionSuccessController', function ($scope, SocketService,$http, API) {
    const url = API.getBaseUrl();
    const headers = API.getHeaders();

    const extractAppointmentNumber = (transactionDescription) => {
        const match = transactionDescription.match(/appointment\s+(\d+)(?:-|(?=\s))/);
        return match ? match[1] : null;
    };
    

    (function () {
        var units = 'không một hai ba bốn năm sáu bảy tám chín'.split(' ');
        const tram = 'trăm';
        const muoi = 'mươi';
        const nghin = 'nghìn';
        const trieu = 'triệu';
    
        function convertTwoDigits(number) {
            const tens = Math.floor(number / 10);
            const ones = number % 10;
            let result = '';
    
            if (tens > 1) {
                result = units[tens] + ' ' + muoi;
                if (ones === 1) {
                    result += ' mốt';
                } else if (ones === 5) {
                    result += ' lăm';
                } else if (ones > 0) {
                    result += ' ' + units[ones];
                }
            } else if (tens === 1) {
                result = 'mười';
                if (ones > 0) {
                    result += ' ' + units[ones];
                }
            } else {
                result = units[ones];
            }
    
            return result;
        }
    
        function convertThreeDigits(number) {
            const hundreds = Math.floor(number / 100);
            const rest = number % 100;
            let result = '';
    
            if (hundreds > 0) {
                result = units[hundreds] + ' ' + tram;
                if (rest > 0) {
                    result += ' ' + convertTwoDigits(rest);
                }
            } else {
                result = convertTwoDigits(rest);
            }
    
            return result;
        }
    
        function toVietnamese(input) {
            input = input.toString();  // Ensure the input is a string
            let [str] = input.split('.');  // Ignore decimals
            str = parseInt(str, 10).toString();  // Convert to string without leading zeros
            let length = str.length;
    
            if (length === 0 || isNaN(str)) {
                return '';
            }
    
            let result = [];
            if (length > 3) {
                let thousands = parseInt(str.slice(-6, -3)) || 0;
                let hundreds = parseInt(str.slice(-3)) || 0;
    
                if (thousands > 0) {
                    result.push(convertThreeDigits(thousands) + ' ' + nghin);
                }
                if (hundreds > 0) {
                    result.push(convertThreeDigits(hundreds));
                }
            } else {
                result.push(convertThreeDigits(parseInt(str)));
            }
    
            return result.join(' ').trim();
        }
    
        if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
            module.exports = toVietnamese;
        } else if (typeof window !== undefined) {
            window.toVietnamese = toVietnamese;
        }
    
        return toVietnamese;
    })();

    let appointmentPaymentSuccess;

    $http.get(url + '/transactions?accountNumber=0969281254&transactionDateMin=2024-08-18%2000%3A23%3A00&limit=1', { headers: headers })
        .then(response => {
             appointmentPaymentSuccess = extractAppointmentNumber(response.data.transactions[0].transactionContent);
             if (appointmentPaymentSuccess) {
                $scope.transactionSuccess = response.data
                return $http.get(url + `/bill-by-appointment-and-patient?appointmentId=${appointmentPaymentSuccess}`, { headers: headers });
            } else {
                throw new Error("Appointment ID could not be extracted from the transaction content.");
            }
        })
        .then(response => {
            const bill = response.data[0];  // Assuming the first bill is the one to update
            if (bill) {
                bill.status = "Đã thanh toán";
                bill.appointmentId = appointmentPaymentSuccess;
                return $http.put(url + `/ct-bill/${bill.billId}`, bill, { headers: headers });
            } else {
                throw new Error("No bill found for the given appointment.");
            }
        })
        .then(response => {
            let patientId = response.data.appointments.patient.patientId;
            // socket send 
            let appointmentDate = response.data.appointments.appointmentDate;
            $http.get(url + '/get-email-by-patient-id',{params:{patientId:patientId}} ,{ headers: headers }).then(response => {
                let email = response.data.email;
                let message = {
                    getterMail: email,
                    body: "Hóa đơn ngày " + appointmentDate+ " thanh toán thành công"
                };
    
                SocketService.getStompClient().then(function (stompClient) {
                    stompClient.send("/app/private-message", {}, JSON.stringify(message));
                }).catch(function (error) {
                    console.error('Socket connection error: ' + error);
                });
           })



            let billAmount = toVietnamese(response.data.totalCost)
            // Prepare PaymentRequest object
            const paymentRequest = {
                appointmentId: appointmentPaymentSuccess,  // Use the updated bill's appointmentId
                text: billAmount,
                paymentMethod: "ATM"
            };

            // Send mail after bill update
            return $http.post(url + '/sendMail', paymentRequest, { headers: headers });
        })
        .then(response => {
            console.log("Mail sent successfully:", response.data);
        })
        .catch(err => {
            
            console.error("Error:", err);
            window.location.reload();
        });
});
