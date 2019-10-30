
async function Main(){
	// inject js and html into page
	var scritpElm0 = document.createElement('script');
	scritpElm0.src = 'https://unpkg.com/dexie@latest/dist/dexie.js';  
	document.head.appendChild(scritpElm0);

	var scritpElm = document.createElement('script');
	scritpElm.text = `
	console.log("onload from injected");
	if(localStorage.searchRecords === undefined){
		localStorage.searchRecords = JSON.stringify([]);
	}

	var orderListBox = document.querySelector('#orderListBox');
	var orderUser = document.querySelector('#orderUser');
	var getSeq = document.querySelector('#getSeq');
	var orderPhone = document.querySelector('#orderPhone');

	console.log(orderListBox.childElementCount);
	
	// if(orderListBox.childElementCount > 0) {
	// 	// communication from page to extension,  across page
	// 	const channel = new BroadcastChannel('example-channel');
	// 	channel.postMessage({
	// 		orderListBox:orderListBox.innerHTML
	// 	});
	// }

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

			const channel = new BroadcastChannel('example-channel');
			channel.postMessage(value);
			console.log('posted');	

			var db = new Dexie("parcels_database");
			db.version(1).stores({
				parcels: 'mailNo,name,mobilePhone,authCode,date'
			});
			db.parcels.put(value).then (function(){
			  //
			  // Then when data is stored, read from it
			  //
			  console.log('putted');
		  })
		  });
		})
	  };

	`;
	document.head.appendChild(scritpElm);
	document.body.insertAdjacentHTML('afterBegin',`
	<div style="position: fixed; top: 10px; right:20px">
	<button id='btnTakeIn' onclick="exportToYouzheng()">导入到邮政系统</button>
	</div>
	`)
	console.log("from content.js main");

	// Define your database
	var db = new Dexie("parcels_database");
	db.version(1).stores({
		parcels: 'mailNo,name,mobilePhone,authCode,date'
	});

	const channel = new BroadcastChannel('example-channel');
	channel.addEventListener('message', (event) => {
		console.log('on message')
		console.log(event.data);
		chrome.runtime.sendMessage(event.data, function(response) {
			console.log(response);
		  });
	});



}

Main().then();
