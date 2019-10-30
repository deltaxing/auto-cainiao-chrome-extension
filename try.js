function myqueryMobile(param) {
  return new Promise(function (resolve, reject) {
    jQuery.get("/api/order/querySensitiveInfo.do", param, function (serverData) {
      if (serverData.success) {
        popupBox.isHide = false;
        if (serverData.data.needNc) {
          popupBox.isHideNc = false;
        } else {
          var mobilePhone = serverData.data.receiverMobile;
          var mailNo = serverData.data.mailNo;
          var name = serverData.data.receiverName;
          var authCode = serverData.data.authCode;
          console.log(mailNo + ' ' + name + ' ' + mobilePhone + ' ' + authCode);
          resolve({
            mailNo,
            name,
            mobilePhone,
            authCode,
          });
        }
      }
    }, "json")
  });
}

function exportToYouzheng() {
  var btns = document.querySelectorAll('[data-tool="showMobile"]')
  var YouzhengItems = [];
  btns.forEach(btn => {
    var stationOrderCode = btn.getAttribute("data");
    myqueryMobile({
      stationOrderCode: stationOrderCode,
      umid: umx.getToken()
    }).then(function (value) {
      console.log(value);
      value.date = Date();
      db.parcels.put(value).then (function(){
        //
        // Then when data is stored, read from it
        //
    })
    });
  })
};