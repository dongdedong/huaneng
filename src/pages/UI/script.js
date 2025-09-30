// 全局变量存储当前图表数据
let currentChartData = {
    categories: [],
    values: [],
    filterType: '',
    dataType: ''
};

// 页面切换函数
function showPage(pageId) {
    const pages = document.querySelectorAll('.subpage, #main-page');
    pages.forEach(page => page.style.display = 'none');
    document.getElementById(pageId).style.display = 'block';
}

// 显示图表页面
function showChartPage() {
    // 获取用户选择的值
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    const filterType = document.getElementById('filter-type').value;
    const dataType = document.querySelector('input[name="data-type"]:checked').value;
    
    // 切换到图表页面
    showPage('chart-page');
    
    // 生成图表
    generateChart(filterType, dataType);
}

// 切换是否隐藏0数据
function toggleZeroData() {
    const toggleElement = document.getElementById('toggle-zero');
    toggleElement.classList.toggle('bold');
    updateChart();
}

// 更新图表
function updateChart() {
    generateChart(currentChartData.filterType, currentChartData.dataType);
}

// 生成图表（模拟数据）
function generateChart(filterType, dataType) {
    const chartPlaceholder = document.getElementById('chart-placeholder');
    const chartControls = document.getElementById('chart-controls');
    
    // 显示控制栏
    chartControls.style.display = 'flex';
    
    // 根据选择显示不同的模拟数据
    let categories = [];
    let data = [];
    
    if (filterType === 'department') {
        // 项目开发部数据
        categories = ['规划部', '南阳项目开发部', '豫北项目开发部', '灵宝项目开发部', '省直项目开发部', '郑州项目开发部', '开封项目开发部', '漯河项目开发部', '许昌项目开发部', '商丘项目开发部', '周口项目开发部'];
        // 模拟数据 - 包含一些0值以测试隐藏功能
        data = dataType === 'count' ? [15, 8, 12, 0, 20, 18, 7, 0, 13, 6, 9] : [120, 85, 95, 0, 180, 150, 75, 0, 110, 60, 80];
    } else {
        // 河南省各地市，按首字母排序
        categories = ['安阳', '鹤壁', '济源', '焦作', '开封', '洛阳', '南阳', '平顶山', '三门峡', '商丘', '新乡', '信阳', '许昌', '郑州', '周口', '驻马店'];
        // 模拟数据 - 包含一些0值以测试隐藏功能
        data = dataType === 'count' ? [5, 3, 0, 8, 7, 12, 15, 6, 0, 6, 9, 10, 13, 20, 8, 7] : [45, 30, 0, 75, 65, 110, 140, 55, 0, 60, 85, 95, 125, 190, 75, 65];
    }
    
    // 保存当前数据
    currentChartData = {
        categories: categories,
        values: data,
        filterType: filterType,
        dataType: dataType
    };
    
    // 获取排序方式
    const sortOrder = document.getElementById('sort-order').value;
    const hideZero = document.getElementById('toggle-zero').classList.contains('bold');
    
    // 处理数据
    let displayData = [];
    
    for (let i = 0; i < categories.length; i++) {
        if (!hideZero || data[i] > 0) {
            displayData.push({value: data[i], label: categories[i]});
        }
    }
    
    // 排序
    if (sortOrder === 'asc') {
        displayData.sort((a, b) => a.value - b.value);
    } else {
        displayData.sort((a, b) => b.value - a.value);
    }
    
    // 创建柱状图
    createBarChart(displayData.map(item => item.label), displayData.map(item => item.value), dataType);
}

// 创建柱状图
function createBarChart(categories, values, dataType) {
    const chartPlaceholder = document.getElementById('chart-placeholder');
    
    // 清空容器
    chartPlaceholder.innerHTML = '';
    
    // 创建柱状图容器
    const barChart = document.createElement('div');
    barChart.className = 'bar-chart';
    
    // 找到最大值用于缩放
    const maxValue = Math.max(...values, 1); // 避免最大值为0
    
    // 创建每个柱子
    for (let i = 0; i < categories.length; i++) {
        const barContainer = document.createElement('div');
        barContainer.className = 'bar-container';
        
        const bar = document.createElement('div');
        bar.className = 'bar';
        // 计算柱子高度（最大250px）
        const barHeight = Math.max(20, (values[i] / maxValue) * 250); // 最小高度20px以确保可见性
        bar.style.height = '0px'; // 初始高度为0，用于动画
        bar.style.width = '30px';
        
        // 添加值标签
        const valueLabel = document.createElement('div');
        valueLabel.className = 'bar-value';
        valueLabel.textContent = values[i];
        
        // 添加类别标签
        const label = document.createElement('div');
        label.className = 'bar-label';
        label.textContent = categories[i];
        
        // 组装
        barContainer.appendChild(bar);
        barContainer.appendChild(valueLabel);
        barContainer.appendChild(label);
        barChart.appendChild(barContainer);
        
        // 添加动画效果
        setTimeout(() => {
            bar.style.height = `${barHeight}px`;
        }, i * 50); // 错开动画时间，形成流动效果
    }
    
    // 添加Y轴标签
    const yAxisLabel = document.createElement('div');
    yAxisLabel.style.position = 'absolute';
    yAxisLabel.style.left = '10px';
    yAxisLabel.style.top = '50%';
    yAxisLabel.style.transform = 'translateY(-50%) rotate(-90deg)';
    yAxisLabel.style.fontSize = '14px';
    yAxisLabel.style.fontWeight = 'bold';
    yAxisLabel.style.color = '#666';
    yAxisLabel.textContent = dataType === 'count' ? '对接项目数量' : '对接项目容量 (MW)';
    
    // 设置图表容器为相对定位
    chartPlaceholder.style.position = 'relative';
    chartPlaceholder.appendChild(barChart);
    chartPlaceholder.appendChild(yAxisLabel);
    
    // 添加X轴标题
    const xAxisLabel = document.createElement('div');
    xAxisLabel.style.marginTop = '20px';
    xAxisLabel.style.fontSize = '14px';
    xAxisLabel.style.fontWeight = 'bold';
    xAxisLabel.style.color = '#666';
    xAxisLabel.textContent = currentChartData.filterType === 'department' ? '项目开发部' : '项目区域';
    chartPlaceholder.appendChild(xAxisLabel);
}

// 初始化页面
function init() {
    // 设置日期选择器的最小值
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    
    // 设置最小日期为2000年1月1日
    startDateInput.min = '2000-01-01';
    endDateInput.min = '2000-01-01';
    
    // 设置默认日期范围
    const today = new Date();
    const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    
    startDateInput.valueAsDate = lastYear;
    endDateInput.valueAsDate = today;
    
    // 限制结束日期不能早于开始日期
    startDateInput.addEventListener('change', () => {
        if (endDateInput.value < startDateInput.value) {
            endDateInput.value = startDateInput.value;
        }
    });
    
    endDateInput.addEventListener('change', () => {
        if (endDateInput.value < startDateInput.value) {
            startDateInput.value = endDateInput.value;
        }
    });
    
    // 为返回按钮添加触摸反馈
    const backButtons = document.querySelectorAll('.back-button');
    backButtons.forEach(button => {
        button.addEventListener('touchstart', () => {
            button.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        });
        
        button.addEventListener('touchend', () => {
            button.style.backgroundColor = 'transparent';
        });
    });
    
    // 为提交按钮添加加载效果
    const submitButtons = document.querySelectorAll('.submit-button');
    submitButtons.forEach(button => {
        button.addEventListener('click', function() {
            const originalText = this.textContent;
            this.innerHTML = '<span class="loading"></span> 提交中...';
            this.disabled = true;
            
            // 模拟提交延迟
            setTimeout(() => {
                this.textContent = originalText;
                this.disabled = false;
            }, 500);
        });
    });
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', init);