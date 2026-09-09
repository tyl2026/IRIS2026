///<summary>
/// [功能描述:费用明细] <para/>
/// [创建者:曾文天] <para/>
/// [创建时间:2015年12月30日] <para/>
///<说明>
///  [说明:将鼠标放在界面某跟踪处，将显示当前费用明细，鼠标移开面板消失]<para/>
///</说明>
///</summary>



/**************************************************************************************************************************
申请单、配血计划  费用明细
**************************************************************************************************************************/

//显示跟踪面板
function ShowFeeDetails(type, data, containerID, isUp) {
    var container = $("#" + containerID)
    var InitFlag = container.attr('InitFlag');
    if (InitFlag>0) {
        return;
    }
    container.show();
    //移除所有事件绑定
    container.unbind();
    //鼠标移入事件
    container.mouseover(function (event) {
        if (type != "1") {
            var htm = ShowReportTraceHtml(data);
        }

        //不存在title_show标签则自动新建
        var title_show = document.getElementById("title_show");
        if (title_show == null) {

            //新建Element
            title_show = document.createElement("div");
            //加入body中                       
            document.getElementsByTagName('body')[0].appendChild(title_show);
            //新建Element的id属性
            var attr_id = document.createAttribute('id');
            //为id属性赋值                    
            attr_id.value = 'title_show';
            //为Element设置id属性                              
            title_show.setAttributeNode(attr_id);
            //$("title_show").css("background-color", "transparent");
            //新建Element的style属性                           
            var attr_style = document.createAttribute('style');
            //绝对定位                 
            attr_style.value = 'position:absolute;'
            //边框、背景颜色                       
                            + 'border:none; background:transparent;background-color:rgba(255,250,240,0.8);'
            //圆角、阴影             
                            + 'border-radius:2px;'
            //行间距            
                            + 'line-height:18px;'
            //字体大小、内间距                                    
                            + 'font-size:12px; padding: 2px 5px;';
            try {
                //为Element设置style属性
                title_show.setAttributeNode(attr_style);
            } catch (e) {
                //IE6
                title_show.style.position = 'absolute';
                title_show.style.border = 'none';
                title_show.style.background = '#FFFFFF';
                title_show.style.lineHeight = '18px';
                title_show.style.fontSize = '18px';
                title_show.style.padding = '2px 5px';
            }

        }
        //在title_show中按每行限定字数显示标题内容，模拟TITLE悬停效果
        title_show.innerHTML = htm;

        //显示悬停效果DIV
        title_show.style.display = 'block';

        //根据鼠标位置设定悬停效果DIV位置
        event = event || window.event;                            //鼠标、键盘事件
        var top_down = 15;                                        //下移15px避免遮盖当前标签
        //最左值为当前鼠标位置 与 body宽度减去悬停效果DIV宽度的最小值，否则将右端导致遮盖
        var left = Math.min(event.clientX, document.body.clientWidth - title_show.clientWidth);
        title_show.style.left = left + 20 + "px";            //设置title_show在页面中的X轴位置。
        //是否向上显示
        if (isUp) {
            var bdy_height = data.length * 20;
            title_show.style.top = (event.clientY + top_down - bdy_height - 40) + "px";    //设置title_show在页面中的Y轴位置。
        } else {
            title_show.style.top = (event.clientY + top_down) + "px";    //设置title_show在页面中的Y轴位置。
        }
    });
    //鼠标移除事件
    container.mouseout(function () {
        var title_show = document.getElementById("title_show");
        //不存在悬停效果，直接返回
        if (title_show == null) return false;
        //隐藏悬停效果DIV
        title_show.style.display = "none";
    });
}

///标本详情
function ShowReportTraceHtml(data) {
    var flow = '<div id="ReportTraceDiv" style="padding:4px 10px 24px 10px;width:400px;">';
    flow += '<table>';
    flow += '<tr style="background-color:#ccc"><td>名称</td><td>单价</td><td>数量</td><td>预付</td><td>是否交费</td></tr>';
    for (var i = 0; i < data.length; i++) {
        var item = data[i];
        //10创建 Create，20执行 Execute,30取消 Cancel
        if (item.ItemStatus == '30') {
            continue;
        }
        if (item.Price == "0") {
            continue;
        }
        var fee = item.Price * item.Quantity;
        var chargestatus = "未收费";
        if (item.HISOrderStatus == "1") {
            chargestatus = "已收费";
        }
        //门诊病人进行是否交费提示
        if (item.AdmType == "I") {
            flow += '<tr><td>'; 
        }
        else {
            if (item.HISOrderStatus != "1") {
               flow += '<tr  style="color:red"><td>';
            }
            else {
                flow += '<tr><td>'; 
            }
         }
        flow += item.CostItemName + '</td><td>' + item.Price;
        flow += '</td>';
        flow += '<td>';
        flow += item.Quantity + '</td><td>' + fee;
        flow += '</td>';
        if (item.AdmType == "I") {
            flow += '</tr>';
        }
        else { 
            flow += '<td>' + chargestatus + '</td></tr>';
        }
    }
    flow += '</table>';
    flow += '</div>';

    return flow;
}

