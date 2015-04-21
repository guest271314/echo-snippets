// MIT license https://github.com/guest271314/echo-snippets/blob/master/LICENSE
// echo-snippet-1.1.0.js 
// Reference http://meta.stackoverflow.com/questions/288902/

$(function() {
  // utilize `$(document)` object as `this` at `complete`,
  // `$(document).data().requestData` to log processes 
  $(document).data({
      "requestData": {
        "requests": [],
        "delay": null,
        "delayStart": null,
        "delayStop": null,
        "settings": void 0,
        // log `progress` messages , 
        "progress": function progress(msg) {
          return (function(msg) {
            if (this.delayStart === null) {
              this.delayStart = $.now();
            } else {
              this.delayStop = $.now();
            };
            console.log("processing `echo-snippet` at " 
                   + (this.delayStop === null ? this.delayStart : $.now() 
                   + " delay complete:" + (this.delayStop - this.delayStart)),
                   this,
                   msg ? msg : "progress message:" + msg + "\n")
          }).call(this, msg)
        }
      }
    })
    // do stuff at `ajaxStop`, `ajaxComplete`, `ajaxError` ,
    // when all `ajax` stuff complete
    .on("ajaxStop ajaxComplete ajaxError"
    , function(event, jqxhr, settings, errorThrown) {

      $(this).data().requestData.settings = settings;

      var type = event.type;

      var complete = $(this).dequeue("complete").promise("complete");

      // pass `jqxhr` jQuery `Promise` from `ajaxError` ,
      // `ajaxComplete` ; `ajaxStop` does not return `jqxhr` object ,
      // pass `complete` at `ajaxStop`
      // `this`:`$(document)`
      $.when.call(this, jqxhr || complete)
      .then(function response(jqxhr) {
          console.log("\n" + type, jqxhr, this);
          // `complete`
          if ($(this).is(document)) {
            console.log("\n`echo-snippet` complete at", $.now(), "\n\ndone!");
          };
        }, function error(jqxhr) {
            console.log(type, jqxhr.statusText, this)
        });

    });
  // create `blob` utilizing `window.URL.createObjectURL`
  var echo = function echo(response) {
    var blob = window.URL.createObjectURL(new Blob([response.data], {
      "type": response.type
    }));
    // save reference to `window.URL.createObjectURL` ,
    // `cache` set to true, calling `window.URL.revokeObjectURL`
    // has no effect; though `object URL` "released" at `unload`
    // see `#Notes` at MDN `URL.createObjectURL()`
    // "Each time you call createObjectURL(), a new object URL is 
    // created, even if you've already created one for the same object.  
    // Each of these must be released by calling `URL.revokeObjectURL()` 
    // when you no longer need them. Browsers will release these 
    // automatically when the document is unloaded; 
    // however, for optimal performance and memory usage,
    // if there are safe times when you can explicitly unload them,
    // you should do so."

    // array of object URL's
    $(document).data().requestData.requests.push(blob);

    return blob
  };

  // do `ajax` request stuff
  // `args`: callback `function`; `object`; other; optional
  var request = function request(e, response, args) {
    // `e`: `event`
    if (e) {
      e.preventDefault();
    };

    try {
      if (args) {
        if (typeof args === "function") {
          args()
        } else {
          args.requestData.progress()
        }
      }
    } catch (e) {
      console.log(e)
    };
    // ajax request
    return $.ajax({
      async: true,
      // cache: false,
      type: "GET",
      url: echo(response), // here is it... the echo page
      beforeSend: function(jqxhr) {
        console.log("Fired prior to the request");
        // jqxhr.abort();
      },
      success: function(data, textStatus, jqxhr) {

        console.log("Fired when the request is successfull");

        console.log(data, "\n" + textStatus
                   , "\n" + jqxhr.getAllResponseHeaders());

        $(".document").append(data);
      },
      complete: function() {
        console.log("Fired when the request is complete");
      }
    });

  };
  // set "request "`.queue()` for `delay`, 
  // set `"complete"` `.queue()` for completion of all processes
  var response = function response(res, delay, args, e) {

    var delay = delay || 0;

    $(document).data().requestData.delay = delay;

    var _res = {
      "data": res.data,
      "type": res.type
    };

    var dfd = function(e, args) {
      return $(document)
        .delay(delay, "request")
        .queue("request", function delayRequest() {
          return $.when(request(e || null, _res, args)
                        , $(this).queue("complete", $.noop))
                 
        })
        .dequeue("request")

    };
    // `dfd` `Promise`, `args` if any
    var promise = $.when(dfd, args);

    return promise
  };

  var _event = void 0;
  
  // `data`:data returned from object URL
  // `type`:`MIME type` of data
  var _echo = new response({
      "data": "<p>This is echoed the response in HTML format</p>",
      "type": "text/html"
    },
    // delay
    3500,
    // `requestData` , settings object
    $(document).data(),
    _event);

  // log message
  console.log("`echo-snippet` promise at ".concat($.now() + " :"), _echo,
    "delay:", $(document).data().requestData.delay,
    "event:", _event, "\n");

  $(document).on("click", ".ajax", function(e) {

    e.preventDefault();

    _echo.then(function(_request, args) {
      try {
        if (args) {
          if (typeof args === "function") {
            args()
          } else {
            // pass message to `requestData.progress`
            args.requestData.progress("\n`echo-snippet` start , message at " 
                                     + $.now()  + " // do stuff");
          }
        }
      } catch (e) {
        console.log(e)
      };
      // call `request`, 
      // pass `e`:`click` `event`, `args` to `request`
      return _request(e || null, args)
      }, function(err) {
      console.log("error:", err)
    })

  });

});
