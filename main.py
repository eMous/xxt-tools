
from download import complete_download_hwstyle, complete_download_statistic
import download
from excel import complete_excel_task_hwstyle, complete_excel_task_statistic

if __name__ == "__main__":
    while True:
        print("请选择下载方式：")
        print("(1) 【下载】通过作业页面下载全部文件(非官方统计结果)")
        print("(2) 【下载】通过统计页面下载官方统计文件【推荐】")
        print("(3) 【Excel】处理通过作业页面下载的作业数据文")
        print("(4) 【Excel】处理通过统计页面下载的官方统计文件【推荐】")

        operation = -1
        while operation not in range(1, 5):
            try:
                operation = int(input("你的选择是："))
            except:
                pass

        if operation == 1:
            complete_download_hwstyle()
            download.driver.quit()
        elif operation == 2:
            complete_download_statistic()
            download.driver.quit()
        elif operation == 3:
           complete_excel_task_hwstyle()
        elif operation == 4:
           complete_excel_task_statistic()

