import configparser
import time
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.edge.options import Options
from urllib import parse

from excel import start

# conf globals
id = ""
pswd = ""
i_course = -1
i_class = -1  # -1 default

# other globals
driver = None
wait = None
frame = None


def init_driver():
    global driver, wait
    # 创建Edge浏览器选项 (关闭下载窗口)
    edge_options = Options()
    edge_options.add_experimental_option("prefs", {
        "browser.show_hub_popup_on_download_start": False,
        # "download.default_directory": r'C:\Users\tom\Desktop\xxt-tool'  # 可选，指定下载文件的保存路径
    })
    # 最大化窗口以免点击不到，或者覆盖图层
    edge_options.add_argument("--start-maximized")

    # 启动Edge浏览器并传入选项
    driver = webdriver.Edge(options=edge_options)
    wait = WebDriverWait(driver, 30)
    driver.implicitly_wait(10)

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

    frame = driver.find_element(By.CSS_SELECTOR, "#frame_content-zy")
    driver.switch_to.frame(frame)
    ele = driver.find_element(
        By.CSS_SELECTOR, "#fanyaTask > div:nth-child(2) > div.padtop20 > div.banji_select_height.fl > div")
    ele.click()


def choose_class():
    global i_class, frame
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


def download():
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
    global id,pswd,i_course,i_class
    try:
        import configuration
        print(configuration)
        confs = {k:v for k,v in configuration.__dict__.items() if not k.startswith("_")}
        for k,v in confs.items():
            globals()[k] = v
    except: 
        pass
    
    
def complete_download_brute():
    read_ini()
    init_driver()
    login()
    choose_course()
    choose_class()
    download()

def complete_download_statistic():
    read_ini()
    init_driver()
    login()
    choose_course()
    
    
    choose_class()
    # https://stat2-ans.chaoxing.com/stat2/teach-data/export?clazzid=86590150&courseid=227598892&cpi=258675818&ut=t&pEnc=&seltables=1%2C2%2C3%2C4%2C5%2C6%2C7%2C8%2C9%2C10%2C11%2C12&type=1&exportType=0
    download()

if __name__ == "__main__":
    complete_download_brute()



# https://mooc2-ans.chaoxing.com/mooc2-ans/mycourse/tch?courseid=227598892&clazzid=86590150&cpi=258675818&enc=a5f03716878a126f49f07c862b004830&t=1705766049981&pageHeader=8
# TODO operation 2 通过统计下载