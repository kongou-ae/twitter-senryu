var request = require('request');
var kuromoji = require("kuromoji");
var async = require("async")
var moment = require("moment");
var Twitter = require('twitter');
var credentials = require("./credential.json")

if (credentials.platform == "gcp"){
  var dictPath = "neologd/"
} else {
  var dictPath = "node_modules/kuromoji/dist/dict/"
}
var oneDayBefore = moment().add(-1,'days').format("YYYY-MM-DDTHH:mm:ss")

var client = new Twitter({
  consumer_key: credentials.consumer_key,
  consumer_secret: credentials.consumer_secret,
  access_token_key: credentials.access_token_key,
  access_token_secret: credentials.access_token_secret
});

var options = {
  url: credentials.url + "/api/v1/messages/search?q=あorいorうorえorおorかorきorくorけorこorさorしorすorせorそorたorちorつorてorとorなorにorぬorねorのorはorひorふorへorほorまorみorむorめorもorやorゆorよorわorをorん " + 
    "lang:ja " +
    "posted:" + oneDayBefore + "Z" +
    "&size=2500",
  method: 'GET',
  headers: {
    'Content-Type':'application/json'
  }
};

var retweet = function(id){
  client.post('statuses/retweet/' + id ,  function(error, tweet, response){
    if(error) {
      console.log(error);
    }
    console.log(tweet);  // Tweet body. 
    //console.log(response);  // Raw response object. 
  }); 
}



var checkSenryu = function(path,callback){
  var checkAry = []

　//console.log(path)  
  // 確認用の配列を作成
  for (var i = 0; i < path.length; i++){
    var word = {}
    word.reading = path[i].reading
    word.pos = path[i].pos
    word.pos_detail_1 = path[i].pos_detail_1
    checkAry.push(word)
  }
  
  // 文字を一つずつ取り出して、テスト用の変数に結合していく
  var tmp = ""
  // 575になったかチェックする変数
  var score = 0

  // 確認用配列から、1文字にカウントしたくないものを削除。
  // Note:記号を除外すると、辞書に読み方が登録されていないアルファベットも消える
  for (var i = 0; i < checkAry.length; i++){
    if (checkAry[i].pos == "記号" || checkAry[i].reading == "、" || checkAry[i].reading == "。"){
      checkAry.splice(i--,1)
    }
  }

  if ( process.argv[3] == "detail"){
    console.log(checkAry)
  }

  // 575チェック
  for (var j = 0; j < checkAry.length; j++){

    // 575をチェックし始めた先頭が助詞の場合は、forを抜けてcallbackでfalseを返す
    if (tmp.length == 0 && checkAry[j].pos == "助詞"){
      break;  
    // 575をチェックし始めた先頭が助動詞「た」の場合は、forを抜けてcallbackでfalseを返す
    } else if (tmp.length == 0 && checkAry[j].pos == "助動詞"){
//    } else if (tmp.length == 0 && checkAry[j].pos == "助動詞" && checkAry[j].reading == "タ"){
//      break;
//    } else if (tmp.length == 0 && checkAry[j].pos == "助動詞" && checkAry[j].reading == "ン"){
      break;
    } else {
      tmp = tmp + checkAry[j].reading 
    }

    if ( process.argv[3] == "detail"){
      console.log(tmp + ":" + tmp.length + ":"+j+":"+checkAry.length)
    }

    // 初回の5
    if (score == 0 && tmp.length == 5 ){
      tmp = ""
      score = score + 1      
    }

    // 2回目の7
    if (score == 1 && tmp.length == 7){
      tmp = ""
      score = score + 1      
    }

    // 2回目の7（字余り）
    if (score == 1 && tmp.length == 8){
      tmp = ""
      score = score + 1      
    }    

    // 3回目の5
    if (score == 2 && tmp.length == 5 ){
      tmp = ""
      score = score + 1 
      // scoreが3、かつ今の文字が配列の最後の文字だったら川柳とする
      if (score == 3 && j + 1 == checkAry.length){
        callback(null,true)
      }
    }
  }
  callback(null,false)
}

if ( process.argv[2] == "test"){
  var sample = [
    "短いのは無いのか、短いのは！シロートにこんなの持たせんな",
    "シナモンさん脱退したら俺が死ぬ", // trueにしたい。。
    "ハイライト、結構人気あるんだな",
    "ヒマだなー。だれか遊んでくれないかな",
    "後ろから抱きつかれると興奮。もちろん裸で。",
    "喜「お前もやれよじゃああー！！",
    "最後だったかもしへないのいやす", // falseにしたい
    "ふくしまあいり寝坊わず遅刻なう", // falseにしたい
    "今日ＭＣやれって言われたら辛いなあ",
    "高校の制約書がガチガチや",
    "森田さんの今すぐ会いたいやべえ",
    "もうアイツと顔合わせるのいやじゃ",
    "遅延てま拾うか。地獄がいいのかな",
    "昔から、ＴＶ大好きっこでした。",
    "はぁ顔のコンディションが悪すぎる。",
    "いま外なんだけどふつうに泣いている",
    "遅延てま拾うか。地獄がいいのかな",
    "ランドセル背負ったレディ達がいる",
    "右のほうは絶対誰か折れるだろ", // falseにしなきゃいけない
    "思いついたパス全滅したんだが", // falseにしなきゃいけない
    "おはよ！今起きた今から風呂入る",
    "あ、普通に手紙とかで書くような字ね。", // 微網。。。falseにすべきか？
    "ワイのうさまるスタンプが火を噴くぜ",
    "市松が作ったのかなかわいいな",
    "明日朝早いのに寝れん～終わった～", 
    "しんちゃんみてたらこんな時間だね", 
    "いつの間にこんな仕事してたんだろ。",
    "めっっちゃ黒く染めたい毛先まで",
    "おやすみね、怖い夢をみないように",
    "えええええ　蹄鉄なしかあああああ",
    "いつの間にこんな仕事してたんだろ。",
    "本当に色塗り苦手だ。うわあん。 ",
    "明日やること\nえごま油買う\n掃除",
    "色々ミスりましたがご愛嬌～",
    "ありがとう！これで一息つけるわね。",
    "短髪にしたから髭がいい感じ",
    "麻衣ちゃん今日は更新ないかなー",
    "遅い、何やってんのあのエロメガネ",
    "十四松の彼女出てたんだ！"
  ]
  
  kuromoji.builder({ dicPath: dictPath }).build(function (err, tokenizer) {
    async.eachSeries(sample,function(tweet,next){
      var path = tokenizer.tokenize(tweet);
      checkSenryu(path,function(err,result){
        if (result == true){
          console.log(tweet + " is " + result)
        }
      })     
      next()
    })
  })
} else {
  request.get(options,function(error, response, body){
    var res = JSON.parse(body);
    console.log(res.tweets.length)
    // 辞書のパスを設定
    var dictPath = "node_modules/kuromoji/dist/dict/"
    // kuromojiに辞書を読み込み起動
    kuromoji.builder({ dicPath: dictPath }).build(function (err, tokenizer) {
      // Insightから受け取ったmessageの配列を非同期looop
      async.eachSeries(res.tweets,function(tweet,next){
        // Retweetを除外
        if (tweet.message.verb == "post"){
          // 形態素解析を実施
          var path = tokenizer.tokenize(tweet.message.object.summary);
          // 川柳かどうかをチェック
          checkSenryu(path,function(err,result){
            // もし川柳だったら
            if (result == true){
              console.log(tweet.message.object.summary + " is senryu!!!")
              // 対象PostのIDを取得してretweet
              var id = tweet.message.object.link.match(/statuses\/(\d+)$/);
              console.log(id[1])
              retweet(id[1])
            } 
          })        
        }
        next()
      })
    });
  });
}