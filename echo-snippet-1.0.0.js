// MIT license, see: https://github.com/guest271314/echo-snippets/blob/master/LICENSE
var blobs = [];

var echo = function echo(data) {
  var blob = window.URL.createObjectURL(new Blob([data], {
    "type": type
  }));
  
  blobs.push(blob);
  
  return blob
};

// usage
// $.get(echo("<p>This is echoed the response in HTML format</p>", "text/html")
// , function(data, textStatus, jqxhr) {
//  console.log(data, textStatus, jqxhr, blobs);
// });
