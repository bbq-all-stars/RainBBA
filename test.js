
var rainfallIconList = [
  {rainfall : null, icon : "https://s3-ap-northeast-1.amazonaws.com/rain-bba/bba01.jpg"},
  {rainfall :    0, icon : "https://s3-ap-northeast-1.amazonaws.com/rain-bba/bba02.jpg"},
  {rainfall :    1, icon : "https://s3-ap-northeast-1.amazonaws.com/rain-bba/bba03.jpg"},
  {rainfall :    3, icon : "https://s3-ap-northeast-1.amazonaws.com/rain-bba/bba04.jpg"},
  {rainfall :   10, icon : "https://s3-ap-northeast-1.amazonaws.com/rain-bba/bba05.jpg"},
  {rainfall :   20, icon : "https://s3-ap-northeast-1.amazonaws.com/rain-bba/bba06.jpg"},
  {rainfall :   30, icon : "https://s3-ap-northeast-1.amazonaws.com/rain-bba/bba07.jpg"},
  {rainfall :   50, icon : "https://s3-ap-northeast-1.amazonaws.com/rain-bba/bba08.jpg"},
  {rainfall :   80, icon : "https://s3-ap-northeast-1.amazonaws.com/rain-bba/bba09.jpg"},
];

  var data = [];
  for (var i = 0; i < rainfallIconList.length; i++){
    if (i == 0) {
      data.push({
        text : "降水強度 : 0 mm/h",
        image_url: rainfallIconList[i].icon
      });
    } else {
      data.push({
        text : "降水強度 : " + rainfallIconList[i].rainfall + "mm/h以上",
        image_url: rainfallIconList[i].icon
      });
    }
  }
  console.log(data);
