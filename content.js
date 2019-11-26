//generate page id,,   avoid one message dulpulicatedly listenned by dulpulicated content.js instances. avoid doing duplicate things.
var pageid = Math.random();

function export2youzheng() {
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
			channel.postMessage({pageid: ` + pageid + `, value});
			console.log('injected script posted' + value.mailNo);
		  });
		})
	  };

	`;
	document.head.appendChild(scritpElm);
	document.body.insertAdjacentHTML('afterBegin', `
	<div style="position: fixed; top: 10px; right:20px">
	<button id='btnTakeIn' onclick="exportToYouzheng()">导入到邮政系统</button>
	</div>
	`);
	console.log("from content.js main");
	// Define your database
	var db = new Dexie("parcels_database");
	db.version(1).stores({
		parcels: 'mailNo,name,mobilePhone,authCode,date,status'
	});
	const channel = new BroadcastChannel('example-channel');
	channel.addEventListener('message', (event) => {
		if (event.data.pageid !== pageid)
			return;
		console.log('on message');
		console.log(event.data.value);
		db.parcels.add(event.data.value).then(function () {
			//
			// Then when data is stored, read from it
			//
			console.log('db added: ' + value.mailNo);
		});
		chrome.runtime.sendMessage(event.data.value, function (response) {
			console.log(response);
			db.parcels.update(response.mailNo, { status: response.status });
		});
	});
}

function addressInput() {
	var receiverSection = document.querySelectorAll('.section')[1];
	receiverSection.insertAdjacentHTML('afterBegin', `
		<input oninput='oninputReciever(event)' style='width: 90vw'/>
	`);

	var scritpElm = document.createElement('script');
	scritpElm.text = `
	function oninputReciever(event) {
		const channel = new BroadcastChannel('address-input-channel');
		channel.postMessage({pageid: `+ pageid + `, value:event.target.value});
	};
	`
	document.head.appendChild(scritpElm);

	// select element involved
	var elRecName = receiverSection.querySelector('.rec-name input');
	var elRecMobilePhone = receiverSection.querySelector('.rec-mobile input');
	var elAddressDetail = receiverSection.querySelector('.address-detail')

	const channel = new BroadcastChannel('address-input-channel');
	channel.addEventListener('message', (event) => {
		if (event.data.pageid !== pageid)
			return;

		var oAddr = tryAddr(event.data.value)[0];  // first address
		elRecName.value = oAddr.name;
		elRecMobilePhone.value = oAddr.phone;
		elAddressDetail.value = oAddr.province + oAddr.city + oAddr.district + '  ' + oAddr.addr_detail;
	});
}

async function Main() {
	// 寄件 页面
	if (location.href.indexOf('sendMailOnlineNotArrival') > 0) {
		addressInput();
	}

	// 查件 页面
	if (location.href.indexOf('billSearch') > 0) {
		export2youzheng();
	}
}

// 收费加密part 2/2，看到此段代码的，恭喜你，进入了 新的领域，学习代码吧，开源 github，免费是礼物
var intervalId = setInterval(function () {
	chrome.storage.local.get('isActivated', function (getRes) {
		if (getRes.isActivated) {
			Main().then();    // 执行 主代码
			clearInterval(intervalId);
		}
	});
}, 1000);
