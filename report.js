// 工序列表
const processes = [
    { id: 'review', name: '评审' },
    { id: 'preparation', name: '生产准备' },
    { id: 'production', name: '生产' },
    { id: 'inspection', name: '质检' },
    { id: 'packaging', name: '包装' }
];

// 从localStorage加载工单数据
function loadWorkOrders() {
    const data = localStorage.getItem('workOrders');
    return data ? JSON.parse(data) : [];
}

// 保存工单数据到localStorage
function saveWorkOrders(workOrders) {
    localStorage.setItem('workOrders', JSON.stringify(workOrders));
}

// 从localStorage加载报工数据
function loadReports() {
    const data = localStorage.getItem('reports');
    return data ? JSON.parse(data) : {};
}

// 保存报工数据到localStorage
function saveReports(reports) {
    localStorage.setItem('reports', JSON.stringify(reports));
}

// 返回主页
function goBack() {
    window.location.href = 'index.html';
}

// 加载工单信息
function loadOrderInfo() {
    const currentReport = localStorage.getItem('currentReport');
    if (!currentReport) {
        alert('未找到报工信息，请从主页进入');
        goBack();
        return;
    }
    
    const { orderId, processId } = JSON.parse(currentReport);
    const workOrders = loadWorkOrders();
    const order = workOrders.find(o => o.orderId === orderId);
    
    if (!order) {
        alert('未找到工单信息');
        goBack();
        return;
    }
    
    // 显示工单信息
    const orderInfo = document.getElementById('orderInfo');
    orderInfo.innerHTML = `
        <div class="order-info-item">
            <div class="order-info-label">工单编号</div>
            <div class="order-info-value">${order.orderId}</div>
        </div>
        <div class="order-info-item">
            <div class="order-info-label">图号</div>
            <div class="order-info-value">${order.drawingNumber}</div>
        </div>
        <div class="order-info-item">
            <div class="order-info-label">物料名称</div>
            <div class="order-info-value">${order.materialName}</div>
        </div>
        <div class="order-info-item">
            <div class="order-info-label">订单数量</div>
            <div class="order-info-value">${order.orderQuantity}</div>
        </div>
        <div class="order-info-item">
            <div class="order-info-label">交期</div>
            <div class="order-info-value">${order.deliveryDate}</div>
        </div>
        <div class="order-info-item">
            <div class="order-info-label">订单类型</div>
            <div class="order-info-value">${order.orderType}</div>
        </div>
        ${order.customerCode ? `
        <div class="order-info-item">
            <div class="order-info-label">客户代码</div>
            <div class="order-info-value">${order.customerCode}</div>
        </div>
        ` : ''}
        ${order.orderNumber ? `
        <div class="order-info-item">
            <div class="order-info-label">订单号</div>
            <div class="order-info-value">${order.orderNumber}</div>
        </div>
        ` : ''}
        ${order.batchNumber ? `
        <div class="order-info-item">
            <div class="order-info-label">批次号</div>
            <div class="order-info-value">${order.batchNumber}</div>
        </div>
        ` : ''}
        ${order.processLeader ? `
        <div class="order-info-item">
            <div class="order-info-label">工艺负责人</div>
            <div class="order-info-value">${order.processLeader}</div>
        </div>
        ` : ''}
        ${order.processRoute && order.processRoute.length > 0 ? `
        <div class="order-info-item">
            <div class="order-info-label">工艺路线</div>
            <div class="order-info-value">${order.processRoute.join(', ')}</div>
        </div>
        ` : ''}
    `;
    
    // 显示工序标题
    const process = processes.find(p => p.id === processId);
    if (process) {
        document.getElementById('processTitle').textContent = `${process.name}工序报工`;
    }
    
    // 生成报工表单
    generateReportForm(orderId, processId);
}

// 生成报工表单
function generateReportForm(orderId, processId) {
    console.log('generateReportForm被调用，orderId:', orderId, 'processId:', processId);
    const reportFormContainer = document.getElementById('reportFormContainer');
    console.log('找到reportFormContainer:', reportFormContainer);
    const existingReport = loadReportData(orderId, processId);
    
    // 根据工序类型生成不同的表单
    switch (processId) {
        case 'review':
            // 评审工序报工表单 - 显示打开子页面的按钮
            reportFormContainer.innerHTML = `
                <div class="review-report-button-container">
                    <p>点击下方按钮打开评审报工详情页面</p>
                    <button type="button" class="btn btn-primary" onclick="openReviewReportSubpage()">打开评审报工详情</button>
                </div>
            `;
            break;
        case 'preparation':
            // 生产准备工序报工表单 - 显示打开子页面的按钮
            reportFormContainer.innerHTML = `
                <div class="preparation-report-button-container">
                    <p>点击下方按钮打开生产准备报工详情页面</p>
                    <button type="button" class="btn btn-primary" onclick="openPreparationReportSubpage()">打开生产准备报工详情</button>
                </div>
            `;
            break;
        case 'production':
            // 生产工序报工表单 - 显示打开子页面的按钮
            reportFormContainer.innerHTML = `
                <div class="production-report-button-container">
                    <p>点击下方按钮打开生产报工详情页面</p>
                    <button type="button" class="btn btn-primary" onclick="openProductionReportSubpage()">打开生产报工详情</button>
                </div>
            `;
            break;
        case 'inspection':
            // 质检工序报工表单 - 显示打开子页面的按钮
            reportFormContainer.innerHTML = `
                <div class="inspection-report-button-container">
                    <p>点击下方按钮打开质检报工详情页面</p>
                    <button type="button" class="btn btn-primary" onclick="openInspectionReportSubpage()">打开质检报工详情</button>
                </div>
            `;
            break;
        case 'packaging':
            // 包装工序报工表单 - 直接显示子页面
            try {
                console.log('直接显示包装报工子页面');
                // 清除加载中消息
                reportFormContainer.innerHTML = '';
                
                // 隐藏所有其他子页面
                // 先检查reportForm元素是否存在
                const reportForm = document.getElementById('reportForm');
                if (reportForm) {
                    reportForm.classList.add('hidden');
                }
                
                // 隐藏其他子页面
                const subpages = [
                    'reviewReportSubpage',
                    'productionPreparationReportSubpage',
                    'materialReportSubpage',
                    'processCardReportSubpage',
                    'productionReportSubpage',
                    'inspectionReportSubpage',
                    'incomingInspectionSubpage',
                    'firstInspectionSubpage',
                    'outgoingInspectionSubpage'
                ];
                
                subpages.forEach(subpageId => {
                    const subpage = document.getElementById(subpageId);
                    if (subpage) {
                        subpage.classList.add('hidden');
                    }
                });
                
                // 显示包装报工子页面
                const packagingSubpage = document.getElementById('packagingReportSubpage');
                console.log('找到包装报工子页面:', packagingSubpage);
                if (packagingSubpage) {
                    packagingSubpage.classList.remove('hidden');
                    console.log('包装报工子页面已显示');
                } else {
                    console.error('未找到包装报工子页面');
                    // 如果未找到子页面，显示错误消息
                    reportFormContainer.innerHTML = '<p class="error-message">未找到包装报工子页面</p>';
                }
            } catch (error) {
                console.error('显示包装报工子页面时出错:', error);
                // 显示错误消息
                reportFormContainer.innerHTML = '<p class="error-message">加载包装报工页面时出错</p>';
            }
            break;
        default:
            reportFormContainer.innerHTML = '<p>未找到工序信息</p>';
            return;
    }
    
    // 添加表单提交事件
    const reportForm = document.getElementById('reportForm');
    if (reportForm) {
        reportForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitReport(orderId, processId);
        });
    }
}

// 加载已有的报工数据
function loadReportData(orderId, processId) {
    const reports = loadReports();
    const reportKey = `${orderId}_${processId}`;
    return reports[reportKey] || {};
}

// 提交报工
function submitReport(orderId, processId) {
    const form = document.getElementById('reportForm');
    const formData = new FormData(form);
    const reportData = {};
    
    // 收集表单数据
    for (const [key, value] of formData.entries()) {
        reportData[key] = value;
    }
    
    // 保存报工数据
    const reports = loadReports();
    const reportKey = `${orderId}_${processId}`;
    reports[reportKey] = reportData;
    saveReports(reports);
    
    // 更新工单工序状态为已完成
    const workOrders = loadWorkOrders();
    const orderIndex = workOrders.findIndex(o => o.orderId === orderId);
    if (orderIndex !== -1) {
        if (!workOrders[orderIndex].processes) {
            workOrders[orderIndex].processes = {};
        }
        workOrders[orderIndex].processes[processId] = 'completed';
        saveWorkOrders(workOrders);
    }
    
    alert('报工提交成功！');
    goBack();
}

// 打开评审报工子页面
function openReviewReportSubpage() {
    document.getElementById('reviewReportSubpage').classList.remove('hidden');
    // 滚动到子页面
    document.getElementById('reviewReportSubpage').scrollIntoView({ behavior: 'smooth' });
}

// 关闭评审报工子页面
function closeReviewReportSubpage() {
    document.getElementById('reviewReportSubpage').classList.add('hidden');
    // 重置表单
    document.getElementById('reviewReportForm').reset();
    document.getElementById('attendancePreview').innerHTML = '';
    document.getElementById('photosPreview').innerHTML = '';
}

// 打开包装报工子页面
function openPackagingReportSubpage() {
    try {
        console.log('打开包装报工子页面');
        // 隐藏所有其他子页面
        document.getElementById('reportForm').classList.add('hidden');
        document.getElementById('reviewReportSubpage').classList.add('hidden');
        document.getElementById('productionPreparationReportSubpage').classList.add('hidden');
        document.getElementById('materialReportSubpage').classList.add('hidden');
        document.getElementById('processCardReportSubpage').classList.add('hidden');
        document.getElementById('productionReportSubpage').classList.add('hidden');
        document.getElementById('inspectionReportSubpage').classList.add('hidden');
        document.getElementById('incomingInspectionSubpage').classList.add('hidden');
        document.getElementById('firstInspectionSubpage').classList.add('hidden');
        document.getElementById('outgoingInspectionSubpage').classList.add('hidden');
        
        // 显示包装报工子页面
        const packagingSubpage = document.getElementById('packagingReportSubpage');
        console.log('找到包装报工子页面:', packagingSubpage);
        if (packagingSubpage) {
            packagingSubpage.classList.remove('hidden');
            console.log('包装报工子页面已显示');
        } else {
            console.error('未找到包装报工子页面');
        }
    } catch (error) {
        console.error('打开包装报工子页面时出错:', error);
    }
}

// 关闭包装报工子页面
function closePackagingReportSubpage() {
    // 隐藏包装报工子页面
    document.getElementById('packagingReportSubpage').classList.add('hidden');
    
    // 显示报工主页面
    document.getElementById('reportForm').classList.remove('hidden');
}

// 提交包装报工
function submitPackagingReport() {
    const currentReport = localStorage.getItem('currentReport');
    if (!currentReport) {
        alert('未找到报工信息');
        return;
    }
    
    const { orderId, processId } = JSON.parse(currentReport);
    const form = document.getElementById('packagingReportForm');
    const formData = new FormData(form);
    const reportData = loadReportData(orderId, processId);
    
    // 收集表单数据
    const packagingReport = {};
    for (const [key, value] of formData.entries()) {
        packagingReport[key] = value;
    }
    
    // 保存包装报工数据
    reportData.packagingReport = packagingReport;
    
    // 保存报工数据
    const reports = loadReports();
    const reportKey = `${orderId}_${processId}`;
    reports[reportKey] = reportData;
    saveReports(reports);
    
    // 更新工单状态为已完成
    const workOrders = loadWorkOrders();
    const orderIndex = workOrders.findIndex(o => o.orderId === orderId);
    if (orderIndex !== -1) {
        if (!workOrders[orderIndex].processes) {
            workOrders[orderIndex].processes = {};
        }
        // 标记所有工序为已完成
        workOrders[orderIndex].processes['review'] = 'completed';
        workOrders[orderIndex].processes['preparation'] = 'completed';
        workOrders[orderIndex].processes['production'] = 'completed';
        workOrders[orderIndex].processes['inspection'] = 'completed';
        workOrders[orderIndex].processes['packaging'] = 'completed';
        saveWorkOrders(workOrders);
    }
    
    alert('包装报工提交成功！所有工序已完成');
    closePackagingReportSubpage();
    
    // 刷新页面以更新状态
    window.location.reload();
}

// 图片上传预览功能
window.addEventListener('DOMContentLoaded', function() {
    // 参会人员签到附件预览
    const attendanceAttachment = document.getElementById('attendanceAttachment');
    const attendancePreview = document.getElementById('attendancePreview');
    
    if (attendanceAttachment && attendancePreview) {
        attendanceAttachment.addEventListener('change', function(e) {
            attendancePreview.innerHTML = '';
            const files = e.target.files;
            
            if (files.length > 0) {
                Array.from(files).forEach(file => {
                    if (file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = function(event) {
                            const img = document.createElement('img');
                            img.src = event.target.result;
                            img.className = 'preview-image';
                            attendancePreview.appendChild(img);
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }
        });
    }
    
    // 评审现场照片预览
    const reviewPhotos = document.getElementById('reviewPhotos');
    const photosPreview = document.getElementById('photosPreview');
    
    if (reviewPhotos && photosPreview) {
        reviewPhotos.addEventListener('change', function(e) {
            photosPreview.innerHTML = '';
            const files = e.target.files;
            
            if (files.length > 0) {
                Array.from(files).forEach(file => {
                    if (file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = function(event) {
                            const img = document.createElement('img');
                            img.src = event.target.result;
                            img.className = 'preview-image';
                            photosPreview.appendChild(img);
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }
        });
    }
    
    // 添加评审报工表单提交事件
    const reviewReportForm = document.getElementById('reviewReportForm');
    if (reviewReportForm) {
        reviewReportForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitReviewReport();
        });
    }
    
    // 添加领料点数表单提交事件
    const materialReportForm = document.getElementById('materialReportForm');
    if (materialReportForm) {
        materialReportForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitMaterialReport();
        });
    }
    
    // 添加生产工艺流程卡发放表单提交事件
    const processCardReportForm = document.getElementById('processCardReportForm');
    if (processCardReportForm) {
        processCardReportForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitProcessCardReport();
        });
    }
    
    // 添加生产工序报工表单提交事件
    const productionProcessReportForm = document.getElementById('productionProcessReportForm');
    if (productionProcessReportForm) {
        productionProcessReportForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitProductionProcessReport();
        });
    }
    
    // 添加来料检表单提交事件
    const incomingInspectionForm = document.getElementById('incomingInspectionForm');
    if (incomingInspectionForm) {
        incomingInspectionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitIncomingInspection();
        });
    }
    
    // 添加首巡检表单提交事件
    const firstInspectionForm = document.getElementById('firstInspectionForm');
    if (firstInspectionForm) {
        firstInspectionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitFirstInspection();
        });
    }
    
    // 添加出货检表单提交事件
    const outgoingInspectionForm = document.getElementById('outgoingInspectionForm');
    if (outgoingInspectionForm) {
        outgoingInspectionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitOutgoingInspection();
        });
    }
    
    // 添加包装报工表单提交事件
    const packagingReportForm = document.getElementById('packagingReportForm');
    if (packagingReportForm) {
        packagingReportForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitPackagingReport();
        });
    }
    
    // 加载订单信息
    loadOrderInfo();
});

// 提交评审报工
function submitReviewReport() {
    const currentReport = localStorage.getItem('currentReport');
    if (!currentReport) {
        alert('未找到报工信息');
        return;
    }
    
    const { orderId, processId } = JSON.parse(currentReport);
    const form = document.getElementById('reviewReportForm');
    const formData = new FormData(form);
    const reportData = {};
    
    // 收集表单数据
    for (const [key, value] of formData.entries()) {
        reportData[key] = value;
    }
    
    // 获取加工工艺指定多选值
    const processingTechnologies = [];
    const checkboxes = document.querySelectorAll('input[name="processingTechnology"]:checked');
    checkboxes.forEach(checkbox => {
        processingTechnologies.push(checkbox.value);
    });
    reportData.processingTechnology = processingTechnologies;
    
    // 获取图片文件（转换为文件名存储）
    const attendanceAttachment = document.getElementById('attendanceAttachment');
    const attendanceFiles = [];
    if (attendanceAttachment.files.length > 0) {
        Array.from(attendanceAttachment.files).forEach(file => {
            if (file.type.startsWith('image/')) {
                attendanceFiles.push(file.name);
            }
        });
    }
    reportData.attendanceAttachment = attendanceFiles;
    
    const reviewPhotos = document.getElementById('reviewPhotos');
    const reviewPhotoFiles = [];
    if (reviewPhotos.files.length > 0) {
        Array.from(reviewPhotos.files).forEach(file => {
            if (file.type.startsWith('image/')) {
                reviewPhotoFiles.push(file.name);
            }
        });
    }
    reportData.reviewPhotos = reviewPhotoFiles;
    
    // 保存报工数据
    const reports = loadReports();
    const reportKey = `${orderId}_${processId}`;
    reports[reportKey] = reportData;
    saveReports(reports);
    
    // 更新工单工序状态为已完成
    const workOrders = loadWorkOrders();
    const orderIndex = workOrders.findIndex(o => o.orderId === orderId);
    if (orderIndex !== -1) {
        if (!workOrders[orderIndex].processes) {
            workOrders[orderIndex].processes = {};
        }
        workOrders[orderIndex].processes[processId] = 'completed';
        saveWorkOrders(workOrders);
    }
    
    alert('评审报工提交成功！');
    closeReviewReportSubpage();
    // 刷新页面以更新状态
    window.location.reload();
}

// 打开生产准备报工子页面
function openPreparationReportSubpage() {
    document.getElementById('preparationReportSubpage').classList.remove('hidden');
    // 滚动到子页面
    document.getElementById('preparationReportSubpage').scrollIntoView({ behavior: 'smooth' });
}

// 关闭生产准备报工子页面
function closePreparationReportSubpage() {
    document.getElementById('preparationReportSubpage').classList.add('hidden');
}

// 打开领料点数子页面
function openMaterialReportSubpage() {
    document.getElementById('preparationReportSubpage').classList.add('hidden');
    document.getElementById('materialReportSubpage').classList.remove('hidden');
    // 滚动到子页面
    document.getElementById('materialReportSubpage').scrollIntoView({ behavior: 'smooth' });
}

// 关闭领料点数子页面
function closeMaterialReportSubpage() {
    document.getElementById('materialReportSubpage').classList.add('hidden');
    document.getElementById('preparationReportSubpage').classList.remove('hidden');
    // 重置表单
    document.getElementById('materialReportForm').reset();
}

// 打开生产工艺流程卡发放子页面
function openProcessCardReportSubpage() {
    document.getElementById('preparationReportSubpage').classList.add('hidden');
    document.getElementById('processCardReportSubpage').classList.remove('hidden');
    // 滚动到子页面
    document.getElementById('processCardReportSubpage').scrollIntoView({ behavior: 'smooth' });
}

// 关闭生产工艺流程卡发放子页面
function closeProcessCardReportSubpage() {
    document.getElementById('processCardReportSubpage').classList.add('hidden');
    document.getElementById('preparationReportSubpage').classList.remove('hidden');
    // 重置表单
    document.getElementById('processCardReportForm').reset();
}

// 提交领料点数报工
function submitMaterialReport() {
    const currentReport = localStorage.getItem('currentReport');
    if (!currentReport) {
        alert('未找到报工信息');
        return;
    }
    
    const { orderId, processId } = JSON.parse(currentReport);
    const form = document.getElementById('materialReportForm');
    const formData = new FormData(form);
    const reportData = loadReportData(orderId, processId);
    
    // 收集表单数据
    for (const [key, value] of formData.entries()) {
        reportData.materialReport = reportData.materialReport || {};
        reportData.materialReport[key] = value;
    }
    
    // 保存报工数据
    const reports = loadReports();
    const reportKey = `${orderId}_${processId}`;
    reports[reportKey] = reportData;
    saveReports(reports);
    
    alert('领料点数报工提交成功！');
    closeMaterialReportSubpage();
    // 检查是否两个子页面都已完成
    checkPreparationReportCompletion(orderId, processId);
}

// 提交生产工艺流程卡发放报工
function submitProcessCardReport() {
    const currentReport = localStorage.getItem('currentReport');
    if (!currentReport) {
        alert('未找到报工信息');
        return;
    }
    
    const { orderId, processId } = JSON.parse(currentReport);
    const form = document.getElementById('processCardReportForm');
    const formData = new FormData(form);
    const reportData = loadReportData(orderId, processId);
    
    // 收集表单数据
    for (const [key, value] of formData.entries()) {
        reportData.processCardReport = reportData.processCardReport || {};
        reportData.processCardReport[key] = value;
    }
    
    // 保存报工数据
    const reports = loadReports();
    const reportKey = `${orderId}_${processId}`;
    reports[reportKey] = reportData;
    saveReports(reports);
    
    alert('生产工艺流程卡发放报工提交成功！');
    closeProcessCardReportSubpage();
    // 检查是否两个子页面都已完成
    checkPreparationReportCompletion(orderId, processId);
}

// 检查生产准备报工是否全部完成
function checkPreparationReportCompletion(orderId, processId) {
    const reportData = loadReportData(orderId, processId);
    
    // 检查两个子页面是否都已完成
    if (reportData.materialReport && reportData.processCardReport) {
        // 两个子页面都已完成，更新工单工序状态为已完成
        const workOrders = loadWorkOrders();
        const orderIndex = workOrders.findIndex(o => o.orderId === orderId);
        if (orderIndex !== -1) {
            if (!workOrders[orderIndex].processes) {
                workOrders[orderIndex].processes = {};
            }
            workOrders[orderIndex].processes[processId] = 'completed';
            saveWorkOrders(workOrders);
        }
        
        alert('生产准备报工全部完成！');
        // 刷新页面以更新状态
        window.location.reload();
    }
}

// 生产工序列表
const productionProcesses = [
    'CNC1', 'CNC2', 'CNC3', 'CNC4', 'CNC5', 'CNC6', 'CNC7', 'CNC8', 'CNC9',
    'MR', '磨床', '整形', 'GC1', 'GC2', '走心机', 'FT', '清洁'
];

// 打开生产报工子页面
function openProductionReportSubpage() {
    document.getElementById('productionReportSubpage').classList.remove('hidden');
    // 滚动到子页面
    document.getElementById('productionReportSubpage').scrollIntoView({ behavior: 'smooth' });
    // 生成工序列表
    generateProductionProcessList();
}

// 关闭生产报工子页面
function closeProductionReportSubpage() {
    document.getElementById('productionReportSubpage').classList.add('hidden');
}

// 生成生产工序列表
function generateProductionProcessList() {
    const processListContainer = document.getElementById('processList');
    const currentReport = localStorage.getItem('currentReport');
    const { orderId, processId } = JSON.parse(currentReport);
    const reportData = loadReportData(orderId, processId);
    
    let processButtonsHtml = '';
    
    productionProcesses.forEach(processName => {
        const isCompleted = reportData.processReports && reportData.processReports[processName];
        processButtonsHtml += `
            <button type="button" class="btn ${isCompleted ? 'btn-secondary' : 'btn-primary'} process-button"
                    onclick="openProductionProcessReportSubpage('${processName}')">
                ${processName} ${isCompleted ? '(已完成)' : '(未完成)'}
            </button>
        `;
    });
    
    processListContainer.innerHTML = processButtonsHtml;
}

// 打开生产工序报工子页面
function openProductionProcessReportSubpage(processName) {
    document.getElementById('productionReportSubpage').classList.add('hidden');
    document.getElementById('productionProcessReportSubpage').classList.remove('hidden');
    
    // 设置工序名称
    document.getElementById('processNameHeader').textContent = `${processName}工序报工`;
    document.getElementById('processName').value = processName;
    
    // 滚动到子页面
    document.getElementById('productionProcessReportSubpage').scrollIntoView({ behavior: 'smooth' });
}

// 关闭生产工序报工子页面
function closeProductionProcessReportSubpage() {
    document.getElementById('productionProcessReportSubpage').classList.add('hidden');
    document.getElementById('productionReportSubpage').classList.remove('hidden');
    // 重置表单
    document.getElementById('productionProcessReportForm').reset();
}

// 提交生产工序报工
function submitProductionProcessReport() {
    const currentReport = localStorage.getItem('currentReport');
    if (!currentReport) {
        alert('未找到报工信息');
        return;
    }
    
    const { orderId, processId } = JSON.parse(currentReport);
    const form = document.getElementById('productionProcessReportForm');
    const formData = new FormData(form);
    const reportData = loadReportData(orderId, processId);
    
    // 收集表单数据
    const processName = formData.get('processName');
    const processReport = {};
    
    for (const [key, value] of formData.entries()) {
        processReport[key] = value;
    }
    
    // 保存工序报工数据
    if (!reportData.processReports) {
        reportData.processReports = {};
    }
    reportData.processReports[processName] = processReport;
    
    // 保存报工数据
    const reports = loadReports();
    const reportKey = `${orderId}_${processId}`;
    reports[reportKey] = reportData;
    saveReports(reports);
    
    alert(`${processName}工序报工提交成功！`);
    closeProductionProcessReportSubpage();
    
    // 检查清洁工序是否已完成，如果完成则更新整个生产工序状态
    checkProductionReportCompletion(orderId, processId);
    
    // 重新生成工序列表，更新状态
    generateProductionProcessList();
}

// 检查生产报工是否全部完成（当清洁工序完成时）
function checkProductionReportCompletion(orderId, processId) {
    const reportData = loadReportData(orderId, processId);
    
    // 检查清洁工序是否已完成
    if (reportData.processReports && reportData.processReports['清洁']) {
        // 清洁工序已完成，更新工单工序状态为已完成
        const workOrders = loadWorkOrders();
        const orderIndex = workOrders.findIndex(o => o.orderId === orderId);
        if (orderIndex !== -1) {
            if (!workOrders[orderIndex].processes) {
                workOrders[orderIndex].processes = {};
            }
            workOrders[orderIndex].processes[processId] = 'completed';
            saveWorkOrders(workOrders);
        }
        
        alert('生产报工全部完成！');
        // 刷新页面以更新状态
        window.location.reload();
    }
}

// 打开质检报工子页面
function openInspectionReportSubpage() {
    document.getElementById('inspectionReportSubpage').classList.remove('hidden');
    // 滚动到子页面
    document.getElementById('inspectionReportSubpage').scrollIntoView({ behavior: 'smooth' });
}

// 关闭质检报工子页面
function closeInspectionReportSubpage() {
    document.getElementById('inspectionReportSubpage').classList.add('hidden');
}

// 打开来料检子页面
function openIncomingInspectionSubpage() {
    document.getElementById('inspectionReportSubpage').classList.add('hidden');
    document.getElementById('incomingInspectionSubpage').classList.remove('hidden');
    // 滚动到子页面
    document.getElementById('incomingInspectionSubpage').scrollIntoView({ behavior: 'smooth' });
    // 添加检验结论变化事件
    addIncomingInspectionEventListeners();
}

// 关闭来料检子页面
function closeIncomingInspectionSubpage() {
    document.getElementById('incomingInspectionSubpage').classList.add('hidden');
    document.getElementById('inspectionReportSubpage').classList.remove('hidden');
    // 重置表单
    document.getElementById('incomingInspectionForm').reset();
    // 隐藏所有条件字段
    document.getElementById('unqualifiedDescriptionSection').classList.add('hidden');
    document.getElementById('unqualifiedAttachmentSection').classList.add('hidden');
    document.getElementById('inspectionMarkSection').classList.add('hidden');
    // 清空预览
    document.getElementById('purchaseOrderPreview').innerHTML = '';
    document.getElementById('unqualifiedPreview').innerHTML = '';
    document.getElementById('inspectionMarkPreview').innerHTML = '';
}

// 打开首巡检子页面
function openFirstInspectionSubpage() {
    document.getElementById('inspectionReportSubpage').classList.add('hidden');
    document.getElementById('firstInspectionSubpage').classList.remove('hidden');
    // 滚动到子页面
    document.getElementById('firstInspectionSubpage').scrollIntoView({ behavior: 'smooth' });
    // 添加检验结论变化事件
    addFirstInspectionEventListeners();
}

// 关闭首巡检子页面
function closeFirstInspectionSubpage() {
    document.getElementById('firstInspectionSubpage').classList.add('hidden');
    document.getElementById('inspectionReportSubpage').classList.remove('hidden');
    // 重置表单
    document.getElementById('firstInspectionForm').reset();
    // 隐藏所有条件字段
    document.getElementById('inspectionReportSection').classList.add('hidden');
    document.getElementById('firstUnqualifiedSection').classList.add('hidden');
    document.getElementById('firstUnqualifiedAttachmentSection').classList.add('hidden');
    // 清空预览
    document.getElementById('inspectionReportPreview').innerHTML = '';
    document.getElementById('firstUnqualifiedPreview').innerHTML = '';
}

// 打开出货检子页面
function openOutgoingInspectionSubpage() {
    document.getElementById('inspectionReportSubpage').classList.add('hidden');
    document.getElementById('outgoingInspectionSubpage').classList.remove('hidden');
    // 滚动到子页面
    document.getElementById('outgoingInspectionSubpage').scrollIntoView({ behavior: 'smooth' });
    // 添加检验结论变化事件
    addOutgoingInspectionEventListeners();
}

// 关闭出货检子页面
function closeOutgoingInspectionSubpage() {
    document.getElementById('outgoingInspectionSubpage').classList.add('hidden');
    document.getElementById('inspectionReportSubpage').classList.remove('hidden');
    // 重置表单
    document.getElementById('outgoingInspectionForm').reset();
    // 隐藏所有条件字段
    document.getElementById('finalReportSection').classList.add('hidden');
    document.getElementById('finalUnqualifiedSection').classList.add('hidden');
    document.getElementById('finalUnqualifiedAttachmentSection').classList.add('hidden');
    // 清空预览
    document.getElementById('finalReportPreview').innerHTML = '';
    document.getElementById('finalUnqualifiedPreview').innerHTML = '';
}

// 添加来料检事件监听器
function addIncomingInspectionEventListeners() {
    const inspectionConclusionRadios = document.querySelectorAll('input[name="inspectionConclusion"]');
    inspectionConclusionRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const conclusion = this.value;
            
            // 隐藏所有条件字段
            document.getElementById('unqualifiedDescriptionSection').classList.add('hidden');
            document.getElementById('unqualifiedAttachmentSection').classList.add('hidden');
            document.getElementById('inspectionMarkSection').classList.add('hidden');
            
            // 根据结论显示相应字段
            if (conclusion === '不合格') {
                document.getElementById('unqualifiedDescriptionSection').classList.remove('hidden');
                document.getElementById('unqualifiedAttachmentSection').classList.remove('hidden');
            } else if (conclusion === '合格') {
                document.getElementById('inspectionMarkSection').classList.remove('hidden');
            }
        });
    });
    
    // 添加图片预览事件
    addImagePreview('purchaseOrderAttachment', 'purchaseOrderPreview');
    addImagePreview('unqualifiedAttachment', 'unqualifiedPreview');
    addImagePreview('inspectionMarkAttachment', 'inspectionMarkPreview');
}

// 添加首巡检事件监听器
function addFirstInspectionEventListeners() {
    const reviewConclusionRadios = document.querySelectorAll('input[name="reviewConclusion"]');
    reviewConclusionRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const conclusion = this.value;
            
            // 隐藏所有条件字段
            document.getElementById('inspectionReportSection').classList.add('hidden');
            document.getElementById('firstUnqualifiedSection').classList.add('hidden');
            document.getElementById('firstUnqualifiedAttachmentSection').classList.add('hidden');
            
            // 根据结论显示相应字段
            if (conclusion === '合格') {
                document.getElementById('inspectionReportSection').classList.remove('hidden');
            } else if (conclusion === '不合格') {
                document.getElementById('firstUnqualifiedSection').classList.remove('hidden');
                document.getElementById('firstUnqualifiedAttachmentSection').classList.remove('hidden');
            }
        });
    });
    
    // 添加图片预览事件
    addImagePreview('inspectionReportAttachment', 'inspectionReportPreview');
    addImagePreview('firstUnqualifiedAttachment', 'firstUnqualifiedPreview');
}

// 添加出货检事件监听器
function addOutgoingInspectionEventListeners() {
    const finalConclusionRadios = document.querySelectorAll('input[name="finalInspectionConclusion"]');
    finalConclusionRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const conclusion = this.value;
            
            // 隐藏所有条件字段
            document.getElementById('finalReportSection').classList.add('hidden');
            document.getElementById('finalUnqualifiedSection').classList.add('hidden');
            document.getElementById('finalUnqualifiedAttachmentSection').classList.add('hidden');
            
            // 根据结论显示相应字段
            if (conclusion === '合格') {
                document.getElementById('finalReportSection').classList.remove('hidden');
            } else if (conclusion === '不合格') {
                document.getElementById('finalUnqualifiedSection').classList.remove('hidden');
                document.getElementById('finalUnqualifiedAttachmentSection').classList.remove('hidden');
            }
        });
    });
    
    // 添加图片预览事件
    addImagePreview('finalReportAttachment', 'finalReportPreview');
    addImagePreview('finalUnqualifiedAttachment', 'finalUnqualifiedPreview');
}

// 添加图片预览功能
function addImagePreview(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    
    if (input && preview) {
        input.addEventListener('change', function(e) {
            preview.innerHTML = '';
            const files = e.target.files;
            
            if (files.length > 0) {
                Array.from(files).forEach(file => {
                    if (file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = function(event) {
                            const img = document.createElement('img');
                            img.src = event.target.result;
                            img.className = 'preview-image';
                            preview.appendChild(img);
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }
        });
    }
}

// 提交来料检
function submitIncomingInspection() {
    const currentReport = localStorage.getItem('currentReport');
    if (!currentReport) {
        alert('未找到报工信息');
        return;
    }
    
    const { orderId, processId } = JSON.parse(currentReport);
    const form = document.getElementById('incomingInspectionForm');
    const formData = new FormData(form);
    const reportData = loadReportData(orderId, processId);
    
    // 收集表单数据
    const incomingReport = {};
    for (const [key, value] of formData.entries()) {
        incomingReport[key] = value;
    }
    
    // 获取图片文件（转换为文件名存储）
    const purchaseOrderAttachment = document.getElementById('purchaseOrderAttachment');
    const purchaseOrderFiles = [];
    if (purchaseOrderAttachment.files.length > 0) {
        Array.from(purchaseOrderAttachment.files).forEach(file => {
            if (file.type.startsWith('image/')) {
                purchaseOrderFiles.push(file.name);
            }
        });
    }
    incomingReport.purchaseOrderAttachment = purchaseOrderFiles;
    
    const unqualifiedAttachment = document.getElementById('unqualifiedAttachment');
    const unqualifiedFiles = [];
    if (unqualifiedAttachment.files.length > 0) {
        Array.from(unqualifiedAttachment.files).forEach(file => {
            if (file.type.startsWith('image/')) {
                unqualifiedFiles.push(file.name);
            }
        });
    }
    incomingReport.unqualifiedAttachment = unqualifiedFiles;
    
    const inspectionMarkAttachment = document.getElementById('inspectionMarkAttachment');
    const inspectionMarkFiles = [];
    if (inspectionMarkAttachment.files.length > 0) {
        Array.from(inspectionMarkAttachment.files).forEach(file => {
            if (file.type.startsWith('image/')) {
                inspectionMarkFiles.push(file.name);
            }
        });
    }
    incomingReport.inspectionMarkAttachment = inspectionMarkFiles;
    
    // 保存来料检数据
    if (!reportData.inspectionReports) {
        reportData.inspectionReports = {};
    }
    reportData.inspectionReports.incoming = incomingReport;
    
    // 保存报工数据
    const reports = loadReports();
    const reportKey = `${orderId}_${processId}`;
    reports[reportKey] = reportData;
    saveReports(reports);
    
    // 检查是否不合格，记录不合格信息
    if (incomingReport.inspectionConclusion === '不合格') {
        recordNonconforming(orderId, processId, 'incoming', incomingReport);
    }
    
    alert('来料检报工提交成功！');
    closeIncomingInspectionSubpage();
}

// 提交首巡检
function submitFirstInspection() {
    const currentReport = localStorage.getItem('currentReport');
    if (!currentReport) {
        alert('未找到报工信息');
        return;
    }
    
    const { orderId, processId } = JSON.parse(currentReport);
    const form = document.getElementById('firstInspectionForm');
    const formData = new FormData(form);
    const reportData = loadReportData(orderId, processId);
    
    // 收集表单数据
    const firstReport = {};
    for (const [key, value] of formData.entries()) {
        firstReport[key] = value;
    }
    
    // 获取图片文件（转换为文件名存储）
    const inspectionReportAttachment = document.getElementById('inspectionReportAttachment');
    const inspectionReportFiles = [];
    if (inspectionReportAttachment.files.length > 0) {
        Array.from(inspectionReportAttachment.files).forEach(file => {
            if (file.type.startsWith('image/')) {
                inspectionReportFiles.push(file.name);
            }
        });
    }
    firstReport.inspectionReportAttachment = inspectionReportFiles;
    
    const firstUnqualifiedAttachment = document.getElementById('firstUnqualifiedAttachment');
    const firstUnqualifiedFiles = [];
    if (firstUnqualifiedAttachment.files.length > 0) {
        Array.from(firstUnqualifiedAttachment.files).forEach(file => {
            if (file.type.startsWith('image/')) {
                firstUnqualifiedFiles.push(file.name);
            }
        });
    }
    firstReport.firstUnqualifiedAttachment = firstUnqualifiedFiles;
    
    // 保存首巡检数据
    if (!reportData.inspectionReports) {
        reportData.inspectionReports = {};
    }
    reportData.inspectionReports.first = firstReport;
    
    // 保存报工数据
    const reports = loadReports();
    const reportKey = `${orderId}_${processId}`;
    reports[reportKey] = reportData;
    saveReports(reports);
    
    // 检查是否不合格，记录不合格信息
    if (firstReport.reviewConclusion === '不合格') {
        recordNonconforming(orderId, processId, 'first', firstReport);
    }
    
    alert('首巡检报工提交成功！');
    closeFirstInspectionSubpage();
}

// 提交出货检
function submitOutgoingInspection() {
    const currentReport = localStorage.getItem('currentReport');
    if (!currentReport) {
        alert('未找到报工信息');
        return;
    }
    
    const { orderId, processId } = JSON.parse(currentReport);
    const form = document.getElementById('outgoingInspectionForm');
    const formData = new FormData(form);
    const reportData = loadReportData(orderId, processId);
    
    // 收集表单数据
    const outgoingReport = {};
    for (const [key, value] of formData.entries()) {
        outgoingReport[key] = value;
    }
    
    // 获取图片文件（转换为文件名存储）
    const finalReportAttachment = document.getElementById('finalReportAttachment');
    const finalReportFiles = [];
    if (finalReportAttachment.files.length > 0) {
        Array.from(finalReportAttachment.files).forEach(file => {
            if (file.type.startsWith('image/')) {
                finalReportFiles.push(file.name);
            }
        });
    }
    outgoingReport.finalReportAttachment = finalReportFiles;
    
    const finalUnqualifiedAttachment = document.getElementById('finalUnqualifiedAttachment');
    const finalUnqualifiedFiles = [];
    if (finalUnqualifiedAttachment.files.length > 0) {
        Array.from(finalUnqualifiedAttachment.files).forEach(file => {
            if (file.type.startsWith('image/')) {
                finalUnqualifiedFiles.push(file.name);
            }
        });
    }
    outgoingReport.finalUnqualifiedAttachment = finalUnqualifiedFiles;
    
    // 保存出货检数据
    if (!reportData.inspectionReports) {
        reportData.inspectionReports = {};
    }
    reportData.inspectionReports.outgoing = outgoingReport;
    
    // 保存报工数据
    const reports = loadReports();
    const reportKey = `${orderId}_${processId}`;
    reports[reportKey] = reportData;
    saveReports(reports);
    
    // 检查是否不合格，记录不合格信息
    if (outgoingReport.finalInspectionConclusion === '不合格') {
        recordNonconforming(orderId, processId, 'outgoing', outgoingReport);
    }
    
    alert('出货检报工提交成功！');
    closeOutgoingInspectionSubpage();
    
    // 检查出货检是否合格，如果合格则更新整个质检工序状态
    if (outgoingReport.finalInspectionConclusion === '合格') {
        checkInspectionReportCompletion(orderId, processId);
    }
}

// 检查质检报工是否全部完成（当出货检合格时）
function checkInspectionReportCompletion(orderId, processId) {
    // 出货检合格，更新工单工序状态为已完成
    const workOrders = loadWorkOrders();
    const orderIndex = workOrders.findIndex(o => o.orderId === orderId);
    if (orderIndex !== -1) {
        if (!workOrders[orderIndex].processes) {
            workOrders[orderIndex].processes = {};
        }
        workOrders[orderIndex].processes[processId] = 'completed';
        saveWorkOrders(workOrders);
    }
    
    alert('质检报工全部完成！');
    // 刷新页面以更新状态
    window.location.reload();
}

// 记录不合格信息
function recordNonconforming(orderId, processId, inspectionType, reportData) {
    // 加载不合格品数据
    const nonconformingData = loadNonconforming();
    
    // 创建不合格品记录
    const nonconformingRecord = {
        id: `NC${Date.now()}`,
        orderId: orderId,
        processId: processId,
        inspectionType: inspectionType,
        reportData: reportData,
        createdAt: new Date().toISOString(),
        status: '待处置',
        disposal: null
    };
    
    // 保存不合格品记录
    nonconformingData.push(nonconformingRecord);
    saveNonconforming(nonconformingData);
    
    // 更新工单工序状态为异常
    const workOrders = loadWorkOrders();
    const orderIndex = workOrders.findIndex(o => o.orderId === orderId);
    if (orderIndex !== -1) {
        if (!workOrders[orderIndex].processes) {
            workOrders[orderIndex].processes = {};
        }
        workOrders[orderIndex].processes[processId] = 'abnormal';
        saveWorkOrders(workOrders);
        
        // 获取工序名称
        const processName = processes.find(p => p.id === processId)?.name || processId;
        
        // 获取检验类型文本
        const inspectionTypeText = {
            'incoming': '来料检',
            'first': '首巡检',
            'outgoing': '出货检'
        }[inspectionType] || inspectionType;
        
        // 发送异常推送通知
        if (typeof sendAbnormalNotification === 'function') {
            sendAbnormalNotification(orderId, processName, inspectionTypeText);
        }
    }
}

// 从localStorage加载不合格品数据
function loadNonconforming() {
    const data = localStorage.getItem('nonconforming');
    return data ? JSON.parse(data) : [];
}

// 保存不合格品数据到localStorage
function saveNonconforming(nonconforming) {
    localStorage.setItem('nonconforming', JSON.stringify(nonconforming));
}