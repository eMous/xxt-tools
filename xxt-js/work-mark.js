var ducuTip = I18N_Config.ducutip;
var ducuok = I18N_Config.ducuok;
var popCancel = I18N_Config.popCancel;
var allsubtip = I18N_Config.allsubtip;

//点击div1外任何地方，div2消失
$(document).mouseup(function(e) {
	var _con = $('.banji_select_box');
	if ( !_con.is(e.target) && _con.has(e.target).length === 0) {
		$('.banji_select_con').hide()
		$(".banji_select_name").removeClass('banji_select_aceive')
		$(".banji_select_name").parent().removeClass('banji_select_shadow')
	}
});

function searchShowHide() {
	var searList = $('.banji_list li').length
	if (i = 6, i <= searList) {
		$('.banji_search_display').show()
		$('.banji_list').css('max-height', '256px')
	} else {
		$('.banji_search_display').hide()
		$('.banji_list').css('max-height', '300px')
	}
}
searchShowHide();

//滚动条	
function banjiScroll() {//选择班级
	$("#banji_scroll").niceScroll({
		cursorborder : "",
		cursorwidth : 8,
		cursorcolor : "#CAD5E6",
		boxzoom : false,
		autohidemode : true
	});
	$("#banji_scroll").getNiceScroll().resize(); //检测滚动条是否重置大小（当窗口改变大小时）
}

function showBatch() {
	var kx = $(".dataBody_td").length;
	var yx = $(".dataBody_td .dataBody_checked").length;
	$("#selectNum").text(yx);
	if (yx > 0) {
		$(".batchBtn").show();
		if (yx == kx) {
			$(".dataHead_check").addClass('dataHead_checked');
		} else {
			$('.dataHead_th .dataHead_check').removeClass('dataHead_checked');
		}
		$("#selectShow").show();
	} else {
		$('.dataHead_th .dataHead_check').removeClass('dataHead_checked');
		$(".batchBtn").hide();
		$("#selectShow").hide();
	}
}

function groupPopScroll() {
	$(".groupPop").niceScroll({
		cursorborder : "",
		cursorwidth : 8,
		cursorcolor : "#CAD5E6",
		boxzoom : false,
		autohidemode : true
	});
	$(".groupPop").getNiceScroll().resize();
}

$(function() {
	searchMarkList(1);
	workInfo();

	groupPopScroll();
	getDaipiyueNum();

	$('#fanyaData').on('click', '.dataBody_check', function(e) {
		if ($(this).hasClass('dataBody_checked')) {
			$(this).removeClass('dataBody_checked')
			$(this).parent().removeClass('dataBody_active')
			$(this).find(":checkbox").prop("checked", false);
		} else {
			$(this).addClass('dataBody_checked')
			$(this).parent().addClass('dataBody_active')
			$(this).find(":checkbox").prop("checked", true);
		}
		showBatch();
	});

	$(".dataHead_check").click(function() {
		if ($(this).hasClass("dataHead_checked")) {
			$(this).removeClass('dataHead_checked');
			$(".dataBody_check").removeClass("dataBody_checked");
		} else {
			$(this).addClass('dataHead_checked');
			$(".dataBody_check").addClass("dataBody_checked");
		}
		showBatch();
	});

	$('.batchMarkScore').on('click', function(e) {
		var num = $(".dataBody_td .dataBody_checked").length;
		if (num == 0) {
			parent.$.toast({
				type : '',
				content : '请选择要打分的学生'
			});
			return;
		}
		var title = '选中' + num + '名学生';
		$('#markScore .title').text(title);
		$('#markScore input[type="text"]').val('');
		$('#markScore').fullFadeIn();
	});
	
	//班级选择搜索下拉框
	$('.banji_select_name').click(function() {
		var banjiThis = $('.banji_select_con')
		if (banjiThis.is(':visible')) {
			banjiThis.slideUp(300)
			$(this).removeClass('banji_select_aceive')
			$(this).parent().removeClass('banji_select_shadow')
		} else {
			banjiThis.slideDown(300)
			$(this).addClass('banji_select_aceive')
			$(this).parent().addClass('banji_select_shadow')
		}
		banjiScroll()
	})

	//批阅更多
	$(".piyueMore").hover(function() {
		$(".morePop").slideDown();
	}, function() {
		//$(".morePop").slideUp();
		$(".morePop").stop(true,false).slideUp();
	})

	//批阅更多
	$(".BatchOpera").hover(function() {
		$(".BatchPop").slideDown();
	}, function() {
		//$(".BatchPop").slideUp();
		$(".BatchPop").stop(true,false).slideUp();
	})

	//批阅状态
	$(".td_state").hover(function() {
		$(this).find(".ztDown").addClass("ztUp")
		$(".statePop").slideDown();
	}, function() {
		$(this).find(".ztDown").removeClass("ztUp")
		//$(".statePop").slideUp();
		$(".statePop").stop(true,false).slideUp();
	});

	$(".stuGroup").hover(function() {
		$(this).find(".ztDown").addClass("ztUp");
		//$(".groupPop").slideDown(500);
		$(".groupPop").show();
	}, function() {
		$(this).find(".ztDown").removeClass("ztUp");
		//$(".groupPop").stop(true,false).slideUp(500);
		$(".groupPop").hide();
	});

	$("#search").bind("keypress", function(event) {
		if (event.keyCode == "13") {
			searchMarkList(1);
		}
	});

	// 计算右测高度
	var het = $(window).innerHeight();
	var sethet = het - 140;
	var mainhet = $(".main1200").css("min-height", sethet);

	$("#exportWorkPop .exportWorkScoreConfirm").on('click', function() {
		$('#exportWorkPop').fullFadeOut();
		var selectType = $("#exportWorkPop .exportgrade .grade_checked").attr("data");
		if (selectType == 0) {
			exportScore();
		}
		if (selectType == 1) {
			exportAllClassWorkScore();
		}
	});
});

function sortList(obj) {
	var courseId = $("#courseid").val();
	var clazzId = $("#clazzid").val();
	var workId = $("#workid").val();
	var cpi = $("#cpi").val();
	var submit = $("#submit").val();
	var status = $("#status").val();
	var sort = $(obj).attr("data");
	var evaluation = $("#evaluation").val();
	var groupId = $("#groupId").val() || 0;
	var from = $("#from").val() || "";

	var order = 0;
	if ($(obj).hasClass("sort_down")) {
		$(obj).removeClass("sort_down")
	} else {
		$(obj).addClass("sort_down")
		order = 1;
	}
	
	$("#sort").val(sort);
	$("#order").val(order);
	
	$.ajax({
		type : "get",
		url : "/mooc2-ans/work/mark-list",
		data : {
			"courseid" : courseId,
			"clazzid" : clazzId,
			"workid" : workId,
			"submit" : submit,
			"status" : status,
			"cpi" : cpi,
			"evaluation" : evaluation,
			"groupId" : groupId,
			"sort" : sort,
			"from" : from,
			"order" : order
		},
		success : function(html) {
			$(".dataBody").html(html);
		},
		error: function(){
			$(".dataBody").html('');
		}
	});
}

function statusList(obj) {
	var status = $(obj).attr("data");
	$("#status").val(status);
	var courseId = $("#courseid").val();
	var clazzId = $("#clazzid").val();
	var workId = $("#workid").val();
	var cpi = $("#cpi").val();
	var submit = $("#submit").val();
	var evaluation = $("#evaluation").val();
	var groupId = $("#groupId").val() || 0;
	var from = $("#from").val() || "";

	$(".statePop li").removeClass("stat_li_cur");
	$(obj).addClass("stat_li_cur");
	$(".td_state").find(".ztDown").removeClass("ztUp");
	$(".statePop").slideUp();
	
	$.ajax({
		type : "get",
		url : "/mooc2-ans/work/mark-list",
		data : {
			"courseid" : courseId,
			"clazzid" : clazzId,
			"workid" : workId,
			"submit" : submit,
			"status" : status,
			"groupId" : groupId,
			"evaluation" : evaluation,
			"from" : from,
			"cpi" : cpi
		},
		success : function(html) {
			$(".dataBody").html(html);
		},
		error: function(){
			$(".dataBody").html('');
		}
	});
}

function groupList(obj) {
	var groupId = $(obj).attr("data");
	$("#groupId").val(groupId);
	var courseId = $("#courseid").val();
	var clazzId = $("#clazzid").val();
	var workId = $("#workid").val();
	var cpi = $("#cpi").val();
	var submit = $("#submit").val();
	var evaluation = $("#evaluation").val();
	var from = $("#from").val() || "";

	$(".groupPop li").removeClass("stat_li_cur");
	$(obj).addClass("stat_li_cur");
	$(".stuGroup").find(".ztDown").removeClass("ztUp");
	$(".groupPop").slideUp();

	$.ajax({
		type : "get",
		url : "/mooc2-ans/work/mark-list",
		data : {
			"courseid" : courseId,
			"clazzid" : clazzId,
			"workid" : workId,
			"submit" : submit,
			"groupId" : groupId,
			"evaluation" : evaluation,
			"from" : from,
			"cpi" : cpi
		},
		success : function(html) {
			$(".dataBody").html(html);
		},
		error: function(){
			$(".dataBody").html('');
		}
	});
}

function selectClass(obj) {
	$(obj).addClass('active').siblings().removeClass('active');
	$(".banji_select_name").removeClass('banji_select_aceive');
	$(".banji_select_name").parent().removeClass('banji_select_shadow');
	$(obj).parent().addClass('active');
	$(obj).parent().siblings().removeClass('active');
	$(obj).closest('.banji_select_con').slideUp(300);
	
	var classId = $(obj).attr("data");
	var workId = $(obj).attr("data1");
	var courseId = $("#courseid").val();
	var cpi = $("#cpi").val();
	var submit = $("#submit").val();
	var evaluation = $("#evaluation").val();
	var from = $("#from").val() || "";
	location.href = "/mooc2-ans/work/mark?courseid=" + courseId + "&clazzid=" + classId + "&cpi=" + cpi + "&id=" + workId + "&submit=" + submit + "&evaluation=" + evaluation + "&from=" + from;
}

//已交未交选择
function selectSubmit(obj) {
	$(".Hand_in em").removeClass("checked")
	$(obj).find("em").addClass("checked");
	var submit = $(obj).attr("data");
	var unEval = "";
	if ("true" == submit) {
		unEval = $(obj).attr("unEval");
	}
	var courseId = $("#courseid").val();
	var clazzId = $("#clazzid").val();
	var workId = $("#workid").val();
	var cpi = $("#cpi").val();
	var evaluation = $("#evaluation").val();
	var state = $("#state").val();
	var groupId = $("#groupId").val() || 0;
	var from = $("#from").val() || "";
	location.href = "/mooc2-ans/work/mark?courseid=" + courseId + "&clazzid=" + clazzId + "&cpi=" + cpi + "&id=" + workId
		+ "&submit=" + submit + "&evaluation=" + evaluation + "&unEval=" + unEval + "&state=" + state + "&groupId=" + groupId + "&from=" + from;
}

function searchMarkList(pages) {
	var courseId = $("#courseid").val();
	var clazzId = $("#clazzid").val();
	var workId = $("#workid").val();
	var cpi = $("#cpi").val();
	var submit = $("#submit").val();
	var status = $("#status").val();
	var sort = $("#sort").val();
	var search = $("#search").val();
	var evaluation = $("#evaluation").val();
	var unEval = $("#unEval").val();
	if (sort == "" || typeof(sort) == "undefined") {
		sort = 0;
	}
	var order = $("#order").val();
	if (order == "" || typeof(order) == "undefined") {
		order = 0;
	}
	var groupId = $("#groupId").val() || 0;
	var from = $("#from").val() || "";

	$.ajax({
		type : "get",
		url : "/mooc2-ans/work/mark-list",
		data : {
			"courseid" : courseId,
			"clazzid" : clazzId,
			"workid" : workId,
			"submit" : submit,
			"status" : status,
			"groupId" : groupId,
			"cpi" : cpi,
			"evaluation" : evaluation,
			"sort" : sort,
			"order" : order,
			"unEval" : unEval,
			"search" : search,
			"from" : from,
			"pages" : pages
		},
		success : function(html) {
			$(".dataBody").html(html);
			showBatch();
		},
		error: function(){
			$(".dataBody").html('');
		}
	});
}

//互评已批列表
function showEval(obj) {
	var readNum = $(obj).next(".readNumber");
	if (readNum.is(':visible')) {
		readNum.hide();
		$(obj).removeClass("dataUnderline");
	} else {
		$(".readNumber_already").removeClass("dataUnderline");
		$(obj).addClass("dataUnderline");
		$('.readNumber').hide();
		readNum.slideDown(400);
		$('.operate_con').hide();
		screllDown();
	}
}

function screllDown() {
	$("#readNumberScroll_down").niceScroll({
		cursorborder : "",
		cursorwidth : 8,
		cursorcolor : "#CAD5E6",
		boxzoom : false,
		autohidemode : true
	});
	$("#readNumberScroll_down").getNiceScroll().resize();
}

$(document).mouseup(function(e) {
	var _con = $(".readNumber_already .colorBlue,.readNumber_down .colorBlue,.dataBody_read_select");
	if ( !_con.is(e.target) && _con.has(e.target).length === 0) {
		$(".readNumber").hide();
		$(".dataBody_td").find(".colorBlue").removeClass("dataUnderline");
	}
});

//作业提交信息
function workInfo() {
	var courseId = $("#courseid").val();
	var clazzId = $("#clazzid").val();
	var workId = $("#workid").val();
	var workId = $("#workid").val();
	var cpi = $("#cpi").val();

	$.ajax({
		type : "get",
		url : "/mooc2-ans/work/workinfo",
		dataType : "json",
		data : {
			"courseid" : courseId,
			"clazzid" : clazzId,
			"workid" : workId,
			"cpi" : cpi
		},
		success : function(result) {
			if (result.status) {
				var data = result.data;
				var total = data.total;
				var submitCount = data.submitCount;
				var noSubmitCount = data.noSubmitCount;
				var score = data.score;
				var grading = data.grading;
				var evaluation = data.evaluation;
				$("#submitCount").val(submitCount);
				$("#unSubmitCount").val(noSubmitCount);
				$("#score").val(score);
				$("#grading").val(grading);
				if (evaluation == 1) {
					$("#goTJ").hide();
				}
				
				var workDue = data.workDue;
				if (workDue) {
					$(".batchReback").hide();
					$(".batchNotice").hide();
					$(".batchAddTime").show();
				} else {
					$(".batchReback").show();
					$(".batchNotice").show();
					$(".batchAddTime").hide();
				}
				
				if(evaluation == 1 && workDue) {
					$(".submitGrade").show();
				} else {
					$(".submitGrade").hide();
				}
				
				var ems = $(".piyueTj em");
				ems.eq(1).text(total);
				ems.eq(2).text(submitCount);
				ems.eq(3).text(noSubmitCount);
			}
		}
	});
}

$(function() {
	$('.dataBody').on('blur', '.scoreInput', function(e) {
		var me = $(this);
		var oldScore = me.attr('data');
		var score = me.val();
		if (score == '') {
			parent.$.toast({
				type : '',
				content : '请输入分值'
			});
			me.val(oldScore);
			return;
		}
		if (isNaN(score)) {
			parent.$.toast({
				type : '',
				content : '分值必须是数字'
			});
			me.val(oldScore);
			return;
		}
		var pattern = /^[0-9]+([.]\d{1})?$/;
		if ( !pattern.test(score)) {
			parent.$.toast({
				type : '',
				content : '分值不合法(最多保留一位小数)'
			});
			me.val(oldScore);
			return;
		}
		
		var fullScore = $("#score").val();
		if(parseFloat(score) > parseFloat(fullScore)) {
			parent.$.toast({
				type : '',
				content : "分数不得大于总分" + fullScore + "分"
			});
			me.val(oldScore);
			return;
		}
		
		if (parseFloat(oldScore) == parseFloat(score)) {
			return;
		}
		var callBack = function(result) {
			var status = result.status;
			var msg = result.msg;
			var data = result.data;
			if (status) {
				parent.$.toast({
					type : 'success',
					content : '打分成功'
				});
				setTimeout(function() {
					searchMarkList(1);
				}, 400);
			} else {
				if ( !data || data.length == 0) {
					parent.$.toast({
						type : 'failure',
						content : msg
					});
				} else {
					var student = [];
					for ( var index in data) {
						var answerId = data[index];
						var name = $("#name" + answerId).text();
						student.push(name);
					}
					var studentStr = student.join(',');
					parent.$.toast({
						type : '',
						content : studentStr + '打分失败' + "（" + msg + "）"
					});
				}
			}
			$('.dataHead_th .dataHead_check').removeClass('dataHead_checked');
		}
		var answerId = me.parent().parent().attr('id');
		var answerIds = [answerId];
		makScore(0, answerIds, score, callBack);
	});
});

function batchMakScore() {
	var checkedEle = $("#markScore .grade_checked");
	var type = checkedEle.attr('data');
	var input = checkedEle.parent().find('input');
	var score = input.val();
	if (score == '') {
		parent.$.toast({
			type : '',
			content : '请输入分值'
		});
		return;
	}
	if (isNaN(score)) {
		parent.$.toast({
			type : '',
			content : '分值必须是数字'
		});
		input.val('');
		return;
	}
	var pattern = /^[0-9]+([.]\d{1})?$/;
	if ( !pattern.test(score)) {
		parent.$.toast({
			type : '',
			content : '分值不合法(最多保留一位小数)'
		});
		input.val('');
		return;
	}
	
	var fullScore = $("#score").val();
	if(parseFloat(score) > parseFloat(fullScore)) {
		var msg = "分数不得大于总分" + fullScore + "分";
		if(type == 2) {
			msg = "得分不得小于0分";
		}
		parent.$.toast({
			type : '',
			content : msg
		});
		input.val('');
		return;
	}
	
	var checkedList = $(".dataBody_td .dataBody_checked");
	if (checkedList.length === 0) {
		parent.$.toast({
			type : '',
			content : '请选择要加分的学生'
		});
		return;
	}
	var answerIds = []
	checkedList.each(function(index, thisObject) { // 遍历被选择的记录
		var id = $(thisObject).parent().attr('id');
		answerIds.push(parseInt(id));
	});
	var callBack = function(result) {
		var status = result.status;
		var msg = result.msg;
		var data = result.data;
		if (status) {
			parent.$.toast({
				type : 'success',
				content : '打分成功'
			});
		} else {
			if ( !data || data.length == 0) {
				parent.$.toast({
					type : 'failure',
					content : msg
				});
			} else {
				var student = [];
				for ( var index in data) {
					var answerId = data[index];
					var name = $("#name" + answerId).text();
					student.push(name);
				}
				var studentStr = student.join(',');
				parent.$.toast({
					type : 'failure',
					content : studentStr + student.length + "位学生加分失败" + "（" + msg + "）"
				});
			}
		}
		$('.dataHead_th .dataHead_check').removeClass('dataHead_checked');
		$(".batchBtn").hide();
		setTimeout(function() {
			location.reload();
		}, 400);
	};
	makScore(type, answerIds, score, callBack);
}

//加分操作
function makScore(type, answerIds, score, callBack) {
	$('#markScore').fullFadeOut();
	var answerIdsStr = answerIds.join(',');
	var courseId = $("#courseid").val();
	var clazzId = $("#clazzid").val();
	var workId = $("#workid").val();
	var cpi = $("#cpi").val();

	$.ajax({
		type : "post",
		url : "/mooc2-ans/work/markscore",
		dataType : "json",
		data : {
			"courseid" : courseId,
			"clazzid" : clazzId,
			"cpi" : cpi,
			"workid" : workId,
			"answerIds" : answerIdsStr,
			"type" : type,
			"score" : score
		},
		success : function(result) {
			callBack && callBack(result);
		},
		error : function() {
			parent.$.toast({
				type : 'failure',
				content : '操作失败'
			});
		}
	});
}

function rebackOne(answerId) {
	$(".dataBody_check").removeClass('dataBody_checked');
	$(".dataBody_td").removeClass('dataBody_active');
	$(".dataHead_check").removeClass('dataHead_checked');
	$(":checkbox").prop("checked", false);
	
	$("#" + answerId).addClass("dataBody_active");
	$("#" + answerId).find(".dataBody_check").addClass("dataBody_checked");
	$("#" + answerId).find(":checkbox").prop("checked", true);
	
	backReason();
}
function backReason() {
	var checkedList = $(".dataBody_td .dataBody_checked");
	if (checkedList.length === 0) {
		parent.$.toast({
			type : '',
			content : '请选择要打回的学生'
		});
		return false;
	}
	
	$("#reason").val("");
	$('#rebackPop').fullFadeIn();
}

var backLock = 0;
function batchReback() {
	if (backLock == 1) {
		return false;
	}
	
	backLock = 1;
	
	var checkedList = $(".dataBody_td .dataBody_checked");
	if (checkedList.length === 0) {
		parent.$.toast({
			type : '',
			content : '请选择要打回的学生'
		});
		backLock = 0;
		return false;
	}
	
	var answerIds = []
	checkedList.each(function(index, thisObject) { // 遍历被选择的记录
		var id = $(thisObject).parent().attr('id');
		answerIds.push(parseInt(id));
	});
	
	var reason = $("#reason").val();
	var patt =  /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
	if(patt.test(reason)){
		parent.$.toast({
			type : '',
			content : '含有不支持的表情或字符'
		});
		backLock = 0;
		return false;
	}
	
	var answerIdsStr = answerIds.join(',');
	var courseId = $("#courseid").val();
	var clazzId = $("#clazzid").val();
	var workId = $("#workid").val();
	var cpi = $("#cpi").val();
	var jobid = $("#jobid").val() || "";

	$.ajax({
		type : "post",
		url : "/mooc2-ans/work/batchBack",
		dataType : "json",
		data : {
			"courseid" : courseId,
			"clazzid" : clazzId,
			"cpi" : cpi,
			"workid" : workId,
			"answerIds" : answerIdsStr,
			"jobid" : jobid,
			"reason" : reason
		},
		success : function(result) {
			$('#markScore').fullFadeOut();
			if (result.status) {
				parent.$.toast({
					type : 'success',
					content : '打回成功'
				});
			} else {
				parent.$.toast({
					type : 'failure',
					content : result.msg
				});
			}
			setTimeout(function() {
				location.reload();
			}, 400);
		},
		error : function() {
			$('#markScore').fullFadeOut();
			parent.$.toast({
				type : 'failure',
				content : '操作失败'
			});
			setTimeout(function() {
				location.reload();
			}, 400);
		}
	});
}

// 单个加时
function addTimeOne(studentId) {
	$(".dataBody_check").removeClass('dataBody_checked');
	$(".dataBody_td").removeClass('dataBody_active');
	$(".dataHead_check").removeClass('dataHead_checked');
	$(":checkbox").prop("checked", false);

	$("#" + studentId).addClass("dataBody_active");
	$("#" + studentId).find(".dataBody_check").addClass("dataBody_checked");
	$("#" + studentId).find(":checkbox").prop("checked", true);

	addTimeBatch();
}

// 批量加时
function addTimeBatch() {
	var num = $(".dataBody_td .dataBody_checked").length;
	if (num == 0) {
		parent.$.toast({
			type : '',
			content : '请选择要加时的学生'
		});
		return;
	}
	$('#addTimePop input[type="text"]').val('');
	$('#addTimePop').fullFadeIn();
}

// 加时操作
var addTimeLock = 0;
function addTime() {
	if (addTimeLock != 0) {
		return;
	}
	addTimeLock = 1;

	var checkedList = $(".dataBody_td .dataBody_checked");
	if (checkedList.length === 0) {
		parent.$.toast({
			type : '',
			content : '请选择要加时的学生'
		});
		addTimeLock = 0;
		return;
	}

	var studentIds = []
	checkedList.each(function(index, thisObject) { // 遍历被选择的记录
		var id = $(thisObject).parent().attr('id');
		studentIds.push(parseInt(id));
	});

	var endtime = $("#endtime").val();
	if (endtime.length == 0) {
		parent.$.toast({
			type : '',
			content : '请设置结束时间'
		});
		addTimeLock = 0;
		return;
	}
	endtime += ":00";

	var studentIdsStr = studentIds.join(',');
	var courseId = $("#courseid").val();
	var clazzId = $("#clazzid").val();
	var workId = $("#workid").val();
	var cpi = $("#cpi").val();

	$.ajax({
		type : "get",
		dataType : "json",
		url : "/mooc2-ans/work/addtime",
		data : {
			"courseid" : courseId,
			"clazzid" : clazzId,
			"cpi" : cpi,
			"workid" : workId,
			"studentIds" : studentIdsStr,
			"endTime" : endtime
		},
		success : function(result) {
			$('#addTimePop').fullFadeOut();
			if (result.status) {
				parent.$.toast({
					type : 'success',
					content : '操作成功'
				});
			} else {
				parent.$.toast({
					type : 'failure',
					content : result.msg
				});
			}
			setTimeout(function() {
				location.reload();
			}, 400);
		},
		error : function() {
			$('#addTimePop').fullFadeOut();
			parent.$.toast({
				type : 'failure',
				content : '操作失败'
			});
			setTimeout(function() {
				location.reload();
			}, 400);
		}
	});
}

// 单个督促
function urgeOne(studentId) {
	$(".dataBody_check").removeClass('dataBody_checked');
	$(".dataBody_td").removeClass('dataBody_active');
	$(".dataHead_check").removeClass('dataHead_checked');
	$(":checkbox").prop("checked", false);

	$("#" + studentId).addClass("dataBody_active");
	$("#" + studentId).find(".dataBody_check").addClass("dataBody_checked");
	$("#" + studentId).find(":checkbox").prop("checked", true);

	urgeBatch();
}

//批量督促
var urgeLock = 0
function urgeBatch() {
	if (urgeLock != 0) {
		return;
	}
	
	var checkedList = $(".dataBody_td .dataBody_checked");
	if (checkedList.length === 0) {
		parent.$.toast({
			type : '',
			content : '请选择要督促的学生'
		});
		return;
	}
	
	workPop(ducuTip, ducuok, popCancel, function() {
		
		urgeLock = 1;
		
		var studentIds = []
		checkedList.each(function(index, thisObject) { // 遍历被选择的记录
			var id = $(thisObject).parent().attr('id');
			studentIds.push(parseInt(id));
		});

		var studentIdsStr = studentIds.join(',');
		var courseId = $("#courseid").val();
		var clazzId = $("#clazzid").val();
		var workId = $("#workid").val();
		var cpi = $("#cpi").val();
		
		$.ajax({
			type : "get",
			dataType : "json",
			url : "/mooc2-ans/work/urge",
			data : {
				"courseid" : courseId,
				"clazzid" : clazzId,
				"cpi" : cpi,
				"workid" : workId,
				"studentIds" : studentIdsStr
			},
			success : function(result) {
				$('.popSetupShowHide').fullFadeOut();
				if (result.status) {
					parent.$.toast({
						type : 'success',
						content : '操作成功'
					});
				} else {
					parent.$.toast({
						type : 'failure',
						content : result.msg
					});
				}
				setTimeout(function() {
					location.reload();
				}, 400);
			},
			error : function() {
				$('.popSetupShowHide').fullFadeOut();
				parent.$.toast({
					type : 'failure',
					content : '操作失败'
				});
				setTimeout(function() {
					location.reload();
				}, 400);
			}
		});
		
	});
}

//一键督促
function urgeAll() {
	if (urgeLock != 0) {
		return;
	}
	
	workPop(ducuTip, ducuok, popCancel, function() {
		
		urgeLock = 1;

		var courseId = $("#courseid").val();
		var clazzId = $("#clazzid").val();
		var workId = $("#workid").val();
		var cpi = $("#cpi").val();
		
		$.ajax({
			type : "get",
			dataType : "json",
			url : "/mooc2-ans/work/urge",
			data : {
				"courseid" : courseId,
				"clazzid" : clazzId,
				"cpi" : cpi,
				"workid" : workId,
				"whole" : true
			},
			success : function(result) {
				$('.popSetupShowHide').fullFadeOut();
				if (result.status) {
					parent.$.toast({
						type : 'success',
						content : '操作成功'
					});
				} else {
					parent.$.toast({
						type : 'failure',
						content : result.msg
					});
				}
				setTimeout(function() {
					location.reload();
				}, 400);
			},
			error : function() {
				$('.popSetupShowHide').fullFadeOut();
				parent.$.toast({
					type : 'failure',
					content : '操作失败'
				});
				setTimeout(function() {
					location.reload();
				}, 400);
			}
		});
	});
}

function showExportScorePop(){
	if($(".banji_list .classli").length>1){
		$("#exportWorkPop").fullFadeIn();
	}else {
		exportScore();
	}
}
function exportScore(isTemplate) {
	
	var submitCount = $("#submitCount").val();
	if(submitCount <= 0) {
		parent.$.toast({
			type : 'failure',
			content : noSubmitTip
		});
		return;
	}
	
	var courseId = $("#courseid").val();
	var clazzId = $("#clazzid").val();
	var workId = $("#workid").val();
	var mooc = $("#mooc").val();
	var cpi = $("#cpi").val();
	var workScoreExportEnc = $("#workScoreExportEnc").val();
	var moocImportExportUrl = $("#moocImportExportUrl").val();
	var studentCount = $("#studentCount").val();
	var downLoadHref = moocImportExportUrl + "/export-workscore?courseId=" + courseId + "&classId=" + clazzId + "&workId=" + workId
		+ "&mooc=" + mooc + "&isTemplate=" + isTemplate + "&cpi=" + cpi + "&enc=" + workScoreExportEnc + "&addLog=true";

	if(typeof studentCount != "" && studentCount > 5000){
		$.ajax({
			url: downLoadHref,
			type: 'get',
			dataType: 'json',
			xhrFields: {
				withCredentials: true
			},
			crossDomain: true,
			success: function (data) {
				if(data.status){
					$.toast({
						type : 'success',
						content : data.msg
					});
				}else{
					$.toast({
						type : 'notice',
						content : data.msg
					});
				}
			}
		});
	}else{
		location.href  = downLoadHref;
	}
}

function exportAllClassWorkScore(){
	var courseId = $("#courseid").val();
	var taskId = $("#taskId").val();
	var cpi = $("#cpi").val();
	var courseTaskExportWorkScoreEnc = $("#courseTaskExportWorkScoreEnc").val();
	var moocImportExportUrl = $("#moocImportExportUrl").val();
	var downLoadHref = moocImportExportUrl + "/worktask/exportscore?courseId=" + courseId+ "&taskId=" + taskId
		+ "&cpi=" + cpi + "&enc=" + courseTaskExportWorkScoreEnc;

	$.ajax({
		url: downLoadHref,
		type: 'get',
		dataType: 'json',
		xhrFields: {
			withCredentials: true
		},
		crossDomain: true,
		success: function (data) {
			if(data.status){
				$.toast({
					type : 'success',
					content : data.msg
				});
			}else{
				$.toast({
					type : 'notice',
					content : data.msg
				});
			}
		}
	});
}

function exportUnSubmit() {
	var unSubmitCount = $("#unSubmitCount").val();
	if(unSubmitCount <= 0) {
		parent.$.toast({
			type : 'failure',
			content : allsubtip
		});
		return;
	}
	
	var courseId = $("#courseid").val();
	var clazzId = $("#clazzid").val();
	var workId = $("#workid").val();
	var cpi = $("#cpi").val();
	var moocImportExportUrl = $("#moocImportExportUrl").val();
	var workScoreExportEnc = $("#workScoreExportEnc").val();

	var downLoadHref = moocImportExportUrl+"/work-unSubmit?courseId=" + courseId + "&clazzid=" + clazzId + "&workid=" + workId + "&cpi=" + cpi+"&enc="+workScoreExportEnc;
		var overSize = $("#stuNumOver2000").val();
	if(typeof overSize != "" && overSize == "true"){
		$.ajax({
			url: downLoadHref,
			type: 'get',
			dataType: 'json',
			xhrFields: {
				withCredentials: true
			},
			crossDomain: true,
			success: function (data) {
				if(data.status){
					$.toast({
						type : 'success',
						content : data.msg
					});
				}else{
					$.toast({
						type : 'notice',
						content : data.msg
					});
				}
			}
		});
	}else{
		location.href  = downLoadHref;
	}
}

function showProgress() {
	$('#importWorkProgress .barCon').css('width', '0%');
	$('#importWorkProgress .barInfo span').text('0%');
	$('#importWorkProgress').fullFadeIn();

	var progressNum = 0;
	var intervalTimer = setInterval(function() {
		progressNum = progressNum + 25;
		if (progressNum >= 100) {
			progressNum = 98;
			clearInterval(intervalTimer);
		}
		$('#importWorkProgress .barCon').css('width', progressNum + '%');
		$('#importWorkProgress .barInfo span').text(progressNum + '%');
	}, 1000);
}

function showImportDiv () {
	$('#importWorkPop').fullFadeIn();
}

function exportScoreTemplate(isTemplate) {
	var workId = $("#workid").val();
	var classId = $("#clazzid").val();
	var mooc = $("#mooc").val();
	var courseId = $("#courseid").val();
	var enc = $("#workScoreExportEnc").val();
	var url = $("#moocImportExportUrl").val();
	var cpi = $("#cpi").val();
	var downLoadHref = url + "/export-workscore?courseId=" + courseId + "&classId=" + classId + "&workId=" + workId + "&mooc=" + mooc + "&isTemplate=" + isTemplate + "&cpi=" + cpi + "&enc=" + enc + "&addLog=true";
	var studentCount = $("#studentCount").val();

	if(typeof studentCount != "" && studentCount > 5000){
		$.ajax({
			url: downLoadHref,
			type: 'get',
			dataType: 'json',
			xhrFields: {
				withCredentials: true
			},
			crossDomain: true,
			success: function (data) {
				alert(data.msg)
			}
		});
	}else{
		location.href  = downLoadHref;
	}
}

function closeProgress() {
	$('#importWorkProgress').fullFadeOut();
}

function importScore(obj) {
	var str = $(obj).val();
	var arr = str.split('\\');
	var fileName = arr[arr.length - 1];
	var reg = /^\s*$/g;
	if (reg.test(fileName)) {
		parent.$.toast({
			type : '',
			content : '请选择上传文件'
		});
		return;
	}

	var excel2003 = /.*(?=xls$)/;
	var excel2007 = /.*(?=xlsx$)/;
	if (fileName.match(excel2003) == null) {
		if (fileName.match(excel2007) != null) {
			parent.$.toast({
				type: '',
				content: '暂不支持excel2007'
			});
		} else {
			parent.$.toast({
				type : '',
				content : '文件格式不正确'
			});
		}
		return;
	}

	$("#importWorkPop").hide();
	showProgress();

	var courseid = $("#courseid").val();
	var clazzid = $("#clazzid").val();
	var workId = $("#workid").val();
	var enc = $("#enc").val();
	var cpi = $("#cpi").val();
	var ip = $("#ip").val();
	var moocImportExportUrl = $("#moocImportExportUrl").val();
	var url = moocImportExportUrl + "/import/importScore?workId="+workId+"&courseid="+courseid+"&classid="+ clazzid+"&enc="+enc+"&cpi="+cpi +"&ipAddress="+ip;
	var data = new FormData();
	var files = $("#excelFile").prop("files");
	if (files.length == 0) {
		parent.$.toast({
			type : '',
			content : '请选择文件'
		});
		return;
	}

	data.append("iframeFileName", files[0]);

	$.ajax({
		url : url,
		type : "post",
		data : data,
		processData : false,
		contentType : false,
		dataType : "json",
		crossDomain : true,
		xhrFields: {withCredentials: true},
		success : function(result) {
			closeProgress();
			var status = result.status;
			var msg = result.msg;
			if (status) {
				parent.$.toast({
					type : 'success',
					content : '导入成功'
				});
				setTimeout(function() {
					location.reload();
				}, 1000);
			} else {
				parent.$.toast({
					type : 'failure',
					content : msg
				});
			}
		},
		error : function(data, status, e) {
			closeProgress();
			parent.$.toast({
				type : 'failure',
				content : '导入失败，请稍后重试'
			});
		}
	});
}

function workPacking() {
	
	var submitCount = $("#submitCount").val();
	if(submitCount <= 0) {
		parent.$.toast({
			type : 'failure',
			content : '还没有学生提交'
		});
        top.loadDownload(1);
        return;
	}
	$('#downWorkAttachment').fullFadeIn();
}

function checkPacking(packtype) {
	$('#downWorkAttachment').fullFadeOut();
	var courseId = $("#courseid").val();
	var clazzId = $("#clazzid").val();
	var workId = $("#workid").val();
	var fid = $.cookie('fid');
	var uid = $.cookie('UID');
    if (typeof fid == "undefined" || fid == "") {
        fid = "0";
    }
	var onlyattachment = $("#downWorkAttachment .grade_checked").attr("data");
	$.ajax({
		type: "get",
		url : "/mooc2-ans/work/packWork",
		data : {
			"courseid" : courseId,
			"clazzid" : clazzId,
			"workid" : workId,
			"type" : 0,
			"uid" : uid,
			"fid" : fid,
			"onlyattachment":onlyattachment,
			"packtype" : packtype
		},
		success:function(data) {
			var result = eval('('+ data +')');
            if (result.status == 0 || result.status == 1) {
                $.toast({type: 'success', content: '可前往下载中心查看进度并下载'});
                top.loadDownload(1);
            } else if (result.status == -2) {
                $.toast({type: '', content: '暂无数据'});
            } else if (result.status == -1) {
                $.toast({type: 'failure', content: '打包失败，请稍后重试！'});
            } else if (result.status == -3) {
                $.toast({type: '', content: result.msg});
            }
		}
	});
}

var evalLock = 0;
function submitGrade() {
	if (evalLock == 1) {
		return;
	}
	evalLock = 1;

	var courseId = $("#courseid").val();
	var clazzId = $("#clazzid").val();
	var workId = $("#workid").val();
	var cpi = $("#cpi").val();

	$.ajax({
		type : "get",
		dataType : "json",
		url : "/mooc2-ans/work/submit-grade",
		data : {
			"courseid" : courseId,
			"clazzid" : clazzId,
			"workid" : workId,
			"cpi" : cpi
		},
		success : function(result) {
			if (result.status) {
				parent.$.toast({
					type : 'success',
					content : '操作成功'
				});
			} else {
				parent.$.toast({
					type : 'failure',
					content : result.msg
				});
			}
			evalLock = 0;
		}
	});
}

var evalLock = 0;
function noticeEval() {

	workPop("系统将自动通知未参与学生，督促其完成互评", "确认", "取消", function() {

		if (evalLock == 1) {
			return;
		}
		evalLock = 1;
		
		var courseId = $("#courseid").val();
		var clazzId = $("#clazzid").val();
		var workId = $("#workid").val();
		var cpi = $("#cpi").val();
		
		$.ajax({
			type : "get",
			dataType : "json",
			url : "/mooc2-ans/work/eval-notice",
			data : {
				"courseid" : courseId,
				"clazzid" : clazzId,
				"cpi" : cpi,
				"workid" : workId
			},
			success : function(result) {
				if (result.status) {
					parent.$.toast({
						type : 'success',
						content : '操作成功'
					});
				} else {
					parent.$.toast({
						type : 'failure',
						content : result.msg
					});
				}
			},
			error : function() {
				parent.$.toast({
					type : 'failure',
					content : '操作失败'
				});
			},
			complete: function(){
				evalLock = 0;
			}
		});
	});

}

function markQuestion() {
	var courseId = $("#courseid").val();
	var classId = $("#clazzid").val();
	var workId = $("#workid").val();
	var cpi = $("#cpi").val();
	var state = $("#state").val();
	var from = $("#from").val() || "";
	location.href = "/mooc2-ans/work/mark-question?courseid=" + courseId + "&clazzid=" + classId + "&cpi=" + cpi + "&workid=" + workId + "&state=" + state + "&from=" + from;
}
function getDaipiyueNum() {
	var courseId = $("#courseid").val();
	var cpi = $("#cpi").val();
	var taskId = $("#taskId").val();
	if(!taskId){
		return;
	}
	$.ajax({
		type : "get",
		url : "/mooc2-ans/work/getDaipiyueNum",
		dataType : "json",
		data : {
			"courseid" : courseId,
			"cpi" : cpi,
			"taskId" : taskId,
		},
		success : function(result) {
			$('.classli').each(function () {
				var classId = $(this).attr("data");
				$(this).append("<span class=\"appr_btn\">待批<i>" + result[classId] +"</i></span>");
			});
		}
	});
}

function submitAnswerOne(studentid) {
	$(".dataBody_check").removeClass('dataBody_checked');
	$(".dataBody_td").removeClass('dataBody_active');
	$(".dataHead_check").removeClass('dataHead_checked');
	$(":checkbox").prop("checked", false);

	$("#" + studentid).addClass("dataBody_active");
	$("#" + studentid).find(".dataBody_check").addClass("dataBody_checked");
	$("#" + studentid).find(":checkbox").prop("checked", true);

	submitAnswerBatch();
}

function submitAnswerBatch() {
	if (submitAnswerLock != 0) {
		return;
	}

	var count = $(".dataBody_td .dataBody_checked").length;
	if (count == 0) {
		parent.$.toast({
			type : "",
			content : "请选择要设为已交的学生"
		});
		return;
	} else if (count > 500) {
		parent.$.toast({
			type : "",
			content : "设置人数超过限制"
		});
		return;
	}

	$("#submitAnswerOk").removeAttr("onclick");
	$("#submitAnswerOk").attr("onclick", "submitAnswer();");
	$("#submitAnswerPop").fullFadeIn();
}

var submitAnswerLock = 0
function submitAnswer() {
	if (submitAnswerLock == 1) {
		return;
	}
	submitAnswerLock = 1;

	var studentArr = []
	$(".dataBody_td .dataBody_checked").each(function() {
		var studentid = $(this).parent().attr("id");
		studentArr.push(parseInt(studentid));
	});

	var count = studentArr.length
	if (count == 0) {
		$("#submitAnswerPop").fullFadeOut();
		parent.$.toast({
			type : "notice",
			content : "请选择要设为已交的学生"
		});
		submitAnswerLock = 0;
		return;
	} else if (count > 50) {
		$("#submitAnswerPop").fullFadeOut();
		parent.$.toast({
			type : "notice",
			content : "设置人数超过限制"
		});
		submitAnswerLock = 0;
		return;
	}

	var score = $("#submitScore").val() || "";
	score = score.trim();
	if (score.length > 0) {
		if (isNaN(score)) {
			parent.$.toast({
				type: "notice",
				content: "分值必须是数字"
			});
			$("#submitScore").val("");
			submitAnswerLock = 0;
			return;
		}
		var pattern = /^[0-9]+([.]\d{1})?$/;
		if (!pattern.test(score)) {
			parent.$.toast({
				type: "notice",
				content: "分值最多保留一位小数"
			});
			$("#submitScore").val("");
			submitAnswerLock = 0;
			return;
		}
		var fullScore = $("#score").val();
		if (parseFloat(score) > parseFloat(fullScore)) {
			parent.$.toast({
				type: "notice",
				content: "分数不得大于总分" + fullScore + "分"
			});
			$("#submitScore").val("");
			submitAnswerLock = 0;
			return;
		}
	}

	var studentids = studentArr.join(',');
	var courseid = $("#courseid").val();
	var clazzid = $("#clazzid").val();
	var workid = $("#workid").val();
	var cpi = $("#cpi").val();

	$.ajax({
		type : "post",
		dataType : "json",
		url : "/mooc2-ans/work/submit-answer",
		data : {
			"courseid" : courseid,
			"clazzid" : clazzid,
			"cpi" : cpi,
			"workid" : workid,
			"score" : score,
			"studentids" : studentids
		},
		success : function(result) {
			$("#submitAnswerPop").fullFadeOut();
			if (result.status) {
				parent.$.toast({
					type : 'success',
					content : '操作成功'
				});
			} else {
				parent.$.toast({
					type : 'failure',
					content : result.msg
				});
			}
			setTimeout(function() {
				location.reload();
			}, 500);
		},
		error : function() {
			$("#submitAnswerPop").fullFadeOut();
			parent.$.toast({
				type : 'failure',
				content : '操作失败'
			});
			setTimeout(function() {
				location.reload();
			}, 500);
		}
	});
}