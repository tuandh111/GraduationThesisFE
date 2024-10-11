app.controller('AdminDashboardController', function ($scope, $http, $rootScope, $location, API, adminBreadcrumbService, $timeout, processSelect2Service) {
  let url = API.getBaseUrl();
  let headers = API.getHeaders();
  adminBreadcrumbService.generateBreadcrumb()
  let areachart = null


  $scope.initData = () => {
    $scope.venueToday = 0
    $scope.venuePreviousToday = 0
    $scope.venueByMonth = 0
    $scope.revenuePreviousMonth = 0
    $scope.growthPercentageDate = 0
    $scope.appointmentConversionRate = 0
    $scope.appointmentCancelRate = 0
    $scope.dateDataDB = []
    $scope.listAppointmentCurrentYearDB = []
    $scope.listAppointmentPreviousYearDB = []

    $scope.today = moment(new Date()).format('DD/MM/YYYY')
    $scope.thisYear = moment().year().toString()
    $scope.filterByMonth = moment(new Date()).format('MM/YYYY')
    $scope.chartArea($scope.filterByMonth)
    $scope.fetchTotalRevenueByYear($scope.thisYear)
    $scope.fetchRevenueByDateOrMonth($scope.filterByMonth)
    $scope.fetchListAppointmentByYear($scope.thisYear)
    $scope.fetchListAppointmentByToDay($scope.filterByMonth)
    $scope.fetchTop5Service($scope.thisYear)
    $scope.formFilter = {
      id: ''
    }

  }

  $scope.getTop5Service = (param) => {
    return $http.get(url + '/get-top-five-service', { params: param });
  }

  $scope.fetchTop5Service = (dateString) => {
    let param = $scope.generateParamsForGetData(dateString)
    $scope.getTop5Service(param).then(response => {
      $scope.listTop5ServiceDB = response.data
    })
  }

  $scope.getPercentageOfTop5Service = (venueTotal, venueByService) => {
    let percent = 0
    if (venueTotal != 0) {
      percent = parseFloat((venueByService / venueTotal * 100).toFixed(2))
    }
    return percent
  }

  $scope.fetchTotalRevenueByYear = (dateString) => {
    let processParam = $scope.generateParamsForGetData(dateString)
    const currentYear = parseInt(processParam.year);
    const prevYear = currentYear - 1
    const param = $scope.generateParamsForGetData(currentYear.toString())
    const prevParam = {
      date: processParam.day ? prevDate.format('YYYY-MM-DD') : null,
      month: processParam.month ? (processParam.month - 1).toString() : null,
      year: processParam.year ? prevYear.toString() : null
    };

    $scope.getRevenue(param).then(response => {
      $scope.venueTotal = response.data;
    }).catch(error => {
      console.error('Lỗi khi lấy dữ liệu: ', error);
    });
    $scope.fetchTotalRevenueByPreviousYear(prevParam)
  };

  $scope.fetchTotalRevenueByPreviousYear = (prevParam) => {
    $scope.getRevenue(prevParam).then(response => {
      $scope.venuePrviousYear = response.data;
    }).catch(error => {
      console.error('Lỗi khi lấy dữ liệu: ', error);
    });
    $scope.getRevenueGrowthComparison(prevParam.date, prevParam.month, prevParam.year)
  };

  $scope.fetchRevenueByDateOrMonth = (dateString) => {
    const date = moment(dateString, 'DD/MM/YYYY');
    const processParam = $scope.generateParamsForGetData(dateString);
    const param = {
      date: processParam.day ? date.format('YYYY-MM-DD') : null,
      month: processParam.month ? processParam.month.toString() : null,
      year: processParam.year ? processParam.year.toString() : null
    };

    const prevDate = date.clone().subtract(1, 'days');
    const prevParam = {
      date: processParam.day ? prevDate.format('YYYY-MM-DD') : null,
      month: processParam.month ? (processParam.month - 1).toString() : null,
      year: processParam.year ? processParam.year.toString() : null
    };

    $scope.getRevenue(param).then(response => {
      if (param.date) {
        $scope.venueToday = response.data;
      }
      if (param.month) {
        $scope.venueByMonth = response.data;
      }
      $scope.fetchRevenueByPreviousDateOrPreviousMonth(prevParam);
    }).catch(error => {
      console.error('Lỗi khi lấy dữ liệu:', error);
    });
  };

  $scope.fetchRevenueByPreviousDateOrPreviousMonth = (prevParam) => {
    $scope.getRevenue(prevParam).then(response => {
      if (prevParam.date) {
        $scope.venuePreviousToday = response.data;
      }
      if (prevParam.month) {
        $scope.revenuePreviousMonth = response.data;
      }
      $scope.getRevenueGrowthComparison(prevParam.date, prevParam.month, prevParam.year)
    }).catch(error => {
      console.error('Lỗi khi lấy dữ liệu:', error);
    });
  };

  $scope.getRevenue = (param) => {
    return $http.get(url + '/get-revenue', { params: param });
  }

  $scope.getRevenueGrowthComparison = (date, month, year) => {

    const calculateGrowthPercentage = (currentRevenue, previousRevenue) => {
      if (previousRevenue == 0) {
        return currentRevenue > 0 ? 100 : 0
      }
      return ((currentRevenue - previousRevenue) / (previousRevenue == 0 ? 1 : previousRevenue)) * 100;
    };

    const updateGrowthData = (currentRevenue, previousRevenue, isDate, isMonth, isYear) => {
      const growthPercentage = calculateGrowthPercentage(currentRevenue, previousRevenue);
      if (isDate) {
        $scope.isGrowingDate = growthPercentage > 0;
        $scope.growthPercentageDate = growthPercentage !== 0 && previousRevenue !== 0
          ? growthPercentage.toFixed(2)
          : growthPercentage;
      }

      if (isMonth) {
        $scope.isGrowingMonth = growthPercentage > 0;
        $scope.growthPercentageMonth = growthPercentage !== 0 && previousRevenue !== 0
          ? growthPercentage.toFixed(2)
          : growthPercentage;
      }
      if (isYear) {
        $scope.isGrowingYear = growthPercentage > 0;
        $scope.growthPercentageYear = growthPercentage !== 0 && previousRevenue !== 0
          ? growthPercentage.toFixed(2)
          : growthPercentage;
      }

    };

    if (date && $scope.venueToday !== undefined && $scope.venuePreviousToday !== undefined) {
      let isDate = true
      let isMonth = false
      let isYear = false
      updateGrowthData($scope.venueToday, $scope.venuePreviousToday, isDate, isMonth, isYear);
    }

    if (month && $scope.venueByMonth !== undefined && $scope.revenuePreviousMonth !== undefined && year != null) {
      let isDate = false
      let isMonth = true
      let isYear = false
      updateGrowthData($scope.venueByMonth, $scope.revenuePreviousMonth, isDate, isMonth, isYear);
    }

    if (year && $scope.venueTotal !== undefined && $scope.venuePrviousYear !== undefined && month != null) {
      let isDate = false
      let isMonth = false
      let isYear = true
      updateGrowthData($scope.venueTotal, $scope.venuePrviousYear, isDate, isMonth, isYear);
    }

  };

  $scope.getRevenueAndDate = (monthParam) => {
    // monthString có dang MM-yyyy
    let p = {
      monthString: monthParam.replace('/', '-'),
      monthInteger: null,
      year: null
    }
    return new Promise((resolve, reject) => {
      $http.get(url + '/get-revenue-and-date', { params: p }).then((response) => {
        resolve(response.data)
      }).catch((error) => {
        reject(error)
      })
    })

  }

  $scope.generateMMYYYYData = () => {
    let condition = moment(new Date()).format('MM/YYYY')
    $http.get(url + '/get-date-data').then(response => {
      $scope.dateDataDB = response.data.map((item, index) => {
        return {
          id: index,
          value: item
        };
      });

      const selectedItem = $scope.dateDataDB.find(item => item.value === condition);
      if (selectedItem) {
        $scope.formFilter.id = selectedItem.id;
      } else {
        console.log("Không tìm thấy giá trị " + condition);
      }
    })
  }

  $scope.chartArea = (monthParam) => {
    $scope.getRevenueAndDate(monthParam).then(result => {
      let categories = result[0]
      let datas = result[1]
      if (areachart) {
        areachart.destroy();
      }
      let areaChartOptions = {
        series: [
          {
            name: "Doanh thu",
            data: datas
          }

        ],
        chart: {
          type: "area",
          height: 350,
          background: "transparent",
          stacked: !0,
          toolbar: {
            show: !1
          },
          zoom: {
            enabled: !1
          }
        },
        theme: {
          mode: colors.chartTheme
        },
        xaxis: {
          type: "category",
          categories: categories,
          labels: {
            formatter: function (value) {
              const date = moment(value);
              const day = date.format('DD');
              const month = date.format('MMMM');
              const monthsInVietnamese = {
                January: '1',
                February: '2',
                March: '3',
                April: '4',
                May: '5',
                June: '6',
                July: '7',
                August: '8',
                September: '9',
                October: '10',
                November: '11',
                December: '12'
              };
              return `${day}`;
              //return `${day}-${monthsInVietnamese[month]}`;
            },
            show: !0,
            trim: !1,
            minHeight: void 0,
            maxHeight: 120,
            style: {
              colors: colors.secondaryColor,
              cssClass: "text-secondary",
              fontSize: '13px',
              fontFamily: base.defaultFontFamily
            }
          },
          tickAmount: categories.length,
          tickPlacement: 'on',
          axisBorder: {
            show: !1
          },
          tooltip: {
            enabled: !1,
            offsetX: 0
          }
        },
        yaxis: {
          min: 0, // Giá trị thấp nhất
          max: 30000000, // Giá trị cao nhất (50 triệu đồng)
          tickAmount: 10, // Bước nhảy 
          labels: {
            formatter: function (value) {
              if (value === undefined || value === null) {
                return '0 đồng';
              }
              const millionValue = value / 1000000;
              return `${millionValue} triệu đồng`;
            },
            show: !0,
            trim: !1,
            offsetX: -10,
            minHeight: void 0,
            maxHeight: 120,
            style: {
              colors: colors.secondaryColor,
              cssClass: "text-secondary",
              fontSize: '13px',
              fontFamily: base.defaultFontFamily
            }
          }
        },
        markers: {
          size: 0,
          strokeColors: "#fff",
          strokeWidth: 0,
          strokeOpacity: .9,
          strokeDashArray: 0,
          fillOpacity: 1,
          discrete: [],
          shape: "circle",
          radius: 2,
          offsetX: 0,
          offsetY: 0,
          onClick: void 0,
          onDblClick: void 0,
          showNullDataPoints: !0,
          hover: {
            size: void 0,
            sizeOffset: 3
          }
        },
        colors: chartColors,
        dataLabels: {
          enabled: !1
        },
        stroke: {
          curve: "smooth",
          lineCap: "round",
          width: 0
        },
        fill: {
          type: "solid"
        },
        legend: {
          show: !1,
          position: "bottom",
          fontFamily: base.defaultFontFamily,
          fontWeight: 400,
          labels: {
            colors: colors.mutedColor,
            useSeriesColors: !1
          },
          markers: {
            width: 10,
            height: 10,
            strokeWidth: 0,
            strokeColor: "#fff",
            radius: 6
          },
          itemMargin: {
            horizontal: 10,
            vertical: 0
          },
          onItemClick: {
            toggleDataSeries: !0
          },
          onItemHover: {
            highlightDataSeries: !0
          }
        },
        grid: {
          show: !0,
          borderColor: colors.borderColor,
          strokeDashArray: 0,
          position: "back",
          xaxis: {
            lines: {
              show: !1
            }
          },
          yaxis: {
            lines: {
              show: !0
            }
          },
          row: {
            colors: void 0,
            opacity: .5
          },
          column: {
            colors: void 0,
            opacity: .5
          },
          padding: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          }
        },
        tooltip: {
          style: {
            fontSize: "12px",
            fontFamily: base.defaultFontFamily
          }
        }
      },
        areachartCtn = document.querySelector("#areaChart");
      areachartCtn && (areachart = new ApexCharts(areachartCtn, areaChartOptions)).render();
    })
  }

  $scope.generateParamsForGetData = (dateString) => {
    let params = {
      day: null,
      month: null,
      year: null
    };

    if (dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        params.day = day;
        params.month = month;
        params.year = year;
      } else if (parts.length === 2) {
        const [month, year] = parts;
        params.month = month;
        params.year = year;
      } else {
        throw new Error("Không đúng định dạng. Gia trị tham số cần định dạng DD/MM/YYYY or MM/YYYY.");
      }
    } else if (dateString.trim().length > 0) {
      params.year = dateString;
    } else {
      throw new Error("Tham số không được trống.");
    }

    return params;
  }

  $scope.fetchAppointments = (param, targetScope) => {
    return $http.get(url + '/appoinment-by-day-month-year', { params: param }).then(resp => {
      $scope[targetScope] = resp.data
      return $scope[targetScope]
    })
  }

  $scope.fetchListAppointmentByYear = (dateString) => {
    let temParam = $scope.generateParamsForGetData(dateString)
    const currentYear = parseInt(temParam.year);
    const prevYear = currentYear - 1;
    let currentParam = $scope.generateParamsForGetData(currentYear.toString())
    let prevParam = $scope.generateParamsForGetData(prevYear.toString())
    Promise.all([
      $scope.fetchAppointments(currentParam, 'listAppointmentCurrentYearDB'),
      $scope.fetchAppointments(prevParam, 'listAppointmentPreviousYearDB')
    ]).then(([currentYearData, previousYearData]) => {
      const cancelStatus = ["ĐÃ HỦY", "KHÔNG ĐẾN", "HOÃN"]
      $scope.listCompletedAppointments = currentYearData.filter(item => item.appointmentStatus.status.toUpperCase() === "HOÀN THÀNH")
      $scope.listCancelsAppointments = currentYearData.filter(item => cancelStatus.includes(item.appointmentStatus.status.toUpperCase()))

      if (currentYearData.length != 0) {
        let growth = ($scope.listCompletedAppointments.length / currentYearData.length) * 100
        $scope.appointmentConversionRate = parseFloat(growth.toFixed(2));

        let growthCancel = ($scope.listCancelsAppointments.length / currentYearData.length) * 100
        $scope.appointmentCancelRate = parseFloat(growthCancel.toFixed(2))
      } else {
        $scope.appointmentConversionRate = 0
        $scope.appointmentCancelRate = 0
      }
      $scope.radialbarChartCancel($scope.appointmentCancelRate)
      $scope.radialbarChart($scope.appointmentConversionRate)
      $scope.initPercentageAppoinmentByYear(currentYearData.length, previousYearData.length)
    }).catch(error => {
      console.error("Lỗi lấy dữ liệu:", error);
    });
  }

  $scope.fetchListAppointmentByToDay = (dateString) => {
    let param = $scope.generateParamsForGetData(dateString)
    let prevParam = {}
    if (param.day != null) {
      prevParam = $scope.generateParamsForGetData(moment(dateString, 'DD/MM/YYYY').subtract(1, 'days').format('DD/MM/YYYY'))
    } else if (param.month != null) {
      let prevDateString = (param.month - 1) + "/" + param.year
      prevParam = $scope.generateParamsForGetData(prevDateString)
    }
    Promise.all([
      $scope.fetchAppointments(param, 'listAppointmentDBTodayOrThisMonth'),
      $scope.fetchAppointments(prevParam, 'listAppointmentDBPreviousDayOrPreviousMonth')
    ]).then(([currentMonthData, previousMonthData]) => {
      $scope.initPercentageAppoinmentByMonth(currentMonthData.length, previousMonthData.length)
    }).catch(error => {
      console.error("Lỗi lấy dữ liệu:", error);
    });
  }

  $scope.calculateGrowthPercentage = (currentLength, previousLength) => {
    currentLength = parseFloat(currentLength);
    previousLength = parseFloat(previousLength);
    let appFluctuate = 0
    if (isNaN(currentLength) || isNaN(previousLength)) {
      return appFluctuate
    }

    if (previousLength === 0) {
      appFluctuate = currentLength === 0 ? 0 : 100;
    } else {
      let growth = ((currentLength - previousLength) / previousLength) * 100;
      appFluctuate = parseFloat(growth.toFixed(2));
    }
    return appFluctuate
  }

  $scope.initPercentageAppoinmentByYear = (currentLength, previousLength) => {
    let percentage = $scope.calculateGrowthPercentage(currentLength, previousLength)
    $scope.percentageAppoinmentByYear = percentage
    $scope.$apply();
    $scope.radialbarWidgetChart(percentage)
  }

  $scope.initPercentageAppoinmentByMonth = (currentLength, previousLength) => {
    let percentage = $scope.calculateGrowthPercentage(currentLength, previousLength)
    $scope.percentageAppoinmentByMonth = percentage
    $scope.$apply();
  }

  $scope.initUI = () => {
    $('.select2').select2(
      {
        theme: 'bootstrap4',
      });
    $('#filterByMonth').on('change', function () {
      $timeout(function () {
        let selectedVals = $('#filterByMonth').val()
        selectedVals = selectedVals.split(':')[1]
        $scope.filterByMonth = $scope.dateDataDB.find(item => parseInt(item.id) === parseInt(selectedVals)).value
        $scope.chartArea($scope.filterByMonth)
        let year = parseInt($scope.filterByMonth.split('/')[1])
        $scope.thisYear = year
        $scope.fetchTotalRevenueByYear($scope.filterByMonth)
        $scope.fetchRevenueByDateOrMonth($scope.filterByMonth)
        $scope.fetchListAppointmentByYear($scope.filterByMonth)
        $scope.fetchListAppointmentByToDay($scope.filterByMonth)
        $scope.fetchTop5Service($scope.thisYear.toString())
      });
    });
  }

  $scope.radialbarWidgetChart = (percentage) => {
    var radialbarWidgetChart, radialbarWidgetOptions = {
      series: [percentage],
      chart: {
        height: 120,
        type: "radialBar"
      },
      theme: {
        mode: colors.chartTheme
      },
      plotOptions: {
        radialBar: {
          hollow: {
            size: "70%"
          },
          track: {
            background: colors.borderColor
          },
          dataLabels: {
            show: !0,
            name: {
              fontSize: "0.875rem",
              fontWeight: 400,
              offsetY: -10,
              show: !1,
              color: colors.mutedColor,
              fontFamily: base.defaultFontFamily
            },
            value: {
              formatter: function (e) {
                return parseInt(e)
              },
              fontSize: "1.53125rem",
              fontWeight: 700,
              fontFamily: base.defaultFontFamily,
              offsetY: 10,
              show: !0,
              color: colors.headingColor
            },
            total: {
              show: !1,
              fontSize: "0.875rem",
              fontWeight: 400,
              offsetY: -10,
              label: "Percent",
              color: colors.mutedColor,
              fontFamily: base.defaultFontFamily
            }
          }
        }
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          type: "diagonal2",
          shadeIntensity: .2,
          gradientFromColors: [extend.primaryColorLighter],
          gradientToColors: [base.primaryColor],
          inverseColors: !0,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [20, 100]
        }
      },
      stroke: {
        lineCap: "round"
      }
    },
      radialbarWidget = document.querySelector("#radialbarWidget");
    radialbarWidget && (radialbarWidgetChart = new ApexCharts(radialbarWidget, radialbarWidgetOptions)).render();
  }

  $scope.radialbarChart = (percentage) => {
    var radialbarChart, radialbarOptions = {
      series: [percentage],
      chart: {
        height: 200,
        type: "radialBar"
      },
      plotOptions: {
        radialBar: {
          hollow: {
            size: "75%"
          },
          track: {
            background: colors.borderColor
          },
          dataLabels: {
            show: !0,
            name: {
              fontSize: "0.875rem",
              fontWeight: 400,
              offsetY: -10,
              show: !0,
              color: colors.mutedColor,
              fontFamily: base.defaultFontFamily
            },
            value: {
              formatter: function (e) {
                return parseInt(e)
              },
              color: colors.headingColor,
              fontSize: "1.53125rem",
              fontWeight: 700,
              fontFamily: base.defaultFontFamily,
              offsetY: 5,
              show: !0
            },
            total: {
              show: !0,
              fontSize: "0.875rem",
              fontWeight: 400,
              offsetY: -10,
              label: "Phần trăm chuyển đổi",
              color: colors.mutedColor,
              fontFamily: base.defaultFontFamily
            }
          }
        }
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          type: "diagonal2",
          shadeIntensity: .2,
          gradientFromColors: [extend.primaryColorLighter],
          gradientToColors: [extend.primaryColorDark],
          inverseColors: !0,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [20, 100]
        }
      },
      stroke: {
        lineCap: "round"
      },
      labels: ["CPU"]
    },
      radialbar = document.querySelector("#radialbar");
    radialbar && (radialbarChart = new ApexCharts(radialbar, radialbarOptions)).render();
  }

  $scope.radialbarChartCancel = (percentage) => {
    var radialbarChart, radialbarOptions = {
      series: [percentage],
      chart: {
        height: 200,
        type: "radialBar"
      },
      plotOptions: {
        radialBar: {
          hollow: {
            size: "75%"
          },
          track: {
            background: colors.borderColor
          },
          dataLabels: {
            show: !0,
            name: {
              fontSize: "0.875rem",
              fontWeight: 400,
              offsetY: -10,
              show: !0,
              color: colors.mutedColor,
              fontFamily: base.defaultFontFamily
            },
            value: {
              formatter: function (e) {
                return parseInt(e)
              },
              color: colors.headingColor,
              fontSize: "1.53125rem",
              fontWeight: 700,
              fontFamily: base.defaultFontFamily,
              offsetY: 5,
              show: !0
            },
            total: {
              show: !0,
              fontSize: "0.875rem",
              fontWeight: 400,
              offsetY: -10,
              label: "Phần trăm chuyển đổi",
              color: colors.mutedColor,
              fontFamily: base.defaultFontFamily
            }
          }
        }
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          type: "diagonal2",
          shadeIntensity: .2,
          gradientFromColors: ["#FF5C5C"],  // Màu đỏ sáng
          gradientToColors: ["#FF2C2C"],
          // gradientFromColors: [extend.primaryColorLighter],
          // gradientToColors: [extend.primaryColorDark],
          inverseColors: !0,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [20, 100]
        }
      },
      stroke: {
        lineCap: "round"
      },
      labels: ["CPU"]
    },
      radialbar = document.querySelector("#radialbarCancel");
    radialbar && (radialbarChart = new ApexCharts(radialbar, radialbarOptions)).render();
  }

  $scope.initUI()
  $scope.initData()
  $scope.generateMMYYYYData()
})

