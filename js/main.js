var users = new Array();
var community_id
var pages = 1;
var testJson;
var sortIdFlag = 0;
var timeSortFlag = 1;

var captcha = "";
var ts = "";

$(document).ready(function() {

  $("#btn_get_user").click(function(){

    var api = $("#edit_api").val();
    $("#status").text("正在获取数据...");
    getUserPages(api);
    users = new Array();
    for(var i = 1; i <= pages; i++) {
      getUserJson(api, i);
    }

    $("#export").removeAttr("hidden");

  });

  $("#but_sort_jointime").click(function() {

    var mode = $(":radio:checked").val();

    console.log("start sort");
    users.sort(by("join_time",timeSortFlag));
    if(timeSortFlag === 0) {
      timeSortFlag = 1;
    } else {
      timeSortFlag = 0;
    }
    console.log("sorted");

    $("#user_list").empty();

    if(mode === '1') {
      console.log("group by time");
      groupByDay();
    } else if(mode === '2') {
      console.log("group by nums");
      showUsers(users);
    }

    $("#info").text("用户总数：" + users.length);
    var plotBlock = "<div id=\"plot_place\"></div><div id=\"plot_overview\"></div>";
    $("#info_box").empty();
    $("#info_box").append(plotBlock);

    calcUsers();

  });

  $("#but_sort_id").click(function() {
    console.log("start sort");
    users.sort(by("member_id",sortIdFlag));
    if(sortIdFlag === 0) {
      sortIdFlag = 1;
    } else {
      sortIdFlag = 0;
    }
    console.log("sorted");

    $("#user_list").empty();
    showUsers(users);
    $("#info").text("用户总数：" + users.length);

  });

  $("#but_test").click(function() {
    groupByDay();
  });

  $("#export").on('click', function(event){
    exportUsersToCSV.apply(this, ['export.csv']);
  });

});

var getUserJson = function(api, page) {
  var count = 0;
  var page_no = page;
  community_id = api.substring(api.indexOf('community_id')+13,api.indexOf('&time_start'));
  var time_start = api.substring(api.indexOf('time_start')+11,api.indexOf('&time_end'));
  var time_end = api.substring(api.indexOf('time_end')+9,api.indexOf('&username'));
  var username = "";
  var captcha = api.substring(api.indexOf('captcha')+8,api.indexOf('&ts'));
  var ts = api.substring(api.indexOf('ts')+3);
  var url = "http://www.im9.com/api/manager/query.member.list.do?page_no="
    + page_no
    + "&community_id=" + community_id
    + "&time_start=" + time_start
    + "&time_end=" + time_end
    + "&username=" + username
    + "&captcha=" + captcha
    + "&ts=" + ts;
  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  xhr.open('GET',url);
  xhr.onload = function() {
    var jsonData = $.parseJSON(xhr.responseText);
    var userData = (jsonData.data).result;
    for(var i = 0; i < userData.length; i++) {
      users.push(userData[i]);
      count++;
      var flag;
      if(count%2 === 1) {
        flag = "odd";
      } else {
        flag = "even";
      }
      var remark = "";
      if(users[i].post_count !== 0 || users[i].reply_count !== 0) {
        var remark = "actived";
      }
      var record = makeRecord(
        flag,
        users[i].member_id,
        users[i].username,
        users[i].join_time,
        remark,
        users[i].post_count,
        users[i].reply_count);
      $("#user_list").append(record);
      $("#info").text("用户总数：" + users.length);
      if(count%20 == 0) {
        var mark = "<div class=\"separator\"> #" + count + " </div>";
        $("#user_list").append(mark);
      }
    }
    if(page === pages) {
      $("#status").text("获取用户数据完毕");
    }
  };
  xhr.send();
};

$("#btn_unique").click(function() {
    users = unique(users);
    $("#info").text("用户总数：" + users.length);
});

var showUsers = function(array) {
  count = 0;
  for(var i = 0; i < array.length; i++) {
    count++;
    var flag;
    if(count%2 === 1) {
      flag = "odd";
    } else {
      flag = "even";
    }
    var remark = "";
    if(array[i].post_count !== 0 || array[i].reply_count !== 0) {
        var remark = "actived";
    }
    var record = makeRecord(
      flag,
      array[i].member_id,
      array[i].username,
      array[i].join_time,
      remark,
      array[i].post_count,
      array[i].reply_count);
    $("#user_list").append(record);
    if(count%20 == 0) {
      var mark = "<div class=\"separator\"> #" + count + " </div>";
      $("#user_list").append(mark);
    }
  }
  count = 0;
}

var groupByDay = function() {
  count = 0;
  var nums = 0;
  var lastDay = ""
  for(var i = 0; i < users.length; i++) {
    count++;
    nums++;
    var flag;
    if(count%2 === 1) {
      flag = "odd";
    } else {
      flag = "even";
    }
    var remark = "";
    if(users[i].post_count !== 0 || users[i].reply_count !== 0) {
        var remark = "actived";
    }
    var record = makeRecord(
      flag,
      users[i].member_id,
      users[i].username,
      users[i].join_time,
      remark,
      users[i].post_count,
      users[i].reply_count);
    currentDay = users[i].join_time.substring(0,10);
    if(currentDay !== lastDay) {
      var sprArray = $(".separator");
      if(sprArray.length >= 1) {
        $(sprArray[sprArray.length - 1]).text($(sprArray[sprArray.length - 1]).text() + " 新入成员：" + nums);
      }
      var mark = "<div class=\"separator\"> #" + currentDay + "</div>"
      $("#user_list").append(mark);
      lastDay = currentDay;
      nums = 0;
    }
    $("#user_list").append(record);
  }
  count = 0;
}

var makeRecord = function(flag, memberId, userName, joinTime, remark, postCount, replyCount) {
  var record =
      "<div class=\"list_iteam_"+ flag +"\">"
      + "<a href=http://message.bilibili.com/#whisper/mid"
      + memberId
      + " target=\"_blank\">"
      + "<div class=\"user_id\" >"
      + memberId
      + "</div>"
      + "<div class=\"user_name\" >"
      + userName
      + "</div>"
      + "<div class=\"user_jointime\" >"
      + joinTime
      + "</div>"
      + "<div class=\"user_remark\" >"
      + "<span>" + remark + "</span>"
      + "<span>post: " + postCount + "</span>"
      + "<span>reply: " + replyCount + "</span>"
      + "</div>"
      + "</a>"
      + "<a href=http://space.bilibili.com/"
      + memberId
      + " target=\"_blank\">"
      + "<div class=\"link_space\">"
      + "</div>"
      + "</a>"
      + "</div>";
  return record;
}

var getUserPages = function(api) {
  community_id = api.substring(api.indexOf('community_id')+13,api.indexOf('&time_start'));
  var time_start = api.substring(api.indexOf('time_start')+11,api.indexOf('&time_end'));
  var time_end = api.substring(api.indexOf('time_end')+9,api.indexOf('&username'));
  var username = "";
  captcha = api.substring(api.indexOf('captcha')+8,api.indexOf('&ts'));
  ts = api.substring(api.indexOf('ts')+3);
  var url = "http://www.im9.com/api/manager/query.member.list.do?page_no="
    + 1
    + "&community_id=" + community_id
    + "&time_start=" + time_start
    + "&time_end=" + time_end
    + "&username=" + username
    + "&captcha=" + captcha
    + "&ts=" + ts;
  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  xhr.open('GET',url,false);
  xhr.onload = function() {
    var testJson = $.parseJSON(xhr.responseText);
    pages = testJson.data.total_page;
    console.log("pages:"+pages);
  };
  xhr.send();
}

//
var calcUsers = function() {
  var countWeekly = 0,
      countDaily = 0,
      userUpdateWeekly = [],
      userUpdateDaily = [],
      currentDate = "",
      lastDate = users[0].join_time.substring(0,10);
  for(var i = 0; i < users.length; i++) {
    currentDate = users[i].join_time.substring(0,10);
    var joinDate = new Date(users[i].join_time);
    if(currentDate !== lastDate) {
      var d = new Date(lastDate);
      if(joinDate.getDay() === 1) {
        userUpdateWeekly.push([d.getTime(), countWeekly]);
        countWeekly = 0;
      }
      userUpdateDaily.push([d.getTime(), countDaily]);
      countDaily = 0;
      lastDate = currentDate;
    }
    countWeekly++;
    countDaily++;
  }
  console.log(userUpdateWeekly);
  console.log(userUpdateDaily);
  setFlot(userUpdateDaily);
  //$.plot("#flot_place", [ userUpdateWeekly ]);
}

//by函数接受一个成员名字符串做为参数
//并返回一个可以用来对包含该成员的对象数组进行排序的比较函数
var by = function(name, x){
    return function(o, p){
        var a, b;
        if (typeof o === "object" && typeof p === "object" && o && p) {
            a = o[name];
            b = p[name];
            if (a === b) {
                return 0;
            }
            if (typeof a === typeof b) {
              if(x === 0) {
                return a < b ? -1 : 1;
              } else {
                return a > b ? -1 : 1;
              }
            }
            return typeof a < typeof b ? -1 : 1;
        }
        else {
            throw ("error");
        }
    }
}

var exportUsersToCSV = function(fileName){

  var colDelim = ",",
      rowDelim = "\r\n",
      csv = "";

  for(i = 0; i < users.length; i++) {
    csv += users[i].member_id + colDelim
        + '"' + users[i].username + '"' + colDelim
        + users[i].join_time + colDelim
        + users[i].post_count + colDelim
        + users[i].reply_count + rowDelim
  }
  csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);
  $(this).attr({
    'download': fileName,
    'href': csvData,
    'target': '_blank'
  });

};
