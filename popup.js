chrome.storage.local.get(['searchRecords'], function(result) {
  console.log(result.searchRecords);
  result.searchRecords.forEach(element => { //beforeend
    document.querySelector('tbody').insertAdjacentHTML('afterend',
      element
    );
  });
});

function newTab(url) {
  chrome.tabs.create({url: url});
}

function toExcel() {
  var elt = document.getElementById('data-table');
  var wb = XLSX.utils.table_to_book(elt, {sheet:"Sheet JS"});
  XLSX.writeFile(wb, '查询记录.xlsx');
}
document.querySelector('#toExcel').onclick = toExcel;

function clear() {
  if(confirm('确定要清空查询记录吗')){
    chrome.storage.local.set({searchRecords: []}, function(result) {
      console.log('searchRecords list cleared');
    });  
  }
}
document.querySelector('#clear').onclick = clear;