import configparser
from datetime import datetime
import os
import time
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.edge.options import Options
from urllib import parse

from excel import complete_excel_task_hwstyle

# conf globals
id = ""
pswd = ""
i_course = -1
i_class = -1  # -1 default
download_dir = os.path.join(os.path.join(os.path.expanduser("~"), "Desktop"),"xxt-downloads")

# may put into conf
cpi = ""
clazz_id = ""
course_id = ""


# other globals
driver = None
wait = None
frame = None
now = None


def init_driver():
    global driver, wait
    # 创建Edge浏览器选项 (关闭下载窗口)
    edge_options = Options()
    prefs = {
        "browser.show_hub_popup_on_download_start": False,
    }
    if download_dir != "/":
        prefs["download.default_directory"] = download_dir
            
    edge_options.add_experimental_option("prefs", prefs)
    # 最大化窗口以免点击不到，或者覆盖图层
    edge_options.add_argument("--start-maximized")
    edge_options.add_argument("verify=False")
    edge_options.add_argument("log-level=3")
    # edge_options.add_argument('--ignore-certificate-errors-spki-list')

    # 启动Edge浏览器并传入选项
    driver = webdriver.Edge(options=edge_options)
    wait = WebDriverWait(driver, 20)
    driver.implicitly_wait(6)

    return driver


def login():
    global id, pswd
    # 登录超星
    if (id == "" or pswd == ""):
        id = input("输入你的手机号:")
        pswd = input("输入你的密码:")

    driver.get("https://passport2.chaoxing.com/")
    ele = driver.find_element(value="phone")
    ele.send_keys(id)
    ele = driver.find_element(value="pwd")
    ele.send_keys(pswd, Keys.ENTER)


def choose_course():
    global i_course, i_class, frame
    # 获取所有课程并选择课程
    frame = driver.find_element(By.XPATH, "/html/body/div[2]/div[2]/iframe")
    driver.switch_to.frame(frame)

    eles = driver.find_elements(By.CSS_SELECTOR, "div.course-info a.color1")
    print("选择要下载数据的课程：")
    for i, v in enumerate(eles):
        print(f"({i}). {v.text}")
    # index for course is preset
    while not 0 <= i_course < len(eles):
        i_course = int(input("你的选择是："))

    # 选择授课班级
    eles[i_course].click()
    driver.switch_to.window(driver.window_handles[1])
    driver.find_element(By.CSS_SELECTOR, "li a[title='作业']").click()


def choose_class_in_hw():
    global i_class, frame
    frame = driver.find_element(By.CSS_SELECTOR, "#frame_content-zy")
    driver.switch_to.frame(frame)
    ele = driver.find_element(
        By.CSS_SELECTOR, "#fanyaTask > div:nth-child(2) > div.padtop20 > div.banji_select_height.fl > div")
    ele.click()

    eles = driver.find_elements(
        By.CSS_SELECTOR, "div.banji_select_con li.inShow[title]:not([title='']")
    print("选择要下载数据的班级：")
    for i, v in enumerate(eles):
        print(f"({i}). {v.get_attribute("title")}")
    # index for class is preset
    while not 0 <= i_class < len(eles):
        i_class = int(input("你的选择是："))
    eles[i_class].click()
    driver.switch_to.window(driver.window_handles[0])
    driver.close()
    driver.switch_to.window(driver.window_handles[0])
    driver.switch_to.frame(frame)


def download_via_hwpages():
    clazz_ids = []
    course_ids = []
    work_ids = []
    work_names = []
    cpis = []
    encs = []

    while True:
        lis = driver.find_elements(By.CSS_SELECTOR, "div.pageDiv li")
        lis_lr = list((li for li in lis if li.text == ""))
        if (len(lis) != 0):
            c_page = next(
                (li for li in lis if "xl-active" in li.get_attribute("class"))).text
            max_page = lis[-2].text

        eles = driver.find_elements(
            By.CSS_SELECTOR, "a.piyueBtn")
        for i in range(len(eles)):

            ele = driver.find_element(
                By.CSS_SELECTOR, f"div.taskList ul li:nth-of-type({i+1}) h2")
            work_names.append(ele.text)

            # to avoid stale element
            ele = driver.find_element(
                By.CSS_SELECTOR, f"div.taskList ul li:nth-of-type({i+1}) a.piyueBtn")
            ele.click()

            clazz_ids.append(driver.find_element(
                By.CSS_SELECTOR, "input#clazzid").get_attribute("value"))
            course_ids.append(driver.find_element(
                By.CSS_SELECTOR, "input#courseid").get_attribute("value"))
            work_ids.append(driver.find_element(By.CSS_SELECTOR,
                            "input#workid").get_attribute("value"))
            cpis.append(driver.find_element(By.CSS_SELECTOR,
                        "input#cpi").get_attribute("value"))
            encs.append(driver.find_element(By.CSS_SELECTOR,
                        "input#workScoreExportEnc").get_attribute("value"))
            driver.back()
            frame = driver.find_element(By.CSS_SELECTOR, "#frame_content-zy")
            driver.switch_to.frame(frame)

        if (len(lis) != 0):
            if (c_page == max_page):
                break
            else:
                lis = driver.find_elements(By.CSS_SELECTOR, "div.pageDiv li")
                lis_lr = list((li for li in lis if li.text == ""))
                lis_lr[1].click()
        else:
            break

    d_cnt = 0
    for clazz_id, course_id, work_id, cpi, enc, work_name in zip(clazz_ids, course_ids, work_ids, cpis, encs, work_names):
        url = f"https://mooc-import-export-ans.chaoxing.com/export-workscore?courseId={
            course_id}&classId={clazz_id}&workId={work_id}&cpi={cpi}&enc={enc}"
        driver.get(url)
        d_cnt += 1
        print(f"[{d_cnt}] 开始下载 {work_name}")
        time.sleep(0.3)


def read_ini():
    global id, pswd, i_course, i_class
    try:
        import configuration
        confs = {k: v for k, v in configuration.__dict__.items()
                 if not k.startswith("_")}
        for k, v in confs.items():
            globals()[k] = v
    except:
        pass


def choose_class_in_statistic():
    global i_class, course_id, clazz_id, cpi, now
    # open statistic page
    driver.find_element(By.CSS_SELECTOR, "li a[title='统计']").click()

    cpi = driver.find_element(
        By.CSS_SELECTOR, "input#cpi").get_attribute("value")
    course_id = driver.find_element(
        By.CSS_SELECTOR, "input#courseid").get_attribute("value")
    # 切换到 id 为 frame_content-tj 的 iframe
    frame = driver.find_element(By.CSS_SELECTOR, "#frame_content-tj")
    driver.switch_to.frame(frame)
    frame = driver.find_element(By.CSS_SELECTOR, "iframe#tj-head")
    driver.switch_to.frame(frame)
    driver.find_element(By.XPATH, ".//li[text()='学生成绩']").click()

    # 找到班级选择框
    el = driver.find_element(By.CSS_SELECTOR, "a.banji_select_name")
    el.click()
    time.sleep(0.3)
    # 查找class 为 clazzUL 下的所有li
    eles = driver.find_elements(By.CSS_SELECTOR, "#clazzUl li")
    print("选择要下载数据的班级：")
    for i, v in enumerate(eles):
        print(f"({i}). {v.find_element(By.CSS_SELECTOR,"span.banji_text").text}")
        
    while not 0 <= i_class < len(eles):
        i_class = int(input("你的选择是："))
    ele = eles[i_class]
    clazz_id = ele.get_attribute("onclick")
    # 从字符串中拿到数字
    clazz_id = clazz_id[clazz_id.index("(")+1:clazz_id.index(")")]
    ele.click()
    # download task start url
    now = datetime.strptime(
        datetime.now().strftime("%m-%d %H:%M"), "%m-%d %H:%M")
    url = f"https://stat2-ans.chaoxing.com/stat2/teach-data/export?clazzid={clazz_id}&courseid={course_id}&cpi={
        cpi}&ut=t&pEnc=&seltables=1%2C2%2C3%2C4%2C5%2C6%2C7%2C8%2C9%2C10%2C11%2C12&type=1&exportType=0"
    driver.execute_script(f"window.open('{url}');")
    driver.switch_to.window(driver.window_handles[2])
    # get 01-21 11:00 style now date
    assert (r'{"status":true}' in driver.find_element(
        By.CSS_SELECTOR, "body").text)
    driver.close()
    driver.switch_to.window(driver.window_handles[1])


def download_from_statistic():
   # global now
    driver.switch_to.window(driver.window_handles[1])
    url = f"https://mooc2-ans.chaoxing.com/mooc2-ans/tcm/downloadcenter?courseId={
        course_id}&pageNum=1&cpi={cpi}&order=down"
    driver.execute_script(f"window.open('{url}');")

    driver.switch_to.window(driver.window_handles[2])
    # find all ul in div.downloadContent and filter uls that contains li.exporting which text content is 导出成功
    uls = driver.find_elements(By.CSS_SELECTOR, "div#downloadContent ul")

    def ul_valid(ul: webdriver.remote.webelement.WebElement):
        lis = ul.find_elements(By.CSS_SELECTOR, "li")
        if len(lis) == 0:
            return False
        b_has_export_suc = False
        b_has_date_later = False
        for li in lis:
            if (li.get_attribute("class") == "exporting"):
                b_has_export_suc = True
            try:
                # check how much time laps from now to li.text
                if ((datetime.strptime(li.text, "%m-%d %H:%M") - now).total_seconds() >= 0):
                    b_has_date_later = True
            except:
                pass
        if (not b_has_export_suc or not b_has_date_later):
            return False
        return True
    uls = [ul for ul in uls if ul_valid(ul)]
    if (len(uls) == 0):
        print("未找到新的导出结果, 一秒钟后重新尝试")
        time.sleep(1)
        driver.close()
        download_from_statistic()
    else:
        print("找到新的导出结果")
        url = uls[0].find_element(By.CSS_SELECTOR, "li.handles a").get_attribute("href")
        window_cnt = len(driver.window_handles)
        driver.execute_script(f"window.open('{url}');")
        print("开始下载全部统计数据")
        time.sleep(0.1)
        while len(driver.window_handles) != window_cnt:
            time.sleep(0.3)
        print("下载统计数据完成")
            
            
        


def complete_download_hwstyle():
    read_ini()
    init_driver()
    login()
    choose_course()
    choose_class_in_hw()
    download_via_hwpages()


def complete_download_statistic():
    read_ini()
    init_driver()
    login()
    choose_course()

    choose_class_in_statistic()
    # https://stat2-ans.chaoxing.com/stat2/teach-data/export?clazzid=86590150&courseid=227598892&cpi=258675818&ut=t&pEnc=&seltables=1%2C2%2C3%2C4%2C5%2C6%2C7%2C8%2C9%2C10%2C11%2C12&type=1&exportType=0
    download_from_statistic()


if __name__ == "__main__":
    while True:
        print("请选择下载方式：")
        print("(1) 【下载】通过作业页面下载全部文件(非官方统计结果)")
        print("(2) 【下载】通过统计页面下载全部文件(官方统计结果)【推荐】")

        operation = -1
        # 创建一个列表 [1,2,3,4...100]
        
        while operation not in range(1,3):
            try:
                operation = int(input("你的选择是："))
            except:
                pass
            
        if operation == 1:
            complete_download_hwstyle()
        elif operation == 2:
            complete_download_statistic()
        print("到Edge默认下载地址查看结果")
        driver.quit()
        
    # complete_download_brute()
    complete_download_statistic()


# https://mooc2-ans.chaoxing.com/mooc2-ans/mycourse/tch?courseid=227598892&clazzid=86590150&cpi=258675818&enc=a5f03716878a126f49f07c862b004830&t=1705766049981&pageHeader=8
# TODO operation 2 通过统计下载
