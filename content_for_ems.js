
async function Main() {
	// inject js and html into page
	var scritpElm = document.createElement('script');
	scritpElm.text = `
	console.log("onload from injected");

	`;
	document.head.appendChild(scritpElm);

	console.log("from content.js main");
	const to_youzheng_channel = new BroadcastChannel('to_youzheng_channel');
	window.addEventListener('message', (event) => {
		console.log(event);
		fetch("/yjzq.do?method=queryOutpostDT&ydh=" + event.mailNo + "&sjh=", { "credentials": "include", "headers": { "accept": "application/json, text/javascript, */*; q=0.01", "accept-language": "zh-CN,zh;q=0.9", "csrftoken": token.value, "x-requested-with": "XMLHttpRequest" }, "referrerPolicy": "no-referrer-when-downgrade", "body": null, "method": "POST", "mode": "cors" }).then(resp => { return resp.json(); }).then(value => {
			console.log(value);
			console.log('got it');
		});
	});

	window.addEventListener("message", receiveMessage, false);

	function receiveMessage(event) {
		console.log(event);
	}

	chrome.runtime.onMessage.addListener(
		function (request, sender, sendResponse) {
			console.log(token.value);

			fetch("/yjzq.do?method=queryOutpostDT&ydh=" + request.mailNo + "&sjh=", { "credentials": "include", "headers": { "accept": "application/json, text/javascript, */*; q=0.01", "accept-language": "zh-CN,zh;q=0.9", "csrftoken": token.value, "x-requested-with": "XMLHttpRequest" }, "referrerPolicy": "no-referrer-when-downgrade", "body": null, "method": "POST", "mode": "cors" }).then(resp => { return resp.json(); }).then(value => {
				console.log(value);
				console.log('got it');
				if (value.length > 0) {
					console.log('duplicated:' + request.mailNo);
					sendResponse('duplicated:' + request.mailNo);
					return;
				}

				fetch("/yjzq.do?method=newDTPost&ydh=" + request.mailNo + "&randnum=" + Date(), { "credentials": "include", "headers": { "accept": "application/json, text/javascript, */*; q=0.01", "accept-language": "zh-CN,zh;q=0.9", "csrftoken": token.value, "x-requested-with": "XMLHttpRequest" }, "referrerPolicy": "no-referrer-when-downgrade", "body": null, "method": "POST", "mode": "cors" }).then(resp => { return resp.json(); }).then(value => {
					var resp = { mailNo: request.mailNo, status: value, log: 'by fetch newDTPost' };
					sendResponse(resp);
				});
			});
			console.log(request);
			return true; //indicate async
		});
}

Main().then();
