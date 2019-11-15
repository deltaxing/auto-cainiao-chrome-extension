document.querySelector('#btnActivate').onclick = function () {
  var el_id = document.querySelector('#spId');
  var id = el_id.textContent;
  var el_activatingCode = document.querySelector('#activatingCode');
  var activatingCode = el_activatingCode.value;
  if (activatingCode == id * 12345 % 1000) {  // 激活码的算法
    chrome.storage.local.set({ isActivated: true }, function (setRes) {
      el_activatingCode.disabled = true;
      var btn = document.querySelector('#btnActivate');
      btn.disabled = true;
      btn.textContent = '已激活';
    });
  } else {
    alert('激活码 不对');
  }
}

// 收费加密part 1/2，看到此段代码的，恭喜你，进入了 新的领域，学习代码吧，开源 github，免费是礼物
setInterval(function () {

  chrome.storage.local.get('initDate', function (getRes) {
    console.log(getRes);
    document.querySelectorAll('#spId').forEach(element => { element.textContent = getRes.initDate % 10000 });

    if (!getRes.hasOwnProperty('initDate')) {
      console.log('it is {}');
      chrome.storage.local.set({ initDate: new Date().getTime() }, function (setRes) {
        console.log('initDate setRes');
        console.log(setRes);
      });
    };
  });

}, 1000);
