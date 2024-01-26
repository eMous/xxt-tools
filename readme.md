# 这是什么

超星学习通教师端可能会用到的一系列工具的集合：

- 油猴工具（快捷键批阅、快捷键评语等）
- 作业成绩下载，作业成绩 Excel 汇总

# 如何使用（python脚本部分）

1. `pip install -r requirements.txt` better in virtual env

2. copy configuration.py.template to configuration.py in the prj dir

   - modify the conf, especially for your `id` and your `pswd`

   - it is suggested to set download dir and make download dir same as excel dir, for example as following:

   ```py
       download_dir = os.path.join(os.path.join(os.path.expanduser("~"), "Desktop"),"xxt-downloads")
       excel_dir = download_dir
   ```

   - `i_course` and `i_class` is for testing with which less input interation is need

3. `python3 main.py`
   - 推荐使用`2,4`进行下载和 excel 生成，`2,4`是学习通官方的成绩统计文件
   - `1,3`为暴力抓取全部作业下的成绩记录，再逐一复制，当`2,4`出现异常的时候可以尝试使用

# 如何使用（油猴）
1. 只需在油猴中安装 `xxt-tools-gm.js`，根据需要修改`@require`为Github路径或本地File路径。
   - 本地File方式可以用于测试，或添加、修改脚本功能。
   - 本地File方式需要下载对应文件到本地。
2. 进入按题批阅界面（快捷键如下,可以按需在js文件中自行调整）。
   1. `1234567890`快速评分对应的百分比成绩。
   2. `<Enter>`手动输入百分比成绩，插件提供实时预览题目百分比成绩与具体得分的对应关系。
   3. `<Alt><Enter>`新增评语。
   4. `qwer...`(英文字母)选中/取消选中评语，每次选中或取消选中评语，在评语编辑栏中都会自动格式化对应的评语; 也可以鼠标单击选中。
   5. `<Alt>qwer...`(Alt+英文字母)修改评语。
   6. `<Shift>qwer...`(Shift+英文字母)删除评语。
   7. `-`导入评语(`1.x\n 2.y\n 3.z\n...`形式，可随意输入一个文件，看Console中的格式提示)。
   8. <code>&grave;</code>导出评语（文件名中附带具体课程名，班级名，教师名，作业名，题目序号，时间）。

# todo
1. 快捷键旋转图片
2. 自动移动到打分处
3. 自动预览文件
4. 评语自动得分（评语带分值属性）
