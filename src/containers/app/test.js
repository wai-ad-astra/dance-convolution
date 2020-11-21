const SEC_HTTPS = true;
const SEC_BASE = "<personalized_link>";
(function(d, s, id) {
  SEC = window.SEC || (window.SEC = []);
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s);
  js.id = id;
  js.src = (SEC_HTTPS ? "https" : "http") + "://" + SEC_BASE + "/static/sdk/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, "script", "sphere-engine-compilers-jssdk"));

