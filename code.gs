var OUTGOING_WEBHOOK_TOKEN = PropertiesService.getScriptProperties().getProperty('OUTGOING_WEBHOOK_TOKEN');
var SLACK_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('SLACK_ACCESS_TOKEN');
var YAHOO_API_TOKEN = PropertiesService.getScriptProperties().getProperty('YAHOO_API_TOKEN');
var DEFAULT_COODINATES = PropertiesService.getScriptProperties().getProperty('DEFAULT_COODINATES');
var DEFAULT_WEATHER_CHANNEL = PropertiesService.getScriptProperties().getProperty('DEFAULT_WEATHER_CHANNEL');
var NOTIFICATION_MAIL_ADDRESS = PropertiesService.getScriptProperties().getProperty('NOTIFICATION_MAIL_ADDRESS');

var app = SlackApp.create(SLACK_ACCESS_TOKEN);
var botName = "お天気ババア";
var channelId = DEFAULT_WEATHER_CHANNEL;
var isDebugMode = false;

var errorIcon = "https://s3-ap-northeast-1.amazonaws.com/rain-bba/bba_error.jpg";
var rainfallIconList = [
  {rainfall : null, icon : "https://s3-ap-northeast-1.amazonaws.com/rain-bba/bba01.jpg", color : "#00ff00"},
  {rainfall :    0, icon : "https://s3-ap-northeast-1.amazonaws.com/rain-bba/bba02.jpg", color : "#7fff00"},
  {rainfall :    1, icon : "https://s3-ap-northeast-1.amazonaws.com/rain-bba/bba03.jpg", color : "#ffff00"},
  {rainfall :    3, icon : "https://s3-ap-northeast-1.amazonaws.com/rain-bba/bba04.jpg", color : "#ff7f00"},
  {rainfall :   10, icon : "https://s3-ap-northeast-1.amazonaws.com/rain-bba/bba05.jpg", color : "#ff0000"},
  {rainfall :   20, icon : "https://s3-ap-northeast-1.amazonaws.com/rain-bba/bba06.jpg", color : "#ff007f"},
  {rainfall :   30, icon : "https://s3-ap-northeast-1.amazonaws.com/rain-bba/bba07.jpg", color : "#ff00ff"},
  {rainfall :   50, icon : "https://s3-ap-northeast-1.amazonaws.com/rain-bba/bba08.jpg", color : "#7f00ff"},
  {rainfall :   80, icon : "https://s3-ap-northeast-1.amazonaws.com/rain-bba/bba09.jpg", color : "#0000ff"},
];

function doPost(e) {
  //投稿の認証
  try {
    if (OUTGOING_WEBHOOK_TOKEN != e.parameter.token){
      throw new Error("invalid token.");
    }
    channelId = e.parameter.channel_id;

    if (e.parameter.text == "rain? list"){
      _doListBBA();
      return
    }
    
    _doBBA(null, true);

  } catch(error) {
    doError(error.message)
  }
}

function doRoutine(){
  _doBBA(null, false);
}

function doError(message){
  app.postMessage(
    channelId, 
    message,
    {
      username: botName,
      icon_url: errorIcon,
      attachments: JSON.stringify([{
        pretext: "",
        image_url: errorIcon
      }])
    }
  );
  return
}

function _doListBBA(){
  var data = [];
  for (var i = 0; i < rainfallIconList.length; i++){
    if (i == 0) {
      data.push({
        title : "降水強度 : 0 mm/h",
        image_url: rainfallIconList[i].icon,
        color : rainfallIconList[i].color
      });
    } else {
      data.push({
        title : "降水強度 : " + rainfallIconList[i].rainfall + "mm/h以上",
        image_url: rainfallIconList[i].icon,
        color : rainfallIconList[i].color
      });
    }
  }
  data.push({
    title : "APIエラー時",
    image_url: errorIcon
  });
  app.postMessage(
    channelId, 
    "",
    {
      username: botName,
      icon_url: rainfallIconList[0].icon,
      attachments: JSON.stringify(data),
    }
  );
  return
}

function _doBBA(coodinates, alwaysResponse){
  if (!coodinates) coodinates = DEFAULT_COODINATES;
  
  var app = SlackApp.create(SLACK_ACCESS_TOKEN);

  var date = new Date();
  date.setTime(date.getTime() - 5 * 60 * 1000);
  date = formatDate(date, 'YYYYMMDDhhmm');

  var url = "https://map.yahooapis.jp/weather/V1/place?appid=" + YAHOO_API_TOKEN + "&coordinates=" + coodinates + "&output=json&interval=5&date=" + date;
  var urlFetchOption = {
    'method' : 'get',
    'contentType' : 'application/json; charset=utf-8',
    'muteHttpExceptions' : true
  };
  var response = UrlFetchApp.fetch(url, urlFetchOption);
  var responseText = response.getContentText();
  var json = JSON.parse(responseText);
  var weatherList = json["Feature"][0]["Property"]["WeatherList"]["Weather"];

  var pastRain = weatherList[0]["Rainfall"];
  var nowRain = weatherList[1]["Rainfall"];
  var nextRain = weatherList[2]["Rainfall"];

  var pastRainfall = pastRain;
  if (nowRain && (!pastRain || pastRain < nowRain)){
    pastRainfall = pastRain;
  }

  var rainfall = nowRain;
  if (nextRain && (!nowRain || nowRain < nextRain)){
    rainfall = nextRain;
  }

  var pastIcon = _getBBAIcon(pastRainfall)[0];
  var iconColor = _getBBAIcon(rainfall);
  var icon = iconColor[0];
  var color = iconColor[1];
  if (alwaysResponse || pastIcon != icon){
    _sendDebugMail(responseText);
    app.postMessage(
      channelId, 
      "",
      {
        username: botName,
        icon_url: icon,
        attachments: JSON.stringify([{
          pretext: "",
          image_url: icon,
          color : color
        }])
      }
    );
  }
  return
}

function _getBBAIcon(rainfall){
  if (!rainfall) return [rainfallIconList[0].icon, rainfallIconList[0].color];

  for (var i = rainfallIconList.length - 1; i >= 0; i--){
    if (rainfall >= rainfallIconList[i].rainfall){
      return [rainfallIconList[i].icon, rainfallIconList[i].color]
    }
  }
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
}

function _sendDebugMail(message){
  if (!isDebugMode){
    return
  }
  var title = 'お天気ババア デバッグ情報';

  MailApp.sendEmail(NOTIFICATION_MAIL_ADDRESS, title, message);
  return
}
