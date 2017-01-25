function doPost(e) {
  var verifyToken = PropertiesService.getScriptProperties().getProperty('OUTGOING_WEBHOOK_TOKEN');
  
  //投稿の認証
  try {
    if (verifyToken != e.parameter.token) {
      throw new Error("invalid token.");
    }

    _doBBA(e.parameter.channel_id, null, true);

  } catch(error) {
    doError(error.message)
  }
}

function doRoutine(){
  var channelId = 'C3TFUF5CG'; // weather channel
  _doBBA(channelId, null, false);
}

function doError(message){
  var botName = "お天気ババア";
  var botIcon = "https://s3-ap-northeast-1.amazonaws.com/rain-bba/bba_error.jpg";
  app.postMessage(channelId, message + "\n" + botIcon, {
    username: botName,
    icon_url: botIcon
  });
}

function _doBBA(channelId, coodinates, alwaysResponse){
  if (!coodinates){
    coodinates = "139.7112571,35.6431249";
  }

  var botName = "お天気ババア";
  var yahooApiToken = PropertiesService.getScriptProperties().getProperty('YAHOO_API_TOKEN');
  var token = PropertiesService.getScriptProperties().getProperty('SLACK_ACCESS_TOKEN');
  var app = SlackApp.create(token);

  var date = new Date();
  date.setTime(date.getTime() - 5 * 60 * 1000);
  date = formatDate(date, 'YYYYMMDDhhmm');

  var url = "https://map.yahooapis.jp/weather/V1/place?appid=" + yahooApiToken + "&coordinates=" + coodinates + "&output=json&interval=5&date=" + date;
  var urlFetchOption = {
    'method' : 'get',
    'contentType' : 'application/json; charset=utf-8',
    'muteHttpExceptions' : true
  };
  var response = UrlFetchApp.fetch(url, urlFetchOption);
  var json = JSON.parse(response.getContentText());
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

  var pastIcon = _getBBAIcon(pastRainfall);
  var icon = _getBBAIcon(rainfall);
  if (alwaysResponse || pastIcon != icon){
    app.postMessage(channelId, icon, {
      username: botName,
      icon_url: icon
    });
  }
  return
}

function _getBBAIcon(rainfall){
  var botIcon = "https://s3-ap-northeast-1.amazonaws.com/rain-bba/bba09.jpg";
  if (!rainfall){
    botIcon = "https://s3-ap-northeast-1.amazonaws.com/rain-bba/bba01.jpg";
  } else if (rainfall < 1){
    botIcon = "https://s3-ap-northeast-1.amazonaws.com/rain-bba/bba02.jpg";
  } else if (rainfall < 3){
    botIcon = "https://s3-ap-northeast-1.amazonaws.com/rain-bba/bba03.jpg";
  } else if (rainfall < 10){
    botIcon = "https://s3-ap-northeast-1.amazonaws.com/rain-bba/bba04.jpg";
  } else if (rainfall < 20){
    botIcon = "https://s3-ap-northeast-1.amazonaws.com/rain-bba/bba05.jpg";
  } else if (rainfall < 30){
    botIcon = "https://s3-ap-northeast-1.amazonaws.com/rain-bba/bba06.jpg";
  } else if (rainfall < 50){
    botIcon = "https://s3-ap-northeast-1.amazonaws.com/rain-bba/bba07.jpg";
  } else if (rainfall < 80){
    botIcon = "https://s3-ap-northeast-1.amazonaws.com/rain-bba/bba08.jpg";
  }
  return botIcon;
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
