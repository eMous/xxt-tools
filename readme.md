# What it is
自动下载超星学习通某个课程某个班级的全部成绩记录，然后将每次作业的成绩部分过滤出来，生成一个excel用于打分。
# How to use
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
   - 推荐使用`2,4`进行下载和excel生成，`2,4`是学习通官方的成绩统计文件
   - `1,3`为暴力抓取全部作业下的成绩记录，再逐一复制，当`2,4`出现异常的时候可以尝试使用
