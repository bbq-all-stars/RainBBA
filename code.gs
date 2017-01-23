function doPost(e) {
  var token = PropertiesService.getScriptProperties().getProperty('SLACK_ACCESS_TOKEN');
  var bot_name = "お天気ババア";
  var bot_icon = "http://drive.google.com/uc?export=view&id=0ByCuUh9cGikBRThRd0ZnM1d6LVE";
  var verify_token = PropertiesService.getScriptProperties().getProperty('OUTGOING_WEBHOOK_TOKEN');
  
  //投稿の認証
  if (verify_token != e.parameter.token) {
    throw new Error("invalid token.");
  }
  
  var app = SlackApp.create(token);

  //Trigger Words部分の削除
  var url = "https://map.yahooapis.jp/weather/V1/place?appid=dj0zaiZpPXVhN3pyNnpkZGVldyZzPWNvbnN1bWVyc2VjcmV0Jng9YmM-&coordinates=35.6431249,139.7112571&output=json&interval=5";
  var urlFetchOption = {
    'method' : 'get',
    'contentType' : 'application/json; charset=utf-8',
    'muteHttpExceptions' : true
  };
  var response = UrlFetchApp.fetch(url, urlFetchOption);
  var json = JSON.parse(response.getContentText());
  var weatherList = json["Feature"][0]["Property"]["WeatherList"]["Weather"];

  var nowRain = weatherList[0]["Rainfall"];
  var nextRain = weatherList[1]["Rainfall"];
  var message = "";
  if (!nowRain && !nextRain){
    message = "雨は降っとらん！！！";
  } else if ((nowRain && nowRain < 1) || (nextRain && nextRain < 1)) {
    message = "小雨が降っとるかもしれんな。";
  } else if ((nowRain && nowRain < 3) || (nextRain && nextRain < 3)) {
    message = "弱い雨が降っておる。気になるなら傘を持っていったほうがよいじゃろう。";
  } else if ((nowRain && nowRain < 10) || (nextRain && nextRain < 10)) {
    message = "雨が降っておる。傘は持ったか？";
  } else if ((nowRain && nowRain < 20) || (nextRain && nextRain < 20)) {
    message = "やや強い雨じゃ。傘は持ったか？";
  } else if ((nowRain && nowRain < 30) || (nextRain && nextRain < 30)) {
    message = "強い雨じゃ！出かけるなら必ず傘を持っていきなさい。";
  } else if ((nowRain && nowRain < 50) || (nextRain && nextRain < 50)) {
    message = "激しい雨が降っておる！！バケツを引っくり返したようじゃ！！！出かけんほうががええ！";
  } else if ((nowRain && nowRain < 80) || (nextRain && nextRain < 80)) {
    message = "非常に激しい雨でまるで瀧のようじゃ！！！！外に出るのはやめるんじゃ！！";
  } else{
    message = "なにをしている！！！猛烈な雨じゃぞ！！！！一歩でも外に出たら死ぬぞ！！！！";
  }

  return app.postMessage(e.parameter.channel_id, message, {
    username: bot_name,
    icon_url: bot_icon
  });
}
