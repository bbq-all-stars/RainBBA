function doPost(e) {
  var verifyToken = PropertiesService.getScriptProperties().getProperty('OUTGOING_WEBHOOK_TOKEN');
  
  //投稿の認証
  if (verifyToken != e.parameter.token) {
    throw new Error("invalid token.");
  }

  _doBBA(e.parameter.channel_id);
}

function doRoutine(){
  var channelId = 'C3TFUF5CG'; // weather channel
  _doBBA(channelId);
}

function _doBBA(channelId, coodinates){
  if (!coodinates){
    coodinates = "35.6431249,139.7112571";
  }

  var botName = "お天気ババア";
  var yahooApiToken = PropertiesService.getScriptProperties().getProperty('YAHOO_API_TOKEN');
  var token = PropertiesService.getScriptProperties().getProperty('SLACK_ACCESS_TOKEN');
  var app = SlackApp.create(token);

  var url = "https://map.yahooapis.jp/weather/V1/place?appid=" + yahooApiToken + "&coordinates=" + coodinates + "&output=json&interval=5";
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
  var rainfall = nowRain;
  if (nextRain && (!nowRain || nowRain < nextRain)){
    rainfall = nextRain;
  }

  var messageIcon = _getBBAMessageIcon(rainfall);
  var message = messageIcon[0];
  var botIcon = messageIcon[1];
  return app.postMessage(channelId, message, {
    username: botName,
    icon_url: botIcon
  });
}

function _getBBAMessageIcon(rainfall){
  var message = "";
  var botIcon = "https://s3-ap-northeast-1.amazonaws.com/rain-bba/bba.png";
  if (!rainfall){
    message = "雨は降っとらん！！！";
  } else if (rainfall < 1){
    message = "小雨が降っとるかもしれんな。";
  } else if (rainfall < 3){
    message = "弱い雨が降っておる。気になるなら傘を持っていったほうがよいじゃろう。";
  } else if (rainfall < 10){
    message = "雨が降っておる。傘は持ったか？";
  } else if (rainfall < 20){
    message = "やや強い雨じゃ。傘は持ったか？";
  } else if (rainfall < 30){
    message = "強い雨じゃ！出かけるなら必ず傘を持っていきなさい。";
  } else if (rainfall < 50){
    message = "激しい雨が降っておる！！バケツを引っくり返したようじゃ！！！出かけんほうががええ！";
  } else if (rainfall < 80){
    message = "非常に激しい雨でまるで瀧のようじゃ！！！！外に出るのはやめるんじゃ！！";
  } else {
    message = "なにをしている！！！猛烈な雨じゃぞ！！！！一歩でも外に出たら死ぬぞ！！！！";
  }
  return [message, botIcon];
}

function formatDate(date, format) {
  if (!format) format = 'YYYY-MM-DD hh:mm:ss.SSS';
  format = format.replace(/YYYY/g, date.getFullYear());
  format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
  format = format.replace(/DD/g, ('0' + date.getDate()).slice(-2));
  format = format.replace(/hh/g, ('0' + date.getHours()).slice(-2));
  format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
  format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
  if (format.match(/S/g)) {
    var milliSeconds = ('00' + date.getMilliseconds()).slice(-3);
    var length = format.match(/S/g).length;
    for (var i = 0; i < length; i++) format = format.replace(/S/, milliSeconds.substring(i, i + 1));
  }
  return format;
};
