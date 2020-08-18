"ui";
//----------------------------------全局变量-----------------------------------------------
var myapp = {};
myapp.title = "打卡小橙"  //脚本名
myapp.appName = "完美校园"   //软件名
myapp.saveName = "OrangeLB"  //本地存储名
myapp.packageName = "com.newcapec.mobile.ncp"  //程序包名
myapp.appVersion = "1.0.0"  //版本
//myapp.windowsIndex = 0  //下拉菜单界面索引  默认为0显示操作界面
myapp.delayMax = "2"   //最长延时
myapp.delayMin = "1"   //最短延时
myapp.password = ""  //我的密码
myapp.timeHouse = "08"  //8时
myapp.timeMinute = "00"  //0分
myapp.timeSecond = "00"  //0秒
myapp.fixedTimeFlag = false //是否为定时打卡模式  默认关闭
myapp.instructions = "1.首次使用需要给予悬浮窗权限。每次关闭启动，需要打开无障碍服务，由于不占流量和运行，建议锁定后台运行，有root权限，可以直接使用\n2.通过设定时间，并在输入框中输入锁屏解锁密码（目前只支持数字密码哦），然后点击 定时与解锁 按钮，到了约定时间就会自动进行解锁并打卡（手机可能会出现不兼容现象，可以不设置密码进行使用）。如果没有密码锁屏也可以不输入密码哦。\n3.如果设置了定时模式，但又不想采用定时打卡的方式了，可以通过 取消定时按键 取消定时 \n4.如果手机不兼容定时自动打卡，或想手动打卡 那么可以点击 立即打卡 马上进行打卡哦 \n4.按音量上键可停止打卡工作 \n(～￣▽￣)～"
myapp.protocol = false //是否同意协议 默认未同意
myapp.protocolText =
"\t本软件是用于完美校园打卡的免费软件，不可用于非法用途，未经本人同意授权，也不\
可用于私下交易，或使用本软件开源平台源码进行二次开发，发布群控等灰色软件。\n\n\t本软\
件为兴趣产物，没有做兼容性测试，可能有些手机不兼容无法使用，或部分功能无法使用，\
如有问题可以私聊我(qq1398825239)，虽然因个人时间原因，有可能不会进行后期更新\
维护，但你们的建议将是我前进动力，也希望本软件可以帮到你们\n\n————by Orange\n"
//---------------------------------------------------------------------------------------
//---------------------------------自定义控件--------------------------------------------------
//自定义按钮
var ColoredButton = (function() {
    //继承ui.Widget
    util.extend(ColoredButton, ui.Widget);

    function ColoredButton() {
        //调用父类构造函数
        ui.Widget.call(this);
        //自定义属性color，定义按钮颜色
        this.defineAttr("color", (view, name, defaultGetter) => {
            return this._color;
        }, (view, name, value, defaultSetter) => {
            this._color = value;
            view.attr("backgroundTint", value);
        });
        //自定义属性onClick，定义被点击时执行的代码
        this.defineAttr("onClick", (view, name, defaultGetter) => {
            return this._onClick;
        }, (view, name, value, defaultSetter) => {
            this._onClick = value;
        });
    }
    ColoredButton.prototype.render = function() {
        return (
            <button textSize="16sp" style="Widget.AppCompat.Button.Colored" w="auto"/>
        );
    }
    ColoredButton.prototype.onViewCreated = function(view) {
        view.on("click", () => {
            if (this._onClick) {
                eval(this._onClick);
            }
        });
    }
    ui.registerWidget("colored-button", ColoredButton);
    return ColoredButton;
})();

//---------------------------------------------------------------------------------------
//--------------------------------UI界面-------------------------------------------------
function 操作界面() {
    ui.layout(
        <scroll>
            <vertical>
                <appbar>
                    <toolbar id="toolbar" title="打卡小橙" bg="#ff6000"/>
                </appbar>
                <card w="*" h="auto" margin="10 5" cardCornerRadius="2dp" cardElevation="1dp" gravity="center_vertical">
                    <View bg="#E51400" h="*" w="5" />
                    <horizontal padding="18 8" h="auto">
                        <Switch id="autoService" text="无障碍服务:" checked="{{auto.service != null}}" w="auto" textStyle="bold" />
                        <text layout_weight = "3"></text>
                        <colored-button id="InterfaceSwitching" text="使用说明" color="#c06080" layout_weight = "1"/>
                    </horizontal>
                </card>

                <card w="*" h="auto" margin="10 2" cardCornerRadius="2dp"
                    cardElevation="1dp" gravity="center_vertical">
                    <vertical>
                        <scroll>
                            <vertical  padding="20 1">
                                {/* <text text="设置打卡时间" textColor="black" textSize="16sp" marginTop="10"/> */}
                                <timepicker id = "setTime"/>
                            </vertical>
                        </scroll>
                        <input id="password" inputType="number"  singleLine="true" margin="10 2" hint="请在此处输入你的锁屏密码"></input>
                        <linear>
                            <button id="saveTimeAndPassword" text="定时与解锁" margin="10 5"/>
                            <button id="Cancellation" text="取消定时" margin="10 5"/>
                            <button id="Immediately" text="立即打卡" style="Widget.AppCompat.Button.Colored" w="auto" margin="10 5"/>
                        </linear>
                    </vertical>
                </card> 
            </vertical>
        </scroll>
    )
}
//-----------------------------------------------------------------------------------------
//---------------------------------功能实现-----------------------------------------------------
//console.show();
//获取数据
GetData();

//是否显示声明
protocol();

//显示界面
操作界面();

// 屏蔽输入法弹出
importClass('android.view.WindowManager');
activity.getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_STATE_ALWAYS_HIDDEN);

//存储数据
SaveData();

//检测无障碍权限开关单击事件
ui.autoService.on("check", function(checked) {
    // 用户勾选无障碍服务的选项时，跳转到页面让用户去开启
    if(checked && auto.service == null) {
        app.startActivity({
            action: "android.settings.ACCESSIBILITY_SETTINGS"
        });
    }
    if(!checked && auto.service != null){
        auto.service.disableSelf();
    }
});

// 当用户回到本界面时，resume事件会被触发
ui.emitter.on("resume", function() {
    // 此时根据无障碍服务的开启情况，同步开关的状态
    ui.autoService.checked = auto.service != null;
});

// }
//监测是否按下定时与解锁按钮
ui.saveTimeAndPassword.on("click", ()=>{
    myapp.fixedTimeFlag =true;  //开启定时模式
    myapp.timeHouse = ui.setTime.getCurrentHour();
    myapp.timeMinute = ui.setTime.getCurrentMinute();

    var arry = [myapp.timeHouse,   //存储时间数组
        myapp.timeMinute,
        myapp.timeSecond]
    //存储时间设定
    setStorageData(
        myapp.saveName, "setTime",
        [ui.setTime.getCurrentHour(),   //存储时间数组
        ui.setTime.getCurrentMinute(),
    ]);

    //存储密码
    var passwordtext = ui.password.text(); 
    if(passwordtext != ""){
        setStorageData(myapp.saveName, "password", passwordtext);
    }

    //打印日志，并显示相关设置
    toastLog("你设置的时间为:"+ arry[0]+" 时 "+arry[1]+" 分 " + "\n你的锁屏密码是：" + passwordtext);
    SaveData();
    GetData();
    ui.password.setText("");
    threads.start(function(){
        while (true) {
            //如果是定时模式则 定时执行
            if(myapp.fixedTimeFlag){
                main();
            }
        }
    });
});

//监测是否按下取消定时按钮
ui.Cancellation.on("click", ()=>{
    myapp.fixedTimeFlag = false;

    myapp.password = "";
    threads.shutDownAll();
    SaveData();
    toastLog("你已经取消了定时打卡服务");
});

//监测是否按下立即打卡按钮
ui.Immediately.on("click", ()=>{
    SaveData();
    toastLog("真拿你没办法呢，我这就开始打卡，请不要进行其他操作哟");

    //屏蔽音量键调节声音
    events.setKeyInterceptionEnabled("volume_up", true);
    //启用按键监听
    events.observeKey();
    //监听音量键按下
    events.onKeyDown("volume_up", () => {
        toastLog('按音量上键停止');
        exit();
    });

    threads.start(function(){
        sleep(1500);
        //在新线程执行的代码
        完美校园打卡();
    });
    
});

//监测是否使用说明按钮
ui.InterfaceSwitching.on("click", ()=>{
    //检测是否有悬浮窗权限
    if(!floaty.checkPermission()){
        toastLog("需要开启悬浮窗权限");
        floaty.requestPermission();
    }
    SaveData();
    log("打开说明")
    alert("使用说明", myapp.instructions);
});

function main() {
    //定时执行
    Regular_execution();
    
    完美校园打卡();
}

//是否显示声明
function protocol() {
    if(!myapp.protocol){
        dialogs.build({
            //对话框标题
            title: "声明",
            //对话框内容
            content: myapp.protocolText,
            contentLineSpacing: 1,
            //确定键内容
            positive: "同意",
            //取消键内容
            negative: "不同意并,退出",
            //不可通过框外取消对话框
            canceledOnTouchOutside: false,
        }).on("positive", ()=>{
            //监听确定键
            myapp.protocol = true;
            SaveData();
            toastLog("欢迎使用")
        }).on("negative", ()=>{
            myapp.protocol = false;
            SaveData();
            toastLog("即将退出")
            exit();
        }).show();
    }
}




//保存当前界面配置及数据
function SaveData() {
    //存储当前是否是定时模式
    setStorageData(myapp.saveName, "Cancellation", myapp.fixedTimeFlag);
    //存储当前是否同意协议
    setStorageData(myapp.saveName, "protocol", myapp.protocol);
}

//读取界面配置及数据
function GetData() {
    //如果本地存储中的锁屏密码不为空，则读取锁屏密码
    if (getStorageData(myapp.saveName, "password") != undefined) {
        myapp.password = getStorageData(myapp.saveName, "password");
    }

    //如果本地存储中的时间不为空，则读取定时
    if (getStorageData(myapp.saveName, "setTime") != undefined) {
        var arry = getStorageData(myapp.saveName, "setTime");
        myapp.timeHouse = arry[0];
        myapp.timeMinute = arry[1];
    }

    //获取当前模式  是否为定时模式
    if (getStorageData(myapp.saveName, "Cancellation") != undefined) {
        myapp.fixedTimeFlag = getStorageData(myapp.saveName, "Cancellation");
    }

    //如果本地存储中的协议指标不为空，则读取协议指标
    if (getStorageData(myapp.saveName, "protocol") != undefined) {
        myapp.protocol = getStorageData(myapp.saveName, "protocol");
    }
        //打印获取值日志
    log(myapp.timeHouse + " 时 " +
    myapp.timeMinute + " 分 " +
    myapp.timeSecond + " 秒 " + 
    "\n密码为:" + myapp.password + 
    "\n是否开启定时模式:" + myapp.fixedTimeFlag +
    "\n是否同意协议：" + myapp.protocol);
}

//定时执行
function Regular_execution() {
    while (myapp.fixedTimeFlag) {
        var myDate = new Date();
        if(myDate.getHours() == myapp.timeHouse &&
            myDate.getMinutes() == myapp.timeMinute &&
            myDate.getSeconds() == myapp.timeSecond &&
            myDate.getSeconds() <= myapp.timeSecond + 5) {
            break;
        }
        sleep(500)
    }
    sleep(1000);
}

//完美校园打卡
function 完美校园打卡(){
    setScreenMetrics(1080, 1920);
    AutomaticUnlocking(); //屏幕监测，如果是灭的，就唤醒屏幕, 如果是锁屏状态就解锁

    toastLog("即将打开完美校园");
    app.launchApp(myapp.appName);
    waitForPackage(myapp.packageName);
    sleep(1000);

    //找到健康打卡控件并点击
    var activity = text("健康打卡").findOne();

    if (activity != null) {
        activity.parent().parent().click()
        log("已找到健康打卡");
        sleep(1000);
    } else {
        log("Error:未找到健康打卡");
        alert("由于不可控因素，打卡失败┭┮﹏┭┮，请手动处理");
        return 0;
    }


    //检查是否完成加载  进入到了该页面
    while(true){
        if(text("姓名").exists()){
            log("已找到姓名");
            break;
        }
    }

    //页面向下翻页
    //device.width取屏幕宽度分辨率
    //rect.bottom该控件所在方框的下边界y坐标
    var rect = id("activity_head_textTitleContainer").findOne().bounds();
    var y2 = rect.bottom;

    for (var index = 0; index < 6; index++) {
        swipe(device.width/2 + random(-100, 100),    //x1
                device.height-50,                    //y1
                device.width/2 + random(-100, 100),  //x2
                y2,                                 //y2
                400) ;
                sleep(100);
    }
    sleep(200);

    //找到并点击提价信息控件
        var activity2 = text("提交信息").findOne();

        if (activity2 != null) {
            activity2.click()
            log("已找到提交信息");
            sleep(random(myapp.delayMin, myapp.delayMax) * 200);

        } else {
            log("Error:未找到提交信息");
            alert("由于不可控因素，打卡失败┭┮﹏┭┮，请手动处理");
            return 0;
        }

    //点击确认提交
    setScreenMetrics(1080, 1920);
    click(770, 1640);
    sleep(100);

    if(text("打卡成功").findOne(10000)!= null){
        alert("欢迎回来，已经完成打卡完成啦！\n(～￣▽￣)～");
        sleep(300);
        关闭应用(myapp.packageName);
    }else{
        alert("敌人太强，打不过，打卡失败了，请手动处理\n┭┮﹏┭┮");
    }
}

//屏幕监测，如果是灭的，就唤醒屏幕, 如果是锁屏状态就解锁
function AutomaticUnlocking() {
    for (let index = 0; index < 2; index++) {
        if(!device.isScreenOn()){  //判断是熄是亮
            device.wakeUp()         //没亮则点亮
            sleep(500);
            log("没亮")
        }else{
            log("亮的")
        }  
    }

    //如果密码不为""则上滑 且处于锁屏状态
    if (myapp.password != "" && text("紧急呼叫").exists()){
        //上滑
        log(myapp.password);
        for (let index = 0; index < 2; index++) {
            swipe(device.width/2 + random(-20, 20),   //x1
            device.height-50,                           //y1
            device.width/2 + random(-20, 20),         //x2
            device.height/2 - 50,                       //y2
            600);   
        }
        
        //如果设有密码则根据密码开启锁屏
        if(myapp.password.length >= 4){
            log("密码为" + myapp.password);
            sleep(500);
            for (var index = 0; index < myapp.password.length; index++) {
                log(myapp.password[index]);
                switch (myapp.password[index]) {
                    case "0":
                        click(543, 1458);
                        sleep(random(myapp.delayMin, myapp.delayMax) * 20);
                        break;
                    case "1":
                        click(228, 772);
                        sleep(random(myapp.delayMin, myapp.delayMax) * 20);
                        break;
                    case "2":
                        click(543, 783);
                        sleep(random(myapp.delayMin, myapp.delayMax) * 20);
                        break;
                    case "3":
                        click(853, 783);
                        sleep(random(myapp.delayMin, myapp.delayMax) * 20);
                        break;
                    case "4":
                        click(230, 1000);
                        sleep(random(myapp.delayMin, myapp.delayMax) * 20);
                        break;
                    case "5":
                        click(541, 1010);
                        sleep(random(myapp.delayMin, myapp.delayMax) * 20);
                        break;
                    case "6":
                        click(853, 1013);
                        sleep(random(myapp.delayMin, myapp.delayMax) * 20);
                        break;
                    case "7":
                        click(220, 1235);
                        sleep(random(myapp.delayMin, myapp.delayMax) * 20);
                        break;
                    case "8":
                        click(543, 1233);
                        sleep(random(myapp.delayMin, myapp.delayMax) * 20);
                        break;
                    case "9":
                        click(851, 1223);
                        sleep(random(myapp.delayMin, myapp.delayMax) * 20);
                        break;
                    default:
                        break;
                }
            }
        }
    }
}

//此代码由飞云脚本圈原创（www.feiyunjs.com）
//保存本地数据
function setStorageData(name, key, value) {
    const storage = storages.create(name);  //创建storage对象
    storage.put(key, value);
};

//读取本地数据
function getStorageData(name, key) {
    const storage = storages.create(name);  //创建storage对象
    if (storage.contains(key)) {
        return storage.get(key, "");
    };
    //默认返回undefined
};

//删除本地数据
function delStorageData(name, key) {
    const storage = storages.create(name);  //创建storage对象
    if (storage.contains(key)) {
        storage.remove(key);
    };
};

//强行关闭完美校园
function 关闭应用(packageName) {
    var name = getPackageName(packageName);
    if(!name){
        if(getAppName(packageName)){
            name = packageName;
        }else{
            return false;
        }
    }
    app.openAppSetting(name);
    text(app.getAppName(name)).waitFor();
    let is_sure = textMatches(/(.*强.*|.*停.*|.*结.*|.*行.*)/).findOne();
    if (is_sure.enabled()) {
        textMatches(/(.*强.*|.*停.*|.*结.*|.*行.*)/).findOne().click();
        //textMatches(/(.*确.*|.*定.*)/).findOne(1000).click()
        text("强行停止").findOne().click()
        log(app.getAppName(name) + "应用已被关闭");
        sleep(1000);
        back();
    } else {
        log(app.getAppName(name) + "应用不能被正常关闭或不在后台运行");
        back();
    }
}

// 停止APP
function killApp(packageName) {
    shell('am force-stop ' + packageName, true);
};