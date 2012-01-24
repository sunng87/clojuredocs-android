var android_clojuredocs = {};

android_clojuredocs.init = function() {

  android_clojuredocs.server =
    window.location.protocol == "file:" ?
    "http://clojuredocs.org":"http://127.0.0.1:8088";

  $('searchbtn').addEvent('click', function(e) {
    var token = $('searchbox').get('value');
    android_clojuredocs.dosearch(token);
  });
  $('searchbox').addEvent('keydown', function(e) {
    if (e.key == 'enter'){
      var token = $('searchbox').get('value');
      android_clojuredocs.dosearch(token);
    }
  });

  android_clojuredocs.current_view = "HOME";
  console.log("Initialized.")
};

android_clojuredocs.dosearch = function(token) {
  var url = android_clojuredocs.server + "/search?lib=clojure_core&q=" + token;
  var r = new Request.HTML({
    "url":url,
    "evalScripts": false,
    "filter": ".search_result",
    "onSuccess": function(_, resultDom, _, _) {
      android_clojuredocs.after_search(resultDom);
    }});
  r.get();
  android_clojuredocs.start_loading();
};

android_clojuredocs.after_search = function(results) {
  android_clojuredocs.end_loading();
  console.log(results.length);
  if (results.length > 0) {

    // remove existed search results and function view
    if($("search_result_container")){$("search_result_container").destroy()}
    if($("fcontainer")){$("fcontainer").destroy()}

    var parentList = new Element("ul", {"id": "search_result_container"});
    for (var i=0; i<results.length; i++) {
      var ele = results[i];
      var fname = ele.getElement("h4>a");
      var ns = ele.getElement("h4>span.ns>a");

      var new_name = '<span class="search_result_item_fname">'
        + fname.get("text") + "</span>"
        + '<br/><span class="search_result_item_ns">(' +ns.get("text") + ')</span>';
      var link = fname.get("href");

      var newEle = new Element("li");

      newEle.set("html", new_name).addClass('search_result_item');
      newEle.addEvent("click", function(target) {
        return function(){
          android_clojuredocs.open_function(target)
        };
      }(link));

      newEle.inject(parentList, "bottom");
    }
    // hide home view
    $("home").setStyle("display", "none");
    parentList.inject($("content"));
    android_clojuredocs.current_view = "SEARCH";
  } else {
    android_clojuredocs.showtip("No results Found.");
  }
};

android_clojuredocs.start_loading = function() {
  //navigator.notification.progressStart("Waiting...", "Loading content...");
  //navigator.notification.activityStart();
  PhoneGap.exec(null, null, "Notification", "activityStart", ["Please wait...","Loading..."]);
}
android_clojuredocs.end_loading = function() {
  //navigator.notification.progressStop();
  //navigator.notification.activityStop();
  PhoneGap.exec(null, null, "Notification", "activityStop", []);
}

android_clojuredocs.open_function = function(url) {
  android_clojuredocs.start_loading();
  console.log(url);
  var r = new Request.HTML({
    "url":android_clojuredocs.server + url,
    "evalScripts": false,
    "onSuccess": function(_, resultDom, _, _) {
      android_clojuredocs.after_page_loaded(resultDom);
    }
  });
  r.get();
};

android_clojuredocs.after_page_loaded = function(result){
  var nameele = result.filter("div.function_header")[0];
  var fname = nameele.getElement("h1").get("text").trim();
  var fns = nameele.getElement("h2>span.ns>a").get("text").trim();

  var usageele = result.filter("div.usage")[0];
  var fusages = usageele.getElements("li").map(function(e){return e.get("text")});

  var docele = result.filter("div.doc")[0];
  var fdocs = docele.getElement("div.content").get("text");

  var sourceele = result.filter("div.source_content")[0];
  var fsource = sourceele.getElement("pre").get("text");

  var exampleele = result.filter("div.examples")[0];
  var fexamples = exampleele.getElements("pre").map(
    function(e){return e.get("text")});
  console.log(fexamples);

  if($("fcontainer")){$("fcontainer").destroy()}
  var container = new Element("div", {
    "id": "fcontainer",
  });
  var ns = new Element("p", {"text": fns, "class":"fns"});
  ns.inject( container);
  var title = new Element("h2", {"text": fname});
  title.inject( container);

  var usages = new Element("ul", {"id": "usages"});
  fusages.each(function(i){
    var u = new Element("li", {"text": i});
    u.inject( usages);
  });
  usages.inject( container);

  var doctitle = new Element("h3", {"text": "Docstring"});
  doctitle.inject( container);
  var doc = new Element("div", {"class": "fdoc", "text": fdocs});
  doc.inject( container);

  var srctitle = new Element("h3", {"text": "Sources"});
  srctitle.inject( container);
  var src = new Element("div", {"class": "source"});
  var srchightlight = new Element("pre", {"class": "brush:clojure", 
                                          "text": fsource});
  srchightlight.inject( src);
  src.inject( container);

  var exampletitle = new Element("h3", {"text": "Examples"});
  exampletitle.inject( container);
  fexamples.each(function(e){
    var exm = new Element("div", {"class": "source"});
    var exmhighlight = new Element("pre", {"class": "brush:clojure",
                                           "text": e});
    exmhighlight.inject(exm);
    exm.inject( container);
  });

  $('search_result_container').setStyle("display", "none");
  $('content').grab(container);

  android_clojuredocs.current_view = "FUNCTION";

  android_clojuredocs.end_loading();
  SyntaxHighlighter.highlight({gutter: false, toolbar: false});
};

android_clojuredocs.showtip=function(msg){
  navigator.notification.alert(msg);
}

android_clojuredocs.onback=function() {
  if (android_clojuredocs.current_view == "FUNCTION") {
    $('fcontainer').destroy();
    $('search_result_container').setStyle("display", "block");
    android_clojuredocs.current_view = "SEARCH"
  } else if (android_clojuredocs.current_view == "SEARCH"){
    $('search_result_container').destroy();
    $('home').setStyle("display", "block");
    android_clojuredocs.current_view = "HOME"
  } else {
    device.exitApp();
  }
}

window.addEvent("domready", android_clojuredocs.init);
document.addEventListener("deviceready",
  function(){
    document.addEventListener("backbutton", android_clojuredocs.onback, false);
    document.addEventListener("searchbutton", function(){$('searchbox').focus()}, false)},
  true);

